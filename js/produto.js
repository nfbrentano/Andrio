/**
 * Lógica da Página de Produto Detalhado
 */

let catalogoProdutos = [];

// Carregar produtos utilizando módulo compartilhado catalogo-data.js
async function carregarProdutosDetalhe() {
    catalogoProdutos = await carregarProdutos();
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

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    initLightbox();
    await carregarProdutosDetalhe();
    renderizarProduto();
});

