# [CHORE] Deploy do GitHub Pages publica arquivos internos e de teste

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Concluído
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** Antigravity · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-30

## Detalhes da Atividade

- **O que precisa ser feito:** Publicar só os arquivos do site e limpar do repositório os arquivos de teste e de sistema.
- **Problema e evidência:** `.github/workflows/deploy.yml` publica o repositório inteiro (`path: '.'`). Com isso ficam públicos: `test-keen.html`, `test-slider.js` (com caminho local `/Users/...`), `.firebase/hosting..cache`, `.claude/launch.json`, `firestore.rules`, `storage.rules`, `firebase.json`, `SDD/`, `CLAUDE.md`, `GEMINI.md`, `.DS_Store` (versionado em 4 diretórios) e `assets/LOGO.png`, que não é usado nas páginas. Existe ainda um `venv/` local que não pode ser versionado.
- **Impacto de não fazer:** Estrutura interna, regras e documentação de processo expostas, e páginas de teste que podem ser indexadas.
- **Para quem é destinado:** Time de desenvolvimento e a segurança do projeto.
- **História de usuário:** Como dev, quero que o deploy publique só o site, para não expor arquivos internos e manter o repositório limpo.
- **Como saberemos que deu certo:** Todas as URLs internas listadas nos casos de teste retornam 404 depois do deploy.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | O workflow copia para `_site/` só `*.html` públicos, `css/`, `js/`, `assets/`, `sw.js`, `robots.txt` e `sitemap.xml`, e publica `_site/`. | P0 | CA01, CA02 |
| RF02 | Criar `.gitignore` com `.DS_Store`, `.firebase/`, `venv/` e `node_modules/`, e remover os `.DS_Store` versionados. | P0 | CA03 |
| RF03 | Remover `test-keen.html` e `test-slider.js`, ou movê-los para `tests/` fora do deploy. | P1 | CA01 |
| RF04 | Remover assets não referenciados (ex.: `assets/LOGO.png`, junto com o precache do SW). | P1 | CA04 |
| RF05 | Decidir e documentar a hospedagem oficial (GitHub Pages vs. Firebase Hosting; existe `.firebase/hosting..cache`, mas `firebase.json` não configura hosting). | P1 | — |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | O deploy continua automático a cada push em `main`. | P0 | CA02 |

### Dependências técnicas

- `.github/workflows/deploy.yml`, `sw.js` (lista de precache).

### Recursos necessários

- Permissão de administração do repositório no GitHub.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um deploy concluído, quando acesso `/test-keen.html`, `/SDD/modelo_feature.md`, `/firestore.rules`, `/.claude/launch.json` ou `/CLAUDE.md`, então recebo 404.
- [x] **CA02:** Dado um deploy concluído, quando navego pelas páginas públicas, então tudo funciona como antes.
- [x] **CA03:** Dado o repositório, quando executo `git ls-files | grep DS_Store`, então não há resultado.
- [x] **CA04:** Dado o repositório, quando procuro assets que nenhum arquivo referencia, então não encontro nenhum.

## O que a atividade não inclui

- Migração de hospedagem: motivo: outra iniciativa, depende do RF05.
- Domínio customizado: motivo: outra iniciativa (`2026-09-24_seo-dominio-metadados-e-sitemap.md`).

### Considerado para o futuro (P2)

- Etapa de build com minificação e hash nos nomes de arquivo.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | A hospedagem oficial é GitHub Pages ou Firebase Hosting? | dev/PO | Não | GitHub Pages é a hospedagem oficial do frontend (automatizada via `.github/workflows/deploy.yml`). O Firebase é usado exclusivamente como BaaS (Auth, Firestore, Storage); seu cache local foi removido e adicionado ao `.gitignore`. |
| D02 | `.claude/launch.json` deve continuar versionado para o time? | dev | Não | Sim, pode continuar versionado para testes locais da equipe, pois a publicação via `_site/` garante que ele não é publicado no GitHub Pages. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Arquivos internos | integração | CA01 | `curl -I <site>/CLAUDE.md` e demais URLs depois do deploy | 404 |
| CT02 | Páginas públicas | e2e | CA02 | Abrir home, catálogo, produto, login e admin | 200 e funcionando |
| CT03 | Artefato | manual | CA01 | Baixar o artifact do workflow | Só arquivos do site |
| CT04 | Repositório | unit | CA03 | `git ls-files \| grep -E "DS_Store\|test-"` | Vazio |
| CT05 | Assets órfãos | unit | CA04 | Cruzar `ls assets` com as referências no código | Nenhum órfão |

## URL Complementar

- Documentação técnica: https://github.com/actions/upload-pages-artifact
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão do repositório de 2026-09-24.
- Issue / PR relacionado: N/A.
