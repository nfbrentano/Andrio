let produtosAtuais = [];
let sliderInstance = null;

const PRODUTOS_PADRAO = [
    { id: 1, nome: "FUN Shampoo Hidratante", preco: "R$ 89,90", categoria: "shampoo", img: "assets/prod_shampoo.jpg", color: "#2b7fff", subhead: "Fortifying + Balancing", desc: "The perfectly-balanced-cocktail of cleansers — hydration and strength in equal measure", bg: "#4190de" },
    { id: 2, nome: "FUN Condicionador Reconstrutor", preco: "R$ 94,90", categoria: "condicionador", img: "assets/prod_condicionador.jpg", color: "#ff5722", subhead: "Balancing + Moisturizing", desc: "A mid-level conditioner with a just-right blend of hydration and strength", bg: "#fe5100" },
    { id: 3, nome: "FUN Creme de Pentear Leve", preco: "R$ 79,90", categoria: "creme", img: "assets/prod_creme.jpg", color: "#ffeb3b", subhead: "Ultimate definition + Hydration", desc: "A nourishing, pattern-shaping butter for smoother curls and coils", bg: "#ffcd01" },
    { id: 4, nome: "FUN Máscara Nutrição Intensa", preco: "R$ 119,90", categoria: "mascara", img: "assets/prod_mascara.jpg", color: "#9c27b0", subhead: "High shine + Smooth finish", desc: "A lightweight hair oil for instantly silky strands and a glass-shine finish", bg: "#7c55c6" }
];

async function carregarProdutos() {
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_key');
    
    if (url && key) {
        try {
            const supabaseClient = supabase.createClient(url, key);
            const { data, error } = await supabaseClient
                .from('produtos')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (!error && data) {
                // Map values to make sure we have subhead, desc, bg fallback fields
                produtosAtuais = data.map(item => ({
                    ...item,
                    subhead: item.subhead || "Cuidados Especiais",
                    desc: item.desc || "Desenvolvido com ingredientes selecionados para seu cabelo",
                    bg: item.bg || item.color || "#4190de"
                }));
                return;
            }
        } catch (e) {
            console.error("Erro ao conectar ao Supabase:", e);
        }
    }
    
    // Fallback
    const local = localStorage.getItem('fun_produtos');
    produtosAtuais = local ? JSON.parse(local) : PRODUTOS_PADRAO;
    produtosAtuais = produtosAtuais.map(item => ({
        ...item,
        subhead: item.subhead || "Cuidados Especiais",
        desc: item.desc || "Desenvolvido com ingredientes selecionados para seu cabelo",
        bg: item.bg || item.color || "#4190de"
    }));
}

const catalogo = document.getElementById('catalogo');
const filterBtns = document.querySelectorAll('.fun-pill-btn');

function destruirSlider() {
    if (sliderInstance) {
        sliderInstance.destroy();
        sliderInstance = null;
    }
}

function inicializarSlider() {
    destruirSlider();
    if (document.querySelectorAll('#catalogo .keen-slider__slide').length > 0) {
        sliderInstance = new KeenSlider("#catalogo", {
            loop: true,
            mode: "free-snap",
            slides: {
                perView: "auto",
                spacing: 0,
            },
        });
    }
}

function renderizarProdutos(categoria = 'all') {
    destruirSlider();
    catalogo.innerHTML = ''; 
    
    const produtosFiltrados = categoria === 'all' 
        ? produtosAtuais 
        : produtosAtuais.filter(p => p.categoria === categoria);

    if (produtosFiltrados.length === 0) {
        catalogo.innerHTML = '<p style="text-align: center; color: #777; padding: 40px 0; width: 100%;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    produtosFiltrados.forEach((produto) => {
        const slide = document.createElement('div');
        slide.className = 'keen-slider__slide';
        slide.innerHTML = `
            <a class="group relative block" aria-label="${produto.nome}" href="#">
                <div class="aspect-3-4">
                    <div class="aspect-3-4-inner">
                        <div class="size-full">
                            <!-- Image 1 (default view) -->
                            <div class="absolute-inset-0 hover-opacity-0">
                                <div class="size-full">
                                    <img loading="lazy" alt="${produto.nome}" class="object-cover-img" src="${produto.img}">
                                </div>
                            </div>
                            <!-- Image 2 (hover view) -->
                            <div class="absolute-inset-0 opacity-0 hover-opacity-100">
                                <div class="size-full">
                                    <img loading="lazy" alt="${produto.nome} Hover" class="object-cover-img" src="${produto.img}">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Hover description block -->
                <div class="hover-info-panel">
                    <div class="hover-info-content" style="background-color: ${produto.bg || '#ffcd01'}">
                        <p class="type-headings">${produto.subhead}</p>
                        <p class="type-body">${produto.desc}</p>
                    </div>
                </div>
                
                <!-- Pricing & dot footer details -->
                <div class="details-footer">
                    <div class="details-row">
                        <div class="details-left">
                            <div class="dots-container">
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
                        <p class="type-title">${produto.preco}</p>
                    </div>
                </div>
            </a>
        `;
        catalogo.appendChild(slide);
    });

    inicializarSlider();
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => {
            b.classList.remove('active');
            b.style.backgroundColor = 'transparent';
            b.style.color = '#333';
        });
        
        const activeBtn = e.currentTarget;
        activeBtn.classList.add('active');
        
        // Apply color dynamically
        const targetColor = activeBtn.getAttribute('style').match(/--btn-color:\s*(#[a-fA-F0-9]{3,8})/)[1];
        activeBtn.style.backgroundColor = targetColor;
        activeBtn.style.color = (targetColor === '#ffeb3b') ? 'black' : 'white';
        
        renderizarProdutos(activeBtn.dataset.category);
    });
});

// Renderização inicial
document.addEventListener('DOMContentLoaded', async () => {
    // Set initial active button styling
    const activeBtn = document.querySelector('.fun-pill-btn.active');
    if (activeBtn) {
        const targetColor = activeBtn.getAttribute('style').match(/--btn-color:\s*(#[a-fA-F0-9]{3,8})/)[1];
        activeBtn.style.backgroundColor = targetColor;
        activeBtn.style.color = (targetColor === '#ffeb3b') ? 'black' : 'white';
    }
    await carregarProdutos();
    renderizarProdutos();
});
