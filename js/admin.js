// Configuração inicial / móveis de demonstração com atributos completos
const PRODUTOS_PADRAO = [
    { 
        id: "demo_1", 
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
        produtos_relacionados: ["demo_4"]
    },
    { 
        id: "demo_2", 
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
        produtos_relacionados: ["demo_1", "demo_4"]
    },
    { 
        id: "demo_3", 
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
        produtos_relacionados: ["demo_4"]
    },
    { 
        id: "demo_4", 
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
        produtos_relacionados: ["demo_1", "demo_2"]
    }
];

let localProducts = [];
try {
    const saved = localStorage.getItem('fun_produtos');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
            localProducts = parsed;
        }
    }
} catch (e) {}

if (localProducts.length === 0) {
    localProducts = PRODUTOS_PADRAO;
    localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
}

let currentGalleryImages = [];
let currentRelatedProducts = [];

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

// Modal de Configuração Firebase
const configModal = document.getElementById('config-modal');
const btnConfig = document.getElementById('btn-config');
const closeModal = document.getElementById('close-modal');
const firebaseConfigForm = document.getElementById('firebase-config-form');
const adminFirebaseJson = document.getElementById('admin-firebase-json');
const btnDisconnect = document.getElementById('btn-disconnect');

// Google Drive - Elementos do DOM
const btnDriveConfig = document.getElementById('btn-drive-config');
const driveModal = document.getElementById('drive-modal');
const closeDriveModal = document.getElementById('close-drive-modal');
const driveConfigForm = document.getElementById('drive-config-form');
const driveFolderUrlInput = document.getElementById('drive-folder-url');
const driveFolderNameInput = document.getElementById('drive-folder-name');
const driveIdFeedback = document.getElementById('drive-id-feedback');
const detectedDriveId = document.getElementById('detected-drive-id');
const testDriveLink = document.getElementById('test-drive-link');
const btnSaveDrive = document.getElementById('btn-save-drive');
const btnClearDrive = document.getElementById('btn-clear-drive');

// Google Drive - Banners e Helpers
const driveFolderBanner = document.getElementById('drive-folder-banner');
const driveBannerName = document.getElementById('drive-banner-name');
const btnOpenDriveFolder = document.getElementById('btn-open-drive-folder');
const btnEditDriveFolder = document.getElementById('btn-edit-drive-folder');
const driveCurrentFolderText = document.getElementById('drive-current-folder-text');
const driveQuickOpenLink = document.getElementById('drive-quick-open-link');

// Importador em Lote e Pasta do Móvel
const bulkDriveUrls = document.getElementById('bulk-drive-urls');
const btnImportBulkDrive = document.getElementById('btn-import-bulk-drive');
const productDriveFolderInput = document.getElementById('product-drive-folder');

let currentDriveConfig = null;

// Atualização visual do status de conexão
function updateConnectionStatus() {
    const isConnected = FirebaseService.init();
    const config = FirebaseService.getConfig();

    if (isConnected && config) {
        connectionBanner.className = "status-banner success";
        connectionBanner.querySelector('.icon').textContent = "🔥";
        connectionBanner.querySelector('.message').textContent = `Conectado ao Firebase: ${config.projectId}`;
        adminFirebaseJson.value = JSON.stringify(config, null, 2);
    } else {
        connectionBanner.className = "status-banner info";
        connectionBanner.querySelector('.icon').textContent = "⚠️";
        connectionBanner.querySelector('.message').textContent = "Usando banco de dados local (Modo de Demonstração). Configure o Firebase para salvar na nuvem.";
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

// Buscar produtos do Firestore ou localStorage
async function fetchProducts() {
    if (FirebaseService.isConfigured && FirebaseService.db) {
        try {
            const snapshot = await FirebaseService.db.collection('produtos')
                .orderBy('created_at', 'desc')
                .get();

            const items = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });

            return items;
        } catch (error) {
            console.error("Erro ao carregar dados do Firestore:", error);
            showToast("Falha ao buscar do Firestore. Usando fallback local.");
            return localProducts;
        }
    } else {
        return localProducts;
    }
}

