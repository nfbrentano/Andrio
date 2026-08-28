/**
 * Lógica do Catálogo Completo PACO Móveis
 */

let catalogoProdutos = [];
let activeCategory = 'poltrona';

const CATEGORY_DEFAULT_IMAGES = {
    poltrona: {
        img: "assets/prod_poltrona.webp",
        hover: "assets/hero_left_chair.jpg"
    },
    luminaria: {
        img: "assets/prod_luminaria.webp",
        hover: "assets/middle_model.webp"
    },
    cadeira: {
        img: "assets/prod_cadeira.webp",
        hover: "assets/people_grid_1.webp"
    },
    mesa: {
        img: "assets/prod_mesa.webp",
        hover: "assets/hero_product.webp"
    }
};

function getDefaultImageForCategory(categoria) {
    const cat = String(categoria || '').toLowerCase().trim();
    return CATEGORY_DEFAULT_IMAGES[cat] ? CATEGORY_DEFAULT_IMAGES[cat].img : 'assets/prod_poltrona.webp';
}

function getDefaultHoverImageForCategory(categoria) {
    const cat = String(categoria || '').toLowerCase().trim();
    return CATEGORY_DEFAULT_IMAGES[cat] ? CATEGORY_DEFAULT_IMAGES[cat].hover : 'assets/hero_left_chair.jpg';
}

// Fallback inicial
const PRODUTOS_PADRAO = [
    { 
        id: 1, 
        nome: "Poltrona Clássica Veludo", 
        preco: "R$ 2.890,00", 
        categoria: "poltrona", 
        img: "assets/prod_poltrona.webp",
        imagens: ["assets/prod_poltrona.webp", "assets/hero_left_chair.jpg"],
        color: "#2b7fff", 
        subhead: "Conforto + Elegância", 
        desc: "Poltrona capitonê em veludo com pés torneados em madeira maciça e detalhes dourados", 
        bg: "#4190de",
        tipo_madeira: "Imbuia Maciça",
        acabamento: "Verniz PU Acetinado Fosco",
        material_estofado: "Veludo Italiano Nobre",
        cor_estofado: "Azul Petróleo",
        largura_cm: 85,
        profundidade_cm: 90,
        altura_cm: 78,
        peso_kg: 22,
        disponibilidade: "pronta_entrega",
        produtos_relacionados: [4]
    },
    { 
        id: 2, 
        nome: "Luminária Moderno Terracota", 
        preco: "R$ 4.590,00", 
        categoria: "luminaria", 
        img: "assets/prod_luminaria.webp", 
        imagens: ["assets/prod_luminaria.webp", "assets/middle_model.webp"],
        color: "#ff5722", 
        subhead: "Design + Funcionalidade", 
        desc: "Luminária três lugares com tecido premium e base em madeira nogueira, linhas contemporâneas", 
        bg: "#fe5100",
        tipo_madeira: "Nogueira Nobre",
        acabamento: "Óleo Mineral Natural",
        material_estofado: "Linho Puro Rústico",
        cor_estofado: "Terracota Queimado",
        largura_cm: 220,
        profundidade_cm: 95,
        altura_cm: 82,
        peso_kg: 58,
        disponibilidade: "pronta_entrega",
        produtos_relacionados: [1, 4]
    },
    { 
        id: 3, 
        nome: "Cadeira de Jantar Mostarda", 
        preco: "R$ 1.290,00", 
        categoria: "cadeira", 
        img: "assets/prod_cadeira.webp", 
        imagens: ["assets/prod_cadeira.webp", "assets/people_grid_1.webp"],
        color: "#ffeb3b", 
        subhead: "Versatilidade + Estilo", 
        desc: "Cadeira estofada em veludo mostarda com pés em metal dourado, design moderno e elegante", 
        bg: "#ffcd01",
        tipo_madeira: "Estrutura Metálica Dourada",
        acabamento: "Metal Dourado Escovado",
        material_estofado: "Veludo Italiano Nobre",
        cor_estofado: "Mostarda Intenso",
        largura_cm: 54,
        profundidade_cm: 58,
        altura_cm: 86,
        peso_kg: 7.5,
        disponibilidade: "pronta_entrega",
        produtos_relacionados: [4]
    },
    { 
        id: 4, 
        nome: "Mesa Lateral Mármore", 
        preco: "R$ 1.890,00", 
        categoria: "mesa", 
        img: "assets/prod_mesa.webp", 
        imagens: ["assets/prod_mesa.webp", "assets/hero_product.webp"],
        color: "#9c27b0", 
        subhead: "Sofisticação + Minimalismo", 
        desc: "Mesa lateral com tampo em mármore branco e estrutura em metal dourado escovado", 
        bg: "#7c55c6",
        tipo_madeira: "Estrutura Metálica Dourada",
        acabamento: "Metal Dourado Escovado",
        material_estofado: "Sem Estofado (Madeira Aparente)",
        cor_estofado: "Branco Carrara",
        largura_cm: 50,
        profundidade_cm: 50,
        altura_cm: 55,
        peso_kg: 14,
        disponibilidade: "pronta_entrega",
        produtos_relacionados: [1, 2]
    }
];

