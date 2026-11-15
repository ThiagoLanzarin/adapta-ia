# Adapta Aí — Especificação

> Documento da fase 1 (idealização). Diz **o que** o sistema faz, não **como**.
> Tudo aqui foi decidido pelo grupo nas rodadas de perguntas de 14 e 15/11/2026.
> O que ainda não foi decidido está na seção [Pontos em aberto](#pontos-em-aberto).

## 1. Visão geral

Ferramenta web para professores do ensino regular que têm alunos com autismo (TEA) em sala.
O professor envia um material que já tem pronto e recebe o mesmo material adaptado:
linguagem simples, uma instrução por vez, menos poluição visual e pictogramas reais do
ARASAAC ao lado das palavras-chave. Ele revisa, edita e imprime.

- **Usuário:** professor da escola pública, sem formação específica em TEA.
- **Custo para o professor:** gratuito.
- **Contexto:** trabalho acadêmico em grupo (EdTech), com prazo de 3 dias informado em 14/11/2026.
  O objetivo é que o sistema seja usável no dia a dia, e não só uma demonstração.

## 2. Versões

O grupo decidiu idealizar o sistema completo e entregar em duas etapas.

- **E1 — Entrega de 3 dias:** o recorte que será apresentado.
- **V2 — Versão seguinte:** planejado, mas fora da entrega.

| Tema | E1 — Entrega de 3 dias | V2 — Versão seguinte |
|---|---|---|
| Entrada | Foto ou imagem; PowerPoint (.pptx); texto colado | PDF |
| Tamanho | Arquivo inteiro, com escolha de quais slides adaptar, até 5 por vez | — |
| Perfil do aluno | Perfis salvos com apelido e observações | — |
| Edição | Editar texto; trocar e remover pictograma; pedir nova versão à IA | Adicionar, apagar e reordenar etapas |
| Saída | Imprimir; baixar PDF (pela impressão do navegador) | Word (.docx); PowerPoint (.pptx) |
| Tipo de saída | Sempre folha para o aluno | Slides adaptados, à escolha do professor |
| Histórico | Reabrir e editar; apagar; dar nome e buscar | Readaptar o mesmo material para outro perfil |
| Pictogramas | Botão na folha alterna entre colorido e preto e branco | — |
| Privacidade | Nada no sistema; o grupo cita na apresentação como limitação conhecida | Avisos no sistema |

**Se faltar tempo na E1**, o primeiro item a cair é "perfis salvos com apelido e observações".
Nesse caso o professor marca as três opções de apoio a cada adaptação.

## 3. Decisões gerais

- **Conta:** não há login. O que o professor guarda fica salvo no navegador daquele aparelho.
- **Aparelho:** pensado para computador. Abre no celular, sem acabamento especial.
- **IA:** começa na faixa gratuita do Gemini (Google). O provedor fica isolado numa camada
  própria, para poder ser trocado por um pago sem reescrever o resto do sistema.
- **Plano B da apresentação:** texto colado entra na E1. Se a leitura da foto ou do PowerPoint
  falhar, o professor cola o texto e a adaptação segue.
- **Método de trabalho:** mesma lógica do GitHub Spec Kit (princípios, especificação, plano,
  tarefas), com documentos escritos pelo grupo, sem instalar a ferramenta.

## 4. Histórias de usuário

Os critérios de aceite abaixo são um rascunho derivado das decisões. O grupo deve revisar.

### H1 — Adaptar um material (E1)

Como professor, envio uma foto, imagem ou apresentação em PowerPoint, ou colo um texto, e
recebo a versão adaptada para o aluno.

- Dado que enviei uma imagem ou colei um texto, quando escolho um perfil e peço para adaptar,
  então vejo o original e a versão adaptada lado a lado.
- Dado que enviei um PowerPoint, quando o arquivo é carregado, então vejo os slides e marco
  quais quero adaptar, até 5 por vez.
- A versão adaptada é sempre uma folha para o aluno, inclusive quando o material é um slide.
- O conteúdo cobrado no original continua na versão adaptada.

### H2 — Usar o perfil do aluno (E1, primeiro a cair)

Como professor, crio um perfil com apelido, opções de apoio e observações, e o reutilizo.

- Opções de apoio: lê pouco; precisa de passo a passo; sensível a excesso visual.
- As observações são um texto livre que a IA leva em conta na adaptação.
- Os perfis ficam salvos no navegador.

### H3 — Revisar e editar (E1)

Como professor, corrijo a versão adaptada antes de usar.

- Edito o texto de qualquer frase.
- Clico em um pictograma e vejo outras opções do ARASAAC para aquela palavra, ou removo a imagem.
- Escrevo um pedido (por exemplo, "deixe mais curto") e a IA gera uma nova versão.
- Alterno a folha inteira entre pictogramas coloridos e em preto e branco.

### H4 — Imprimir e baixar (E1)

Como professor, levo a folha adaptada para a sala.

- Imprimo direto do sistema.
- Baixo a folha em PDF: o botão abre a impressão do navegador no layout A4 e eu escolho
  "Salvar como PDF".
- Toda folha traz o crédito do ARASAAC.

### H5 — Histórico (E1)

Como professor, encontro de novo o que já adaptei naquele aparelho.

- Dou um nome a cada adaptação e busco pelo nome.
- Reabro uma adaptação, continuo editando e imprimo de novo.
- Apago uma adaptação.

## 5. Requisitos funcionais

| Id | Requisito | Versão |
|---|---|---|
| RF-01 | Aceitar foto ou imagem como entrada | E1 |
| RF-02 | Aceitar PowerPoint (.pptx) como entrada | E1 |
| RF-03 | Mostrar os slides do arquivo e permitir escolher quais adaptar, até 5 por vez | E1 |
| RF-04 | Ler o conteúdo do material e reescrever em frases curtas, uma instrução por etapa | E1 |
| RF-05 | Preservar o objetivo de aprendizagem e os termos da disciplina | E1 |
| RF-06 | Associar pictogramas do ARASAAC às palavras-chave, com busca em português | E1 |
| RF-07 | Criar, editar e apagar perfis de aluno (apelido, opções de apoio, observações) | E1 |
| RF-08 | Considerar o perfil escolhido ao gerar a adaptação | E1 |
| RF-09 | Mostrar original e versão adaptada lado a lado | E1 |
| RF-10 | Editar o texto da versão adaptada | E1 |
| RF-11 | Trocar um pictograma por outra opção do ARASAAC ou removê-lo | E1 |
| RF-12 | Gerar nova versão a partir de um pedido escrito pelo professor | E1 |
| RF-13 | Alternar a folha entre pictogramas coloridos e em preto e branco | E1 |
| RF-14 | Imprimir a folha adaptada | E1 |
| RF-15 | Baixar a folha adaptada em PDF, pela impressão do navegador | E1 |
| RF-16 | Exibir a atribuição do ARASAAC em toda folha gerada | E1 |
| RF-17 | Salvar as adaptações no navegador, com nome, busca, reabertura e exclusão | E1 |
| RF-18 | Aceitar PDF como entrada | V2 |
| RF-19 | Aceitar texto colado como entrada | E1 |
| RF-20 | Adicionar, apagar e reordenar etapas | V2 |
| RF-21 | Baixar em Word (.docx) | V2 |
| RF-22 | Baixar em PowerPoint (.pptx) | V2 |
| RF-23 | Oferecer slides adaptados como tipo de saída | V2 |
| RF-24 | Readaptar um material do histórico para outro perfil | V2 |
| RF-25 | Avisos de privacidade no sistema | V2 |

## 6. Fora do escopo

- Login, contas e histórico na nuvem.
- Acabamento específico para celular.
- Necessidades além de TEA.

## 7. Restrições conhecidas

- **Licença do ARASAAC:** Creative Commons BY-NC-SA. Exige atribuição e uso não comercial.
- **Busca de pictogramas erra:** no teste da prova de conceito, "marcar" trouxe primeiro a
  imagem de telefonar, "água" trouxe uma torneira e "precipitação" não teve resultado.
  Por isso RF-11 está na E1.
- **Preto e branco:** testado em 15/11/2026. A API do ARASAAC devolve a versão sem cor do
  mesmo pictograma com o parâmetro `color=false`.
- **Cota da IA gratuita:** os limites diários da faixa gratuita do Gemini são baixos e o
  Google não publica os números. Só aparecem no painel do AI Studio, na conta de quem criar
  a chave. Por isso o limite de 5 slides por vez e o provedor trocável.
- **Limitação conhecida de privacidade:** a proposta enviada ao professor diz que o perfil não
  identifica a criança nem registra diagnóstico. O campo de observações é texto livre e a E1
  não tem aviso no sistema. O grupo decidiu manter assim e citar na apresentação.

## Pontos em aberto

As decisões técnicas estão em [arquitetura.md](arquitetura.md). O controle de versão foi
decidido lá: Git com GitHub.

1. **Chave do Gemini.** Um membro precisa criar a chave no Google AI Studio e conferir, no
   painel, os limites reais da faixa gratuita.
2. **Tamanho máximo do arquivo.** Depende do que o provedor de IA aceita.
3. **Critérios de aceite.** Os da seção 4 são rascunho e ainda não foram revisados pelo grupo.

## Registro

- Proposta enviada ao professor (página publicada): https://claude.ai/artifact/TP7RdnU4yiE3mTPwd73Xiq
- 14–15/11/2026: rodadas de idealização e definição do recorte da E1.
- 15/11/2026: resolvidos os pontos em aberto de provedor de IA, limite de slides, PDF,
  plano B, preto e branco, privacidade e Git.
