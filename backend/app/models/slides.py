"""PowerPoint slides (spec 002)."""

from pydantic import Field

from app.models.base import CamelModel

MAX_SELECTED_SLIDES = 5


class Slide(CamelModel):
    index: int = Field(ge=1)
    title: str
    text: str


class SlideList(CamelModel):
    slides: list[Slide]
