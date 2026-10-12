# TaskFlow — Design System v1

Status: **Design System v1 aprovado pela proprietária em 2026-10-12**, Fase 3.

A proprietária escolheu **Estúdio Editorial** na conversa: creme e violeta,
DM Sans, navegação superior, título expressivo e cards arredondados. Essa escolha
aprova a direção visual. A proprietária também aprovou explicitamente as abas no
Kanban mobile e os requisitos listados em “Navegação responsiva aprovada”. Tokens,
geometria e demais componentes/comportamentos continuam propostos. Essas decisões
não autorizam implementar features, encerrar a Fase 3 ou alterar registros de
aprovação. Este documento não é uma aprovação de feature ou fase do harness.

## Intenção e limites

Um espaço pessoal de trabalho com personalidade editorial, clareza e calma.
A expressão visual se concentra no título e nas superfícies; a informação das
tarefas permanece simples e previsível. Não adicionar métricas, menus ou elementos
de produtividade sem necessidade real.

Referência executável isolada: `prototypes/kanban-exploration/editorial-refinement/`.
Não importar esse código na aplicação. A arquitetura de `docs/architecture.md`
permanece intacta: UI → aplicação/domínio → interface de repositório → adaptador.
Tokens futuros pertencem à apresentação, sem operações de tarefa ou persistência.

## Tokens de cor

Os nomes são semânticos; os valores abaixo são a referência aprovada para a versão 1.
O protótipo usa o prefixo `--ed-`; a implementação deve preservar a intenção
semântica e registrar qualquer alteração posterior dos tokens para revisão.

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| canvas | `#F8F4EF` | `#211A29` | Fundo creme / ameixa |
| surface | `#FFFDFA` | `#2D2437` | Cards e controles |
| text | `#30253C` | `#F6EDF9` | Títulos e conteúdo |
| text-secondary | `#6D5C74` | `#C8B6D1` | Descrição, prazo, apoio |
| accent | `#7040A0` | `#D5B2F1` | Ação principal, foco, seleção |
| on-accent | `#FFFFFF` | `#291A35` | Texto na ação principal |
| surface-selected | `#EFE5F4` | `#45344E` | Seleção e navegação ativa |
| border-decorative | `#E4DAD0` | `#55445F` | Separadores e contorno dos cards |
| border-control | `#917C99` | `#A88BBC` | Campos, abas, hover |
| status-todo | `#6D5C74` | `#C8B6D1` | Círculo vazio + “A fazer” |
| status-progress | `#7040A0` | `#D5B2F1` | Círculo parcial + “Em andamento” |
| status-done | `#34624D` | `#A8D7BB` | Check + “Concluído” |
| error / priority-high | `#993428` | `#FDB9A4` | Erro explícito / badge Alta |
| surface-error | `#FDECE8` | `#4A2A24` | Erro e badge Alta |
| priority-medium | `#805C0D` | `#EFD292` | Badge Média |
| surface-medium | `#FFF2D3` | `#40351C` | Fundo badge Média |
| priority-low | `#435B79` | `#AFC7E7` | Badge Baixa |
| surface-low | `#EAF0F8` | `#26354B` | Fundo badge Baixa |
| shadow-color | `#30253C12` | `#00000038` | Elevação discreta no hover |

Prioridade e status são conceitos distintos. Usar símbolos e rótulos: ↑ Alta,
— Média, ↓ Baixa. Status fica no cabeçalho da coluna, sem colorir o card inteiro.
Os símbolos do protótipo são caracteres decorativos; validar sua aparência entre
plataformas antes de decidir o recurso final, sem instalar biblioteca agora.

`border-decorative` não identifica sozinho uma ação. Não o usar como único
indicador de campo ou controle. O limite do botão que ocupa o card não é necessário
para identificar a tarefa: título e metadados visíveis já o fazem. Revisar essa
decisão no produto final; controles essenciais usam `border-control`.

## Tipografia e geometria

