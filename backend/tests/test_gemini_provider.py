"""Gemini provider with a fake SDK client (no internet, no key)."""

from types import SimpleNamespace

import httpx
import pytest
from google.genai import errors, types

from app.ai_providers.base import AiRequest
from app.ai_providers.errors import (
    AiBlockedError,
    AiProviderError,
    AiQuotaError,
    AiTimeoutError,
    AiUnavailableError,
)
from app.ai_providers.gemini import GeminiProvider
from app.config import Settings
from app.main import build_ai_provider

REQUEST = AiRequest(prompt="Adapte.", response_schema={"type": "object"})


class FakeModels:
    def __init__(self, outcome):
        self.outcome = outcome
        self.calls: list[dict] = []

    def generate_content(self, **kwargs):
        self.calls.append(kwargs)
        if isinstance(self.outcome, Exception):
            raise self.outcome
        return self.outcome


def provider_returning(outcome) -> tuple[GeminiProvider, FakeModels]:
    models = FakeModels(outcome)
    client = SimpleNamespace(models=models)
    return GeminiProvider("test-key", "gemini-test", client=client), models


def response(text: str | None = '{"ok": true}', **changes) -> types.GenerateContentResponse:
    data = {"candidates": [{"content": {"parts": [{"text": text}]}, "finish_reason": "STOP"}]}
    return types.GenerateContentResponse.model_validate(data | changes)


def api_error(kind, code: int, status: str):
    return kind(code, {"error": {"code": code, "message": status, "status": status}})


def test_returns_the_json_text_and_sends_schema_and_image():
    provider, models = provider_returning(response())
    request = AiRequest(
        prompt="Adapte.",
        response_schema={"type": "object"},
        image=b"jpg",
        image_mime_type="image/png",
    )

    assert provider.generate(request) == '{"ok": true}'
    call = models.calls[0]
    assert call["model"] == "gemini-test"
    assert call["config"].response_json_schema == {"type": "object"}
    assert call["config"].response_mime_type == "application/json"
    assert call["contents"][1].inline_data.mime_type == "image/png"


@pytest.mark.parametrize(
    ("error", "expected"),
    [
        (api_error(errors.ClientError, 429, "RESOURCE_EXHAUSTED"), AiQuotaError),
        (api_error(errors.ServerError, 503, "UNAVAILABLE"), AiUnavailableError),
        (api_error(errors.ServerError, 504, "DEADLINE_EXCEEDED"), AiTimeoutError),
        (httpx.ReadTimeout("lento"), AiTimeoutError),
        (httpx.ConnectError("sem rede"), AiUnavailableError),
    ],
)
def test_sdk_errors_become_neutral_errors(error, expected):
    provider, _ = provider_returning(error)

    with pytest.raises(expected):
        provider.generate(REQUEST)


def test_bad_request_is_a_plain_provider_error_not_retried_as_unavailable():
    provider, _ = provider_returning(api_error(errors.ClientError, 400, "INVALID_ARGUMENT"))

    with pytest.raises(AiProviderError) as error:
        provider.generate(REQUEST)

    assert type(error.value) is AiProviderError


def test_blocked_prompt_raises_blocked():
    blocked = response(None, prompt_feedback={"block_reason": "SAFETY"})
    provider, _ = provider_returning(blocked)

    with pytest.raises(AiBlockedError):
        provider.generate(REQUEST)


def test_answer_stopped_for_safety_raises_blocked():
    data = {"candidates": [{"content": {"parts": [{"text": "{"}]}, "finish_reason": "SAFETY"}]}
    provider, _ = provider_returning(types.GenerateContentResponse.model_validate(data))

    with pytest.raises(AiBlockedError):
        provider.generate(REQUEST)


def settings(**changes) -> Settings:
    base = {
        "ai_provider": "gemini",
        "gemini_api_key": "test-key",
        "gemini_model": "gemini-test",
        "allowed_origin": "http://localhost:5173",
    }
    return Settings(**(base | changes))


def test_main_uses_gemini_when_configured():
    _, name = build_ai_provider(settings())

    assert name == "gemini"


@pytest.mark.parametrize(
    "changes", [{"gemini_api_key": ""}, {"gemini_model": ""}, {"ai_provider": "fake"}]
)
def test_without_key_or_model_the_fake_is_used(changes):
    _, name = build_ai_provider(settings(**changes))

    assert name == "fake"
