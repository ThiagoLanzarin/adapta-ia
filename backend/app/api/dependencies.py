"""Gives each route the services built in main.py (stored on app.state)."""

from fastapi import Request

from app.services.adaptation_service import AdaptationService
from app.services.pictogram_service import PictogramService


def get_pictogram_service(request: Request) -> PictogramService:
    return request.app.state.pictogram_service


def get_adaptation_service(request: Request) -> AdaptationService:
    return request.app.state.adaptation_service
