"""Fake pictogram source for tests and offline development (never calls the internet)."""

from app.pictogram_providers.base import PictogramUnavailableError


class FakePictogramProvider:
    def __init__(self, results: dict[str, list[int]] | None = None, down: bool = False) -> None:
        self._results = {k.casefold(): v for k, v in (results or {}).items()}
        self._down = down
        self.searched: list[str] = []

    def search(self, term: str, limit: int = 10) -> list[int]:
        self.searched.append(term)
        if self._down:
            raise PictogramUnavailableError("fake source is down")
        return self._results.get(term.strip().casefold(), [])[:limit]
