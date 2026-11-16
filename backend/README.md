# Servidor — Adapta Aí

FastAPI em camadas (ver `docs/arquitetura.md`, seções 3 e 4). Python 3.13.

## Preparar (uma vez)

Dentro da pasta `backend/`:

```bash
python -m venv .venv
```

Ative o ambiente:

- PowerShell: `.venv\Scripts\Activate.ps1`
- Git Bash: `source .venv/Scripts/activate`
- Linux/macOS: `source .venv/bin/activate`

Instale as dependências e crie o `.env`:

```bash
pip install -r requirements.txt
```

```bash
cp .env.example .env
```

Preencha o `.env`. Sem `GEMINI_API_KEY`, o servidor usa a IA simulada.

## Rodar

```bash
uvicorn app.main:app --reload
```

Abra http://localhost:8000/health. A resposta deve ser `{"status": "ok"}`.
A documentação automática das rotas fica em http://localhost:8000/docs.

## Testar e padronizar

```bash
pytest
```

```bash
ruff check .
```

```bash
ruff format .
```

Os testes não usam a internet nem a chave real.

## Pastas

| Pasta | Camada | O que tem |
|---|---|---|
| `app/main.py` | montagem | cria o app e escolhe os provedores |
| `app/config.py` | montagem | lê as variáveis de ambiente |
| `app/api/` | 1 | rotas |
| `app/services/` | 2 | regras |
| `app/ai_providers/` | 3 | interface de IA e implementações |
| `app/pictogram_providers/` | 3 | interface de pictogramas e implementações |
| `app/readers/` | 3 | leitura de pptx, imagem e texto |
| `app/models/` | todas | formato dos dados |
| `tests/` | — | testes com pytest |
