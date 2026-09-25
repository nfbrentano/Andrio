# [FIX] Página de produto exibe imagem quebrada (sem fallback) na foto principal, miniaturas e lightbox

## Detalhes da Atividade

- **O que precisa ser feito:** Em `js/produto.js` (`renderizarProduto`), `#product-main-img`, as miniaturas `.modal-thumb-btn img`, as imagens do "Compre Junto" e a imagem do lightbox não têm `onerror`. Quando a URL falha (hoje todas as fotos do Drive retornam 429), o usuário vê o ícone de imagem quebrada com o texto alternativo ("Poltrona Azul", "Ângulo 1"). Home e catálogo já têm fallback.
- **Por que é necessário:** A página de detalhe é a principal página de conversão e hoje aparece visivelmente quebrada.
- **Qual valor será agregado:** Experiência consistente mesmo com falha de imagem.
- **Para quem é destinado:** Visitantes da página de produto.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Todas as imagens da página de produto devem ter fallback para placeholder neutro.
- RF02: Miniaturas cujas imagens falharem devem ser ocultadas ou mostrar o placeholder.
- RF03: O lightbox não deve abrir imagem quebrada.
- RF04: Adicionar `width`/`height` ou `aspect-ratio` para evitar layout shift.

### Requisitos não-funcionais

- RNF01: Handler de erro não pode entrar em loop (`this.onerror = null`).

### Dependências técnicas

- `js/produto.js`, `css/style.css`.
- Relacionado a `2026-09-24_imagens-google-drive-nao-carregam.md` (causa raiz) e `2026-09-24_xss-renderizacao-innerhtml.md` (evitar handlers inline).

### Recursos necessários

- Asset de placeholder "imagem indisponível".

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um produto cuja foto principal falha, quando abro `produto.html?id=X`, então vejo o placeholder e não o ícone de imagem quebrada.
- [ ] **CA02:** Dado uma galeria com 2 fotos e uma falha, quando a página carrega, então a miniatura com falha mostra placeholder ou é ocultada.
- [ ] **CA03:** Dado que clico na imagem principal, quando o lightbox abre, então exibe a imagem válida ou o placeholder.

## O que a atividade não inclui

- Migração das imagens (ver spec de imagens do Google Drive).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Imagem principal inválida | Produto local com `img: 'https://invalido/x.webp'` | Placeholder |
| CT02 | Miniatura inválida | `imagens` com 1 URL válida e 1 inválida | Placeholder/oculta |
| CT03 | Lightbox | Clicar na imagem com falha | Placeholder no lightbox |
| CT04 | Sem loop | Placeholder também indisponível | Sem requisições em loop |

## URL Complementar

- Documentação técnica: N/A.
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24 (screenshot de `produto.html?id=EfmUwYwEcqiGWl3ZAaV9` com imagem quebrada).
