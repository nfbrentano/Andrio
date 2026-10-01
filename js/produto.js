/**
 * Lógica da Página de Produto Detalhado
 */

let catalogoProdutos = [];

// Carregar produtos utilizando módulo compartilhado catalogo-data.js
async function carregarProdutosDetalhe() {
    catalogoProdutos = await carregarProdutos();
}

/**
 * Atualiza dinamicamente as tags de SEO (title, description, canonical, Open Graph, Twitter)
 * e injeta o Schema.org JSON-LD Product com offers válidas para o Rich Results Test (RF02, CA03, RNF01, RNF02).
 * @param {Object} produto - Dados do produto
 * @param {Array<string>} [fotos] - Lista de URLs de fotos do produto
 * @returns {Object|null} Objeto JSON-LD gerado ou null
 */
function atualizarMetadadosProduto(produto, fotos = []) {
    if (!produto) return null;

    const baseDomain = 'https://pacomoveis.com.br';
    const safeTitle = `${produto.nome} | PACO Móveis de Design`;
    const descText = produto.desc 
        ? `${produto.nome} - ${produto.desc}` 
        : `${produto.nome} | Móvel de design autoral contemporâneo da PACO Móveis.`;
    const canonicalUrl = `${baseDomain}/produto.html?id=${encodeURIComponent(produto.id)}`;

    // Resolve URL absoluta da imagem principal e da galeria
    const toAbsoluteUrl = (url) => {
        if (!url) return `${baseDomain}/assets/hero_product.webp`;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const cleanPath = url.startsWith('/') ? url.slice(1) : url;
        return `${baseDomain}/${cleanPath}`;
    };

    const fotosValidas = Array.isArray(fotos) && fotos.length > 0 ? fotos : [produto.img];
    const absoluteImages = fotosValidas.map(toAbsoluteUrl);
    const mainImageUrl = absoluteImages[0] || `${baseDomain}/assets/hero_product.webp`;

    // Prepara preço numérico em centavos/reais para a oferta do Google
    let precoCentavos = produto.preco_centavos;
    if ((precoCentavos === undefined || precoCentavos === null) && produto.preco) {
        if (typeof parsePrecoParaCentavos === 'function') {
            precoCentavos = parsePrecoParaCentavos(produto.preco);
        } else {
            const str = String(produto.preco).replace(/[^\d,\.]/g, '').trim();
            if (str) {
                if (str.includes(',')) {
                    const limpo = str.replace(/\./g, '').replace(',', '.');
                    const val = parseFloat(limpo);
                    if (!isNaN(val) && val > 0) precoCentavos = Math.round(val * 100);
                } else {
                    const val = parseFloat(str);
                    if (!isNaN(val) && val > 0) precoCentavos = Math.round(val * 100);
                }
            }
        }
    }
    
    const priceFormatted = (precoCentavos && precoCentavos > 0)
        ? (precoCentavos / 100).toFixed(2)
        : null;

    // Mapeamento de disponibilidade Schema.org
    const availabilityMap = {
        'pronta_entrega': 'https://schema.org/InStock',
        'encomenda_15': 'https://schema.org/PreOrder',
        'encomenda_30': 'https://schema.org/PreOrder'
    };
    const availabilityUrl = availabilityMap[produto.disponibilidade] || 'https://schema.org/InStock';

    // Monta objeto JSON-LD Product Schema.org
    const productLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": produto.nome,
        "image": absoluteImages,
        "description": descText,
        "sku": `PACO-${produto.id}`,
        "category": produto.categoria || "Móveis",
        "brand": {
            "@type": "Brand",
            "name": "PACO Móveis"
        },
        "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "priceCurrency": "BRL",
            "price": priceFormatted || "0.00",
            "availability": availabilityUrl,
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
                "@type": "Organization",
                "name": "PACO Móveis",
                "url": `${baseDomain}/`
            }
        }
    };

    if (typeof document !== 'undefined') {
        // Atualiza title da página dinamicamente
        document.title = safeTitle;

        // Atualiza ou cria meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', descText);

        // Atualiza ou cria link canonical
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonicalUrl);

        // Atualiza tags Open Graph e Twitter Cards
        const setMetaProperty = (prop, content) => {
            let el = document.querySelector(`meta[property="${prop}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute('property', prop);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        const setMetaName = (name, content) => {
            let el = document.querySelector(`meta[name="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute('name', name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        setMetaProperty('og:title', safeTitle);
        setMetaProperty('og:description', descText);
        setMetaProperty('og:image', mainImageUrl);
        setMetaProperty('og:url', canonicalUrl);
        setMetaProperty('og:type', 'product');
        setMetaProperty('og:site_name', 'PACO Móveis');
        setMetaProperty('og:locale', 'pt_BR');

        setMetaName('twitter:card', 'summary_large_image');
        setMetaName('twitter:title', safeTitle);
        setMetaName('twitter:description', descText);
        setMetaName('twitter:image', mainImageUrl);

        // Injeta ou substitui o script JSON-LD na página
        let scriptLd = document.getElementById('product-jsonld');
        if (!scriptLd) {
            scriptLd = document.createElement('script');
            scriptLd.id = 'product-jsonld';
            scriptLd.type = 'application/ld+json';
            document.head.appendChild(scriptLd);
        }
        scriptLd.textContent = JSON.stringify(productLd, null, 2);
    }

    return productLd;
}

async function renderizarProduto() {
    const detailContent = document.getElementById('produto-detail-content');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        detailContent.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h2>Produto não especificado.</h2>
                <a href="catalogo.html" class="fun-btn-dark" style="margin-top: 1rem;">Voltar ao Catálogo</a>
            </div>`;
        destacarCategoriaProduto(null);
        return;
    }

    const produto = catalogoProdutos.find(p => String(p.id) === String(id));
    if (!produto) {
        detailContent.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h2>Produto não encontrado.</h2>
                <a href="catalogo.html" class="fun-btn-dark" style="margin-top: 1rem;">Voltar ao Catálogo</a>
            </div>`;
        destacarCategoriaProduto(null);
        return;
    }

    // Destaca a categoria do produto atual na navbar (RF02, CA02, CA04)
    destacarCategoriaProduto(produto.categoria);

    const defaultImg = getDefaultImageForCategory(produto.categoria);
    let fotosRaw = Array.isArray(produto.imagens) && produto.imagens.length > 0 
        ? produto.imagens.filter(f => f && String(f).trim().length > 0) 
        : [produto.img || defaultImg];

    if (fotosRaw.length === 0) {
        fotosRaw = [produto.img || defaultImg];
    }

    const fotos = fotosRaw.map(f => {
        const normalized = typeof normalizarUrlImagem === 'function' 
            ? normalizarUrlImagem(f, produto.categoria) 
            : f;
        return safeUrl(normalized, defaultImg);
    });

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
    
    // Atualiza title, meta description, Open Graph e JSON-LD Product dinamicamente (RF02, CA03, RNF01, RNF02)
    atualizarMetadadosProduto(produto, fotos);

    const safeNome = escapeHtml(produto.nome);
    const safePreco = escapeHtml(typeof formatarPrecoProduto === 'function' ? formatarPrecoProduto(produto) : produto.preco);
    const safeCategoria = escapeHtml(produto.categoria || '');
    const safeDesc = escapeHtml(produto.desc || 'Peça exclusiva de design autoral em materiais nobres.');
    const safeColor = sanitizeHexColor(produto.color, '#2b7fff');
    const safeTipoMadeira = escapeHtml(produto.tipo_madeira || 'Madeira Nobre Selecionada');
    const safeAcabamento = escapeHtml(produto.acabamento || 'Verniz PU Acetinado');
    const safeMaterialEstofado = escapeHtml(produto.material_estofado || 'Tecido Nobre');
    const safeCorEstofado = produto.cor_estofado ? escapeHtml(produto.cor_estofado) : '';
    const safeDispText = escapeHtml(dispText);

    const safeMainImg = escapeHtml(fotos[0]);
    const safeDefaultImg = escapeHtml(defaultImg);

    // Carrega contatos oficiais para o CTA do WhatsApp (RF01, RNF02, CA01, CA05)
    let waCtaHtml = '';
    let contatoConfig = null;
    if (typeof carregarConfiguracaoContato === 'function') {
        try {
            contatoConfig = await carregarConfiguracaoContato();
        } catch (_) {}
    }

    if (contatoConfig && contatoConfig.whatsapp && typeof validarWhatsApp === 'function' && validarWhatsApp(contatoConfig.whatsapp)) {
        const waLink = gerarLinkWhatsAppProduto(contatoConfig.whatsapp, produto, window.location.href);
        waCtaHtml = `
                <!-- CTA WhatsApp Oficial -->
                <div class="modal-cta-wrap" id="produto-cta-whatsapp">
                    <a href="${escapeHtml(waLink)}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="modal-btn-whatsapp"
                       id="btn-whatsapp-produto">
                        <span>💬 Solicitar Orçamento via WhatsApp</span>
                    </a>
                </div>
        `;
    }

    detailContent.innerHTML = `
        <div class="product-page-layout">
            <!-- Coluna da Galeria de Fotos -->
            <div class="product-page-gallery">
                <button type="button" class="product-main-image-wrap" aria-label="Ampliar foto de ${safeNome} em tela cheia">
                    <img id="product-main-img" 
                         src="${safeMainImg}" 
                         alt="${safeNome}" 
                         class="modal-main-image" 
                         width="700" 
                         height="700" 
                         fetchpriority="high"
                         data-fallback="assets/imagem-indisponivel.svg" 
                         onerror="this.onerror=null; this.src='assets/imagem-indisponivel.svg'; this.dataset.failed='true';">
                </button>
                ${fotos.length > 1 ? `
                    <div class="modal-thumbnails-strip">
                        ${fotos.map((f, idx) => {
                            const safeF = escapeHtml(f);
                            return `
                            <button type="button" class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" data-src="${safeF}" data-index="${idx}" aria-label="Ver imagem ${idx + 1} de ${fotos.length}">
                                <img src="${safeF}" 
                                     alt="${safeNome} miniatura ${idx + 1}" 
                                     width="68" 
                                     height="68" 
                                     loading="lazy" 
                                     data-fallback="assets/imagem-indisponivel.svg" 
                                     onerror="this.onerror=null; this.src='assets/imagem-indisponivel.svg'; this.dataset.failed='true';">
                            </button>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Coluna de Especificações e Ações -->
            <div class="product-page-info">
                <span class="modal-category-tag" style="background-color: ${safeColor};">${safeCategoria.toUpperCase()}</span>
                <h1 class="product-page-title">${safeNome}</h1>
                <div class="modal-price-tag">${safePreco}</div>
                <div class="modal-availability">${safeDispText}</div>

                <div class="modal-desc-block">
                    <h4>Conceito & Detalhes</h4>
                    <p>${safeDesc}</p>
                </div>

                <!-- Tabela de Especificações do Móvel -->
                <div class="modal-specs-table">
                    <h4>Ficha Técnica</h4>
                    <div class="spec-row">
                        <span>Madeira / Estrutura:</span>
                        <strong>${safeTipoMadeira}</strong>
                    </div>
                    <div class="spec-row">
                        <span>Acabamento:</span>
                        <strong>${safeAcabamento}</strong>
                    </div>
                    <div class="spec-row">
                        <span>Estofamento:</span>
                        <strong>${safeMaterialEstofado} ${safeCorEstofado ? `(${safeCorEstofado})` : ''}</strong>
                    </div>
                    ${(produto.largura_cm || produto.profundidade_cm || produto.altura_cm) ? `
                        <div class="spec-row">
                            <span>Dimensões (L × P × A):</span>
                            <strong>${escapeHtml(String(produto.largura_cm || '-'))} cm × ${escapeHtml(String(produto.profundidade_cm || '-'))} cm × ${escapeHtml(String(produto.altura_cm || '-'))} cm</strong>
                        </div>
                    ` : ''}
                    ${produto.peso_kg ? `
                        <div class="spec-row">
                            <span>Peso Estimado:</span>
                            <strong>${escapeHtml(String(produto.peso_kg))} kg</strong>
                        </div>
                    ` : ''}
                </div>

                ${waCtaHtml}

                <!-- Seção de Venda Casada / Cross-sell -->
                ${relatedItems.length > 0 ? `
                    <div class="modal-bundle-section">
                        <h4>✨ Peças que combinam com este móvel ("Compre Junto"):</h4>
                        <div class="modal-bundle-grid">
                            ${relatedItems.map(item => {
                                const relDefaultImg = getDefaultImageForCategory(item.categoria);
                                const relNormalized = typeof normalizarUrlImagem === 'function'
                                    ? normalizarUrlImagem(item.img, item.categoria)
                                    : item.img;
                                const safeRelImg = escapeHtml(safeUrl(relNormalized, relDefaultImg));
                                const safeRelNome = escapeHtml(item.nome);
                                const safeRelPreco = escapeHtml(typeof formatarPrecoProduto === 'function' ? formatarPrecoProduto(item) : item.preco);
                                const safeRelId = encodeURIComponent(String(item.id));
                                return `
                                <a class="modal-bundle-card" href="produto.html?id=${safeRelId}" data-id="${safeRelId}" aria-label="${safeRelNome} - ${safeRelPreco}">
                                    <img src="${safeRelImg}" 
                                         alt="${safeRelNome}" 
                                         width="180" 
                                         height="180" 
                                         loading="lazy" 
                                         data-fallback="assets/imagem-indisponivel.svg" 
                                         onerror="this.onerror=null; this.src='assets/imagem-indisponivel.svg'; this.dataset.failed='true';">
                                    <div class="bundle-card-info">
                                        <strong>${safeRelNome}</strong>
                                        <span>${safeRelPreco}</span>
                                    </div>
                                    <span class="btn-bundle-view" aria-hidden="true">Ver Peça</span>
                                </a>
                                `;
                            }).join('')}
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
            if (mainImg) {
                // Re-arma o fallback handler para a nova imagem, evitando loops
                mainImg.onerror = function() {
                    this.onerror = null;
                    this.src = 'assets/imagem-indisponivel.svg';
                    this.dataset.failed = 'true';
                };
                const thumbImg = e.currentTarget.querySelector('img');
                if (thumbImg && (thumbImg.dataset.failed === 'true' || thumbImg.src.includes('imagem-indisponivel.svg'))) {
                    mainImg.src = 'assets/imagem-indisponivel.svg';
                    mainImg.dataset.failed = 'true';
                } else {
                    delete mainImg.dataset.failed;
                    mainImg.src = safeUrl(newSrc, defaultImg);
                }
            }
            
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
let lastFocusedElement = null;

function updateLightboxPhoto() {
    const img = document.getElementById('lightbox-image');
    const overlay = document.getElementById('lightbox-overlay');
    const prevBtn = overlay?.querySelector('.lightbox-prev');
    const nextBtn = overlay?.querySelector('.lightbox-next');

    if (prevBtn && nextBtn) {
        if (!lightboxFotos || lightboxFotos.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }

    if (img && lightboxFotos && lightboxFotos[currentLightboxIndex]) {
        img.onerror = function() {
            this.onerror = null;
            this.src = 'assets/imagem-indisponivel.svg';
        };
        const currentPhoto = lightboxFotos[currentLightboxIndex];
        const activeThumb = document.querySelectorAll('.modal-thumb-btn')[currentLightboxIndex];
        const thumbImg = activeThumb?.querySelector('img');
        const mainImg = document.getElementById('product-main-img');

        // Se a miniatura correspondente ou a imagem principal atual já falhou, usa fallback de imediato
        if ((thumbImg && (thumbImg.dataset.failed === 'true' || thumbImg.src.includes('imagem-indisponivel.svg'))) ||
            (currentLightboxIndex === 0 && mainImg && mainImg.dataset.failed === 'true')) {
            img.src = 'assets/imagem-indisponivel.svg';
        } else {
            img.src = safeUrl(currentPhoto, 'assets/imagem-indisponivel.svg');
        }
        const prodTitle = document.querySelector('.product-page-title')?.textContent || 'Produto';
        img.alt = `Foto ${currentLightboxIndex + 1} de ${lightboxFotos.length} - ${prodTitle}`;
    }
}

function openLightbox(index) {
    if (lightboxFotos.length === 0) return;
    lastFocusedElement = document.activeElement;
    currentLightboxIndex = index;
    const overlay = document.getElementById('lightbox-overlay');
    if (overlay) {
        updateLightboxPhoto();
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        const closeBtn = overlay.querySelector('.lightbox-close');
        if (closeBtn) closeBtn.focus();
    }
}

function closeLightbox() {
    const overlay = document.getElementById('lightbox-overlay');
    if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }
}

function nextLightboxPhoto(e) {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxFotos.length;
    updateLightboxPhoto();
}

function prevLightboxPhoto(e) {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxFotos.length) % lightboxFotos.length;
    updateLightboxPhoto();
}

if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('lightbox-overlay');
        if (!overlay || !overlay.classList.contains('active')) return;

    if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
        return;
    }
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextLightboxPhoto();
        return;
    }
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevLightboxPhoto();
        return;
    }
    if (e.key === 'Tab') {
        const focusable = overlay.querySelectorAll('button:not([disabled])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
});
}

