# [UI] Acessibilidade: cards do catálogo, "Compre Junto", lightbox e semântica dos filtros

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Antigravity · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-25

## Detalhes da Atividade

- **O que precisa ser feito:** Tornar navegáveis por teclado e leitor de tela os cards do catálogo, os cards do "Compre Junto", o lightbox e os filtros de categoria.
- **Problema e evidência:** Situação conferida em 2026-09-25. O menu mobile acessível já foi unificado em `js/shared/ui.js` no commit `f11a92a`. Continuam pendentes:
  1. Os cards do catálogo (`js/catalogo.js:147`) são `<div>` com `click`: não recebem foco e não abrem com o teclado. Card e botão "Ver Detalhes & Galeria" disparam a navegação duas vezes.
  2. Os cards do "Compre Junto" (`js/produto.js:138-144`) usam `onclick` em `<div>`.
  3. O lightbox (`js/produto.js:222-228`) não tem `role="dialog"`, `aria-modal` nem `aria-label` nos botões ‹ › ×, e não faz foco inicial nem devolve o foco.
  4. Os filtros usam `role="tablist"/"tab"` sem `tabpanel` e sem navegação por setas.
  5. O campo de busca do catálogo não tem `<label>` (só o select de ordenação tem).
- **Impacto de não fazer:** Quem usa só teclado ou leitor de tela não consegue abrir produtos no catálogo, o que também contraria a WCAG 2.1 AA e a LBI (Lei 13.146/2015).
- **Para quem é destinado:** Visitantes com deficiência visual ou motora e usuários de teclado.
- **História de usuário:** Como usuário de leitor de tela, quero navegar e abrir os produtos do catálogo pelo teclado, para conhecer as peças sem depender do mouse.
- **Como saberemos que deu certo:** Lighthouse Acessibilidade ≥ 95 e 0 violações críticas no axe em home, catálogo e produto.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Cada card do catálogo e do "Compre Junto" é (ou contém) um único `<a href>` para o produto. | P0 | CA01, CA05 |
| RF02 | Lightbox com `role="dialog"`, `aria-modal="true"`, botões rotulados, foco preso, ESC fecha e o foco volta ao gatilho. | P0 | CA02 |
| RF03 | `<label>` (visível ou `sr-only`) no campo de busca. | P0 | CA03 |
| RF04 | Filtros com semântica coerente: `aria-pressed` em botões, ou o padrão de tabs completo com setas. | P1 | CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Lighthouse Acessibilidade ≥ 95 em home, catálogo e produto. | P0 | CA01–CA04 |
| RNF02 | 0 violações críticas/sérias no axe DevTools. | P0 | CA01–CA04 |
| RNF03 | Foco visível (outline com contraste ≥ 3:1) em todos os elementos interativos. | P1 | CA01 |

### Dependências técnicas

- `js/catalogo.js`, `js/produto.js`, `js/shared/ui.js`, `catalogo.html`, `produto.html`, `css/style.css`.

### Recursos necessários

- Leitor de tela (VoiceOver/NVDA) para validação manual.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que navego só com teclado no catálogo, quando aperto Tab, então cada card recebe foco visível e Enter abre o produto.
- [x] **CA02:** Dado o lightbox aberto, quando aperto Tab, então o foco fica dentro dele; ESC fecha e o foco volta à imagem.
- [x] **CA03:** Dado o VoiceOver no campo de busca, quando ele recebe foco, então é anunciado um rótulo descritivo.
- [x] **CA04:** Dado o VoiceOver nos filtros, quando navego, então é anunciado qual categoria está selecionada.
- [x] **CA05:** Dado um clique num card do catálogo, quando a navegação acontece, então só uma entrada é adicionada ao histórico (caso negativo).

## O que a atividade não inclui

- Logo que esconde o hambúrguer: motivo: outra iniciativa (`2026-09-24_menu-mobile-inacessivel-logo-overflow.md`).
- Contraste dos botões de categoria: motivo: outra iniciativa (`2026-09-24_filtro-ativo-perdido-no-scroll.md`).

### Considerado para o futuro (P2)

- Auditoria de acessibilidade do painel administrativo.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O label da busca deve ser visível ou só para leitores de tela? | design | Não | Implementado como `sr-only` (visualmente oculto, acessível por leitores de tela e validado em conformidade com WCAG). |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Teclado no catálogo | e2e | CA01 | Tab até o 1º card e Enter | Abre o produto |
| CT02 | Lightbox | e2e | CA02 | Abrir, Tab 5x, ESC | Foco preso; volta ao gatilho |
| CT03 | Label da busca | manual | CA03 | VoiceOver no campo | Rótulo anunciado |
| CT04 | Filtros | manual | CA04 | VoiceOver nos botões | Estado selecionado anunciado |
| CT05 | Histórico | e2e | CA05 | Clicar no card e voltar | Volta direto ao catálogo |
| CT06 | axe/Lighthouse | manual | CA01–CA04 | Rodar nas 3 páginas | 0 críticas; ≥ 95 |

## URL Complementar

- Documentação técnica: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ , https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- Protótipo / mockup: N/A.
- Discussões relacionadas: commit `f11a92a` (menu mobile unificado).
- Referências de design: N/A.
- Requisitos originais: Revisão de código e validação de 2026-09-24.
- Issue / PR relacionado: N/A.
