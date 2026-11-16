# 001 — Adaptar material (imagem ou texto)

- **Estado:** aprovada (16/11/2026)
- **Requisitos:** RF-01, RF-04, RF-05, RF-06, RF-08, RF-09, RF-19, RF-26, RF-27
- **Tarefas:** T00, T03, T04, T05, T06, T08a, T10, T12, T22
- **Depende de:** nenhuma. É a spec central; as outras usam o que ela define.

## Objetivo

O professor envia a foto de uma prova em branco (ou outra atividade, ou um texto) e recebe
uma folha adaptada ao perfil do aluno, sem perder nada do que é cobrado.

## Fora do escopo

- PDF como entrada (V2).
- PowerPoint (spec 002).
- Editar a folha (spec 004), imprimir (spec 006) e salvar (spec 007).

## História

Como professor, envio a foto da prova da turma, escolho o tipo de material e as necessidades
de apoio do aluno, e recebo a mesma prova adaptada, para o aluno com autismo fazer a mesma
avaliação que a turma.

## Critérios de aceite

### Servidor

- **CA-001-01** [teste] Dado um texto colado, um tipo de material e um perfil válidos, quando
  o professor pede a adaptação, então a resposta segue o formato `Adaptation` do contrato.
- **CA-001-02** [teste] Dada uma imagem PNG, JPEG, WEBP, HEIC ou HEIF, quando é enviada, então
  é aceita. Dado qualquer outro formato, então a resposta é o erro `FILE_TYPE`.
- **CA-001-03** [teste] Dado um arquivo acima de 20 MB, quando é enviado, então a resposta é
  `FILE_TOO_LARGE`, sem chamar a IA.
- **CA-001-04** [teste] Dado um pedido sem material, ou com mais de um (imagem e texto
  juntos), então a resposta é `INVALID_INPUT`.
- **CA-001-05** [teste] Dado um texto vazio ou acima de 20.000 caracteres, então a resposta é
  `INVALID_INPUT`.
- **CA-001-06** [teste] Dado um perfil com um campo que não está no contrato (por exemplo,
  `nickname`), então a resposta é `INVALID_INPUT`. Assim o apelido não chega ao servidor
  nem por engano.
- **CA-001-07** [teste] Dado que a IA devolveu `sourceQuestions` com "1", "2" e "3", e
  nenhuma etapa tem `sourceNumber` "3", então a resposta traz o aviso `MISSING_QUESTION`
  citando a questão 3.
- **CA-001-08** [teste] Dada uma palavra-chave cuja palavra não aparece no texto da etapa,
  então ela é removida da resposta.
- **CA-001-09** [teste] Dado o perfil, então o número de palavras-chave por etapa respeita a
  regra R-001-04, e as que sobram são removidas.
- **CA-001-10** [teste] Dada uma palavra-chave, então o ARASAAC é consultado primeiro pela
  palavra de busca e, sem resultado, pela palavra exibida. Sem resultado nas duas,
  `pictogramId` é `null` e não há erro.
- **CA-001-11** [teste] Dada uma resposta da IA fora do formato, então o servidor tenta mais
  uma vez. Se a segunda vier certa, a adaptação é devolvida. Se vier errada de novo, a
  resposta é `AI_INVALID`.
- **CA-001-12** [teste] Dado que a IA respondeu "limite atingido", então a resposta é
  `AI_QUOTA`, sem nova tentativa.
- **CA-001-13** [teste] Dado o tipo "prova", então o pedido à IA contém as regras de prova
  (R-001-02). Dado "atividade" ou "conteúdo", então não contém.
- **CA-001-14** [teste] Dado o perfil com observações, então o pedido à IA contém as opções
  marcadas e as observações.
- **CA-001-15** [teste] Dada uma resposta válida, então cada etapa tem um `id` único e só as
  etapas `question` têm `options`.
- **CA-001-16** [teste] Dado que a IA devolveu a transcrição vazia, então a resposta traz o
  aviso `UNREADABLE` e nenhuma etapa.

### Tela

- **CA-001-20** [manual] Ao abrir a tela de adaptação, o tipo de material vem marcado como
  "Prova".
- **CA-001-21** [manual] Dada uma foto de celular de vários MB, quando é enviada, então o
  arquivo que vai ao servidor tem o lado maior com até 1600 px (conferir na aba de rede do
  navegador).
