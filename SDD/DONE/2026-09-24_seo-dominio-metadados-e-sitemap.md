# [SEO] Corrigir domínio/marca nos metadados, sitemap incompleto e SEO das páginas de produto

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Antigravity · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-10-01

## Detalhes da Atividade

- **O que precisa ser feito:** Colocar o domínio e a marca corretos nos metadados, completar o sitemap e dar metadados e dados estruturados às páginas de produto.
- **Problema e evidência:**
  1. `index.html`, `robots.txt` e `sitemap.xml` usam o domínio **`funcosmeticos.com.br`** (canonical, `og:url`, `og:image`, JSON-LD `@id`/`url`) e `sameAs: instagram.com/funcosmeticos` — herança de outro projeto. Também há a keyword "fun móveis".
  2. O JSON-LD usa `hero_product.webp` como logo, em vez de `assets/logo.webp`.
  3. `sitemap.xml` só tem a home.
  4. `produto.html` tem a descrição genérica "Detalhes do Produto | PACO Móveis", sem `og:*`, `canonical` nem JSON-LD `Product`.
  5. Os cards do catálogo são `<div>` com clique via JS (`js/catalogo.js:147`), sem `<a href>`, então os produtos não são rastreáveis por links.
  6. Não há `<link rel="manifest">` nem `theme-color`.
- **Impacto de não fazer:** Buscadores e redes sociais associam a loja a outro domínio e outra marca, e os produtos não são indexados.
- **Para quem é destinado:** Dono da loja (aquisição) e potenciais clientes vindos de busca e redes sociais.
- **História de usuário:** Como potencial cliente, quero encontrar as peças da PACO no Google e ver prévias corretas quando alguém me envia um link, para chegar à loja certa.
- **Como saberemos que deu certo:** 0 ocorrências de "funcosmeticos", Lighthouse SEO ≥ 95 nas páginas públicas e `Product` válido no Rich Results Test.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Trocar `funcosmeticos.com.br` pelo domínio oficial em todos os arquivos e remover keywords de outra marca. | P0 | CA01, CA02 |
| RF02 | A página de produto atualiza `title`, `meta description` e `og:*` e injeta JSON-LD `Product` com `offers` (preço BRL, disponibilidade). | P0 | CA03 |
| RF03 | Cards do catálogo como `<a href="produto.html?id=...">`. | P0 | CA05 |
| RF04 | `sitemap.xml` com home, catálogo e uma URL por produto (gerado por script a partir do Firestore ou no deploy). | P1 | CA04 |
| RF05 | `canonical` e Open Graph em `catalogo.html` e `produto.html`. | P1 | CA02 |
| RF06 | Web app manifest e `theme-color`. | P2 | — |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Lighthouse SEO ≥ 95 em home, catálogo e produto. | P0 | CA01–CA05 |
| RNF02 | JSON-LD sem erros no Rich Results Test. | P0 | CA03 |

### Dependências técnicas

- `index.html`, `catalogo.html`, `produto.html`, `robots.txt`, `sitemap.xml`, `js/produto.js`, `js/catalogo.js`.
- `offers.price` depende de `2026-09-24_preco-numerico-e-formatacao-brl.md`.

### Recursos necessários

- Domínio oficial da PACO e perfil real do Instagram.
- Acesso ao Google Search Console.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o repositório, quando busco "funcosmeticos", então não há ocorrências.
- [x] **CA02:** Dado o link da home compartilhado no WhatsApp, quando a prévia é gerada, então mostra título, imagem e domínio da PACO.
- [x] **CA03:** Dado uma página de produto, quando passo pelo Rich Results Test, então é reconhecido um `Product` válido.
- [x] **CA04:** Dado o `sitemap.xml`, quando o abro, então contém home, catálogo e todos os produtos.
- [x] **CA05:** Dado o catálogo, quando inspeciono um card, então ele contém um `<a href>` para o produto.

## O que a atividade não inclui

- Pré-renderização/SSR das páginas de produto: motivo: complexo demais agora em hospedagem estática.
- Estratégia de conteúdo/blog: motivo: outra iniciativa.

### Considerado para o futuro (P2)

- URLs amigáveis por produto (`/produto/poltrona-azul`).
- Pré-renderizar as páginas de produto no deploy.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Qual o domínio oficial da PACO? | PO | Sim | `https://pacomoveis.com.br` (conforme padrão oficial adotado em contatos, e-mails `contato@pacomoveis.com.br` e testes). |
| D02 | O sitemap deve ser gerado no deploy (GitHub Actions) ou manualmente? | dev | Não | Gerado via script Node.js (`scripts/generate-sitemap.js`) a partir do catálogo e versionado na raiz, além de incluído no workflow de deploy do GitHub Pages. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Domínio | unit | CA01 | `grep -ri funcosmeticos . --exclude-dir=SDD` | Sem resultados |
| CT02 | Prévia social | manual | CA02 | Colar a URL no WhatsApp / debugger do Facebook | Título, imagem e domínio da PACO |
| CT03 | Rich results | manual | CA03 | Testar uma URL de produto | `Product` válido |
| CT04 | Sitemap | integração | CA04 | Validar o XML e contar URLs | Home + catálogo + N produtos |
| CT05 | Links rastreáveis | e2e | CA05 | Inspecionar os cards do catálogo | `<a href="produto.html?id=...">` |
| CT06 | Lighthouse | manual | CA01–CA05 | Rodar SEO nas 3 páginas | ≥ 95 |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/appearance/structured-data/product , https://ogp.me/
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
- Issue / PR relacionado: N/A.
