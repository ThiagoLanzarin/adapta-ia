"""POST /api/adaptations with the fake AI and the fake pictograms (T08a)."""

import json

import pytest
from fastapi.testclient import TestClient

from app.ai_providers.errors import AiQuotaError
from app.ai_providers.fake import FakeAiProvider
from app.config import Settings
from app.main import create_app
from app.pictogram_providers.fake import FakePictogramProvider
from app.readers.image_reader import MAX_FILE_BYTES
from tests.factories import ai_answer_json

SETTINGS = Settings(
    ai_provider="fake", gemini_api_key="", gemini_model="", allowed_origin="http://localhost:5173"
)
PROFILE = json.dumps({"readsLittle": True, "notes": "TEA nível 1."})
JPEG = b"\xff\xd8\xff\xe0" + b"0" * 100
IMAGES = {
    "png": b"\x89PNG\r\n\x1a\n" + b"0" * 20,
    "jpeg": JPEG,
    "webp": b"RIFF\x00\x00\x00\x00WEBPVP8 ",
    "heic": b"\x00\x00\x00\x18ftypheic" + b"0" * 10,
    "heif": b"\x00\x00\x00\x18ftypmif1" + b"0" * 10,
}


def setup(answers=None):
    ai = FakeAiProvider(answers if answers is not None else [ai_answer_json()])
    pictograms = FakePictogramProvider({"sol": [2798]})
    client = TestClient(create_app(SETTINGS, ai=ai, pictogram_provider=pictograms))
    return client, ai


def post(client, files=None, **form):
    data = {"materialType": "test", "profile": PROFILE} | form
    return client.post("/api/adaptations", data=data, files=files)


def assert_error(response, status: int, code: str):
    assert response.status_code == status
    assert response.json()["code"] == code
    assert response.json()["message"]


def test_ca_001_01_text_becomes_an_adaptation_in_the_contract_format():
    client, ai = setup()

    response = post(client, text="1) Como se chama a etapa em que a água vira vapor?")

    body = response.json()
    assert response.status_code == 200
    assert body["schemaVersion"] == 1
    assert body["materialType"] == "test"
    assert body["steps"][0]["keywords"][0]["pictogramId"] == 2798
    assert "vira vapor" in ai.requests[0].prompt


@pytest.mark.parametrize("kind", sorted(IMAGES))
def test_ca_001_02_accepted_image_formats(kind):
    client, ai = setup()

    response = post(client, files={"file": ("prova.bin", IMAGES[kind], "application/octet-stream")})

    assert response.status_code == 200
    assert ai.requests[0].image_mime_type.startswith("image/")


@pytest.mark.parametrize(
    "content", [b"%PDF-1.7 prova", b"GIF89a....", b"texto qualquer", b"PK\x03\x04pptx"]
)
def test_ca_001_02_other_formats_give_file_type(content):
    client, ai = setup()

    response = post(client, files={"file": ("prova.jpg", content, "image/jpeg")})

    assert_error(response, 415, "FILE_TYPE")
    assert ai.requests == []


def test_ca_001_03_file_over_20_mb_gives_file_too_large_without_calling_the_ai():
    client, ai = setup()
    big = JPEG + b"0" * MAX_FILE_BYTES

    response = post(client, files={"file": ("grande.jpg", big, "image/jpeg")})

    assert_error(response, 413, "FILE_TOO_LARGE")
    assert ai.requests == []


def test_ca_001_04_no_material_gives_invalid_input():
    client, _ = setup()

    assert_error(post(client), 422, "INVALID_INPUT")


def test_ca_001_04_text_and_image_together_give_invalid_input():
    client, ai = setup()

    response = post(client, text="1) ...", files={"file": ("p.jpg", JPEG, "image/jpeg")})

    assert_error(response, 422, "INVALID_INPUT")
    assert ai.requests == []


@pytest.mark.parametrize("text", ["   ", "a" * 20_001])
def test_ca_001_05_empty_or_too_long_text_gives_invalid_input(text):
    client, ai = setup()

    assert_error(post(client, text=text), 422, "INVALID_INPUT")
    assert ai.requests == []


def test_ca_001_06_profile_with_nickname_gives_invalid_input():
    client, ai = setup()
    profile = json.dumps({"readsLittle": True, "nickname": "Pedrinho"})

    assert_error(post(client, text="1) ...", profile=profile), 422, "INVALID_INPUT")
    assert ai.requests == []


@pytest.mark.parametrize(
    "form", [{"materialType": "exame"}, {"profile": "{not json"}, {"profile": "[]"}]
)
def test_wrong_material_type_or_profile_gives_invalid_input(form):
    client, _ = setup()

    assert_error(post(client, text="1) ...", **form), 422, "INVALID_INPUT")


def test_ai_error_reaches_the_teacher_as_a_message():
    client, _ = setup([AiQuotaError()])

    response = post(client, text="1) ...")

    assert_error(response, 429, "AI_QUOTA")
    assert "limite" in response.json()["message"]
