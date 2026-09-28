# [FIX] Menu mobile inacessível: logo ultrapassa a largura da tela e empurra o botão hambúrguer

<!--
Tags padronizadas: [FEAT] · [FIX] · [UI] · [SEO] · [REFACTOR] · [CHORE] · [DOCS]
-->

> **Status:** Rascunho
> **Autor:** Claude Code (validação da aplicação) · **Revisor:** — · **Criada em:** 2026-09-24 · **Atualizada em:** 2026-09-25

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir o tamanho do logo na navbar em telas pequenas para que o botão hambúrguer fique visível.
- **Problema e evidência:** Em 375px, `.fun-logo-img` renderiza com ~496px de largura (altura 146px, `width: auto`). Isso empurra `#fun-hamburger` para x≈512px, fora da tela, em `index.html`, `catalogo.html` e `produto.html` (medido no navegador em 2026-09-24). A causa é a regra `.fun-navbar .fun-logo-img { max-height: 146px }` em `css/style.css:196`, introduzida no commit `7301270`.
- **Impacto de não fazer:** No celular o visitante não consegue abrir o menu de categorias nem chegar ao catálogo, e o logo aparece cortado.
- **Para quem é destinado:** Visitantes da loja em celulares.
- **História de usuário:** Como visitante no celular, quero ver o logo inteiro e abrir o menu, para navegar pelas categorias.
- **Como saberemos que deu certo:** `#fun-hamburger.getBoundingClientRect().right ≤ innerWidth` de 320px a 1024px nas 3 páginas públicas.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | O logo cabe na navbar junto com o hambúrguer de 320px a 1024px. | P0 | CA01 |
| RF02 | O hambúrguer fica sempre visível e clicável em viewport ≤ 1024px. | P0 | CA01, CA02 |
| RF03 | A redução do logo no scroll (`.scrolled`) continua funcionando. | P1 | CA03 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Sem rolagem horizontal (`scrollWidth <= innerWidth`) de 320px a 1440px. | P0 | CA04 |
| RNF02 | Manter `width`/`height` no `<img>`; CLS < 0,1 no Lighthouse mobile. | P1 | CA01 |

### Dependências técnicas

- `css/style.css` (`.fun-logo-img`, `.fun-navbar .fun-logo-img`, `.fun-logo-wrap`, `.fun-navbar.scrolled`).

### Recursos necessários

- Emulação de 320px, 375px, 414px, 768px e 1024px e um iPhone/Android real.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um celular de 375px, quando abro `index.html`, `catalogo.html` ou `produto.html`, então o logo aparece inteiro e o hambúrguer fica dentro da tela.
- [ ] **CA02:** Dado um celular de 320px, quando toco no hambúrguer, então o menu de categorias abre.
- [ ] **CA03:** Dado que rolo a página, quando a navbar recebe `.scrolled`, então o logo diminui sem cortar e sem cobrir o hambúrguer.
- [ ] **CA04:** Dado qualquer largura entre 320px e 1440px, quando a página carrega, então não há rolagem horizontal.
- [ ] **CA05:** Dado um desktop de 1440px, quando a página carrega, então o layout não muda em relação ao atual (caso negativo).

## O que a atividade não inclui

- Redesenho do logo ou da navbar: motivo: fora do escopo de correção.
- Acessibilidade de cards e lightbox: motivo: outra iniciativa (`2026-09-24_acessibilidade-navegacao-e-cards.md`).

### Considerado para o futuro (P2)

- Versão reduzida do logo (símbolo) para telas < 360px.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Qual altura máxima do logo no mobile o design aprova? | design | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Hambúrguer visível | e2e | CA01 | 375×812, medir `#fun-hamburger.getBoundingClientRect().right` nas 3 páginas | ≤ 375 |
| CT02 | Menu abre | e2e | CA02 | 320px, tocar no hambúrguer | `#fun-nav-menu` com `.is-open` |
| CT03 | Scroll | manual | CA03 | Rolar 100px | Logo menor, sem sobreposição |
| CT04 | Sem scroll horizontal | e2e | CA04 | Medir `scrollWidth` em 320/375/768/1024/1440 | `≤ innerWidth` |
| CT05 | Desktop inalterado | manual | CA05 | Comparar screenshot em 1440px | Igual ao atual |

## URL Complementar

- Documentação técnica: N/A — correção de CSS local.
- Protótipo / mockup: N/A — manter o layout desktop atual.
- Discussões relacionadas: commit `7301270` (refactor: animate logo scaling on navbar scroll).
- Referências de design: N/A.
- Requisitos originais: Validação da aplicação em 2026-09-24.
- Issue / PR relacionado: N/A.
