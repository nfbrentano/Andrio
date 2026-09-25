let produtosAtuais = [];
let sliderInstance = null;

// Carregamento de produtos utilizando o módulo compartilhado catalogo-data.js
async function carregarProdutosHome() {
    produtosAtuais = await carregarProdutos();
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
    
    // Batch layout reads in next frame to avoid forced reflow from KeenSlider DOM changes
    requestAnimationFrame(() => {
        if (!slider.container) return;
        const containerWidth = slider.container.clientWidth;
        let totalSlidesWidth = 0;
        const slides = slider.container.children;
        for (let i = 0; i < slides.length; i++) {
            totalSlidesWidth += slides[i].offsetWidth;
        }

        const fitsAll = totalSlidesWidth <= containerWidth + 10;

        // Batch layout writes in another animation frame
        requestAnimationFrame(() => {
            if (prevBtn) prevBtn.classList.toggle('hide-arrows', fitsAll);
            if (nextBtn) nextBtn.classList.toggle('hide-arrows', fitsAll);
            if (slider.container) {
                slider.container.style.justifyContent = fitsAll ? 'center' : 'flex-start';
            }
        });
    });
}

function inicializarSlider() {
    destruirSlider();
    const slides = catalogo.querySelectorAll('.keen-slider__slide');
    const slidesCount = slides.length;
    
    let arrowPrev = document.getElementById("arrow-prev");
    let arrowNext = document.getElementById("arrow-next");

    if (slidesCount > 0) {
        const shouldLoop = slidesCount > 2;
        
        sliderInstance = new KeenSlider("#catalogo", {
            loop: shouldLoop,
            mode: "free-snap",
            slides: {
                perView: 4,
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
                e.stopPropagation();
                if (sliderInstance) sliderInstance.prev();
            };
            
            arrowNext.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (sliderInstance) sliderInstance.next();
            };
        }
    } else {
        if (arrowPrev && arrowNext) {
            arrowPrev.classList.add('hide-arrows');
            arrowNext.classList.add('hide-arrows');
        }
    }
}

function renderizarProdutos(categoria = 'poltrona') {
    destruirSlider();
    
    const produtosFiltrados = categoria === 'all' 
        ? produtosAtuais 
        : produtosAtuais.filter(p => p.categoria === categoria);

    if (produtosFiltrados.length === 0) {
        catalogo.innerHTML = '<p style="text-align: center; color: #777; padding: 40px 0; width: 100%;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    const htmlCards = produtosFiltrados.map((produto) => {
        const defaultImg = getDefaultImageForCategory(produto.categoria);
        const defaultHover = getDefaultHoverImageForCategory(produto.categoria);
        const fotos = Array.isArray(produto.imagens) && produto.imagens.length > 0 ? produto.imagens : [produto.img || defaultImg];
        const mainImg = produto.img || defaultImg;
        const fotoHover = fotos.length > 1 ? fotos[1] : (mainImg !== defaultHover ? defaultHover : mainImg);
        
        return `
        <div class="keen-slider__slide">
            <a class="group relative block" aria-label="${produto.nome} - Preço: ${produto.preco}. ${produto.subhead}" href="produto.html?id=${produto.id}">
                <div class="aspect-3-4">
                    <div class="aspect-3-4-inner">
                        <div class="size-full">
                            <!-- Image 1 (default view) -->
                            <div class="absolute-inset-0 hover-opacity-0">
                                <div class="size-full">
                                    <img loading="lazy" alt="${produto.nome}" class="object-cover-img" src="${mainImg}" onerror="this.onerror=null; this.src='${defaultImg}';" width="500" height="669">
                                </div>
                            </div>
                            <!-- Image 2 (hover view) -->
                            <div class="absolute-inset-0 opacity-0 hover-opacity-100">
                                <div class="size-full">
                                    <img loading="lazy" alt="${produto.nome} em outro ângulo" class="object-cover-img" src="${fotoHover}" onerror="this.onerror=null; this.src='${defaultHover}';" width="500" height="669">
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
    `;
    }).join('');

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
    requestAnimationFrame(() => {
        btn.style.backgroundColor = targetColor;
        btn.style.borderColor = targetColor;
        btn.style.color = 'white';
    });
}

