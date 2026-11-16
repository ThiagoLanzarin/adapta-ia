"""Assembly point: creates the app, chooses the providers and registers the routes.

This is the only place that knows which AI and pictogram providers are in use
(docs/arquitetura.md, section 4). Tests pass their own fakes to create_app.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ai_providers.base import AiProvider
from app.ai_providers.fake import FakeAiProvider
from app.api import adaptations, health, pictograms
from app.api.errors import register_error_handlers
from app.config import Settings, get_settings
from app.pictogram_providers.arasaac import ArasaacProvider
from app.pictogram_providers.base import PictogramProvider
from app.services.adaptation_service import AdaptationService
from app.services.pictogram_service import PictogramService


def build_ai_provider(settings: Settings) -> AiProvider:
    # The Gemini provider arrives in T05; until then every setting uses the fake.
    return FakeAiProvider()


def create_app(
    settings: Settings | None = None,
    ai: AiProvider | None = None,
    pictogram_provider: PictogramProvider | None = None,
) -> FastAPI:
    settings = settings or get_settings()
    pictogram_service = PictogramService(pictogram_provider or ArasaacProvider())

    app = FastAPI(title="Adapta Aí")
    app.state.pictogram_service = pictogram_service
    app.state.adaptation_service = AdaptationService(
        ai or build_ai_provider(settings), pictograms=pictogram_service
    )
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
    return app


app = create_app()
