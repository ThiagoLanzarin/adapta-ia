"""Adaptation rule with the fake AI: retries and failures (T04)."""

import pytest

from app.ai_providers.errors import (
    AiBlockedError,
    AiProviderError,
    AiQuotaError,
    AiTimeoutError,
    AiUnavailableError,
)
from app.ai_providers.fake import FakeAiProvider
from app.models.material import Material
from app.models.profile import StudentProfile
from app.services.adaptation_service import AdaptationService
from app.services.errors import ServiceError
from tests.factories import ai_answer_json, ai_step

TEXT = Material(text="1) Como se chama a etapa em que a água vira vapor?")
PROFILE = StudentProfile()


def adapt(answers, sleeps=None):
    fake = FakeAiProvider(answers)
    service = AdaptationService(fake, sleep=sleeps.append if sleeps is not None else lambda _: None)
    return service.adapt(TEXT, "test", PROFILE), fake


def adapt_error(answers) -> tuple[str, FakeAiProvider]:
    fake = FakeAiProvider(answers)
    with pytest.raises(ServiceError) as error:
        AdaptationService(fake, sleep=lambda _: None).adapt(TEXT, "test", PROFILE)
    return error.value.code, fake


def test_default_fake_answer_becomes_a_valid_adaptation():
    adaptation = AdaptationService(FakeAiProvider()).adapt(TEXT, "test", PROFILE)

    assert adaptation.steps
    assert adaptation.material_type == "test"


def test_ca_001_11_invalid_then_valid_answer_returns_the_adaptation():
    adaptation, fake = adapt(["{not json", ai_answer_json()])

    assert len(adaptation.steps) == 1
    assert len(fake.requests) == 2
    assert "fora do formato" in fake.requests[1].prompt


def test_ca_001_11_two_invalid_answers_give_ai_invalid():
    code, fake = adapt_error(["{not json", '{"title": 1}'])

    assert code == "AI_INVALID"
    assert len(fake.requests) == 2


def test_ca_001_12_quota_is_not_retried():
    code, fake = adapt_error([AiQuotaError()])

    assert code == "AI_QUOTA"
    assert len(fake.requests) == 1


def test_ca_001_20_more_than_20_steps_counts_as_invalid():
    too_long = ai_answer_json([ai_step(sourceNumber=str(i)) for i in range(21)])

    code, fake = adapt_error([too_long, too_long])

    assert code == "AI_INVALID"
    assert len(fake.requests) == 2


def test_unavailable_ai_is_retried_once_after_a_pause():
    sleeps: list[float] = []

    adaptation, fake = adapt([AiUnavailableError(), ai_answer_json()], sleeps)

    assert adaptation.steps
    assert len(fake.requests) == 2
    assert sleeps == [2.0]


def test_unavailable_twice_gives_ai_unavailable():
    code, _ = adapt_error([AiUnavailableError(), AiUnavailableError()])

    assert code == "AI_UNAVAILABLE"


@pytest.mark.parametrize(
    ("error", "expected"), [(AiTimeoutError(), "AI_TIMEOUT"), (AiBlockedError(), "AI_BLOCKED")]
)
def test_timeout_and_block_are_not_retried(error, expected):
    code, fake = adapt_error([error])

    assert code == expected
    assert len(fake.requests) == 1


def test_image_material_is_sent_with_its_type():
    fake = FakeAiProvider([ai_answer_json()])
    photo = Material(image=b"jpeg-bytes", image_mime_type="image/jpeg")

    AdaptationService(fake).adapt(photo, "test", PROFILE)

    assert fake.requests[0].image == b"jpeg-bytes"
    assert fake.requests[0].image_mime_type == "image/jpeg"
    assert "figureBox" in fake.requests[0].prompt


def test_request_refused_by_the_ai_gives_ai_invalid_without_retry():
    code, fake = adapt_error([AiProviderError("400 INVALID_ARGUMENT")])

    assert code == "AI_INVALID"
    assert len(fake.requests) == 1
