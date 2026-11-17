"""Pictogram rules with the fake source (T06)."""

import pytest

from app.ai_providers.fake import FakeAiProvider
from app.models.material import Material
from app.models.profile import StudentProfile
from app.pictogram_providers.fake import FakePictogramProvider
from app.services.adaptation_service import AdaptationService
from app.services.errors import ServiceError
from app.services.pictogram_service import PictogramService
from tests.factories import ai_answer_json, ai_step


def adapt_with(keywords: list[dict], source: FakePictogramProvider):
    text = "Marque o sol e a chuva no desenho."
    answer = ai_answer_json([ai_step(text=text, keywords=keywords)])
    service = AdaptationService(FakeAiProvider([answer]), pictograms=PictogramService(source))
    profile = StudentProfile(needs_more_images=True)
    return service.adapt(Material(text="1) ..."), "test", profile)


def ids(adaptation) -> list[int | None]:
    return [k.pictogram_id for k in adaptation.steps[0].keywords]


def test_ca_001_10_search_term_first_then_word_then_none():
    source = FakePictogramProvider({"astro": [11], "chuva": [22]})
    keywords = [
        {"word": "sol", "searchTerm": "astro"},
        {"word": "chuva", "searchTerm": "temporal"},
        {"word": "desenho", "searchTerm": "rabisco"},
    ]

    adaptation = adapt_with(keywords, source)

    assert ids(adaptation) == [11, 22, None]
    assert "sol" not in source.searched  # the word is only tried when the term fails


def test_r_001_10_a_close_match_never_goes_on_the_sheet_but_is_an_alternative():
    source = FakePictogramProvider(close={"desenho": [48]})

    adaptation = adapt_with([{"word": "desenho", "searchTerm": "desenho"}], source)

    assert ids(adaptation) == [None]
    alternatives = PictogramService(source).alternatives("desenho").results
    assert [option.id for option in alternatives] == [48]


def test_ca_001_10_source_down_leaves_words_without_image():
    adaptation = adapt_with(
        [{"word": "sol", "searchTerm": "sol"}], FakePictogramProvider(down=True)
    )

    assert ids(adaptation) == [None]


def test_same_term_is_searched_once():
    source = FakePictogramProvider({"sol": [1]})
    keywords = [{"word": "sol", "searchTerm": "sol"}, {"word": "Sol", "searchTerm": "sol"}]

    adapt_with(keywords, source)

    assert source.searched.count("sol") == 1


def test_ca_004_01_alternatives_up_to_10_best_first():
    service = PictogramService(FakePictogramProvider({"sol": list(range(1, 15))}))

    result = service.alternatives("sol")

    assert [option.id for option in result.results] == list(range(1, 11))


def test_ca_004_02_no_result_gives_empty_list():
    assert PictogramService(FakePictogramProvider()).alternatives("xyz").results == []


def test_alternatives_with_source_down_give_pictograms_unavailable():
    with pytest.raises(ServiceError) as error:
        PictogramService(FakePictogramProvider(down=True)).alternatives("sol")

    assert error.value.code == "PICTOGRAMS_UNAVAILABLE"
