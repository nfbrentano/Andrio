# [FIX] Edição de produto sobrescreve `created_at` e altera a ordem "Mais Recentes"

## Detalhes da Atividade

- **O que precisa ser feito:** No submit do formulário do admin (`js/admin.js:702-723`), `productData` sempre inclui `created_at: new Date().toISOString()`, inclusive em edições (`set(..., { merge: true })`). Toda edição faz o produto "virar novo" e ir para o topo da ordenação. Gravar `created_at` só na criação e adicionar `updated_at` na edição. Além disso, a ordenação "Mais Recentes" do catálogo (`js/catalogo.js`) não ordena nada no fallback local, e `orderBy('created_at')` exclui documentos sem esse campo.
- **Por que é necessário:** Ordem do catálogo incorreta e perda da data real de cadastro.
- **Qual valor será agregado:** Ordenação confiável e histórico correto dos produtos.
- **Para quem é destinado:** Administradores e visitantes do catálogo.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: `created_at` gravado apenas na criação (preferencialmente `firebase.firestore.FieldValue.serverTimestamp()`).
- RF02: `updated_at` gravado em toda edição.
- RF03: A opção "Mais Recentes" ordena por `created_at` desc também no modo local.
- RF04: Produtos sem `created_at` não devem sumir da listagem (migrar dados ou tratar ausência).

### Requisitos não-funcionais

- RNF01: Tipo de data consistente em todos os documentos (Timestamp ou ISO — escolher um).

### Dependências técnicas

- `js/admin.js`, `js/catalogo.js`, `js/app.js`, `js/produto.js`.

### Recursos necessários

- Script de migração pontual para documentos existentes (se o tipo mudar para Timestamp).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um produto criado em D1, quando o edito em D2, então `created_at` permanece D1 e `updated_at` = D2.
- [ ] **CA02:** Dado três produtos criados em ordem A, B, C, quando edito A, então "Mais Recentes" continua exibindo C, B, A.
- [ ] **CA03:** Dado o modo local, quando seleciono "Mais Recentes", então a lista é ordenada por data de criação desc.
- [ ] **CA04:** Dado um documento sem `created_at`, quando carrego o catálogo, então ele aparece na lista.

## O que a atividade não inclui

- Histórico de versões/auditoria de alterações.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Edição preserva data | Criar produto, anotar `created_at`, editar preço | `created_at` igual; `updated_at` novo |
| CT02 | Ordem estável | Criar A, B, C; editar A; abrir catálogo em "Mais Recentes" | C, B, A |
| CT03 | Modo local | Sem Firebase, criar 2 itens e ordenar | Mais novo primeiro |
| CT04 | Documento legado | Inserir doc sem `created_at` | Aparece na listagem |

## URL Complementar

- Documentação técnica: https://firebase.google.com/docs/firestore/manage-data/add-data#server_timestamp
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
