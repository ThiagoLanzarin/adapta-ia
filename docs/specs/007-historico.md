# 007 — Histórico

- **Estado:** aprovada (16/11/2026)
- **Requisitos:** RF-17
- **Tarefas:** T19
- **Depende de:** specs 001 e 004

## Objetivo

O professor encontra de novo uma prova já adaptada naquele aparelho, para corrigir ou
imprimir de novo.

## Fora do escopo

- Histórico na nuvem ou em outro aparelho.
- Readaptar o mesmo material para outro perfil (V2).

## História

Como professor, dou nome às adaptações, busco pelo nome, reabro, continuo editando e apago
as que não uso mais.

## Critérios de aceite

- **CA-007-01** [manual] Toda adaptação gerada é salva sozinha no navegador, com um nome
  sugerido (o título da folha), que posso mudar.
- **CA-007-02** [manual] A lista do histórico mostra o nome, a data e o tipo de material,
  da mais recente para a mais antiga.
- **CA-007-03** [manual] Digito parte do nome e a lista filtra na hora, sem diferenciar
  maiúsculas, minúsculas e acentos.
- **CA-007-04** [manual] Reabro uma adaptação: vejo o original e a folha com as edições, e
  posso continuar editando e imprimir.
- **CA-007-05** [manual] Edições feitas depois de reabrir também ficam salvas.
- **CA-007-06** [manual] Apago uma adaptação depois de confirmar; ela some da lista.
- **CA-007-07** [manual] Fecho e reabro o navegador: o histórico continua lá.

## Regras

- **R-007-01** O histórico fica só no navegador (IndexedDB).
- **R-007-02** Cada item guarda o original (a imagem já reduzida, o texto ou os slides), a
  `Adaptation` com as edições e uma cópia do perfil usado.
- **R-007-03** O apelido do perfil pode aparecer no histórico, porque ele nunca sai do
  navegador.

## Erros e casos de borda

| Situação | O que o professor vê |
|---|---|
| Navegador bloqueia o armazenamento | "Este navegador não deixa salvar o histórico. Imprima ou salve em PDF antes de sair." |
| Espaço do navegador cheio | "Não há espaço para salvar. Apague adaptações antigas." |

## Dados

Arquitetura, seção 10, "Guardado só no navegador": item do histórico.
