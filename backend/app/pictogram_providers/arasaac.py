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

# R-001-11: never put on a child's sheet by itself. In Portuguese, ARASAAC only has "bala" as a
# bullet (17/11/2026). The teacher still sees these pictograms when swapping by hand.
SENSITIVE_CATEGORIES = frozenset({"weapon", "crime", "drug addiction", "alcoholism", "smoking"})


def has_several_meanings(term: str, items: list[dict]) -> bool:
    """R-001-10: the term names pictograms with different meanings ("banco": seat or bank)."""
    meanings = {
        keyword["meaning"]
        for item in items
        for keyword in item.get("keywords") or []
        if keyword.get("meaning") and str(keyword.get("keyword", "")).casefold() == term
    }
    return len(meanings) > 1


def is_sensitive(item: dict) -> bool:
    categories = set(item.get("categories") or [])
    return bool(item.get("violence") or item.get("sex") or categories & SENSITIVE_CATEGORIES)


class ArasaacProvider:
    def __init__(self, client: httpx.Client | None = None) -> None:
        self._client = client or httpx.Client(timeout=TIMEOUT_SECONDS)
        self._best: dict[str, list[int]] = {}
        self._full: dict[str, list[int]] = {}
        self._sensitive: set[int] = set()
        self._ambiguous: set[str] = set()
        self._lock = threading.Lock()

    def search(self, term: str, limit: int = MAX_RESULTS, exact: bool = False) -> list[int]:
        """ "bestsearch" first. The wide "search" only runs when more results are needed and
        `exact` is off: on 17/11 it gave "espaço sideral" for "espaço em branco"."""
        key = term.strip().casefold()
        if not key:
            return []
        best = self._best.get(key)
        if best is None:
            best = self._remember(self._best, key, self._fetch("bestsearch", key))
        if exact:
            # On the sheet, an ambiguous term gets no image; the teacher chooses (R-001-10).
            if key in self._ambiguous:
                return []
            return [i for i in best if i not in self._sensitive][:limit]
        if len(best) >= limit:
            return best[:limit]
        if key in self._full:
            return self._full[key][:limit]
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
        items = [item for item in response.json() if "_id" in item]
        with self._lock:
            self._sensitive.update(item["_id"] for item in items if is_sensitive(item))
            if route == "bestsearch" and has_several_meanings(term, items):
                self._ambiguous.add(term)
        return [item["_id"] for item in items]

    @staticmethod
    def _merge(best: list[int], others: list[int]) -> list[int]:
        merged: list[int] = []
        for pictogram_id in best + others:
            if pictogram_id not in merged:
                merged.append(pictogram_id)
        return merged[:MAX_RESULTS]
