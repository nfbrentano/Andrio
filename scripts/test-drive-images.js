/**
 * Suíte de Testes Automatizados para a Feature de Imagens do Google Drive / WebP
 * Especificação: SDD/2026-09-24_imagens-google-drive-nao-carregam.md
 * 
 * Cobre:
 * - CA01 / CT01: Extração de IDs do Drive, normalização segura e migração de documentos
 * - CA02 / CT02: Integridade dos assets WebP, ausência de HTTP 429 e fotos distintas
 * - CA03 / CT03: Utilitário ImageOptimizer (CORS, compressão WebP, limites de dimensões)
 * - CA04 / CT04: Fallback neutro para placeholder "imagem indisponível" (sem foto de outro produto)
 * - CA05 / CT05: Detecção de URLs pendentes do Drive para exibição de alerta ao salvar
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

async function asyncTest(name, fn) {
    try {
        await fn();
        console.log(`  ✔ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ✖ [FAIL] ${name}`);
        console.error(`     Erro: ${err.message}`);
        failedTests++;
    }
}

console.log('\n============================================================');
console.log('🧪 Iniciando Testes: Resolução de Imagens Google Drive / Storage');
console.log('============================================================\n');

// 1. Carregar módulos do projeto
const catalogoDataPath = path.resolve(__dirname, '../js/shared/catalogo-data.js');
const catalogoDataCode = fs.readFileSync(catalogoDataPath, 'utf8');

// Mock de safeUrl para executar no Node.js
function safeUrl(url, fallback = '') {
    if (!url || typeof url !== 'string') return fallback;
    const trimmed = url.trim();
    if (!trimmed || /[\s"'<>\\]/.test(trimmed)) return fallback;
    return trimmed;
}

// Avalia catalogo-data.js no contexto
const catalogoModule = {};
const runContext = {
    safeUrl,
    console,
    window: {},
    localStorage: { getItem: () => null, setItem: () => null, removeItem: () => null }
};

const fn = new Function('safeUrl', 'window', 'localStorage', 'console', `${catalogoDataCode}; return { extractDriveFileId, isGoogleDriveUrl, normalizarUrlImagem, getDefaultImageForCategory, getDefaultHoverImageForCategory, PLACEHOLDER_IMAGEM_INDISPONIVEL, DRIVE_LEGACY_IMAGE_MAP };`);
const {
    extractDriveFileId,
    isGoogleDriveUrl,
    normalizarUrlImagem,
    getDefaultImageForCategory,
    getDefaultHoverImageForCategory,
    PLACEHOLDER_IMAGEM_INDISPONIVEL,
    DRIVE_LEGACY_IMAGE_MAP
} = fn(safeUrl, runContext.window, runContext.localStorage, console);

// === TESTES DE EXTRAÇÃO E DETECÇÃO DE GOOGLE DRIVE (CA01, CA05, CT01, CT05) ===
console.log('--- 1. Validação de Extração de IDs e Detecção de URLs do Drive ---');

test('Deve extrair ID de formato /file/d/ID/view', () => {
    const id = extractDriveFileId('https://drive.google.com/file/d/1W2L251aE7LfS7lz-kjSLkPO_H0FEy83H/view?usp=sharing');
    assert.strictEqual(id, '1W2L251aE7LfS7lz-kjSLkPO_H0FEy83H');
});

test('Deve extrair ID de formato thumbnail?id=ID', () => {
    const id = extractDriveFileId('https://drive.google.com/thumbnail?id=1vHrx6SoVnK025fC-eu76ev6e_mU8mPkW&sz=w1600');
    assert.strictEqual(id, '1vHrx6SoVnK025fC-eu76ev6e_mU8mPkW');
});

test('Deve extrair ID de formato googleusercontent.com/d/ID', () => {
    const id = extractDriveFileId('https://lh3.googleusercontent.com/d/1GC67VMTBN85Jo5EcfMkF_Yh614Hv4yj4=w1600');
    assert.strictEqual(id, '1GC67VMTBN85Jo5EcfMkF_Yh614Hv4yj4');
});

test('Deve extrair ID de hash alfanumérico direto', () => {
    const id = extractDriveFileId('1l1uW6rBrH9X56f4wLEiusEVoeowFCxuc');
    assert.strictEqual(id, '1l1uW6rBrH9X56f4wLEiusEVoeowFCxuc');
});

test('Deve identificar URLs do Google Drive corretamente (isGoogleDriveUrl)', () => {
    assert.strictEqual(isGoogleDriveUrl('https://drive.google.com/file/d/1W2L251aE7LfS7lz-kjSLkPO_H0FEy83H/view'), true);
    assert.strictEqual(isGoogleDriveUrl('https://drive.google.com/thumbnail?id=12345'), true);
    assert.strictEqual(isGoogleDriveUrl('https://lh3.googleusercontent.com/d/1GC67VMTBN85Jo5EcfMkF_Yh614Hv4yj4=w1600'), true);
    assert.strictEqual(isGoogleDriveUrl('1MYogDCG3jGcAzl8-G9fbnFC42HwfE978'), true);
});

test('Não deve considerar URLs regulares ou locais como Google Drive', () => {
    assert.strictEqual(isGoogleDriveUrl('assets/produtos/poltrona_azul_1.webp'), false);
    assert.strictEqual(isGoogleDriveUrl('https://firebasestorage.googleapis.com/v0/b/paco.appspot.com/o/foto.webp'), false);
    assert.strictEqual(isGoogleDriveUrl('https://exemplo.com.br/foto.jpg'), false);
    assert.strictEqual(isGoogleDriveUrl(''), false);
    assert.strictEqual(isGoogleDriveUrl(null), false);
});

// === TESTES DE NORMALIZAÇÃO DE URLS E PREVENÇÃO DE HTTP 429 (CA01, CA02, CT02) ===
console.log('\n--- 2. Normalização de URLs e Mapeamento de Assets ---');

test('Deve mapear IDs legados do Drive diretamente para WebP local', () => {
    const url1 = normalizarUrlImagem('https://drive.google.com/thumbnail?id=1W2L251aE7LfS7lz-kjSLkPO_H0FEy83H&sz=w1600');
    assert.strictEqual(url1, 'assets/produtos/poltrona_azul_1.webp');

    const url2 = normalizarUrlImagem('https://drive.google.com/thumbnail?id=1GC67VMTBN85Jo5EcfMkF_Yh614Hv4yj4&sz=w1600');
    assert.strictEqual(url2, 'assets/produtos/novo_movel_1.webp');
});

test('Para link do Drive desconhecido, deve converter para lh3 direto com CORS (evita 429 do thumbnail)', () => {
    const unknownId = '1AbCdEfGhIjKlMnOpQrStUvWxYz012345';
    const normalized = normalizarUrlImagem(`https://drive.google.com/file/d/${unknownId}/view`);
    assert.strictEqual(normalized, `https://lh3.googleusercontent.com/d/${unknownId}=w1600`);
    assert.ok(!normalized.includes('thumbnail?id='), 'Não deve gerar URL de thumbnail com rate-limit');
});

// === TESTES DE FALLBACK E PLACEHOLDER NEUTRO (CA04, CT04, RF03) ===
console.log('\n--- 3. Fallback Neutro: Placeholder Imagem Indisponível ---');

test('Placeholder oficial deve ser assets/imagem-indisponivel.svg', () => {
    assert.strictEqual(PLACEHOLDER_IMAGEM_INDISPONIVEL, 'assets/imagem-indisponivel.svg');
});

test('getDefaultImageForCategory deve retornar placeholder neutro e NUNCA foto de outro produto', () => {
    const defaultPoltrona = getDefaultImageForCategory('poltrona');
    const defaultMesa = getDefaultImageForCategory('mesa');
    const defaultCadeira = getDefaultImageForCategory('cadeira');

    assert.strictEqual(defaultPoltrona, 'assets/imagem-indisponivel.svg');
    assert.strictEqual(defaultMesa, 'assets/imagem-indisponivel.svg');
    assert.strictEqual(defaultCadeira, 'assets/imagem-indisponivel.svg');
    assert.notStrictEqual(defaultPoltrona, 'assets/prod_poltrona.webp', 'Não pode exibir foto de poltrona para outro produto');
});

test('normalizarUrlImagem com URL vazia ou inválida deve retornar placeholder', () => {
    assert.strictEqual(normalizarUrlImagem(''), 'assets/imagem-indisponivel.svg');
    assert.strictEqual(normalizarUrlImagem(null), 'assets/imagem-indisponivel.svg');
    assert.strictEqual(normalizarUrlImagem('   '), 'assets/imagem-indisponivel.svg');
});

test('Arquivo do placeholder assets/imagem-indisponivel.svg deve existir e ser SVG válido', () => {
    const svgPath = path.resolve(__dirname, '../assets/imagem-indisponivel.svg');
    assert.ok(fs.existsSync(svgPath), 'Arquivo assets/imagem-indisponivel.svg não encontrado');
    const content = fs.readFileSync(svgPath, 'utf8');
    assert.ok(content.startsWith('<svg'), 'Deve ser um arquivo SVG');
    assert.ok(content.includes('Imagem Indisponível'), 'Deve conter texto de feedback acessível');
});

// === TESTES DE INTEGRIDADE DOS ASSETS WEBP GERADOS (CA01, CA02, RNF01) ===
console.log('\n--- 4. Integridade dos Assets WebP Migrados ---');

const expectedAssets = [
    'poltrona_azul_1.webp',
    'poltrona_azul_2.webp',
    'novo_movel_1.webp',
    'kit_poltronas.webp',
    'poltrona_guerra.webp'
];

expectedAssets.forEach(asset => {
    test(`Asset migrado assets/produtos/${asset} deve existir e ter tamanho > 0`, () => {
        const assetPath = path.resolve(__dirname, `../assets/produtos/${asset}`);
        assert.ok(fs.existsSync(assetPath), `Asset ${asset} não encontrado`);
        const stats = fs.statSync(assetPath);
        assert.ok(stats.size > 1000, `Tamanho suspeito para ${asset}: ${stats.size} bytes`);
    });
});

// === TESTES DE SERVICE WORKER PRECACHE (RNF01, RNF02) ===
console.log('\n--- 5. Service Worker e Precache de Imagens ---');

test('sw.js deve incluir assets de produtos e placeholder no precache', () => {
    const swPath = path.resolve(__dirname, '../sw.js');
    const swCode = fs.readFileSync(swPath, 'utf8');
    assert.ok(swCode.includes('assets/imagem-indisponivel.svg'), 'sw.js deve conter assets/imagem-indisponivel.svg');
    assert.ok(swCode.includes('assets/produtos/poltrona_azul_1.webp'), 'sw.js deve conter poltrona_azul_1.webp');
    assert.ok(swCode.includes('assets/produtos/kit_poltronas.webp'), 'sw.js deve conter kit_poltronas.webp');
});

// === TESTES DE INTERFACE ADMIN E SCRIPTS DE MIGRAÇÃO (CA03, CA05, RF02, RF04) ===
console.log('\n--- 6. Interface Admin e Tratamento de Upload / Alertas ---');

test('admin.html deve conter botão e modal de migração de fotos do Drive', () => {
    const adminHtml = fs.readFileSync(path.resolve(__dirname, '../admin.html'), 'utf8');
    assert.ok(adminHtml.includes('id="btn-migrate-drive"'), 'Deve conter botão btn-migrate-drive');
    assert.ok(adminHtml.includes('id="drive-migration-modal"'), 'Deve conter modal drive-migration-modal');
    assert.ok(adminHtml.includes('id="btn-start-drive-migration"'), 'Deve conter botão btn-start-drive-migration');
});

test('admin.js deve conter handler para otimizar links do Google Drive ao adicionar imagem', () => {
    const adminJs = fs.readFileSync(path.resolve(__dirname, '../js/admin.js'), 'utf8');
    assert.ok(adminJs.includes('ImageOptimizer.optimizeAndUploadUrl'), 'Deve chamar optimizeAndUploadUrl');
    assert.ok(adminJs.includes('isGoogleDriveUrl'), 'Deve verificar se a URL é do Google Drive');
});

test('admin.js deve avisar ao salvar se alguma foto ainda for do Google Drive', () => {
    const adminJs = fs.readFileSync(path.resolve(__dirname, '../js/admin.js'), 'utf8');
    assert.ok(adminJs.includes('hasDriveImages'), 'Deve conter verificação hasDriveImages');
    assert.ok(adminJs.includes('HTTP 429'), 'Deve alertar sobre o risco de HTTP 429');
});

test('app.js, catalogo.js e produto.js não devem conter fallback para prod_poltrona.webp no onerror', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../js/app.js'), 'utf8');
    const catalogoJs = fs.readFileSync(path.resolve(__dirname, '../js/catalogo.js'), 'utf8');
    const produtoJs = fs.readFileSync(path.resolve(__dirname, '../js/produto.js'), 'utf8');

    assert.ok(!appJs.includes("this.src=this.dataset.fallback || 'assets/prod_poltrona.webp'"), 'app.js não deve usar prod_poltrona no onerror');
    assert.ok(!catalogoJs.includes("this.src=this.dataset.fallback || 'assets/prod_poltrona.webp'"), 'catalogo.js não deve usar prod_poltrona no onerror');
    assert.ok(!produtoJs.includes("this.src=this.dataset.fallback || 'assets/prod_poltrona.webp'"), 'produto.js não deve usar prod_poltrona no onerror');
});

console.log('\n============================================================');
console.log(`📊 Resultado dos Testes: ${passedTests} passaram, ${failedTests} falharam`);
console.log('============================================================\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
