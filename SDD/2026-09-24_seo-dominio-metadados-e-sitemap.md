# {SEO} Corrigir domínio/marca nos metadados, sitemap incompleto e SEO das páginas de produto

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. `index.html`, `robots.txt` e `sitemap.xml` usam o domínio **`funcosmeticos.com.br`** (canonical, `og:url`, `og:image`, JSON-LD `@id`/`url`, `sameAs: instagram.com/funcosmeticos`) e a keyword "fun móveis" — herança de outro projeto. Definir o domínio real da PACO e corrigir tudo.
  2. JSON-LD usa `hero_product.webp` como logo; usar `assets/logo.webp`.
  3. `sitemap.xml` só tem a home; incluir `catalogo.html` e as páginas de produto.
  4. `produto.html` tem título/descrição genéricos até o JS rodar; sem `og:*`, `canonical` e sem JSON-LD `Product`.
  5. `catalogo.html` e `produto.html` não possuem `meta description`/OG.
  6. Os cards do catálogo são `<div>` com clique em JS (não há `<a href>`), então os produtos não são rastreáveis por links.
  7. `index.html` não declara `<link rel="manifest">`/`theme-color`, embora registre service worker.
- **Por que é necessário:** Os mecanismos de busca e as redes sociais associam a loja a outro domínio/marca; produtos não são indexados.
- **Qual valor será agregado:** Tráfego orgânico, prévias corretas no WhatsApp/Instagram e rich results de produto.
- **Para quem é destinado:** Dono da loja (aquisição) e potenciais clientes vindos de busca.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Substituir `funcosmeticos.com.br` pelo domínio oficial em todos os arquivos e remover keywords de outra marca.
- RF02: `sitemap.xml` com home, catálogo e uma URL por produto (gerado por script a partir do Firestore ou no deploy).
- RF03: `meta description`, `canonical` e Open Graph em `catalogo.html` e `produto.html`.
- RF04: Página de produto atualiza `title`, `meta description`, `og:*` e injeta JSON-LD `Product` com `offers` (preço BRL, disponibilidade).
- RF05: Cards do catálogo como `<a href="produto.html?id=...">`.
- RF06: Adicionar web app manifest e `theme-color`.

### Requisitos não-funcionais

- RNF01: Lighthouse SEO ≥ 95 nas páginas públicas.
- RNF02: JSON-LD válido no Rich Results Test.

### Dependências técnicas

- `index.html`, `catalogo.html`, `produto.html`, `robots.txt`, `sitemap.xml`, `js/produto.js`, `js/catalogo.js`.
- Preço numérico (ver `2026-09-24_preco-numerico-e-formatacao-brl.md`) para `offers.price`.

### Recursos necessários

- Domínio oficial da PACO e perfil real do Instagram.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o repositório, quando busco "funcosmeticos", então não há ocorrências.
- [ ] **CA02:** Dado o link da home compartilhado no WhatsApp, quando a prévia é gerada, então mostra título, imagem e domínio da PACO.
- [ ] **CA03:** Dado uma página de produto, quando passo no Rich Results Test, então é reconhecido um `Product` válido.
- [ ] **CA04:** Dado o `sitemap.xml`, quando o abro, então contém home, catálogo e todos os produtos.
- [ ] **CA05:** Dado o catálogo, quando inspeciono um card, então ele contém um `<a href>` para o produto.

## O que a atividade não inclui

- Renderização no servidor (SSR/pré-renderização) das páginas de produto — avaliar em atividade futura.
- Estratégia de conteúdo/blog.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Domínio | `grep -ri funcosmeticos .` | Sem resultados |
| CT02 | Lighthouse | Rodar SEO em home/catálogo/produto | ≥ 95 |
| CT03 | Rich results | Testar URL de produto | `Product` válido |
| CT04 | Sitemap | Validar XML no Search Console | Sem erros |
| CT05 | Links rastreáveis | Desativar JS e abrir catálogo | Estrutura com links (ou `noscript` com lista) |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/appearance/structured-data/product , https://ogp.me/
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
