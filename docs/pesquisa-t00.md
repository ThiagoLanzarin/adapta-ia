# Pesquisa T00 — Prova rápida do Gemini

> Equivale ao `research.md` do Spec Kit. Registra o que foi testado no Gemini real antes de
> fechar o contrato (T03). Script: `backend/scripts/probe_gemini.py`.
> Data: 16/11/2026. SDK: `google-genai` 3.3.0. Python 3.13.

## O que foi testado

- 2 provas em texto (Ciências, 4º ano, com 6 questões incluindo 4a/4b e V/F; Matemática,
  3º ano, com 5 itens incluindo 3a/3b), criadas pelo grupo, sem dados de aluno.
- Perfil fixo: lê pouco; precisa de passo a passo; sensível a excesso visual; "TEA nível 1".
- Schema provisório da seção 10 da arquitetura (`AiAdaptation`), pedido em JSON.
- Depois, 3 imagens de provas em branco (Ciências com figura, Português com texto-base,
  Matemática com figuras geométricas), em duas colunas, com o `gemini-3.5-flash`.

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

## Fotos (16/11/2026)

| Prova | Tempo | Formato | Questões | Alternativas |
|---|---|---|---|---|
| Ciências, sistema solar (questão 1 com itens a–d, figura na 7) | 19 s | Válido | 10 de 10 | 20 de 20 |
| Matemática, 7º ano (figuras geométricas nas questões 7 e 10) | 21 s | Válido | 10 de 10 | 40 de 40 |
| Português, Dia do Trabalho (texto-base + 10 questões) | 23 s | Válido | 10 de 10 | 32 de 32 |

Cerca de 1.500 tokens de entrada e 1.800 a 2.200 de saída por foto. A leitura das duas
colunas veio na ordem certa nas 3 provas.

**Descobertas com fotos:**

10. **O texto-base sumiu da prova de Português.** A IA transcreveu o texto "1º de maio" em
    `transcription`, mas nas etapas ficou só "Leia o texto abaixo com atenção", sem o texto.
    Sem ele, as 10 questões não têm como ser respondidas. A conferência de questões não
    pega isso, porque todas as questões estão lá. **É a falha mais grave encontrada.**
11. **Figuras com dados viram texto, e isso ajudou.** Na Matemática, os ângulos das figuras
    (110°, 120°, 60°; triângulo com 90° e 45°) foram escritos no enunciado, corretamente.
