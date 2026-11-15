# Adapta Aí — Tarefas

> Documento da fase 3. Lista o trabalho da entrega de 3 dias (E1), na ordem combinada.
> O que o sistema faz está em [especificacao.md](especificacao.md); como ele é organizado,
> em [arquitetura.md](arquitetura.md).

- **Entrega:** quarta-feira, 18/11/2026.
- **Ordem:** fatia fina primeiro. Cada fatia termina com algo que funciona e dá para mostrar.
- **Divisão:** próxima tarefa livre. Qualquer pessoa do grupo pega a próxima tarefa cujas
  dependências estejam concluídas.
- **Se faltar tempo:** a primeira a cair é a T18 (perfis de aluno).

## Como usar esta lista

1. Escolha uma tarefa com estado `livre` e com as dependências `concluída`.
2. Crie o ramo da tarefa (formato `tipo/tNN-descricao`).
3. No primeiro commit do ramo, escreva seu nome em **Responsável**, mude o **Estado** para
   `em andamento` e envie o ramo ao GitHub, para os outros verem.
4. Faça a tarefa seguindo as regras do `CLAUDE.md`.
5. Ao abrir o pedido de revisão, mude o estado para `em revisão`.
6. Quando o pedido for aprovado e juntado, o estado passa a `concluída`.

Os passos 3, 5 e 6 são uma proposta de como marcar; o grupo pode ajustar.

## Quadro

| Tarefa | Título | Fatia | Depende de | Responsável | Estado |
|---|---|---|---|---|---|
| T01 | Esqueleto do servidor | 1 | — | | livre |
| T02 | Esqueleto da tela | 1 | — | | livre |
| T03 | Formato dos dados | 1 | T01 | | livre |
| T04 | Contrato de IA, IA simulada e regra de adaptar | 1 | T03 | | livre |
| T06 | Pictogramas ARASAAC | 1 | T03 | | livre |
| T08a | Rota de adaptar: texto e imagem | 1 | T04, T06 | | livre |
| T10 | Enviar imagem e colar texto | 1 | T02, T08a | | livre |
| T12 | Folha adaptada ao lado do original | 1 | T10 | | livre |
| T05 | Provedor Gemini | 1 | T04 e a chave | | livre |
| T13 | Editar o texto da folha | 2 | T12 | | livre |
| T14 | Trocar e remover pictograma | 2 | T12, T06 | | livre |
| T16 | Colorido / preto e branco | 2 | T12 | | livre |
| T17 | Imprimir e baixar PDF | 2 | T12 | | livre |
| T07 | Leitor de PowerPoint | 3 | T03 | | livre |
| T08b | Rota de adaptar: slides | 3 | T07, T08a | | livre |
| T11 | Enviar PowerPoint e escolher slides | 3 | T10, T08b | | livre |
| T19 | Histórico | 4 | T12 | | livre |
| T18 | Perfis de aluno | 4 | T10 | | livre |
| T09 | Nova versão a pedido (servidor) | 5 | T08a | | livre |
| T15 | Nova versão a pedido (tela) | 5 | T12, T09 | | livre |
| T20 | Publicar | Entrega | Fatia 1 | | livre |
| T21 | Testar e roteiro da demonstração | Entrega | Tudo que for entregue | | livre |

Estados: `livre`, `em andamento`, `em revisão`, `concluída`.

## Detalhe das tarefas

Os critérios de "pronto quando" são rascunho da IA. Cada um é confirmado com o grupo no
início da tarefa.

### Fatia 1 — Ponta a ponta: texto ou imagem vira folha

#### T01 — Esqueleto do servidor
- **Objetivo:** servidor FastAPI que sobe, com estrutura de pastas, testes e configuração.
- **Pastas:** `backend/`
- **Pronto quando:** o servidor sobe localmente e responde em uma rota de verificação;
  `pytest` roda um teste; existe `.env.example`; o Ruff passa; há instruções de como rodar.

