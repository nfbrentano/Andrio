# (UI) Acessibilidade: cards do catálogo, menu mobile de catálogo/produto e lightbox

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Cards do catálogo (`js/catalogo.js`) são `<div>` com `click`; não são focáveis nem acionáveis por teclado. O botão "Ver Detalhes & Galeria" dispara navegação em duplicidade com o card.
  2. Cards do "Compre Junto" em `js/produto.js` usam `onclick` em `<div>`.
  3. O menu mobile de `catalogo.html`/`produto.html` (`initMenuMobile`) não atualiza `aria-expanded`/`aria-hidden`, não fecha com ESC, não move/retorna o foco nem trava o scroll — diferente da home (`js/app.js`).
  4. Lightbox (`js/produto.js`) sem `role="dialog"`, `aria-modal`, `aria-label` nos botões ‹ › ×, sem foco inicial e sem retorno de foco.
  5. Filtros usam `role="tablist"/"tab"` sem `tabpanel` associado nem navegação por setas; usar botões com `aria-pressed` ou implementar o padrão tabs completo.
  6. O campo de busca do catálogo não tem `<label>` associado.
- **Por que é necessário:** Usuários de teclado e leitores de tela não conseguem abrir produtos no catálogo; conformidade com WCAG 2.1 AA (e LBI 13.146/2015).
- **Qual valor será agregado:** Inclusão, melhor usabilidade geral e SEO.
- **Para quem é destinado:** Todos os visitantes, especialmente pessoas com deficiência.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Cada card do catálogo e do "Compre Junto" deve ser (ou conter) um `<a href>` único para o produto.
- RF02: Extrair a lógica acessível do menu da home para um módulo compartilhado e usá-la nas três páginas.
- RF03: Lightbox com `role="dialog"`, `aria-modal="true"`, foco preso, ESC fecha e foco retorna ao gatilho.
- RF04: Filtros com semântica coerente (`aria-pressed` ou tabs completas).
- RF05: `<label>` (visível ou `sr-only`) no campo de busca e no select de ordenação.

### Requisitos não-funcionais

- RNF01: Lighthouse Acessibilidade ≥ 95 em home, catálogo e produto.
- RNF02: Zero violações críticas no axe DevTools.

### Dependências técnicas

- `js/catalogo.js`, `js/produto.js`, `js/app.js`, `catalogo.html`, `produto.html`, `css/style.css`.

### Recursos necessários

- Leitor de tela (VoiceOver/NVDA) para validação manual.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que navego só com teclado no catálogo, quando pressiono Tab, então cada card recebe foco visível e Enter abre o produto.
- [ ] **CA02:** Dado o menu mobile aberto no catálogo, quando pressiono ESC, então ele fecha e o foco volta ao hambúrguer.
- [ ] **CA03:** Dado o lightbox aberto, quando pressiono Tab, então o foco permanece dentro dele; ESC fecha e o foco volta à imagem.
- [ ] **CA04:** Dado o VoiceOver, quando foco no hambúrguer, então é anunciado o estado expandido/recolhido.

## O que a atividade não inclui

- Correção do logo que esconde o hambúrguer (ver `2026-09-24_menu-mobile-inacessivel-logo-overflow.md`).
- Contraste dos botões de categoria (ver `2026-09-24_filtro-ativo-perdido-no-scroll.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Teclado no catálogo | Tab até o 1º card, Enter | Abre produto |
| CT02 | Menu mobile | 375px, abrir menu, ESC | Fecha e foco no hambúrguer |
| CT03 | Lightbox | Abrir, Tab 5x, ESC | Foco preso; volta ao gatilho |
| CT04 | axe | Rodar axe nas 3 páginas | 0 críticas |
| CT05 | Lighthouse | Rodar Acessibilidade | ≥ 95 |

## URL Complementar

- Documentação técnica: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ , https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código e validação de 2026-09-24.
