# TaskFlow — Diretrizes de UX propostas

Status: **proposta para revisão humana**, Fase 3, 2026-10-11.
Ler junto com `design-system.md`, `architecture.md` e os contratos do harness.
A direção Estúdio Editorial foi escolhida pela proprietária; os detalhes deste
documento e a interface definitiva aguardam revisão. Sem mudança nos registros
de aprovação, estados de features ou fase.

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

## Mobile: comparação em revisão

| Critério | Colunas empilhadas | Abas |
| --- | --- | --- |
| Visão de conjunto | Todas as tarefas no documento | Contagens das três colunas |
| Rolagem | Cresce com o total de tarefas | Cresce com a coluna ativa |
| Custo de navegação | Rolagem até o estado | Uma ação para trocar estado |
| Acessibilidade | Fluxo de leitura simples | Exige padrão de abas correto |
| Recomendação | Boa alternativa para leitura geral | Preferida provisoriamente para mobile |

Abas: `tablist` nomeado; `tab` com `aria-selected`, `aria-controls` e ID único;
painel com `tabpanel` e `aria-labelledby`. Um ponto de entrada no conjunto,
setas esquerda/direita com retorno circular, Home/End, Tab para o conteúdo.
Ativação automática é apropriada neste protótipo sem latência. Painel vazio pode
receber foco para a leitura do estado vazio. Ao retornar ao desktop, todas as
colunas reaparecem e os papéis de aba dos painéis são removidos.

Manter foco previsível ao mudar breakpoint; o protótipo não resolve o caso em que
um elemento focado é ocultado durante redimensionamento. Testar e definir essa
política antes da implementação definitiva. Abas não são recurso de mover tarefas.

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
- Preferência entre abas e empilhamento com tarefas reais e uso prolongado.
- Leitura por leitor de tela (por exemplo NVDA), ordem de anúncio e clareza do feedback.
- Compreensão das mensagens, facilidade de recuperação e conforto dos fluxos.
- Comparação visual de screenshots: uma diferença de pixels não decide se houve
  melhora ou regressão; baseline só depois de aprovação explícita.

Automação identifica parte das falhas e sustenta evidência repetível. Não certifica
conformidade WCAG completa nem substitui avaliação de pessoas usando o produto.

## Gate dentro da Fase 3

Próxima decisão humana: aprovar ou ajustar tokens, estados, cards e solução mobile.
Até lá, manter esta documentação como proposta e os protótipos fora da produção.
Não editar `harness/features.json`, `harness/phases.json` ou registros de aprovação
para registrar escolha estética. Não fazer merge. A escolha da direção não
autoriza avançar de fase ou implementar funcionalidades.

Referências: [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
[WAI-ARIA APG: abas](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/),
[Playwright: acessibilidade](https://playwright.dev/docs/accessibility-testing).
