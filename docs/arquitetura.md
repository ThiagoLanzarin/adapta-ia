# Adapta Aí — Arquitetura

> Documento da fase 2. Diz **como** o sistema é organizado.
> O que ele faz está em [especificacao.md](especificacao.md).
> Decidido pelo grupo em 15/11/2026 e revisado em 16/11/2026. O que falta está em
> [Pontos em aberto](#pontos-em-aberto).

## 1. Visão geral

### Estilo de arquitetura

**Cliente-servidor, com o servidor em camadas (arquitetura em camadas, *layered*) e a tela
organizada por funcionalidade.**

| Parte | Estilo | Em uma frase |
|---|---|---|
| Sistema | Cliente-servidor | O navegador mostra e guarda; o servidor processa e não guarda nada |
| Servidor | Em camadas (3 camadas + modelos) | Apresentação → regras → acesso externo; cada camada só chama a de baixo |
| Serviços externos | Interface + implementações trocáveis (padrão Adapter/Strategy) | As regras falam com "uma IA" e "um banco de pictogramas", sem saber qual |
| Tela | Por funcionalidade (*feature-based*) | Cada funcionalidade numa pasta; o que é comum fica em `shared` |

Por que camadas, e não hexagonal ou microsserviços: é o estilo mais simples que separa
regra de detalhe técnico, o grupo já conhece, e o sistema tem um único fluxo principal.
A única ideia da hexagonal que usamos é a interface na frente da IA e do ARASAAC, porque
ela é necessária para trocar de provedor e para testar sem internet.

Obs.: "pirâmide" costuma se referir à pirâmide de testes (muitos testes de unidade, poucos de
ponta a ponta), não a um estilo de arquitetura. Os nossos testes seguem essa ideia: muitos
testes das regras com a IA simulada e conferência manual da tela.

### Diagrama

```
NAVEGADOR (React + TypeScript)
  telas, edição da folha, perfis, histórico, impressão
  reduz a foto antes de enviar
        |
        |  JSON por HTTP (imagem em multipart)
        v
SERVIDOR (Python + FastAPI)
  lê o arquivo -> chama a IA -> valida -> busca pictogramas -> confere as questões
        |                                  |
        v                                  v
     Gemini                             ARASAAC
```

- O navegador nunca fala direto com a IA. A chave fica só no servidor.
- O servidor não guarda nada. Perfis e histórico ficam no navegador do professor.
- O apelido do perfil nunca sai do navegador.

## 2. Tecnologias

| Parte | Tecnologia | Para quê |
|---|---|---|
| Tela | Vite | Monta e serve o projeto |
| Tela | React | Telas e componentes |
| Tela | TypeScript | Tipos |
| Tela | Tailwind CSS | Visual |
| Tela | React Router | Páginas com endereço próprio |
| Tela | idb | Acesso simples ao IndexedDB (perfis e histórico) |
| Tela | ESLint + Prettier | Padronização do código |
| Servidor | FastAPI | Rotas HTTP |
| Servidor | Uvicorn | Roda o servidor |
| Servidor | Pydantic | Formato dos dados |
| Servidor | python-multipart | Recebe arquivos enviados |
| Servidor | python-pptx | Lê o PowerPoint |
| Servidor | google-genai | SDK oficial do Gemini |
| Servidor | httpx | Chama a API do ARASAAC |
| Servidor | pytest | Testes |
| Servidor | Ruff | Padronização do código |

- Dependências do servidor: `venv` + `requirements.txt`.
- Dependências da tela: `npm`.
- Qualquer biblioteca fora desta lista só entra com aprovação do grupo.
- As versões são conferidas no momento da instalação.

**Cuidados na instalação** (muitos tutoriais estão desatualizados; conferir na hora):

- Gemini: usar `google-genai`. Não usar o pacote antigo `google-generativeai`.
- Tailwind: se a versão instalada for a 4, a configuração usa o plugin `@tailwindcss/vite`,
  e não o `tailwind.config.js` dos tutoriais da versão 3.
- React Router: usar o modo declarativo (`<BrowserRouter>` e `<Routes>`), não o
  "framework mode".
- TypeScript: fixado na 6.0 (T02). O template do Vite veio com o 7.0, mas o
  `typescript-eslint` só suporta versões abaixo de 6.1. O template também troca o ESLint pelo
  oxlint; mantivemos o ESLint, que é o aprovado.

## 3. Estrutura de pastas

Tela organizada por funcionalidade; servidor organizado por camada. Nomes em inglês.

```
adapta-ia/
  CLAUDE.md                regras de trabalho da IA
  docs/
    constituicao.md        princípios (Spec-Driven Development)
    especificacao.md       o que o sistema faz: escopo e requisitos
    specs/                 uma spec por funcionalidade, com critérios de aceite
    arquitetura.md         este documento (o plano técnico)
    tarefas.md             lista de tarefas e quem está em cada uma
    pesquisa-t00.md        resultado do teste do Gemini real (research.md)
    roadmap.md             etapas até a entrega e V2
    contrato-exemplo.json  exemplo do contrato, validado por teste (criado na T03)
  frontend/
    src/
      App.tsx              rotas (React Router)
      pages/               uma página por endereço; só junta funcionalidades
      features/
        adaptation/        enviar material, escolher slides
        sheet/             folha adaptada, edição, impressão
        profiles/          perfis de aluno
        history/           salvar, buscar, reabrir
      shared/              api (cliente), types (contrato), fixtures, ui, storage
  backend/
    app/
      main.py              ponto de montagem: cria o app e escolhe os provedores
      config.py            lê as variáveis de ambiente
      api/                 camada 1: rotas, só recebem e respondem
      services/            camada 2: regras (adaptar, pictogramas, conferir questões)
      ai_providers/        camada 3: interface (base.py), erros, texto do pedido (prompt.py),
                           IA simulada (fake.py); Gemini e replay nas T05 e T22
      pictogram_providers/ camada 3: interface de pictogramas + ARASAAC e simulado
      readers/             camada 3: pptx, imagem, texto
      models/              formato dos dados, usado por todas as camadas
    tests/
    requirements.txt
```

`pictogram_providers/` foi acrescentada em 16/11/2026: antes, o acesso ao ARASAAC não tinha
camada definida e ficaria dentro de `services`, misturando regra com HTTP.

Os nomes em inglês foram aprovados pelo grupo em 15/11/2026.

## 4. Camadas e quem pode chamar quem

### Servidor

```
            main.py (monta tudo e escolhe os provedores pelo .env)
               |
Camada 1    api/                      recebe, valida o formato, responde
               |
Camada 2    services/                 regras do sistema
               |
Camada 3    ai_providers/   pictogram_providers/   readers/
               |                 |
            Gemini            ARASAAC

models/ é usado por todas as camadas
```

| Camada | Pode chamar | Não pode |
|---|---|---|
| `api` | `services`, `models` | chamar provedor ou leitor direto; ter regra |
| `services` | interfaces de `ai_providers` e `pictogram_providers`, `readers`, `models` | importar Gemini, ARASAAC, `httpx` ou FastAPI |
| `ai_providers`, `pictogram_providers`, `readers` | `models` e a biblioteca externa | chamar `services` ou `api` |
| `models` | só o Pydantic | importar qualquer outra camada |

- `api`: recebe o pedido, valida o formato, chama um serviço e devolve a resposta. Sem regra.
- `services`: as regras do sistema. Recebem os provedores prontos, pelo construtor ou pelo
  `Depends` do FastAPI. Não sabem qual provedor está ligado.
- `ai_providers` e `pictogram_providers`: cada uma tem a interface (o que o serviço externo
  precisa saber fazer) e as implementações. Trocar de provedor é escrever outra
  implementação da mesma interface.
- `readers`: transformam o material enviado (pptx, imagem, texto) em um formato único.
- `models`: o formato dos dados que entram e saem.
- **As regras desta tabela são conferidas por teste** (`backend/tests/test_architecture.py`):
  um import proibido, ou a palavra "Gemini" em `services`, faz o `pytest` falhar.
- `main.py`: o único lugar que sabe qual implementação usar. É o que torna a troca de
  provedor uma mudança de `.env`, e não de código.

### Tela

```
pages (rotas do React Router)
   |
features/  adaptation  sheet  profiles  history     (não importam umas das outras)
   |
shared/    api (cliente HTTP)  storage (IndexedDB)  types (contrato)  ui (componentes)
```

- Um componente não chama a API direto. Usa o cliente em `shared/api`.
- Um componente não usa o IndexedDB direto. Usa `shared/storage`.
- Uma funcionalidade não importa de dentro de outra. O que duas precisam vai para `shared`.
- Essas três regras são **cobradas pelo ESLint** (`frontend/eslint.config.js`): import entre
  funcionalidades, `fetch` e `indexedDB` fora de `shared`, e o pacote `idb` fora de
  `shared/storage` dão erro no `npm run lint`.

## 5. Caminho de uma adaptação

1. O professor escolhe o tipo de material (prova, atividade ou conteúdo) e o perfil.
2. Ele envia uma imagem, um PowerPoint ou cola um texto. A imagem é reduzida no navegador
   antes do envio (seção 6).
3. Se for PowerPoint, o servidor extrai o texto de cada slide e devolve a lista. O professor
   marca até 5. Os slides marcados seguem juntos, como **uma** adaptação.
4. A tela envia o material, o tipo e o perfil sem o apelido.
5. O servidor pede à IA a versão adaptada, em formato estruturado (seção 7). Os slides marcados
   vão numa só chamada.
6. O servidor valida a resposta, busca no ARASAAC os pictogramas pela palavra de busca de
   cada palavra-chave e confere se toda questão do original aparece na adaptação.
7. A tela mostra o original (com o texto lido pela IA) e a adaptada lado a lado, mais o quadro
   "O que mudou" e os avisos. O professor edita, troca pictogramas ou pede nova versão.
8. A adaptação fica salva no navegador. O professor imprime ou salva em PDF pela impressão.

Como o PowerPoint é lido por extração, o "original" de um slide é o texto extraído, e não
a imagem fiel do slide.

## 6. Decisões de montagem

| Tema | Decisão |
|---|---|
| IA | Faixa gratuita do Gemini; provedor trocável pela camada `ai_providers`. O nome do modelo vem da variável de ambiente `GEMINI_MODEL`. Escolhido na T00: `gemini-3.5-flash` (ver [pesquisa-t00.md](pesquisa-t00.md)); sem troca automática para modelo mais leve, porque o `flash-lite` mudou conteúdo cobrado |
| PowerPoint | Extração no nosso servidor, **só do texto** na E1 (figuras na V2). O Gemini aceita `.pptx` direto, mas o converte em texto, não permite listar slides para escolher e prenderia o sistema a esse provedor |
| Imagens aceitas | PNG, JPEG, WEBP, HEIC e HEIF (os formatos que o Gemini recebe) |
| Redução da imagem | No navegador, com canvas e sem biblioteca: lado maior com até 1600 px, JPEG com qualidade 0,85. Resolve o limite de 20 MB do Gemini, o tempo de envio e o espaço no IndexedDB, e apaga os metadados (como o GPS). HEIC/HEIF segue sem redução, porque o Chrome não abre esse formato no canvas |
| Tamanho máximo | 20 MB por arquivo enviado, conferido também no servidor |
| Figuras do original | A IA devolve a caixa da figura na foto; a **tela** recorta a figura da foto reduzida (canvas, sem biblioteca) e a coloca junto da questão. O servidor não mexe em imagem. Sem foto ou sem caixa, aviso `NEEDS_FIGURE` |
| Pictogramas | A IA sugere a palavra de busca; o servidor busca no ARASAAC (primeiro pela palavra de busca, depois pela palavra exibida), em paralelo e com cache na memória. A IA nunca escolhe o número do pictograma. A tela monta o endereço da imagem a partir do número |
| Navegação | Páginas com endereço próprio |
| Armazenamento | IndexedDB no navegador, guardando original e adaptada |
| Preto e branco | Parâmetro `color=false` da API do ARASAAC. É estado da tela, não dado da adaptação |
| PDF | Impressão do navegador, com folha de estilo A4 |
| Segredos | Arquivo `.env`, fora do Git. Nenhuma chave no código |
| CORS | O servidor só aceita pedidos da origem da tela (variável de ambiente) |
| Hospedagem | Decidido em 16/11: Render, com a tela como site estático e o servidor como web service, ambos no plano gratuito. A chave fica só nas variáveis de ambiente do web service. O plano gratuito dorme após 15 minutos sem acesso e demora para acordar: abrir `/health` antes da apresentação |

### Publicação no Render (T20a, 16/11/2026)

| | Servidor | Tela |
|---|---|---|
| Endereço | https://adapta-ia.onrender.com | https://adapta-ai-d5ax.onrender.com |
| Tipo | Web Service, plano Free, Python 3 | Static Site |
| Pasta | `backend` | `frontend` |
| Build | `pip install -r requirements.txt` | `npm ci && npm run build` (publica `dist`) |
| Início | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | — |
| Variáveis | `PYTHON_VERSION`, `AI_PROVIDER`, `GEMINI_MODEL`, `GEMINI_API_KEY` (segredo), `ALLOWED_ORIGIN` = endereço da tela | `NODE_VERSION`, `VITE_API_URL` = endereço do servidor |
| Regra | Verificação de saúde em `/health` | Reescrita `/*` → `/index.html` |

- Os serviços estão na conta do Render do membro que criou a chave do Gemini. A chave só
  existe nas variáveis do servidor, no Render; nunca no GitHub.
- O repositório foi ligado pelo **link público** (o dono, `eiq03`, não precisou autorizar).
  Por isso **não há deploy automático**: depois de cada merge na `main`, abrir cada serviço →
  **Manual Deploy** → **Deploy latest commit**. Se o dono instalar o app do Render no GitHub,
  passa a ser automático.
- `VITE_API_URL` entra na hora do build da tela: se mudar, a tela precisa de novo deploy.
- Conferido: `/health` responde; o servidor só aceita pedidos da origem da tela (CORS); as
  rotas da tela abrem direto; o selo da tela mostra "Servidor conectado".

## 7. Saída da IA e falhas

### Validação

```
Gemini (resposta em JSON com schema) -> valida com Pydantic -> regras do serviço
   | inválido                               | inválido            |
   v                                        v                     v
 1 nova tentativa, com o erro no pedido                remove palavra-chave cuja palavra
   | falhou de novo                                    não aparece no texto da etapa;
   v                                                   etapa sem pictograma é aceita;
 erro AI_INVALID                                       questão faltando vira aviso
```

- A resposta da IA é pedida em JSON com schema, pela saída estruturada do SDK
  (`response_json_schema`), e validada de novo com Pydantic.
- O schema enviado à IA **não tem limites de tamanho de lista**: o Gemini recusou "até 20
  etapas" e "até 3 palavras-chave" com o erro "estados demais" (T00). Os limites (20 etapas;
  palavras-chave conforme R-001-04) são conferidos pelo servidor depois da resposta.
