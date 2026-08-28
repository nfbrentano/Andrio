/**
 * Lógica da Página de Produto Detalhado
 */

let catalogoProdutos = [];

const CATEGORY_DEFAULT_IMAGES = {
    poltrona: {
        img: "assets/prod_poltrona.webp",
        hover: "assets/hero_left_chair.webp"
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
    return CATEGORY_DEFAULT_IMAGES[cat] ? CATEGORY_DEFAULT_IMAGES[cat].hover : 'assets/hero_left_chair.webp';
}

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

async function carregarProdutos() {
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
                console.warn('[Produto] Erro ao carregar do Firestore:', err);
            }
        }
    }

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
        console.warn('[Produto] Erro ao ler localStorage:', e);
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

function renderizarProduto() {
    const detailContent = document.getElementById('produto-detail-content');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        detailContent.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h2>Produto não especificado.</h2>
                <a href="catalogo.html" class="fun-btn-dark" style="margin-top: 1rem;">Voltar ao Catálogo</a>
            </div>`;
        return;
    }

    const produto = catalogoProdutos.find(p => String(p.id) === String(id));
    if (!produto) {
        detailContent.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h2>Produto não encontrado.</h2>
                <a href="catalogo.html" class="fun-btn-dark" style="margin-top: 1rem;">Voltar ao Catálogo</a>
            </div>`;
        return;
    }

    const fotos = Array.isArray(produto.imagens) && produto.imagens.length > 0 
        ? produto.imagens 
        : [produto.img];

    lightboxFotos = fotos;
    currentLightboxIndex = 0;

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
    
    // Atualiza title da página dinamicamente
    document.title = `${produto.nome} | PACO Móveis`;

    detailContent.innerHTML = `
        <div class="product-page-layout">
            <!-- Coluna da Galeria de Fotos -->
            <div class="product-page-gallery">
                <div class="product-main-image-wrap" style="cursor: zoom-in;">
                    <img id="product-main-img" src="${fotos[0]}" alt="${produto.nome}" class="modal-main-image">
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
            <div class="product-page-info">
                <span class="modal-category-tag" style="background-color: ${produto.color || '#2b7fff'};">${produto.categoria.toUpperCase()}</span>
                <h1 class="product-page-title">${produto.nome}</h1>
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
                                <div class="modal-bundle-card" onclick="window.location.href='produto.html?id=${item.id}'" style="cursor:pointer;" data-id="${item.id}">
                                    <img src="${item.img}" alt="${item.nome}">
                                    <div class="bundle-card-info">
                                        <strong>${item.nome}</strong>
                                        <span>${item.preco}</span>
                                    </div>
                                    <button type="button" class="btn-bundle-view" onclick="window.location.href='produto.html?id=${item.id}'">Ver Peça</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Eventos de troca de foto na galeria
    detailContent.querySelectorAll('.modal-thumb-btn').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            const newSrc = e.currentTarget.dataset.src;
            const mainImg = document.getElementById('product-main-img');
            if (mainImg) mainImg.src = newSrc;
            
            currentLightboxIndex = index;
            
            detailContent.querySelectorAll('.modal-thumb-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    const mainImageWrap = detailContent.querySelector('.product-main-image-wrap');
    if (mainImageWrap) {
        mainImageWrap.addEventListener('click', () => {
            openLightbox(currentLightboxIndex);
        });
    }
}

// Lightbox Global State
let lightboxFotos = [];
let currentLightboxIndex = 0;

function openLightbox(index) {
    if (lightboxFotos.length === 0) return;
    currentLightboxIndex = index;
    const overlay = document.getElementById('lightbox-overlay');
    const img = document.getElementById('lightbox-image');
    if (overlay && img) {
        img.src = lightboxFotos[currentLightboxIndex];
        overlay.classList.add('active');
    }
}

function closeLightbox() {
    const overlay = document.getElementById('lightbox-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function nextLightboxPhoto(e) {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxFotos.length;
    document.getElementById('lightbox-image').src = lightboxFotos[currentLightboxIndex];
}

function prevLightboxPhoto(e) {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxFotos.length) % lightboxFotos.length;
    document.getElementById('lightbox-image').src = lightboxFotos[currentLightboxIndex];
}

document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('lightbox-overlay');
    if (overlay && overlay.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextLightboxPhoto();
        if (e.key === 'ArrowLeft') prevLightboxPhoto();
    }
});

function initLightbox() {
    if (!document.getElementById('lightbox-overlay')) {
        const lightboxHtml = `
            <div id="lightbox-overlay" class="lightbox-overlay" onclick="closeLightbox()">
                <button type="button" class="lightbox-close" onclick="closeLightbox()">×</button>
                <button type="button" class="lightbox-prev" onclick="prevLightboxPhoto(event)">‹</button>
                <div class="lightbox-content" onclick="event.stopPropagation()">
                    <img id="lightbox-image" class="lightbox-image" src="" alt="Galeria">
                </div>
                <button type="button" class="lightbox-next" onclick="nextLightboxPhoto(event)">›</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHtml);
    }
}

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
    initLightbox();
    initMenuMobile();
    await carregarProdutos();
    renderizarProduto();
});