// Extração de ID de pasta do Google Drive
function extractDriveFolderId(input) {
    if (!input) return null;
    const str = String(input).trim();
    const match = str.match(/folders\/([a-zA-Z0-9_-]+)/) ||
                  str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    if (/^[a-zA-Z0-9_-]{20,}$/.test(str) && !str.includes('/') && !str.includes('.')) {
        return str;
    }
    return null;
}

// Extração de ID de arquivo/foto do Google Drive
function extractDriveFileId(input) {
    if (!input) return null;
    const str = String(input).trim();
    const match = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  str.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                  str.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                  str.match(/thumbnail\?id=([a-zA-Z0-9_-]+)/) ||
                  str.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    if (/^[a-zA-Z0-9_-]{25,}$/.test(str) && !str.includes('/') && !str.includes('.')) {
        return str;
    }
    return null;
}

// Função para normalizar e converter links do Google Drive e URLs externas
function normalizarUrlImagem(url) {
    if (!url) return 'assets/prod_poltrona.webp';
    const trimmed = String(url).trim();

    // Converte links de arquivos/fotos do Google Drive para URL direta de alta definição
    const fileId = extractDriveFileId(trimmed);
    if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
    }

    return trimmed;
}

// Gerenciamento e Persistência da Pasta do Google Drive
async function loadDriveConfig() {
    let config = null;

    if (FirebaseService.isConfigured && FirebaseService.db) {
        try {
            const doc = await FirebaseService.db.collection('configuracoes').doc('google_drive').get();
            if (doc.exists) {
                config = doc.data();
                localStorage.setItem('fun_google_drive_config', JSON.stringify(config));
            }
        } catch (err) {
            console.warn('[Google Drive] Não foi possível carregar do Firestore. Usando cache local.', err);
        }
    }

    if (!config) {
        const saved = localStorage.getItem('fun_google_drive_config');
        if (saved) {
            try { config = JSON.parse(saved); } catch (e) {}
        }
    }

    currentDriveConfig = config;
    updateDriveUI();
    return config;
}

function updateDriveUI() {
    if (currentDriveConfig && currentDriveConfig.folder_url) {
        const folderUrl = currentDriveConfig.folder_url;
        const folderName = currentDriveConfig.folder_name || 'Fotos Móveis PACO';
        const folderId = currentDriveConfig.folder_id || extractDriveFolderId(folderUrl) || '';

        // Atualiza Banner Superior
        if (driveFolderBanner) {
            driveFolderBanner.style.display = 'flex';
            driveBannerName.textContent = folderName;
            btnOpenDriveFolder.href = folderUrl;
        }

        // Atualiza Helper no Formulário
        if (driveCurrentFolderText) {
            driveCurrentFolderText.textContent = folderName;
        }
        if (driveQuickOpenLink) {
            driveQuickOpenLink.href = folderUrl;
            driveQuickOpenLink.style.display = 'inline-flex';
        }

        // Atualiza campos do modal se estiverem vazios
        if (driveFolderUrlInput && !driveFolderUrlInput.value) {
            driveFolderUrlInput.value = folderUrl;
        }
        if (driveFolderNameInput && !driveFolderNameInput.value) {
            driveFolderNameInput.value = folderName;
        }
        if (folderId && driveIdFeedback) {
            driveIdFeedback.style.display = 'flex';
            detectedDriveId.textContent = folderId;
            testDriveLink.href = folderUrl;
        }
    } else {
        if (driveFolderBanner) driveFolderBanner.style.display = 'none';
        if (driveCurrentFolderText) driveCurrentFolderText.textContent = 'Nenhuma pasta definida';
        if (driveQuickOpenLink) driveQuickOpenLink.style.display = 'none';
        if (driveIdFeedback) driveIdFeedback.style.display = 'none';
    }
}

