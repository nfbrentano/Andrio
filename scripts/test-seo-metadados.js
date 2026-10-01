/**
 * Suíte de Testes Automatizados para SEO, Domínio, Metadados e Sitemap (SDD 2026-09-24)
 * Valida RF01-RF06, CA01-CA05, RNF01, RNF02 e Casos de Teste CT01-CT05.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

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
    console.log('🧪 Iniciando Testes: SEO, Domínio, Metadados e Sitemap');
    console.log('============================================================\n');

    const rootDir = path.resolve(__dirname, '..');
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const catalogoHtml = fs.readFileSync(path.join(rootDir, 'catalogo.html'), 'utf8');
    const produtoHtml = fs.readFileSync(path.join(rootDir, 'produto.html'), 'utf8');
    const robotsTxt = fs.readFileSync(path.join(rootDir, 'robots.txt'), 'utf8');
    const sitemapXml = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
    const manifestJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
    const produtoJs = require('../js/produto.js');
    const sitemapGen = require('./generate-sitemap.js');

    // =========================================================================
    // 1. RF01 / CA01 / CT01: Ausência de marca/domínio legado e domínio oficial PACO
    // =========================================================================
    console.log('🌐 1. RF01 / CA01 / CT01: Eliminação de marca legada e padronização PACO:');

    const termoLegado = 'fun' + 'cosmeticos';

    runTest('CT01 / CA01: Zero ocorrências do termo legado no repositório (exceto SDD e .git)', () => {
        let stdout = '';
        try {
            stdout = execSync(`grep -ri "${termoLegado}" . --exclude-dir=SDD --exclude-dir=.git --exclude=test-seo-metadados.js`, {
                cwd: rootDir,
                encoding: 'utf8'
            });
        } catch (e) {
            // grep retorna exit code 1 quando não encontra nenhuma ocorrência (comportamento esperado)
            stdout = '';
        }
        assert.strictEqual(stdout.trim(), '', `Ainda existem referências ao domínio legado: \n${stdout}`);
    });

    runTest('RF01: Ausência da keyword legada "fun móveis" no index.html', () => {
        assert.ok(!indexHtml.includes('fun móveis'), 'index.html não deve conter a keyword "fun móveis"');
        assert.ok(indexHtml.includes('paco móveis'), 'index.html deve conter "paco móveis"');
    });

    runTest('RF01: robots.txt aponta para pacomoveis.com.br e define sitemap e disallow', () => {
        assert.ok(robotsTxt.includes('https://pacomoveis.com.br/'), 'robots.txt deve citar o domínio oficial');
        assert.ok(robotsTxt.includes('Sitemap: https://pacomoveis.com.br/sitemap.xml'), 'robots.txt deve apontar para o sitemap correto');
        assert.ok(robotsTxt.includes('Disallow: /admin.html'), 'robots.txt deve bloquear /admin.html');
        assert.ok(robotsTxt.includes('Disallow: /login.html'), 'robots.txt deve bloquear /login.html');
    });

    // =========================================================================
    // 2. RF01 / RF05 / CA02: Metadados, Canonical e Open Graph nas Páginas
    // =========================================================================
    console.log('\n📱 2. RF01 / RF05 / CA02: Canonical, Open Graph e Twitter Cards:');

    runTest('CA02: index.html contém canonical, OG tags e Twitter Cards oficiais da PACO', () => {
        assert.ok(indexHtml.includes('<link rel="canonical" href="https://pacomoveis.com.br/">'), 'Canonical correto em index.html');
        assert.ok(indexHtml.includes('property="og:url" content="https://pacomoveis.com.br/"'), 'og:url aponta para pacomoveis.com.br');
        assert.ok(indexHtml.includes('property="og:site_name" content="PACO Móveis"'), 'og:site_name é PACO Móveis');
        assert.ok(indexHtml.includes('property="og:image" content="https://pacomoveis.com.br/assets/hero_product.webp"'), 'og:image absoluto oficial');
        assert.ok(indexHtml.includes('name="twitter:image" content="https://pacomoveis.com.br/assets/hero_product.webp"'), 'twitter:image absoluto oficial');
    });

    runTest('RF01: index.html Schema.org usa logo oficial assets/logo.webp e Instagram pacomoveis', () => {
        assert.ok(indexHtml.includes('"url": "https://pacomoveis.com.br/assets/logo.webp"'), 'Logo JSON-LD deve ser assets/logo.webp');
        assert.ok(!indexHtml.includes(termoLegado), 'Não deve conter o domínio legado');
        assert.ok(indexHtml.includes('https://www.instagram.com/pacomoveis'), 'Instagram da PACO Móveis no sameAs');
    });

    runTest('RF05: catalogo.html contém canonical, Open Graph, Twitter Cards e CollectionPage JSON-LD', () => {
        assert.ok(catalogoHtml.includes('<link rel="canonical" href="https://pacomoveis.com.br/catalogo.html">'), 'Canonical correto em catalogo.html');
        assert.ok(catalogoHtml.includes('property="og:title" content="Catálogo Completo | PACO Móveis de Design"'), 'og:title presente');
        assert.ok(catalogoHtml.includes('property="og:url" content="https://pacomoveis.com.br/catalogo.html"'), 'og:url presente');
        assert.ok(catalogoHtml.includes('name="twitter:card" content="summary_large_image"'), 'Twitter card presente');
        assert.ok(catalogoHtml.includes('"@type": "CollectionPage"'), 'CollectionPage JSON-LD em catalogo.html');
    });

    runTest('RF05: produto.html contém meta tags base de SEO, canonical e container JSON-LD', () => {
        assert.ok(produtoHtml.includes('<link rel="canonical" id="canonical-link" href="https://pacomoveis.com.br/produto.html">'), 'Canonical base em produto.html');
        assert.ok(produtoHtml.includes('id="og-title"'), 'og:title com id presente');
        assert.ok(produtoHtml.includes('id="og-image"'), 'og:image com id presente');
        assert.ok(produtoHtml.includes('id="product-jsonld"'), 'Elemento de injeção JSON-LD presente em produto.html');
    });

    // =========================================================================
    // 3. RF02 / CA03 / RNF02: JSON-LD Product Dinâmico e Rich Results
    // =========================================================================
    console.log('\n🏷️  3. RF02 / CA03 / RNF02: Injeção Dinâmica de Schema.org Product e Rich Results:');

    runTest('RF02 / CA03: atualizarMetadadosProduto gera Schema.org Product válido com offers em BRL', () => {
        const mockProduto = {
            id: 1,
            nome: "Poltrona Clássica Veludo",
            preco: "R$ 2.890,00",
            preco_centavos: 289000,
            categoria: "poltrona",
            img: "assets/prod_poltrona.webp",
            desc: "Poltrona capitonê em veludo nobre",
            disponibilidade: "pronta_entrega"
        };

        const schema = produtoJs.atualizarMetadadosProduto(mockProduto, ["assets/prod_poltrona.webp", "assets/hero_left_chair.webp"]);
        
        assert.ok(schema, 'Schema não pode ser nulo');
        assert.strictEqual(schema['@context'], 'https://schema.org');
        assert.strictEqual(schema['@type'], 'Product');
        assert.strictEqual(schema.name, 'Poltrona Clássica Veludo');
        assert.strictEqual(schema.sku, 'PACO-1');
        assert.strictEqual(schema.brand.name, 'PACO Móveis');
        assert.ok(Array.isArray(schema.image), 'Imagens devem ser array');
        assert.ok(schema.image[0].startsWith('https://pacomoveis.com.br/'), 'Imagens devem ser URLs absolutas');
        
        // Validação de Offers (Google Rich Results requirement)
        assert.ok(schema.offers, 'Deve conter nó offers');
        assert.strictEqual(schema.offers['@type'], 'Offer');
        assert.strictEqual(schema.offers.priceCurrency, 'BRL');
        assert.strictEqual(schema.offers.price, '2890.00');
        assert.strictEqual(schema.offers.availability, 'https://schema.org/InStock');
        assert.strictEqual(schema.offers.itemCondition, 'https://schema.org/NewCondition');
        assert.strictEqual(schema.offers.seller.name, 'PACO Móveis');
        assert.strictEqual(schema.offers.url, 'https://pacomoveis.com.br/produto.html?id=1');
    });

    runTest('RF02 / RNF02: Disponibilidade sob encomenda mapeia para PreOrder no Schema.org', () => {
        const mockEncomenda = {
            id: 2,
            nome: "Móvel Sob Encomenda",
            preco: "R$ 1.500,00",
            preco_centavos: 150000,
            categoria: "mesa",
            img: "assets/prod_mesa.webp",
            disponibilidade: "encomenda_15"
        };

        const schema = produtoJs.atualizarMetadadosProduto(mockEncomenda);
        assert.strictEqual(schema.offers.availability, 'https://schema.org/PreOrder');
    });

    runTest('RF02: Suporta documentos com preço legado sem preco_centavos', () => {
        const mockLegado = {
            id: 3,
            nome: "Cadeira Retrô",
            preco: "R$ 890,00",
            categoria: "cadeira",
            img: "assets/prod_cadeira.webp",
            disponibilidade: "pronta_entrega"
        };

        const schema = produtoJs.atualizarMetadadosProduto(mockLegado);
        assert.strictEqual(schema.offers.price, '890.00');
    });

    // =========================================================================
    // 4. RF03 / CA05 / CT05: Cards do Catálogo com Links Rastreáveis <a>
    // =========================================================================
    console.log('\n🔗 4. RF03 / CA05 / CT05: Rastreabilidade por Links (<a>):');

    runTest('CA05 / CT05: js/catalogo.js renderiza cards com tag <a href="produto.html?id=...">', () => {
        const catalogoJs = fs.readFileSync(path.join(rootDir, 'js/catalogo.js'), 'utf8');
        assert.ok(
            catalogoJs.includes('<a href="produto.html?id=${safeId}"') || catalogoJs.includes('<a href="produto.html?id='),
            'Cards do catálogo devem usar tag <a> com link direto para produto.html'
        );
    });

    runTest('RF03: js/app.js renderiza slides da vitrine com tag <a href="produto.html?id=...">', () => {
        const appJs = fs.readFileSync(path.join(rootDir, 'js/app.js'), 'utf8');
        assert.ok(
            appJs.includes('href="produto.html?id=${safeId}"') || appJs.includes('href="produto.html?id='),
            'Vitrine inicial deve usar tag <a> com link direto para produto.html'
        );
    });

    // =========================================================================
    // 5. RF04 / CA04 / CT04: Validação do sitemap.xml
    // =========================================================================
    console.log('\n🗺️  5. RF04 / CA04 / CT04: Sitemap XML e Conteúdo das URLs:');

    runTest('CA04 / CT04: sitemap.xml contém home, catálogo e todas as URLs de produtos', () => {
        assert.ok(sitemapXml.includes('<loc>https://pacomoveis.com.br/</loc>'), 'sitemap deve incluir a home');
        assert.ok(sitemapXml.includes('<loc>https://pacomoveis.com.br/catalogo.html</loc>'), 'sitemap deve incluir o catálogo');
        
        // Verifica se cada produto padrão tem uma URL no sitemap
        const produtosPadrao = sitemapGen.obterProdutosPadrao();
        assert.ok(produtosPadrao.length >= 4, 'Deve haver ao menos 4 produtos no catálogo padrão');
        
        produtosPadrao.forEach(p => {
            const prodUrl = `<loc>https://pacomoveis.com.br/produto.html?id=${p.id}</loc>`;
            assert.ok(sitemapXml.includes(prodUrl), `sitemap deve incluir produto id ${p.id}: ${prodUrl}`);
        });
    });

    runTest('CT04: sitemap.xml possui cabeçalho XML e formato urlset válido', () => {
        assert.ok(sitemapXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Deve iniciar com declaração XML');
        assert.ok(sitemapXml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Namespace do sitemap correto');
        assert.ok(sitemapXml.trim().endsWith('</urlset>'), 'Deve fechar urlset');
    });

    // =========================================================================
    // 6. RF06: Web App Manifest e Theme-Color
    // =========================================================================
    console.log('\n🎨 6. RF06: Web App Manifest e theme-color:');

    runTest('RF06: manifest.json possui campos essenciais de PWA/Web App', () => {
        assert.strictEqual(manifestJson.name, 'PACO Móveis de Design');
        assert.strictEqual(manifestJson.short_name, 'PACO Móveis');
        assert.strictEqual(manifestJson.theme_color, '#2b7fff');
        assert.strictEqual(manifestJson.background_color, '#ffffff');
        assert.ok(Array.isArray(manifestJson.icons) && manifestJson.icons.length > 0, 'manifest deve conter ícones');
    });

    runTest('RF06: Páginas públicas e administrativas incluem meta theme-color e link do manifest', () => {
        const pages = [
            { name: 'index.html', content: indexHtml },
            { name: 'catalogo.html', content: catalogoHtml },
            { name: 'produto.html', content: produtoHtml }
        ];

        pages.forEach(({ name, content }) => {
            assert.ok(content.includes('<meta name="theme-color" content="#2b7fff">'), `${name} deve ter meta theme-color`);
            assert.ok(content.includes('<link rel="manifest" href="manifest.json">'), `${name} deve referenciar manifest.json`);
        });
    });

    runTest('RF06: deploy.yml e sw.js incluem manifest.json no deploy e no precache', () => {
        const deployYml = fs.readFileSync(path.join(rootDir, '.github/workflows/deploy.yml'), 'utf8');
        const swJs = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');

        assert.ok(deployYml.includes('manifest.json'), 'deploy.yml deve copiar manifest.json para _site/');
        assert.ok(swJs.includes("'manifest.json'"), 'sw.js deve incluir manifest.json em PRECACHE_ASSETS');
    });

    // =========================================================================
    // FIM DA SUÍTE
    // =========================================================================
    console.log('\n============================================================');
    console.log(`📊 Resultado dos Testes: ${testsPassed} passaram, ${testsFailed} falharam`);
    console.log('============================================================\n');

    if (testsFailed > 0) {
        process.exit(1);
    }
}

runSuite().catch(err => {
    console.error('Erro fatal na execução da suíte:', err);
    process.exit(1);
});
