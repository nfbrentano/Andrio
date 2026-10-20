# [CHORE] Atualização do Firebase JS SDK (CDN) de 12.18.0 para 13.0.0

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael · **Criada em:** 2026-10-19 · **Atualizada em:** 2026-10-19

## Detalhes da Atividade

- **O que precisa ser feito:** Atualizar todas as referências ao Firebase JS SDK (compat) carregadas via CDN (`https://www.gstatic.com/firebasejs/`) da versão `12.18.0` para a versão mais recente `13.0.0` nos arquivos HTML do projeto (`index.html`, `catalogo.html`, `produto.html`, `admin.html` e `login.html`), além de incrementar a versão de fallback local do cache no Service Worker (`sw.js` de `v20` para `v21`) para invalidar caches locais desatualizados.
- **Problema e evidência:** Ao verificar dependências desatualizadas (`npm outdated`), identificou-se que os scripts do Firebase JS SDK (compat) nos arquivos HTML estão fixados na versão `12.18.0`, enquanto a versão estável mais recente publicada no registro oficial do npm e na CDN `gstatic.com` é a `13.0.0`. O `keen-slider@6.8.6` já encontra-se na última versão disponível.
- **Impacto de não fazer:** Manter versão anterior do SDK cliente do Firebase deixa o projeto sem as correções de estabilidade, segurança e melhorias de compatibilidade mais recentes da versão `13.0.0`.
- **Para quem é destinado:** Desenvolvedores, administradores do catálogo e usuários finais da plataforma PACO Móveis.
- **História de usuário:** Como mantenedor da plataforma PACO Móveis, quero manter o Firebase JS SDK atualizado na última versão estável da CDN (`13.0.0`), para garantir segurança, correções de bugs e compatibilidade contínua com os serviços Firestore, Auth e Storage.
- **Como saberemos que deu certo:** 100% das referências `firebasejs` nos 5 arquivos HTML apontando para `13.0.0`, 0 referências remanescentes para `12.18.0`, e 100% da suíte de testes automatizados existente + validação de versão passando com código de saída `0`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Atualizar as tags `<script>` de `firebase-app-compat.js` e `firebase-firestore-compat.js` para a versão `13.0.0` nas páginas públicas (`index.html`, `catalogo.html`, `produto.html`). | P0 | CA01, CA04 |
| RF02 | Atualizar as tags `<script>` de `firebase-app-compat.js`, `firebase-auth-compat.js`, `firebase-firestore-compat.js` e `firebase-storage-compat.js` para a versão `13.0.0` nas páginas restritas (`admin.html`, `login.html`). | P0 | CA02, CA04 |
| RF03 | Incrementar a versão de fallback do Service Worker (`sw.js`) de `v20` para `v21` para forçar a renovação do cache local após a atualização das páginas. | P1 | CA03 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Todos os artefatos `13.0.0` na CDN (`https://www.gstatic.com/firebasejs/13.0.0/firebase-*-compat.js`) devem estar acessíveis via HTTPS e manter o atributo `defer` nas tags `<script>`. | P0 | CA01, CA02 |
| RNF02 | Nenhuma regressão nas suítes de testes automatizados existentes em `scripts/test-*.js` (tempo de execução total < 5s). | P0 | CA03, CA04 |

### Dependências técnicas

- Disponibilidade dos bundles compat `13.0.0` na CDN oficial do Google (`https://www.gstatic.com/firebasejs/13.0.0/`).

### Recursos necessários

- Acesso aos arquivos HTML da raiz e ao Service Worker (`sw.js`).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que um visitante acessa qualquer página pública (`index.html`, `catalogo.html` ou `produto.html`), quando o HTML é carregado, então os scripts `firebase-app-compat.js` e `firebase-firestore-compat.js` devem ser carregados da URL `https://www.gstatic.com/firebasejs/13.0.0/` com o atributo `defer`.
- [x] **CA02:** Dado que um administrador acessa `login.html` ou `admin.html`, quando o HTML é carregado, então os scripts `firebase-app-compat.js`, `firebase-auth-compat.js`, `firebase-firestore-compat.js` e `firebase-storage-compat.js` devem ser carregados da URL `https://www.gstatic.com/firebasejs/13.0.0/` com o atributo `defer`.
- [x] **CA03:** Dado que o Service Worker (`sw.js`) é executado em ambiente sem hash de build injetado, quando `VERSION` é avaliada, então o identificador de cache padrão deve utilizar a nova versão (`v21`) e todos os testes de Service Worker devem passar sem erros.
- [x] **CA04:** Dado que a atualização foi concluída em todos os arquivos do projeto, quando é feita uma busca por `12.18.0` nos arquivos HTML e JS da aplicação, então nenhuma ocorrência da versão antiga deve ser encontrada.

## O que a atividade não inclui

- Migração do código cliente de Compat (`firebase.*`) para a API Modular (`import { ... } from 'firebase/...'`): motivo: outra iniciativa que exigiria refatoração ampla de todos os scripts em `js/`.
- Atualização do `keen-slider`: motivo: a versão `6.8.6` utilizada atualmente já é a mais recente disponível no npm/CDN.
- Criação de `package.json` ou bundler: motivo: o usuário optou por atualizar apenas o SDK do Firebase via CDN mantendo a arquitetura estática atual.

### Considerado para o futuro (P2)

- Adição de um `package.json` opcional para gerenciar scripts utilitários de CLI (`firebase-admin`) e execução unificada de testes via `npm test`.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Qual escopo de atualização aplicar após a verificação de versões? | PO / Usuário | Não | Respondido: atualizar o Firebase JS SDK via CDN de `12.18.0` para `13.0.0` nos arquivos HTML e `sw.js`. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Verificação de URLs `13.0.0` nas páginas públicas | Automatizado (integração) | CA01 | Inspecionar `index.html`, `catalogo.html` e `produto.html` verificando a presença de `firebasejs/13.0.0/firebase-app-compat.js` e `firebase-firestore-compat.js` com `defer`. | Os 3 arquivos contêm as tags apontando para `13.0.0` com `defer`. |
| CT02 | Verificação de URLs `13.0.0` nas páginas de admin e login | Automatizado (integração) | CA02 | Inspecionar `admin.html` e `login.html` verificando a presença dos 4 pacotes compat (`app`, `auth`, `firestore`, `storage`) na versão `13.0.0` com `defer`. | Ambos os arquivos contêm os 4 scripts na versão `13.0.0` com `defer`. |
| CT03 | Validação da suíte do Service Worker e versão de cache | Automatizado (unit) | CA03 | Executar `node scripts/test-service-worker.js` e validar `VERSION === 'v21'`. | Todos os testes passam (0 falhas). |
| CT04 | Ausência de referências legadas `12.18.0` | Automatizado (integração) | CA04 | Buscar `firebasejs/12.18.0` em todos os arquivos `.html` e `.js` do projeto. | 0 ocorrências encontradas. |

## URL Complementar

- Documentação técnica: https://firebase.google.com/support/release-notes/js
- Protótipo / mockup: N/A (atualização de dependência sem alteração visual)
- Discussões relacionadas: N/A (solicitação direta via chat)
- Referências de design: N/A (sem impacto de interface)
- Requisitos originais: Verificação `npm outdated` e atualização de dependências CDN
- Issue / PR relacionado: N/A
