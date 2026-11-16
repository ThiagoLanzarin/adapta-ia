"""Spec 001 rules applied to a valid AI answer (T04)."""

import pytest

from app.models.ai_adaptation import AiAdaptation
from app.models.profile import StudentProfile
from app.services.post_processing import build_adaptation, max_keywords
from tests.factories import ai_answer, ai_step

PROFILE = StudentProfile()
BOX = [100, 100, 400, 500]


def build(answer: dict, profile: StudentProfile = PROFILE, has_image: bool = True):
    return build_adaptation(AiAdaptation.model_validate(answer), "test", profile, has_image)


def codes(adaptation) -> list[str]:
    return [warning.code for warning in adaptation.warnings]


def test_ca_001_07_missing_question_creates_warning():
    answer = ai_answer(
        [ai_step(sourceNumber="1"), ai_step(sourceNumber="2")], sourceQuestions=["1", "2", "3"]
    )

    adaptation = build(answer)

    assert codes(adaptation) == ["MISSING_QUESTION"]
    assert "questão 3" in adaptation.warnings[0].message


def test_ca_001_08_keyword_not_in_step_text_is_removed():
    keywords = [{"word": "Sol", "searchTerm": "sol"}, {"word": "oxigênio", "searchTerm": "x"}]

    adaptation = build(ai_answer([ai_step(keywords=keywords)]))

    assert [k.word for k in adaptation.steps[0].keywords] == ["Sol"]


@pytest.mark.parametrize(
    ("more_images", "clutter", "expected"),
    [(False, False, 2), (True, False, 3), (False, True, 1), (True, True, 2)],
)
def test_ca_001_09_keyword_limit_follows_the_profile(more_images, clutter, expected):
    profile = StudentProfile(needs_more_images=more_images, sensitive_to_visual_clutter=clutter)
    text = "sol água nuvem chuva"
    keywords = [{"word": w, "searchTerm": w} for w in text.split()]

    adaptation = build(ai_answer([ai_step(text=text, keywords=keywords)]), profile)

    assert max_keywords(profile) == expected
    assert len(adaptation.steps[0].keywords) == expected


def test_ca_001_15_unique_ids_and_options_only_in_questions():
    steps = [
        ai_step(kind="instruction", sourceNumber=None, options=["sobrou"]),
        ai_step(),
    ]

    adaptation = build(ai_answer(steps))

    assert [s.id for s in adaptation.steps] == ["s1", "s2"]
    assert adaptation.steps[0].options == []
    assert adaptation.steps[1].options == ["a) Condensação", "b) Evaporação"]


def test_ca_001_16_empty_transcription_creates_unreadable_warning():
    adaptation = build(ai_answer([ai_step()], transcription="  "))

    assert codes(adaptation) == ["UNREADABLE"]
    assert adaptation.steps == []


def test_ca_001_17_text_step_has_no_options_and_no_keywords():
    step = ai_step(kind="text", sourceNumber=None, text="O sol aquece.", options=["x"])

    adaptation = build(ai_answer([step], sourceQuestions=[]))

    assert adaptation.steps[0].options == []
    assert adaptation.steps[0].keywords == []


def test_ca_001_18_valid_figure_box_from_image_is_kept():
    adaptation = build(ai_answer([ai_step(needsFigure=True, figureBox=BOX)]))

    assert adaptation.steps[0].figure_box == BOX
    assert codes(adaptation) == []


@pytest.mark.parametrize(
    ("box", "has_image"),
    [
        (None, True),
        ([1, 2, 3], True),
        ([0, 0, 1001, 10], True),
        ([500, 0, 400, 10], True),
        (BOX, False),
    ],
)
def test_ca_001_19_figure_without_valid_box_creates_warning(box, has_image):
    step = ai_step(sourceNumber="7", needsFigure=True, figureBox=box)

    adaptation = build(ai_answer([step], sourceQuestions=["7"]), has_image=has_image)

    assert adaptation.steps[0].figure_box is None
    assert codes(adaptation) == ["NEEDS_FIGURE"]
    assert adaptation.warnings[0].message.startswith("A questão 7 depende")