// Read all colors first to prevent layout thrashing (forced reflow)
const buttonColorData = Array.from(filterBtns).map(btn => ({
    btn: btn,
    color: getButtonColor(btn)
}));

// Then apply the styles
buttonColorData.forEach(data => {
    const btn = data.btn;
    const color = data.color;
    // Initialize all buttons with their solid colors
    btn.style.backgroundColor = color;
    btn.style.borderColor = color;
    btn.style.color = 'white';

    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        
        const activeBtn = e.currentTarget;
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
        
        renderizarProdutos(activeBtn.dataset.category);
        
        const catalogoSection = document.getElementById('secao-catalogo');
        if (catalogoSection) {
            catalogoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

// Renderização inicial
document.addEventListener('DOMContentLoaded', async () => {
    // Set initial active button styling
    const activeBtn = document.querySelector('.fun-pill-btn.active');
    if (activeBtn) {
        applyButtonActiveColor(activeBtn);
    }
    await carregarProdutosHome();
    renderizarProdutos();
    inicializarScrollReveal();
    initPullToRefresh();
});

// Pull to refresh effect
function initPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let ptrIndicator = null;
    
    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            currentY = startY;
            isPulling = true;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;

        if (pullDistance > 0 && window.scrollY === 0) {
            if (!ptrIndicator) {
                ptrIndicator = document.createElement('div');
                ptrIndicator.style.position = 'fixed';
                ptrIndicator.style.top = '-50px';
                ptrIndicator.style.left = '0';
                ptrIndicator.style.right = '0';
                ptrIndicator.style.textAlign = 'center';
                ptrIndicator.style.zIndex = '99999';
                ptrIndicator.style.transition = 'transform 0.1s';
                ptrIndicator.innerHTML = '<div style="display:inline-flex; align-items:center; justify-content:center; background:#fff; padding:10px; border-radius:50%; box-shadow:0 3px 10px rgba(0,0,0,0.2); color:#2b7fff; transition: transform 0.2s;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.87-10.74L2 8"/></svg></div>';
                document.body.appendChild(ptrIndicator);
            }
            
            const maxPull = 120;
            const transformY = Math.min(pullDistance, maxPull);
            ptrIndicator.style.transform = `translateY(${transformY}px)`;
            ptrIndicator.firstElementChild.style.transform = `rotate(${transformY * 2}deg) ${pullDistance > 80 ? 'scale(1.1)' : 'scale(1)'}`;
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!isPulling) return;
        isPulling = false;
        const pullDistance = currentY - startY;
        
        if (ptrIndicator) {
            if (pullDistance > 80 && window.scrollY === 0) {
                // Trigger refresh
                ptrIndicator.style.transition = 'transform 0.3s ease';
                ptrIndicator.style.transform = `translateY(70px)`;
                ptrIndicator.firstElementChild.style.transform = 'rotate(720deg) scale(1.1)';
                setTimeout(() => {
                    location.reload();
                }, 400);
            } else {
                // Cancel
                ptrIndicator.style.transition = 'transform 0.3s ease';
                ptrIndicator.style.transform = `translateY(0)`;
                setTimeout(() => {
                    if (ptrIndicator && ptrIndicator.parentNode) {
                        ptrIndicator.parentNode.removeChild(ptrIndicator);
                        ptrIndicator = null;
                    }
                }, 300);
            }
        }
        startY = 0;
        currentY = 0;
    });
}

// Interatividade da Navbar
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.fun-navbar');
    
    // Glassmorphism on scroll
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Intersection Observer for highlighting current section
    const sections = document.querySelectorAll('section[id], main[id], header[id]');
    const navLinks = document.querySelectorAll('.fun-pill-btn');
    
    if (sections.length > 0 && navLinks.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px', // Trigger when section is in the middle of the viewport
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.id;
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && href.includes(`#${activeId}`)) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => observer.observe(section));
    }
});