// Elementos do DOM
const catalogoGrid = document.getElementById('catalogo-grid');
const catalogoSearch = document.getElementById('catalogo-search');
const catalogoSort = document.getElementById('catalogo-sort');
const catalogoCount = document.getElementById('catalogo-count');
const filterBtns = document.querySelectorAll('.fun-pill-btn');

// Modal de Detalhes (Removido a favor da navegação)
// (Os elementos foram mantidos comentados ou removidos da UI)

// Converte string de preço "R$ 2.890,00" para número float
function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
}

// Função para normalizar e converter links do Google Drive
function normalizarUrlImagem(url, categoria) {
    if (!url || String(url).trim() === '') {
        return getDefaultImageForCategory(categoria);
    }
    const trimmed = String(url).trim();

    const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                       trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                       trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                       trimmed.match(/thumbnail\?id=([a-zA-Z0-9_-]+)/) ||
                       trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
                       
    if (driveMatch && driveMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`;
    }

    if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('.')) {
        return `https://drive.google.com/thumbnail?id=${trimmed}&sz=w1600`;
    }

    return trimmed;
}

// Carregar produtos
async function carregarProdutosCatalogo() {
    if (typeof FirebaseService !== 'undefined') {
        FirebaseService.init();

        if (FirebaseService.isConfigured && FirebaseService.db) {
            try {
                const snapshot = await FirebaseService.db.collection('produtos')
                    .orderBy('created_at', 'desc')
                    .get();

                const items = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const defaultImg = getDefaultImageForCategory(data.categoria);
                    const defaultHover = getDefaultHoverImageForCategory(data.categoria);
                    const mainImg = data.img ? normalizarUrlImagem(data.img, data.categoria) : defaultImg;
                    let imagens = Array.isArray(data.imagens) && data.imagens.length > 0
                        ? data.imagens.filter(Boolean).map(u => normalizarUrlImagem(u, data.categoria))
                        : [mainImg, defaultHover];
                    if (imagens.length === 0) imagens = [mainImg, defaultHover];

                    items.push({ 
                        id: doc.id, 
                        ...data,
                        img: mainImg,
                        imagens: imagens
                    });
                });

                if (items.length > 0) {
                    catalogoProdutos = items;
                    return;
                }
            } catch (err) {
                console.warn('[Catalogo] Erro ao carregar do Firestore:', err);
            }
        }
    }

    // Fallback Local ou Padrão Mock
    let raw = null;
    try {
        const local = localStorage.getItem('fun_produtos');
        if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
                raw = parsed;
            }
        }
    } catch (e) {
        console.warn('[Catalogo] Erro ao ler localStorage:', e);
    }

    if (!raw || raw.length === 0) {
        raw = PRODUTOS_PADRAO;
    }

    catalogoProdutos = raw.map(p => {
        const defaultImg = getDefaultImageForCategory(p.categoria);
        const defaultHover = getDefaultHoverImageForCategory(p.categoria);
        const mainImg = p.img ? normalizarUrlImagem(p.img, p.categoria) : defaultImg;
        let imagens = Array.isArray(p.imagens) && p.imagens.length > 0
            ? p.imagens.filter(Boolean).map(u => normalizarUrlImagem(u, p.categoria))
            : [mainImg, defaultHover];
        if (imagens.length === 0) imagens = [mainImg, defaultHover];

        return {
            ...p,
            img: mainImg,
            imagens: imagens
        };
    });
}

