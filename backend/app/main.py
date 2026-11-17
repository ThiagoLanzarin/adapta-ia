"""Assembly point: creates the app, chooses the providers and registers the routes.

This is the only place that knows which AI and pictogram providers are in use
(docs/arquitetura.md, section 4). Tests pass their own fakes to create_app.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ai_providers.base import AiProvider
from app.ai_providers.fake import FakeAiProvider
from app.ai_providers.gemini import GeminiProvider
from app.ai_providers.replay import RecordingAiProvider, ReplayAiProvider
from app.api import adaptations, health, pictograms, slides
from app.api.errors import register_error_handlers
from app.config import Settings, get_settings
from app.pictogram_providers.arasaac import ArasaacProvider
from app.pictogram_providers.base import PictogramProvider
from app.services.adaptation_service import AdaptationService
from app.services.pictogram_service import PictogramService


def build_ai_provider(settings: Settings) -> tuple[AiProvider, str]:
    """The chosen provider and its name. Without a key, Gemini falls back to the fake (T05).

    AI_RECORD=on saves every Gemini answer for the replay provider (T22, rehearsal only).
    """
    if settings.ai_provider == "replay":
        return ReplayAiProvider(), "replay"
    if settings.ai_provider == "gemini" and settings.gemini_api_key and settings.gemini_model:
        gemini = GeminiProvider(settings.gemini_api_key, settings.gemini_model)
        return (RecordingAiProvider(gemini) if settings.ai_record else gemini), "gemini"
    return FakeAiProvider(), "fake"


def create_app(
    settings: Settings | None = None,
    ai: AiProvider | None = None,
    pictogram_provider: PictogramProvider | None = None,
) -> FastAPI:
    settings = settings or get_settings()
    pictogram_service = PictogramService(pictogram_provider or ArasaacProvider())
    if ai is None:
        ai, ai_name = build_ai_provider(settings)
    else:
        ai_name = "custom"

    app = FastAPI(title="Adapta Aí")
    app.state.ai_provider_name = ai_name
    app.state.pictogram_service = pictogram_service
    app.state.adaptation_service = AdaptationService(ai, pictograms=pictogram_service)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.allowed_origin],
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    register_error_handlers(app)
    app.include_router(health.router)
    app.include_router(pictograms.router)
    app.include_router(adaptations.router)
    app.include_router(slides.router)
    return app


app = create_app()
