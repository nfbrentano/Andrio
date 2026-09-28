# [FIX] Asset `assets/prod_luminaria.webp` referenciado mas inexistente

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Antigravity · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-25

## Detalhes da Atividade

- **O que precisa ser feito:** Adicionar o asset da luminária ou trocar as referências por uma imagem existente.
- **Problema e evidência:** `assets/prod_luminaria.webp` é referenciado em `js/shared/catalogo-data.js:12` (`CATEGORY_DEFAULT_IMAGES`), em `js/shared/catalogo-data.js:88-89` (produto demo) e em `admin.html:186` (preset "Luminária"), mas **não existe** em `assets/`.
- **Impacto de não fazer:** Luminárias sem foto, o produto demo de luminária e o preset do admin mostram imagem quebrada (404).
- **Para quem é destinado:** Visitantes e administradores.
- **História de usuário:** Como administrador, quero que o preset "Luminária" mostre uma imagem válida, para cadastrar luminárias sem foto provisória quebrada.
- **Como saberemos que deu certo:** 0 referências `assets/*` apontando para arquivos inexistentes.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Toda imagem referenciada no código existe em `assets/`. | P0 | CA03 |
| RF02 | A categoria `luminaria` tem imagem padrão e de hover válidas. | P0 | CA01, CA02 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Imagem em WebP, proporção 3:4 e ≤ 150 KB, como os demais `prod_*.webp`. | P1 | CA01 |

### Dependências técnicas

- `js/shared/catalogo-data.js`, `admin.html`, `sw.js` (precache).

### Recursos necessários

- Foto de uma luminária PACO (fornecida pelo cliente) ou uma imagem substituta aprovada.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um produto `luminaria` sem imagem, quando aparece no catálogo, então mostra a imagem padrão de luminária sem 404.
- [x] **CA02:** Dado que estou no admin, quando clico no preset "Luminária", então a miniatura aparece corretamente.
- [x] **CA03:** Dado o repositório, quando verifico todas as referências `assets/*` no código, então todas apontam para arquivos existentes.

## O que a atividade não inclui

- Produção fotográfica de novos produtos: motivo: outra iniciativa (cliente).

### Considerado para o futuro (P2)

- Checagem automática de assets referenciados no CI.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Existe foto de luminária da PACO disponível? | PO | Não | Gerado asset otimizado em WebP (500x669, 5 KB) seguindo o padrão de estúdio branco e paleta terracota/latão dos outros produtos. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Asset servido | integração | CA01 | `curl -I /assets/prod_luminaria.webp` | 200 |
| CT02 | Preset admin | manual | CA02 | Clicar em "Luminária" no admin | Miniatura visível |
| CT03 | Varredura | unit | CA03 | `grep -oh "assets/[a-zA-Z0-9_.-]*" -r js *.html sw.js \| sort -u` e checar cada arquivo | Nenhum ausente |

## URL Complementar

- Documentação técnica: N/A.
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: demais imagens `assets/prod_*.webp`.
- Requisitos originais: Validação de 2026-09-24.
- Issue / PR relacionado: N/A.
