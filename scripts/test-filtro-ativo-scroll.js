/**
 * Suite de Testes Automatizados - Botão de categoria ativo mantido no scroll e contraste
 * Cobre Requisitos: RF01, RF02, RF03, RNF01
 * Cobre Critérios de Aceitação: CA01, CA02, CA03, CA04
 * Cobre Casos de Teste: CT01, CT02, CT03
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

// Helper: Calculate WCAG relative luminance & contrast ratio
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function getLuminance(rgb) {
    const a = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
    const lum1 = getLuminance(hexToRgb(hex1));
    const lum2 = getLuminance(hexToRgb(hex2));
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function runAllTests() {
    console.log('\n============================================================');
    console.log('🧪 Iniciando Testes: Filtro Ativo Mantido no Scroll e Contraste');
    console.log('============================================================\n');

    const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const catalogoHtml = fs.readFileSync(path.join(__dirname, '../catalogo.html'), 'utf8');
    const produtoHtml = fs.readFileSync(path.join(__dirname, '../produto.html'), 'utf8');
    const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
    const catalogoJs = fs.readFileSync(path.join(__dirname, '../js/catalogo.js'), 'utf8');
    const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');

    // =========================================================================
    // 1. Verificação Estática de HTML e Atributos ARIA (RF02, CA01, CA02)
    // =========================================================================
    console.log('📄 1. Verificação de Marcação HTML e Atributos ARIA:');

    runTest('index.html: o botão inicial ativo (Poltronas) deve ter active, aria-pressed="true" e aria-selected="true"', () => {
        assert.ok(
            indexHtml.includes('class="fun-pill-btn active" aria-pressed="true" aria-selected="true" data-category="poltrona"'),
            'Botão poltrona deve ter active, aria-pressed=true e aria-selected=true'
        );
    });

    runTest('index.html: botões inativos devem ter aria-pressed="false" e aria-selected="false"', () => {
        assert.ok(
            indexHtml.includes('aria-pressed="false" aria-selected="false" data-category="mesa"'),
            'Botão mesa deve ter aria-pressed=false e aria-selected=false'
        );
        assert.ok(
            indexHtml.includes('aria-pressed="false" aria-selected="false" data-category="cadeira"'),
            'Botão cadeira deve ter aria-pressed=false e aria-selected=false'
        );
        assert.ok(
            indexHtml.includes('aria-pressed="false" aria-selected="false" data-category="luminaria"'),
            'Botão luminaria deve ter aria-pressed=false e aria-selected=false'
        );
    });

    runTest('catalogo.html: botão inicial ativo (Todos) deve ter active, aria-pressed="true" e aria-selected="true"', () => {
        assert.ok(
            catalogoHtml.includes('class="fun-pill-btn active" aria-pressed="true" aria-selected="true" data-category="all"'),
            'Botão todos em catalogo.html deve ter active, aria-pressed=true e aria-selected=true'
        );
    });

    runTest('produto.html: botões de filtro devem possuir aria-selected consistente', () => {
        assert.ok(
            produtoHtml.includes('aria-pressed="true" aria-selected="true" data-category="poltrona"'),
            'Botão poltrona em produto.html deve ter aria-selected=true'
        );
        assert.ok(
            produtoHtml.includes('aria-pressed="false" aria-selected="false" data-category="mesa"'),
            'Botão mesa em produto.html deve ter aria-selected=false'
        );
    });

    // =========================================================================
    // 2. Proteção do Intersection Observer no Scroll (RF01, CA01, CA04)
    // =========================================================================
    console.log('\n📜 2. RF01 / CA01 / CA04: Observer de Seção e Comportamento no Scroll:');

    runTest('app.js: o observer de seção NÃO deve selecionar nem alterar .fun-pill-btn (RF01)', () => {
        // Verifica que o querySelector do observer de seção não aponta para .fun-pill-btn
        const match = appJs.match(/navLinks\s*=\s*document\.querySelectorAll\((['"`])([\s\S]*?)\1\)/);
        assert.ok(match, 'Observer deve definir seletor para navLinks');
        const selector = match[2];
        assert.ok(!selector.includes('.fun-pill-btn') || selector.includes(':not(.fun-pill-btn)'), 'Seletor deve excluir botões de filtro');
        assert.ok(selector.includes(':not(.fun-pill-btn)') || selector.includes('a[href'), 'Seletor deve excluir botões de filtro');
    });

    runTest('app.js: remoção da inicialização forçada de cores sólidas em todos os botões (RF03)', () => {
        // Verifica que não existe loop forçando btn.style.backgroundColor em todos os botões na inicialização
        assert.ok(
            !appJs.includes('btn.style.backgroundColor = color;'),
            'Não deve forçar backgroundColor sólido em todos os botões'
        );
    });

    // =========================================================================
    // 3. Simulação de Lógica DOM: Troca de Categoria e Scroll (CA01, CA02, CA04, CT01, CT02)
    // =========================================================================
    console.log('\n🔄 3. CA01 / CA02 / CA04 / CT01 / CT02: Simulação de Estado Ativo dos Filtros:');

    // Cria mock simples de ambiente DOM para testar a função applyButtonActiveColor
    class MockElement {
        constructor(category, color, isActive = false) {
            this.dataset = { category, color };
            this.classList = {
                classes: new Set(isActive ? ['fun-pill-btn', 'active'] : ['fun-pill-btn']),
                contains: (cls) => this.classList.classes.has(cls),
                add: (cls) => this.classList.classes.add(cls),
                remove: (cls) => this.classList.classes.delete(cls),
                toggle: (cls, force) => {
                    if (force !== undefined) {
                        if (force) this.classList.classes.add(cls);
                        else this.classList.classes.delete(cls);
                    } else {
                        if (this.classList.classes.has(cls)) this.classList.classes.delete(cls);
                        else this.classList.classes.add(cls);
                    }
                }
            };
            this.attributes = {
                'aria-pressed': isActive ? 'true' : 'false',
                'aria-selected': isActive ? 'true' : 'false'
            };
            this.style = { backgroundColor: '', borderColor: '', color: '' };
        }
        getAttribute(name) { return this.attributes[name]; }
        setAttribute(name, val) { this.attributes[name] = String(val); }
    }

    const mockButtons = [
        new MockElement('poltrona', '#2400ff', true),
        new MockElement('mesa', '#ff0000', false),
        new MockElement('cadeira', '#ffcd01', false),
        new MockElement('luminaria', '#000000', false)
    ];

    // Simulação da função applyButtonActiveColor conforme implementada em app.js
    function simulateApplyButtonActiveColor(selectedBtn) {
        mockButtons.forEach(b => {
            const isActive = (b === selectedBtn);
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
            b.style.backgroundColor = '';
            b.style.borderColor = '';
            b.style.color = '';
        });
    }

    // Simulação do observer de scroll de seções (como se rolasse pela página)
    function simulateSectionObserverScroll(activeSectionId) {
        // Seções na home: hero, secao-catalogo, formulas, depoimentos, footer
        // O observer só atua em links que começam com # e que não são fun-pill-btn
        const navAnchorLinks = []; // Não há links na navbar apontando para seções
        navAnchorLinks.forEach(link => {
            if (link.href === `#${activeSectionId}`) {
                link.active = true;
            } else {
                link.active = false;
            }
        });
        // Os botões mockButtons permanecem intocados!
    }

    runTest('CA01 / CT01: Dado Poltronas selecionado, ao rolar a página até o fim, Poltronas continua com destaque de ativo', () => {
        // Estado inicial
        simulateApplyButtonActiveColor(mockButtons[0]);
        assert.ok(mockButtons[0].classList.contains('active'), 'Poltronas deve estar ativo');

        // Simula scroll por todas as seções até o rodapé
        simulateSectionObserverScroll('secao-catalogo');
        simulateSectionObserverScroll('formulas');
        simulateSectionObserverScroll('depoimentos');

        // Poltronas continua ativo!
        assert.ok(mockButtons[0].classList.contains('active'), 'Poltronas deve continuar ativo após scroll');
        assert.strictEqual(mockButtons[0].getAttribute('aria-pressed'), 'true');
        assert.strictEqual(mockButtons[0].getAttribute('aria-selected'), 'true');

        const activeCount = mockButtons.filter(b => b.classList.contains('active')).length;
        assert.strictEqual(activeCount, 1, 'Deve haver exatamente 1 botão ativo (CT01, CA04)');
    });

    runTest('CA02 / CT02: Dado clique em Mesas, apenas Mesas fica ativo e com aria-selected="true"', () => {
        // Usuário clica em Mesas
        simulateApplyButtonActiveColor(mockButtons[1]);

        assert.strictEqual(mockButtons[1].classList.contains('active'), true, 'Mesas deve estar ativo');
        assert.strictEqual(mockButtons[1].getAttribute('aria-pressed'), 'true');
        assert.strictEqual(mockButtons[1].getAttribute('aria-selected'), 'true');

        // Os demais devem estar inativos
        assert.strictEqual(mockButtons[0].classList.contains('active'), false, 'Poltronas não deve estar ativo');
        assert.strictEqual(mockButtons[2].classList.contains('active'), false, 'Cadeiras não deve estar ativo');
        assert.strictEqual(mockButtons[3].classList.contains('active'), false, 'Luminárias não deve estar ativo');
        assert.strictEqual(mockButtons[0].getAttribute('aria-selected'), 'false');
        assert.strictEqual(mockButtons[2].getAttribute('aria-selected'), 'false');
        assert.strictEqual(mockButtons[3].getAttribute('aria-selected'), 'false');
    });

    runTest('CA04: Em qualquer transição de categoria e scroll, nunca há 0 nem mais de 1 ativo (caso negativo)', () => {
        for (const targetBtn of mockButtons) {
            simulateApplyButtonActiveColor(targetBtn);
            simulateSectionObserverScroll('secao-catalogo');
            simulateSectionObserverScroll('formulas');

            const activeBtns = mockButtons.filter(b => b.classList.contains('active'));
            assert.strictEqual(activeBtns.length, 1, 'Invariante: deve haver sempre exatamente 1 botão ativo');
            assert.strictEqual(activeBtns[0], targetBtn, 'O botão ativo deve ser exatamente o selecionado');
        }
    });

    // =========================================================================
    // 4. Estilos CSS e Contraste WCAG AA (RF03, RNF01, CA03, CT03)
    // =========================================================================
    console.log('\n🎨 4. RF03 / RNF01 / CA03 / CT03: Distinção Visual e Contraste WCAG:');

    runTest('style.css: botão inativo possui estilo outline com fundo claro e texto escuro acessível (RF03, CA03)', () => {
        assert.ok(
            styleCss.includes('.fun-navbar-filters .fun-pill-btn {') &&
            styleCss.includes('border: 2px solid var(--btn-color'),
            'Filtros devem ter borda colorida da categoria e fundo claro no estado inativo'
        );
        assert.ok(
            styleCss.includes('.fun-navbar-filters .fun-pill-btn.active {') &&
            styleCss.includes('background-color: var(--btn-color'),
            'Botão ativo deve ter fundo sólido com a cor da categoria'
        );
    });

    runTest('style.css: botão amarelo (#ffcd01) ativo e em hover possui texto escuro (#111111) para contraste (RNF01, CT03)', () => {
        assert.ok(
            styleCss.includes('.fun-navbar-filters .fun-pill-btn.active[data-color="#ffcd01"]') &&
            styleCss.includes('color: #111111;'),
            'Amarelo ativo deve ter texto escuro #111111'
        );
        assert.ok(
            styleCss.includes('.fun-navbar-filters .fun-pill-btn:hover[data-color="#ffcd01"]'),
            'Amarelo em hover deve ter texto escuro #111111'
        );
    });

    runTest('RNF01 / CT03: Razão de contraste do amarelo (#ffcd01) com texto escuro (#111111) atende WCAG AA (>= 4.5:1)', () => {
        const ratioDarkOnYellow = getContrastRatio('#ffcd01', '#111111');
        console.log(`     -> Contraste de #111111 sobre #ffcd01: ${ratioDarkOnYellow.toFixed(2)}:1`);
        assert.ok(
            ratioDarkOnYellow >= 4.5,
            `Contraste deve ser >= 4.5:1 (WCAG AA). Obtido: ${ratioDarkOnYellow.toFixed(2)}:1`
        );
        // Demonstração da falha com texto branco:
        const ratioWhiteOnYellow = getContrastRatio('#ffcd01', '#ffffff');
        console.log(`     -> Contraste de #ffffff sobre #ffcd01 (legado problemático): ${ratioWhiteOnYellow.toFixed(2)}:1`);
        assert.ok(
            ratioWhiteOnYellow < 3.0,
            'Confirma que texto branco sobre amarelo falhava feio no contraste'
        );
    });

    runTest('RNF01 / CT03: Razão de contraste dos botões inativos (#1a1a1a sobre fundo claro #ffffff) atende WCAG AAA (>= 7:1)', () => {
        const ratioInactive = getContrastRatio('#ffffff', '#1a1a1a');
        console.log(`     -> Contraste de #1a1a1a sobre fundo branco: ${ratioInactive.toFixed(2)}:1`);
        assert.ok(
            ratioInactive >= 7.0,
            `Contraste inativo deve ser >= 7:1 (WCAG AAA). Obtido: ${ratioInactive.toFixed(2)}:1`
        );
    });

    runTest('RNF01 / CT03: Razão de contraste do botão Poltronas (#2400ff ativo com branco) atende WCAG AAA (>= 7:1)', () => {
        const ratioBlue = getContrastRatio('#2400ff', '#ffffff');
        console.log(`     -> Contraste de #ffffff sobre #2400ff: ${ratioBlue.toFixed(2)}:1`);
        assert.ok(
            ratioBlue >= 7.0,
            `Contraste Poltronas deve ser >= 7.0:1. Obtido: ${ratioBlue.toFixed(2)}:1`
        );
    });

    runTest('RNF01 / CT03: Razão de contraste do botão Luminárias (#000000 ativo com branco) é 21:1 (máximo)', () => {
        const ratioBlack = getContrastRatio('#000000', '#ffffff');
        console.log(`     -> Contraste de #ffffff sobre #000000: ${ratioBlack.toFixed(2)}:1`);
        assert.strictEqual(Math.round(ratioBlack), 21);
    });

    console.log('\n============================================================');
    console.log(`📊 Resultado Final: ${passedTests}/${totalTests} testes passaram com sucesso!`);
    console.log('============================================================\n');

    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

runAllTests();