- **CA-001-22** [manual] Dada a resposta, então vejo, lado a lado: à esquerda, o original
  (imagem ou texto) e o texto lido pela IA; à direita, a folha. O quadro "O que mudou" e os
  avisos aparecem fora da folha.
- **CA-001-23** [manual] Numa prova, cada questão mostra "Questão N", com o número do
  original, e todas as alternativas. Os pictogramas aparecem só no enunciado.
- **CA-001-24** [manual] Enquanto a adaptação é gerada, vejo que está em andamento. Se der
  erro, vejo a mensagem do servidor e posso tentar de novo sem perder o que enviei.
- **CA-001-25** [manual] Sem a spec 003 pronta, a tela mostra as 5 opções de apoio e o campo
  de observações com a frase "Não escreva o nome do aluno".
- **CA-001-26** [manual] Com o provedor de respostas gravadas ligado, a tela mostra o selo
  "modo demonstração".

### Qualidade com material real

- **CA-001-30** [manual] Dadas 3 provas reais fotografadas em branco, então todas as
  questões e alternativas do original aparecem na adaptação, e nenhuma questão traz a
  resposta destacada ou ilustrada. Conferido na T00 e de novo na T21.

## Regras

- **R-001-01** Uma adaptação = uma chamada à IA (mais uma nova tentativa, se a resposta vier
  fora do formato).
- **R-001-02** Regras de prova enviadas à IA:
  - manter todas as questões, com a numeração do original;
  - manter todas as alternativas, simplificando só o texto;
  - não acrescentar conteúdo;
  - não destacar, ilustrar nem sugerir a resposta;
  - palavras-chave só no enunciado, nunca nas alternativas.
- **R-001-03** Efeito de cada opção de apoio no pedido à IA:

  | Opção | Efeito |
  |---|---|
  | Lê pouco | Frases curtas, palavras do dia a dia; os termos da disciplina ficam |
  | Precisa de passo a passo | Enunciado com mais de uma ação vira etapas numeradas |
  | Precisa de mais imagens | Mais palavras-chave por etapa (R-001-04) |
  | Sensível a excesso visual | Menos palavras-chave por etapa (R-001-04); sem enfeites |
  | Se distrai fácil | Uma questão por página na impressão (spec 006) |

- **R-001-04** Máximo de palavras-chave por etapa, aplicado pelo servidor:

  | Mais imagens | Excesso visual | Máximo |
  |---|---|---|
  | não | não | 2 |
  | sim | não | 3 |
  | não | sim | 1 |
  | sim | sim | 2 |

- **R-001-05** Limites: até 20 etapas; texto colado com até 20.000 caracteres; observações
  com até 500 caracteres.
- **R-001-06** A IA nunca escolhe o número do pictograma. Quem escolhe é o servidor, pela busca
  no ARASAAC.

## Erros e casos de borda

| Situação | Código | O que o professor vê |
|---|---|---|
| Formato de arquivo não aceito | `FILE_TYPE` | "Envie uma foto (JPG, PNG, WEBP ou HEIC) ou cole o texto." |
| Arquivo grande demais | `FILE_TOO_LARGE` | "O arquivo passa de 20 MB. Tire a foto de novo ou cole o texto." |
| Pedido incompleto ou inválido | `INVALID_INPUT` | "Confira o material e as opções e tente de novo." |
| Cota da IA acabou | `AI_QUOTA` | "A IA gratuita atingiu o limite. Tente em alguns minutos ou cole o texto." |
| IA demorou ou está fora do ar | `AI_TIMEOUT`, `AI_UNAVAILABLE` | "A IA demorou para responder. Tente de novo." |
| IA respondeu fora do formato duas vezes | `AI_INVALID` | "Não consegui montar a folha. Tente de novo ou cole o texto." |
| IA recusou o material | `AI_BLOCKED` | "A IA recusou este material. Confira se a foto é da prova em branco." |
| Foto ilegível (a IA não achou texto) | aviso `UNREADABLE` | "Não consegui ler a foto. Tire outra com mais luz ou cole o texto." |
| Questão do original faltando | aviso `MISSING_QUESTION` | "A questão 3 do original não aparece na adaptação. Confira antes de imprimir." |
| Palavra sem pictograma | sem erro | A palavra aparece sem imagem |

## Dados

Arquitetura, seção 10: pedido de adaptação, `AiAdaptation`, `Adaptation`, pictogramas e erro.

## Esclarecimentos

- 16/11/2026: foto ilegível gera o aviso `UNREADABLE` quando a IA devolve a transcrição vazia
  (critério CA-001-16).
