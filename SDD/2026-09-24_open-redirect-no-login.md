# [FIX] Segurança: open redirect e execução de `javascript:` pelo parâmetro `redirect` do login

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Rascunho
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** — · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-25

## Detalhes da Atividade

- **O que precisa ser feito:** Validar o destino do parâmetro `redirect` do login, aceitando só páginas internas permitidas.
- **Problema e evidência:** Em `login.html:167-168` o código faz `window.location.href = params.get('redirect') || 'admin.html'` sem nenhuma validação. Com `login.html?redirect=https://site-malicioso`, o admin é mandado para fora do site logo depois de autenticar. Com `login.html?redirect=javascript:...`, o código roda na origem da loja com a sessão do admin (Firebase Auth e escrita no Firestore).
- **Impacto de não fazer:** Basta enviar ao administrador um link legítimo do domínio da loja para tomar a conta dele ou alterar/apagar o catálogo.
- **Para quem é destinado:** Administradores do painel.
- **História de usuário:** Como administrador, quero que o login só me leve a páginas do próprio painel, para que um link malicioso não use minha sessão.
- **Como saberemos que deu certo:** Nenhum dos 4 payloads dos casos de teste (`javascript:`, URL absoluta, `//host`, `data:`) executa código ou sai do domínio.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | `redirect` só pode apontar para páginas de uma allowlist interna (ex.: `admin.html`). | P0 | CA03 |
| RF02 | Valor fora da allowlist (URL absoluta, `//host`, `javascript:`, `data:`) é ignorado e o destino passa a ser `admin.html`. | P0 | CA01, CA02, CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Resolver o valor com `new URL(valor, location.origin)` e checar `origin === location.origin` e `pathname` na allowlist. | P0 | CA01–CA04 |
| RNF02 | Mover o script inline de `login.html` para um `.js`, para permitir uma CSP sem `unsafe-inline` no futuro. | P1 | — |

### Dependências técnicas

- `login.html` (script inline) e `js/auth.js:70` (`requireAuth` monta `login.html?redirect=admin.html`).

### Recursos necessários

- Conta de admin de teste no projeto Firebase `paco-moveis`.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o link `login.html?redirect=javascript:alert(1)`, quando o admin faz login, então nenhum script é executado e ele é levado a `admin.html`.
- [ ] **CA02:** Dado o link `login.html?redirect=https://exemplo.com`, quando o admin faz login, então ele fica no domínio e vai para `admin.html`.
- [ ] **CA03:** Dado o link `login.html?redirect=admin.html`, quando o admin faz login, então é levado a `admin.html`.
- [ ] **CA04:** Dado o link `login.html?redirect=//exemplo.com`, quando o admin faz login, então vai para `admin.html` e não para `exemplo.com`.

## O que a atividade não inclui

- Revisão das regras do Firestore/Storage: motivo: outra iniciativa (`2026-09-24_regras-firebase-e-guard-do-admin.md`).
- 2FA para admins: motivo: complexo demais agora.

### Considerado para o futuro (P2)

- Content-Security-Policy completa em todas as páginas (depende do RNF02).

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Além de `admin.html`, alguma outra página deve poder ser destino pós-login? | PO | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Payload `javascript:` | e2e | CA01 | Login com `?redirect=javascript:alert(document.domain)` | Sem alerta; vai para admin |
| CT02 | URL externa | e2e | CA02 | Login com `?redirect=https://google.com` | Vai para admin |
| CT03 | Caminho válido | e2e | CA03 | Login com `?redirect=admin.html` | Vai para admin |
| CT04 | Protocol-relative | e2e | CA04 | Login com `?redirect=//google.com` | Vai para admin |
| CT05 | Função de validação | unit | CA01–CA04 | Testar a função com os valores acima e `data:text/html,...` | Retorna `admin.html` para os inválidos |

## URL Complementar

- Documentação técnica: https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
- Protótipo / mockup: N/A — sem alteração visual.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão de código de 2026-09-24.
- Issue / PR relacionado: N/A.
