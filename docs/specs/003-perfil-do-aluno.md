# 003 — Perfil do aluno

- **Estado:** aprovada (16/11/2026)
- **Requisitos:** RF-07, RF-08
- **Tarefas:** T18
- **Depende de:** spec 001 (o perfil é enviado no pedido de adaptação)
- **Se faltar tempo:** cai depois da spec 005. Sem ela, a tela de adaptação mostra as opções
  de apoio a cada vez (CA-001-26).

## Objetivo

O professor descreve uma vez as necessidades de apoio de cada aluno e reutiliza isso em
todas as adaptações.

## Fora do escopo

- Guardar perfis na nuvem ou levar para outro aparelho.
- Nome, foto ou dados que identifiquem o aluno.

## História

Como professor, crio um perfil com um apelido, as necessidades de apoio e as observações do
aluno, e escolho esse perfil ao adaptar uma prova.

## Critérios de aceite

- **CA-003-01** [manual] Crio um perfil com apelido, as 7 opções de apoio (lê pouco; precisa
  de passo a passo; precisa de mais imagens; sensível a excesso visual; se distrai fácil;
  interpreta a linguagem de forma literal; precisa de previsibilidade) e observações. Ele aparece na
  lista de perfis. Perfis salvos antes de 17/11 abrem com as duas opções novas desmarcadas.
- **CA-003-02** [manual] O campo de observações mostra a frase "Não escreva o nome do aluno.
  Pode escrever o diagnóstico e o que ajuda ele a aprender."
- **CA-003-03** [manual] Edito e apago um perfil. Apagar pede confirmação.
- **CA-003-04** [manual] Fecho e reabro o navegador: os perfis continuam lá.
- **CA-003-05** [manual] Na tela de adaptação, escolho um perfil e as opções dele vêm
  marcadas. Posso mudar as opções só para esta adaptação, sem alterar o perfil salvo.
- **CA-003-06** [manual] O pedido enviado ao servidor (aba de rede do navegador) não contém
  o apelido.
- **CA-003-07** [manual] O apelido é obrigatório e tem até 30 caracteres; as observações têm
  até 500 caracteres, com contador.
- **CA-003-08** [manual] (17/11) Na página de perfis, "Exportar perfis" baixa um arquivo com
  todos os perfis. Em outro navegador, "Importar perfis" com esse arquivo traz os perfis de
  volta: o de mesmo `id` é substituído e os outros ficam. Um arquivo que não é de perfis
  mostra "Este arquivo não é uma cópia de perfis do Adapta Aí. Escolha o arquivo exportado
  nesta página." e nada muda.

O lado do servidor (perfil sem apelido e uso das opções no pedido à IA) está nos critérios
CA-001-06, CA-001-09 e CA-001-14.

## Regras

- **R-003-01** O perfil fica só no navegador (IndexedDB).
- **R-003-02** Só as opções de apoio e as observações vão para o servidor.
- **R-003-03** Apagar um perfil não apaga as adaptações do histórico feitas com ele; elas
  guardam uma cópia do perfil usado (spec 007).
- **R-003-04** (17/11) Banco no servidor fica para a V2: exigiria login (P4) e levaria as
  observações, que podem ter diagnóstico, para fora do computador do professor (P3). Em vez
  disso, o professor exporta e importa os perfis num arquivo, feito e lido só no navegador.
  O arquivo leva só `id`, apelido, opções e observações; campo desconhecido é descartado e
  opção que falta vem desmarcada. A página avisa que o arquivo tem as observações dos alunos.
- **R-003-05** (17/11) Ao salvar perfis, a tela pede ao navegador armazenamento permanente
  (`navigator.storage.persist`), para os dados não serem apagados quando o disco enche. O
  navegador pode recusar; nada muda para o professor.

## Erros e casos de borda

| Situação | O que o professor vê |
|---|---|
| Nenhum perfil criado | Na tela de adaptação: "Crie um perfil ou marque as opções abaixo." |
| Navegador bloqueia o armazenamento (aba anônima, por exemplo) | "Este navegador não deixa salvar perfis. A adaptação funciona, mas o perfil não fica guardado." |

## Dados

- Arquitetura, seção 10: `profile` no pedido de adaptação.
- Guardado no navegador: `id`, `nickname`, as 7 opções e `notes`.

## Decisão de 17/11: opções de apoio novas

O grupo propôs 8 opções novas. Entraram 2, com efeito descrito em R-001-03:

| Opção proposta | Decisão | Motivo |
|---|---|---|
| Interpreta a linguagem de forma literal (proposta: "entende tudo ao pé da letra") | Entra | Só muda a forma do enunciado. Fontes: W3C COGA, padrão "Use Literal Language" (seção 4.4.4); National Autistic Society, guia de provas para professores [verificado em 17/11] |
| Precisa de previsibilidade (proposta: "fica ansioso sem saber o que vem") | Entra | Só forma. As fontes (National Autistic Society) tratam de ansiedade e previsibilidade [verificado em 17/11]; contar as questões é inferência do grupo, não está nelas |
| Deduzir o que não está escrito | Fica fora | Tornar explícito o implícito pode entregar a resposta (P1). Só o professor sabe se a questão avalia interpretação |
| Se perde com informação a mais | Já existe | "Se distrai fácil" já manda tirar informação que não é usada |
| Dificuldade com perguntas abertas | Fica fora | Virar múltipla escolha inventa alternativas, uma delas a resposta (P1) |
| Hiperlexia (perguntas de checagem) | Fica fora | Acrescenta questões e mexe no texto de apoio (P1, R-001-02). Talvez V2, só para conteúdo de aula |
| Escreve com dificuldade | V2 | Espaço de resposta por tipo pede mudança no contrato e na impressão; trocar escrever por marcar é o mesmo problema das perguntas abertas |
| Interesse do aluno (hiperfoco) | Fica fora na prova | Reescrever o cenário arrisca mudar dados da questão. O professor pode escrever o interesse nas observações. Talvez V2, só para atividade |
