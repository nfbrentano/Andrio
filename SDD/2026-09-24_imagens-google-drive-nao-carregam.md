# [FIX] Imagens de produtos hospedadas no Google Drive não carregam (HTTP 429)

## Detalhes da Atividade

- **O que precisa ser feito:** Parar de depender de `https://drive.google.com/thumbnail?id=...` como fonte de imagens públicas dos produtos. Os 4 produtos atuais no Firestore usam essas URLs e todas retornam **HTTP 429 (Too Many Requests)**; o `onerror` troca todas por `assets/prod_poltrona.webp` / `hero_left_chair.webp`, então **todos os produtos aparecem com a mesma foto genérica** na home, no catálogo, e com imagem quebrada na página de produto.
- **Por que é necessário:** O endpoint de thumbnail do Drive não é uma CDN; tem limite de taxa, pode exigir permissão e não garante disponibilidade. A vitrine fica sem as fotos reais das peças.
- **Qual valor será agregado:** Fotos reais, rápidas e confiáveis (Firebase Storage já é usado pelo upload do admin com compressão WebP).
- **Para quem é destinado:** Visitantes da loja e administradores que cadastram produtos.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: O admin deve importar a imagem a partir do link do Drive (ou arquivo) e armazená-la no Firebase Storage, gravando no produto a URL do Storage.
- RF02: Criar rotina (script ou botão no admin) para migrar as imagens existentes com URL do Drive para o Storage e atualizar os documentos.
- RF03: Ao salvar, o admin deve avisar se alguma imagem da galeria ainda aponta para o Drive.
- RF04: O fallback de imagem deve indicar "imagem indisponível" em vez de mostrar a foto de outro produto.

### Requisitos não-funcionais

- RNF01: Imagens servidas com `Cache-Control` longo (já configurado em `ImageOptimizer.uploadToFirebase`).
- RNF02: Imagens em WebP com no máximo 1600px (reutilizar `js/image-optimizer.js`).

### Dependências técnicas

- `js/admin.js` (`normalizarUrlImagem`, importador em lote, `handleFilesUpload`).
- `js/image-optimizer.js`, Firebase Storage, regras `storage.rules`.
- Download de imagem do Drive exige que o arquivo seja público ou uso da Drive API (CORS).

### Recursos necessários

- Acesso de escrita ao projeto Firebase `paco-moveis`.
- Arquivos originais das fotos (caso o download do Drive via navegador seja bloqueado por CORS).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um produto com imagem no Drive, quando a migração é executada, então o documento passa a ter `img` e `imagens[]` com URLs do Firebase Storage.
- [ ] **CA02:** Dado que abro a home e o catálogo, quando as imagens carregam, então cada produto mostra sua própria foto (nenhum 429 no console).
- [ ] **CA03:** Dado que colo um link do Drive no admin, quando clico em adicionar, então a imagem é enviada ao Storage e a miniatura exibida usa a URL do Storage.
- [ ] **CA04:** Dado que uma imagem falha ao carregar, quando o `onerror` dispara, então é exibido um placeholder neutro de "imagem indisponível".

## O que a atividade não inclui

- Integração completa com a Google Drive API (listagem de pastas).
- Edição/recorte de imagens.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Vitrine com fotos reais | Abrir `catalogo.html`, inspecionar `img.currentSrc` | URLs `firebasestorage.googleapis.com`, `naturalWidth > 0` |
| CT02 | Sem 429 | Abrir home com DevTools > Network | Nenhuma resposta 429 |
| CT03 | Migração | Rodar migração em produto com URL do Drive | Documento atualizado, imagem visível |
| CT04 | Link do Drive no admin | Colar link de arquivo público do Drive | Upload para Storage, miniatura OK |
| CT05 | Imagem inexistente | Cadastrar URL inválida | Placeholder "imagem indisponível" |

## URL Complementar

- Documentação técnica: https://firebase.google.com/docs/storage/web/upload-files
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Validação de 2026-09-24 — 5 respostas 429 no console da home; todas as imagens dos cards caíram no fallback.
