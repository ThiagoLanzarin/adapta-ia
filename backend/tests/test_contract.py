"""Contract tests (T03): the example in docs/ is valid and the models enforce the rules."""

import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.models.adaptation import Adaptation, Step
from app.models.ai_adaptation import AiAdaptation, ai_response_schema
from app.models.profile import StudentProfile
from app.models.revise import ReviseRequest

ROOT = Path(__file__).resolve().parents[2]
EXAMPLE = ROOT / "docs" / "contrato-exemplo.json"
FRONTEND_COPY = ROOT / "frontend" / "src" / "shared" / "fixtures" / "contrato-exemplo.json"


def load_example() -> dict:
    return json.loads(EXAMPLE.read_text(encoding="utf-8"))


def make_step(**changes) -> dict:
    step = {
        "id": "s1",
        "kind": "question",
        "sourceNumber": "1",
        "text": "Qual é o nome do nosso planeta?",
        "options": [],
        "keywords": [],
        "needsFigure": False,
        "figureBox": None,
    }
    return step | changes


def test_example_is_a_valid_adaptation():
    Adaptation.model_validate(load_example())


def test_example_round_trip_keeps_camel_case_names():
    data = load_example()

    dumped = Adaptation.model_validate(data).model_dump(by_alias=True)

    assert dumped == data


def test_frontend_copy_matches_the_example():
    assert json.loads(FRONTEND_COPY.read_text(encoding="utf-8")) == load_example()


def test_ca_001_06_profile_with_nickname_is_rejected():
    with pytest.raises(ValidationError):
        StudentProfile.model_validate({"readsLittle": True, "nickname": "Pedrinho"})


def test_profile_notes_over_500_characters_are_rejected():
    with pytest.raises(ValidationError):
        StudentProfile.model_validate({"notes": "a" * 501})


def test_only_question_steps_have_options():
    with pytest.raises(ValidationError):
        Step.model_validate(make_step(kind="instruction", sourceNumber=None, options=["a) x"]))


def test_text_steps_have_no_keywords():
    keyword = {"word": "sol", "searchTerm": "sol", "pictogramId": 1}
    with pytest.raises(ValidationError):
        Step.model_validate(make_step(kind="text", sourceNumber=None, keywords=[keyword]))


def test_at_most_three_keywords_per_step():
    keyword = {"word": "sol", "searchTerm": "sol", "pictogramId": None}
    with pytest.raises(ValidationError):
        Step.model_validate(make_step(keywords=[keyword] * 4))


@pytest.mark.parametrize(
    "box",
    [[1, 2, 3], [0, 0, 1001, 10], [-1, 0, 10, 10], [500, 0, 400, 10], [0, 500, 10, 500]],
)
def test_invalid_figure_box_is_rejected(box):
    with pytest.raises(ValidationError):
        Step.model_validate(make_step(needsFigure=True, figureBox=box))


def test_figure_box_requires_needs_figure():
    with pytest.raises(ValidationError):
        Step.model_validate(make_step(needsFigure=False, figureBox=[0, 0, 10, 10]))


def test_more_than_20_steps_is_rejected():
    data = load_example()
    data["steps"] = [make_step(id=f"s{i}") for i in range(21)]

    with pytest.raises(ValidationError):
        Adaptation.model_validate(data)


def test_step_ids_must_be_unique():
    data = load_example()
    data["steps"] = [make_step(id="s1"), make_step(id="s1")]

    with pytest.raises(ValidationError):
        Adaptation.model_validate(data)


def test_ai_schema_uses_camel_case_and_has_no_array_limits():
    schema_text = json.dumps(ai_response_schema())

    assert "sourceQuestions" in schema_text
    assert "figureBox" in schema_text
    assert "maxItems" not in schema_text


def test_ai_answer_with_extra_field_is_still_accepted():
    answer = {
        "title": "t",
        "objective": "o",
        "transcription": "x",
        "sourceQuestions": [],
        "teacherNotes": [],
        "steps": [],
        "confidence": 0.9,
    }

    assert AiAdaptation.model_validate(answer).title == "t"


def test_revise_instruction_over_300_characters_is_rejected():
    with pytest.raises(ValidationError):
        ReviseRequest.model_validate(
            {
                "adaptation": load_example(),
                "profile": {},
                "materialType": "test",
                "instruction": "a" * 301,
            }
        )