12. **Figura sem dados não tem como ser reproduzida.** Na Ciências, a questão 7 ("Observe a
    imagem...") ficou apontando para uma imagem que não existe na folha adaptada, e o
    professor não é avisado.
13. **Palavra-chave tirada das alternativas.** "oxigênio" veio da alternativa (a), e não do
    enunciado. A regra do servidor que remove palavra fora do texto (CA-001-08) pegou.
14. **Verbos de enunciado como palavra de busca se repetem** ("indicar", "servir",
    "substituir", "ler"). Confirma a descoberta 5.
15. **A IA trocou "EXCETO" por "NÃO"** ("Qual opção NÃO ajuda..."). Mantém o sentido e é mais
    claro. Bom exemplo de adaptação.

## Texto-base e figuras (segunda rodada, 16/11/2026)

O pedido à IA ganhou duas regras e o schema ganhou o tipo `"text"` e os campos
`needsFigure` e `figureBox` (caixa da figura na imagem, `[ymin, xmin, ymax, xmax]` de 0 a
1000). Rodado de novo nas mesmas 3 fotos.

| Prova | Tempo | Resultado |
|---|---|---|
| Ciências | 26 s | 10/10 questões; textos de apoio em etapas `"text"`; figura da questão 7 com caixa |
| Matemática 7º ano | 28 s | 10/10 questões; figuras das questões 7 e 10 com caixa; imagem decorativa (dinheiro) ignorada |
| Português | 503 na 1ª vez; **88 s** na 2ª | 10/10 questões; texto-base **completo e igual ao original**, antes das questões |

16. **O texto-base agora entra.** Resolve a descoberta 10.
17. **As caixas das figuras estão certas.** Recortadas da foto com essas caixas, as 3
    figuras saíram inteiras (a Lua, o quadrilátero com os ângulos e o triângulo). Com uma
    margem de 1,5%, entra um pedaço do texto vizinho ("Calcule x", "(A) 135°"); a margem deve
    ser menor, perto de 0,5%.
18. **A IA separa figura necessária de enfeite.** O monte de dinheiro da questão 1 não foi
    marcado.
19. **O tempo pode passar de 60 s com o modelo sobrecarregado** (88 s). O tempo-limite passa
    para 90 s, e a tela precisa mostrar que está trabalhando.

**Decisão:** a figura do original vai para a folha adaptada. A tela recorta a figura da
imagem que ela já tem (a foto reduzida), com canvas e sem biblioteca, usando a caixa que a IA
devolveu. O servidor não mexe em imagem. Quando não há imagem (texto colado ou PowerPoint),
ou a IA não devolve a caixa, o servidor gera o aviso `NEEDS_FIGURE`.

## Limites da faixa gratuita (painel do AI Studio, 16/11/2026)

| Modelo no painel | Pedidos por minuto | Pedidos por dia | Tokens por minuto |
|---|---|---|---|
| Gemini 3.6 Flash | 5 | **20** | 250 mil |
| Gemini 3.8 Flash | 5 | 20 | 250 mil |
| Gemini 3.5 Flash Lite | 15 | 500 | 250 mil |

O painel não lista um "3.5 Flash". Os 6 pedidos que fizemos com `gemini-3.5-flash` até a
hora do print aparecem como "Gemini 3.6 Flash" (6 de 20), então o nome parece apontar para
esse modelo [a verificar: conferir no painel se o uso subiu para 9 depois das 3 fotos].

**O que isso significa: 20 adaptações por dia, por chave.** Para o grupo todo, contando
desenvolvimento, testes e a apresentação. Cada nova tentativa também conta.

## Cobrança da API (decisão de 16/11/2026)

O grupo decidiu colocar **cerca de R$ 60 em créditos pré-pagos** na API (Billing do AI Studio),
antes da T05. Motivos:

- A assinatura Google AI Pro não aumenta a cota da chave de API. Ela dá cerca de US$ 10/mês
  em créditos, mas exige ativar a cobrança com depósito mínimo de US$ 5.
- No pré-pago, o uso é descontado do saldo: sem conta surpresa. Créditos valem 1 ano e não
  têm reembolso.
- Estimativa: cerca de US$ 0,03 por prova fotografada (até US$ 0,06 se o raciocínio do modelo
  for cobrado) [preço a verificar na página oficial], ou seja, 150 a 300 adaptações.
- Com a cobrança ativa, o uso conta como serviço pago e o Google não usa os dados para
  treinar modelos (ver especificação, seção 7).

Quem ativa é o membro dono da chave. Depois de ativar: conferir os novos limites no painel e
anotar aqui. Na T05, avaliar trocar `GEMINI_MODEL` para `gemini-3.6-flash` (há indício de que
o `3.5-flash` está descontinuado e redirecionado) [a verificar].

## Decisões para a T03 e a T05

Além das da seção anterior:

| Tema | Decisão proposta |
|---|---|
| Texto-base (descoberta 10) | Novo tipo de etapa `"text"` no contrato: texto de apoio que as questões usam. Em prova, ele é mantido **como no original** (só quebrado em parágrafos curtos), porque as questões citam trechos dele |
| Figura (descobertas 12, 17 e 18) | Campos `needsFigure` e `figureBox` na etapa. A tela recorta a figura da foto e a coloca na folha. Sem caixa ou sem foto, aviso `NEEDS_FIGURE` |
| Tempo-limite | 90 s (descoberta 19) |
| Uso da cota | Desenvolvimento só com a IA simulada. O Gemini só em testes planejados, anotados |
| Chaves | Cada membro que for testar com o Gemini cria a própria chave, na própria conta. Não se divide a mesma chave entre várias pessoas |
| Apresentação | A chave da apresentação não é usada no dia 18 antes das 19h, exceto no ensaio (até 8 pedidos). As respostas do ensaio viram a reserva (T22) |
| Nova tentativa | Continua sendo 1, só para resposta fora do formato e 503/504. Em 429, nunca |
| Respostas salvas | As respostas brutas da T00 já servem de material para a reserva (T22) |

## Pendências

- Aplicar na T03 as mudanças de contrato acima (`"text"`, `needsFigure`, `figureBox`),
  aprovadas pelo grupo em 16/11/2026, começando pela spec 001.
- Conferir no painel se o uso do "Gemini 3.6 Flash" subiu para 9 depois das fotos.
