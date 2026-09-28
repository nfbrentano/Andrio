/**
 * Lógica do Catálogo Completo PACO Móveis
 */

let catalogoProdutos = [];
const VALID_CATEGORIES = ['all', 'poltrona', 'mesa', 'cadeira', 'luminaria'];
let activeCategory = 'all';

function obterCategoriaDaUrl() {
    const params = new URLSearchParams(window.location.search);
    const cat = (params.get('categoria') || '').toLowerCase().trim();
    return VALID_CATEGORIES.includes(cat) ? cat : 'all';
}

function normalizarTexto(str) {
    if (!str) return '';
    return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function debounce(fn, delay = 200) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

function formatarContador(total) {
    if (total === 1) {
        return '1 móvel encontrado';
    }
    return `${total} móveis encontrados`;
}

function atualizarBotoesFiltro() {
    const btns = document.querySelectorAll('.fun-pill-btn');
    btns.forEach(btn => {
        const isSelected = (btn.dataset.category || '').toLowerCase() === activeCategory;
        btn.classList.toggle('active', isSelected);
        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
}

function limparFiltrosEBusca() {
    if (catalogoSearch) {
        catalogoSearch.value = '';
    }
    activeCategory = 'all';
    atualizarBotoesFiltro();

    const url = new URL(window.location);
    url.searchParams.delete('categoria');
    window.history.replaceState({}, '', url);

    renderizarCatalogo();
}
window.limparFiltrosEBusca = limparFiltrosEBusca;

// Elementos do DOM
const catalogoGrid = document.getElementById('catalogo-grid');
const catalogoSearch = document.getElementById('catalogo-search');
const catalogoSort = document.getElementById('catalogo-sort');
const catalogoCount = document.getElementById('catalogo-count');
const filterBtns = document.querySelectorAll('.fun-pill-btn');

// Converte string de preço "R$ 2.890,00" para número float
function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
}

// Carregar produtos utilizando módulo compartilhado catalogo-data.js
async function carregarProdutosCatalogo() {
    catalogoProdutos = await carregarProdutos();
}

// Renderizar o Grid de Produtos
function renderizarCatalogo() {
    const query = catalogoSearch ? catalogoSearch.value : '';
    const queryNorm = normalizarTexto(query);
    const sortVal = catalogoSort ? catalogoSort.value : 'recent';
    const temBusca = queryNorm.length > 0;

    // Se houver busca preenchida, pesquisa em todas as categorias (RF02, CA01).
    // Caso contrário, filtra pela categoria ativa (ou todas se activeCategory === 'all').
    let filtrados = (temBusca || activeCategory === 'all')
        ? [...catalogoProdutos]
        : catalogoProdutos.filter(p => (p.categoria || '').toLowerCase() === activeCategory);

    // Filtro por Busca de Texto com normalização de acentos e caixa (RF03, CA03)
    if (temBusca) {
        filtrados = filtrados.filter(p => {
            const campos = [
                p.nome,
                p.categoria,
                p.subhead,
                p.desc,
                p.tipo_madeira,
                p.material_estofado,
                p.cor_estofado,
                p.acabamento
            ];
            return campos.some(campo => campo && normalizarTexto(campo).includes(queryNorm));
        });
    }

    // Ordenação
    if (sortVal === 'price-asc') {
        filtrados.sort((a, b) => parsePrice(a.preco) - parsePrice(b.preco));
    } else if (sortVal === 'price-desc') {
        filtrados.sort((a, b) => parsePrice(b.preco) - parsePrice(a.preco));
    } else if (sortVal === 'name-asc') {
        filtrados.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
    }

    // Atualiza Contador com pluralização correta (RF04, CA04)
    if (catalogoCount) {
        catalogoCount.textContent = formatarContador(filtrados.length);
    }

    // Estado Vazio (RF05, CT05)
    if (filtrados.length === 0) {
        catalogoGrid.innerHTML = `
            <div class="catalogo-empty">
                <span style="font-size: 2.5rem;">🪑</span>
                <h3>Nenhum móvel encontrado</h3>
                <p>Tente ajustar os filtros ou buscar por outro termo.</p>
                <button class="fun-btn-dark" onclick="window.limparFiltrosEBusca()">Ver todos os móveis</button>
            </div>
        `;
        return;
    }

    // Gera o HTML dos Cards
    catalogoGrid.innerHTML = filtrados.map(p => {
        const defaultImg = getDefaultImageForCategory(p.categoria);
        const defaultHover = getDefaultHoverImageForCategory(p.categoria);
        const fotos = Array.isArray(p.imagens) && p.imagens.length > 0 ? p.imagens : [p.img || defaultImg];
        const mainImg = p.img || defaultImg;
        const fotoHover = fotos.length > 1 ? fotos[1] : (mainImg !== defaultHover ? defaultHover : mainImg);
        const hasRelated = Array.isArray(p.produtos_relacionados) && p.produtos_relacionados.length > 0;

        const safeMainImg = escapeHtml(safeUrl(mainImg, defaultImg));
        const safeHoverImg = escapeHtml(safeUrl(fotoHover, defaultHover));
        const safeDefaultImg = escapeHtml(defaultImg);
        const safeDefaultHover = escapeHtml(defaultHover);

        const safeNome = escapeHtml(p.nome);
        const safePreco = escapeHtml(p.preco);
        const safeSubhead = escapeHtml(p.subhead || p.categoria || 'Design Autoral');
        const safeDesc = escapeHtml(p.desc || '');
        const safeId = encodeURIComponent(String(p.id));

        const safeBg = sanitizeHexColor(p.bg, sanitizeHexColor(p.color, '#2b7fff'));
        const safeColor = sanitizeHexColor(p.color, '#2b7fff');

        const woodTypeFirstWord = p.tipo_madeira ? escapeHtml(p.tipo_madeira.split(' ')[0]) : '';

        return `
            <a href="produto.html?id=${safeId}" class="catalogo-card" data-id="${safeId}" aria-label="${safeNome} - Preço: ${safePreco}. ${safeSubhead}">
                <div class="catalogo-card-media">
                    <div class="aspect-3-4">
                        <div class="aspect-3-4-inner">
                            <div class="size-full">
                                <div class="absolute-inset-0 hover-opacity-0">
                                    <img loading="lazy" alt="${safeNome}" class="object-cover-img" src="${safeMainImg}" data-fallback="${safeDefaultImg}" onerror="this.onerror=null; this.src=this.dataset.fallback || 'assets/prod_poltrona.webp';">
                                </div>
                                <div class="absolute-inset-0 opacity-0 hover-opacity-100">
                                    <img loading="lazy" alt="${safeNome} ângulo alternativo" class="object-cover-img" src="${safeHoverImg}" data-fallback="${safeDefaultHover}" onerror="this.onerror=null; this.src=this.dataset.fallback || 'assets/hero_left_chair.webp';">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Painel descritivo no hover -->
                    <div class="hover-info-panel" aria-hidden="true">
                        <div class="hover-info-content" style="background-color: ${safeBg}">
                            <p class="type-headings">${safeSubhead}</p>
                            <p class="type-body">${safeDesc}</p>
                        </div>
                    </div>

                    <!-- Badges sobre a foto -->
                    <div class="catalogo-card-badges">
                        ${woodTypeFirstWord ? `<span class="card-wood-badge">🪵 ${woodTypeFirstWord}</span>` : ''}
                        ${hasRelated ? `<span class="card-bundle-badge">🔗 Compre Junto</span>` : ''}
                    </div>
                </div>

                <!-- Rodapé de informações do Card -->
                <div class="details-footer">
                    <div class="details-row">
                        <div class="details-left">
                            <div class="dots-container" aria-hidden="true">
                                <div style="background-color: ${safeColor}" class="outer-dot"></div>
                                <div class="inner-dot-overlay">
                                    <div class="inner-dot"></div>
                                </div>
                            </div>
                            <div>
                                <h3 class="type-title">${safeNome}</h3>
                                <p class="type-body">${safeSubhead}</p>
                            </div>
                        </div>
                        <p class="type-title" aria-label="Preço: ${safePreco}">${safePreco}</p>
                    </div>
                </div>

                <span class="btn-quick-view" aria-hidden="true">Ver Detalhes & Galeria →</span>
            </a>
        `;
    }).join('');
}
// (Função abrirDetalhesProduto e fecharModalDetalhes removidas, pois a página de produto agora cuida disso)

// Eventos de Filtro por Categoria
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const currentBtn = e.currentTarget;
        activeCategory = currentBtn.dataset.category || 'all';

        // Ao clicar em uma categoria específica, limpa a busca para exibir a categoria
        if (catalogoSearch && catalogoSearch.value) {
            catalogoSearch.value = '';
        }

        atualizarBotoesFiltro();

        const url = new URL(window.location);
        if (activeCategory === 'all') {
            url.searchParams.delete('categoria');
        } else {
            url.searchParams.set('categoria', activeCategory);
        }
        window.history.replaceState({}, '', url);

        renderizarCatalogo();
    });
});

// Eventos de Busca e Ordenação (RF06: debounce de 200ms)
if (catalogoSearch) catalogoSearch.addEventListener('input', debounce(renderizarCatalogo, 200));
if (catalogoSort) catalogoSort.addEventListener('change', renderizarCatalogo);


// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    initMenuMobile();
    activeCategory = obterCategoriaDaUrl();
    atualizarBotoesFiltro();
    await carregarProdutosCatalogo();
    renderizarCatalogo();
});

window.addEventListener('popstate', () => {
    activeCategory = obterCategoriaDaUrl();
    atualizarBotoesFiltro();
    renderizarCatalogo();
});
