"""Pictogram rules (RF-06, RF-11): fill the adaptation and list alternatives.

Knows only the PictogramProvider interface. Searches run in parallel because each ARASAAC
call takes about 1 s (T06, 16/11/2026).
"""

from concurrent.futures import ThreadPoolExecutor

from app.models.adaptation import Adaptation
from app.models.pictograms import MAX_PICTOGRAM_RESULTS, PictogramOption, PictogramSearch
from app.pictogram_providers.base import PictogramProvider, PictogramUnavailableError
from app.services.errors import ServiceError

MAX_PARALLEL_SEARCHES = 8


class PictogramService:
    def __init__(self, provider: PictogramProvider) -> None:
        self._provider = provider

    def fill(self, adaptation: Adaptation) -> Adaptation:
        """CA-001-10: search term first, then the shown word; no result means no image.

        R-001-10: only exact matches go on the sheet. A wrong image confuses more than none;
        the teacher still gets close matches when swapping (alternatives).
        """
        keywords = [k for step in adaptation.steps for k in step.keywords]
        found = self._search_all({k.search_term for k in keywords})
        fallback = {k.word for k in keywords if not found.get(k.search_term)} - found.keys()
        found |= self._search_all(fallback)
        for keyword in keywords:
            ids = found.get(keyword.search_term) or found.get(keyword.word) or []
            keyword.pictogram_id = ids[0] if ids else None
        return adaptation

    def alternatives(self, query: str) -> PictogramSearch:
        """CA-004-01, CA-004-02: up to 10 options, best first; empty when nothing matches."""
        try:
            ids = self._provider.search(query, limit=MAX_PICTOGRAM_RESULTS)
        except PictogramUnavailableError as error:
            raise ServiceError("PICTOGRAMS_UNAVAILABLE") from error
        return PictogramSearch(results=[PictogramOption(id=i) for i in ids[:MAX_PICTOGRAM_RESULTS]])

    def _search_all(self, terms: set[str]) -> dict[str, list[int]]:
        ordered = sorted(t for t in terms if t.strip())
        if not ordered:
            return {}
        with ThreadPoolExecutor(max_workers=MAX_PARALLEL_SEARCHES) as pool:
            results = list(pool.map(self._search_quietly, ordered))
        return dict(zip(ordered, results, strict=True))

    def _search_quietly(self, term: str) -> list[int]:
        """During an adaptation, a down ARASAAC only leaves the word without an image."""
        try:
            return self._provider.search(term, limit=1, exact=True)
        except PictogramUnavailableError:
            return []
