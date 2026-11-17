"""Fake pictogram source for tests and offline development (never calls the internet)."""

from app.pictogram_providers.base import PictogramUnavailableError


class FakePictogramProvider:
    def __init__(
        self,
        results: dict[str, list[int]] | None = None,
        down: bool = False,
        close: dict[str, list[int]] | None = None,
    ) -> None:
        """`results` are exact matches; `close` are found only by a wide search."""
        self._results = {k.casefold(): v for k, v in (results or {}).items()}
        self._close = {k.casefold(): v for k, v in (close or {}).items()}
        self._down = down
        self.searched: list[str] = []

    def search(self, term: str, limit: int = 10, exact: bool = False) -> list[int]:
        self.searched.append(term)
        if self._down:
            raise PictogramUnavailableError("fake source is down")
        key = term.strip().casefold()
        found = self._results.get(key, [])
        if not exact:
            found = found + [i for i in self._close.get(key, []) if i not in found]
        return found[:limit]