- O texto do pedido à IA (prompt) fica num arquivo próprio em `ai_providers`, versionado.
- Regras de prova no pedido: manter todas as questões e alternativas; numerar como no
  original; não acrescentar conteúdo; não destacar nem ilustrar a resposta; palavras-chave só
  no enunciado.

### Falhas

| Erro | Nova tentativa | Código devolvido |
|---|---|---|
| Limite da cota (429) | Não | `AI_QUOTA` |
| IA sobrecarregada ou fora do ar (5xx) | 1 vez, depois de 2 s | `AI_UNAVAILABLE` |
| Tempo esgotado (90 s; ver R-001-09) | Não: uma segunda espera de 90 s passaria do limite da tela (100 s) | `AI_TIMEOUT` |
| Resposta fora do formato | 1 vez (acima) | `AI_INVALID` |
| Bloqueio de segurança da IA | Não | `AI_BLOCKED` |

### Provedores

| Provedor | Uso | Como liga |
|---|---|---|
| `gemini` | Uso real | `AI_PROVIDER=gemini` e a chave no `.env` |
| `fake` | Testes automáticos; sem chave | `AI_PROVIDER=fake` (padrão sem chave) |
| `replay` | Reserva da apresentação: devolve respostas reais do Gemini gravadas no ensaio, procuradas por um resumo (hash) da entrada mais o perfil | `AI_PROVIDER=replay`. A tela mostra o selo "modo demonstração" |

