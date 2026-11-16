"""What the AI returns (used only inside the server).

No length limits here on purpose: Gemini rejects schemas with long nested array limits
("too many states", docs/pesquisa-t00.md). The service checks the limits afterwards.
"""

from typing import Literal

from pydantic import ConfigDict

from app.models.base import CamelModel

StepKind = Literal["instruction", "text", "question"]


class AiModel(CamelModel):
    """Lenient with extra fields: an unexpected key from the AI must not drop the answer."""

    model_config = ConfigDict(extra="ignore")


class AiKeyword(AiModel):
    word: str
    search_term: str


class AiStep(AiModel):
    kind: StepKind
    source_number: str | None
    text: str
    options: list[str]
    keywords: list[AiKeyword]
    needs_figure: bool
    figure_box: list[int] | None


class AiAdaptation(AiModel):
    title: str
    objective: str
    transcription: str
    source_questions: list[str]
    teacher_notes: list[str]
    steps: list[AiStep]


def ai_response_schema() -> dict:
    """JSON schema sent to the AI, with the camelCase names of the contract."""
    return AiAdaptation.model_json_schema(by_alias=True)
