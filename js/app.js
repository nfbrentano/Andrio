let produtosAtuais = [];
let sliderInstance = null;

const PRODUTOS_PADRAO = [
    { id: 1, nome: "Poltrona Clássica Veludo", preco: "R$ 2.890,00", categoria: "poltrona", img: "assets/prod_poltrona.webp", color: "#2b7fff", subhead: "Conforto + Elegância", desc: "Poltrona capitonê em veludo com pés torneados em madeira maciça e detalhes dourados", bg: "#4190de" },
    { id: 2, nome: "Sofá Moderno Terracota", preco: "R$ 4.590,00", categoria: "sofa", img: "assets/prod_sofa.webp", color: "#ff5722", subhead: "Design + Funcionalidade", desc: "Sofá três lugares com tecido premium e base em madeira nogueira, linhas contemporâneas", bg: "#fe5100" },
    { id: 3, nome: "Cadeira de Jantar Mostarda", preco: "R$ 1.290,00", categoria: "cadeira", img: "assets/prod_cadeira.webp", color: "#ffeb3b", subhead: "Versatilidade + Estilo", desc: "Cadeira estofada em veludo mostarda com pés em metal dourado, design moderno e elegante", bg: "#ffcd01" },
    { id: 4, nome: "Mesa Lateral Mármore", preco: "R$ 1.890,00", categoria: "mesa", img: "assets/prod_mesa.webp", color: "#9c27b0", subhead: "Sofisticação + Minimalismo", desc: "Mesa lateral com tampo em mármore branco e estrutura em metal dourado escovado", bg: "#7c55c6" }
];

function carregarSupabaseScript() {
    if (window.supabase) return Promise.resolve(window.supabase);
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => resolve(window.supabase);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Função para normalizar e converter links do Google Drive
function normalizarUrlImagem(url) {
    if (!url) return 'assets/prod_poltrona.webp';
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
                    items.push({ 
                        id: doc.id, 
                        ...data,
                        img: normalizarUrlImagem(data.img),
                        imagens: Array.isArray(data.imagens) ? data.imagens.map(normalizarUrlImagem) : [normalizarUrlImagem(data.img)]
                    });
                });

                if (items.length > 0) {
                    produtosAtuais = items.map(item => ({
                        ...item,
                        subhead: item.subhead || "Design Autoral",
                        desc: item.desc || "Peça exclusiva de design autoral em materiais nobres.",
                        bg: item.bg || item.color || "#4190de"
                    }));
                    return;
                }
            } catch (e) {
                console.error("[App] Erro ao buscar produtos do Firestore:", e);
            }
        }
    }
    
    // Fallback
    const local = localStorage.getItem('fun_produtos');
    const raw = local ? JSON.parse(local) : PRODUTOS_PADRAO;
    produtosAtuais = raw.map(item => ({
        ...item,
        img: normalizarUrlImagem(item.img),
        imagens: Array.isArray(item.imagens) ? item.imagens.map(normalizarUrlImagem) : [normalizarUrlImagem(item.img)],
        subhead: item.subhead || "Design Autoral",
        desc: item.desc || "Peça exclusiva de design autoral em materiais nobres.",
        bg: item.bg || item.color || "#4190de"
    }));
}

const catalogo = document.getElementById('catalogo');
const filterBtns = document.querySelectorAll('.fun-pill-btn');

let sliderResizeRaf = null;
let sliderResizeHandler = null;

function destruirSlider() {
    if (sliderResizeHandler) {
        window.removeEventListener('resize', sliderResizeHandler);
        sliderResizeHandler = null;
    }
    if (sliderResizeRaf) {
        cancelAnimationFrame(sliderResizeRaf);
        sliderResizeRaf = null;
    }
    if (sliderInstance) {
        sliderInstance.destroy();
        sliderInstance = null;
    }
}

function updateSliderNavigation(slider, prevBtn, nextBtn) {
    if (!slider || !slider.container) return;
    
    // Batch layout reads
    const containerWidth = slider.container.clientWidth;
    let totalSlidesWidth = 0;
    const slides = slider.container.children;
    for (let i = 0; i < slides.length; i++) {
        totalSlidesWidth += slides[i].offsetWidth;
    }

    const fitsAll = totalSlidesWidth <= containerWidth + 10;

    // Batch layout writes in animation frame
    requestAnimationFrame(() => {
        if (prevBtn) prevBtn.style.display = fitsAll ? 'none' : 'flex';
        if (nextBtn) nextBtn.style.display = fitsAll ? 'none' : 'flex';
        if (slider.container) {
            slider.container.style.justifyContent = fitsAll ? 'center' : 'flex-start';
        }
    });
}

