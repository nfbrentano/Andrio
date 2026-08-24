/**
 * Lógica do Catálogo Completo PACO Móveis
 */

let catalogoProdutos = [];
let activeCategory = 'all';

const CATEGORY_DEFAULT_IMAGES = {
    poltrona: {
        img: "assets/prod_poltrona.webp",
        hover: "assets/hero_left_chair.webp"
    },
    sofa: {
        img: "assets/prod_sofa.webp",
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
    return CATEGORY_DEFAULT_IMAGES[cat] ? CATEGORY_DEFAULT_IMAGES[cat].hover : 'assets/hero_left_chair.webp';
}

// Fallback inicial
const PRODUTOS_PADRAO = [
    { 
        id: 1, 
        nome: "Poltrona Clássica Veludo", 
        preco: "R$ 2.890,00", 
        categoria: "poltrona", 
        img: "assets/prod_poltrona.webp",
        imagens: ["assets/prod_poltrona.webp", "assets/hero_left_chair.webp"],
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
        nome: "Sofá Moderno Terracota", 
        preco: "R$ 4.590,00", 
        categoria: "sofa", 
        img: "assets/prod_sofa.webp", 
        imagens: ["assets/prod_sofa.webp", "assets/middle_model.webp"],
        color: "#ff5722", 
        subhead: "Design + Funcionalidade", 
        desc: "Sofá três lugares com tecido premium e base em madeira nogueira, linhas contemporâneas", 
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

// Modal de Detalhes
const detailModal = document.getElementById('product-detail-modal');
const detailModalContent = document.getElementById('detail-modal-content');
const btnCloseDetail = document.getElementById('btn-close-detail');
const closeModalOverlay = document.getElementById('close-modal-overlay');

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
                <button class="fun-btn-dark" onclick="document.getElementById('catalogo-search').value=''; document.querySelector('.fun-pill-btn[data-category=\\'all\\']').click();">Ver todos os móveis</button>
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
            abrirDetalhesProduto(id);
        });
    });
}