Família: **DM Sans**, fallback `system-ui, sans-serif`. Pesos 400 para corpo,
500 para títulos e ações, 600 para estados/cabeçalhos, 700 apenas para marca.
O protótipo carrega Google Fonts; instalação de pacote não ocorreu. Proposta futura:
hospedar WOFF2 localmente, após revisar licença, peso e política de carregamento.
A ausência da fonte deve preservar a usabilidade com o fallback.

| Elemento | Tamanho / entrelinha | Regra |
| --- | --- | --- |
| Título da página | 42px / 1.12 desktop; 34px / 1.12 mobile | Expressivo, permite quebra |
| Título do card | 17px / 1.4 | Sempre completo, sem ellipsis |
| Texto principal / campos | 16px / 1.5 | Campos legíveis no mobile |
| Descrição do card | 14px / 1.5 | Opcional, breve |
| Rótulos / contagem | 13px / 1.5 | Contraste de texto normal |
| Prioridade / prazo / seleção | 12px / 1.5 | Informação secundária |
| ID fictício de comparação | 11px / 1.5 | Só no protótipo; omitir no produto |

Escala de espaço proposta: 4, 8, 12, 16, 18, 24, 28, 32, 40 e 48px.
18px atende ao padding dos cards; não criar valores arbitrários fora dos tokens
aprovados. Gutter da página: 40px desktop, 24px tablet, 18px mobile.
Gap entre colunas: 24px desktop, 16px tablet; entre cards: 12px.
Cards: raio 18px, borda 1px. Controles: raio 14px; abas: 12px; badges: 8px.
Seleção: borda 2px sem deslocar o conteúdo (compensar padding).
Hover: sombra `0 5px 16px shadow-color`, sem escala ou salto.

## Componentes e estados

- **Navegação superior:** marca + “Meu quadro” como item atual. Não criar destinos
  fictícios. No protótipo o item é apenas ilustrativo; no produto, usar link se navegar.
- **Cabeçalho:** título, apoio curto e ação principal. “Nova tarefa” é inerte na
  exploração e identificada como ilustrativa; não há formulário funcional.
- **Card:** título → descrição opcional → prioridade/prazo opcionais. Campos
  ausentes não reservam linhas vazias. O exemplo usa duas descrições curtas e três
  prazos fictícios, sem cálculo de atraso. Descrições longas poderão ter resumo
  explícito e acesso ao conteúdo completo; comportamento ainda não implementado.
- **Interação do card:** um botão nativo para seleção visual no protótipo. Essa
  seleção não decide se o card final abrirá detalhes ou edição; essa interação está
  pendente. Não colocar controles interativos dentro de outro botão.
- **Filtros:** busca com rótulo visível e seletor de prioridade. Somente amostras;
  busca read-only e seletor cosmético, sem filtragem de tarefas.
- **Formulário futuro:** rótulo persistente, campo 44px, ajuda e erro associado por
  `aria-describedby`, `aria-invalid` no erro. Não usar placeholder como rótulo.
- **Modal futuro:** largura sugerida 480px, padding 24px, reflow dentro da viewport;
  cabeçalho, conteúdo e ações. Dialog semântico, foco inicial, confinamento de foco,
  Escape e retorno ao acionador precisam ser implementados e testados no momento
  autorizado. Nenhum modal funcional foi criado nesta etapa.

| Estado | Tratamento proposto | Evidência atual |
| --- | --- | --- |
| Padrão | Superfície neutra, título claro | Dashboard |
| Hover | Borda de controle + sombra sutil | Hover real verificado; amostra fixa |
| Foco | Anel 3px accent, offset 3px | Tab/Shift+Tab real e captura separada |
| Seleção | Fundo suave, borda 2px, “✓ Selecionada” | `aria-pressed`, Space/Enter |
| Erro | Borda e mensagem explícita | Campo estático, não validação de feature |
| Desabilitado | Button `disabled`, sem opacidade global, ajuda visível | Amostra nativa |
| Loading | Texto “Carregando tarefas…” / `role=status` | Cenário estático sem animação |

