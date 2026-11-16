"""Gemini implementation of the AI interface (SDK google-genai).

The only file that knows Gemini. It turns SDK errors into the neutral errors of
app.ai_providers.errors, so the services never see a Google type. The key is never logged.
"""

import logging

import httpx
from google import genai
from google.genai import errors, types

from app.ai_providers.base import AiRequest
from app.ai_providers.errors import (
    AiBlockedError,
    AiProviderError,
    AiQuotaError,
    AiTimeoutError,
    AiUnavailableError,
)

logger = logging.getLogger(__name__)

TIMEOUT_MS = 90_000  # R-001-09
TEMPERATURE = 0.2
BLOCKED_FINISH_REASONS = {
    "SAFETY",
    "BLOCKLIST",
    "PROHIBITED_CONTENT",
    "SPII",
    "IMAGE_SAFETY",
    "IMAGE_PROHIBITED_CONTENT",
}


class GeminiProvider:
    def __init__(self, api_key: str, model: str, client: genai.Client | None = None) -> None:
        self._model = model
        self._client = client or genai.Client(
            api_key=api_key, http_options=types.HttpOptions(timeout=TIMEOUT_MS)
        )

    def generate(self, request: AiRequest) -> str:
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_json_schema=request.response_schema,
            temperature=TEMPERATURE,
        )
        try:
            response = self._client.models.generate_content(
                model=self._model, contents=build_contents(request), config=config
            )
        except errors.ClientError as error:
            raise client_error(error) from error
        except errors.ServerError as error:
            logger.warning("Gemini server error %s: %s", error.code, error.status)
            if error.code == 504:
                raise AiTimeoutError(error.status) from error
            raise AiUnavailableError(error.status) from error
        except httpx.TimeoutException as error:
            raise AiTimeoutError("timeout") from error
        except httpx.HTTPError as error:
            raise AiUnavailableError(type(error).__name__) from error
        log_usage(response)
        check_blocked(response)
        return response.text or ""


def build_contents(request: AiRequest) -> list[types.Part]:
    parts = [types.Part.from_text(text=request.prompt)]
    if request.image is not None:
        mime_type = request.image_mime_type or "image/jpeg"
        parts.append(types.Part.from_bytes(data=request.image, mime_type=mime_type))
    return parts


def client_error(error: errors.ClientError) -> AiProviderError:
    logger.warning("Gemini client error %s: %s", error.code, error.status)
    if error.code == 429:
        return AiQuotaError(error.status)
    # 400 (request refused), 401/403 (key problem): retrying does not help.
    return AiProviderError(f"{error.code} {error.status}")


def check_blocked(response: types.GenerateContentResponse) -> None:
    feedback = response.prompt_feedback
    if feedback is not None and feedback.block_reason:
        raise AiBlockedError(str(feedback.block_reason))
    for candidate in response.candidates or []:
        reason = candidate.finish_reason
        name = getattr(reason, "value", reason)
        if name in BLOCKED_FINISH_REASONS:
            raise AiBlockedError(str(name))


def log_usage(response: types.GenerateContentResponse) -> None:
    """Tokens per request, thinking included, to follow the prepaid credits."""
    usage = response.usage_metadata
    if usage is not None:
        logger.info(
            "Gemini tokens: in=%s out=%s thinking=%s",
            usage.prompt_token_count,
            usage.candidates_token_count,
            usage.thoughts_token_count,
        )
