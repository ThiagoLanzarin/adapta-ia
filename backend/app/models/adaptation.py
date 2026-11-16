"""API response for an adaptation (docs/arquitetura.md, section 10)."""

from typing import Literal

from pydantic import Field, field_validator, model_validator

from app.models.ai_adaptation import StepKind
from app.models.base import CamelModel
from app.models.profile import MaterialType

SCHEMA_VERSION = 1
MAX_STEPS = 20
MAX_KEYWORDS_PER_STEP = 3
BOX_SCALE = 1000

WarningCode = Literal["MISSING_QUESTION", "UNREADABLE", "NEEDS_FIGURE"]


class Keyword(CamelModel):
    word: str
    search_term: str
    pictogram_id: int | None


class Step(CamelModel):
    id: str
    kind: StepKind
    source_number: str | None
    text: str
    options: list[str]
    keywords: list[Keyword] = Field(max_length=MAX_KEYWORDS_PER_STEP)
    needs_figure: bool
    figure_box: list[int] | None

    @field_validator("figure_box")
    @classmethod
    def check_box(cls, box: list[int] | None) -> list[int] | None:
        if box is not None and not is_valid_box(box):
            raise ValueError("figureBox must be [ymin, xmin, ymax, xmax] within 0..1000")
        return box

    @model_validator(mode="after")
    def check_kind_rules(self) -> "Step":
        if self.kind != "question" and self.options:
            raise ValueError("only question steps have options")
        if self.kind == "text" and self.keywords:
            raise ValueError("text steps have no keywords")
        if self.figure_box is not None and not self.needs_figure:
            raise ValueError("figureBox requires needsFigure")
        return self


class AdaptationWarning(CamelModel):
    code: WarningCode
    message: str


class Adaptation(CamelModel):
    schema_version: Literal[1] = SCHEMA_VERSION
    material_type: MaterialType
    title: str
    objective: str
    transcription: str
    teacher_notes: list[str]
    warnings: list[AdaptationWarning]
    steps: list[Step] = Field(max_length=MAX_STEPS)

    @model_validator(mode="after")
    def check_unique_ids(self) -> "Adaptation":
        ids = [step.id for step in self.steps]
        if len(ids) != len(set(ids)):
            raise ValueError("step ids must be unique")
        return self


def is_valid_box(box: list[int]) -> bool:
    if len(box) != 4 or any(value < 0 or value > BOX_SCALE for value in box):
        return False
    y_min, x_min, y_max, x_max = box
    return y_min < y_max and x_min < x_max
