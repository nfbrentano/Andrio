// Configuração inicial / móveis de demonstração com atributos completos
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
        produtos_relacionados: [4] // Linkado com a Mesa Lateral
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
        imagens: ["assets/prod_mesa.webp"],
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

let localProducts = JSON.parse(localStorage.getItem('fun_produtos')) || PRODUTOS_PADRAO;
if (!localStorage.getItem('fun_produtos')) {
    localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
}

let supabaseClient = null;
let isUsingSupabase = false;
let currentGalleryImages = []; // Array com URLs das fotos atuais no form
let currentRelatedProducts = []; // Array com IDs dos produtos de venda casada

// Elementos do DOM
const connectionBanner = document.getElementById('connection-banner');
const productForm = document.getElementById('product-form');
const productTableBody = document.getElementById('products-table-body');
const searchInput = document.getElementById('search-input');
const productCount = document.getElementById('product-count');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const btnLogout = document.getElementById('btn-logout');
const userDisplay = document.getElementById('user-display');
const userEmail = document.getElementById('user-email');

// Campos do Formulário
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productCategoryInput = document.getElementById('product-category');
const productSubheadInput = document.getElementById('product-subhead');
const productAvailabilityInput = document.getElementById('product-availability');
const productDescInput = document.getElementById('product-desc');
const productImageInput = document.getElementById('product-image');
const productColorInput = document.getElementById('product-color');
const productColorPicker = document.getElementById('product-color-picker');

// Novos Campos de Móveis
const productWoodInput = document.getElementById('product-wood');
const productFinishInput = document.getElementById('product-finish');
const productFabricInput = document.getElementById('product-fabric');
const productUpholsteryColorInput = document.getElementById('product-upholstery-color-name');
const productWidthInput = document.getElementById('product-width');
const productDepthInput = document.getElementById('product-depth');
const productHeightInput = document.getElementById('product-height');
const productWeightInput = document.getElementById('product-weight');

// Upload & Galeria
const uploadDropzone = document.getElementById('upload-dropzone');
const imageFileInput = document.getElementById('image-file-input');
const uploadStatus = document.getElementById('upload-status');
const uploadStatusText = document.getElementById('upload-status-text');
const galleryPreview = document.getElementById('gallery-preview');
const btnToggleManualUrl = document.getElementById('btn-toggle-manual-url');
const manualUrlBox = document.getElementById('manual-url-box');

// Venda Casada
const crossSellSelector = document.getElementById('cross-sell-selector');

// Modal de Configuração
const configModal = document.getElementById('config-modal');
const btnConfig = document.getElementById('btn-config');
const closeModal = document.getElementById('close-modal');
const supabaseConfigForm = document.getElementById('supabase-config-form');
const supabaseUrlInput = document.getElementById('supabase-url');
const supabaseKeyInput = document.getElementById('supabase-key');
const btnDisconnect = document.getElementById('btn-disconnect');

// Inicialização do Supabase
function initSupabase() {
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_key');

    if (url && key && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(url, key);
            isUsingSupabase = true;
            
            connectionBanner.className = "status-banner success";
            connectionBanner.querySelector('.icon').textContent = "⚡";
            connectionBanner.querySelector('.message').textContent = `Conectado ao Supabase: ${url}`;
            
            supabaseUrlInput.value = url;
            supabaseKeyInput.value = key;
        } catch (error) {
            console.error("Erro ao inicializar Supabase:", error);
            showToast("Erro ao conectar ao Supabase. Verifique as credenciais.");
            useLocalMode();
        }
    } else {
        useLocalMode();
    }
}

