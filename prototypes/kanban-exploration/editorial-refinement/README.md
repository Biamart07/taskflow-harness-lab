# Estúdio Editorial — refinamento para revisão

Direção escolhida pela proprietária em 2026-10-11. Detalhes do Design System,
solução mobile e implementação definitiva **ainda aguardam aprovação**.
Fase 3, branch local `design/kanban-exploration`. Nenhum merge ou push nesta etapa.

## Arquivos e separação

- `prototype.html`: fonte editável do preview, fragmento HTML/CSS/JS.
- `index.html`: preview standalone, gerado pelo renderer da skill visualize.
- `gallery.html`: comparação das capturas reais; imagens clicáveis em resolução completa.
- `capture.mjs`: roteiro de verificação e capturas usando Playwright já instalado.
- `screenshots/*.png`: desktop/mobile, claro/escuro, estados e foco real de teclado.
- `screenshots/verification.json`: resultados e pares de contraste medidos.
- `../../../docs/design-system.md` e `../../../docs/ux-guidelines.md`: propostas para revisão.

O preview não é importado em `src/`, não entra no build Vite e permanece excluído
da varredura Tailwind pelo `@source not "../prototypes"` existente. Não copiar o
código gerado para a aplicação: ele contém runtime exclusivo de visualização.
Não implementa TASK-001..TASK-006, repositório, persistência ou regras de tarefa.

Os seis exemplos EX-01..EX-06 mantêm títulos, prioridades e colunas da exploração
anterior. Descrições e prazos opcionais foram adicionados à fixture imutável para
comparar densidade. Datas são fictícias; não existe cálculo de atraso. Ambas as
alternativas usam a mesma fixture. Trocar cenário altera só a apresentação.

Busca é read-only; filtro é cosmético; Nova tarefa é inerte e tem descrição
acessível indicando isso. Seleção de card só demonstra estado visual. O campo de
erro e Salvar desabilitado são amostras, não formulário ou validação funcional.

## Comparar

Abrir `gallery.html` ou servir a pasta pai:

```powershell
python -m http.server 4180 --bind 127.0.0.1 --directory prototypes/kanban-exploration
```

Galeria: `http://127.0.0.1:4180/editorial-refinement/gallery.html`.
Preview: `http://127.0.0.1:4180/editorial-refinement/index.html`.

Use a navegação inferior para trocar empilhamento/abas. No standalone, os controles
superiores selecionam tema, cenário e catálogo de estados. No Codex, Tweak oferece
essas escolhas quando disponível. Para ver a diferença responsiva, use viewport
de até 700px. Desktop mostra três colunas em ambas as alternativas.

O catálogo contém amostras fixas de hover e foco; os cards do dashboard também
respondem ao mouse e teclado. `keyboard-focus` registra Tab/Shift+Tab reais. Abas
implementam setas, Home/End e um ponto de entrada, inclusive painel vazio focável.

## Reproduzir

Com dependências existentes e Chromium disponível:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = 'C:\Pessoal\taskflow-harness-lab\.playwright-browsers'
node prototypes/kanban-exploration/editorial-refinement/capture.mjs
```

Para regenerar o standalone após editar a fonte, usar `scripts/render.py` da skill
visualize instalada, com `prototype.html`, saída `index.html` e `--force`.
Essa ferramenta é do ambiente, não dependência do projeto. As fontes sugeridas
usam Google Fonts com fallback; nenhuma dependência nova foi instalada.

Resultados: 20 checks de fixture, 24 layout, 26 teclado, 20 estados, 20 cenários e
10 galeria/controles. 92 pares de contraste renderizados passaram os limites;
textos ≥5.005:1 e pares não textuais ≥3.729:1, nos casos medidos. Sem erros JS.
Os checks são exploratórios, executados manualmente, sem integração nova ao CI.

Limites: não foi executado axe, auditoria completa WCAG, teste com leitor de tela,
zoom real ou matriz entre navegadores. O comportamento de foco quando um resize
oculta o elemento ativo permanece pendente. Identidade, densidade, legibilidade
e escolha mobile dependem da revisão humana. Não há evidência de feature pronta.