async function saveDriveConfig(folderUrl, folderName) {
    const trimmedUrl = folderUrl.trim();
    const folderId = extractDriveFolderId(trimmedUrl);

    if (!folderId && !trimmedUrl.startsWith('http')) {
        throw new Error('Por favor, informe uma URL válida da pasta do Google Drive.');
    }

    const fullUrl = trimmedUrl.startsWith('http') 
        ? trimmedUrl 
        : `https://drive.google.com/drive/folders/${folderId}`;

    const configData = {
        folder_url: fullUrl,
        folder_id: folderId || '',
        folder_name: folderName.trim() || 'Fotos Móveis PACO',
        updated_at: new Date().toISOString(),
        updated_by: (FirebaseService.auth && FirebaseService.auth.currentUser && FirebaseService.auth.currentUser.email) || 'admin'
    };

    if (FirebaseService.isConfigured && FirebaseService.db) {
        await FirebaseService.db.collection('configuracoes').doc('google_drive').set(configData, { merge: true });
    }

    localStorage.setItem('fun_google_drive_config', JSON.stringify(configData));
    currentDriveConfig = configData;
    updateDriveUI();
    showToast("Pasta do Google Drive configurada e salva com sucesso!");
}

async function clearDriveConfig() {
    if (FirebaseService.isConfigured && FirebaseService.db) {
        try {
            await FirebaseService.db.collection('configuracoes').doc('google_drive').delete();
        } catch (e) {
            console.error('Erro ao deletar config no Firestore:', e);
        }
    }

    localStorage.removeItem('fun_google_drive_config');
    currentDriveConfig = null;
    if (driveFolderUrlInput) driveFolderUrlInput.value = '';
    if (driveFolderNameInput) driveFolderNameInput.value = '';
    updateDriveUI();
    showToast("Configuração da pasta do Google Drive removida.");
}