function useLocalMode() {
    supabaseClient = null;
    isUsingSupabase = false;
    connectionBanner.className = "status-banner info";
    connectionBanner.querySelector('.icon').textContent = "⚠️";
    connectionBanner.querySelector('.message').textContent = "Usando banco de dados local (Modo de Demonstração). Configure o Supabase para salvar na nuvem.";
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

// Buscar produtos
async function fetchProducts() {
    if (isUsingSupabase && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('produtos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Erro ao carregar dados do Supabase:", error);
            showToast("Falha ao buscar dados do Supabase. Usando fallback local.");
            return localProducts;
        }
    } else {
        return localProducts;
    }
}

// Renderizar Galeria de Miniaturas no Form
function renderGalleryPreview() {
    galleryPreview.innerHTML = '';
    
    // Garante que o input principal de imagem tenha o valor da primeira foto
    if (currentGalleryImages.length > 0) {
        productImageInput.value = currentGalleryImages[0];
    } else if (productImageInput.value) {
        currentGalleryImages = [productImageInput.value];
    }

    currentGalleryImages.forEach((imgUrl, index) => {
        const isCover = index === 0;
        const card = document.createElement('div');
        card.className = `gallery-thumb-card ${isCover ? 'is-cover' : ''}`;
        card.innerHTML = `
            <img src="${imgUrl}" alt="Foto ${index + 1}">
            ${isCover ? '<span class="badge-cover">Capa</span>' : ''}
            <div class="thumb-actions">
                ${!isCover ? `<button type="button" class="btn-thumb-cover" data-index="${index}">Tornar Capa</button>` : '<span></span>'}
                <button type="button" class="btn-thumb-delete" data-index="${index}">🗑️</button>
            </div>
        `;
        galleryPreview.appendChild(card);
    });

    // Eventos dos botões das miniaturas
    galleryPreview.querySelectorAll('.btn-thumb-cover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index, 10);
            const chosen = currentGalleryImages.splice(idx, 1)[0];
            currentGalleryImages.unshift(chosen); // Coloca como primeira (capa)
            renderGalleryPreview();
        });
    });

    galleryPreview.querySelectorAll('.btn-thumb-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index, 10);
            currentGalleryImages.splice(idx, 1);
            renderGalleryPreview();
        });
    });
}

// Otimizar e Fazer Upload das Fotos
async function handleFilesUpload(files) {
    if (!files || files.length === 0) return;

    uploadStatus.style.display = 'flex';
    uploadStatusText.textContent = `Otimizando ${files.length} imagem(ns) no navegador (WebP)...`;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            uploadStatusText.textContent = `Comprimindo [${i + 1}/${files.length}]: ${file.name}...`;
            const compressed = await ImageOptimizer.compressToWebP(file);
            
            const origKB = (compressed.originalSize / 1024).toFixed(0);
            const compKB = (compressed.compressedSize / 1024).toFixed(0);
            const reduction = Math.round((1 - compressed.compressedSize / compressed.originalSize) * 100);

            if (isUsingSupabase && supabaseClient) {
                uploadStatusText.textContent = `Enviando para Supabase Storage (${compKB} KB, -${reduction}%)...`;
                const publicUrl = await ImageOptimizer.uploadToSupabase(compressed.blob, compressed.name, supabaseClient);
                currentGalleryImages.push(publicUrl);
            } else {
                // Modo offline / demonstração -> usa Data URL gerada
                const dataUrl = await new Promise(r => {
                    const reader = new FileReader();
                    reader.onload = (e) => r(e.target.result);
                    reader.readAsDataURL(compressed.blob);
                });
                currentGalleryImages.push(dataUrl);
            }
        } catch (err) {
            console.error("Erro no processamento da imagem:", err);
            showToast(`Erro na imagem ${file.name}: ${err.message}`);
        }
    }

    uploadStatus.style.display = 'none';
    renderGalleryPreview();
    showToast("Fotos processadas com sucesso!");
}

