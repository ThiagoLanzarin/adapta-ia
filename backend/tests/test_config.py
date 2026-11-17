from pathlib import Path

import pytest

from app.config import get_settings

ENV_VARS = ["AI_PROVIDER", "GEMINI_API_KEY", "GEMINI_MODEL", "ALLOWED_ORIGIN", "AI_RECORD"]


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    for name in ENV_VARS:
        monkeypatch.delenv(name, raising=False)


def test_without_key_uses_fake_provider(tmp_path: Path):
    settings = get_settings(env_file=tmp_path / "missing.env")

    assert settings.ai_provider == "fake"
    assert settings.allowed_origin == "http://localhost:5173"


def test_with_key_uses_gemini_provider(monkeypatch, tmp_path: Path):
    monkeypatch.setenv("GEMINI_API_KEY", "test-value")

    settings = get_settings(env_file=tmp_path / "missing.env")

    assert settings.ai_provider == "gemini"


def test_env_file_is_read_without_overriding_real_variables(monkeypatch, tmp_path: Path):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "# comment\nGEMINI_MODEL=model-from-file\nALLOWED_ORIGIN=http://file\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("ALLOWED_ORIGIN", "http://real")

    settings = get_settings(env_file=env_file)

    assert settings.gemini_model == "model-from-file"
    assert settings.allowed_origin == "http://real"
