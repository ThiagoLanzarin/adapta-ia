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
