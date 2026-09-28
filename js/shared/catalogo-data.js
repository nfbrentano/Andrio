/**
 * Catálogo Data - Módulo Compartilhado
 * Fonte única da verdade para dados padrão, imagens e carregamento de produtos
 */

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

// Função para normalizar e converter links do Google Drive e URLs em geral
function normalizarUrlImagem(url, categoria) {
    const fallback = categoria ? getDefaultImageForCategory(categoria) : '';
    if (!url || String(url).trim() === '') {
        return fallback;
    }
    const trimmed = String(url).trim();

    let resolved = trimmed;
    const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                       trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                       trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                       trimmed.match(/thumbnail\?id=([a-zA-Z0-9_-]+)/) ||
                       trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
                       
    if (driveMatch && driveMatch[1]) {
        resolved = `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`;
    } else if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('.')) {
        resolved = `https://drive.google.com/thumbnail?id=${trimmed}&sz=w1600`;
    }

    if (typeof safeUrl === 'function') {
        return safeUrl(resolved, fallback);
    }

    return resolved;
}

// Móveis de demonstração com atributos completos (fonte única da verdade)
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
        material_estofado: "Tampo em Mármore Branco Espírito Santo",
        cor_estofado: "Branco Rajado",
        largura_cm: 50,
        profundidade_cm: 50,
        altura_cm: 55,
        peso_kg: 14,
        disponibilidade: "pronta_entrega",
        produtos_relacionados: [1, 2]
    }
];

// Carregamento unificado com suporte a Firestore, LocalStorage e Mock Padrão
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

                return items.map(item => {
                    const safeColor = typeof sanitizeHexColor === 'function' ? sanitizeHexColor(item.color, '#2b7fff') : (item.color || '#2b7fff');
                    const safeBg = typeof sanitizeHexColor === 'function' ? sanitizeHexColor(item.bg, safeColor) : (item.bg || item.color || "#4190de");
                    return {
                        ...item,
                        color: safeColor,
                        bg: safeBg,
                        subhead: item.subhead || "Design Autoral",
                        desc: item.desc || "Peça exclusiva de design autoral em materiais nobres."
                    };
                });
            } catch (e) {
                console.error("[CatalogoData] Erro ao buscar produtos do Firestore:", e);
            }
        }
    }
    
    // Fallback: LocalStorage ou Mock Padrão
    let raw = null;
    try {
        const local = localStorage.getItem('fun_produtos');
        if (local !== null) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
                raw = parsed;
            }
        }
    } catch (e) {
        console.error("[CatalogoData] Erro ao carregar do localStorage:", e);
    }

    if (raw === null) {
        raw = PRODUTOS_PADRAO;
    }

    return raw.map(item => {
        // Normalização de IDs demo legados ("demo_1" -> 1), se houverem
        let itemId = item.id;
        if (itemId === 'demo_1') itemId = 1;
        else if (itemId === 'demo_2') itemId = 2;
        else if (itemId === 'demo_3') itemId = 3;
        else if (itemId === 'demo_4') itemId = 4;

        // Normalização de referências legadas em produtos_relacionados
        let relacionados = item.produtos_relacionados;
        if (Array.isArray(relacionados)) {
            relacionados = relacionados.map(relId => {
                if (relId === 'demo_1') return 1;
                if (relId === 'demo_2') return 2;
                if (relId === 'demo_3') return 3;
                if (relId === 'demo_4') return 4;
                return relId;
            });
        }

        const defaultImg = getDefaultImageForCategory(item.categoria);
        const defaultHover = getDefaultHoverImageForCategory(item.categoria);
        const mainImg = item.img ? normalizarUrlImagem(item.img, item.categoria) : defaultImg;
        let imagens = Array.isArray(item.imagens) && item.imagens.length > 0
            ? item.imagens.filter(Boolean).map(u => normalizarUrlImagem(u, item.categoria))
            : [mainImg, defaultHover];
        if (imagens.length === 0) imagens = [mainImg, defaultHover];

        const safeColor = typeof sanitizeHexColor === 'function' ? sanitizeHexColor(item.color, '#2b7fff') : (item.color || '#2b7fff');
        const safeBg = typeof sanitizeHexColor === 'function' ? sanitizeHexColor(item.bg, safeColor) : (item.bg || item.color || "#4190de");

        return {
            ...item,
            id: itemId,
            produtos_relacionados: relacionados,
            img: mainImg,
            imagens: imagens,
            color: safeColor,
            bg: safeBg,
            subhead: item.subhead || "Design Autoral",
            desc: item.desc || "Peça exclusiva de design autoral em materiais nobres."
        };
    });
}

// Disponibiliza no escopo global
window.CATEGORY_DEFAULT_IMAGES = CATEGORY_DEFAULT_IMAGES;
window.getDefaultImageForCategory = getDefaultImageForCategory;
window.getDefaultHoverImageForCategory = getDefaultHoverImageForCategory;
window.normalizarUrlImagem = normalizarUrlImagem;
window['PRODUTOS_PADRAO'] = PRODUTOS_PADRAO;
window.carregarProdutos = carregarProdutos;
