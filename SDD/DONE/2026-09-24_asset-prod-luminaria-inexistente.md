# [FIX] Asset `assets/prod_luminaria.webp` referenciado mas inexistente

## Detalhes da Atividade

- **O que precisa ser feito:** O arquivo `assets/prod_luminaria.webp` é referenciado em `CATEGORY_DEFAULT_IMAGES` (`js/app.js:10`, `js/catalogo.js:14`, `js/produto.js`), nos produtos de demonstração (`PRODUTOS_PADRAO`) e no botão de preset "Luminária" do admin (`admin.html:190`), mas **não existe** na pasta `assets/`. Adicionar o asset ou trocar as referências por uma imagem existente.
- **Por que é necessário:** Produtos da categoria luminária sem foto, o produto demo de luminária e o preset do admin exibem imagem quebrada (404).
- **Qual valor será agregado:** Consistência visual da categoria Luminárias e fim de requisições 404.
- **Para quem é destinado:** Visitantes e administradores.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Toda imagem referenciada no código deve existir em `assets/`.
- RF02: A categoria `luminaria` deve ter imagem padrão e imagem de hover válidas.

### Requisitos não-funcionais

- RNF01: Imagem em WebP, proporção 3:4 e peso ≤ 150 KB, seguindo os demais `prod_*.webp`.

### Dependências técnicas

- `js/app.js`, `js/catalogo.js`, `js/produto.js`, `js/admin.js`, `admin.html`, `sw.js` (precache).

### Recursos necessários

- Foto de uma luminária PACO (fornecida pelo cliente) ou definição de imagem substituta.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que um produto de categoria `luminaria` não tem imagem, quando é exibido no catálogo, então aparece a imagem padrão de luminária sem erro 404.
- [ ] **CA02:** Dado que estou no admin, quando clico no preset "Luminária", então a miniatura é exibida corretamente.
- [ ] **CA03:** Dado o repositório, quando executo uma verificação de referências `assets/*` no código, então todas apontam para arquivos existentes.

## O que a atividade não inclui

- Produção fotográfica de novos produtos.
- Consolidação do código duplicado (ver `2026-09-24_debito-tecnico-codigo-duplicado.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Asset existe | `curl -I /assets/prod_luminaria.webp` | 200 |
| CT02 | Preset admin | Clicar em "Luminária" no admin | Miniatura visível |
| CT03 | Varredura | `grep -oh "assets/[a-zA-Z0-9_.-]*" -r js *.html sw.js \| sort -u` e checar cada arquivo | Nenhum ausente |

## URL Complementar

- Documentação técnica: N/A.
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: demais imagens `assets/prod_*.webp`.
- Requisitos originais: Validação de 2026-09-24 (`ls assets` não contém `prod_luminaria.webp`).
