# Tela — Adapta Aí

React + TypeScript + Tailwind, organizada por funcionalidade (ver `docs/arquitetura.md`,
seções 3 e 4). Node 22.

## Preparar (uma vez)

Dentro da pasta `frontend/`:

```bash
npm install
```

```bash
cp .env.example .env
```

O `.env` diz onde está o servidor (`VITE_API_URL`, padrão `http://localhost:8000`).

## Rodar

Com o servidor rodando (ver `backend/README.md`):

```bash
npm run dev
```

Abra http://localhost:5173. Na página inicial, o selo "Servidor conectado" mostra que a tela
fala com o servidor.

## Conferir

```bash
npm run lint
```

```bash
npm run format:check
```

```bash
npm run build
```

O `lint` também cobra a arquitetura: uma funcionalidade não importa de outra, só
`shared/api` chama o servidor e só `shared/storage` usa o IndexedDB.

## Pastas

| Pasta                      | O que tem                                          |
| -------------------------- | -------------------------------------------------- |
| `src/App.tsx`              | Rotas (React Router)                               |
| `src/pages/`               | Uma página por endereço; só junta funcionalidades  |
| `src/features/adaptation/` | Enviar material e escolher slides                  |
| `src/features/sheet/`      | Folha adaptada, edição e impressão                 |
| `src/features/profiles/`   | Perfis de aluno                                    |
| `src/features/history/`    | Histórico                                          |
| `src/shared/api/`          | Cliente do servidor                                |
| `src/shared/types/`        | Tipos do contrato (iguais aos do servidor)         |
| `src/shared/fixtures/`     | Exemplo do contrato, para trabalhar sem o servidor |
| `src/shared/ui/`           | Componentes genéricos                              |

## Versões

O TypeScript está fixado na 6.0: o template do Vite veio com o 7.0, mas o
`typescript-eslint` ainda só suporta versões abaixo de 6.1.
