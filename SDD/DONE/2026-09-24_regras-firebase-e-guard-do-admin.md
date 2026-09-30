# [FIX] Segurança: restringir escrita no Firebase a administradores e endurecer o acesso ao painel

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Antigravity (validação e implementação) · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-30

## Detalhes da Atividade

- **O que precisa ser feito:** Deixar a escrita no Firestore e no Storage só para administradores, validar os dados gravados e impedir que o painel abra sem autenticação.
- **Problema e evidência:**
  1. `firestore.rules` e `storage.rules` liberam escrita para **qualquer** `request.auth != null`. Se o cadastro por e-mail/senha estiver aberto (padrão do Firebase), qualquer pessoa cria uma conta via API usando a `apiKey` pública e altera ou apaga o catálogo.
  2. `storage.rules` não limita tamanho nem tipo de arquivo.
  3. `Auth.requireAuth()` (`js/auth.js`) libera o painel em "Modo Demonstração" quando o Firebase não inicializa (ex.: CDN do SDK bloqueada). Além disso, `admin.js` roda `updateConnectionStatus`/`loadDriveConfig` antes do guard.
  4. `login.html` e `admin.html` deixam trocar a configuração do Firebase via `localStorage` (`firebase_config`).
- **Impacto de não fazer:** Catálogo apagado ou alterado por terceiros e custos de Storage por abuso de upload.
- **Para quem é destinado:** Dono da loja e administradores.
- **História de usuário:** Como dono da loja, quero que só administradores autorizados possam alterar produtos e imagens, para que o catálogo não seja vandalizado.
- **Como saberemos que deu certo:** 100% dos testes de regras no emulador passam, incluindo os negativos (usuário comum, schema inválido, upload grande).

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Escrita em `produtos/*` e `configuracoes/*` só se `request.auth.token.admin == true` (ou UID em allowlist). | P0 | CA01, CA02 |
| RF02 | Storage: escrita só para admin, `contentType` `image/*` e tamanho ≤ 5 MB. | P0 | CA03 |
| RF03 | Desabilitar o cadastro público de usuários no console do Firebase. | P0 | CA01 |
| RF04 | `requireAuth()` redireciona para o login quando o Firebase não está disponível (sem modo demo em produção). | P0 | CA04 |
| RF05 | Validar no Firestore os campos obrigatórios e os tipos (`nome` string ≤ 120, `categoria` ∈ {poltrona, mesa, cadeira, luminaria}, `imagens` lista ≤ 20). | P1 | CA07 |
| RF06 | Carregar os dados do painel só depois da autenticação confirmada. | P1 | CA04 |
| RF07 | Remover a troca de configuração do Firebase pela UI em produção. | P1 | CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Regras cobertas por testes no Firebase Emulator (`@firebase/rules-unit-testing`). | P0 | CA01–CA03, CA07 |
| RNF02 | Leitura pública do catálogo mantida, funcionando sem login. | P0 | CA05 |

### Dependências técnicas

- `firestore.rules`, `storage.rules`, `firebase.json`, `js/auth.js`, `js/admin.js`, `login.html`, `admin.html`.
- Firebase CLI/Admin SDK para definir custom claims (`scripts/set-admin-claim.js`).

### Recursos necessários

- Acesso de owner ao projeto `paco-moveis`.
- Lista dos e-mails que devem ser administradores.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um usuário autenticado sem claim de admin, quando tenta gravar em `produtos`, então a operação é negada.
- [x] **CA02:** Dado um admin, quando cadastra, edita ou exclui um móvel, então a operação é permitida.
- [x] **CA03:** Dado um upload de 10 MB ou de tipo `application/pdf`, quando enviado ao Storage, então é negado.
- [x] **CA04:** Dado que o SDK do Firebase não carrega, quando acesso `admin.html`, então sou redirecionado ao login e o painel não aparece.
- [x] **CA05:** Dado um visitante anônimo, quando acessa a home, então os produtos são lidos normalmente.
- [x] **CA06:** Dado a tela de login em produção, quando a abro, então não há opção de colar outra configuração do Firebase.
- [x] **CA07:** Dado um admin, quando grava `categoria: "sofa"`, então a escrita é negada.

## O que a atividade não inclui

- Tela de gestão de usuários/admins: motivo: baixo impacto, poucos admins, gestão via CLI / script `scripts/set-admin-claim.js`.
- Correção do open redirect: motivo: outra iniciativa (`2026-09-24_open-redirect-no-login.md`).

### Considerado para o futuro (P2)

- Papéis diferentes (editor, admin) com claims distintos.
- Firebase App Check para reduzir abuso da `apiKey` pública.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Quais contas devem ter a claim `admin`? | PO | Sim | Criado script utilitário `scripts/set-admin-claim.js` utilizando Firebase Admin SDK para que o PO/owner defina a claim `{ admin: true }` para qualquer email desejado. |
| D02 | O modo demo/local ainda é necessário em algum ambiente (dev)? | dev | Não | Não. O modo demo foi descontinuado no painel administrativo e no guard para evitar qualquer vazamento ou renderização não autorizada do painel. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Usuário comum | integração | CA01 | No emulador, autenticar sem claim e `set` em `produtos/x` | `PERMISSION_DENIED` |
| CT02 | Admin | integração | CA02 | Autenticar com claim `admin` e `set` válido | Sucesso |
| CT03 | Storage grande | integração | CA03 | Upload de 10 MB | Negado |
| CT04 | SDK bloqueado | e2e | CA04 | Bloquear `gstatic.com` e abrir `admin.html` | Redireciona para login |
| CT05 | Leitura pública | integração | CA05 | Anônimo lê `produtos` | Sucesso |
| CT06 | Config na UI | manual | CA06 | Abrir `login.html` em produção | Sem botão de configuração |
| CT07 | Schema inválido | integração | CA07 | Admin grava `categoria: "sofa"` | Negado |

## URL Complementar

- Documentação técnica: https://firebase.google.com/docs/rules/rules-and-auth , https://firebase.google.com/docs/auth/admin/custom-claims
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
- Issue / PR relacionado: N/A.
