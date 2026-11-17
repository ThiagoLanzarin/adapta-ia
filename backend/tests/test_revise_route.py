"""POST /api/adaptations/revise (T09, spec 005), with the fake AI and the fake pictograms."""

import pytest

from app.ai_providers.errors import AiQuotaError, AiTimeoutError
from app.models.revise import MAX_INSTRUCTION_LENGTH
from tests.factories import ai_answer_json, ai_step
from tests.test_adaptations_route import assert_error, setup

PROFILE = {"readsLittle": True, "notes": "TEA nível 1."}
BOX = [100, 100, 400, 600]


def sheet_step(step_id: str, number: str | None, text: str, **changes) -> dict:
    step = {
        "id": step_id,
        "kind": "question" if number else "instruction",
        "sourceNumber": number,
        "text": text,
        "options": ["a) Condensação", "b) Evaporação"] if number else [],
        "keywords": [],
        "needsFigure": False,
        "figureBox": None,
    }
    return step | changes


def current_sheet(steps: list[dict] | None = None) -> dict:
    return {
        "schemaVersion": 1,
        "materialType": "test",
        "title": "Prova de Ciências",
        "objective": "Ciclo da água",
        "transcription": "1) Como se chama a etapa...\n2) Olhe o gráfico...",
        "teacherNotes": [],
        "warnings": [],
        "steps": steps
        if steps is not None
        else [
            sheet_step("s1", None, "Leia com calma."),
            sheet_step("s2", "1", "Texto corrigido pelo professor."),
            sheet_step("s3", "2", "Olhe o gráfico.", needsFigure=True, figureBox=BOX),
        ],
    }


def revise(client, instruction="Deixe mais curto.", **changes):
    body = {
        "adaptation": current_sheet(),
        "profile": PROFILE,
        "materialType": "test",
        "instruction": instruction,
    } | changes
    return client.post("/api/adaptations/revise", json=body)


TWO_QUESTIONS = [
    ai_step(sourceNumber="1"),
    ai_step(sourceNumber="2", text="Olhe o gráfico.", keywords=[], needsFigure=True),
]


def test_ca_005_01_request_gives_a_new_adaptation_in_the_contract_format():
    client, ai = setup([ai_answer_json(TWO_QUESTIONS)])

    response = revise(client)

    body = response.json()
    assert response.status_code == 200
    assert body["schemaVersion"] == 1
    assert body["steps"][0]["keywords"][0]["pictogramId"] == 2798
    assert len(ai.requests) == 1


def test_ca_005_02_the_ai_gets_the_edited_sheet_and_the_request():
    client, ai = setup([ai_answer_json(TWO_QUESTIONS)])

    revise(client, instruction="Use frases ainda mais curtas.")

    prompt = ai.requests[0].prompt
    assert "[questão 1] Texto corrigido pelo professor." in prompt
    assert "    a) Condensação" in prompt
    assert "Pedido do professor: Use frases ainda mais curtas." in prompt
    assert ai.requests[0].image is None


def test_ca_005_03_test_rules_stay_and_missing_question_is_checked_against_the_sheet():
    # The AI answer forgets question 2 and claims only question 1 existed.
    answer = ai_answer_json([ai_step(sourceNumber="1")], sourceQuestions=["1"])
    client, ai = setup([answer])

    body = revise(client).json()

    assert "Regras de prova, obrigatórias" in ai.requests[0].prompt
    codes = [warning["code"] for warning in body["warnings"]]
    assert "MISSING_QUESTION" in codes
    assert "questão 2" in body["warnings"][codes.index("MISSING_QUESTION")]["message"]


def test_r_005_01_figure_box_and_transcription_come_from_the_current_sheet():
    client, _ = setup([ai_answer_json(TWO_QUESTIONS, transcription="")])

    body = revise(client).json()

    assert body["steps"][1]["figureBox"] == BOX
    assert body["steps"][1]["needsFigure"] is True
    assert body["transcription"] == current_sheet()["transcription"]
    assert [warning["code"] for warning in body["warnings"]] == []


def test_removed_figure_stays_removed_with_its_warning():
    steps = [sheet_step("s1", "2", "Olhe o gráfico.", needsFigure=True)]
    answer = ai_answer_json([TWO_QUESTIONS[1]], sourceQuestions=["2"])
    client, _ = setup([answer])

    body = revise(client, adaptation=current_sheet(steps)).json()

    assert body["steps"][0]["figureBox"] is None
    assert [warning["code"] for warning in body["warnings"]] == ["NEEDS_FIGURE"]


@pytest.mark.parametrize(
    "instruction", ["", "   ", "x" * (MAX_INSTRUCTION_LENGTH + 1)], ids=["empty", "spaces", "long"]
)
def test_ca_005_04_empty_or_too_long_request_gives_invalid_input(instruction):
    client, ai = setup()

    response = revise(client, instruction=instruction)

    assert_error(response, 422, "INVALID_INPUT")
    assert ai.requests == []


def test_ca_005_04_request_of_300_characters_is_accepted():
    client, _ = setup([ai_answer_json(TWO_QUESTIONS)])

    assert revise(client, instruction="x" * MAX_INSTRUCTION_LENGTH).status_code == 200


def test_invalid_current_sheet_gives_invalid_input():
    client, ai = setup()

    response = revise(client, adaptation={"title": "sem o resto"})

    assert_error(response, 422, "INVALID_INPUT")
    assert ai.requests == []


@pytest.mark.parametrize(
    ("error", "status", "code"),
    [(AiQuotaError("quota"), 429, "AI_QUOTA"), (AiTimeoutError("slow"), 504, "AI_TIMEOUT")],
)
def test_ca_005_05_ai_failures_follow_the_spec_001_table(error, status, code):
    client, _ = setup([error])

    assert_error(revise(client), status, code)


def test_ca_005_05_invalid_answer_is_retried_once():
    client, ai = setup(["not json", ai_answer_json(TWO_QUESTIONS)])

    assert revise(client).status_code == 200
    assert len(ai.requests) == 2
    assert "fora do formato" in ai.requests[1].prompt