function inicializarSlider() {
    destruirSlider();
    const slides = catalogo.querySelectorAll('.keen-slider__slide');
    const slidesCount = slides.length;
    
    const arrowPrev = document.getElementById("arrow-prev");
    const arrowNext = document.getElementById("arrow-next");

    if (slidesCount > 0) {
        const shouldLoop = slidesCount > 2;
        
        sliderInstance = new KeenSlider("#catalogo", {
            loop: shouldLoop,
            mode: "free-snap",
            slides: {
                perView: "auto",
                spacing: 0,
            },
            created: (s) => {
                updateSliderNavigation(s, arrowPrev, arrowNext);
            },
            updated: (s) => {
                updateSliderNavigation(s, arrowPrev, arrowNext);
            }
        });

        // Add debounced resize listener to update alignment/arrows dynamically
        sliderResizeHandler = () => {
            if (sliderResizeRaf) cancelAnimationFrame(sliderResizeRaf);
            sliderResizeRaf = requestAnimationFrame(() => {
                if (sliderInstance) {
                    updateSliderNavigation(sliderInstance, arrowPrev, arrowNext);
                }
            });
        };
        window.addEventListener('resize', sliderResizeHandler, { passive: true });

        if (arrowPrev && arrowNext) {
            arrowPrev.onclick = (e) => {
                e.preventDefault();
                if (sliderInstance) sliderInstance.prev();
            };
            arrowNext.onclick = (e) => {
                e.preventDefault();
                if (sliderInstance) sliderInstance.next();
            };
        }
    } else {
        if (arrowPrev && arrowNext) {
            arrowPrev.style.display = 'none';
            arrowNext.style.display = 'none';
        }
    }
}

function renderizarProdutos(categoria = 'all') {
    destruirSlider();
    
    const produtosFiltrados = categoria === 'all' 
        ? produtosAtuais 
        : produtosAtuais.filter(p => p.categoria === categoria);

    if (produtosFiltrados.length === 0) {
        catalogo.innerHTML = '<p style="text-align: center; color: #777; padding: 40px 0; width: 100%;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    const htmlCards = produtosFiltrados.map((produto) => {
        const fotos = Array.isArray(produto.imagens) && produto.imagens.length > 0 ? produto.imagens : [produto.img];
        const fotoHover = fotos.length > 1 ? fotos[1] : fotos[0];
        
        return `
        <div class="keen-slider__slide">
            <a class="group relative block" aria-label="${produto.nome} - Preço: ${produto.preco}. ${produto.subhead}" href="catalogo.html">
                <div class="aspect-3-4">
                    <div class="aspect-3-4-inner">
                        <div class="size-full">
                            <!-- Image 1 (default view) -->
                            <div class="absolute-inset-0 hover-opacity-0">
                                <div class="size-full">
                                    <img loading="lazy" alt="${produto.nome}" class="object-cover-img" src="${produto.img}" onerror="this.onerror=null; this.src='assets/prod_poltrona.webp';" width="500" height="669">
                                </div>
                            </div>
                            <!-- Image 2 (hover view) -->
                            <div class="absolute-inset-0 opacity-0 hover-opacity-100">
                                <div class="size-full">
                                    <img loading="lazy" alt="${produto.nome} em outro ângulo" class="object-cover-img" src="${fotoHover}" onerror="this.onerror=null; this.src='assets/prod_poltrona.webp';" width="500" height="669">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Hover description block -->
                <div class="hover-info-panel" aria-hidden="true">
                    <div class="hover-info-content" style="background-color: ${produto.bg || '#ffcd01'}">
                        <p class="type-headings">${produto.subhead || 'Design Autoral'}</p>
                        <p class="type-body">${produto.desc || ''}</p>
                    </div>
                </div>
                
                <!-- Pricing & dot footer details -->
                <div class="details-footer">
                    <div class="details-row">
                        <div class="details-left">
                            <div class="dots-container" aria-hidden="true">
                                <div style="background-color: ${produto.color || '#4190de'}" class="outer-dot"></div>
                                <div class="inner-dot-overlay">
                                    <div class="inner-dot"></div>
                                </div>
                            </div>
                            <div>
                                <h3 class="type-title">${produto.nome}</h3>
                                <p class="type-body">${produto.subhead}</p>
                            </div>
                        </div>
                        <p class="type-title" aria-label="Preço: ${produto.preco}">${produto.preco}</p>
                    </div>
                </div>
            </a>
        </div>
    `).join('');

    catalogo.innerHTML = htmlCards;

    // Wait for the browser to settle layout before KeenSlider measures elements
    requestAnimationFrame(() => {
        inicializarSlider();
    });
}

