# Pesquisa T00 — Prova rápida do Gemini

> Equivale ao `research.md` do Spec Kit. Registra o que foi testado no Gemini real antes de
> fechar o contrato (T03). Script: `backend/scripts/probe_gemini.py`.
> Data: 16/11/2026. SDK: `google-genai` 3.3.0. Python 3.13.

## O que foi testado

- 2 provas em texto (Ciências, 4º ano, com 6 questões incluindo 4a/4b e V/F; Matemática,
  3º ano, com 5 itens incluindo 3a/3b), criadas pelo grupo, sem dados de aluno.
- Perfil fixo: lê pouco; precisa de passo a passo; sensível a excesso visual; "TEA nível 1".
- Schema provisório da seção 10 da arquitetura (`AiAdaptation`), pedido em JSON.
- **Ainda falta:** fotos de provas em branco (a leitura de imagem não foi testada).

## Resultados

| Modelo | Resultado | Tempo por prova | Formato | Questões mantidas |
|---|---|---|---|---|
| `gemini-2.5-flash` | Recusado: "não está mais disponível para novos usuários" | — | — | — |
| `gemini-3.8-flash` | Erros 503 (alta demanda) e 504 (tempo esgotado) | — | — | — |
| `gemini-3.5-flash` | Funcionou | 10 a 11 s | Válido nas 2 | Todas (6/6 e 5/5) |
| `gemini-3.5-flash-lite` | Funcionou | 2 a 4 s | Válido nas 2 | Todas (6/6 e 5/5) |

Tokens por prova em texto: cerca de 600 a 750 de entrada e 650 a 1.300 de saída.

## Descobertas

1. **O schema com limites de tamanho foi recusado.** A primeira versão tinha "até 20 etapas"
   e "até 3 palavras-chave por etapa" dentro do schema. O Gemini respondeu que o schema
   "produz estados demais" (400). Sem os limites, foi aceito, inclusive com modelos aninhados
   (`$defs`). **Decisão:** o schema enviado à IA não tem limites de tamanho; o servidor
   confere os limites depois (já era a regra de "schema raso" da arquitetura).
2. **O `flash-lite` é rápido, mas muda o conteúdo cobrado.** Na prova de Ciências:
   - trocou "matas ciliares" por "matas perto dos rios" (perdeu o termo da disciplina);
   - encurtou os itens de V/F: "O sol é a principal fonte de energia" virou "O sol é a fonte
     de energia", e "pela transpiração" sumiu. Isso pode mudar a resposta certa.

   O `gemini-3.5-flash` manteve os termos e as alternativas. Fere o princípio P1 da
   constituição, então **o `flash-lite` não serve como modelo principal nem como reserva
   automática**.
3. **O modelo mais novo nem sempre está disponível.** O `3.8-flash` falhou por demanda alta.
   Confirma a tabela de falhas (nova tentativa em 503/504) e a reserva de respostas gravadas
   (T22).
4. **Numeração com letras funciona.** A IA devolveu `sourceQuestions` como "4a", "4b", "3a",
   "3b", e as etapas seguiram os mesmos números. `sourceNumber` como texto está certo.
5. **A palavra de busca precisa considerar o contexto.** "Arme e efetue" gerou a palavra de
   busca "armar", que no ARASAAC tende a trazer arma ou montar algo, não conta. O pedido à
   IA deve dizer que a palavra de busca representa o **sentido na frase** e evita verbos de
   enunciado ("arme", "efetue", "marque", "leia"). Ajustar na T05.
6. **Pictograma pode ilustrar a resposta mesmo sem a IA "dar" a resposta.** Na questão 3
   ("cite dois exemplos de precipitação"), a palavra-chave foi "chuva", que é uma resposta
   possível. O original já citava "chuva", então não houve vazamento novo, mas o pedido à IA
   deve reforçar: palavra-chave nunca é uma resposta possível. O professor revisa (spec 004).
7. **O `teacherNotes` não lista tudo o que foi omitido.** "Use caneta azul ou preta" e
   "Mostre como você pensou" sumiram sem aparecer no quadro "O que mudou". Não é conteúdo
   cobrado, mas o pedido à IA deve pedir que toda instrução omitida seja citada.
8. **O cabeçalho da prova (escola, nome, data) foi descartado**, o que é bom: a folha tem
   o próprio campo de nome e data (spec 006).
9. **O Google recomenda a "Interactions API"** na mensagem de erro. O `generate_content`
   continua funcionando; não muda nada na E1. Avaliar na V2.

## Decisões para a T03 e a T05

| Tema | Decisão |
|---|---|
| Modelo | `GEMINI_MODEL=gemini-3.5-flash` |
| Reserva | Sem troca automática de modelo; a reserva é a T22 (respostas gravadas) |
| Schema da IA | Sem limites de tamanho; o servidor confere 20 etapas e o máximo de palavras-chave |
| Contrato | Os campos da seção 10 funcionaram como estão; nenhuma mudança de campo |
| Tempo-limite | 60 s fica com folga (10 a 11 s por prova em texto); conferir com fotos |
| Pedido à IA | Acrescentar as descobertas 5, 6 e 7 |

## Pendências

- Rodar com 3 fotos de provas em branco antes de fechar a T05 (tempo e leitura da imagem).
- Anotar os limites da faixa gratuita do `gemini-3.5-flash`, vistos no painel do AI Studio.
