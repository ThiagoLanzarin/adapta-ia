# Adapta Aí

Ferramenta web para professores adaptarem materiais (foto, PowerPoint, texto) para alunos
com autismo (TEA), com linguagem simples, etapas e pictogramas do ARASAAC.
Trabalho acadêmico em grupo.

## Leia antes de qualquer tarefa

- `docs/constituicao.md`: princípios que nenhuma spec ou código pode contrariar.
- `docs/especificacao.md`: o que o sistema faz, e o que entra na entrega (E1) ou depois (V2).
- `docs/specs/`: uma spec por funcionalidade, com os critérios de aceite. Comece pela spec
  da sua tarefa. O fluxo de Spec-Driven Development está em `docs/specs/README.md`.
- `docs/arquitetura.md`: tecnologias, pastas, camadas e pontos em aberto.
- `docs/roadmap.md`: etapas até a entrega, pontos de controle e o que vem depois (V2).
- `docs/tarefas.md`: lista de tarefas, ordem em fatias e quem está em cada uma.

## Regras de trabalho

Aprovadas pelo grupo em 15/11/2026.

1. **Decidir junto.** Nada de escopo, biblioteca nova ou mudança de estrutura sem perguntar
   antes. Na dúvida, perguntar.
2. **Uma tarefa por vez**, tirada de `docs/tarefas.md`. Nada fora da tarefa.
3. **Camadas do servidor.** Rota não tem regra. Regra não conhece o Gemini nem o ARASAAC, só as
   interfaces dos provedores. Só o `main.py` escolhe o provedor.
4. **Camadas da tela.** Componente não chama a API direto, usa o cliente em `shared`.
   Uma funcionalidade não importa de dentro de outra.
5. **Arquivo pequeno.** Uma responsabilidade por arquivo. Passou de 200 linhas, dividir.
6. **Idioma.** Código em inglês. Interface e documentos em português.
7. **Toda tarefa:** spec aprovada, ramo próprio, teste do servidor com o identificador do
   critério de aceite, rodar e conferir, commit, pedido de revisão listando os critérios
   cumpridos.
8. **Segredos.** Nenhuma chave no código. Segredos em `.env`, fora do Git.
9. **Explicar.** Ao terminar, explicar em português o que foi feito e por quê, para o grupo
   conseguir defender.
10. **Documentos em dia.** Se uma decisão mudar, atualizar os documentos.

## Convenções do Git

- Repositório: https://github.com/eiq03/adapta-ia
- Ramos no formato `tipo/tNN-descricao`, por exemplo `feat/t03-upload-imagem`.
- Mensagens de commit em português.
- O ramo entra em `main` por pedido de revisão, depois que outra pessoa do grupo olhar.

## Estrutura

- `frontend/`: React + TypeScript + Tailwind, organizado por funcionalidade em
  `src/features/`, com o que é comum em `src/shared/`.
- `backend/`: Python + FastAPI, organizado por camada em `app/` (`api`, `services`,
  `ai_providers`, `readers`, `models`), com testes em `tests/`.

## Estado atual

Especificação, constituição, specs 001 a 007 (aprovadas), arquitetura, tarefas e roadmap
escritos em 16/11/2026. Próxima etapa: E0 do roadmap (acordos), depois E1 (fundação).
Ainda não há código. Apresentação na quarta-feira, 18/11/2026, às 19h;
funcionalidades congeladas ao meio-dia.

Foco do produto: prova fotografada em branco. Atividades e conteúdos também são aceitos.
