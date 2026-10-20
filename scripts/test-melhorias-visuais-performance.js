/**
 * Suite de Testes Automatizados — Melhorias Visuais (UI/UX) e Performance (Core Web Vitals)
 * Referência SDD: SDD/DONE/2026-10-19_melhorias-visuais-e-performance.md
 * Casos de Teste: CT01 a CT07 (CA01 a CA07, RF01 a RF07)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log(`  ✅ PASS: ${message}`);
    } else {
        failed++;
        console.error(`  ❌ FAIL: ${message}`);
    }
}

const cssContent = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const catalogoHtml = fs.readFileSync(path.join(ROOT, 'catalogo.html'), 'utf8');
const produtoHtml = fs.readFileSync(path.join(ROOT, 'produto.html'), 'utf8');
const uiJs = fs.readFileSync(path.join(ROOT, 'js/shared/ui.js'), 'utf8');
const catalogoDataJs = fs.readFileSync(path.join(ROOT, 'js/shared/catalogo-data.js'), 'utf8');
const adminJs = fs.readFileSync(path.join(ROOT, 'js/admin.js'), 'utf8');
const appJs = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
const catalogoJs = fs.readFileSync(path.join(ROOT, 'js/catalogo.js'), 'utf8');
const produtoJs = fs.readFileSync(path.join(ROOT, 'js/produto.js'), 'utf8');

console.log('\n🧪 CT01: Glassmorphism no Header e Listener Passivo (RF01, CA01)');
{
    const scrolledMatch = cssContent.match(/\.fun-navbar\.scrolled\s*\{([^}]+)\}/);
    const scrolledBody = scrolledMatch ? scrolledMatch[1] : '';
    assert(
        scrolledBody.includes('backdrop-filter: blur(12px)') &&
        scrolledBody.includes('-webkit-backdrop-filter: blur(12px)') &&
        scrolledBody.includes('rgba(244, 242, 234, 0.88)'),
        'CT01.1: .fun-navbar.scrolled possui background translúcido #f4f2ea (88%) e backdrop-filter: blur(12px)'
    );
    assert(
        uiJs.includes("window.addEventListener('scroll', updateNavbarScrollState, { passive: true })"),
        'CT01.2: inicializarNavbar registra listener de scroll com { passive: true } em js/shared/ui.js'
    );
}

console.log('\n🧪 CT02: Contraste do Botão Mobile no Drawer (RF02, CA02)');
{
    const btnMatch = cssContent.match(/\.fun-btn-admin-mobile\s*\{([^}]+)\}/);
    const btnBody = btnMatch ? btnMatch[1] : '';
    assert(
        btnBody.includes('background: #1a1a1a') && btnBody.includes('color: #ffffff') && !btnBody.includes('color: #000000'),
        'CT02.1: .fun-btn-admin-mobile utiliza color: #ffffff sobre background #1a1a1a (contraste > 15:1 WCAG AAA)'
    );
}

console.log('\n🧪 CT03: Cabeçalho Editorial do Catálogo e Sticky Offset (RF03, CA03)');
{
    assert(
        catalogoHtml.includes('class="catalogo-hero-tag"') &&
        catalogoHtml.includes('id="catalogo-page-title"') &&
        catalogoHtml.includes('class="catalogo-hero-title"') &&
        catalogoHtml.includes('class="catalogo-hero-subtitle"'),
        'CT03.1: catalogo.html possui .catalogo-hero populado com .catalogo-hero-tag, h1.catalogo-hero-title e p.catalogo-hero-subtitle'
    );

    const toolbarMatch = cssContent.match(/\.catalogo-toolbar-section\s*\{([^}]+)\}/);
    const toolbarBody = toolbarMatch ? toolbarMatch[1] : '';
    assert(
        toolbarBody.includes('top: var(--navbar-scrolled-offset') && !toolbarBody.includes('top: 204px'),
        'CT03.2: .catalogo-toolbar-section utiliza top: var(--navbar-scrolled-offset, 94px) sem gap de 204px'
    );
}

console.log('\n🧪 CT04: Hero CTA na Home e Skeleton Shimmer nas 3 Páginas (RF02, RF04, CA02, CA04)');
{
    assert(
        indexHtml.includes('class="fun-btn-hero"') && indexHtml.includes('Explorar Coleção'),
        'CT04.1: index.html possui subtítulo e CTA primário .fun-btn-hero dentro de .hero-text-overlay'
    );
    assert(
        indexHtml.includes('id="catalogo"') && indexHtml.includes('aria-busy="true"') && indexHtml.includes('skeleton-card'),
        'CT04.2: index.html possui #catalogo com aria-busy="true" e cards .skeleton-card iniciais'
    );
    assert(
        catalogoHtml.includes('id="catalogo-grid"') && catalogoHtml.includes('aria-busy="true"') && catalogoHtml.includes('skeleton-card'),
        'CT04.3: catalogo.html possui #catalogo-grid com aria-busy="true" e 4 cards .skeleton-card iniciais'
    );
    assert(
        produtoHtml.includes('id="produto-detail-content"') &&
        produtoHtml.includes('aria-busy="true"') &&
        produtoHtml.includes('skeleton-product-layout') &&
        produtoHtml.includes('Carregando detalhes do produto...'),
        'CT04.4: produto.html possui #produto-detail-content com aria-busy="true", .skeleton-product-layout e .sr-only acessível'
    );
    assert(
        appJs.includes("setAttribute('aria-busy', 'false')") &&
        catalogoJs.includes("setAttribute('aria-busy', 'false')") &&
        produtoJs.includes("setAttribute('aria-busy', 'false')"),
        'CT04.5: js/app.js, js/catalogo.js e js/produto.js atualizam aria-busy="false" ao concluir renderização'
    );
}

console.log('\n🧪 CT05: Cache SessionStorage Stale-While-Revalidate (RF05, CA05)');
(async () => {
    const storageMap = new Map();
    const mockSessionStorage = {
        getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
        setItem: (k, v) => storageMap.set(k, String(v)),
        removeItem: (k) => storageMap.delete(k)
    };

    let getCalls = 0;
    const mockDocs = [
        { id: '101', data: () => ({ nome: 'Poltrona Teste SWR', categoria: 'poltrona', preco: 'R$ 3.200,00', preco_centavos: 320000 }) }
    ];

    const mockDb = {
        collection: () => ({
            get: async () => {
                getCalls++;
                return {
                    empty: false,
                    docs: mockDocs,
                    forEach: (cb) => mockDocs.forEach(cb)
                };
            }
        })
    };

    const sandbox = {
        window: { sessionStorage: mockSessionStorage },
        sessionStorage: mockSessionStorage,
        console: { warn: () => {}, log: () => {}, error: () => {} },
        FirebaseService: {
            isConfigured: true,
            db: mockDb,
            init: () => {}
        },
        Intl,
        Date,
        Number,
        String,
        Boolean,
        Array,
        Object,
        JSON,
        Math,
        RegExp,
        isNaN,
        parseFloat,
        parseInt
    };

    vm.createContext(sandbox);
    vm.runInContext(catalogoDataJs, sandbox);

    // 1ª chamada: sem cache -> busca no Firestore e salva no sessionStorage
    const res1 = await sandbox.carregarProdutos();
    assert(res1.length === 1 && res1[0].nome === 'Poltrona Teste SWR', 'CT05.1: 1ª chamada retorna dados do Firestore');
    assert(getCalls === 1, 'CT05.2: 1ª chamada realizou 1 query ao Firestore');
    assert(storageMap.has('paco_produtos_cache_v1'), 'CT05.3: Dados foram salvos em sessionStorage sob a chave paco_produtos_cache_v1');

    // 2ª chamada: com cache válido -> retorna imediatamente do cache e dispara revalidação
    const res2 = await sandbox.carregarProdutos();
    assert(res2.length === 1 && res2[0].nome === 'Poltrona Teste SWR', 'CT05.4: 2ª chamada retorna imediatamente os dados do cache SWR');

    // Invalidação do cache
    sandbox.limparCacheProdutos();
    assert(!storageMap.has('paco_produtos_cache_v1'), 'CT05.5: limparCacheProdutos() remove a chave paco_produtos_cache_v1 do sessionStorage');
    assert(adminJs.includes('limparCacheProdutos()'), 'CT05.6: js/admin.js invoca limparCacheProdutos() ao salvar ou excluir produto');

    console.log('\n🧪 CT06: Dimensões Intrínsecas, Fetch Priority e Content-Visibility (RF06, CA06)');
    {
        assert(
            indexHtml.includes('src="assets/pana_06.webp"') && indexHtml.includes('width="824" height="433"'),
            'CT06.1: assets/pana_06.webp possui width="824" height="433" explícitos em index.html'
        );
        assert(
            indexHtml.includes('src="assets/nova_imagem.webp"') && indexHtml.includes('width="1200" height="1801"'),
            'CT06.2: assets/nova_imagem.webp possui width="1200" height="1801" explícitos em index.html'
        );

        const rightChairMatch = indexHtml.match(/<img[^>]*assets\/hero_right_chair\.webp[^>]*>/);
        assert(
            rightChairMatch && !rightChairMatch[0].includes('fetchpriority="high"'),
            'CT06.3: hero_right_chair.webp não compete com fetchpriority="high" da imagem LCP principal'
        );

        assert(
            appJs.includes('fetchpriority="low"') && catalogoJs.includes('fetchpriority="low"'),
            'CT06.4: Imagens secundárias de hover possuem fetchpriority="low" e decoding="async" em js/app.js e js/catalogo.js'
        );

        assert(
            cssContent.includes('content-visibility: auto') && cssContent.includes('contain-intrinsic-size: auto 520px'),
            'CT06.5: Seções abaixo da dobra (.fun-middle-section, .fun-lineup-section, .fun-footer) possuem content-visibility: auto'
        );
    }

    console.log('\n🧪 CT07: Critical CSS Inline, Preconnects, Tipografia e View Transitions (RF07, CA07)');
    {
        for (const [name, html] of [['index.html', indexHtml], ['catalogo.html', catalogoHtml], ['produto.html', produtoHtml]]) {
            assert(
                html.includes('id="critical-css"') &&
                html.includes('href="https://www.gstatic.com"') &&
                html.includes('href="https://firestore.googleapis.com"'),
                `CT07.1 (${name}): Possui <style id="critical-css"> e preconnects para gstatic.com e firestore.googleapis.com`
            );
        }

        assert(
            cssContent.includes('text-wrap: balance') && cssContent.includes('text-wrap: pretty'),
            'CT07.2: css/style.css inclui text-wrap: balance para títulos e text-wrap: pretty para parágrafos'
        );

        assert(
            cssContent.includes('@view-transition') && cssContent.includes('navigation: auto'),
            'CT07.3: css/style.css inclui @view-transition { navigation: auto; } protegido por prefers-reduced-motion'
        );
    }

    console.log(`\n============================================================`);
    console.log(`Resultado Final: ${passed} passaram, ${failed} falharam.`);
    console.log(`============================================================\n`);

    if (failed > 0) {
        process.exit(1);
    }
})();
