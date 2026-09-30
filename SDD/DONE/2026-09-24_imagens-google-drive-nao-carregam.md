# [FIX] Imagens de produtos hospedadas no Google Drive não carregam (HTTP 429)

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Antigravity · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-30

## Detalhes da Atividade

- **O que precisa ser feito:** Parar de usar `https://drive.google.com/thumbnail?id=...` como fonte pública das imagens dos produtos e servir as fotos a partir do Firebase Storage.
- **Problema e evidência:** Os 4 produtos atuais no Firestore usam URLs de thumbnail do Drive, e todas retornaram **HTTP 429 (Too Many Requests)** na validação de 2026-09-24. O `onerror` troca as fotos por `assets/prod_poltrona.webp` / `hero_left_chair.webp`, então **todos os produtos aparecem com a mesma foto genérica** na home e no catálogo, e com imagem quebrada na página de produto.
- **Impacto de não fazer:** A vitrine não mostra as peças reais, o que tira a principal razão de compra num catálogo de móveis.
- **Para quem é destinado:** Visitantes da loja e administradores que cadastram produtos.
- **História de usuário:** Como visitante, quero ver a foto real de cada móvel, para decidir se peço orçamento.
- **Como saberemos que deu certo:** 0 respostas 429 no console, e 100% dos produtos com `img` apontando para o Firebase Storage.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Migrar (script ou botão no admin) as imagens existentes do Drive para o Storage e atualizar `img`/`imagens[]` dos documentos. | P0 | CA01, CA02 |
| RF02 | Ao adicionar um link do Drive no admin, baixar a imagem, comprimir com `ImageOptimizer` e enviá-la ao Storage. | P0 | CA03 |
| RF03 | O fallback de imagem mostra um placeholder "imagem indisponível", e não a foto de outro produto. | P1 | CA04 |
| RF04 | Avisar ao salvar se alguma imagem da galeria ainda aponta para o Drive. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Imagens em WebP, ≤ 1600px, com `Cache-Control: public, max-age=31536000` (reusar `js/image-optimizer.js`). | P0 | CA01 |
| RNF02 | LCP da home ≤ 2,5s em 4G no Lighthouse mobile. | P1 | CA02 |

### Dependências técnicas

- `js/admin.js` (importador em lote, `handleFilesUpload`), `js/shared/catalogo-data.js` (`normalizarUrlImagem`), `js/image-optimizer.js`, `storage.rules`.
- O download de arquivo do Drive pelo navegador pode ser bloqueado por CORS; talvez seja preciso script Node/Admin SDK ou a Drive API.

### Recursos necessários

- Acesso de escrita ao projeto Firebase `paco-moveis`.
- Arquivos originais das fotos, caso o download do Drive falhe.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um produto com imagem no Drive, quando a migração roda, então `img` e `imagens[]` passam a ter URLs do Firebase Storage.
- [x] **CA02:** Dado que abro a home e o catálogo, quando as imagens carregam, então cada produto mostra a própria foto e não há 429 no console.
- [x] **CA03:** Dado que colo um link de foto do Drive no admin, quando clico em adicionar, então a imagem vai para o Storage e a miniatura usa essa URL.
- [x] **CA04:** Dado que uma imagem falha ao carregar, quando o `onerror` dispara, então aparece o placeholder "imagem indisponível" e não a foto de outro produto.
- [x] **CA05:** Dado um produto com imagem do Drive, quando salvo no admin, então vejo um aviso de que a imagem não foi migrada.

## O que a atividade não inclui

- Integração completa com a Google Drive API (listagem de pastas): motivo: complexo demais agora.
- Edição ou recorte de imagens: motivo: baixo impacto.

### Considerado para o futuro (P2)

- Gerar várias larguras (`srcset`) no upload.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Os arquivos do Drive estão públicos ("qualquer pessoa com o link")? | PO | Sim | Sim, todos os 5 arquivos de imagem foram testados e baixados com sucesso via endpoint direto público sem autenticação. |
| D02 | Manter o importador de links do Drive no admin ou só upload de arquivo? | PO | Não | Manter o importador: quando o admin insere uma URL do Drive, o sistema baixa automaticamente com CORS aberto, otimiza para WebP e envia para o Storage. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Migração | integração | CA01 | Rodar a migração em produto com URL do Drive | Documento com URLs do Storage |
| CT02 | Vitrine | e2e | CA02 | Abrir `catalogo.html`, inspecionar `img.currentSrc` e a aba Network | URLs `firebasestorage`, `naturalWidth > 0`, sem 429 |
| CT03 | Link do Drive no admin | e2e | CA03 | Colar link de arquivo público | Upload feito, miniatura OK |
| CT04 | Imagem inexistente | e2e | CA04 | Cadastrar URL inválida | Placeholder "imagem indisponível" |
| CT05 | Aviso | manual | CA05 | Salvar produto com URL do Drive | Aviso exibido |

## URL Complementar

- Documentação técnica: https://firebase.google.com/docs/storage/web/upload-files
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24 (5 respostas 429 no console da home; todas as imagens dos cards no fallback).
- Issue / PR relacionado: N/A.
