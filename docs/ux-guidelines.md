# TaskFlow — Diretrizes de UX v1

Status: **diretrizes e Design System v1 aprovados em 2026-10-12**, Fase 3.
Ler junto com `design-system.md`, `architecture.md` e os contratos do harness.
A identidade Estúdio Editorial e a navegação por abas no Kanban mobile foram
aprovadas explicitamente pela proprietária. A versão 1 atual do Design System
e destas diretrizes foi aprovada como referência para o desenvolvimento.
A implementação funcional e sua validação continuam pendentes. Sem mudança nos
registros de aprovação do harness, estados de features ou fase.

## Princípios

1. Dar prioridade ao título e ao próximo passo, sem ornamentação que concorra com tarefas.
2. Mostrar informações quando existem: descrições e prazos opcionais não geram placeholders.
3. Tornar estado e feedback explícitos, sem depender de cor ou hover.
4. Manter a ordem e a terminologia estáveis: A fazer → Em andamento → Concluído.
5. Preservar as intenções e os dados do usuário diante de falhas, quando os fluxos forem implementados.
6. Evitar informações inventadas: contagens devem corresponder aos dados e ao contexto de filtros.

## Leitura e navegação

Ordem de leitura: navegação → título/ação → filtros → colunas → cards.
Um H1 para a página e H2 para cada coluna. Contagem junto ao estado, nunca
substituindo o rótulo. Ícones de status são decorativos (`aria-hidden`); o texto
completo permanece acessível. Prioridade e prazo têm nomes explícitos.

Títulos longos quebram linhas, sem truncamento. Metadados secundários não devem
competir com o título. IDs EX são instrumentos de comparação, não informação de
produto. Não transformar todo o quadro em um widget ARIA complexo sem necessidade:
seções e botões nativos bastam para a exploração.

## Navegação responsiva aprovada

Desktop mantém **três colunas lado a lado**. Mobile apresenta **uma coluna por
vez**, com abas **A fazer**, **Em andamento** e **Concluído**, cada uma com a
quantidade de tarefas da coluna. Toque e teclado devem seguir o padrão WAI-ARIA
de tabs, com foco visível, gerenciamento de foco no breakpoint e sem rolagem
horizontal para navegar entre tarefas. Decisão explícita registrada em 2026-10-11.

A comparação abaixo permanece como justificativa e histórico da exploração;
colunas empilhadas não estão mais pendentes de escolha.

| Critério | Colunas empilhadas | Abas |
| --- | --- | --- |
| Visão de conjunto | Todas as tarefas no documento | Contagens das três colunas |
| Rolagem | Cresce com o total de tarefas | Cresce com a coluna ativa |
| Custo de navegação | Rolagem até o estado | Uma ação para trocar estado |
| Acessibilidade | Fluxo de leitura simples | Exige padrão de abas correto |
| Decisão | Preservada como histórico exploratório | Aprovada para o Kanban mobile |

Abas: `tablist` nomeado; `tab` com `aria-selected`, `aria-controls` e ID único;
painel com `tabpanel` e `aria-labelledby`. Um ponto de entrada no conjunto,
setas esquerda/direita com retorno circular, Home/End, Tab para o conteúdo e
Shift+Tab para retornar na ordem de navegação. Toque/click ativa a aba escolhida.
Ativação automática é apropriada neste protótipo sem latência; se a implementação
futura exigir ativação manual, Enter/Space ativa a aba focada. Painel vazio pode
receber foco para a leitura do estado vazio. Ao retornar ao desktop, todas as
colunas reaparecem e os papéis de aba dos painéis são removidos.

### Foco na mudança de breakpoint: critérios obrigatórios

- Preservar o foco quando o elemento continuar visível, inclusive controles fora
  do quadro. Não roubar foco ao redimensionar ou redefinir a coluna sem necessidade.
- Se a mudança ocultar o elemento focado, transferir o foco para um destino visível
  e lógico do mesmo contexto. Nunca deixá-lo em painel oculto ou perdê-lo no body.
