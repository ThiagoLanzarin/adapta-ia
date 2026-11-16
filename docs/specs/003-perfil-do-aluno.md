# 003 — Perfil do aluno

- **Estado:** aprovada (16/11/2026)
- **Requisitos:** RF-07, RF-08
- **Tarefas:** T18
- **Depende de:** spec 001 (o perfil é enviado no pedido de adaptação)
- **Se faltar tempo:** cai depois da spec 005. Sem ela, a tela de adaptação mostra as opções
  de apoio a cada vez (CA-001-25).

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

- **CA-003-01** [manual] Crio um perfil com apelido, as 5 opções de apoio (lê pouco; precisa
  de passo a passo; precisa de mais imagens; sensível a excesso visual; se distrai fácil) e
  observações. Ele aparece na lista de perfis.
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

O lado do servidor (perfil sem apelido e uso das opções no pedido à IA) está nos critérios
CA-001-06, CA-001-09 e CA-001-14.

## Regras

- **R-003-01** O perfil fica só no navegador (IndexedDB).
- **R-003-02** Só as opções de apoio e as observações vão para o servidor.
- **R-003-03** Apagar um perfil não apaga as adaptações do histórico feitas com ele; elas
  guardam uma cópia do perfil usado (spec 007).

## Erros e casos de borda

| Situação | O que o professor vê |
|---|---|
| Nenhum perfil criado | Na tela de adaptação: "Crie um perfil ou marque as opções abaixo." |
| Navegador bloqueia o armazenamento (aba anônima, por exemplo) | "Este navegador não deixa salvar perfis. A adaptação funciona, mas o perfil não fica guardado." |

## Dados

- Arquitetura, seção 10: `profile` no pedido de adaptação.
- Guardado no navegador: `id`, `nickname`, as 5 opções e `notes`.
