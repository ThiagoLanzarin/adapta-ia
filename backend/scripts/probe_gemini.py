"""T00 — quick probe of the real Gemini API, outside the layers.

Sends each material in a folder (photos of blank tests or .txt files) to Gemini with
the draft schema from docs/arquitetura.md (section 10) and reports, per material:
time, whether the JSON is valid, and whether every question of the original survived.
Each raw answer is saved as JSON next to the materials, for T03 and for the replay
provider (T22). The key is read from backend/.env and never printed.

Usage (inside backend/, with the venv active):
    python scripts/probe_gemini.py --list-models
    python scripts/probe_gemini.py "C:/path/to/tests" --model <model-name>
"""

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Literal

from google import genai
from google.genai import errors, types
from pydantic import BaseModel, ValidationError

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.config import get_settings  # noqa: E402

MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".heic": "image/heic",
    ".heif": "image/heif",
}
TIMEOUT_MS = 90_000
# Limits stay out of the schema sent to Gemini (it rejects long nested array limits
# with "too many states"); they are checked after the answer instead.
MAX_STEPS = 20
MAX_KEYWORDS_PER_STEP = 3


class AiKeyword(BaseModel):
    word: str
    searchTerm: str


class AiStep(BaseModel):
    kind: Literal["instruction", "question"]
    sourceNumber: str | None
    text: str
    options: list[str]
    keywords: list[AiKeyword]


class AiAdaptation(BaseModel):
    title: str
    objective: str
    transcription: str
    sourceQuestions: list[str]
    teacherNotes: list[str]
    steps: list[AiStep]


PROMPT = """Você adapta materiais escolares para um aluno com autismo (TEA).
Tipo de material: prova.

Perfil do aluno: lê pouco; precisa de passo a passo; sensível a excesso visual.
Observações: TEA nível 1.

Faça, nesta ordem:
1. Em "transcription", transcreva o texto do material como está.
2. Em "sourceQuestions", liste os números das questões do original (por exemplo "1", "2", "4a").
3. Em "steps", escreva a versão adaptada:
   - frases curtas e palavras do dia a dia; mantenha os termos da disciplina;
   - enunciado com mais de uma ação vira etapas separadas;
   - cada questão é um passo "question" com "sourceNumber" igual ao número do original;
   - instruções gerais são passos "instruction" com "sourceNumber" nulo e "options" vazio.
4. Regras de prova, obrigatórias:
   - mantenha TODAS as questões e TODAS as alternativas, simplificando só o texto;
   - não acrescente conteúdo;
   - não destaque, não ilustre e não sugira a resposta;
   - "keywords" só com palavras do enunciado, nunca das alternativas;
   - no máximo 1 palavra-chave por passo (o aluno é sensível a excesso visual).
5. Em cada palavra-chave, "word" é a palavra exatamente como aparece no texto do passo, e
   "searchTerm" é a forma mais simples e concreta para buscar um pictograma (verbo no
   infinitivo, substantivo no singular).
6. Em "teacherNotes", diga em frases curtas o que você simplificou, juntou ou dividiu.
Se não conseguir ler o material, devolva "transcription" vazio e "steps" vazio."""


def build_parts(path: Path) -> list[types.Part]:
    if path.suffix.lower() == ".txt":
        text = path.read_text(encoding="utf-8")
        return [types.Part.from_text(text=f"{PROMPT}\n\nMaterial:\n{text}")]
    mime_type = MIME_TYPES[path.suffix.lower()]
    image = types.Part.from_bytes(data=path.read_bytes(), mime_type=mime_type)
    return [types.Part.from_text(text=PROMPT), image]


def check(adaptation: AiAdaptation) -> dict[str, object]:
    questions = [s for s in adaptation.steps if s.kind == "question"]
    covered = {s.sourceNumber for s in questions}
    missing = [n for n in adaptation.sourceQuestions if n not in covered]
    keywords_not_in_text = [
        k.word for s in adaptation.steps for k in s.keywords if k.word.lower() not in s.text.lower()
    ]
    return {
        "steps": len(adaptation.steps),
        "source_questions": len(adaptation.sourceQuestions),
        "missing_questions": missing,
        "options_total": sum(len(s.options) for s in questions),
        "keywords_not_in_text": keywords_not_in_text,
        "over_limits": len(adaptation.steps) > MAX_STEPS
        or any(len(s.keywords) > MAX_KEYWORDS_PER_STEP for s in adaptation.steps),
    }


def probe(client: genai.Client, model: str, path: Path, out_dir: Path) -> dict[str, object]:
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_json_schema=AiAdaptation.model_json_schema(),
        temperature=0.2,
    )
    started = time.perf_counter()
    try:
        response = client.models.generate_content(
            model=model, contents=build_parts(path), config=config
        )
    except errors.APIError as error:
        return {"file": path.name, "error": f"{error.code} {(error.message or '')[:200]}"}
    seconds = round(time.perf_counter() - started, 1)
    raw = response.text or ""
    (out_dir / f"{path.stem}.json").write_text(raw, encoding="utf-8")
    result: dict[str, object] = {"file": path.name, "seconds": seconds}
    usage = response.usage_metadata
    if usage:
        result["tokens_in"] = usage.prompt_token_count
        result["tokens_out"] = usage.candidates_token_count
    try:
        result.update(check(AiAdaptation.model_validate_json(raw)))
        result["valid"] = True
    except ValidationError as error:
        result["valid"] = False
        result["error"] = f"{error.error_count()} erro(s) de formato"
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="T00: prova rápida do Gemini")
    parser.add_argument("folder", nargs="?", type=Path, help="pasta com fotos ou .txt")
    parser.add_argument("--model", help="nome do modelo, conferido no AI Studio")
    parser.add_argument("--list-models", action="store_true", help="lista os modelos")
    args = parser.parse_args()

    settings = get_settings()
    if not settings.gemini_api_key:
        sys.exit("Falta GEMINI_API_KEY no backend/.env.")
    client = genai.Client(
        api_key=settings.gemini_api_key, http_options=types.HttpOptions(timeout=TIMEOUT_MS)
    )

    if args.list_models:
        for model in client.models.list():
            if "generateContent" in (model.supported_actions or []):
                print(model.name)
        return

    model = args.model or settings.gemini_model
    if not args.folder or not model:
        sys.exit("Informe a pasta e o modelo (--model ou GEMINI_MODEL no .env).")
    files = sorted(p for p in args.folder.iterdir() if p.suffix.lower() in {*MIME_TYPES, ".txt"})
    out_dir = args.folder / "resultados-t00"
    out_dir.mkdir(exist_ok=True)

    print(f"Modelo: {model} | materiais: {len(files)}\n")
    results = [probe(client, model, path, out_dir) for path in files]
    for result in results:
        print(json.dumps(result, ensure_ascii=False))
    (out_dir / "resumo.json").write_text(
        json.dumps({"model": model, "results": results}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nRespostas e resumo salvos em: {out_dir}")


if __name__ == "__main__":
    main()
