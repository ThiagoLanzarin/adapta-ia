"""PowerPoint routes (T08b, spec 002): the slide list and the adaptation of chosen slides."""

import json

import pytest

from app.ai_providers.errors import AiQuotaError
from app.services.slide_service import MAX_SLIDE_FILE_BYTES, PPTX_FILE_TYPE_MESSAGE
from tests.pptx_factory import add_blank, add_table, add_title_and_content, build_pptx, set_notes
from tests.test_adaptations_route import assert_error, post, setup

PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation"


def send_file(client, content: bytes, name: str = "prova.pptx"):
    return client.post("/api/slides", files={"file": (name, content, PPTX)})


def slides_json(*slides) -> str:
    return json.dumps(
        [{"index": index, "title": title, "text": text} for index, title, text in slides]
    )


def test_ca_002_01_pptx_gives_the_slide_list_in_order():
    def build(presentation):
        add_title_and_content(presentation, "Ciclo da água", ["O sol aquece a água."])
        add_title_and_content(presentation, "Questão 1", ["Como se chama essa etapa?"])

    client, ai = setup()

    response = send_file(client, build_pptx(build))

    assert response.status_code == 200
    assert response.json() == {
        "slides": [
            {"index": 1, "title": "Ciclo da água", "text": "O sol aquece a água."},
            {"index": 2, "title": "Questão 1", "text": "Como se chama essa etapa?"},
        ]
    }
    assert ai.requests == []


def test_ca_002_02_slide_without_text_comes_in_the_list():
    client, _ = setup()

    response = send_file(client, build_pptx(add_blank))

    assert response.json() == {"slides": [{"index": 1, "title": "", "text": ""}]}


@pytest.mark.parametrize(
    "content",
    [b"%PDF-1.7", b"PK\x03\x04 broken", b"\xff\xd8\xff\xe0 photo"],
    ids=["pdf", "zip", "jpeg"],
)
def test_ca_002_03_not_a_pptx_gives_file_type(content):
    client, _ = setup()

    response = send_file(client, content)

    assert_error(response, 415, "FILE_TYPE")
    assert response.json()["message"] == PPTX_FILE_TYPE_MESSAGE


def test_ca_002_04_file_over_20_mb_gives_file_too_large():
    client, _ = setup()

    response = send_file(client, b"PK\x03\x04" + b"0" * MAX_SLIDE_FILE_BYTES)

    assert_error(response, 413, "FILE_TOO_LARGE")


def test_ca_002_05_up_to_5_slides_make_one_ai_call_and_one_adaptation():
    client, ai = setup()
    chosen = [(index, f"Questão {index}", f"Pergunta {index}?") for index in range(1, 6)]

    response = post(client, slides=slides_json(*chosen))

    assert response.status_code == 200
    assert response.json()["schemaVersion"] == 1
    assert len(ai.requests) == 1


def test_ca_002_06_six_slides_give_too_many_slides_without_calling_the_ai():
    client, ai = setup()
    chosen = [(index, "Questão", "Pergunta?") for index in range(1, 7)]

    response = post(client, slides=slides_json(*chosen))

    assert_error(response, 422, "TOO_MANY_SLIDES")
    assert ai.requests == []


def test_ca_002_07_the_ai_text_names_each_slide_by_its_number():
    client, ai = setup()

    post(
        client,
        slides=slides_json((4, "Questão 2", "Qual é a cor do céu?"), (2, "", "Leia o texto.")),
    )

    prompt = ai.requests[0].prompt
    assert "Slide 2: Leia o texto." in prompt
    assert "Slide 4: Questão 2\nQual é a cor do céu?" in prompt
    assert prompt.index("Slide 2:") < prompt.index("Slide 4:")


def test_ca_002_08_table_reaches_the_ai_and_speaker_notes_do_not():
    def build(presentation):
        slide = add_title_and_content(presentation, "Chuva por mês", ["Olhe a tabela."])
        add_table(slide, [["Mês", "Chuva"], ["Janeiro", "200 mm"]], top=4)
        set_notes(slide, "Resposta: janeiro.")

    client, ai = setup()
    listed = send_file(client, build_pptx(build)).json()["slides"]

    post(client, slides=json.dumps(listed))

    prompt = ai.requests[0].prompt
    assert "Janeiro | 200 mm" in prompt
    assert "Resposta: janeiro" not in prompt


@pytest.mark.parametrize(
    "slides",
    ["[]", "not json", '[{"index": 0, "title": "", "text": "x"}]', slides_json((1, "", ""))],
    ids=["empty-list", "not-json", "bad-index", "no-text"],
)
def test_invalid_slides_give_invalid_input_without_calling_the_ai(slides):
    client, ai = setup()

    response = post(client, slides=slides)

    assert_error(response, 422, "INVALID_INPUT")
    assert ai.requests == []


def test_slides_and_text_together_give_invalid_input():
    client, _ = setup()

    response = post(client, text="1) Pergunta?", slides=slides_json((1, "", "Pergunta?")))

    assert_error(response, 422, "INVALID_INPUT")


def test_ai_error_with_slides_reaches_the_teacher():
    client, _ = setup([AiQuotaError("quota")])

    response = post(client, slides=slides_json((1, "Questão 1", "Pergunta?")))

    assert_error(response, 429, "AI_QUOTA")