- Ao entrar no mobile com foco dentro de uma coluna, manter essa coluna visível
  e sua aba selecionada, preservando o elemento focado quando possível.
- Ao voltar ao desktop com foco em uma aba que será ocultada, encaminhar o foco
  ao conteúdo/cabeçalho visível da coluna correspondente. Se o foco já estiver em
  um card que continua visível, preservá-lo.
- Validar as duas direções do breakpoint, as três colunas, painel vazio, toque e
  teclado. A transferência programática também precisa de foco visível.

Esses critérios detalham o requisito aprovado de foco adequado, sem implementar
comportamento. O protótipo atual não resolve a recuperação de foco quando resize
oculta um elemento; a limitação continua pendente de implementação e testes.
O valor exato do breakpoint e o modo de ativação final ainda dependem de revisão.
Abas não são recurso de mover tarefas.

## Fluxos futuros, não implementados

- **Criar:** acionar Nova tarefa, preencher campos, validar, confirmar; sucesso
  mostra a tarefa na coluna inicial e anuncia resultado. Erro preserva o conteúdo
  preenchido. Detalhes e autorização de TASK-001 ainda pendentes.
- **Consultar/editar:** decidir se card abre painel ou modal; ação acessível pelo
  teclado, foco retorna ao acionador ao fechar. Seleção exploratória não define isso.
- **Mover:** prever controle acessível por teclado e toque, além de eventual drag;
  anunciar origem/destino e resultado. Não tornar arrastar o único caminho.
- **Filtrar:** mostrar filtros ativos, contagem coerente e ação de limpar; buscar
  sem perder contexto. O seletor e a busca atuais são amostras, não filtros reais.
- **Excluir:** confirmação proporcional ao risco, foco previsível e comunicação
  do resultado; sem implementar exclusão nesta etapa.

Todo fluxo futuro permanece nas camadas previstas pela arquitetura. Estados
visuais são renderizados pela UI; regras e persistência pertencem a outras camadas.

## Estados e linguagem

| Estado | Proposta |
| --- | --- |
| Quadro vazio | “Um novo começo.” + orientação curta; futura ação Nova tarefa |
| Coluna vazia | “As tarefas concluídas aparecerão aqui.” ou mensagem específica do estado |
| Sem resultados | “Nenhuma tarefa encontrada.” + orientação para rever filtros |
| Loading | Mensagem de carregamento; anunciar sem repetir por cada skeleton |
| Erro ao carregar | Mensagem explícita, contexto e futura ação de tentar novamente |
| Campo inválido | Mensagem específica associada ao campo; explicar como corrigir |
| Ação desabilitada | Razão visível, não apenas diferença de opacidade |

Os cenários do protótipo são presets sem requisições ou falhas reais. O exemplo de
erro diz que tarefas não foram alteradas porque a fixture é imutável; no produto
usar essa mensagem apenas quando o sistema puder garantir isso. Loading por coluna
é amostra visual; o produto deve preferir uma região de status consolidada e
`aria-busy` na região atualizada, evitando anúncios duplicados.

Não usar `role=alert` para mensagens neutras. Sucesso/seleção: `aria-live=polite`;
falha relevante: alert apropriado. Não anunciar hover. O campo inválido do catálogo
é estático; a validação real deve ser avaliada na feature autorizada.

## Critérios objetivos e ferramentas

