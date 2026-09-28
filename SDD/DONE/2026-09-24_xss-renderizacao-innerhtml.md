# [SEC] XSS armazenado: dados de produtos inseridos via `innerHTML` sem escape

## Detalhes da Atividade

- **O que precisa ser feito:** Todos os renderizadores montam HTML por template string com campos do Firestore/localStorage sem escape: `nome`, `desc`, `subhead`, `preco`, `categoria`, `tipo_madeira`, `img`, `color`, `bg`, `id` em `js/app.js` (`renderizarProdutos`), `js/catalogo.js` (`renderizarCatalogo`), `js/produto.js` (`renderizarProduto`, inclusive dentro de `onclick="...${item.id}..."`) e `js/admin.js` (`renderTable`, `renderCrossSellSelector`, `renderGalleryPreview`). Um valor como `<img src=x onerror=...>` no nome ou `"` em uma URL de imagem executa script para todo visitante e para o admin. Escapar texto/atributos ou montar DOM com `textContent`/`setAttribute`, e validar URLs e cores.
- **Por que é necessário:** Qualquer conta com escrita (ver regras do Firestore) ou conteúdo colado sem querer pode comprometer visitantes e a sessão do administrador.
- **Qual valor será agregado:** Segurança da loja e robustez contra dados com aspas/caracteres especiais (hoje um nome com `"` já quebra o `alt`/`aria-label`).
- **Para quem é destinado:** Visitantes e administradores.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Criar utilitário compartilhado `escapeHtml()` (texto) e `safeUrl()` (aceita apenas `https:`, `http:`, caminhos relativos e `data:image/` para o modo local).
- RF02: Validar `color`/`bg` como hex `#RRGGBB` antes de usar em `style`.
- RF03: Remover handlers inline (`onclick`) gerados com dados; usar `addEventListener` ou links `<a href>`.
- RF04: Aplicar em todas as páginas: home, catálogo, produto e admin.

### Requisitos não-funcionais

- RNF01: Nenhum campo vindo de dados deve ser concatenado em HTML sem escape.
- RNF02: Sem regressão visual.

### Dependências técnicas

- `js/app.js`, `js/catalogo.js`, `js/produto.js`, `js/admin.js`.
- Idealmente após/junto com `2026-09-24_debito-tecnico-codigo-duplicado.md` (módulo comum).

### Recursos necessários

- N/A — sem dependências externas.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um produto com nome `<img src=x onerror=alert(1)>`, quando abro home, catálogo, produto e admin, então o texto aparece literal e nenhum alerta é exibido.
- [ ] **CA02:** Dado um produto com `img` = `x" onerror="alert(1)`, quando o card renderiza, então nenhum script é executado.
- [ ] **CA03:** Dado um produto com `color` = `red;background:url(//evil)`, quando renderiza, então é usada a cor padrão.
- [ ] **CA04:** Dado um produto com nome contendo aspas (`Poltrona "Paco"`), quando renderiza, então nome, `alt` e `aria-label` aparecem corretos.

## O que a atividade não inclui

- Content-Security-Policy completa (recomendada como próxima etapa).
- Sanitização de rich text (descrições continuam texto puro).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Payload no nome | Cadastrar em modo local produto com nome `<script>alert(1)</script>` e abrir as 4 páginas | Texto literal, sem execução |
| CT02 | Payload na URL da imagem | `img: 'x" onerror="alert(1)'` | Sem execução; imagem fallback |
| CT03 | Payload no id (cross-sell) | `id: "1');alert(1);//"` em modo local | Sem execução |
| CT04 | Cor inválida | `color: 'javascript:alert(1)'` | Cor padrão aplicada |
| CT05 | Regressão | Produtos reais | Visual idêntico ao anterior |

## URL Complementar

- Documentação técnica: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
