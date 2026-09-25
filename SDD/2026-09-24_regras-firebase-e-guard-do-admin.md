# [SEC] Restringir escrita no Firebase a administradores e endurecer o acesso ao painel

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. `firestore.rules` e `storage.rules` permitem escrita para **qualquer** `request.auth != null`. Se o provedor e-mail/senha permitir cadastro (padrão do Firebase), qualquer pessoa pode criar conta via API usando a `apiKey` pública e apagar/alterar o catálogo ou subir arquivos. Restringir a administradores (custom claim `admin` ou allowlist de UIDs/e-mails) e validar o schema dos documentos.
  2. `storage.rules` não limita tamanho nem tipo de arquivo.
  3. `js/auth.js` → `requireAuth()` libera o painel em "Modo Demonstração" quando o Firebase não inicializa (ex.: CDN do SDK bloqueada), e `admin.js` executa `updateConnectionStatus`/`loadDriveConfig` antes do guard.
  4. `login.html` e `admin.html` permitem trocar a configuração do Firebase via `localStorage` (`firebase_config`), o que pode apontar o app para outro projeto.
- **Por que é necessário:** Integridade do catálogo e prevenção de abuso de Storage (custos).
- **Qual valor será agregado:** Apenas administradores autorizados alteram dados; painel não fica exposto por falha de rede.
- **Para quem é destinado:** Dono da loja e administradores.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Escrita em `produtos/*` e `configuracoes/*` somente se `request.auth.token.admin == true` (ou UID em allowlist).
- RF02: Validar no Firestore campos obrigatórios e tipos (`nome` string ≤ 120, `categoria` ∈ {poltrona, mesa, cadeira, luminaria}, `imagens` lista ≤ 20, etc.).
- RF03: Storage: escrita só para admin, `contentType` `image/*` e tamanho ≤ 5 MB.
- RF04: `requireAuth()` deve redirecionar para o login quando o Firebase não estiver disponível (remover liberação em modo demo em produção).
- RF05: O conteúdo do painel só é carregado após confirmação de autenticação.
- RF06: Remover (ou restringir a ambiente de desenvolvimento) a troca de configuração do Firebase pela UI.
- RF07: Desabilitar cadastro público de usuários no console do Firebase (Authentication > Settings > User actions).

### Requisitos não-funcionais

- RNF01: Regras cobertas por testes no Firebase Emulator (`@firebase/rules-unit-testing`).
- RNF02: Leitura pública do catálogo mantida.

### Dependências técnicas

- `firestore.rules`, `storage.rules`, `firebase.json`, `js/auth.js`, `js/admin.js`, `login.html`, `admin.html`.
- Firebase CLI/Admin SDK para definir custom claims.

### Recursos necessários

- Acesso de owner ao projeto `paco-moveis`.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um usuário autenticado sem claim de admin, quando tenta gravar em `produtos`, então a operação é negada.
- [ ] **CA02:** Dado um admin, quando cadastra/edita/exclui um móvel, então a operação é permitida.
- [ ] **CA03:** Dado um upload de arquivo de 10 MB ou `application/pdf`, quando enviado ao Storage, então é negado.
- [ ] **CA04:** Dado que o SDK do Firebase não carrega, quando acesso `admin.html`, então sou redirecionado ao login e o painel não é exibido.
- [ ] **CA05:** Dado um visitante anônimo, quando acessa a home, então os produtos continuam sendo lidos normalmente.
- [ ] **CA06:** Dado a tela de login em produção, quando a abro, então não há opção de colar outra configuração do Firebase.

## O que a atividade não inclui

- Painel de gestão de usuários/admins.
- Correção do open redirect (ver `2026-09-24_open-redirect-no-login.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Usuário comum | No emulador, autenticar sem claim e `set` em `produtos/x` | `PERMISSION_DENIED` |
| CT02 | Admin | Autenticar com claim `admin` e `set` válido | Sucesso |
| CT03 | Schema inválido | Admin grava `categoria: "sofa"` | Negado |
| CT04 | Storage grande | Upload de 10 MB | Negado |
| CT05 | SDK bloqueado | Bloquear `gstatic.com` e abrir `admin.html` | Redireciona para login |
| CT06 | Leitura pública | Anônimo lê `produtos` | Sucesso |

## URL Complementar

- Documentação técnica: https://firebase.google.com/docs/rules/rules-and-auth , https://firebase.google.com/docs/auth/admin/custom-claims
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
