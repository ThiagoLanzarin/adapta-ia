"""Text of the request sent to any AI (spec 001: R-001-02, R-001-03, R-001-07, R-001-08).

Written in Portuguese because the materials and the answer are in Portuguese.
Changes here must be checked against the real materials (docs/pesquisa-t00.md).
"""

from app.models.profile import MaterialType, StudentProfile

MATERIAL_NAMES: dict[MaterialType, str] = {
    "test": "prova",
    "activity": "atividade",
    "content": "conteúdo de aula",
}

BASE_RULES = """Você adapta materiais escolares para um aluno com autismo (TEA).
Tipo de material: {material_name}.

Perfil do aluno:
{profile_lines}

Faça, nesta ordem:
1. Em "transcription", transcreva o texto do material como está.
2. Em "sourceQuestions", liste os números das questões do original ("1", "2", "4a"...).
3. Em "steps", escreva a versão adaptada:
   - cada questão é um passo "question" com "sourceNumber" igual ao número do original;
   - instruções gerais são passos "instruction" com "sourceNumber" nulo e "options" vazio;
   - texto de apoio que as questões usam (texto-base, poema, trecho) é um passo "text",
     antes das questões, com o texto COMPLETO, só dividido em parágrafos curtos;
   - não acrescente conteúdo; mantenha os termos da disciplina.
4. Palavras-chave (no máximo {max_keywords} por passo, nenhuma em passo "text"):
   - "word" é a palavra exatamente como aparece no texto do passo;
   - "searchTerm" é a forma simples e concreta do SENTIDO da palavra na frase, para buscar
     um pictograma (verbo no infinitivo, substantivo no singular); os pictogramas estão em
     português de Portugal, então, se a palavra tiver outro sentido ou outro nome lá, use o
     nome sem ambiguidade (bala de comer → "caramelo"; ônibus → "autocarro");
   - nunca use verbos de comando do enunciado ("arme", "efetue", "marque", "leia", "indique");
   - nunca escolha uma palavra que seja uma resposta possível da questão;
   - só escolha uma palavra se o desenho comum dela mostra o mesmo sentido que ela tem na
     frase: nada de sentido figurado ou técnico (o "braço" do rio, a "raiz" de um número,
     "ganhar" tempo) e nada sobre o próprio texto ("palavra", "expressão", "trecho", "ideia",
     "indicar"); prefira o ser ou objeto principal ("aranha", não "pata");
   - na dúvida, não escolha: imagem errada confunde mais do que nenhuma imagem.
5. Figuras: se um passo precisa de uma figura do original para ser respondido (gráfico,
   figura geométrica, mapa, ilustração citada), marque "needsFigure" true e{figure_rule}
   Figuras só decorativas não entram. Sem figura: "needsFigure" false e "figureBox" nulo.
   Se os dados da figura puderem ser escritos no texto do passo, escreva-os também.
6. Em "teacherNotes", diga em frases curtas tudo o que você simplificou, juntou, dividiu
   ou omitiu, inclusive instruções como "use caneta azul".
Se não conseguir ler o material, devolva "transcription" vazio e "steps" vazio."""

FIGURE_BOX_RULE = """ dê em "figureBox" a caixa da
   figura na imagem enviada: [ymin, xmin, ymax, xmax], normalizada de 0 a 1000."""
NO_IMAGE_FIGURE_RULE = """ deixe "figureBox" nulo (não há imagem)."""

REVISION_RULES = """
Este material é uma folha JÁ ADAPTADA, com correções do professor. Faça uma nova versão
seguindo o pedido do professor:
- parta desta folha, não de outra versão; mantenha tudo o que o pedido não manda mudar;
- mantenha o "sourceNumber" de cada questão e a ordem das questões;
- as etapas marcadas "usa uma figura do original" continuam com "needsFigure" true.
Pedido do professor: {instruction}"""

TEST_RULES = """
Regras de prova, obrigatórias:
- mantenha TODAS as questões, com a numeração do original;
- mantenha TODAS as alternativas, simplificando só o texto, sem mudar o sentido;
- mantenha o texto de apoio igual ao original, porque as questões citam trechos dele;
- não destaque, não ilustre e não sugira a resposta;
- palavras-chave só no enunciado, nunca nas alternativas."""


def describe_profile(profile: StudentProfile) -> str:
    lines = []
    if profile.reads_little:
        lines.append(
            "- lê pouco: frases curtas e palavras do dia a dia; os termos da disciplina ficam."
        )
    if profile.needs_step_by_step:
        lines.append("- precisa de passo a passo: enunciado com mais de uma ação vira passos.")
    if profile.needs_more_images:
        lines.append("- precisa de mais imagens: use palavras-chave em todos os passos possíveis.")
    if profile.sensitive_to_visual_clutter:
        lines.append("- sensível a excesso visual: poucas palavras-chave, nada de enfeite.")
    if profile.easily_distracted:
        lines.append("- se distrai fácil: uma ação por passo, sem informação que não seja usada.")
    if profile.takes_things_literally:
        lines.append(
            "- interpreta a linguagem de forma literal: nos enunciados, troque metáforas,"
            " expressões populares, ironia e perguntas vagas por frases diretas; não troque"
            " quando a questão pergunta"
            " justamente sobre a expressão."
        )
    if profile.needs_predictability:
        lines.append(
            "- precisa de previsibilidade: comece cada questão dizendo exatamente o que"
            ' fazer e quantas respostas ("Marque 1 alternativa.", "Escreva 1 número."), sem'
            " mudar o que a questão pede."
        )
    if profile.notes.strip():
        lines.append(f"- observações do professor: {profile.notes.strip()}")
    return "\n".join(lines) or "- sem necessidades marcadas: só simplifique a linguagem."


def build_prompt(
    material_type: MaterialType,
    profile: StudentProfile,
    max_keywords: int,
    has_image: bool,
    material_text: str | None = None,
    previous_error: str | None = None,
    instruction: str | None = None,
) -> str:
    prompt = BASE_RULES.format(
        material_name=MATERIAL_NAMES[material_type],
        profile_lines=describe_profile(profile),
        max_keywords=max_keywords,
        figure_rule=FIGURE_BOX_RULE if has_image else NO_IMAGE_FIGURE_RULE,
    )
    if material_type == "test":
        prompt += "\n" + TEST_RULES
    if instruction is not None:
        # Spec 005: same rules as the first version (R-001-02 included), plus the request.
        prompt += "\n" + REVISION_RULES.format(instruction=instruction)
    if previous_error:
        prompt += f"\n\nSua resposta anterior veio fora do formato ({previous_error}). Corrija."
    if material_text is not None:
        prompt += f"\n\nMaterial:\n{material_text}"
    return prompt
