/**
 * Testes Automatizados - Botões de categoria da página de produto
 * Cobre Requisitos: RF01, RF02, RF03, RNF01
 * Cobre Critérios de Aceitação: CA01, CA02, CA03, CA04
 * Cobre Casos de Teste: CT01, CT02, CT03, CT04
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${name}`);
        console.error(`     Erro: ${err.message}`);
    }
}

function runAllTests() {
    console.log('\n============================================================');
    console.log('🧪 Iniciando Testes: Filtros da Página de Produto');
    console.log('============================================================\n');

    const rootDir = path.resolve(__dirname, '..');
    const produtoHtml = fs.readFileSync(path.join(rootDir, 'produto.html'), 'utf-8');
    const styleCss = fs.readFileSync(path.join(rootDir, 'css/style.css'), 'utf-8');
    const produtoJs = fs.readFileSync(path.join(rootDir, 'js/produto.js'), 'utf-8');
    const catalogoJs = fs.readFileSync(path.join(rootDir, 'js/catalogo.js'), 'utf-8');

    // =========================================================================
    // 1. Verificação de Marcação HTML e Semântica de Links (RF01, RF03, CA01, CA03)
    // =========================================================================
    console.log('📄 1. RF03 / CA03: Semântica de Links (<a href>) em produto.html:');

    runTest('produto.html: botões de categoria convertidos em tags <a> com href válido para catalogo.html', () => {
        const categories = ['poltrona', 'mesa', 'cadeira', 'luminaria'];
        for (const cat of categories) {
            const hasLink = produtoHtml.includes(`<a href="catalogo.html?categoria=${cat}"`) ||
                            produtoHtml.includes(`<a href="catalogo.html?categoria=${cat} `);
            assert.ok(hasLink, `produto.html deve conter tag <a> para categoria ${cat} apontando para catalogo.html?categoria=${cat}`);
        }
    });

    runTest('produto.html: container de filtros não deve possuir tags <button> para as categorias', () => {
        const filtrosSectionMatch = produtoHtml.match(/<div id="filtros"[\s\S]*?<\/div>/);
        assert.ok(filtrosSectionMatch, 'Elemento #filtros deve existir em produto.html');
        const filtrosHtml = filtrosSectionMatch[0];
        assert.ok(!filtrosHtml.includes('<button class="fun-pill-btn"'), 'Filtros em produto.html não devem ser tags <button>');
    });

    runTest('produto.html: mantém atributos de acessibilidade consistentes nos links', () => {
        assert.ok(produtoHtml.includes('data-category="poltrona"'), 'Link poltrona deve ter data-category');
        assert.ok(produtoHtml.includes('data-category="mesa"'), 'Link mesa deve ter data-category');
        assert.ok(produtoHtml.includes('data-category="cadeira"'), 'Link cadeira deve ter data-category');
        assert.ok(produtoHtml.includes('data-category="luminaria"'), 'Link luminaria deve ter data-category');
    });

    // =========================================================================
    // 2. Verificação de Regras CSS (Visibilidade e Aparência dos Pills)
    // =========================================================================
    console.log('\n🎨 2. Estilos CSS e Visibilidade dos Filtros na Página de Produto:');

    runTest('style.css: remoção da regra de ocultar filtros em .produto-page', () => {
        assert.ok(
            !styleCss.includes('.produto-page .fun-navbar-filters {\n    display: none !important;') &&
            !styleCss.includes('.produto-page .fun-navbar-filters { display: none !important; }'),
            'style.css não deve ocultar .fun-navbar-filters na página de produto'
        );
    });

    runTest('style.css: .fun-pill-btn configurado para suportar links sem sublinhado e com alinhamento flex', () => {
        assert.ok(styleCss.includes('text-decoration: none;'), '.fun-pill-btn deve conter text-decoration: none para tags <a>');
        assert.ok(styleCss.includes('display: inline-flex;'), '.fun-pill-btn deve possuir display: inline-flex para alinhamento uniforme');
    });

    // =========================================================================
    // 3. Lógica de Destaque da Categoria do Produto Atual (RF02, CA02, CA04, CT02, CT04)
    // =========================================================================
    console.log('\n🌟 3. RF02 / CA02 / CA04: Destaque da Categoria do Produto:');

    // Carrega funções do produto.js para simulação
    const produtoModule = require('../js/produto.js');

    // Cria mock simples de DOM para os links de filtro
    function createMockFilterLinks() {
        const items = [
            { category: 'poltrona', classes: new Set(['fun-pill-btn', 'active']), attrs: { 'data-category': 'poltrona', 'aria-pressed': 'true', 'aria-selected': 'true', href: 'catalogo.html?categoria=poltrona' }, tagName: 'A' },
            { category: 'mesa', classes: new Set(['fun-pill-btn']), attrs: { 'data-category': 'mesa', 'aria-pressed': 'false', 'aria-selected': 'false', href: 'catalogo.html?categoria=mesa' }, tagName: 'A' },
            { category: 'cadeira', classes: new Set(['fun-pill-btn']), attrs: { 'data-category': 'cadeira', 'aria-pressed': 'false', 'aria-selected': 'false', href: 'catalogo.html?categoria=cadeira' }, tagName: 'A' },
            { category: 'luminaria', classes: new Set(['fun-pill-btn']), attrs: { 'data-category': 'luminaria', 'aria-pressed': 'false', 'aria-selected': 'false', href: 'catalogo.html?categoria=luminaria' }, tagName: 'A' }
        ];

        return items.map(item => ({
            tagName: item.tagName,
            dataset: { category: item.category },
            classList: {
                contains: (cls) => item.classes.has(cls),
                add: (cls) => item.classes.add(cls),
                remove: (cls) => item.classes.delete(cls),
                toggle: (cls, force) => {
                    if (force) item.classes.add(cls);
                    else item.classes.delete(cls);
                }
            },
            getAttribute: (attr) => item.attrs[attr] || null,
            setAttribute: (attr, val) => { item.attrs[attr] = String(val); },
            removeAttribute: (attr) => { delete item.attrs[attr]; },
            listeners: {},
            addEventListener(event, fn) {
                this.listeners[event] = this.listeners[event] || [];
                this.listeners[event].push(fn);
            },
            dispatchEvent(event) {
                if (this.listeners[event.type]) {
                    this.listeners[event.type].forEach(fn => fn(event));
                }
            }
        }));
    }

    runTest('normalizarCategoriaSlug: normaliza acentos e plural/singular', () => {
        assert.strictEqual(produtoModule.normalizarCategoriaSlug('Poltronas'), 'poltrona');
        assert.strictEqual(produtoModule.normalizarCategoriaSlug('poltrona'), 'poltrona');
        assert.strictEqual(produtoModule.normalizarCategoriaSlug('Mesas'), 'mesa');
        assert.strictEqual(produtoModule.normalizarCategoriaSlug('mesa'), 'mesa');
        assert.strictEqual(produtoModule.normalizarCategoriaSlug('Cadeiras'), 'cadeira');
        assert.strictEqual(produtoModule.normalizarCategoriaSlug('cadeira'), 'cadeira');
        assert.strictEqual(produtoModule.normalizarCategoriaSlug('Luminárias'), 'luminaria');
        assert.strictEqual(produtoModule.normalizarCategoriaSlug('luminaria'), 'luminaria');
        assert.strictEqual(produtoModule.normalizarCategoriaSlug('sofa'), 'sofa');
    });

    runTest('CA02 / CT02: Dado produto de categoria "poltrona", botão Poltronas fica com active e aria-current="page"', () => {
        const mockLinks = createMockFilterLinks();
        global.document = {
            querySelectorAll: (sel) => {
                if (sel.includes('.fun-navbar-filters .fun-pill-btn')) return mockLinks;
                return [];
            }
        };

        produtoModule.destacarCategoriaProduto('poltrona');

        const poltrona = mockLinks.find(l => l.dataset.category === 'poltrona');
        const mesa = mockLinks.find(l => l.dataset.category === 'mesa');
        const cadeira = mockLinks.find(l => l.dataset.category === 'cadeira');
        const luminaria = mockLinks.find(l => l.dataset.category === 'luminaria');

        assert.ok(poltrona.classList.contains('active'), 'Poltronas deve ter classe active');
        assert.strictEqual(poltrona.getAttribute('aria-current'), 'page', 'Poltronas deve ter aria-current="page"');
        assert.strictEqual(poltrona.getAttribute('aria-selected'), 'true', 'Poltronas deve ter aria-selected="true"');

        assert.ok(!mesa.classList.contains('active'), 'Mesa não deve ter active');
        assert.strictEqual(mesa.getAttribute('aria-current'), null, 'Mesa não deve ter aria-current');
        assert.strictEqual(mesa.getAttribute('aria-selected'), 'false', 'Mesa deve ter aria-selected="false"');

        assert.ok(!cadeira.classList.contains('active'), 'Cadeira não deve ter active');
        assert.ok(!luminaria.classList.contains('active'), 'Luminária não deve ter active');
    });

    runTest('CA02 / CT02: Dado produto de categoria "mesa", apenas botão Mesas fica ativo', () => {
        const mockLinks = createMockFilterLinks();
        global.document = {
            querySelectorAll: (sel) => {
                if (sel.includes('.fun-navbar-filters .fun-pill-btn')) return mockLinks;
                return [];
            }
        };

        produtoModule.destacarCategoriaProduto('mesa');

        const poltrona = mockLinks.find(l => l.dataset.category === 'poltrona');
        const mesa = mockLinks.find(l => l.dataset.category === 'mesa');

        assert.ok(!poltrona.classList.contains('active'), 'Poltrona não deve ter classe active');
        assert.ok(mesa.classList.contains('active'), 'Mesa deve ter classe active');
        assert.strictEqual(mesa.getAttribute('aria-current'), 'page', 'Mesa deve ter aria-current="page"');
        assert.strictEqual(mesa.getAttribute('aria-selected'), 'true', 'Mesa deve ter aria-selected="true"');
    });

    runTest('CA04 / CT04: Dado produto de categoria desconhecida "sofa", nenhum botão fica ativo e console sem erros', () => {
        const mockLinks = createMockFilterLinks();
        global.document = {
            querySelectorAll: (sel) => {
                if (sel.includes('.fun-navbar-filters .fun-pill-btn')) return mockLinks;
                return [];
            }
        };

        let consoleErrors = [];
        const originalError = console.error;
        console.error = (msg) => consoleErrors.push(msg);

        try {
            produtoModule.destacarCategoriaProduto('sofa');
        } finally {
            console.error = originalError;
        }

        const anyActive = mockLinks.some(l => l.classList.contains('active'));
        assert.ok(!anyActive, 'Nenhum botão de categoria deve ficar ativo para "sofa"');
        assert.strictEqual(consoleErrors.length, 0, 'Nenhum erro deve ser disparado no console');

        for (const link of mockLinks) {
            assert.strictEqual(link.getAttribute('aria-selected'), 'false');
            assert.strictEqual(link.getAttribute('aria-current'), null);
        }
    });

    runTest('CA04: Produto nulo ou não especificado remove ativação de todos os botões', () => {
        const mockLinks = createMockFilterLinks();
        global.document = {
            querySelectorAll: (sel) => {
                if (sel.includes('.fun-navbar-filters .fun-pill-btn')) return mockLinks;
                return [];
            }
        };

        produtoModule.destacarCategoriaProduto(null);
        const anyActive = mockLinks.some(l => l.classList.contains('active'));
        assert.ok(!anyActive, 'Nenhum botão deve ficar ativo para produto nulo');
    });

    // =========================================================================
    // 4. Navegação e Interações de Clique (RF01, CA01, CA03, CT01, CT03, RNF01)
    // =========================================================================
    console.log('\n🔗 4. RF01 / CA01 / CA03: Navegação e Suporte a Nova Aba (Ctrl/Cmd):');

    runTest('CA03 / CT03: Clique com Ctrl ou Cmd permite comportamento nativo sem desviar navegação', () => {
        const mockLinks = createMockFilterLinks();
        global.document = {
            querySelectorAll: (sel) => {
                if (sel.includes('.fun-navbar-filters .fun-pill-btn')) return mockLinks;
                return [];
            }
        };

        produtoModule.configurarFiltrosCategoriaProduto();

        const cadeiraLink = mockLinks.find(l => l.dataset.category === 'cadeira');
        assert.ok(cadeiraLink.listeners['click'] && cadeiraLink.listeners['click'].length > 0, 'Listener de click deve estar registrado');

        let navigatedUrl = null;
        global.window = {
            location: {
                set href(val) { navigatedUrl = val; },
                get href() { return navigatedUrl; }
            }
        };

        let defaultPrevented = false;
        const mockEventCmd = {
            type: 'click',
            metaKey: true,
            ctrlKey: false,
            button: 0,
            preventDefault: () => { defaultPrevented = true; }
        };

        cadeiraLink.dispatchEvent(mockEventCmd);

        assert.strictEqual(defaultPrevented, false, 'preventDefault NÃO deve ser chamado em Cmd+clique para permitir nova aba');
        assert.strictEqual(navigatedUrl, null, 'window.location.href não deve ser sobrescrito em Cmd+clique');

        const mockEventCtrl = {
            type: 'click',
            metaKey: false,
            ctrlKey: true,
            button: 0,
            preventDefault: () => { defaultPrevented = true; }
        };

        cadeiraLink.dispatchEvent(mockEventCtrl);
        assert.strictEqual(defaultPrevented, false, 'preventDefault NÃO deve ser chamado em Ctrl+clique');
        assert.strictEqual(navigatedUrl, null, 'window.location.href não deve ser sobrescrito em Ctrl+clique');
    });

    runTest('CA01 / CT01: Link possui href correto apontando para catalogo.html?categoria=luminaria', () => {
        const mockLinks = createMockFilterLinks();
        global.document = {
            querySelectorAll: (sel) => {
                if (sel.includes('.fun-navbar-filters .fun-pill-btn')) return mockLinks;
                return [];
            }
        };

        produtoModule.configurarFiltrosCategoriaProduto();
        const luminariaLink = mockLinks.find(l => l.dataset.category === 'luminaria');

        assert.strictEqual(luminariaLink.getAttribute('href'), 'catalogo.html?categoria=luminaria');
    });

    runTest('RNF01: Clique em botão legado sem tag <a> redireciona via window.location sem erros de console', () => {
        const mockButton = {
            tagName: 'BUTTON',
            dataset: { category: 'mesa' },
            getAttribute: () => null,
            setAttribute: () => {},
            listeners: {},
            addEventListener(ev, fn) {
                this.listeners[ev] = this.listeners[ev] || [];
                this.listeners[ev].push(fn);
            },
            dispatchEvent(ev) {
                if (this.listeners[ev.type]) {
                    this.listeners[ev.type].forEach(fn => fn(ev));
                }
            }
        };

        global.document = {
            querySelectorAll: () => [mockButton]
        };

        let targetUrl = null;
        global.window = {
            location: {
                set href(val) { targetUrl = val; },
                get href() { return targetUrl; }
            }
        };

        produtoModule.configurarFiltrosCategoriaProduto();

        let prevented = false;
        mockButton.dispatchEvent({
            type: 'click',
            metaKey: false,
            ctrlKey: false,
            button: 0,
            preventDefault: () => { prevented = true; }
        });

        assert.strictEqual(prevented, true, 'Deve prevenir comportamento padrão de button');
        assert.strictEqual(targetUrl, 'catalogo.html?categoria=mesa', 'Deve redirecionar para a categoria correta');
    });

    console.log('\n============================================================');
    console.log(`📊 Resultado dos Testes: ${passedTests}/${totalTests} passaram com sucesso!`);
    console.log('============================================================\n');

    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

runAllTests();