#### T02 — Esqueleto da tela
- **Objetivo:** projeto React com TypeScript, Tailwind e as páginas vazias.
- **Pastas:** `frontend/`
- **Pronto quando:** o projeto sobe localmente; existem as páginas de início, adaptação,
  histórico e perfis, cada uma com seu endereço; ESLint e Prettier passam; existe o cliente
  da API em `shared`.

#### T03 — Formato dos dados
- **Objetivo:** fechar os campos do contrato (material, perfil, adaptação, etapa,
  palavra-chave) e declará-los no servidor e na tela.
- **Pastas:** `backend/app/models/`, `frontend/src/shared/`
- **Pronto quando:** os campos foram confirmados com o grupo; os modelos existem dos dois
  lados com os mesmos nomes; a seção 9 da arquitetura está atualizada.

#### T04 — Contrato de IA, IA simulada e regra de adaptar
- **Objetivo:** definir o que qualquer provedor de IA precisa saber fazer, criar um provedor
  simulado para testes e escrever a regra que monta a adaptação.
- **Pastas:** `backend/app/ai_providers/`, `backend/app/services/`, `backend/tests/`
- **Requisitos:** RF-04, RF-05, RF-08
- **Pronto quando:** a regra de adaptar funciona com a IA simulada e tem testes; nenhum
  arquivo de `services` menciona o Gemini.

#### T06 — Pictogramas ARASAAC
- **Objetivo:** buscar pictogramas por palavra em português e devolver alternativas.
- **Pastas:** `backend/app/services/`, `backend/app/api/`, `backend/tests/`
- **Requisitos:** RF-06, e a parte de servidor de RF-11 e RF-13
- **Pronto quando:** a busca devolve a melhor opção e as alternativas; palavra sem resultado
  não causa erro; os testes não dependem da internet.

#### T08a — Rota de adaptar: texto e imagem
- **Objetivo:** rota que recebe texto colado ou imagem, mais o perfil, e devolve a adaptação
  com pictogramas.
- **Pastas:** `backend/app/api/`, `backend/app/readers/`, `backend/tests/`
- **Requisitos:** RF-01, RF-19
- **Pronto quando:** a rota funciona com a IA simulada; recusa arquivo acima de 20 MB e
  formato não aceito com mensagem clara; tem testes.
- **A decidir na tarefa:** o que fazer com foto próxima de 20 MB (ponto em aberto da
  arquitetura).

#### T10 — Enviar imagem e colar texto
- **Objetivo:** tela em que o professor envia uma imagem ou cola um texto e pede a adaptação.
- **Pastas:** `frontend/src/features/adaptation/`
- **Requisitos:** RF-01, RF-19
- **Pronto quando:** o professor envia imagem ou texto, vê o andamento e recebe o resultado
  ou uma mensagem de erro compreensível.

#### T12 — Folha adaptada ao lado do original
- **Objetivo:** mostrar o original e a folha adaptada lado a lado, com etapas e pictogramas.
- **Pastas:** `frontend/src/features/sheet/`
- **Requisitos:** RF-09
- **Pronto quando:** a folha mostra título, etapas numeradas e pictogramas com legenda, ao
  lado do original; funciona em tela de computador.

#### T05 — Provedor Gemini
- **Objetivo:** implementar o contrato de IA usando o Gemini, para texto e imagem.
- **Pastas:** `backend/app/ai_providers/`
- **Depende de:** um membro ter criado a chave no Google AI Studio.
- **Pronto quando:** com a chave no `.env`, uma adaptação real funciona de ponta a ponta;
  sem a chave, o sistema segue funcionando com a IA simulada; a chave não aparece no código
  nem no Git.

### Fatia 2 — Revisar e levar para a sala

#### T13 — Editar o texto da folha
- **Pastas:** `frontend/src/features/sheet/`
- **Requisitos:** RF-10
- **Pronto quando:** o professor clica em uma frase, reescreve e a mudança permanece na folha.

