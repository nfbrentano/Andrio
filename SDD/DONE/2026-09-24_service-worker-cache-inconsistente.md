# [FIX] Service worker com precache desatualizado e versionamento manual

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Antigravity · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-10-01

## Detalhes da Atividade

- **O que precisa ser feito:** Ajustar o precache e o versionamento do `sw.js` para que os visitantes recebam os arquivos certos depois de cada deploy.
- **Problema e evidência:** Situação conferida em 2026-09-25, depois do commit `f11a92a`. Já foram resolvidos: exclusão das APIs Firebase/Google, precache de `produto.html`, `js/produto.js` e `js/shared/*`, remoção do Supabase. Continuam pendentes:
  1. O precache inclui `assets/LOGO.png` (antigo) e não o `assets/logo.webp` usado nas páginas.
  2. `admin.html`, `login.html`, `css/admin.css` e `js/admin.js` são pré-cacheados para todos os visitantes.
  3. A versão (`paco-cache-v12`) é incrementada à mão; se alguém esquecer, JS/CSS antigos continuam sendo servidos (stale-while-revalidate).
  4. O SW só é registrado em `index.html`.
  5. O cache de runtime não tem limite de entradas.
- **Impacto de não fazer:** Visitantes recorrentes podem ver CSS/JS de versões anteriores depois de um deploy (inclusive correções de segurança não aplicadas) e baixam arquivos do admin sem necessidade.
- **Para quem é destinado:** Visitantes recorrentes da loja.
- **História de usuário:** Como visitante recorrente, quero sempre ver a versão atual da loja, sem precisar limpar o cache.
- **Como saberemos que deu certo:** Depois de um deploy, 1 recarregamento basta para receber o CSS/JS novo, e o console fica sem erros de precache.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Versão do cache gerada automaticamente no deploy (hash do commit) ou estratégia network-first para JS/CSS. | P0 | CA02 |
| RF02 | Precache só de assets públicos existentes: trocar `LOGO.png` por `logo.webp` e remover os arquivos do admin. | P0 | CA01, CA03 |
| RF03 | Registrar o SW em todas as páginas públicas (`catalogo.html`, `produto.html`). | P1 | CA04 |
| RF04 | Cache de runtime com limite de entradas (ex.: 60) e expiração. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | 0 erros de `cache.addAll` no console na instalação. | P0 | CA01 |

### Dependências técnicas

- `sw.js`, `index.html`, `catalogo.html`, `produto.html`, `.github/workflows/deploy.yml` (injeção da versão).

### Recursos necessários

- N/A — opcionalmente Workbox via CDN.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado uma instalação limpa do SW, quando inspeciono o Cache Storage, então `assets/logo.webp` está presente e não há erros de precache.
- [x] **CA02:** Dado um novo deploy com CSS alterado, quando o visitante recarrega uma vez, então recebe o novo CSS.
- [x] **CA03:** Dado um visitante anônimo, quando o SW instala, então `admin.html` e `js/admin.js` não são baixados (caso negativo).
- [x] **CA04:** Dado que o visitante entrou direto pelo catálogo, quando fica offline e recarrega, então o catálogo carrega do cache.
- [x] **CA05:** Dado 100 imagens diferentes visitadas, quando inspeciono o cache de runtime, então ele não passa do limite configurado.

## O que a atividade não inclui

- PWA instalável completo: motivo: o manifest está na spec de SEO (P2).
- Push notifications: motivo: baixo impacto.

### Considerado para o futuro (P2)

- Migrar para Workbox com estratégias por rota.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O suporte offline é um requisito do negócio ou só otimização? | PO | Não | Implementado como resiliência/otimização: páginas públicas (`index`, `catalogo`, `produto`), CSS e JS suportam offline via cache fallback, e imagens usam cache de runtime limitado. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Instalação | e2e | CA01, CA03 | Abrir a home limpa e inspecionar o console e o Cache Storage | Sem erros; `logo.webp` presente; sem arquivos do admin |
| CT02 | Novo deploy | manual | CA02 | Alterar CSS, publicar e recarregar 1x | CSS novo |
| CT03 | Offline no catálogo | e2e | CA04 | Visitar o catálogo, ficar offline e recarregar | Página carrega |
| CT04 | Limite de cache | e2e | CA05 | Carregar muitas imagens e contar as entradas | ≤ limite |

## URL Complementar

- Documentação técnica: https://developer.chrome.com/docs/workbox/caching-strategies-overview
- Protótipo / mockup: N/A.
- Discussões relacionadas: commit `f11a92a` (resolveu parte dos itens originais).
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
- Issue / PR relacionado: N/A.
