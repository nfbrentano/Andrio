# [FEAT] Armazenar preço como número e exibir formatado em Real (BRL)

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Rascunho
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** — · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-25

## Detalhes da Atividade

- **O que precisa ser feito:** Gravar o preço como valor numérico, com máscara de moeda no admin, e exibi-lo sempre no formato BRL.
- **Problema e evidência:** O preço é texto livre (`preco: string`). Na base atual convivem `"9500"`, `"8000"`, `"2900"` e `"R$ 1.500,00"`, exibidos exatamente assim (validação de 2026-09-24). A ordenação usa `parsePrice` com regex (`js/catalogo.js:69`), frágil com formatos como `"9.500"` vs `"9,5"`.
- **Impacto de não fazer:** Vitrine sem padrão, ordenação por preço sujeita a erro e sem base para `offers.price` no SEO.
- **Para quem é destinado:** Visitantes e administradores.
- **História de usuário:** Como visitante, quero ver todos os preços no mesmo formato em reais, para comparar as peças facilmente.
- **Como saberemos que deu certo:** 100% dos preços exibidos seguem `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` ou "Sob consulta".

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Gravar `preco_centavos` (number) e, opcionalmente, `preco_sob_consulta` (boolean). | P0 | CA01, CA02 |
| RF02 | Exibição formatada em home, catálogo, produto, cross-sell, admin e mensagem do WhatsApp. | P0 | CA01 |
| RF03 | Ordenação por preço usando o valor numérico. | P0 | CA03 |
| RF04 | Converter o `preco` legado na leitura quando `preco_centavos` estiver ausente. | P0 | CA05 |
| RF05 | Campo de preço no admin com máscara BRL e validação (> 0) ou checkbox "Sob consulta". | P1 | CA02, CA04, CA06 |
| RF06 | Migrar os documentos existentes para `preco_centavos`. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Compatibilidade retroativa com documentos que só têm `preco` string. | P0 | CA05 |

### Dependências técnicas

- `admin.html`, `js/admin.js`, `js/app.js`, `js/catalogo.js`, `js/produto.js`, `js/shared/catalogo-data.js`.

### Recursos necessários

- Confirmação dos preços reais com o cliente (`"9500"` pode ser R$ 9.500 ou R$ 95,00).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um produto com `preco_centavos = 950000`, quando exibido, então aparece "R$ 9.500,00".
- [ ] **CA02:** Dado que digito "1500" no admin, quando salvo, então o preço exibido é "R$ 1.500,00".
- [ ] **CA03:** Dado produtos de R$ 800, R$ 1.500 e R$ 9.500, quando ordeno por "Menor Preço", então a ordem é 800, 1.500, 9.500.
- [ ] **CA04:** Dado um produto "Sob consulta", quando exibido, então aparece "Sob consulta" e ele vai para o fim na ordenação por preço.
- [ ] **CA05:** Dado um documento legado com `preco: "R$ 1.500,00"`, quando exibido, então aparece "R$ 1.500,00".
- [ ] **CA06:** Dado que deixo o preço vazio sem marcar "Sob consulta", quando salvo, então o admin mostra erro e não grava (caso negativo).

## O que a atividade não inclui

- Preço promocional, parcelamento ou carrinho: motivo: outra iniciativa, fora do modelo atual (orçamento via WhatsApp).

### Considerado para o futuro (P2)

- Preço "a partir de" para produtos com variações.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Qual o preço correto dos produtos com valor `"9500"`, `"8000"` e `"2900"`? | PO | Sim (para a migração) | |
| D02 | A loja quer exibir preço ou só "Sob consulta" para algumas peças? | PO | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Formatação | unit | CA01 | Formatar 290000 centavos | "R$ 2.900,00" |
| CT02 | Máscara admin | e2e | CA02 | Digitar "2.890,50" | Salvo como 289050 |
| CT03 | Ordenação | unit | CA03, CA04 | Ordenar lista com valores e "Sob consulta" | Ordem numérica; "Sob consulta" no fim |
| CT04 | Legado | unit | CA05 | Doc com `preco: "8000"` e `"R$ 1.500,00"` | "R$ 8.000,00" / "R$ 1.500,00" |
| CT05 | Validação | e2e | CA06 | Salvar com preço vazio | Erro, nada gravado |

## URL Complementar

- Documentação técnica: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24.
- Issue / PR relacionado: N/A.