// Renderizar Galeria de Miniaturas no Form
function renderGalleryPreview() {
    galleryPreview.innerHTML = '';
    
    if (currentGalleryImages.length > 0) {
        productImageInput.value = currentGalleryImages[0];
    } else if (productImageInput.value) {
        currentGalleryImages = [normalizarUrlImagem(productImageInput.value)];
    }

    currentGalleryImages.forEach((imgUrl, index) => {
        const normalized = normalizarUrlImagem(imgUrl);
        const isCover = index === 0;
        const card = document.createElement('div');
        card.className = `gallery-thumb-card ${isCover ? 'is-cover' : ''}`;
        card.innerHTML = `
            <img src="${normalized}" alt="Foto ${index + 1}" onerror="this.src='assets/prod_poltrona.webp'">
            ${isCover ? '<span class="badge-cover">Capa</span>' : ''}
            <div class="thumb-actions">
                ${!isCover ? `<button type="button" class="btn-thumb-cover" data-index="${index}">Tornar Capa</button>` : '<span></span>'}
                <button type="button" class="btn-thumb-delete" data-index="${index}">🗑️</button>
            </div>
        `;
        galleryPreview.appendChild(card);
    });

    galleryPreview.querySelectorAll('.btn-thumb-cover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index, 10);
            const chosen = currentGalleryImages.splice(idx, 1)[0];
            currentGalleryImages.unshift(chosen);
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

// Otimizar e Fazer Upload das Fotos para o Firebase Storage
async function handleFilesUpload(files) {
    if (!files || files.length === 0) return;

    uploadStatus.style.display = 'flex';
    uploadStatusText.textContent = `Otimizando ${files.length} imagem(ns) no navegador (WebP)...`;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            uploadStatusText.textContent = `Comprimindo [${i + 1}/${files.length}]: ${file.name}...`;
            const compressed = await ImageOptimizer.compressToWebP(file);
            
            const compKB = (compressed.compressedSize / 1024).toFixed(0);
            const reduction = Math.round((1 - compressed.compressedSize / compressed.originalSize) * 100);

            if (FirebaseService.isConfigured && FirebaseService.storage) {
                uploadStatusText.textContent = `Enviando ao Firebase Storage (${compKB} KB, -${reduction}%)...`;
                const publicUrl = await ImageOptimizer.uploadToFirebase(compressed.blob, compressed.name);
                currentGalleryImages.push(publicUrl);
            } else {
                // Modo offline / local
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
    const otherProducts = products.filter(p => String(p.id) !== String(currentEditingId));

    if (otherProducts.length === 0) {
        crossSellSelector.innerHTML = '<p class="empty-state-text">Nenhum outro móvel para vincular ainda.</p>';
        return;
    }

    crossSellSelector.innerHTML = '';
    otherProducts.forEach(p => {
        const isSelected = currentRelatedProducts.includes(String(p.id));
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
            const strId = String(p.id);
            const idx = currentRelatedProducts.indexOf(strId);
            if (idx > -1) {
                currentRelatedProducts.splice(idx, 1);
            } else {
                currentRelatedProducts.push(strId);
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
    
    if (FirebaseService.isConfigured) {
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
    const item = products.find(p => String(p.id) === String(id));
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
    if (productDriveFolderInput) {
        productDriveFolderInput.value = item.pasta_drive_url || '';
    }

    currentGalleryImages = Array.isArray(item.imagens) && item.imagens.length > 0 
        ? [...item.imagens] 
        : [item.img];
    renderGalleryPreview();

    currentRelatedProducts = Array.isArray(item.produtos_relacionados) 
        ? [...item.produtos_relacionados.map(String)] 
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
    if (productDriveFolderInput) productDriveFolderInput.value = '';
    if (bulkDriveUrls) bulkDriveUrls.value = '';
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
        pasta_drive_url: productDriveFolderInput ? productDriveFolderInput.value.trim() || null : null,
        produtos_relacionados: currentRelatedProducts,
        created_at: new Date().toISOString()
    };

    if (FirebaseService.isConfigured && FirebaseService.db) {
        try {
            if (id) {
                await FirebaseService.db.collection('produtos').doc(id).set(productData, { merge: true });
                showToast("Móvel atualizado no Firestore!");
            } else {
                await FirebaseService.db.collection('produtos').add(productData);
                showToast("Móvel cadastrado no Firestore!");
            }
        } catch (error) {
            console.error("Erro na operação do Firestore:", error);
            showToast(`Erro ao salvar no Firestore: ${error.message}`);
            return;
        }
    } else {
        // Modo LocalStorage
        if (id) {
            const index = localProducts.findIndex(p => String(p.id) === String(id));
            if (index !== -1) {
                localProducts[index] = { ...localProducts[index], ...productData };
            }
            showToast("Móvel atualizado localmente!");
        } else {
            const newId = "local_" + Date.now();
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
    if (FirebaseService.isConfigured && FirebaseService.db) {
        try {
            await FirebaseService.db.collection('produtos').doc(id).delete();
            showToast("Móvel excluído do Firestore!");
        } catch (error) {
            console.error("Erro ao deletar no Firestore:", error);
            showToast("Erro ao excluir do Firestore.");
            return;
        }
    } else {
        localProducts = localProducts.filter(p => String(p.id) !== String(id));
        localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
        showToast("Móvel removido localmente!");
    }

    await renderTable();
}

// Configurações do Firebase
firebaseConfigForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawText = adminFirebaseJson.value.trim();

    try {
        let jsonText = rawText;
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) jsonText = match[0];
        
        const parsed = JSON.parse(jsonText);
        FirebaseService.saveConfig(parsed);

        configModal.classList.remove('open');
        updateConnectionStatus();
        renderTable();
        renderCrossSellSelector();
        showToast("Firebase conectado com sucesso!");
    } catch (err) {
        showToast("JSON de configuração inválido.");
    }
});

btnDisconnect.addEventListener('click', () => {
    FirebaseService.clearConfig();
    configModal.classList.remove('open');
    updateConnectionStatus();
    renderTable();
    renderCrossSellSelector();
    showToast("Desconectado do Firebase. Usando modo local.");
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

// Toggle URL Manual & Google Drive
btnToggleManualUrl.addEventListener('click', () => {
    manualUrlBox.style.display = manualUrlBox.style.display === 'none' ? 'block' : 'none';
});

const btnAddManualImage = document.getElementById('btn-add-manual-image');
const productImageUrlInput = document.getElementById('product-image-url-input');

if (btnAddManualImage && productImageUrlInput) {
    btnAddManualImage.addEventListener('click', () => {
        const rawUrl = productImageUrlInput.value.trim();
        if (!rawUrl) {
            showToast("Por favor, cole um link de imagem.");
            return;
        }

        const isFolder = extractDriveFolderId(rawUrl) && !extractDriveFileId(rawUrl);
        if (isFolder) {
            showToast("Você colou o link de uma pasta. Abra a pasta e copie os links das fotos individuais.");
            return;
        }

        const normalized = normalizarUrlImagem(rawUrl);
        currentGalleryImages.push(normalized);
        productImageUrlInput.value = '';
        renderGalleryPreview();
        showToast("Foto adicionada à galeria!");
    });

    productImageUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnAddManualImage.click();
        }
    });
}

// Importador em lote de fotos do Google Drive
if (btnImportBulkDrive && bulkDriveUrls) {
    btnImportBulkDrive.addEventListener('click', () => {
        const rawText = bulkDriveUrls.value.trim();
        if (!rawText) {
            showToast("Cole os links das fotos do Google Drive na caixa de texto.");
            return;
        }

        // Separa por quebra de linha, vírgula ou ponto e vírgula
        const lines = rawText.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean);
        let addedCount = 0;

        lines.forEach(line => {
            if (line) {
                const normalized = normalizarUrlImagem(line);
                currentGalleryImages.push(normalized);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            bulkDriveUrls.value = '';
            renderGalleryPreview();
            showToast(`${addedCount} foto(s) importada(s) para a galeria!`);
        } else {
            showToast("Nenhum link válido encontrado.");
        }
    });
}

// Modal do Google Drive - Eventos
if (btnDriveConfig && driveModal) {
    btnDriveConfig.addEventListener('click', () => {
        if (currentDriveConfig) {
            driveFolderUrlInput.value = currentDriveConfig.folder_url || '';
            driveFolderNameInput.value = currentDriveConfig.folder_name || '';
            const fid = currentDriveConfig.folder_id || extractDriveFolderId(currentDriveConfig.folder_url);
            if (fid) {
                driveIdFeedback.style.display = 'flex';
                detectedDriveId.textContent = fid;
                testDriveLink.href = currentDriveConfig.folder_url;
            }
        }
        driveModal.classList.add('open');
    });
}

if (btnEditDriveFolder && driveModal) {
    btnEditDriveFolder.addEventListener('click', () => {
        btnDriveConfig.click();
    });
}

if (closeDriveModal && driveModal) {
    closeDriveModal.addEventListener('click', () => driveModal.classList.remove('open'));
}

window.addEventListener('click', (e) => {
    if (e.target === driveModal) driveModal.classList.remove('open');
});

// Feedback em tempo real ao digitar a URL da pasta do Drive
if (driveFolderUrlInput) {
    driveFolderUrlInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const folderId = extractDriveFolderId(val);
        if (folderId) {
            driveIdFeedback.style.display = 'flex';
            detectedDriveId.textContent = folderId;
            testDriveLink.href = val.startsWith('http') ? val : `https://drive.google.com/drive/folders/${folderId}`;
        } else {
            driveIdFeedback.style.display = 'none';
        }
    });
}

// Salvar Configuração do Google Drive
if (driveConfigForm) {
    driveConfigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await saveDriveConfig(driveFolderUrlInput.value, driveFolderNameInput.value);
            driveModal.classList.remove('open');
        } catch (err) {
            showToast(err.message);
        }
    });
}

if (btnClearDrive) {
    btnClearDrive.addEventListener('click', async () => {
        if (confirm("Deseja remover a pasta do Google Drive configurada?")) {
            await clearDriveConfig();
            driveModal.classList.remove('open');
        }
    });
}

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

// Modal de Configuração Firebase
btnConfig.addEventListener('click', () => configModal.classList.add('open'));
closeModal.addEventListener('click', () => configModal.classList.remove('open'));
window.addEventListener('click', (e) => {
    if (e.target === configModal) configModal.classList.remove('open');
});

searchInput.addEventListener('input', renderTable);
btnCancel.addEventListener('click', resetForm);

// Inicialização Principal com Guard de Autenticação
document.addEventListener('DOMContentLoaded', async () => {
    updateConnectionStatus();
    await loadDriveConfig();

    const user = await Auth.requireAuth();
    if (user) {
        userDisplay.style.display = 'inline-flex';
        userEmail.textContent = user.email || 'Admin';
    }

    await renderTable();
    await renderCrossSellSelector();
});
