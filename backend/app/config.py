"""Reads the server configuration from environment variables.

Values come from the process environment. For local development, a `backend/.env`
file is loaded first, without overriding variables already set (on Render, the
variables come from the dashboard and there is no `.env`).
"""

import os
from dataclasses import dataclass
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


def load_env_file(path: Path = ENV_FILE) -> None:
    """Loads KEY=VALUE lines into os.environ, keeping values that already exist."""
    if not path.is_file():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@dataclass(frozen=True)
class Settings:
    ai_provider: str
    gemini_api_key: str
    gemini_model: str
    allowed_origin: str


def get_settings(env_file: Path = ENV_FILE) -> Settings:
    load_env_file(env_file)
    api_key = os.getenv("GEMINI_API_KEY", "")
    default_provider = "gemini" if api_key else "fake"
    return Settings(
        ai_provider=os.getenv("AI_PROVIDER", default_provider),
        gemini_api_key=api_key,
        gemini_model=os.getenv("GEMINI_MODEL", ""),
        allowed_origin=os.getenv("ALLOWED_ORIGIN", "http://localhost:5173"),
    )
