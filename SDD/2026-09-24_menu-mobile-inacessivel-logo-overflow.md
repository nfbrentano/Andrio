# [FIX] Menu mobile inacessível: logo ultrapassa a largura da tela e empurra o botão hambúrguer

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir o dimensionamento do logo na navbar em telas pequenas. Em viewport de 375px o `.fun-logo-img` renderiza com ~496px de largura (altura 146px, `width: auto`), empurrando o botão `#fun-hamburger` para x≈512px, fora da tela, em `index.html`, `catalogo.html` e `produto.html`.
- **Por que é necessário:** No celular o usuário não consegue abrir o menu de categorias nem acessar "Ver Catálogo Completo". O logo aparece cortado. Regressão introduzida pelo commit `7301270` (animação de escala do logo com `max-height: 146px` em `.fun-navbar .fun-logo-img`, `css/style.css:196`).
- **Qual valor será agregado:** Navegação mobile funcional (maioria do tráfego de e-commerce) e identidade visual preservada.
- **Para quem é destinado:** Visitantes da loja em dispositivos móveis.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: O logo deve caber na navbar junto com o botão hambúrguer em larguras de 320px a 1024px.
- RF02: O botão hambúrguer deve estar sempre visível e clicável em viewport ≤ 1024px.
- RF03: A animação de redução do logo no scroll (`.scrolled`) deve continuar funcionando.

### Requisitos não-funcionais

- RNF01: Sem rolagem horizontal da página (`scrollWidth <= innerWidth`).
- RNF02: Sem CLS perceptível ao carregar o logo (manter `width`/`height` no `<img>`).

### Dependências técnicas

- `css/style.css` (regras `.fun-logo-img`, `.fun-navbar .fun-logo-img`, `.fun-logo-wrap`).

### Recursos necessários

- Dispositivos/emuladores 320px, 375px, 414px, 768px e 1024px.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou em um celular de 375px, quando abro `index.html`, `catalogo.html` ou `produto.html`, então o logo aparece inteiro e o botão hambúrguer fica visível dentro da tela.
- [ ] **CA02:** Dado que estou em um celular de 320px, quando toco no hambúrguer, então o menu de categorias abre.
- [ ] **CA03:** Dado que rolo a página, quando a navbar recebe `.scrolled`, então o logo reduz sem cortar e sem sobrepor o hambúrguer.
- [ ] **CA04:** Dado qualquer viewport entre 320px e 1440px, quando a página carrega, então não há rolagem horizontal.

## O que a atividade não inclui

- Redesenho do logo ou da navbar.
- Melhorias de acessibilidade do menu (tratadas em `2026-09-24_acessibilidade-navegacao-e-cards.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Hambúrguer visível | Emular 375×812, abrir `index.html`, medir `#fun-hamburger.getBoundingClientRect().right` | Valor ≤ 375 |
| CT02 | Logo inteiro | Emular 375px, medir largura de `.fun-logo-img` | Largura ≤ largura disponível menos o hambúrguer |
| CT03 | Menu abre | Emular 320px, tocar no hambúrguer | Menu `#fun-nav-menu` recebe `.is-open` |
| CT04 | Scroll | Rolar 100px | Logo reduz para `max-height: 70px`, sem sobreposição |
| CT05 | Desktop | Viewport 1440px | Layout igual ao atual |

## URL Complementar

- Documentação técnica: N/A — correção de CSS local.
- Protótipo / mockup: N/A — manter o layout desktop atual.
- Discussões relacionadas: commit `7301270` (refactor: animate logo scaling on navbar scroll).
- Referências de design: N/A.
- Requisitos originais: Validação da aplicação em 2026-09-24 (logo 496px e hambúrguer em x=512px em viewport de 375px).