## 8. Testes

- Servidor: testes automatizados nas regras (leitura de arquivo, montagem da adaptação,
  busca de pictograma, conferência das questões), com a IA simulada.
- Contrato: um teste do servidor valida o exemplo do contrato (seção 10).
- Tela: conferida à mão no navegador.

## 9. Git e GitHub

- Repositório único, com `frontend/` e `backend/`: https://github.com/eiq03/adapta-ia
- Um ramo por tarefa, com o nome no formato `tipo/tNN-descricao`.
  Exemplos: `feat/t03-upload-imagem`, `fix/t07-busca-pictograma`.
- Até o fim do projeto, a IA revisa e junta os pedidos sem esperar outra pessoa; no fim, o
  grupo revisa tudo à mão (decisão de 16/11/2026). Depois disso, volta a valer:
- O ramo entra na linha principal por pedido de revisão (pull request), depois que outra
  pessoa do grupo olhar.
- Mensagens de commit em português.
- `adapta-ai.html` (a página da proposta) fica fora do Git.

## 10. Contrato de dados

Fechado na T03 (16/11/2026), com o resultado da [pesquisa da T00](pesquisa-t00.md).
Nomes em camelCase no JSON. No Python, snake_case com `alias_generator=to_camel`, que já vem
no Pydantic. Modelos em `backend/app/models/`; tipos da tela em
`frontend/src/shared/types/contract.ts`.