// Abrir Modal de Detalhes com Galeria e Venda Casada
function abrirDetalhesProduto(id) {
    const produto = catalogoProdutos.find(p => String(p.id) === String(id));
    if (!produto) return;

    const fotos = Array.isArray(produto.imagens) && produto.imagens.length > 0 
        ? produto.imagens 
        : [produto.img];

    // Busca os produtos de venda casada
    let relatedItems = [];
    if (Array.isArray(produto.produtos_relacionados) && produto.produtos_relacionados.length > 0) {
        relatedItems = catalogoProdutos.filter(p => 
            produto.produtos_relacionados.includes(Number(p.id)) || 
            produto.produtos_relacionados.includes(String(p.id))
        );
    }

    const dispMap = {
        'pronta_entrega': '🟢 Pronta Entrega',
        'encomenda_15': '📦 Sob Encomenda (15 dias úteis)',
        'encomenda_30': '📦 Sob Encomenda (30 dias úteis)'
    };

    const dispText = dispMap[produto.disponibilidade] || '🟢 Pronta Entrega';

    detailModalContent.innerHTML = `
        <div class="modal-product-layout">
            <!-- Coluna da Galeria de Fotos -->
            <div class="modal-gallery-col">
                <div class="modal-main-image-wrap">
                    <img id="modal-main-img" src="${fotos[0]}" alt="${produto.nome}" class="modal-main-image">
                </div>
                ${fotos.length > 1 ? `
                    <div class="modal-thumbnails-strip">
                        ${fotos.map((f, idx) => `
                            <button type="button" class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" data-src="${f}">
                                <img src="${f}" alt="Ângulo ${idx + 1}">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Coluna de Especificações e Ações -->
            <div class="modal-info-col">
                <span class="modal-category-tag" style="background-color: ${produto.color || '#2b7fff'};">${produto.categoria.toUpperCase()}</span>
                <h2 class="modal-product-title">${produto.nome}</h2>
                <div class="modal-price-tag">${produto.preco}</div>
                <div class="modal-availability">${dispText}</div>

                <div class="modal-desc-block">
                    <h4>Conceito & Detalhes</h4>
                    <p>${produto.desc || 'Peça exclusiva de design autoral em materiais nobres.'}</p>
                </div>

                <!-- Tabela de Especificações do Móvel -->
                <div class="modal-specs-table">
                    <h4>Ficha Técnica</h4>
                    <div class="spec-row">
                        <span>Madeira / Estrutura:</span>
                        <strong>${produto.tipo_madeira || 'Madeira Nobre Selecionada'}</strong>
                    </div>
                    <div class="spec-row">
                        <span>Acabamento:</span>
                        <strong>${produto.acabamento || 'Verniz PU Acetinado'}</strong>
                    </div>
                    <div class="spec-row">
                        <span>Estofamento:</span>
                        <strong>${produto.material_estofado || 'Tecido Nobre'} ${produto.cor_estofado ? `(${produto.cor_estofado})` : ''}</strong>
                    </div>
                    ${(produto.largura_cm || produto.profundidade_cm || produto.altura_cm) ? `
                        <div class="spec-row">
                            <span>Dimensões (L × P × A):</span>
                            <strong>${produto.largura_cm || '-'} cm × ${produto.profundidade_cm || '-'} cm × ${produto.altura_cm || '-'} cm</strong>
                        </div>
                    ` : ''}
                    ${produto.peso_kg ? `
                        <div class="spec-row">
                            <span>Peso Estimado:</span>
                            <strong>${produto.peso_kg} kg</strong>
                        </div>
                    ` : ''}
                </div>

                <!-- CTA WhatsApp -->
                <div class="modal-cta-wrap">
                    <a href="https://wa.me/5511999999999?text=Ol%C3%A1,%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20a%20pe%C3%A7a:%20${encodeURIComponent(produto.nome)}%20(${encodeURIComponent(produto.preco)})" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="modal-btn-whatsapp">
                        <span>💬 Solicitar Orçamento via WhatsApp</span>
                    </a>
                </div>

                <!-- Seção de Venda Casada / Cross-sell -->
                ${relatedItems.length > 0 ? `
                    <div class="modal-bundle-section">
                        <h4>✨ Peças que combinam com este móvel ("Compre Junto"):</h4>
                        <div class="modal-bundle-grid">
                            ${relatedItems.map(item => `
                                <div class="modal-bundle-card" data-id="${item.id}">
                                    <img src="${item.img}" alt="${item.nome}">
                                    <div class="bundle-card-info">
                                        <strong>${item.nome}</strong>
                                        <span>${item.preco}</span>
                                    </div>
                                    <button type="button" class="btn-bundle-view" data-id="${item.id}">Ver Peça</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Eventos de troca de foto na galeria do modal
    detailModalContent.querySelectorAll('.modal-thumb-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const newSrc = e.currentTarget.dataset.src;
            const mainImg = document.getElementById('modal-main-img');
            if (mainImg) mainImg.src = newSrc;
            
            detailModalContent.querySelectorAll('.modal-thumb-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    // Evento para navegar para produto da venda casada
    detailModalContent.querySelectorAll('.modal-bundle-card, .btn-bundle-view').forEach(elem => {
        elem.addEventListener('click', (e) => {
            const relId = e.currentTarget.dataset.id;
            abrirDetalhesProduto(relId);
        });
    });

    detailModal.classList.add('open');
    detailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function fecharModalDetalhes() {
    detailModal.classList.remove('open');
    detailModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// Eventos de Fechar Modal
if (btnCloseDetail) btnCloseDetail.addEventListener('click', fecharModalDetalhes);
if (closeModalOverlay) closeModalOverlay.addEventListener('click', fecharModalDetalhes);
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailModal.classList.contains('open')) {
        fecharModalDetalhes();
    }
});

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
        activeCategory = currentBtn.dataset.category || 'all';

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
