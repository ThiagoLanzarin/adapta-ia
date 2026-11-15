# Adapta Aí — Arquitetura

> Documento da fase 2. Diz **como** o sistema é organizado.
> O que ele faz está em [especificacao.md](especificacao.md).
> Tudo aqui foi decidido pelo grupo em 15/11/2026. O que falta está em
> [Pontos em aberto](#pontos-em-aberto).

## 1. Visão geral

```
NAVEGADOR (React + TypeScript)
  telas, edição da folha, perfis, histórico, impressão
        |
        |  JSON por HTTP
        v
SERVIDOR (Python + FastAPI)
  lê o arquivo -> chama a IA -> busca pictogramas
        |                 |
        v                 v
     Gemini            ARASAAC
```

- O navegador nunca fala direto com a IA. A chave fica só no servidor.
- O servidor não guarda nada. Perfis e histórico ficam no navegador do professor.

## 2. Tecnologias

| Parte | Tecnologia | Para quê |
|---|---|---|
| Tela | Vite | Monta e serve o projeto |
| Tela | React | Telas e componentes |
| Tela | TypeScript | Tipos |
| Tela | Tailwind CSS | Visual |
| Tela | React Router | Páginas com endereço próprio |
| Tela | idb | Acesso simples ao IndexedDB (perfis e histórico) |
| Tela | ESLint + Prettier | Padronização do código |
| Servidor | FastAPI | Rotas HTTP |
| Servidor | Uvicorn | Roda o servidor |
| Servidor | Pydantic | Formato dos dados |
| Servidor | python-multipart | Recebe arquivos enviados |
| Servidor | python-pptx | Lê o PowerPoint |
| Servidor | google-genai | SDK oficial do Gemini |
| Servidor | httpx | Chama a API do ARASAAC |
| Servidor | pytest | Testes |
| Servidor | Ruff | Padronização do código |

- Dependências do servidor: `venv` + `requirements.txt`.
- Dependências da tela: `npm`.
- Qualquer biblioteca fora desta lista só entra com aprovação do grupo.
- As versões são conferidas no momento da instalação.

## 3. Estrutura de pastas

Tela organizada por funcionalidade; servidor organizado por camada. Nomes em inglês.

```
adapta-ai/
  CLAUDE.md                regras de trabalho da IA
  docs/
    especificacao.md       o que o sistema faz
    arquitetura.md         este documento
    tarefas.md             lista de tarefas (fase 3, ainda não existe)
  frontend/
    src/
      features/
        adaptation/        enviar material, escolher slides
        sheet/             folha adaptada, edição, impressão
        profiles/          perfis de aluno
        history/           salvar, buscar, reabrir
      shared/              componentes genéricos, cliente da API, tipos
  backend/
    app/
      api/                 rotas: só recebem e respondem
      services/            regras: adaptar, buscar pictograma
      ai_providers/        contrato de IA + Gemini (trocável)
      readers/             pptx, imagem, texto
      models/              formato dos dados
    tests/
    requirements.txt
```

Os nomes em inglês foram aprovados pelo grupo em 15/11/2026.

## 4. Camadas e quem pode chamar quem

### Servidor

```
api  ->  services  ->  ai_providers
                   ->  readers
models é usado por todas
```

- `api`: recebe o pedido, valida o formato, chama um serviço e devolve a resposta. Sem regra.
- `services`: as regras do sistema. Não conhecem o Gemini, só o contrato de IA.
- `ai_providers`: o contrato (o que qualquer IA precisa saber fazer) e a implementação do
  Gemini. Trocar de provedor é escrever outra implementação do mesmo contrato.
- `readers`: transformam o material enviado (pptx, imagem, texto) em um formato único.
- `models`: o formato dos dados que entram e saem.

### Tela

- Um componente não chama a API direto. Usa o cliente em `shared`.
- Uma funcionalidade não importa de dentro de outra. O que duas precisam vai para `shared`.

## 5. Caminho de uma adaptação

1. O professor envia uma imagem, um PowerPoint ou cola um texto.
2. Se for PowerPoint, o servidor extrai texto e figuras de cada slide. A tela lista os slides
   por título e texto, e o professor marca até 5.
3. A tela envia o material escolhido e o perfil do aluno.
4. O servidor pede à IA a versão adaptada, em formato estruturado.
5. O servidor busca no ARASAAC os pictogramas das palavras-chave.
6. A tela mostra original e adaptada lado a lado. O professor edita, troca pictogramas ou
   pede nova versão.
7. A adaptação fica salva no navegador. O professor imprime ou salva em PDF pela impressão.

Como o PowerPoint é lido por extração, o "original" de um slide é o conteúdo extraído, e não
a imagem fiel do slide.

## 6. Decisões de montagem

| Tema | Decisão |
|---|---|
| IA | Faixa gratuita do Gemini; provedor trocável pela camada `ai_providers` |
| PowerPoint | Extração de texto e imagens no nosso servidor. O Gemini aceita `.pptx` direto, mas o converte em texto, não permite listar slides para escolher e prenderia o sistema a esse provedor |
| Imagens aceitas | PNG, JPEG, WEBP, HEIC e HEIF (os formatos que o Gemini recebe) |
| Tamanho máximo | 20 MB por arquivo enviado |
| Navegação | Páginas com endereço próprio |
| Armazenamento | IndexedDB no navegador, guardando original e adaptada |
| Preto e branco | Parâmetro `color=false` da API do ARASAAC |
| PDF | Impressão do navegador, com folha de estilo A4 |
| Segredos | Arquivo `.env`, fora do Git. Nenhuma chave no código |
| Hospedagem | Publicado na internet, em serviço gratuito a escolher na tarefa de publicar. Até lá a arquitetura fica neutra: tela vira arquivos estáticos, servidor é um app Python padrão, endereços e chave vêm de variáveis de ambiente |

## 7. Testes

- Servidor: testes automatizados nas regras (leitura de arquivo, montagem da adaptação,
  busca de pictograma), com a IA simulada.
- Tela: conferida à mão no navegador.

## 8. Git e GitHub

- Repositório único, com `frontend/` e `backend/`: https://github.com/eiq03/adapta-ia
- Um ramo por tarefa, com o nome no formato `tipo/tNN-descricao`.
  Exemplos: `feat/t03-upload-imagem`, `fix/t07-busca-pictograma`.
- O ramo entra na linha principal por pedido de revisão (pull request), depois que outra
  pessoa do grupo olhar.
- Mensagens de commit em português.
- `adapta-ai.html` (a página da proposta) fica fora do Git.

## 9. Contrato de dados

Rascunho derivado da prova de conceito, aprovado pelo grupo como ponto de partida. Os campos
que faltam são detalhados na primeira tarefa do servidor e confirmados com o grupo.

```json
{
  "title": "O ciclo da água",
  "objective": "Conhecer as etapas do ciclo da água e seus nomes",
  "steps": [
    {
      "text": "O sol esquenta a água do rio e do mar.",
      "keywords": [
        { "word": "sol", "pictogramId": 7252 }
      ]
    }
  ],
  "question": null,
  "alternatives": []
}
```

## Pontos em aberto

1. **Chave do Gemini.** Um membro cria a chave no Google AI Studio e confere os limites reais
   da faixa gratuita. A documentação não informa limites de imagem para essa faixa.
2. **Foto grande.** O Gemini aceita até 20 MB por pedido, somando texto e arquivo. Uma foto
   perto dos 20 MB pode ser recusada por ele. A saída (por exemplo, reduzir a imagem antes
   de enviar) é decidida na tarefa de envio de imagem.
3. **Campos do contrato de dados.** Ver a seção 9.