#### T14 — Trocar e remover pictograma
- **Pastas:** `frontend/src/features/sheet/`
- **Requisitos:** RF-11
- **Pronto quando:** ao clicar em um pictograma, aparecem as alternativas do ARASAAC para
  aquela palavra; o professor escolhe outra ou remove a imagem.

#### T16 — Colorido / preto e branco
- **Pastas:** `frontend/src/features/sheet/`
- **Requisitos:** RF-13
- **Pronto quando:** um botão alterna todos os pictogramas da folha entre as duas versões.

#### T17 — Imprimir e baixar PDF
- **Pastas:** `frontend/src/features/sheet/`
- **Requisitos:** RF-14, RF-15, RF-16
- **Pronto quando:** a impressão sai em A4 só com a folha adaptada; o botão de PDF abre a
  impressão do navegador; o crédito do ARASAAC aparece no rodapé.

### Fatia 3 — PowerPoint

#### T07 — Leitor de PowerPoint
- **Objetivo:** extrair texto e figuras de cada slide de um `.pptx`.
- **Pastas:** `backend/app/readers/`, `backend/tests/`
- **Requisitos:** RF-02
- **Pronto quando:** dado um `.pptx`, o leitor devolve a lista de slides com título, texto e
  figuras; arquivo inválido gera erro claro; tem testes com um arquivo de exemplo.

#### T08b — Rota de adaptar: slides
- **Pastas:** `backend/app/api/`, `backend/tests/`
- **Requisitos:** RF-02, RF-03
- **Pronto quando:** uma rota devolve a lista de slides do arquivo enviado; a rota de adaptar
  aceita os slides escolhidos e recusa mais de 5; tem testes.

#### T11 — Enviar PowerPoint e escolher slides
- **Pastas:** `frontend/src/features/adaptation/`
- **Requisitos:** RF-02, RF-03
- **Pronto quando:** o professor envia o arquivo, vê a lista de slides por título e texto,
  marca até 5 e recebe as folhas adaptadas.

### Fatia 4 — Guardar

#### T19 — Histórico
- **Pastas:** `frontend/src/features/history/`
- **Requisitos:** RF-17
- **Pronto quando:** cada adaptação é salva no navegador com original e adaptada; o
  professor dá nome, busca pelo nome, reabre para editar e apaga.

#### T18 — Perfis de aluno
- **Pastas:** `frontend/src/features/profiles/`
- **Requisitos:** RF-07, RF-08
- **Pronto quando:** o professor cria, edita e apaga perfis com apelido, opções de apoio e
  observações; escolhe um perfil ao adaptar.
- **Se não der tempo:** a tela de adaptação mantém as três opções de apoio marcadas a cada vez.

### Fatia 5 — IA a pedido

#### T09 — Nova versão a pedido (servidor)
- **Pastas:** `backend/app/services/`, `backend/app/api/`, `backend/tests/`
- **Requisitos:** RF-12
- **Pronto quando:** a rota recebe a adaptação atual e o pedido do professor e devolve uma
  nova versão; tem testes com a IA simulada.

#### T15 — Nova versão a pedido (tela)
- **Pastas:** `frontend/src/features/sheet/`
- **Requisitos:** RF-12
- **Pronto quando:** o professor escreve um pedido e a folha é substituída pela nova versão.
- **A decidir na tarefa:** o que acontece com as edições manuais já feitas.

### Entrega

#### T20 — Publicar
- **Objetivo:** pesquisar os planos gratuitos atuais, escolher a hospedagem com o grupo e
  publicar o sistema.
- **Pronto quando:** o sistema abre em um endereço público e uma adaptação real funciona nele;
  a chave da IA está configurada só no servidor.

#### T21 — Testar e roteiro da demonstração
- **Objetivo:** testar com materiais reais e preparar a apresentação.
- **Pronto quando:** o grupo testou com pelo menos uma foto, um PowerPoint e um texto reais;
  os problemas encontrados foram registrados; existe um roteiro da demonstração.
