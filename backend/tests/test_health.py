from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app

SETTINGS = Settings(
    ai_provider="fake",
    gemini_api_key="",
    gemini_model="",
    allowed_origin="http://localhost:5173",
)


def test_health_returns_ok():
    client = TestClient(create_app(SETTINGS))

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_cors_allows_only_the_configured_origin():
    client = TestClient(create_app(SETTINGS))

    allowed = client.get("/health", headers={"Origin": "http://localhost:5173"})
    other = client.get("/health", headers={"Origin": "https://example.com"})

    assert allowed.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert "access-control-allow-origin" not in other.headers
