# Adapta Aí

Ferramenta web para professores adaptarem materiais (foto, PowerPoint, texto) para alunos
com autismo (TEA), com linguagem simples, etapas e pictogramas do ARASAAC.
Trabalho acadêmico em grupo.

## Leia antes de qualquer tarefa

- `docs/especificacao.md`: o que o sistema faz, e o que entra na entrega (E1) ou depois (V2).
- `docs/arquitetura.md`: tecnologias, pastas, camadas e pontos em aberto.
- `docs/tarefas.md`: lista de tarefas, quando existir.

## Regras de trabalho

Aprovadas pelo grupo em 15/11/2026.

1. **Decidir junto.** Nada de escopo, biblioteca nova ou mudança de estrutura sem perguntar
   antes. Na dúvida, perguntar.
2. **Uma tarefa por vez**, tirada de `docs/tarefas.md`. Nada fora da tarefa.
3. **Camadas do servidor.** Rota não tem regra. Regra não conhece o Gemini, só o contrato
   de IA.
4. **Camadas da tela.** Componente não chama a API direto, usa o cliente em `shared`.
   Uma funcionalidade não importa de dentro de outra.
5. **Arquivo pequeno.** Uma responsabilidade por arquivo. Passou de 200 linhas, dividir.
6. **Idioma.** Código em inglês. Interface e documentos em português.
7. **Toda tarefa:** ramo próprio, teste do servidor, rodar e conferir, commit, pedido de
   revisão.
8. **Segredos.** Nenhuma chave no código. Segredos em `.env`, fora do Git.
9. **Explicar.** Ao terminar, explicar em português o que foi feito e por quê, para o grupo
   conseguir defender.
10. **Documentos em dia.** Se uma decisão mudar, atualizar os documentos.

## Estrutura

- `frontend/`: React + TypeScript + Tailwind, organizado por funcionalidade em
  `src/features/`, com o que é comum em `src/shared/`.
- `backend/`: Python + FastAPI, organizado por camada em `app/` (`api`, `services`,
  `ai_providers`, `readers`, `models`), com testes em `tests/`.

## Estado atual

Fases 1 (especificação) e 2 (arquitetura) escritas. Ainda não há código nem lista de tarefas.
