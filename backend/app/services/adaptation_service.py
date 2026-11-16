"""Rule of adapting a material (spec 001). Knows only the AI interface, never a provider."""

import time
from collections.abc import Callable

from pydantic import ValidationError

from app.ai_providers.base import AiProvider, AiRequest
from app.ai_providers.errors import (
    AiBlockedError,
    AiProviderError,
    AiQuotaError,
    AiTimeoutError,
    AiUnavailableError,
)
from app.ai_providers.prompt import build_prompt
from app.models.adaptation import MAX_STEPS, Adaptation
from app.models.ai_adaptation import AiAdaptation, ai_response_schema
from app.models.material import Material
from app.models.profile import MaterialType, StudentProfile
from app.models.slides import Slide
from app.services.errors import ServiceError
from app.services.material_service import read_material
from app.services.pictogram_service import PictogramService
from app.services.post_processing import build_adaptation, max_keywords

RETRY_DELAY_SECONDS = 2.0


class InvalidAnswer(Exception):
    """The AI answered, but outside the expected format."""


def parse_answer(raw: str) -> AiAdaptation:
    """Validates the AI JSON and the limits left out of the AI schema (CA-001-20)."""
    try:
        answer = AiAdaptation.model_validate_json(raw)
    except ValidationError as error:
        raise InvalidAnswer(f"{error.error_count()} erro(s) de formato") from error
    if len(answer.steps) > MAX_STEPS:
        raise InvalidAnswer(f"mais de {MAX_STEPS} passos")
    return answer


class AdaptationService:
    def __init__(
        self,
        ai: AiProvider,
        pictograms: PictogramService | None = None,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        self._ai = ai
        self._pictograms = pictograms
        self._sleep = sleep

    def adapt_submission(
        self,
        text: str | None,
        image: bytes | None,
        material_type: MaterialType,
        profile: StudentProfile,
        slides: list[Slide] | None = None,
    ) -> Adaptation:
        """What the route calls: read the material, then adapt it."""
        return self.adapt(read_material(text, image, slides), material_type, profile)

    def adapt(
        self, material: Material, material_type: MaterialType, profile: StudentProfile
    ) -> Adaptation:
        """One AI call; one more only for an invalid answer or an unavailable AI (R-001-01)."""
        previous_error: str | None = None
        for attempt in (1, 2):
            request = self._build_request(material, material_type, profile, previous_error)
            try:
                answer = parse_answer(self._call(request, can_retry=attempt == 1))
            except InvalidAnswer as error:
                previous_error = str(error)
                continue
            except _RetryUnavailable:
                self._sleep(RETRY_DELAY_SECONDS)
                continue
            adaptation = build_adaptation(answer, material_type, profile, material.has_image)
            return self._pictograms.fill(adaptation) if self._pictograms else adaptation
        # Only reached when the second answer was also invalid: an unavailable AI on the
        # second attempt raises AI_UNAVAILABLE inside _call.
        raise ServiceError("AI_INVALID")

    def _build_request(
        self,
        material: Material,
        material_type: MaterialType,
        profile: StudentProfile,
        previous_error: str | None,
    ) -> AiRequest:
        prompt = build_prompt(
            material_type=material_type,
            profile=profile,
            max_keywords=max_keywords(profile),
            has_image=material.has_image,
            material_text=material.text,
            previous_error=previous_error,
        )
        return AiRequest(
            prompt=prompt,
            response_schema=ai_response_schema(),
            image=material.image,
            image_mime_type=material.image_mime_type,
        )

    def _call(self, request: AiRequest, can_retry: bool) -> str:
        """Translates provider errors into the codes of the contract (docs/arquitetura.md, 7)."""
        try:
            return self._ai.generate(request)
        except AiQuotaError as error:
            raise ServiceError("AI_QUOTA") from error
        except AiTimeoutError as error:
            raise ServiceError("AI_TIMEOUT") from error
        except AiBlockedError as error:
            raise ServiceError("AI_BLOCKED") from error
        except AiUnavailableError as error:
            if can_retry:
                raise _RetryUnavailable from error
            raise ServiceError("AI_UNAVAILABLE") from error
        except AiProviderError as error:
            # The AI refused the request itself (bad request, key problem): no retry.
            raise ServiceError("AI_INVALID") from error


class _RetryUnavailable(Exception):
    """Internal signal: the AI was unavailable on the first attempt."""
