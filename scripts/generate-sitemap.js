/**
 * Gerador de Sitemap XML para PACO Móveis (RF04, CA04)
 * Gera sitemap.xml com home, catálogo e URLs individuais de cada produto
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://pacomoveis.com.br';

/**
 * Carrega a lista de produtos padrão a partir de catalogo-data.js
 * @returns {Array<Object>} Lista de produtos
 */
function obterProdutosPadrao() {
    try {
        const catalogoPath = path.resolve(__dirname, '../js/shared/catalogo-data.js');
        const code = fs.readFileSync(catalogoPath, 'utf8');
        
        // Avalia de forma segura criando um contexto isolado
        const vm = require('vm');
        const sandbox = {
            window: {},
            console: { warn: () => {} },
            Intl: Intl
        };
        vm.createContext(sandbox);
        vm.runInContext(code, sandbox);

        if (Array.isArray(sandbox.PRODUTOS_PADRAO)) {
            return sandbox.PRODUTOS_PADRAO;
        }
    } catch (err) {
        console.warn('[sitemap] Aviso ao carregar catalogo-data.js:', err.message);
    }

    // Fallback garantido se não conseguir ler dinamicamente
    return [
        { id: 1, nome: "Poltrona Clássica Veludo" },
        { id: 2, nome: "Luminária Moderno Terracota" },
        { id: 3, nome: "Cadeira de Jantar Mostarda" },
        { id: 4, nome: "Mesa Lateral Mármore" }
    ];
}

/**
 * Gera o conteúdo XML formatado para o sitemap
 * @param {Array<Object>} [produtos] - Lista opcional de produtos
 * @param {string} [dataHoje] - Data no formato YYYY-MM-DD
 * @returns {string} XML válido
 */
function gerarSitemapXml(produtos, dataHoje) {
    const prods = Array.isArray(produtos) && produtos.length > 0 ? produtos : obterProdutosPadrao();
    const lastmod = dataHoje || new Date().toISOString().split('T')[0];

    const urls = [
        {
            loc: `${DOMAIN}/`,
            lastmod: lastmod,
            changefreq: 'weekly',
            priority: '1.0'
        },
        {
            loc: `${DOMAIN}/catalogo.html`,
            lastmod: lastmod,
            changefreq: 'weekly',
            priority: '0.9'
        }
    ];

    prods.forEach(prod => {
        urls.push({
            loc: `${DOMAIN}/produto.html?id=${encodeURIComponent(prod.id)}`,
            lastmod: lastmod,
            changefreq: 'weekly',
            priority: '0.8'
        });
    });

    const xmlLines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ];

    urls.forEach(item => {
        xmlLines.push('  <url>');
        xmlLines.push(`    <loc>${item.loc}</loc>`);
        xmlLines.push(`    <lastmod>${item.lastmod}</lastmod>`);
        xmlLines.push(`    <changefreq>${item.changefreq}</changefreq>`);
        xmlLines.push(`    <priority>${item.priority}</priority>`);
        xmlLines.push('  </url>');
    });

    xmlLines.push('</urlset>');
    xmlLines.push('');

    return xmlLines.join('\n');
}

/**
 * Salva o sitemap.xml no arquivo de destino
 * @param {string} [caminhoDestino] - Caminho absoluto ou relativo do sitemap.xml
 * @returns {string} XML gerado
 */
function salvarSitemap(caminhoDestino) {
    const destino = caminhoDestino || path.resolve(__dirname, '../sitemap.xml');
    const xml = gerarSitemapXml();
    fs.writeFileSync(destino, xml, 'utf8');
    return xml;
}

if (require.main === module) {
    const xml = salvarSitemap();
    console.log('✅ sitemap.xml gerado com sucesso em pacomoveis.com.br');
}

module.exports = {
    DOMAIN,
    obterProdutosPadrao,
    gerarSitemapXml,
    salvarSitemap
};
