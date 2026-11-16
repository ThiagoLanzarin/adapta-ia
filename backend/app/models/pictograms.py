"""Pictogram search result (spec 004)."""

from app.models.base import CamelModel

MAX_PICTOGRAM_RESULTS = 10


class PictogramOption(CamelModel):
    id: int


class PictogramSearch(CamelModel):
    results: list[PictogramOption]