// Renderizar Seletor de Venda Casada / Cross-sell
async function renderCrossSellSelector(currentEditingId = null) {
    const products = await fetchProducts();
    const otherProducts = products.filter(p => p.id != currentEditingId);

    if (otherProducts.length === 0) {
        crossSellSelector.innerHTML = '<p class="empty-state-text">Nenhum outro móvel para vincular ainda.</p>';
        return;
    }

    crossSellSelector.innerHTML = '';
    otherProducts.forEach(p => {
        const isSelected = currentRelatedProducts.includes(Number(p.id)) || currentRelatedProducts.includes(String(p.id));
        const item = document.createElement('div');
        item.className = `cross-sell-item ${isSelected ? 'selected' : ''}`;
        item.dataset.id = p.id;
        item.innerHTML = `
            <img src="${p.img}" alt="${p.nome}">
            <div class="cross-sell-info">
                <strong>${p.nome}</strong>
                <span>${p.preco} • ${p.categoria}</span>
            </div>
            <span class="cross-sell-check">${isSelected ? '✓' : '+'}</span>
        `;

        item.addEventListener('click', () => {
            const numId = Number(p.id);
            const idx = currentRelatedProducts.indexOf(numId);
            if (idx > -1) {
                currentRelatedProducts.splice(idx, 1);
            } else {
                currentRelatedProducts.push(numId);
            }
            renderCrossSellSelector(currentEditingId);
        });

        crossSellSelector.appendChild(item);
    });
}

