"""ARASAAC pictograms (https://arasaac.org, CC BY-NC-SA).

Tested on 16/11/2026: "bestsearch" returns only close matches (best first choice);
"search" returns many more (good for alternatives). A term with no result answers 404.
"""

import threading
from urllib.parse import quote

import httpx

from app.pictogram_providers.base import PictogramUnavailableError

BASE_URL = "https://api.arasaac.org/v1/pictograms/pt"
TIMEOUT_SECONDS = 10.0
MAX_RESULTS = 10
MAX_CACHE_ENTRIES = 2000


class ArasaacProvider:
    def __init__(self, client: httpx.Client | None = None) -> None:
        self._client = client or httpx.Client(timeout=TIMEOUT_SECONDS)
        self._best: dict[str, list[int]] = {}
        self._full: dict[str, list[int]] = {}
        self._lock = threading.Lock()

    def search(self, term: str, limit: int = MAX_RESULTS) -> list[int]:
        """With limit 1 (filling a sheet), "search" only runs when "bestsearch" finds nothing."""
        key = term.strip().casefold()
        if not key:
            return []
        if key in self._full:
            return self._full[key][:limit]
        best = self._best.get(key)
        if best is None:
            best = self._remember(self._best, key, self._fetch("bestsearch", key))
        if len(best) >= limit:
            return best[:limit]
        full = self._merge(best, self._fetch("search", key))
        return self._remember(self._full, key, full)[:limit]

    def _remember(self, cache: dict[str, list[int]], key: str, ids: list[int]) -> list[int]:
        with self._lock:
            if len(cache) < MAX_CACHE_ENTRIES:
                cache[key] = ids
        return ids

    def _fetch(self, route: str, term: str) -> list[int]:
        try:
            response = self._client.get(f"{BASE_URL}/{route}/{quote(term)}")
        except httpx.HTTPError as error:
            raise PictogramUnavailableError(str(error)) from error
        if response.status_code == 404:
            return []
        if response.status_code != 200:
            raise PictogramUnavailableError(f"ARASAAC respondeu {response.status_code}")
        return [item["_id"] for item in response.json() if "_id" in item]

    @staticmethod
    def _merge(best: list[int], others: list[int]) -> list[int]:
        merged: list[int] = []
        for pictogram_id in best + others:
            if pictogram_id not in merged:
                merged.append(pictogram_id)
        return merged[:MAX_RESULTS]
