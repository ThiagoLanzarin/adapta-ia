# 005 — Nova versão a pedido

- **Estado:** aprovada (16/11/2026)
- **Requisitos:** RF-12
- **Tarefas:** T09, T15
- **Depende de:** specs 001 e 004
- **Se faltar tempo:** é a primeira spec a cair.

## Objetivo

O professor pede um ajuste em linguagem natural ("deixe mais curto") em vez de editar frase
por frase.

## Fora do escopo

- Conversa com várias mensagens. É um pedido por vez.
- Guardar as versões anteriores.

## História

Como professor, escrevo o que quero mudar na folha e recebo uma nova versão que mantém as
minhas correções.

## Critérios de aceite

### Servidor

- **CA-005-01** [teste] Dada a adaptação atual, o perfil e um pedido, então a resposta é uma
  nova `Adaptation` no formato do contrato.
- **CA-005-02** [teste] Dada a adaptação atual, então o pedido à IA contém o texto já editado
  pelo professor, e não o da primeira versão.
- **CA-005-03** [teste] Dado o tipo "prova", então o pedido à IA mantém as regras de prova
  (R-001-02) e o aviso `MISSING_QUESTION` continua sendo conferido.
- **CA-005-04** [teste] Dado um pedido vazio ou com mais de 300 caracteres, então a resposta
  é `INVALID_INPUT`.
- **CA-005-05** [teste] Falhas da IA seguem a mesma tabela da spec 001.

### Tela

- **CA-005-20** [manual] Escrevo um pedido e confirmo o aviso "A folha atual será
  substituída". A nova versão aparece no lugar.
- **CA-005-21** [manual] Se der erro, a folha atual continua como estava.

## Regras

- **R-005-01** A nova versão é gerada a partir da folha atual, com as edições. Assim as
  correções manuais não se perdem.
- **R-005-02** Os pictogramas da nova versão são buscados de novo no ARASAAC. Trocas manuais de
  pictograma podem se perder; o aviso de confirmação diz isso.

## Dados

- Pedido: `POST /api/adaptations/revise` com `adaptation` (a atual), `profile`,
  `materialType` e `instruction` (o pedido do professor).
- Resposta: `Adaptation`.
- A rota deve entrar na seção 10 da arquitetura quando a T09 começar.
