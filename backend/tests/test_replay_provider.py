"""Recorded answers for the demo (T22): recording in the rehearsal, replay on the day."""

import json
from dataclasses import replace
from pathlib import Path

from fastapi.testclient import TestClient

from app.ai_providers.base import AiRequest
from app.ai_providers.errors import AiQuotaError
from app.ai_providers.fake import FakeAiProvider
from app.ai_providers.gemini import GeminiProvider
from app.ai_providers.replay import RecordingAiProvider, ReplayAiProvider, request_key
from app.main import build_ai_provider, create_app
from app.pictogram_providers.fake import FakePictogramProvider
from tests.factories import ai_answer_json
from tests.test_adaptations_route import JPEG, SETTINGS, assert_error, post

TEXT = "1) Como se chama a etapa em que a água vira vapor?"


def client_with(ai) -> TestClient:
    pictograms = FakePictogramProvider({"sol": [2798]})
    return TestClient(create_app(SETTINGS, ai=ai, pictogram_provider=pictograms))


def test_recorded_material_gives_the_same_sheet_in_replay(tmp_path: Path):
    recorded = post(client_with(RecordingAiProvider(FakeAiProvider(), tmp_path)), text=TEXT)

    replayed = post(client_with(ReplayAiProvider(tmp_path)), text=TEXT)

    assert replayed.status_code == 200
    assert replayed.json() == recorded.json()
    assert len(list(tmp_path.glob("*.json"))) == 1


def test_material_not_recorded_gives_a_clear_error(tmp_path: Path):
    post(client_with(RecordingAiProvider(FakeAiProvider(), tmp_path)), text=TEXT)

    response = post(client_with(ReplayAiProvider(tmp_path)), text=TEXT + " Outra questão.")

    assert_error(response, 422, "AI_NOT_RECORDED")
    assert "não foi gravado no ensaio" in response.json()["message"]


def test_same_material_with_another_profile_is_not_recorded(tmp_path: Path):
    post(client_with(RecordingAiProvider(FakeAiProvider(), tmp_path)), text=TEXT)

    response = post(
        client_with(ReplayAiProvider(tmp_path)), text=TEXT, profile='{"easilyDistracted": true}'
    )

    assert_error(response, 422, "AI_NOT_RECORDED")


def test_photo_is_part_of_the_key():
    request = AiRequest(prompt="p", response_schema={}, image=JPEG, image_mime_type="image/jpeg")

    assert request_key(request) == request_key(replace(request))
    assert request_key(request) != request_key(replace(request, image=JPEG + b"1"))
    assert request_key(request) != request_key(replace(request, image=None))


def test_ai_errors_are_not_recorded(tmp_path: Path):
    ai = RecordingAiProvider(FakeAiProvider([AiQuotaError("quota")]), tmp_path)

    assert_error(post(client_with(ai), text=TEXT), 429, "AI_QUOTA")
    assert list(tmp_path.glob("*.json")) == []


def test_recorded_file_keeps_only_the_answer(tmp_path: Path):
    answer = ai_answer_json()
    ai = RecordingAiProvider(FakeAiProvider([answer]), tmp_path)

    post(client_with(ai), text=TEXT)

    # No prompt and no profile in the file: only what the AI answered.
    saved = json.loads(next(tmp_path.glob("*.json")).read_text(encoding="utf-8"))
    assert saved == {"answer": answer}


def test_replay_provider_is_chosen_and_reported_by_health():
    settings = replace(SETTINGS, ai_provider="replay")

    ai, name = build_ai_provider(settings)
    health = TestClient(create_app(settings)).get("/health").json()

    assert isinstance(ai, ReplayAiProvider)
    assert name == "replay"
    assert health["aiProvider"] == "replay"


def test_ai_record_wraps_gemini_and_still_reports_gemini():
    settings = replace(
        SETTINGS, ai_provider="gemini", gemini_api_key="k", gemini_model="m", ai_record=True
    )

    ai, name = build_ai_provider(settings)

    assert isinstance(ai, RecordingAiProvider)
    assert name == "gemini"
    assert isinstance(build_ai_provider(replace(settings, ai_record=False))[0], GeminiProvider)