| Regra verificável | Ferramenta / evidência | Estado nesta entrega |
| --- | --- | --- |
| Texto ≥4.5:1 nos pares usados; controles/foco ≥3:1 | Cálculo WCAG das cores computadas no Chromium | 92 pares passaram; cobertura delimitada |
| Mesmo conteúdo nas alternativas | Fixture imutável, IDs e títulos | 20 checks passaram |
| Sem overflow horizontal | Playwright, 320/390/768/1024/1280px, ambos temas | 20 dashboard + 4 catálogo passaram |
| Foco visível, seleção via teclado | Tab/Shift+Tab, Space/Enter, CSS computado, screenshot | Verificado nos cards |
| Abas corretas por teclado | Setas, Home/End, Tab, aria-selected, painel visível | Verificado, incluindo painel vazio |
| Contagens por coluna e uma coluna visível no mobile | Playwright: comparar abas com dados e verificar painéis visíveis | Requisito aprovado; validação abrangente futura |
| Preservar/recuperar foco ao cruzar breakpoint | Playwright: foco em cada coluna/aba, resize nos dois sentidos, destino visível | Requisito aprovado; não implementado/verificado no protótipo |
| Erro associado e disabled nativo | `aria-invalid`, `aria-describedby`, atributo disabled | Amostras verificadas; sem validação de tarefa |
| Ausência de erros JS | Listener pageerror | Zero no roteiro executado |
| Semântica JSX e nomes acessíveis | ESLint + futuro eslint-plugin-jsx-a11y | Plugin não instalado; regra futura |
| WCAG automatizável na aplicação | Futuro @axe-core/playwright, scans por tema/estado | Não instalado, não executado |
| Área de toque ≥44×44px | Playwright bounding boxes de controles efetivos | Meta proposta; medição abrangente pendente |
| Zoom 200%, reflow a 400%, textos ampliados | Browser/Playwright + revisão humana | Pendente; larguras não substituem zoom |
| Modal: foco/Escape/retorno | Playwright no fluxo funcional futuro | Não implementado, não testado |
| Preferência de movimento/tema | emulateMedia + testes após implementação | Tema explícito testado; demais pendentes |
| Não acessar storage na UI | ESLint já existente no projeto | Regra atual limitada; sem novas exceções |

Os 26 checks de teclado e 20 de estado são verificações da exploração, não testes
de aceitação TASK-001..TASK-006. `capture.mjs` é executado manualmente e não foi
adicionado ao CI da aplicação. Resultados estão na pasta de screenshots.

Não confundir o job `validate` (harness) com auditoria de UI. A futura integração
de acessibilidade deve usar checks próprios, preservar suas dependências e
respeitar as políticas de evidência para a revisão exata. Toda dependência nova
precisa de justificativa e autorização prévia; nenhuma foi instalada aqui.

## Revisão humana obrigatória

- Personalidade Editorial, equilíbrio creme/violeta e qualidade do tema escuro.
- Legibilidade real da DM Sans, especialmente prazo e badges no mobile.
- Densidade de cards longos e leitura quando muitos cards tiverem descrição.
- Clareza dos símbolos e distinção entre status, prioridade, seleção e foco.
- Usabilidade das abas aprovadas com tarefas reais e uso prolongado; ajustar
  densidade e medidas sem reabrir a escolha do padrão por inferência do agente.
- Leitura por leitor de tela (por exemplo NVDA), ordem de anúncio e clareza do feedback.
- Compreensão das mensagens, facilidade de recuperação e conforto dos fluxos.
- Comparação visual de screenshots: uma diferença de pixels não decide se houve
  melhora ou regressão; baseline só depois de aprovação explícita.

Automação identifica parte das falhas e sustenta evidência repetível. Não certifica
conformidade WCAG completa nem substitui avaliação de pessoas usando o produto.

## Gate de design aprovado dentro da Fase 3

A proprietária aprovou em 2026-10-12 a versão 1 do Design System e destas
diretrizes de UX, incluindo a identidade Editorial e abas no mobile. Esta é uma
referência aprovada, não uma afirmação de conformidade WCAG nem de conclusão das
features. Ajustes descobertos durante implementação e testes devem ser documentados
para revisão humana. Os protótipos permanecem isolados da produção.

Não editar `harness/features.json`, `harness/phases.json` nem registros de aprovação
para registrar decisões estéticas. A aprovação do design não aprova funcionalidades
nem avançar para a Fase 4.

Referências: [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
[WAI-ARIA APG: abas](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/),
[Playwright: acessibilidade](https://playwright.dev/docs/accessibility-testing).
