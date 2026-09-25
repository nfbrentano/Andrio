# [SEC] Open redirect / execução de `javascript:` pelo parâmetro `redirect` do login

## Detalhes da Atividade

- **O que precisa ser feito:** Em `login.html` (script inline), após o login é feito `window.location.href = params.get('redirect') || 'admin.html'` sem validação. Um link como `login.html?redirect=https://site-malicioso` redireciona o administrador para fora do site logo após autenticar, e `login.html?redirect=javascript:...` **executa código arbitrário na origem da loja com a sessão do admin autenticada** (acesso ao Firebase Auth e ao Firestore com permissão de escrita). Validar o destino contra uma lista de páginas internas permitidas.
- **Por que é necessário:** Vulnerabilidade explorável por phishing: basta enviar um link legítimo do domínio da loja ao administrador.
- **Qual valor será agregado:** Proteção da conta administrativa e dos dados do catálogo.
- **Para quem é destinado:** Administradores do painel e a segurança da loja.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: O `redirect` só pode apontar para páginas internas de uma allowlist (ex.: `admin.html`).
- RF02: Qualquer valor fora da allowlist (URL absoluta, `//host`, `javascript:`, `data:`) deve ser ignorado e usar `admin.html`.

### Requisitos não-funcionais

- RNF01: Validação feita resolvendo com `new URL(valor, location.origin)` e checando `origin` e `pathname`.
- RNF02: Considerar adicionar Content-Security-Policy que bloqueie `javascript:` e scripts inline (exige mover o script inline de `login.html` para arquivo `.js`).

### Dependências técnicas

- `login.html`, `js/auth.js` (`requireAuth` monta `login.html?redirect=admin.html`).

### Recursos necessários

- N/A — sem dependências externas.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o link `login.html?redirect=javascript:alert(1)`, quando o admin faz login, então nenhum script é executado e ele é levado a `admin.html`.
- [ ] **CA02:** Dado o link `login.html?redirect=https://exemplo.com`, quando o admin faz login, então ele permanece no domínio e vai para `admin.html`.
- [ ] **CA03:** Dado o link `login.html?redirect=admin.html`, quando o admin faz login, então é levado a `admin.html`.
- [ ] **CA04:** Dado o link `login.html?redirect=//exemplo.com`, quando o admin faz login, então vai para `admin.html`.

## O que a atividade não inclui

- Revisão das regras do Firestore/Storage (ver `2026-09-24_regras-firebase-e-guard-do-admin.md`).
- Implementação de 2FA.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | `javascript:` | Login com `?redirect=javascript:alert(document.domain)` | Sem alerta; vai para admin |
| CT02 | URL externa | Login com `?redirect=https://google.com` | Vai para admin |
| CT03 | Protocol-relative | Login com `?redirect=//google.com` | Vai para admin |
| CT04 | Caminho válido | Login com `?redirect=admin.html` | Vai para admin |
| CT05 | Sem parâmetro | Login sem `redirect` | Vai para admin |

## URL Complementar

- Documentação técnica: https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24 (`login.html`, trecho `const redirect = params.get('redirect') || 'admin.html'`).
