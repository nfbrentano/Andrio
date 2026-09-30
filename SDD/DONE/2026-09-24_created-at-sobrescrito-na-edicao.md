# [FIX] Edição de produto sobrescreve `created_at` e altera a ordem "Mais Recentes"

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Rascunho
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** — · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-25

## Detalhes da Atividade

- **O que precisa ser feito:** Manter a data de criação do produto ao editar e registrar a data de atualização à parte.
- **Problema e evidência:** No submit do formulário do admin, `productData` sempre inclui `created_at: new Date().toISOString()` (`js/admin.js:620`), inclusive nas edições (`set(..., { merge: true })`). Toda edição faz o produto "virar novo". Além disso, "Mais Recentes" no catálogo (`js/catalogo.js:84`) não ordena nada no fallback local, e `orderBy('created_at')` (`js/shared/catalogo-data.js:159`) exclui documentos sem esse campo.
- **Impacto de não fazer:** A ordem do catálogo muda a cada ajuste de preço ou foto, a data real de cadastro se perde e documentos sem data somem da vitrine.
- **Para quem é destinado:** Administradores e visitantes do catálogo.
- **História de usuário:** Como administrador, quero corrigir um produto sem que ele pule para o topo, para que "Mais Recentes" mostre de fato os lançamentos.
- **Como saberemos que deu certo:** Depois de editar, `created_at` fica idêntico ao valor anterior em 100% dos casos testados.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | `created_at` gravado só na criação. | P0 | CA01, CA02 |
| RF02 | `updated_at` gravado em toda edição. | P0 | CA01 |
| RF03 | Produtos sem `created_at` não somem da listagem (migrar os dados ou tratar a ausência). | P0 | CA04 |
| RF04 | "Mais Recentes" ordena por `created_at` desc também no modo local. | P1 | CA03 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | O tipo de data é o mesmo em todos os documentos (Timestamp do servidor ou ISO — escolher um). | P1 | CA01 |

### Dependências técnicas

- `js/admin.js`, `js/catalogo.js`, `js/shared/catalogo-data.js`.

### Recursos necessários

- Script de migração pontual, se o tipo mudar para `serverTimestamp()`.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um produto criado em D1, quando o edito em D2, então `created_at` continua D1 e `updated_at` vira D2.
- [ ] **CA02:** Dado três produtos criados na ordem A, B, C, quando edito A, então "Mais Recentes" continua mostrando C, B, A.
- [ ] **CA03:** Dado o modo local, quando seleciono "Mais Recentes", então a lista fica ordenada por data de criação desc.
- [ ] **CA04:** Dado um documento sem `created_at`, quando carrego o catálogo, então ele aparece na lista.

## O que a atividade não inclui

- Histórico de versões ou auditoria de alterações: motivo: baixo impacto agora.

### Considerado para o futuro (P2)

- Registrar `updated_by` (e-mail do admin) em cada edição.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Padronizar em `serverTimestamp()` ou manter string ISO? | dev | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Edição preserva data | integração | CA01 | Criar produto, anotar `created_at`, editar o preço | `created_at` igual; `updated_at` novo |
| CT02 | Ordem estável | e2e | CA02 | Criar A, B, C; editar A; abrir "Mais Recentes" | C, B, A |
| CT03 | Modo local | e2e | CA03 | Sem Firebase, criar 2 itens e ordenar | Mais novo primeiro |
| CT04 | Documento legado | integração | CA04 | Inserir doc sem `created_at` | Aparece na listagem |

## URL Complementar

- Documentação técnica: https://firebase.google.com/docs/firestore/manage-data/add-data#server_timestamp
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
- Issue / PR relacionado: N/A.
