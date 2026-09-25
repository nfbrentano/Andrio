# [REFACTOR] Consolidar código duplicado entre home, catálogo, produto e admin

## Detalhes da Atividade

- **O que precisa ser feito:** As mesmas estruturas estão copiadas em 3–4 arquivos, com divergências:
  - `PRODUTOS_PADRAO` em `js/app.js`, `js/catalogo.js`, `js/produto.js` (ids numéricos `1..4`) e `js/admin.js` (ids `"demo_1"..`), o que quebra os vínculos de "Compre Junto" entre admin e loja no modo local.
  - `CATEGORY_DEFAULT_IMAGES`, `getDefaultImageForCategory`, `normalizarUrlImagem` e `carregarProdutos` duplicados.
  - `initMenuMobile` simplificado em catálogo/produto vs. versão completa na home.
  - Código morto: `carregarSupabaseScript` (`js/app.js:84`), classes `supabase-setup-box` em `login.html`, comentários de "modal removido" em `js/catalogo.js`.
  - Dependência `keen-slider@latest` sem versão fixa (`index.html`) — atualização da CDN pode quebrar o carrossel.
  - Google Fonts "Inter" carregada em todas as páginas, mas o `body` renderiza com "Bookman Old Style" (fonte baixada sem uso ou variável CSS incorreta).
  Criar módulo compartilhado (`js/shared/catalogo-data.js`, `js/shared/ui.js`) e remover o código morto.
- **Por que é necessário:** Correções (XSS, fallback de imagens, preço) precisariam ser feitas 4 vezes; divergências já causam bugs.
- **Qual valor será agregado:** Manutenção mais rápida e menos regressões.
- **Para quem é destinado:** Time de desenvolvimento.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Uma única fonte para dados demo, imagens padrão, normalização de URL e carregamento de produtos.
- RF02: Ids demo iguais em loja e admin.
- RF03: Um único módulo de menu mobile acessível.
- RF04: Remover código e referências a Supabase.
- RF05: Fixar versão do keen-slider (ex.: `keen-slider@6.8.6`) com SRI.
- RF06: Resolver a fonte: usar Inter de fato ou remover o carregamento.

### Requisitos não-funcionais

- RNF01: Sem mudança de comportamento visível (refatoração pura, exceto correções citadas).
- RNF02: Sem build obrigatório (manter scripts `defer` ou ES modules nativos).

### Dependências técnicas

- Todos os arquivos em `js/`, `index.html`, `catalogo.html`, `produto.html`, `login.html`, `admin.html`, `sw.js` (precache dos novos arquivos).

### Recursos necessários

- N/A — sem dependências externas.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o repositório, quando busco `PRODUTOS_PADRAO`, então há uma única definição.
- [x] **CA02:** Dado o repositório, quando busco "supabase", então não há ocorrências.
- [x] **CA03:** Dado o modo local, quando vinculo produtos no admin, então o "Compre Junto" aparece na página de produto.
- [x] **CA04:** Dado as páginas públicas, quando comparo antes/depois, então o visual e o comportamento são equivalentes.
- [x] **CA05:** Dado `index.html`, quando inspeciono o script do keen-slider, então a versão é fixa.

## O que a atividade não inclui

- Migração para framework/bundler.
- Correções de segurança (specs próprias), além de facilitar sua aplicação.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Duplicação | `grep -rn "PRODUTOS_PADRAO =" js` | 1 resultado |
| CT02 | Código morto | `grep -rni supabase .` | 0 resultados |
| CT03 | Cross-sell local | Vincular demo 1 → demo 4 no admin, abrir produto 1 | "Compre Junto" com demo 4 |
| CT04 | Regressão | Navegar home → catálogo → produto | Sem erros no console |
| CT05 | Fonte | Inspecionar `font-family` computada | Fonte carregada = fonte usada |

## URL Complementar

- Documentação técnica: https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
