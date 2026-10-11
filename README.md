# taskflow-harness-lab

Laboratório prático de Harness Engineering aplicado ao desenvolvimento web com agentes de IA.

## Objetivos

- Explorar como contexto, instruções, ferramentas e validações orientam agentes de IA no desenvolvimento web.
- Evoluir o Taskflow como aplicação de referência para experimentar o harness.
- Registrar decisões, resultados e aprendizados de cada fase.
- Tornar o trabalho dos agentes verificável e reproduzível.

## Arquitetura proposta

O laboratório será organizado em três partes:

- **Aplicação web (Taskflow):** produto usado para exercitar o desenvolvimento com agentes. A stack e os componentes serão definidos durante as primeiras fases.
- **Harness:** instruções para agentes, contexto do projeto, ferramentas, fluxos de trabalho e critérios de conclusão.
- **Validação e documentação:** verificações automatizadas, evidências de execução e registro das decisões e experiências.

Esta arquitetura é o ponto de partida; sua implementação e suas mudanças serão documentadas conforme o laboratório evoluir.

## Evolução do harness

1. **Fundação:** definir escopo, estrutura do projeto e instruções iniciais para os agentes.
2. **Aplicação inicial:** construir os primeiros fluxos do Taskflow e estabelecer critérios de aceitação.
3. **Validação:** incorporar testes, verificações de qualidade e evidências de conclusão.
4. **Iteração:** observar falhas, ajustar contexto e ferramentas e comparar os resultados.

Estado atual: repositório inicializado com documentação e licença. As fases acima representam o plano inicial de evolução.

## Convenções de trabalho

- Usar commits pequenos e descritivos, com uma mudança coerente por commit.
- Registrar como o harness evolui ao longo das fases.
- Atualizar a documentação quando houver mudanças de arquitetura, decisões ou fluxos de trabalho.
- Verificar cada mudança com os critérios e ferramentas disponíveis na respectiva fase.

Exemplos de mensagens de commit:

```text
docs: define objetivos e arquitetura inicial
feat: adiciona criação de tarefas
test: valida fluxo de criação de tarefas
docs: registra ajustes nas instruções dos agentes
```

A branch principal é `main`.

## Licença

Este projeto utiliza a licença [MIT](LICENSE).

## Executar a estrutura da aplicação

Requer Node.js 22.13 ou superior na série 22 e npm. A versão testada é 22.19.

```sh
npm ci
npm run dev
```

- `npm run check`: lint, TypeScript, build, smoke Vitest e testes existentes do harness.
- `npm run test:watch`: Vitest em modo interativo.
- `npx playwright install chromium`: instala o navegador para os testes E2E.
- `npm run test:e2e`: smoke em Chromium sobre o build de produção; inicia e encerra seu próprio servidor.
- `npm run preview`: prévia do build já gerado.

Vitest executa apenas `tests/app/`; Playwright executa `tests/e2e/`; os testes
Node do harness continuam em `tests/*.test.mjs`. Os testes de inicialização não
validam os critérios de TASK-001. A feature, a persistência e seus jobs dedicados
ainda não foram implementados; as políticas de aprovação continuam pendentes.

A estrutura de camadas está descrita em `docs/architecture.md`. Tailwind CSS 4
é integrado pelo plugin oficial `@tailwindcss/vite` e pelo import em `src/styles.css`.
O lockfile deve ser versionado para instalação reproduzível.
