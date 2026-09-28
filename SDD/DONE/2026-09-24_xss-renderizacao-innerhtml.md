# [FIX] Segurança: XSS armazenado por dados de produtos inseridos via `innerHTML` sem escape

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Antigravity · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-25

## Detalhes da Atividade

- **O que precisa ser feito:** Escapar texto e atributos, e validar URLs e cores, em todo HTML montado com dados de produtos.
- **Problema e evidência:** Os renderizadores usam template strings com campos do Firestore/localStorage sem escape: `nome`, `desc`, `subhead`, `preco`, `categoria`, `tipo_madeira`, `img`, `color`, `bg`, `id`. Isso ocorre em `js/app.js` (`renderizarProdutos`), `js/catalogo.js` (`renderizarCatalogo`), `js/produto.js` (`renderizarProduto`, inclusive em `onclick="window.location.href='produto.html?id=${item.id}'"`, linha 138) e `js/admin.js` (`renderTable`, `renderCrossSellSelector`, `renderGalleryPreview`). Um nome como `<img src=x onerror=...>` executa script para todos os visitantes e para o admin. Um nome com `"` já quebra o `alt`/`aria-label`.
- **Impacto de não fazer:** Qualquer conta com escrita (ver regras do Firebase), ou um texto colado por engano, compromete visitantes e a sessão do administrador.
- **Para quem é destinado:** Visitantes e administradores.
- **História de usuário:** Como visitante, quero navegar pela loja sem executar código de terceiros, para que meus dados e minha navegação fiquem seguros.
- **Como saberemos que deu certo:** 0 execuções nos 5 payloads dos casos de teste, nas 4 páginas.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Criar em `js/shared/` os utilitários `escapeHtml()` (texto/atributo) e `safeUrl()` (aceita `https:`, `http:`, caminhos relativos e `data:image/` para o modo local). | P0 | CA01, CA02 |
| RF02 | Validar `color`/`bg` como hex `#RRGGBB` antes de usar em `style`; caso contrário, usar a cor padrão. | P0 | CA03 |
| RF03 | Remover `onclick` inline gerado com dados (cross-sell de `produto.js`); usar `<a href>` ou `addEventListener`. | P0 | CA01 |
| RF04 | Aplicar em home, catálogo, produto e admin. | P0 | CA01–CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhum campo vindo de dados concatenado em HTML sem escape (verificável por revisão/grep). | P0 | CA01 |
| RNF02 | Sem regressão visual nas 4 páginas. | P0 | CA04 |

### Dependências técnicas

- `js/shared/catalogo-data.js` e `js/shared/ui.js` (módulos compartilhados, criados em `f11a92a`), `js/app.js`, `js/catalogo.js`, `js/produto.js`, `js/admin.js`.

### Recursos necessários

- Modo local (localStorage) para injetar os payloads sem mexer no Firestore de produção.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um produto com nome `<img src=x onerror=alert(1)>`, quando abro home, catálogo, produto e admin, então o texto aparece literal e nenhum alerta é exibido.
- [x] **CA02:** Dado um produto com `img` = `x" onerror="alert(1)`, quando o card renderiza, então nenhum script é executado.
- [x] **CA03:** Dado um produto com `color` = `red;background:url(//evil)`, quando renderiza, então a cor padrão é usada.
- [x] **CA04:** Dado um produto com nome contendo aspas (`Poltrona "Paco"`), quando renderiza, então nome, `alt` e `aria-label` aparecem corretos.

## O que a atividade não inclui

- Content-Security-Policy completa: motivo: prematuro, depende da remoção dos scripts inline.
- Rich text em descrições: motivo: baixo impacto, a descrição continua texto puro.

### Considerado para o futuro (P2)

- Trocar os templates `innerHTML` por criação de DOM ou `<template>`, eliminando a classe de bug.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Algum campo precisa aceitar HTML intencionalmente (ex.: quebras de linha na descrição)? | PO | Não | Não; todos os campos são tratados como texto puro e escapados para segurança. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Payload no nome | e2e | CA01 | Modo local, nome `<script>alert(1)</script>`, abrir as 4 páginas | Texto literal, sem execução |
| CT02 | Payload na URL da imagem | e2e | CA02 | `img: 'x" onerror="alert(1)'` | Sem execução; fallback |
| CT03 | Payload no id (cross-sell) | e2e | CA01 | `id: "1');alert(1);//"` em modo local | Sem execução |
| CT04 | Cor inválida | unit | CA03 | Validar `javascript:alert(1)` e `red;x:y` | Cor padrão |
| CT05 | `escapeHtml` | unit | CA01, CA04 | Entradas com `< > " ' &` | Entidades corretas |
| CT06 | Regressão | manual | CA04 | Comparar páginas com produtos reais | Visual idêntico |

## URL Complementar

- Documentação técnica: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- Protótipo / mockup: N/A — sem alteração visual.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
- Issue / PR relacionado: N/A.
