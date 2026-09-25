# [FEAT] Busca global e filtro "Todos" no catálogo

## Detalhes da Atividade

- **O que precisa ser feito:** A busca do catálogo (`js/catalogo.js` → `renderizarCatalogo`) filtra **somente dentro da categoria ativa** (padrão `poltrona`) — ex.: buscar "mesa" com Poltronas ativo retorna "0 móvei(s) encontrado(s)" mesmo que existam mesas. Adicionar a opção "Todos" (já suportada pelo código via `activeCategory === 'all'`, mas sem botão), fazer a busca considerar todas as categorias quando houver termo, normalizar acentos na busca e corrigir o texto do contador ("móvei(s)" → "1 móvel" / "N móveis").
- **Por que é necessário:** O campo promete "Buscar por nome, tipo de madeira, acabamento..." mas não encontra produtos de outras categorias; o usuário conclui que o produto não existe.
- **Qual valor será agregado:** Descoberta de produtos e redução de abandono.
- **Para quem é destinado:** Visitantes do catálogo.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Botão "Todos" como primeira opção de filtro no catálogo (e padrão ao abrir sem `?categoria=`).
- RF02: Com termo de busca preenchido, pesquisar em todas as categorias ou exibir aviso "X resultados em outras categorias".
- RF03: Busca insensível a acentos e caixa ("luminaria" encontra "Luminária").
- RF04: Contador com pluralização correta ("1 móvel encontrado", "3 móveis encontrados").
- RF05: O botão do estado vazio "Ver poltronas" deve limpar a busca e mostrar "Todos".
- RF06: Busca com debounce (~200 ms).

### Requisitos não-funcionais

- RNF01: Filtragem local sem nova consulta ao Firestore.

### Dependências técnicas

- `catalogo.html`, `js/catalogo.js`, `css/style.css`.
- Relacionada a `2026-09-24_filtros-da-pagina-de-produto-sem-acao.md` (parâmetro `?categoria=`).

### Recursos necessários

- N/A — sem dependências externas.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que estou no catálogo com "Poltronas" ativo, quando busco "mesa", então vejo as mesas cadastradas (ou aviso com link para elas).
- [x] **CA02:** Dado que abro `catalogo.html` sem parâmetros, quando carrega, então "Todos" está ativo e todos os produtos aparecem.
- [x] **CA03:** Dado que busco "luminaria", quando existe "Luminária Terracota", então ela aparece nos resultados.
- [x] **CA04:** Dado 1 resultado, quando o contador é exibido, então mostra "1 móvel encontrado".

## O que a atividade não inclui

- Busca no servidor (Algolia/Typesense) ou filtros por faixa de preço/material.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Busca entre categorias | Categoria Poltronas, buscar "mesa" | Mesas listadas |
| CT02 | Acentos | Buscar "luminaria" | Encontra "Luminária" |
| CT03 | Todos | Clicar "Todos" | Todos os produtos |
| CT04 | Pluralização | Resultado único | "1 móvel encontrado" |
| CT05 | Estado vazio | Buscar "zzz" e clicar no botão | Busca limpa, "Todos" ativo |

## URL Complementar

- Documentação técnica: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24 (busca "mesa" retornou "0 móvei(s) encontrado(s)").
