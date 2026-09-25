# [FIX] Service worker com precache incompleto e cache de requisições de terceiros

## Detalhes da Atividade

- **O que precisa ser feito:** Em `sw.js`:
  1. O precache não inclui `produto.html`, `js/produto.js` e `assets/logo.webp` (logo atual), mas inclui `assets/LOGO.png` (antigo) — a página de produto não funciona offline e o logo não é pré-cacheado.
  2. Qualquer GET cross-origin (Firestore, Google Drive, gstatic, jsDelivr) cai no ramo stale-while-revalidate e é gravado no cache sem limite, inclusive respostas de API — risco de dados desatualizados e crescimento indefinido do cache.
  3. O comentário e a exceção tratam `supabase.co`, que não é mais usado; faltam exceções para `firestore.googleapis.com`, `firebasestorage` e `identitytoolkit`.
  4. `admin.html`/`login.html`/`js/admin.js` são pré-cacheados para todos os visitantes sem necessidade.
  5. A versão (`paco-cache-v11`) é incrementada manualmente; esquecer de alterá-la mantém CSS/JS antigos.
  6. O SW só é registrado em `index.html`.
- **Por que é necessário:** Visitantes podem ver catálogo/preços desatualizados e versões antigas de CSS/JS após deploy.
- **Qual valor será agregado:** Atualizações confiáveis e offline previsível.
- **Para quem é destinado:** Visitantes recorrentes da loja.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Precache apenas de assets públicos existentes, incluindo `produto.html`, `js/produto.js`, `assets/logo.webp`.
- RF02: Não interceptar/cachear requisições para APIs do Firebase/Google (Firestore, Auth, Storage metadata).
- RF03: Cache de imagens em cache separado com limite de entradas/expiração.
- RF04: Remover referências a Supabase (`sw.js` e função morta `carregarSupabaseScript` em `js/app.js`).
- RF05: Versão do cache gerada automaticamente no deploy (hash/commit) ou estratégia network-first para JS/CSS.
- RF06: Registrar o SW em todas as páginas públicas.

### Requisitos não-funcionais

- RNF01: Tamanho do cache limitado (ex.: 60 imagens).
- RNF02: Nenhum erro de precache no console na instalação.

### Dependências técnicas

- `sw.js`, `index.html`, `catalogo.html`, `produto.html`, `.github/workflows/deploy.yml`.

### Recursos necessários

- N/A — opcionalmente Workbox via CDN.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que visitei o site uma vez, quando fico offline e abro um produto já visitado, então a página de produto carrega.
- [ ] **CA02:** Dado que um produto foi editado no admin, quando o visitante recarrega a home, então vê os dados atualizados.
- [ ] **CA03:** Dado um novo deploy com CSS alterado, quando o visitante recarrega, então recebe o novo CSS sem limpar cache manualmente.
- [ ] **CA04:** Dado o DevTools > Cache Storage, quando inspeciono, então não há respostas de `firestore.googleapis.com`.

## O que a atividade não inclui

- Transformar o site em PWA instalável completo (manifest está na spec de SEO).
- Push notifications.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Instalação | Abrir home limpa, ver console do SW | Sem erros de precache |
| CT02 | Offline | Visitar produto, ativar offline, recarregar | Página carrega |
| CT03 | Dados frescos | Editar preço no admin, recarregar home | Preço novo |
| CT04 | Cache Storage | Inspecionar entradas | Sem APIs do Firebase |
| CT05 | Novo deploy | Alterar CSS e publicar | CSS novo após 1 reload |

## URL Complementar

- Documentação técnica: https://developer.chrome.com/docs/workbox/caching-strategies-overview
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