### Pedido de adaptação

`POST /api/adaptations`, multipart, com:

- `materialType`: `"test"`, `"activity"` ou `"content"`.
- `profile`: JSON do perfil, **sem o apelido** (campo a mais é recusado com `INVALID_INPUT`).
- Exatamente uma destas: `file` (imagem), `text` (texto colado, até 20.000 caracteres) ou
  `slides` (JSON com 1 a 5 slides).

```json
{
  "profile": {
    "readsLittle": true,
    "needsStepByStep": true,
    "needsMoreImages": false,
    "sensitiveToVisualClutter": true,
    "easilyDistracted": false,
    "notes": "TEA nível 1. Gosta de dinossauros."
  },
  "slides": [{ "index": 2, "title": "Ciclo da água", "text": "..." }]
}
```

`notes` tem até 500 caracteres.

### Lista de slides

`POST /api/slides`, multipart com `file` (.pptx), devolve:

```json
{ "slides": [{ "index": 1, "title": "Ciclo da água", "text": "..." }] }
```

### O que a IA devolve (`AiAdaptation`, só dentro do servidor)

```json
{
  "title": "Prova de Língua Portuguesa",
  "objective": "Interpretar um texto informativo",
  "transcription": "Leia o texto para responder às questões 1 a 10 ...",
  "sourceQuestions": ["1", "2"],
  "teacherNotes": ["Omiti a instrução 'use caneta azul'."],
  "steps": [
    {
      "kind": "text",
      "sourceNumber": null,
      "text": "1º DE MAIO - DIA DO TRABALHO\n\nComemorado no dia 1º de maio, ...",
      "options": [],
      "keywords": [],
      "needsFigure": false,
      "figureBox": null
    }
  ]
}
```

