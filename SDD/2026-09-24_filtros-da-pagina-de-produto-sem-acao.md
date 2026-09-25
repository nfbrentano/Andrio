# [FIX] Botões de categoria da página de produto não fazem nada e catálogo não aceita categoria via URL

## Detalhes da Atividade

- **O que precisa ser feito:** `produto.html` exibe os botões "Poltronas / Mesas / Cadeiras / Luminárias" na navbar, mas `js/produto.js` não registra nenhum listener para eles. Fazer com que levem para `catalogo.html?categoria=<slug>` e fazer `js/catalogo.js` ler esse parâmetro para iniciar com a categoria correta (hoje sempre inicia em `poltrona`). O mesmo parâmetro deve servir aos links do rodapé.
- **Por que é necessário:** Controles visíveis que não respondem geram frustração e parecem defeito; não há como compartilhar link de uma categoria.
- **Qual valor será agregado:** Navegação consistente entre páginas e URLs compartilháveis por categoria.
- **Para quem é destinado:** Visitantes da loja.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Na página de produto, clicar em uma categoria navega para `catalogo.html?categoria=<slug>`.
- RF02: O catálogo lê `?categoria=` na inicialização, marca o botão correspondente e filtra.
- RF03: Ao trocar a categoria no catálogo, a URL é atualizada com `history.replaceState`.
- RF04: Slug inválido cai no comportamento padrão sem erro.
- RF05: O botão da categoria do produto atual fica destacado na página de produto.

### Requisitos não-funcionais

- RNF01: Sem recarregamento de página ao trocar categoria dentro do catálogo.

### Dependências técnicas

- `produto.html`, `js/produto.js`, `js/catalogo.js`, `catalogo.html` (links do rodapé).

### Recursos necessários

- N/A — sem dependências externas.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou em `produto.html?id=X`, quando clico em "Mesas", então sou levado a `catalogo.html?categoria=mesa` com "Mesas" ativo.
- [ ] **CA02:** Dado que acesso `catalogo.html?categoria=cadeira`, quando a página carrega, então só cadeiras são listadas e o botão "Cadeiras" está ativo.
- [ ] **CA03:** Dado que acesso `catalogo.html?categoria=xyz`, quando a página carrega, então o catálogo abre na categoria padrão sem erros no console.
- [ ] **CA04:** Dado que estou vendo uma poltrona, quando a página de produto carrega, então o botão "Poltronas" aparece como ativo.

## O que a atividade não inclui

- Busca global entre categorias (ver `2026-09-24_busca-e-filtros-do-catalogo.md`).
- Rotas amigáveis (ex.: `/catalogo/mesas`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Navegação a partir do produto | Abrir produto, clicar "Luminárias" | URL `catalogo.html?categoria=luminaria` |
| CT02 | Deep link | Abrir `catalogo.html?categoria=mesa` | Filtro "Mesas" aplicado |
| CT03 | Slug inválido | Abrir `catalogo.html?categoria=foo` | Categoria padrão, console limpo |
| CT04 | Atualização da URL | No catálogo, clicar "Cadeiras" | URL muda para `?categoria=cadeira` sem reload |

## URL Complementar

- Documentação técnica: https://developer.mozilla.org/docs/Web/API/History/replaceState
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24 (`js/produto.js` não referencia `.fun-pill-btn`).