// Renderizar Tabela de Produtos
async function renderTable() {
    const query = searchInput.value.toLowerCase();
    const products = await fetchProducts();
    
    if (isUsingSupabase) {
        localStorage.setItem('fun_produtos', JSON.stringify(products));
    }

    const filtered = products.filter(p => 
        p.nome.toLowerCase().includes(query) || 
        p.categoria.toLowerCase().includes(query) ||
        (p.tipo_madeira && p.tipo_madeira.toLowerCase().includes(query)) ||
        (p.material_estofado && p.material_estofado.toLowerCase().includes(query))
    );

    productCount.textContent = `${filtered.length} produto(s)`;
    productTableBody.innerHTML = '';

    if (filtered.length === 0) {
        productTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #8b949e; padding: 30px 0;">
                    Nenhum móvel cadastrado ou encontrado.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(p => {
        const galleryCount = (p.imagens && p.imagens.length) || 1;
        const relatedCount = (p.produtos_relacionados && p.produtos_relacionados.length) || 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${p.img}" alt="${p.nome}" class="table-img-preview" onerror="this.src='assets/prod_poltrona.webp'">
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="background-color: ${p.color || '#2b7fff'}; display: inline-block; width: 10px; height: 10px; border-radius: 50%;"></span>
                        <strong>${p.nome}</strong>
                    </div>
                    <small style="color: #8b949e;">${p.tipo_madeira || 'Madeira maciça'} • ${p.material_estofado || 'Tecido'}</small>
                </div>
            </td>
            <td style="text-transform: capitalize;">${p.categoria}</td>
            <td style="font-weight: 600;">${p.preco}</td>
            <td><span class="badge">📸 ${galleryCount}</span></td>
            <td><span class="badge">🔗 ${relatedCount} vinculado(s)</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" data-id="${p.id}" title="Editar Móvel">✏️</button>
                    <button class="action-btn delete" data-id="${p.id}" title="Excluir Móvel">🗑️</button>
                </div>
            </td>
        `;
        productTableBody.appendChild(tr);
    });

    // Eventos de Ação
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            await prepareEdit(id);
        });
    });

    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (confirm("Deseja realmente remover este móvel do catálogo?")) {
                await deleteProduct(id);
            }
        });
    });
}

// Preparar formulário para edição
async function prepareEdit(id) {
    const products = await fetchProducts();
    const item = products.find(p => p.id == id);
    if (!item) return;

    productIdInput.value = item.id;
    productNameInput.value = item.nome;
    productPriceInput.value = item.preco;
    productCategoryInput.value = item.categoria;
    productSubheadInput.value = item.subhead || '';
    productAvailabilityInput.value = item.disponibilidade || 'pronta_entrega';
    productDescInput.value = item.desc || '';
    productImageInput.value = item.img;
    productColorInput.value = item.color || '#2b7fff';
    productColorPicker.value = item.color || '#2b7fff';

    productWoodInput.value = item.tipo_madeira || 'Nogueira Nobre';
    productFinishInput.value = item.acabamento || 'Verniz PU Acetinado Fosco';
    productFabricInput.value = item.material_estofado || 'Veludo Italiano Nobre';
    productUpholsteryColorInput.value = item.cor_estofado || '';
    productWidthInput.value = item.largura_cm || '';
    productDepthInput.value = item.profundidade_cm || '';
    productHeightInput.value = item.altura_cm || '';
    productWeightInput.value = item.peso_kg || '';

    // Carrega galeria de fotos
    currentGalleryImages = Array.isArray(item.imagens) && item.imagens.length > 0 
        ? [...item.imagens] 
        : [item.img];
    renderGalleryPreview();

    // Carrega itens de venda casada
    currentRelatedProducts = Array.isArray(item.produtos_relacionados) 
        ? [...item.produtos_relacionados.map(Number)] 
        : [];
    await renderCrossSellSelector(item.id);

    formTitle.textContent = "Editar Móvel";
    btnSubmit.textContent = "Atualizar Móvel";
    btnCancel.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Resetar formulário
function resetForm() {
    productIdInput.value = '';
    productForm.reset();
    currentGalleryImages = [];
    currentRelatedProducts = [];
    renderGalleryPreview();
    renderCrossSellSelector();
    formTitle.textContent = "Cadastrar Novo Móvel";
    btnSubmit.textContent = "Salvar Móvel";
    btnCancel.style.display = "none";
    productColorInput.value = "#2b7fff";
    productColorPicker.value = "#2b7fff";
}

// Submeter Formulário (Criar / Editar)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (currentGalleryImages.length === 0 && !productImageInput.value) {
        showToast("Por favor, adicione pelo menos uma foto para o móvel.");
        return;
    }

    const id = productIdInput.value;
    const nome = productNameInput.value.trim();
    const preco = productPriceInput.value.trim();
    const categoria = productCategoryInput.value;
    const subhead = productSubheadInput.value.trim() || 'Design Autoral PACO';
    const disponibilidade = productAvailabilityInput.value;
    const desc = productDescInput.value.trim() || 'Peça exclusiva de design autoral em materiais nobres.';
    const color = productColorInput.value;

    const mainImg = currentGalleryImages.length > 0 ? currentGalleryImages[0] : productImageInput.value;
    const gallery = currentGalleryImages.length > 0 ? currentGalleryImages : [mainImg];

    const productData = {
        nome,
        preco,
        categoria,
        subhead,
        desc,
        disponibilidade,
        img: mainImg,
        imagens: gallery,
        color,
        bg: color,
        tipo_madeira: productWoodInput.value,
        acabamento: productFinishInput.value,
        material_estofado: productFabricInput.value,
        cor_estofado: productUpholsteryColorInput.value.trim() || null,
        largura_cm: productWidthInput.value ? parseFloat(productWidthInput.value) : null,
        profundidade_cm: productDepthInput.value ? parseFloat(productDepthInput.value) : null,
        altura_cm: productHeightInput.value ? parseFloat(productHeightInput.value) : null,
        peso_kg: productWeightInput.value ? parseFloat(productWeightInput.value) : null,
        produtos_relacionados: currentRelatedProducts
    };

    if (isUsingSupabase && supabaseClient) {
        try {
            if (id) {
                const { error } = await supabaseClient
                    .from('produtos')
                    .update(productData)
                    .eq('id', id);
                if (error) throw error;
                showToast("Móvel atualizado no Supabase!");
            } else {
                const { error } = await supabaseClient
                    .from('produtos')
                    .insert([productData]);
                if (error) throw error;
                showToast("Móvel cadastrado no Supabase!");
            }
        } catch (error) {
            console.error("Erro na operação do Supabase:", error);
            showToast(`Erro ao salvar no Supabase: ${error.message}`);
            return;
        }
    } else {
        // Modo LocalStorage
        if (id) {
            const index = localProducts.findIndex(p => p.id == id);
            if (index !== -1) {
                localProducts[index] = { ...localProducts[index], ...productData };
            }
            showToast("Móvel atualizado localmente!");
        } else {
            const newId = localProducts.length > 0 ? Math.max(...localProducts.map(p => Number(p.id))) + 1 : 1;
            localProducts.push({ id: newId, ...productData });
            showToast("Móvel cadastrado localmente!");
        }
        localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
    }

    resetForm();
    await renderTable();
});

// Remover Produto
async function deleteProduct(id) {
    if (isUsingSupabase && supabaseClient) {
        try {
            const { error } = await supabaseClient
                .from('produtos')
                .delete()
                .eq('id', id);
            if (error) throw error;
            showToast("Móvel excluído do Supabase!");
        } catch (error) {
            console.error("Erro ao deletar no Supabase:", error);
            showToast("Erro ao excluir do Supabase.");
            return;
        }
    } else {
        localProducts = localProducts.filter(p => p.id != id);
        localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
        showToast("Móvel removido localmente!");
    }

    await renderTable();
}

// Configurações do Supabase
supabaseConfigForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();

    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);

    configModal.classList.remove('open');
    initSupabase();
    renderTable();
    renderCrossSellSelector();
    showToast("Supabase conectado com sucesso!");
});

btnDisconnect.addEventListener('click', () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    supabaseUrlInput.value = '';
    supabaseKeyInput.value = '';
    configModal.classList.remove('open');
    useLocalMode();
    renderTable();
    renderCrossSellSelector();
    showToast("Desconectado do Supabase. Usando modo local.");
});

// Upload via Drag and Drop & Input File
uploadDropzone.addEventListener('click', () => imageFileInput.click());
imageFileInput.addEventListener('change', (e) => handleFilesUpload(e.target.files));

uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.classList.add('dragover');
});

uploadDropzone.addEventListener('dragleave', () => {
    uploadDropzone.classList.remove('dragover');
});

uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove('dragover');
    handleFilesUpload(e.dataTransfer.files);
});

// Toggle URL Manual
btnToggleManualUrl.addEventListener('click', () => {
    manualUrlBox.style.display = manualUrlBox.style.display === 'none' ? 'block' : 'none';
});

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const url = e.target.dataset.url;
        currentGalleryImages.push(url);
        renderGalleryPreview();
    });
});

// Seleção de Cores
productColorPicker.addEventListener('input', (e) => {
    productColorInput.value = e.target.value;
});

productColorInput.addEventListener('input', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        productColorPicker.value = e.target.value;
    }
});

document.querySelectorAll('.swatch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        productColorInput.value = color;
        productColorPicker.value = color;
    });
});

// Logout
btnLogout.addEventListener('click', async () => {
    if (confirm("Deseja realmente sair do painel administrativo?")) {
        await Auth.signOut();
    }
});

// Modal de Configuração
btnConfig.addEventListener('click', () => configModal.classList.add('open'));
closeModal.addEventListener('click', () => configModal.classList.remove('open'));
window.addEventListener('click', (e) => {
    if (e.target === configModal) configModal.classList.remove('open');
});

searchInput.addEventListener('input', renderTable);
btnCancel.addEventListener('click', resetForm);

// Inicialização Principal com Guard de Autenticação
document.addEventListener('DOMContentLoaded', async () => {
    initSupabase();

    // Verificação de autenticação
    const user = await Auth.requireAuth();
    if (user) {
        userDisplay.style.display = 'inline-flex';
        userEmail.textContent = user.email || 'Admin';
    }

    await renderTable();
    await renderCrossSellSelector();
});
