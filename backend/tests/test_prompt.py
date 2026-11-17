"""Text of the request to the AI (T04)."""

import pytest

from app.ai_providers.prompt import build_prompt
from app.models.profile import StudentProfile

TEST_RULE = "mantenha TODAS as alternativas"


def prompt_for(material_type="test", profile=None, has_image=True, **kwargs) -> str:
    return build_prompt(
        material_type=material_type,
        profile=profile or StudentProfile(),
        max_keywords=2,
        has_image=has_image,
        **kwargs,
    )


def test_ca_001_13_test_rules_only_for_tests():
    assert TEST_RULE in prompt_for("test")


@pytest.mark.parametrize("material_type", ["activity", "content"])
def test_ca_001_13_no_test_rules_for_other_materials(material_type):
    assert TEST_RULE not in prompt_for(material_type)


def test_ca_001_14_prompt_has_the_marked_options_and_the_notes():
    profile = StudentProfile(reads_little=True, easily_distracted=True, notes="TEA nível 2.")

    prompt = prompt_for(profile=profile)

    assert "lê pouco" in prompt
    assert "se distrai fácil" in prompt
    assert "TEA nível 2." in prompt
    assert "passo a passo" not in prompt


def test_figure_box_is_asked_only_when_there_is_an_image():
    assert "figureBox" in prompt_for(has_image=True)
    assert "não há imagem" in prompt_for(has_image=False)


def test_retry_prompt_tells_the_previous_error_and_text_material_goes_last():
    prompt = prompt_for(material_text="1) Questão", previous_error="2 erro(s) de formato")

    assert "fora do formato (2 erro(s) de formato)" in prompt
    assert prompt.endswith("Material:\n1) Questão")


def test_ca_001_31_literal_option_asks_for_direct_wording_but_keeps_the_assessed_expression():
    prompt = prompt_for(profile=StudentProfile(takes_things_literally=True))

    assert "interpreta a linguagem de forma literal" in prompt
    assert "não troque quando a questão pergunta justamente sobre a expressão" in prompt
    # The support text of a test stays as in the original (R-001-02).
    assert "mantenha o texto de apoio igual ao original" in prompt


def test_ca_001_32_predictability_option_asks_for_an_explicit_command():
    prompt = prompt_for(profile=StudentProfile(needs_predictability=True))

    assert "Marque 1 alternativa." in prompt
    assert "sem mudar o que a questão pede" in prompt
    assert "forma literal" not in prompt


def test_new_options_are_absent_when_not_marked():
    prompt = prompt_for(profile=StudentProfile(reads_little=True))

    assert "forma literal" not in prompt
    assert "previsibilidade" not in prompt


def test_r_001_10_keywords_only_when_the_common_picture_has_the_same_meaning():
    prompt = prompt_for()

    assert "o mesmo sentido que ela tem na" in prompt
    assert "na dúvida, não escolha" in prompt


def test_r_001_10_search_term_uses_the_unambiguous_portuguese_of_portugal_name():
    prompt = prompt_for()

    assert "português de Portugal" in prompt
    assert '"caramelo"' in prompt
