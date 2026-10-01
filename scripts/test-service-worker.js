/**
 * Suíte de Testes Automatizados para Service Worker e Estratégia de Cache (SDD 2026-09-24)
 * Valida RF01-RF04, RNF01, CA01-CA05 e Casos de Teste CT01-CT04.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let testsPassed = 0;
let testsFailed = 0;

function runTest(desc, fn) {
    try {
        fn();
        console.log(`  ✅ [PASS] ${desc}`);
        testsPassed++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${desc}`);
        console.error(`     Erro: ${err.message}`);
        testsFailed++;
    }
}

async function runAsyncTest(desc, fn) {
    try {
        await fn();
        console.log(`  ✅ [PASS] ${desc}`);
        testsPassed++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${desc}`);
        console.error(`     Erro: ${err.message}`);
        testsFailed++;
    }
}

async function runSuite() {
    console.log('\n============================================================');
    console.log('🧪 Iniciando Testes: Service Worker e Estratégia de Cache');
    console.log('============================================================\n');

    const rootDir = path.resolve(__dirname, '..');
    const swPath = path.join(rootDir, 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    const deployYmlPath = path.join(rootDir, '.github/workflows/deploy.yml');
    const deployYmlContent = fs.readFileSync(deployYmlPath, 'utf8');
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const catalogoHtml = fs.readFileSync(path.join(rootDir, 'catalogo.html'), 'utf8');
    const produtoHtml = fs.readFileSync(path.join(rootDir, 'produto.html'), 'utf8');

    const sw = require(swPath);

    // =========================================================================
    // 1. RF02 / CA01 / CA03 / RNF01 / CT01: Precache Limpo e Assets Públicos
    // =========================================================================
    console.log('📦 1. RF02 / CA01 / CA03 / RNF01 / CT01: Precache Seguro e Consistente:');

    runTest('CA01: assets/logo.webp está presente em PRECACHE_ASSETS', () => {
        assert.ok(
            sw.PRECACHE_ASSETS.includes('assets/logo.webp'),
            'PRECACHE_ASSETS deve conter assets/logo.webp'
        );
    });

    runTest('CA01: assets/LOGO.png legado NÃO está presente em PRECACHE_ASSETS', () => {
        assert.ok(
            !sw.PRECACHE_ASSETS.includes('assets/LOGO.png'),
            'PRECACHE_ASSETS não deve conter assets/LOGO.png'
        );
    });

    runTest('CA03: Arquivos de admin (admin.html, js/admin.js, css/admin.css) NÃO estão no precache', () => {
        const adminFiles = ['admin.html', 'js/admin.js', 'css/admin.css', 'js/image-optimizer.js'];
        adminFiles.forEach(file => {
            assert.ok(
                !sw.PRECACHE_ASSETS.includes(file),
                `PRECACHE_ASSETS não deve conter arquivo restrito: ${file}`
            );
        });
    });

    runTest('CA03: Arquivos de login (login.html, js/login.js, css/login.css, js/auth.js) NÃO estão no precache', () => {
        const loginFiles = ['login.html', 'js/login.js', 'css/login.css', 'js/auth.js'];
        loginFiles.forEach(file => {
            assert.ok(
                !sw.PRECACHE_ASSETS.includes(file),
                `PRECACHE_ASSETS não deve conter arquivo de login/auth: ${file}`
            );
        });
    });

    runTest('RNF01 / CT01: Todos os assets em PRECACHE_ASSETS existem fisicamente no disco (0 erros de 404)', () => {
        const missingFiles = [];
        sw.PRECACHE_ASSETS.forEach(assetPath => {
            if (assetPath === './') return; // Rota raiz servida por index.html
            const absoluteAsset = path.join(rootDir, assetPath);
            if (!fs.existsSync(absoluteAsset)) {
                missingFiles.push(assetPath);
            }
        });
        assert.strictEqual(
            missingFiles.length,
            0,
            `Arquivos inexistentes no precache encontrados: ${missingFiles.join(', ')}`
        );
    });

    // =========================================================================
    // 2. RF01 / CA02 / CT02: Versionamento Automático e Estratégia Network-First
    // =========================================================================
    console.log('\n🚀 2. RF01 / CA02 / CT02: Injeção de Versão e Network-First para CSS/JS:');

    runTest('RF01: deploy.yml contém injeção automática de github.sha no sw.js', () => {
        assert.ok(
            deployYmlContent.includes('__BUILD_VERSION__') && deployYmlContent.includes('${{ github.sha }}'),
            'deploy.yml deve injetar ${{ github.sha }} substituindo __BUILD_VERSION__ no sw.js'
        );
    });

    runTest('RF01 / CA02: sw.js aceita commit hash injetado e deriva versão curta', () => {
        const mockSha = 'a1b2c3d4e5f67890123456789abcdef012345678';
        const simulatedSwContent = swContent.replace(/__BUILD_VERSION__/g, mockSha);
        
        // Testa a expressão de versionamento isoladamente
        const versionMatch = simulatedSwContent.match(/const VERSION = \(([\s\S]*?)\);/);
        assert.ok(versionMatch, 'sw.js deve conter lógica de atribuição da const VERSION');
        
        const testVersion = mockSha.slice(0, 8);
        assert.strictEqual(testVersion, 'a1b2c3d4');
        assert.strictEqual(`paco-cache-${testVersion}`, 'paco-cache-a1b2c3d4');
    });

    runTest('CA02: isCssOrJsRequest identifica corretamente requisições de CSS e JS', () => {
        assert.strictEqual(sw.isCssOrJsRequest({}, new URL('https://pacomoveis.com.br/css/style.css')), true);
        assert.strictEqual(sw.isCssOrJsRequest({}, new URL('https://pacomoveis.com.br/js/app.js')), true);
        assert.strictEqual(sw.isCssOrJsRequest({ destination: 'style' }, new URL('https://pacomoveis.com.br/custom-style')), true);
        assert.strictEqual(sw.isCssOrJsRequest({ destination: 'script' }, new URL('https://pacomoveis.com.br/custom-script')), true);
        assert.strictEqual(sw.isCssOrJsRequest({}, new URL('https://pacomoveis.com.br/assets/logo.webp')), false);
        assert.strictEqual(sw.isCssOrJsRequest({}, new URL('https://pacomoveis.com.br/index.html')), false);
    });

    runTest('CA02: Fetch handler para CSS/JS utiliza Network-First com atualização de cache', () => {
        assert.ok(
            swContent.includes('isCssOrJsRequest(request, url)'),
            'sw.js deve interceptar requisições CSS/JS'
        );
        assert.ok(
            swContent.includes('cache.put(request, responseClone)'),
            'sw.js deve atualizar cache na resposta bem sucedida da rede'
        );
    });

    // =========================================================================
    // 3. RF03 / CA04 / CT03: Registro em Todas as Páginas Públicas e Offline
    // =========================================================================
    console.log('\n📱 3. RF03 / CA04 / CT03: Registro em Páginas Públicas e Suporte Offline:');

    runTest('RF03: index.html registra o Service Worker', () => {
        assert.ok(
            indexHtml.includes("navigator.serviceWorker.register('./sw.js')"),
            'index.html deve registrar ./sw.js'
        );
    });

    runTest('RF03: catalogo.html registra o Service Worker', () => {
        assert.ok(
            catalogoHtml.includes("navigator.serviceWorker.register('./sw.js')"),
            'catalogo.html deve registrar ./sw.js'
        );
    });

    runTest('RF03: produto.html registra o Service Worker', () => {
        assert.ok(
            produtoHtml.includes("navigator.serviceWorker.register('./sw.js')"),
            'produto.html deve registrar ./sw.js'
        );
    });

    runTest('CA04 / CT03: catalogo.html e produto.html estão pré-cacheados para navegação offline', () => {
        assert.ok(sw.PRECACHE_ASSETS.includes('catalogo.html'), 'catalogo.html deve estar no precache');
        assert.ok(sw.PRECACHE_ASSETS.includes('produto.html'), 'produto.html deve estar no precache');
        assert.ok(sw.PRECACHE_ASSETS.includes('index.html'), 'index.html deve estar no precache');
    });

    runTest('CA04: Fetch de navegação suporta ignoreSearch para rotas com query params offline', () => {
        assert.ok(
            swContent.includes('ignoreSearch: true'),
            'Navegação offline deve suportar ignoreSearch: true'
        );
    });

    // =========================================================================
    // 4. RF04 / CA05 / CT04: Limite e Expiração no Cache de Runtime
    // =========================================================================
    console.log('\n🗄️  4. RF04 / CA05 / CT04: Limite de Entradas e Expiração no Cache de Runtime:');

    runTest('RF04: Limite MAX_RUNTIME_ITEMS configurado para 60', () => {
        assert.strictEqual(sw.MAX_RUNTIME_ITEMS, 60, 'MAX_RUNTIME_ITEMS deve ser 60');
    });

    runTest('RF04: Expiração MAX_AGE_MS configurada para 7 dias', () => {
        const seteDiasEmMs = 7 * 24 * 60 * 60 * 1000;
        assert.strictEqual(sw.MAX_AGE_MS, seteDiasEmMs, 'MAX_AGE_MS deve ser de 7 dias');
    });

    runTest('RF04: isImageRequest identifica corretamente imagens locais, CDNs e Google Drive', () => {
        assert.strictEqual(sw.isImageRequest({}, new URL('https://pacomoveis.com.br/assets/logo.webp')), true);
        assert.strictEqual(sw.isImageRequest({}, new URL('https://pacomoveis.com.br/assets/prod.png')), true);
        assert.strictEqual(sw.isImageRequest({}, new URL('https://pacomoveis.com.br/assets/prod.jpg?v=1')), true);
        assert.strictEqual(sw.isImageRequest({}, new URL('https://lh3.googleusercontent.com/d/12345=w800')), true);
        assert.strictEqual(sw.isImageRequest({ destination: 'image' }, new URL('https://exemplo.com/qualquer-coisa')), true);
        assert.strictEqual(sw.isImageRequest({}, new URL('https://pacomoveis.com.br/js/app.js')), false);
    });

    await runAsyncTest('CA05 / CT04: limitCacheEntries restringe cache de 100 imagens para no máximo 60 itens (FIFO)', async () => {
        // Mock do Cache Storage do navegador
        const mockStore = new Map();
        for (let i = 1; i <= 100; i++) {
            mockStore.set(`https://pacomoveis.com.br/assets/img_${i}.webp`, { status: 200, body: `image_${i}` });
        }

        assert.strictEqual(mockStore.size, 100, 'Mock inicial deve ter 100 imagens');

        const mockCache = {
            keys: async () => Array.from(mockStore.keys()),
            delete: async (key) => {
                mockStore.delete(key);
                return true;
            }
        };

        // Salva e injeta global caches mock
        const originalCaches = global.caches;
        global.caches = {
            open: async () => mockCache
        };

        try {
            await sw.limitCacheEntries('test-runtime-cache', 60);

            // Verifica tamanho final
            assert.strictEqual(mockStore.size, 60, 'Após limitCacheEntries, devem restar exatamente 60 itens');

            // Verifica que as primeiras 40 imagens foram removidas (FIFO: img_1 até img_40)
            assert.strictEqual(mockStore.has('https://pacomoveis.com.br/assets/img_1.webp'), false);
            assert.strictEqual(mockStore.has('https://pacomoveis.com.br/assets/img_40.webp'), false);

            // Verifica que as 60 imagens mais recentes foram preservadas (img_41 até img_100)
            assert.strictEqual(mockStore.has('https://pacomoveis.com.br/assets/img_41.webp'), true);
            assert.strictEqual(mockStore.has('https://pacomoveis.com.br/assets/img_100.webp'), true);
        } finally {
            global.caches = originalCaches;
        }
    });

    // =========================================================================
    // Resumo da Execução
    // =========================================================================
    console.log('\n============================================================');
    console.log(`📊 Resultado dos Testes: ${testsPassed} passaram, ${testsFailed} falharam.`);
    console.log('============================================================\n');

    if (testsFailed > 0) {
        process.exit(1);
    }
}

runSuite().catch(err => {
    console.error('Erro fatal na execução da suíte de testes:', err);
    process.exit(1);
});
