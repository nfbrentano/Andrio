# [FIX] Página de produto exibe imagem quebrada (sem fallback) na foto principal, miniaturas e lightbox

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Rascunho
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** — · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-25

## Detalhes da Atividade

- **O que precisa ser feito:** Adicionar fallback de imagem em todas as imagens da página de produto.
- **Problema e evidência:** Em `js/produto.js` (`renderizarProduto`), `#product-main-img`, as miniaturas `.modal-thumb-btn img`, as imagens do "Compre Junto" e a imagem do lightbox não têm `onerror`. Na validação de 2026-09-24 (`produto.html?id=EfmUwYwEcqiGWl3ZAaV9`), aparecia o ícone de imagem quebrada com o texto "Poltrona Azul" / "Ângulo 1". Home e catálogo já têm fallback.
- **Impacto de não fazer:** A página de detalhe, principal ponto de conversão, parece quebrada.
- **Para quem é destinado:** Visitantes da página de produto.
- **História de usuário:** Como visitante, quero que a página de produto continue bem apresentada mesmo quando uma foto falha, para confiar na loja.
- **Como saberemos que deu certo:** 0 imagens com `naturalWidth === 0` visíveis na página de produto, com URLs inválidas propositais.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Todas as imagens da página de produto têm fallback para um placeholder neutro. | P0 | CA01 |
| RF02 | Miniaturas com falha mostram o placeholder ou são ocultadas. | P0 | CA02 |
| RF03 | O lightbox não abre uma imagem quebrada. | P1 | CA03 |
| RF04 | `width`/`height` ou `aspect-ratio` nas imagens, para evitar layout shift. | P1 | CA01 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | O handler de erro não entra em loop (`onerror = null` antes de trocar o `src`). | P0 | CA04 |

### Dependências técnicas

- `js/produto.js`, `css/style.css`.
- Causa raiz em `2026-09-24_imagens-google-drive-nao-carregam.md`; evitar handlers inline conforme `2026-09-24_xss-renderizacao-innerhtml.md`.

### Recursos necessários

- Asset de placeholder "imagem indisponível" (o mesmo da spec de imagens do Drive).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um produto cuja foto principal falha, quando abro `produto.html?id=X`, então vejo o placeholder e não o ícone de imagem quebrada.
- [ ] **CA02:** Dado uma galeria de 2 fotos com uma falhando, quando a página carrega, então a miniatura com falha mostra o placeholder ou fica oculta.
- [ ] **CA03:** Dado que clico na imagem principal, quando o lightbox abre, então mostra uma imagem válida ou o placeholder.
- [ ] **CA04:** Dado que o próprio placeholder também falha, quando a página carrega, então não há requisições em loop (caso negativo).

## O que a atividade não inclui

- Migração das imagens: motivo: outra iniciativa (`2026-09-24_imagens-google-drive-nao-carregam.md`).

### Considerado para o futuro (P2)

- Skeleton/blur-up enquanto as imagens carregam.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | A miniatura com falha deve ser ocultada ou mostrar o placeholder? | design | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Imagem principal inválida | e2e | CA01 | Produto local com `img: 'https://invalido/x.webp'` | Placeholder |
| CT02 | Miniatura inválida | e2e | CA02 | `imagens` com 1 URL válida e 1 inválida | Placeholder ou oculta |
| CT03 | Lightbox | e2e | CA03 | Clicar na imagem com falha | Placeholder no lightbox |
| CT04 | Sem loop | e2e | CA04 | Bloquear também o placeholder | Número de requisições estável |

## URL Complementar

- Documentação técnica: N/A.
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24.
- Issue / PR relacionado: N/A.
