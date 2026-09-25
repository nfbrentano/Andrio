# [FEAT] Armazenar preço como número e exibir formatado em Real (BRL)

## Detalhes da Atividade

- **O que precisa ser feito:** O preço é um texto livre (`preco: string`). Na base atual coexistem `"9500"`, `"8000"`, `"2900"` e `"R$ 1.500,00"`, exibidos assim, sem padrão. A ordenação usa `parsePrice` com regex, frágil para formatos como `"9.500"` vs `"9,5"`. Passar a gravar `preco_centavos` (inteiro) com máscara de moeda no admin e exibir sempre com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`. Permitir "Sob consulta" como opção explícita.
- **Por que é necessário:** Inconsistência visual na vitrine e ordenação por preço sujeita a erro.
- **Qual valor será agregado:** Apresentação profissional, ordenação correta e base para dados estruturados de SEO (`offers.price`).
- **Para quem é destinado:** Visitantes e administradores.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Campo de preço no admin com máscara BRL e validação (> 0) ou checkbox "Sob consulta".
- RF02: Gravar `preco_centavos` (number) e opcionalmente `preco_sob_consulta` (boolean).
- RF03: Exibição formatada em home, catálogo, produto, cross-sell, admin e mensagem do WhatsApp.
- RF04: Ordenação por preço usa o valor numérico.
- RF05: Migração dos documentos existentes do campo `preco` string para `preco_centavos`.

### Requisitos não-funcionais

- RNF01: Compatibilidade retroativa: se `preco_centavos` ausente, converter `preco` legado na leitura.

### Dependências técnicas

- `admin.html`, `js/admin.js`, `js/app.js`, `js/catalogo.js`, `js/produto.js`.

### Recursos necessários

- Confirmação dos preços reais com o cliente (valores atuais podem estar em formatos ambíguos).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um produto com `preco_centavos = 950000`, quando exibido, então aparece "R$ 9.500,00".
- [ ] **CA02:** Dado que digito "1500" no admin, quando salvo, então o preço exibido é "R$ 1.500,00".
- [ ] **CA03:** Dado produtos de R$ 800, R$ 1.500 e R$ 9.500, quando ordeno por "Menor Preço", então a ordem é 800, 1.500, 9.500.
- [ ] **CA04:** Dado um produto "Sob consulta", quando exibido, então aparece "Sob consulta" e ele vai para o fim na ordenação por preço.
- [ ] **CA05:** Dado um documento legado com `preco: "R$ 1.500,00"`, quando exibido, então aparece "R$ 1.500,00".

## O que a atividade não inclui

- Preço promocional, parcelamento ou carrinho de compras.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Formatação | Produto com 290000 centavos | "R$ 2.900,00" |
| CT02 | Máscara admin | Digitar "2.890,50" | Salvo como 289050 |
| CT03 | Validação | Deixar vazio sem "Sob consulta" | Erro de validação |
| CT04 | Ordenação | Ordenar asc/desc | Ordem numérica correta |
| CT05 | Legado | Doc com `preco: "8000"` | "R$ 8.000,00" |

## URL Complementar

- Documentação técnica: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24 (preços na base: "9500", "R$ 1.500,00", "8000", "2900").
