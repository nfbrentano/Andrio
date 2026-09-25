# [CHORE] Deploy do GitHub Pages publica arquivos internos e de teste

## Detalhes da Atividade

- **O que precisa ser feito:** O workflow `.github/workflows/deploy.yml` publica o repositório inteiro (`path: '.'`). Com isso ficam públicos: `test-keen.html`, `test-slider.js` (com caminho local `/Users/...`), `.firebase/hosting..cache`, `firestore.rules`, `storage.rules`, `firebase.json`, `SDD/`, `CLAUDE.md`, `GEMINI.md`, `.DS_Store` (versionado em vários diretórios) e `assets/LOGO.png` não utilizado. Montar um diretório de publicação apenas com os arquivos do site, remover arquivos de teste/lixo do repositório e adicionar `.gitignore`.
- **Por que é necessário:** Exposição desnecessária de informações internas (estrutura, regras, caminhos locais, documentação de processo) e páginas de teste indexáveis.
- **Qual valor será agregado:** Superfície pública mínima e repositório limpo.
- **Para quem é destinado:** Time de desenvolvimento e segurança do projeto.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: O workflow copia para `_site/` somente `*.html` públicos, `css/`, `js/`, `assets/`, `sw.js`, `robots.txt`, `sitemap.xml` e publica `_site/`.
- RF02: Remover `test-keen.html` e `test-slider.js` (ou mover para `tests/` fora do deploy).
- RF03: Criar `.gitignore` com `.DS_Store`, `.firebase/`, `node_modules/` e remover `.DS_Store` versionados.
- RF04: Remover assets não referenciados (ex.: `assets/LOGO.png`, após atualizar o precache do SW).
- RF05: Decidir e documentar a hospedagem oficial (GitHub Pages vs. Firebase Hosting — existe `.firebase/hosting..cache`, mas `firebase.json` não configura hosting).

### Requisitos não-funcionais

- RNF01: Deploy continua automático no push para `main`.

### Dependências técnicas

- `.github/workflows/deploy.yml`, `sw.js` (lista de precache).

### Recursos necessários

- Permissão de administração do repositório no GitHub.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um deploy concluído, quando acesso `/test-keen.html`, `/SDD/modelo_feature.md`, `/firestore.rules` ou `/CLAUDE.md`, então recebo 404.
- [ ] **CA02:** Dado um deploy concluído, quando navego pelas páginas públicas, então tudo funciona como antes.
- [ ] **CA03:** Dado o repositório, quando executo `git ls-files | grep DS_Store`, então não há resultados.

## O que a atividade não inclui

- Migração de hospedagem.
- Configuração de domínio customizado (ver spec de SEO).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Arquivos internos | `curl -I <site>/CLAUDE.md` após deploy | 404 |
| CT02 | Páginas públicas | Abrir home, catálogo, produto, login, admin | 200 e funcionais |
| CT03 | Artefato | Baixar artifact do workflow | Só arquivos do site |
| CT04 | Repositório | `git ls-files \| grep -E "DS_Store\|test-"` | Vazio |

## URL Complementar

- Documentação técnica: https://github.com/actions/upload-pages-artifact
- Protótipo / mockup: N/A.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Revisão do repositório de 2026-09-24.
