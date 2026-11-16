"""What any AI provider must know how to do (docs/arquitetura.md, section 4).

The services only see this interface. Gemini, the fake and the replay providers are
implementations, chosen in main.py.
"""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class AiRequest:
    prompt: str
    response_schema: dict
    image: bytes | None = None
    image_mime_type: str | None = None


class AiProvider(Protocol):
    def generate(self, request: AiRequest) -> str:
        """Returns the raw JSON text answered by the AI.

        Raises one of the errors in app.ai_providers.errors when the AI fails.
        """
        ...