- O schema enviado à IA **não tem limites de tamanho** (o Gemini recusa; ver seção 7). Os
  limites são conferidos pelo servidor.
- A IA não devolve número de pictograma.
- `figureBox` é `[ymin, xmin, ymax, xmax]`, de 0 a 1000, relativo à imagem enviada.

### Resposta da API (`Adaptation`)

O exemplo completo, validado por teste, está em
[contrato-exemplo.json](contrato-exemplo.json). Os números de pictograma e as caixas de figura
do exemplo são ilustrativos.

| Campo | Tipo | Regra |
|---|---|---|
| `schemaVersion` | `1` | Sobe quando o contrato mudar de forma incompatível |
| `materialType` | `"test" \| "activity" \| "content"` | O que o professor escolheu |
| `title`, `objective`, `transcription` | texto | `transcription` é o que a IA leu do original |
| `teacherNotes` | lista de textos | Quadro "O que mudou" |
| `warnings` | lista de `{ code, message }` | Gerados pelo servidor, não pela IA |
| `steps` | lista de 0 a 20 etapas | Na ordem da folha |

Etapa (`Step`):

| Campo | Tipo | Regra |
|---|---|---|
| `id` | texto | Gerado pelo servidor (`s1`, `s2`...), único |
| `kind` | `"instruction" \| "text" \| "question"` | `text` = texto de apoio |
| `sourceNumber` | texto ou `null` | Número da questão no original ("4a" vale); `null` fora de `question` |
| `text` | texto | O enunciado, a instrução ou o texto de apoio |
| `options` | lista de textos | Só em `question` |
| `keywords` | lista de 0 a 3 | Nunca em `text`. Máximo por perfil: R-001-04 |
| `needsFigure` | booleano | A etapa depende de uma figura do original |
| `figureBox` | 4 inteiros de 0 a 1000, ou `null` | Só quando `needsFigure`; início menor que o fim |

