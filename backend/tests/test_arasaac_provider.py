"""ARASAAC provider with a simulated HTTP transport (no internet)."""

import httpx
import pytest

from app.pictogram_providers.arasaac import ArasaacProvider
from app.pictogram_providers.base import PictogramUnavailableError


def provider_with(routes: dict[str, tuple[int, list]], calls: list[str] | None = None):
    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if calls is not None:
            calls.append(path)
        for suffix, (status, body) in routes.items():
            if path.endswith(suffix):
                return httpx.Response(status, json=body)
        return httpx.Response(404, json=[])

    return ArasaacProvider(httpx.Client(transport=httpx.MockTransport(handler)))


def test_best_search_comes_first_and_results_are_merged_without_repeats():
    provider = provider_with(
        {
            "/bestsearch/água": (200, [{"_id": 2248}, {"_id": 6889}]),
            "/search/água": (200, [{"_id": 32464}, {"_id": 2248}]),
        }
    )

    assert provider.search("Água") == [2248, 6889, 32464]


def test_404_means_no_pictogram():
    assert provider_with({}).search("precipitação") == []


def test_at_most_10_results():
    many = [{"_id": i} for i in range(30)]

    assert len(provider_with({"/search/sol": (200, many)}).search("sol")) == 10


def test_filling_a_sheet_skips_the_wide_search_when_best_search_finds():
    calls: list[str] = []
    provider = provider_with({"/bestsearch/sol": (200, [{"_id": 1}])}, calls)

    assert provider.search("sol", limit=1) == [1]
    assert calls == ["/v1/pictograms/pt/bestsearch/sol"]


def test_r_001_10_exact_search_never_uses_the_wide_search():
    calls: list[str] = []
    provider = provider_with({"/search/espaço em branco": (200, [{"_id": 9}])}, calls)

    assert provider.search("espaço em branco", limit=1, exact=True) == []
    assert all("/bestsearch/" in call for call in calls)


def test_r_001_11_sensitive_pictograms_never_fill_the_sheet_but_stay_as_alternatives():
    bullet = {"_id": 8497, "categories": ["weapon", "hunting"]}
    provider = provider_with({"/bestsearch/bala": (200, [bullet])})

    assert provider.search("bala", limit=1, exact=True) == []
    assert provider.search("bala") == [8497]


@pytest.mark.parametrize(
    "flags", [{"violence": True}, {"sex": True}, {"categories": ["crime"]}], ids=str
)
def test_r_001_11_flags_and_categories_mark_a_sensitive_pictogram(flags):
    provider = provider_with({"/bestsearch/x": (200, [{"_id": 1} | flags, {"_id": 2}])})

    assert provider.search("x", limit=1, exact=True) == [2]


def meaning(text: str, keyword: str = "banco") -> dict:
    return {"keyword": keyword, "meaning": text}


def test_r_001_10_a_term_with_several_meanings_gets_no_image_on_the_sheet():
    seat = {"_id": 3255, "keywords": [meaning("Assento em que várias pessoas sentam.")]}
    bank = {"_id": 3062, "keywords": [meaning("Instituição financeira.")]}
    provider = provider_with({"/bestsearch/banco": (200, [bank, seat])})

    assert provider.search("banco", limit=1, exact=True) == []
    assert provider.search("banco") == [3062, 3255]


def test_r_001_10_same_meaning_drawn_twice_is_not_ambiguous():
    paw = [{"_id": i, "keywords": [meaning("Membro dos animais.", "pata")]} for i in (1, 2)]
    provider = provider_with({"/bestsearch/pata": (200, paw)})

    assert provider.search("pata", limit=1, exact=True) == [1]


def test_exact_search_ignores_wide_results_cached_by_the_teacher():
    provider = provider_with({"/search/lacuna": (200, [{"_id": 9}])})

    assert provider.search("lacuna") == [9]
    assert provider.search("lacuna", limit=1, exact=True) == []


def test_results_are_cached():
    calls: list[str] = []
    provider = provider_with({"/bestsearch/sol": (200, [{"_id": 1}])}, calls)

    provider.search("sol")
    provider.search(" SOL ")

    assert len(calls) == 2  # bestsearch + search, only the first time


def test_server_error_raises_unavailable():
    with pytest.raises(PictogramUnavailableError):
        provider_with({"/bestsearch/sol": (500, [])}).search("sol")


def test_network_error_raises_unavailable():
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("sem rede", request=request)

    provider = ArasaacProvider(httpx.Client(transport=httpx.MockTransport(handler)))

    with pytest.raises(PictogramUnavailableError):
        provider.search("sol")
