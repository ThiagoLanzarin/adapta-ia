# Adapta Aí — Constituição

> Princípios que nenhuma spec, plano ou código pode contrariar. Equivale ao `constitution.md`
> do GitHub Spec Kit. Mudar um princípio exige aprovação do grupo inteiro e uma linha no
> registro ao final.
> As regras do dia a dia (ramos, commits, tamanho de arquivo) estão no `CLAUDE.md`.

## Princípios do produto

### P1 — Fidelidade pedagógica
A adaptação muda a forma, não o conteúdo cobrado. Nenhuma questão some, nenhuma
alternativa some, nada é acrescentado e a resposta nunca é sugerida. Quando o sistema não
consegue garantir isso, ele avisa o professor.

### P2 — O professor decide
A IA propõe; o professor revisa, edita e aprova antes de imprimir. Toda saída da IA pode
ser corrigida à mão.

### P3 — A criança não é identificada
O nome do aluno nunca é pedido nem enviado. O apelido do perfil não sai do navegador. O
diagnóstico pode ser enviado, sem o nome, para melhorar a adaptação. O material é
fotografado em branco.

### P4 — Custo zero para o professor
Sem login, sem pagamento e sem instalação. Tudo roda no navegador e em serviços gratuitos.

### P5 — Crédito e licença do ARASAAC
Toda folha traz o crédito do ARASAAC. Uso não comercial (CC BY-NC-SA).

## Princípios de engenharia

### E1 — Spec antes do código
Nenhum código entra sem uma spec aprovada que o justifique. Se o comportamento muda, a spec
muda primeiro, no mesmo pedido de revisão.

### E2 — Simplicidade
A solução mais simples que cumpre a spec. Nada de camada, biblioteca ou abstração "para o
futuro". A única exceção aprovada é o contrato de IA (E4).

### E3 — Camadas rígidas
O servidor segue a arquitetura em camadas descrita em `arquitetura.md`. Uma camada só chama
a de baixo. A tela segue a organização por funcionalidade.

### E4 — Provedores trocáveis
Todo serviço externo (IA e ARASAAC) fica atrás de uma interface. As regras não sabem qual
provedor está ligado. Só o ponto de montagem (`main.py`) escolhe.

### E5 — Critério de aceite vira teste
Todo critério de aceite marcado `[teste]` numa spec tem um teste automático no servidor com
o mesmo identificador. Os marcados `[manual]` são conferidos no navegador antes do pedido de
revisão.

### E6 — Contrato único
Tela e servidor trocam dados só pelo contrato da seção 10 de `arquitetura.md`. O exemplo
`docs/contrato-exemplo.json` é validado por teste.

### E7 — Falha clara
Todo erro chega ao professor como uma mensagem em português que diz o que fazer. Nenhum erro
técnico aparece na tela.

### E8 — Segredos fora do código
Nenhuma chave no código nem no Git. Configuração por variáveis de ambiente.

## Portões (gates)

| Antes de | Conferir |
|---|---|
| Aprovar uma spec | Não fere nenhum princípio; não tem `[PRECISA ESCLARECER]` aberto; todo critério tem `[teste]` ou `[manual]` |
| Começar uma tarefa | A spec da tarefa está `aprovada` |
| Abrir o pedido de revisão | Lista os critérios cobertos; os testes `[teste]` passam; os `[manual]` foram conferidos |

## Registro

- 16/11/2026: constituição criada a partir das decisões de 14 a 16/11/2026.
