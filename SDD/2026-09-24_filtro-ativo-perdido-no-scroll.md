# [FIX] Botão de categoria ativo perde o destaque ao rolar a home

## Detalhes da Atividade

- **O que precisa ser feito:** Em `js/app.js:681-709`, um `IntersectionObserver` de "seção atual" percorre os `.fun-pill-btn` e remove a classe `active` de todos cujo `href` não contém o id da seção. Como os botões de categoria são `<button>` sem `href`, **todos perdem `active`** assim que qualquer seção cruza o meio da tela. Também, ao clicar em outra categoria, o `aria-selected` e `active` são aplicados e logo removidos pelo observer.
- **Por que é necessário:** O usuário não sabe qual categoria está vendo; `aria-selected="true"` fica inconsistente com o visual (validado: após rolar até o catálogo, nenhum botão tinha `active`, mas "poltrona" mantinha `aria-selected="true"`).
- **Qual valor será agregado:** Feedback visual correto e estado acessível consistente.
- **Para quem é destinado:** Visitantes da home.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: O observer de seção não deve alterar o estado dos filtros de categoria (remover o bloco ou restringi-lo a links de âncora reais).
- RF02: O botão da categoria selecionada deve manter `active` e `aria-selected="true"` até outra categoria ser escolhida.
- RF03: O estilo visual do botão ativo deve diferir dos inativos (hoje `applyButtonActiveColor` pinta todos com a mesma cor sólida).

### Requisitos não-funcionais

- RNF01: Contraste do botão ativo/inativo conforme WCAG AA (4.5:1 para o texto; atenção ao amarelo `#ffcd01` com texto branco).

### Dependências técnicas

- `js/app.js`, `css/style.css` (`.fun-pill-btn.active`).

### Recursos necessários

- N/A — sem dependências externas.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou na home com "Poltronas" selecionado, quando rolo a página até o fim, então "Poltronas" continua com destaque de ativo.
- [ ] **CA02:** Dado que clico em "Mesas", quando o catálogo rola até a seção, então apenas "Mesas" fica ativo e com `aria-selected="true"`.
- [ ] **CA03:** Dado os 4 botões, quando observo visualmente, então é possível distinguir o ativo dos demais.

## O que a atividade não inclui

- Mudança de layout da navbar.
- Adição de nova categoria "Todos" (ver `2026-09-24_busca-e-filtros-do-catalogo.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Scroll | Carregar home, rolar até `#secao-catalogo` | `.fun-pill-btn.active` = 1 elemento |
| CT02 | Troca de categoria | Clicar "Cadeiras", aguardar 1s | Apenas "Cadeiras" com `active` e `aria-selected=true` |
| CT03 | Contraste | Rodar Lighthouse/axe | Sem erro de contraste nos botões |

## URL Complementar

- Documentação técnica: N/A.
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24 (estado dos botões após scroll: todos `active=false`).
