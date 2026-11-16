# 006 — Imprimir e baixar PDF

- **Estado:** aprovada (16/11/2026)
- **Requisitos:** RF-14, RF-15, RF-16
- **Tarefas:** T17
- **Depende de:** spec 001

## Objetivo

O professor leva a folha adaptada para a sala, impressa ou em PDF.

## Fora do escopo

- Word e PowerPoint como saída (V2).
- PDF gerado no servidor. O PDF sai pela impressão do navegador.

## História

Como professor, imprimo a folha ou salvo em PDF, num layout A4 limpo, pronto para o aluno.

## Critérios de aceite

- **CA-006-01** [manual] Clico em "Imprimir": a impressão mostra só a folha adaptada, em A4.
  Não aparecem o original, o quadro "O que mudou", os avisos, os botões nem o menu.
- **CA-006-02** [manual] Clico em "Baixar PDF": abre a mesma impressão, com uma dica na tela
  "Escolha Salvar como PDF".
- **CA-006-03** [manual] Toda folha impressa traz no rodapé o crédito do ARASAAC (R-006-01).
- **CA-006-04** [manual] A impressão só abre depois que todos os pictogramas carregaram.
- **CA-006-05** [manual] Uma questão nunca é cortada no meio entre duas páginas.
- **CA-006-06** [manual] Se o perfil usado tem "se distrai fácil", cada questão sai numa
  página.
- **CA-006-07** [manual] A folha tem espaço para o nome do aluno e a data no topo, para
  preencher à mão.
- **CA-006-08** [manual] Em preto e branco (spec 004), os pictogramas saem sem cor.

## Regras

- **R-006-01** Texto do crédito: "Pictogramas: Sergio Palao. Origem: ARASAAC
  (https://arasaac.org). Licença: CC BY-NC-SA. Propriedade: Governo de Aragão (Espanha)."
  Conferir o texto oficial na página de condições de uso do ARASAAC antes de fechar a T17.
- **R-006-02** Folha: fonte sem serifa, grande, com espaço entre as etapas e sem enfeites.
- **R-006-03** O nome do aluno é escrito à mão na folha impressa; o sistema nunca o recebe.

## Dados

Usa a `Adaptation` que está na tela e o perfil usado (só a opção "se distrai fácil").