// Renderizar o Grid de Produtos
function renderizarCatalogo() {
    const query = catalogoSearch ? catalogoSearch.value.toLowerCase().trim() : '';
    const sortVal = catalogoSort ? catalogoSort.value : 'recent';

    // Filtro por Categoria
    let filtrados = activeCategory === 'all'
        ? [...catalogoProdutos]
        : catalogoProdutos.filter(p => p.categoria === activeCategory);

    // Filtro por Busca de Texto
    if (query) {
        filtrados = filtrados.filter(p => 
            p.nome.toLowerCase().includes(query) ||
            p.categoria.toLowerCase().includes(query) ||
            (p.subhead && p.subhead.toLowerCase().includes(query)) ||
            (p.tipo_madeira && p.tipo_madeira.toLowerCase().includes(query)) ||
            (p.material_estofado && p.material_estofado.toLowerCase().includes(query)) ||
            (p.acabamento && p.acabamento.toLowerCase().includes(query))
        );
    }

    // Ordenação
    if (sortVal === 'price-asc') {
        filtrados.sort((a, b) => parsePrice(a.preco) - parsePrice(b.preco));
    } else if (sortVal === 'price-desc') {
        filtrados.sort((a, b) => parsePrice(b.preco) - parsePrice(a.preco));
    } else if (sortVal === 'name-asc') {
        filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    // Atualiza Contador
    if (catalogoCount) {
        catalogoCount.textContent = `${filtrados.length} móvei(s) encontrado(s)`;
    }

    // Estado Vazio
    if (filtrados.length === 0) {
        catalogoGrid.innerHTML = `
            <div class="catalogo-empty">
                <span style="font-size: 2.5rem;">🪑</span>
                <h3>Nenhum móvel encontrado</h3>
                <p>Tente ajustar os filtros ou buscar por outro termo.</p>
                <button class="fun-btn-dark" onclick="document.getElementById('catalogo-search').value=''; document.querySelector('.fun-pill-btn[data-category=\\'poltrona\\']').click();">Ver poltronas</button>
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

        return `
            <div class="catalogo-card" data-id="${p.id}">
                <div class="catalogo-card-media">
                    <div class="aspect-3-4">
                        <div class="aspect-3-4-inner">
                            <div class="size-full">
                                <div class="absolute-inset-0 hover-opacity-0">
                                    <img loading="lazy" alt="${p.nome}" class="object-cover-img" src="${mainImg}" onerror="this.onerror=null; this.src='${defaultImg}';">
                                </div>
                                <div class="absolute-inset-0 opacity-0 hover-opacity-100">
                                    <img loading="lazy" alt="${p.nome} ângulo alternativo" class="object-cover-img" src="${fotoHover}" onerror="this.onerror=null; this.src='${defaultHover}';">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Painel descritivo no hover -->
                    <div class="hover-info-panel" aria-hidden="true">
                        <div class="hover-info-content" style="background-color: ${p.bg || p.color || '#2b7fff'}">
                            <p class="type-headings">${p.subhead || 'Design Autoral'}</p>
                            <p class="type-body">${p.desc || ''}</p>
                        </div>
                    </div>

                    <!-- Badges sobre a foto -->
                    <div class="catalogo-card-badges">
                        ${p.tipo_madeira ? `<span class="card-wood-badge">🪵 ${p.tipo_madeira.split(' ')[0]}</span>` : ''}
                        ${hasRelated ? `<span class="card-bundle-badge">🔗 Compre Junto</span>` : ''}
                    </div>
                </div>

                <!-- Rodapé de informações do Card -->
                <div class="details-footer">
                    <div class="details-row">
                        <div class="details-left">
                            <div class="dots-container" aria-hidden="true">
                                <div style="background-color: ${p.color || '#2b7fff'}" class="outer-dot"></div>
                                <div class="inner-dot-overlay">
                                    <div class="inner-dot"></div>
                                </div>
                            </div>
                            <div>
                                <h3 class="type-title">${p.nome}</h3>
                                <p class="type-body">${p.subhead || p.categoria}</p>
                            </div>
                        </div>
                        <p class="type-title" aria-label="Preço: ${p.preco}">${p.preco}</p>
                    </div>
                </div>

                <button class="btn-quick-view" data-id="${p.id}">Ver Detalhes & Galeria →</button>
            </div>
        `;
    }).join('');

    // Adiciona evento de clique para abrir detalhes do produto
    catalogoGrid.querySelectorAll('.catalogo-card, .btn-quick-view').forEach(elem => {
        elem.addEventListener('click', (e) => {
            // Evita abrir 2x se clicou no botão interno
            const id = e.currentTarget.dataset.id;
            window.location.href = `produto.html?id=${id}`;
        });
    });
}
// (Função abrirDetalhesProduto e fecharModalDetalhes removidas, pois a página de produto agora cuida disso)

// Eventos de Filtro por Categoria
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });

        const currentBtn = e.currentTarget;
        currentBtn.classList.add('active');
        currentBtn.setAttribute('aria-selected', 'true');
        activeCategory = currentBtn.dataset.category || 'poltrona';

        renderizarCatalogo();
    });
});

// Eventos de Busca e Ordenação
if (catalogoSearch) catalogoSearch.addEventListener('input', renderizarCatalogo);
if (catalogoSort) catalogoSort.addEventListener('change', renderizarCatalogo);

// Menu Mobile
function initMenuMobile() {
    const hamburgerBtn = document.getElementById('fun-hamburger');
    const closeBtn = document.getElementById('fun-close-menu');
    const navMenu = document.getElementById('fun-nav-menu');
    const overlay = document.getElementById('fun-mobile-overlay');

    if (!hamburgerBtn || !navMenu) return;

    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.add('is-open');
        if (overlay) overlay.classList.add('is-active');
    });

    const close = () => {
        navMenu.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-active');
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    initMenuMobile();
    await carregarProdutosCatalogo();
    renderizarCatalogo();
});
