# [FIX] Botões de categoria da página de produto não fazem nada

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Natanael Brentano / Antigravity · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-10-01

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer os botões "Poltronas / Mesas / Cadeiras / Luminárias" da navbar de `produto.html` levarem ao catálogo filtrado, e destacar a categoria do produto atual.
- **Problema e evidência:** `produto.html` mostra os botões, mas `js/produto.js` não registra nenhum listener para `.fun-pill-btn` (validado em 2026-09-24 e conferido em 2026-09-25). O catálogo já aceita `?categoria=` (entregue em `SDD/DONE/2026-09-24_busca-e-filtros-do-catalogo.md`), então só falta ligar a página de produto.
- **Impacto de não fazer:** Controles visíveis que não respondem parecem defeito e interrompem a navegação a partir da página de produto.
- **Para quem é destinado:** Visitantes na página de produto.
- **História de usuário:** Como visitante vendo um produto, quero clicar numa categoria e ver as peças dela, para continuar explorando a loja.
- **Como saberemos que deu certo:** Os 4 botões levam a `catalogo.html?categoria=<slug>` com o filtro aplicado.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Na página de produto, clicar numa categoria navega para `catalogo.html?categoria=<slug>`. | P0 | CA01 |
| RF02 | O botão da categoria do produto atual fica destacado. | P1 | CA02 |
| RF03 | Converter os botões em `<a href>` nessa página, para funcionar sem JS e abrir em nova aba. | P1 | CA03 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhum erro no console ao clicar nos botões. | P0 | CA01 |

### Dependências técnicas

- `produto.html`, `js/produto.js`; `js/catalogo.js` (leitura de `?categoria=`, já implementada).

### Recursos necessários

- N/A — sem dependências externas.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que estou em `produto.html?id=X`, quando clico em "Mesas", então vou para `catalogo.html?categoria=mesa` com "Mesas" ativo.
- [x] **CA02:** Dado que vejo uma poltrona, quando a página de produto carrega, então o botão "Poltronas" aparece como ativo.
- [x] **CA03:** Dado que clico numa categoria com Ctrl/Cmd, quando o navegador processa, então o catálogo abre em nova aba.
- [x] **CA04:** Dado um produto com categoria desconhecida, quando a página carrega, então nenhum botão fica ativo e não há erro (caso-limite).

## O que a atividade não inclui

- Rotas amigáveis (ex.: `/catalogo/mesas`): motivo: complexo demais agora em hospedagem estática.

### Considerado para o futuro (P2)

- Breadcrumb "Catálogo › Poltronas › Produto".

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Os filtros devem mesmo aparecer na página de produto, ou basta um link "Voltar ao catálogo"? | PO | Não | Sim, os botões de categoria aparecem na navbar estilizados como links (<a href="catalogo.html?categoria=slug">), destacando a categoria do produto atual e navegando diretamente para o catálogo filtrado. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Navegação | e2e | CA01 | Abrir produto, clicar "Luminárias" | URL `catalogo.html?categoria=luminaria`, filtro ativo |
| CT02 | Destaque | e2e | CA02 | Abrir produto de categoria `poltrona` | "Poltronas" com `active` |
| CT03 | Nova aba | manual | CA03 | Cmd+clique em "Cadeiras" | Catálogo em nova aba |
| CT04 | Categoria desconhecida | e2e | CA04 | Produto local com `categoria: "sofa"` | Nenhum ativo, console limpo |

## URL Complementar

- Documentação técnica: N/A.
- Protótipo / mockup: N/A.
- Discussões relacionadas: `SDD/DONE/2026-09-24_busca-e-filtros-do-catalogo.md`.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24.
- Issue / PR relacionado: N/A.
