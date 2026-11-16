"""Fake AI for tests and for development without a key (never calls the internet).

By default it always answers the same adaptation (fake_answer.json). Tests can pass a
list of answers: each item is either a JSON string or an exception to raise.
"""

from collections.abc import Iterable
from pathlib import Path

from app.ai_providers.base import AiRequest

DEFAULT_ANSWER = (Path(__file__).parent / "fake_answer.json").read_text(encoding="utf-8")


class FakeAiProvider:
    def __init__(self, answers: Iterable[str | Exception] | None = None) -> None:
        self._answers = list(answers) if answers is not None else None
        self.requests: list[AiRequest] = []

    def generate(self, request: AiRequest) -> str:
        self.requests.append(request)
        if self._answers is None:
            return DEFAULT_ANSWER
        answer = self._answers.pop(0)
        if isinstance(answer, Exception):
            raise answer
        return answer