Palavra-chave (`Keyword`): `word` (como aparece no texto), `searchTerm` (o que foi buscado no
ARASAAC) e `pictogramId` (inteiro, ou `null` sem resultado).

Avisos (`code`):

| Código | Quando |
|---|---|
| `MISSING_QUESTION` | Um item de `sourceQuestions` não aparece em nenhum `sourceNumber` |
| `UNREADABLE` | A transcrição veio vazia (foto ilegível) |
| `NEEDS_FIGURE` | Etapa com `needsFigure` sem caixa válida, ou material que não é imagem |

### Nova versão a pedido (spec 005)

`POST /api/adaptations/revise`, JSON com `adaptation` (a atual, já editada), `profile`,
`materialType` e `instruction` (o pedido do professor, até 300 caracteres). Devolve uma
`Adaptation`.

### Pictogramas

`GET /api/pictograms?q=palavra` (1 a 50 caracteres) devolve
`{ "results": [{ "id": 7252 }] }`, com até 10 opções e a melhor primeiro.

### Erro (todas as rotas)

```json
{ "code": "AI_QUOTA", "message": "A IA gratuita atingiu o limite. Tente em alguns minutos." }
```

Códigos: `AI_QUOTA`, `AI_TIMEOUT`, `AI_UNAVAILABLE`, `AI_INVALID`, `AI_BLOCKED`,
`FILE_TOO_LARGE`, `FILE_TYPE`, `TOO_MANY_SLIDES`, `INVALID_INPUT`. A mensagem vem em
português, pronta para mostrar ao professor.

### Guardado só no navegador (IndexedDB)

- Perfil: `id`, `nickname`, as 5 opções de apoio e `notes`.
- Histórico: `id`, `name`, `createdAt`, `updatedAt`, a cópia do perfil usado, o original
  (imagem reduzida, texto ou slides) e a `Adaptation` com as edições. A imagem reduzida é
  usada para recortar as figuras de novo ao reabrir.

### Como tela e servidor ficam iguais

- Os tipos são escritos à mão dos dois lados (`backend/app/models/` e
  `frontend/src/shared/types/contract.ts`).
- O exemplo `docs/contrato-exemplo.json` é validado contra o modelo Pydantic por um teste.
  A tela usa uma cópia em `frontend/src/shared/fixtures/`, e outro teste confere que a cópia
  é igual ao original.
- Se o contrato mudar, muda o exemplo, e os testes mostram o que quebrou.
- Depois (V2): gerar os tipos da tela a partir do OpenAPI do FastAPI (exige biblioteca nova).

## Pontos em aberto

1. **Chave do Gemini.** Um membro cria a chave no Google AI Studio e confere os limites reais
   da faixa gratuita e qual modelo usar (`GEMINI_MODEL`).
2. **Foto grande.** Decidido em 16/11: redução no navegador (seção 6).
3. **Campos do contrato de dados.** Fechado na T03 (seção 10).
4. **Busca no ARASAAC.** Conferir, na documentação da API, qual rota de busca dá o melhor
   resultado em português (a busca simples ou a "melhor busca").
5. **Hospedagem.** Decidido e publicado no Render (seção 6, "Publicação no Render").
