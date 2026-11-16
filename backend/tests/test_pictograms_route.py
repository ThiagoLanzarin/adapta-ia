"""GET /api/pictograms (spec 004)."""

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.pictogram_providers.fake import FakePictogramProvider

SETTINGS = Settings(
    ai_provider="fake", gemini_api_key="", gemini_model="", allowed_origin="http://localhost:5173"
)


def client_with(source: FakePictogramProvider) -> TestClient:
    return TestClient(create_app(SETTINGS, pictogram_provider=source))


def test_ca_004_01_route_returns_options_best_first():
    response = client_with(FakePictogramProvider({"sol": [7, 8, 9]})).get("/api/pictograms?q=sol")

    assert response.status_code == 200
    assert response.json() == {"results": [{"id": 7}, {"id": 8}, {"id": 9}]}


def test_ca_004_02_route_returns_empty_list_without_error():
    response = client_with(FakePictogramProvider()).get("/api/pictograms?q=xyz")

    assert response.status_code == 200
    assert response.json() == {"results": []}


@pytest.mark.parametrize("query", ["", "a" * 51])
def test_ca_004_03_empty_or_long_word_gives_invalid_input(query):
    response = client_with(FakePictogramProvider()).get("/api/pictograms", params={"q": query})

    assert response.status_code == 422
    assert response.json()["code"] == "INVALID_INPUT"
    assert response.json()["message"].startswith("Confira")


def test_missing_word_gives_invalid_input():
    response = client_with(FakePictogramProvider()).get("/api/pictograms")

    assert response.json()["code"] == "INVALID_INPUT"


def test_source_down_gives_503_with_message():
    response = client_with(FakePictogramProvider(down=True)).get("/api/pictograms?q=sol")

    assert response.status_code == 503
    assert response.json() == {
        "code": "PICTOGRAMS_UNAVAILABLE",
        "message": "Não consegui buscar pictogramas agora. Tente de novo.",
    }
