/**
 * Suíte de Testes Automatizados para Fallback de Imagens na Página de Produto
 * Especificação: SDD/2026-09-24_fallback-de-imagem-na-pagina-de-produto.md
 * 
 * Cobre:
 * - CA01 / CT01: Fallback da foto principal para placeholder neutro (assets/imagem-indisponivel.svg)
 * - CA02 / CT02: Fallback em miniaturas da galeria (marcação de erro e placeholder)
 * - CA03 / CT03: Lightbox abre com placeholder ao invés de imagem quebrada
 * - CA04 / CT04: Prevenção de loop infinito quando o próprio placeholder falha (onerror = null antes de src)
 * - RF04: Dimensões (width/height) e aspect-ratio definidos para evitar layout shift
 * - RNF01: Ausência de loops em trocas de miniaturas e re-armação segura do onerror
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✔ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ✖ [FAIL] ${name}`);
        console.error(`     Erro: ${err.message}`);
        failedTests++;
    }
}

console.log('\n============================================================');
console.log('🧪 Iniciando Testes: Fallback de Imagens na Página de Produto');
console.log('============================================================\n');

// 1. Carregar arquivos do projeto
const produtoJsPath = path.resolve(__dirname, '../js/produto.js');
const styleCssPath = path.resolve(__dirname, '../css/style.css');
const placeholderPath = path.resolve(__dirname, '../assets/imagem-indisponivel.svg');

const produtoJsContent = fs.readFileSync(produtoJsPath, 'utf8');
const styleCssContent = fs.readFileSync(styleCssPath, 'utf8');

console.log('--- 1. Validação de Arquivo e Existência de Assets ---');

test('O asset oficial assets/imagem-indisponivel.svg deve existir e ter conteúdo válido', () => {
    assert.ok(fs.existsSync(placeholderPath), 'assets/imagem-indisponivel.svg não encontrado');
    const content = fs.readFileSync(placeholderPath, 'utf8');
    assert.ok(content.includes('<svg') && content.includes('Imagem Indisponível'), 'SVG deve conter texto legível de imagem indisponível');
});

console.log('\n--- 2. CA01 / CT01: Fallback na Foto Principal ---');

test('A imagem principal deve possuir fallback neutro para assets/imagem-indisponivel.svg', () => {
    assert.ok(produtoJsContent.includes('id="product-main-img"'), 'Elemento #product-main-img deve existir');
    assert.ok(produtoJsContent.includes('data-fallback="assets/imagem-indisponivel.svg"'), 'Deve possuir atributo data-fallback com placeholder neutro');
    assert.ok(produtoJsContent.includes("this.src='assets/imagem-indisponivel.svg'"), 'Handler de erro deve trocar src para o placeholder');
});

test('A imagem principal não deve conter fotos de outros produtos no onerror', () => {
    assert.ok(!produtoJsContent.includes("prod_poltrona.webp"), 'Não deve fazer fallback para prod_poltrona.webp');
    assert.ok(!produtoJsContent.includes("prod_mesa.webp"), 'Não deve fazer fallback para prod_mesa.webp');
    assert.ok(!produtoJsContent.includes("prod_cadeira.webp"), 'Não deve fazer fallback para prod_cadeira.webp');
});

console.log('\n--- 3. CA02 / CT02: Fallback nas Miniaturas da Galeria ---');

test('As miniaturas da galeria devem possuir fallback com marcação de falha', () => {
    assert.ok(produtoJsContent.includes('modal-thumb-btn'), 'Miniaturas devem existir');
    assert.ok(produtoJsContent.includes("this.dataset.failed='true'"), 'Miniatura com falha deve marcar data-failed para coordenar com imagem principal');
    assert.ok(produtoJsContent.includes("this.src='assets/imagem-indisponivel.svg'"), 'Miniatura com falha deve exibir placeholder neutro');
});

test('Ao clicar em miniatura, o handler onerror da imagem principal deve ser re-armado com segurança', () => {
    assert.ok(produtoJsContent.includes('mainImg.onerror = function()'), 'Ao trocar imagem da galeria, deve re-armar onerror');
    assert.ok(produtoJsContent.includes('this.onerror = null;'), 'Re-armação deve limpar onerror para evitar loops');
    assert.ok(produtoJsContent.includes("this.src = 'assets/imagem-indisponivel.svg';"), 'Re-armação deve direcionar para o placeholder');
});

console.log('\n--- 4. CA03 / CT03: Lightbox Seguro com Placeholder ---');

test('O lightbox deve possuir tratamento de erro e carregar placeholder quando a foto falhar', () => {
    assert.ok(produtoJsContent.includes('id="lightbox-image"'), 'Elemento #lightbox-image deve existir');
    assert.ok(produtoJsContent.includes('updateLightboxPhoto'), 'Função updateLightboxPhoto deve existir');
    assert.ok(produtoJsContent.includes("img.src = 'assets/imagem-indisponivel.svg'"), 'Lightbox deve direcionar para o placeholder se imagem falhou');
});

test('O lightbox deve verificar se a imagem ou miniatura já falhou para exibir o placeholder imediatamente', () => {
    assert.ok(produtoJsContent.includes("dataset.failed === 'true'"), 'Deve verificar dataset.failed da miniatura ou da foto principal');
});

console.log('\n--- 5. CA04 / CT04 / RNF01: Prevenção de Loops Infinitos de Requisição ---');

test('Todos os handlers onerror devem executar this.onerror = null estritamente ANTES de alterar this.src', () => {
    // Procura ocorrências de onerror inline e valida ordem dos comandos
    const regexInline = /onerror="([^"]+)"/g;
    let match;
    let inlineCount = 0;
    while ((match = regexInline.exec(produtoJsContent)) !== null) {
        inlineCount++;
        const handlerCode = match[1];
        const indexOfNull = handlerCode.indexOf('this.onerror=null');
        const indexOfSrc = handlerCode.indexOf('this.src=');
        assert.ok(indexOfNull !== -1, `Handler inline deve conter this.onerror=null: ${handlerCode}`);
        assert.ok(indexOfSrc !== -1, `Handler inline deve conter this.src=: ${handlerCode}`);
        assert.ok(indexOfNull < indexOfSrc, `this.onerror=null deve vir ANTES de this.src=: ${handlerCode}`);
    }
    assert.ok(inlineCount >= 3, `Deve haver pelo menos 3 handlers inline (principal, miniaturas, compre junto), encontrados: ${inlineCount}`);
});

test('Handlers em funções JS (updateLightboxPhoto e click da galeria) devem anular onerror antes de mudar src', () => {
    const fnRegex = /onerror\s*=\s*function\(\)\s*\{([^}]+)\}/g;
    let match;
    let fnCount = 0;
    while ((match = fnRegex.exec(produtoJsContent)) !== null) {
        fnCount++;
        const body = match[1];
        const indexOfNull = body.indexOf('this.onerror = null');
        const indexOfSrc = body.indexOf('this.src =');
        assert.ok(indexOfNull !== -1, `Função onerror deve anular handler: ${body}`);
        assert.ok(indexOfSrc !== -1, `Função onerror deve alterar src: ${body}`);
        assert.ok(indexOfNull < indexOfSrc, `Anulação deve ocorrer antes de definir src: ${body}`);
    }
    assert.ok(fnCount >= 2, `Deve haver pelo menos 2 funções onerror dinâmicas, encontradas: ${fnCount}`);
});

console.log('\n--- 6. RF04: Prevenção de Layout Shift (CLS) ---');

test('Elementos <img> da página de produto devem possuir atributos explícitos width e height', () => {
    assert.ok(/<img[^>]+id="product-main-img"[^>]+width="700"[^>]+height="700"/.test(produtoJsContent), 'Imagem principal deve possuir width="700" e height="700"');
    assert.ok(/<img[^>]+width="68"[^>]+height="68"[^>]+loading="lazy"/.test(produtoJsContent), 'Miniaturas devem possuir width="68" e height="68"');
    assert.ok(/<img[^>]+width="180"[^>]+height="180"[^>]+loading="lazy"/.test(produtoJsContent), 'Cards de venda casada devem possuir width="180" e height="180"');
    assert.ok(/<img[^>]+id="lightbox-image"[^>]+width="800"[^>]+height="800"/.test(produtoJsContent), 'Imagem do lightbox deve possuir width="800" e height="800"');
});

test('Regras CSS devem conter aspect-ratio nas classes da galeria e cards', () => {
    assert.ok(styleCssContent.includes('.modal-main-image') && styleCssContent.includes('aspect-ratio: 1 / 1;'), '.modal-main-image deve possuir aspect-ratio: 1 / 1');
    assert.ok(styleCssContent.includes('.modal-thumb-btn img') && styleCssContent.includes('aspect-ratio: 1 / 1;'), '.modal-thumb-btn img deve possuir aspect-ratio: 1 / 1');
    assert.ok(styleCssContent.includes('.modal-bundle-card img') && styleCssContent.includes('aspect-ratio: 1;'), '.modal-bundle-card img deve possuir aspect-ratio');
});

console.log('\n--- 7. Imagens da Seção Compre Junto (Venda Casada) ---');

test('Imagens de Compre Junto devem conter fallback seguro e normalização de URLs', () => {
    assert.ok(produtoJsContent.includes('modal-bundle-card'), 'Cards de Compre Junto devem ser renderizados');
    assert.ok(produtoJsContent.includes('relNormalized = typeof normalizarUrlImagem === \'function\''), 'Compre Junto deve normalizar URL');
    assert.ok(produtoJsContent.includes('modal-bundle-card" href="produto.html?id='), 'Cards devem usar links sem onclick perigoso');
});

console.log('\n============================================================');
console.log(`📊 Resultado dos Testes: ${passedTests} passaram, ${failedTests} falharam`);
console.log('============================================================\n');

if (failedTests > 0) {
    process.exit(1);
}