function initLightbox() {
    if (!document.getElementById('lightbox-overlay')) {
        const lightboxHtml = `
            <div id="lightbox-overlay" class="lightbox-overlay" role="dialog" aria-modal="true" aria-label="Galeria de fotos em tela cheia" aria-hidden="true" onclick="closeLightbox()">
                <button type="button" class="lightbox-close" aria-label="Fechar galeria em tela cheia" onclick="closeLightbox()">×</button>
                <button type="button" class="lightbox-prev" aria-label="Foto anterior" onclick="prevLightboxPhoto(event)">‹</button>
                <div class="lightbox-content" onclick="event.stopPropagation()">
                    <img id="lightbox-image" class="lightbox-image" src="" alt="Galeria" width="800" height="800" data-fallback="assets/imagem-indisponivel.svg">
                </div>
                <button type="button" class="lightbox-next" aria-label="Próxima foto" onclick="nextLightboxPhoto(event)">›</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHtml);
    }
}

// Normalização de slug de categoria para correspondência robusta
function normalizarCategoriaSlug(cat) {
    if (!cat) return '';
    const clean = String(cat)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    if (clean === 'poltrona' || clean === 'poltronas') return 'poltrona';
    if (clean === 'mesa' || clean === 'mesas') return 'mesa';
    if (clean === 'cadeira' || clean === 'cadeiras') return 'cadeira';
    if (clean === 'luminaria' || clean === 'luminarias') return 'luminaria';
    return clean;
}

// Destaca o botão da categoria correspondente ao produto atual na navbar (RF02, CA02, CA04)
function destacarCategoriaProduto(categoria) {
    const slug = normalizarCategoriaSlug(categoria);
    const filterLinks = document.querySelectorAll('.fun-navbar-filters .fun-pill-btn');

    filterLinks.forEach(link => {
        const linkCat = normalizarCategoriaSlug(link.dataset.category);
        const isActive = Boolean(slug && linkCat && linkCat === slug);

        link.classList.toggle('active', isActive);
        link.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        link.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

// Configura os links de categoria da navbar para navegação no catálogo (RF01, RF03, CA01, CA03, RNF01)
function configurarFiltrosCategoriaProduto() {
    const filterLinks = document.querySelectorAll('.fun-navbar-filters .fun-pill-btn');
    filterLinks.forEach(link => {
        const cat = (link.dataset.category || 'all').toLowerCase();
        if (!link.getAttribute('href') && cat) {
            link.setAttribute('href', `catalogo.html?categoria=${cat}`);
        }

        link.addEventListener('click', (e) => {
            // Permite abertura nativa em nova aba/janela com teclas modificadoras ou clique com botão do meio (CA03)
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button !== undefined && e.button !== 0)) {
                return;
            }

            // Se for link <a> com href válido, a navegação padrão do navegador já funciona perfeitamente (RF01, CA01).
            // Caso seja outro elemento (ex.: button legado) ou sem href, navega via location.href sem erros (RNF01).
            if (link.tagName.toLowerCase() !== 'a' || !link.getAttribute('href')) {
                e.preventDefault();
                window.location.href = `catalogo.html?categoria=${cat}`;
            }
        });
    });
}

// Inicialização
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        initLightbox();
        configurarFiltrosCategoriaProduto();

        await carregarProdutosDetalhe();
        await renderizarProduto();
    });
}

if (typeof window !== 'undefined') {
    window.destacarCategoriaProduto = destacarCategoriaProduto;
    window.configurarFiltrosCategoriaProduto = configurarFiltrosCategoriaProduto;
    window.normalizarCategoriaSlug = normalizarCategoriaSlug;
    window.renderizarProduto = renderizarProduto;
    window.carregarProdutosDetalhe = carregarProdutosDetalhe;
    window.atualizarMetadadosProduto = atualizarMetadadosProduto;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        destacarCategoriaProduto,
        configurarFiltrosCategoriaProduto,
        normalizarCategoriaSlug,
        renderizarProduto,
        carregarProdutosDetalhe,
        atualizarMetadadosProduto
    };
}