Foco e seleção podem coexistir. A amostra de foco no catálogo é uma demonstração
visual; as capturas `keyboard-focus` vêm de teclado real. Anel nunca deve ser
cortado pelo container. Futuras transições devem respeitar `prefers-reduced-motion`.

## Navegação responsiva aprovada

Decisão explícita da proprietária na conversa, registrada em 2026-10-11:

- **Desktop:** três colunas lado a lado.
- **Mobile:** uma coluna visível por vez, com abas **A fazer**, **Em andamento** e
  **Concluído**. Cada aba exibe a quantidade de tarefas da respectiva coluna.
- Navegação acessível por toque e teclado, seguindo o padrão WAI-ARIA de tabs.
- Foco visível e gerenciamento adequado de foco na mudança de breakpoint:
  preservar o foco quando seu elemento continuar visível; quando for ocultado,
  manter o contexto e transferir o foco para um destino visível e lógico.
- Sem rolagem horizontal para navegar entre tarefas.

O requisito de gerenciamento de foco está aprovado; sua implementação e
verificação continuam pendentes. Ver critérios de aceite em `ux-guidelines.md`.
Colunas empilhadas ficam como histórico da exploração, não como alternativa
pendente de escolha para o produto. Não adicionar seletor de layout ao produto.

### Breakpoints e medidas ainda propostos

- Acima de 900px: três colunas iguais, gutters 40px.
- De 701 a 900px: três colunas, gutters 24px, cards com padding 14px.
- Até 700px: filtros e ação empilhados, gutters 18px, cards com padding 18px.
  Sem rolagem horizontal para ler tarefas. Testar também zoom/reflow.

O limite de 700px, o tratamento intermediário de tablet, gutters e paddings acima
integram a referência inicial da versão 1. Podem ser refinados quando testes de
legibilidade, zoom/reflow e densidade demonstrarem necessidade; registrar desvios.

## Verificação e revisão

Metas: WCAG 2.2 AA, texto normal ≥4.5:1 (inclusive secundário); conteúdo não textual
essencial ≥3:1 contra cores adjacentes. Meta interna de área de toque ≥44×44px,
mais exigente que o mínimo AA de 24px com exceções do critério 2.5.8.
Anel de 3px é proposta visual, não garantia automática de conformidade de foco.
Texto desabilitado também mantém ≥4.5:1 como escolha do projeto, embora controles
inativos tenham exceção nos requisitos WCAG de contraste.

Evidência local: `screenshots/verification.json` no refinamento editorial registra
92 medições de contraste de pares renderizados; mínimos 5.005:1 texto e 3.729:1
não textual, nos pares avaliados. Não cobre todas as combinações possíveis.
24 checks de layout, 20 checks de fixture, 26 checks de teclado, 20 checks de
estado e 20 checks de cenários passaram. DM Sans carregou no Chromium.

Critérios automatizáveis e limites humanos estão em `docs/ux-guidelines.md`.
Nenhum resultado autoriza feature `done` ou mudança de fase.

Referências primárias: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) e
[padrão de abas WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

## Aprovação humana do Design System v1

Em 2026-10-12, a proprietária aprovou a versão atual do Design System Estúdio
Editorial, incluindo tokens, tipografia, geometria, variantes claro/escuro,
componentes e estados visuais propostos, além do padrão mobile por abas já aprovado.
Essa aprovação autoriza o uso desta documentação como referência visual da
implementação dentro da Fase 3, respeitando o escopo de trabalho autorizado.

Continuam exigindo especificação e validação conforme cada feature: fluxos reais,
comportamento de modal, seleção/edição, gerenciamento de foco, contraste de todos
os novos estados, zoom e uso com tecnologias assistivas. Os protótipos não passam
a ser código de produção automaticamente.

Aprovar o Design System não altera `harness/features.json`, `harness/phases.json`,
não concede `done` a qualquer feature e não aprova a Fase 4.