function getButtonColor(btn) {
    if (!btn) return '#2b7fff';
    if (btn.dataset.color) return btn.dataset.color;
    const styleAttr = btn.getAttribute('style') || '';
    const match = styleAttr.match(/--btn-color:\s*(#[a-fA-F0-9]{3,8})/);
    if (match && match[1]) return match[1];
    const computed = window.getComputedStyle(btn).getPropertyValue('--btn-color').trim();
    return computed || '#2b7fff';
}

function applyButtonActiveColor(btn) {
    const targetColor = getButtonColor(btn);
    btn.style.backgroundColor = targetColor;
    btn.style.borderColor = targetColor;
    btn.style.color = (targetColor.toLowerCase() === '#ffeb3b') ? 'black' : 'white';
}

filterBtns.forEach(btn => {
    // Initialize all buttons with their solid colors
    const color = getButtonColor(btn);
    btn.style.backgroundColor = color;
    btn.style.borderColor = color;
    btn.style.color = (color.toLowerCase() === '#ffeb3b') ? 'black' : 'white';

    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        
        const activeBtn = e.currentTarget;
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
        
        renderizarProdutos(activeBtn.dataset.category);
    });
});

// Intersection Observer for Scroll Reveal
function inicializarScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px"
    });
    
    reveals.forEach(el => observer.observe(el));
}

// Mobile Navigation Logic with Accessible Focus Management
function inicializarMenuMobile() {
    const hamburgerBtn = document.getElementById('fun-hamburger');
    const closeBtn = document.getElementById('fun-close-menu');
    const navMenu = document.getElementById('fun-nav-menu');
    const overlay = document.getElementById('fun-mobile-overlay');

    if (!hamburgerBtn || !navMenu) return;

    function syncMenuAria() {
        if (window.innerWidth <= 1024) {
            navMenu.setAttribute('aria-hidden', navMenu.classList.contains('is-open') ? 'false' : 'true');
        } else {
            navMenu.setAttribute('aria-hidden', 'false');
        }
    }
    syncMenuAria();

    function openMenu() {
        hamburgerBtn.classList.add('is-active');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        navMenu.classList.add('is-open');
        navMenu.setAttribute('aria-hidden', 'false');
        if (overlay) {
            overlay.classList.add('is-active');
            overlay.setAttribute('aria-hidden', 'false');
        }
        document.body.classList.add('menu-open');

        // Direct focus to the close button inside the modal navigation
        requestAnimationFrame(() => {
            if (closeBtn) closeBtn.focus();
        });
    }

    function closeMenu(restoreFocus = true) {
        hamburgerBtn.classList.remove('is-active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
        if (window.innerWidth <= 1024) {
            navMenu.setAttribute('aria-hidden', 'true');
        }
        if (overlay) {
            overlay.classList.remove('is-active');
            overlay.setAttribute('aria-hidden', 'true');
        }
        document.body.classList.remove('menu-open');

        // Return focus to trigger button
        if (restoreFocus && hamburgerBtn) {
            hamburgerBtn.focus();
        }
    }

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('is-open');
        if (isOpen) {
            closeMenu(true);
        } else {
            openMenu();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeMenu(true));
    }

    if (overlay) {
        overlay.addEventListener('click', () => closeMenu(true));
    }

    // Close menu on pressing ESC and trap focus inside mobile drawer
    document.addEventListener('keydown', (e) => {
        if (!navMenu.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeMenu(true);
            return;
        }

        // Focus trap when menu is open on mobile
        if (e.key === 'Tab' && window.innerWidth <= 1024) {
            const focusableElements = navMenu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });

    // Close menu when clicking filter buttons on mobile
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                closeMenu(false);
            }
        });
    });

    // Auto-close on resize to desktop & sync ARIA
    window.addEventListener('resize', () => {
        syncMenuAria();
        if (window.innerWidth > 1024 && navMenu.classList.contains('is-open')) {
            closeMenu(false);
        }
    });
}

// Renderização inicial
document.addEventListener('DOMContentLoaded', async () => {
    // Set initial active button styling
    const activeBtn = document.querySelector('.fun-pill-btn.active');
    if (activeBtn) {
        applyButtonActiveColor(activeBtn);
    }
    inicializarMenuMobile();
    await carregarProdutos();
    renderizarProdutos();
    inicializarScrollReveal();
});
