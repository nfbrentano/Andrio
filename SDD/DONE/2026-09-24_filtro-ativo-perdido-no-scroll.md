# [FIX] Botão de categoria ativo perde o destaque ao rolar a home

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Antigravity · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-10-01

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer o botão da categoria selecionada na home continuar destacado (e com `aria-selected` coerente) durante o scroll.
- **Problema e evidência:** Em `js/app.js:368-393`, um `IntersectionObserver` de "seção atual" percorre os `.fun-pill-btn` e tira a classe `active` de todos cujo `href` não contém o id da seção. Os botões de categoria são `<button>` sem `href`, então **todos perdem `active`** assim que uma seção cruza o meio da tela. Na validação, depois de rolar até o catálogo, nenhum botão tinha `active`, mas "poltrona" continuava com `aria-selected="true"`.
- **Impacto de não fazer:** O visitante não sabe qual categoria está vendo, e leitores de tela recebem um estado diferente do visual.
- **Para quem é destinado:** Visitantes da home.
- **História de usuário:** Como visitante, quero ver qual categoria está selecionada, para entender o que o carrossel mostra.
- **Como saberemos que deu certo:** Exatamente 1 `.fun-pill-btn.active`, igual ao `aria-selected="true"`, em qualquer posição de scroll.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | O observer de seção não altera o estado dos filtros de categoria (remover o bloco ou restringi-lo a links de âncora reais). | P0 | CA01 |
| RF02 | O botão selecionado mantém `active` e `aria-selected="true"` até outra categoria ser escolhida. | P0 | CA01, CA02 |
| RF03 | O botão ativo tem estilo diferente dos inativos (hoje `applyButtonActiveColor` pinta todos com a mesma cor sólida). | P1 | CA03 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Contraste WCAG AA (4.5:1) nos botões ativo e inativo; atenção ao amarelo `#ffcd01` com texto branco. | P1 | CA03 |

### Dependências técnicas

- `js/app.js`, `css/style.css` (`.fun-pill-btn.active`).

### Recursos necessários

- N/A — sem dependências externas.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado "Poltronas" selecionado na home, quando rolo a página até o fim, então "Poltronas" continua com o destaque de ativo.
- [x] **CA02:** Dado que clico em "Mesas", quando o catálogo rola até a seção, então só "Mesas" fica ativo e com `aria-selected="true"`.
- [x] **CA03:** Dado os 4 botões, quando olho a navbar, então dá para distinguir o ativo dos demais.
- [x] **CA04:** Dado qualquer posição de scroll, quando conto `.fun-pill-btn.active`, então nunca há 0 nem mais de 1 (caso negativo).

## O que a atividade não inclui

- Mudança de layout da navbar: motivo: fora do escopo de correção.
- Botão "Todos" na home: motivo: prematuro, a home é um carrossel por categoria.

### Considerado para o futuro (P2)

- Destacar a seção atual em links de âncora reais, se forem adicionados ao menu.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Como deve ser o estilo do inativo (outline, opacidade reduzida)? | design | Não | Estilo outline pill com borda colorida da categoria, fundo claro e texto escuro `#1a1a1a`, garantindo contraste AAA (17:1) e distinção imediata para o botão ativo sólido. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Scroll | e2e | CA01, CA04 | Carregar a home e rolar até `#secao-catalogo` e até o rodapé | 1 `.fun-pill-btn.active` |
| CT02 | Troca de categoria | e2e | CA02 | Clicar "Cadeiras" e esperar 1s | Só "Cadeiras" ativo e selecionado |
| CT03 | Contraste | manual | CA03 | Rodar axe/Lighthouse | Sem erro de contraste |

## URL Complementar

- Documentação técnica: N/A.
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24.
- Issue / PR relacionado: N/A.
