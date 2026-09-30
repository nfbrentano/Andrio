let localProducts = [];
try {
    const saved = localStorage.getItem('fun_produtos');
    if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
            localProducts = parsed;
        } else {
            localProducts = PRODUTOS_PADRAO;
        }
    } else {
        localProducts = PRODUTOS_PADRAO;
        localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
    }
} catch (e) {
    localProducts = PRODUTOS_PADRAO;
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

// Contatos da Loja - Elementos do DOM (RF04)
const btnContatoConfig = document.getElementById('btn-contato-config');
const btnEditContatoBanner = document.getElementById('btn-edit-contato-banner');
const contatoStatusBanner = document.getElementById('contato-status-banner');
const contatoBannerSummary = document.getElementById('contato-banner-summary');
const btnPreviewWhatsapp = document.getElementById('btn-preview-whatsapp');
const contatoModal = document.getElementById('contato-modal');
const closeContatoModal = document.getElementById('close-contato-modal');
const contatoConfigForm = document.getElementById('contato-config-form');
const contatoWhatsappInput = document.getElementById('contato-whatsapp');
const contatoInstagramInput = document.getElementById('contato-instagram');
const contatoEmailInput = document.getElementById('contato-email');
const whatsappIdFeedback = document.getElementById('whatsapp-id-feedback');
const detectedWhatsappDigits = document.getElementById('detected-whatsapp-digits');
const testWhatsappModalLink = document.getElementById('test-whatsapp-modal-link');
const instagramIdFeedback = document.getElementById('instagram-id-feedback');
const testInstagramModalLink = document.getElementById('test-instagram-modal-link');
const contatoErrorBox = document.getElementById('contato-error-box');
const btnSaveContato = document.getElementById('btn-save-contato');
const btnClearContato = document.getElementById('btn-clear-contato');

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

// Modal Excluir Todos
const btnDeleteAll = document.getElementById('btn-delete-all');
const deleteAllModal = document.getElementById('delete-all-modal');
const closeDeleteAllModal = document.getElementById('close-delete-all-modal');
const btnCancelDeleteAll = document.getElementById('btn-cancel-delete-all');
const btnConfirmDeleteAll = document.getElementById('btn-confirm-delete-all');
const confirmDeleteText = document.getElementById('confirm-delete-text');
const deleteAllCountDisplay = document.getElementById('delete-all-count-display');
const deleteAllStorageType = document.getElementById('delete-all-storage-type');

let currentDriveConfig = null;

// Atualização visual do status de conexão
function updateConnectionStatus() {
    const isConnected = FirebaseService.init();
    const config = FirebaseService.getConfig();

    if (isConnected && config) {
        connectionBanner.className = "status-banner success";
        connectionBanner.querySelector('.icon').textContent = "🔥";
        connectionBanner.querySelector('.message').textContent = `Conectado ao Firebase: ${config.projectId}`;
    } else {
        connectionBanner.className = "status-banner info";
        connectionBanner.querySelector('.icon').textContent = "⚠️";
        connectionBanner.querySelector('.message').textContent = "Conexão com o Firebase indisponível.";
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
    const getTimestamp = typeof parseDataTimestamp === 'function' 
        ? parseDataTimestamp 
        : (val => (val ? new Date(val).getTime() || 0 : 0));

    if (FirebaseService.isConfigured && FirebaseService.db) {
        try {
            // Busca sem orderBy('created_at') para não excluir documentos legados sem o campo (RF03, CA04)
            const snapshot = await FirebaseService.db.collection('produtos').get();

            const items = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });

            // Ordena por created_at desc mantendo produtos sem created_at (RF03, CA04)
            items.sort((a, b) => getTimestamp(b.created_at) - getTimestamp(a.created_at));

            return items;
        } catch (error) {
            console.error("Erro ao carregar dados do Firestore:", error);
            showToast("Falha ao buscar do Firestore. Usando fallback local.");
            return [...localProducts].sort((a, b) => getTimestamp(b.created_at) - getTimestamp(a.created_at));
        }
    } else {
        return [...localProducts].sort((a, b) => getTimestamp(b.created_at) - getTimestamp(a.created_at));
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

// Contatos Oficiais da Loja - Gerenciamento e UI (RF02, RF04)
let currentContatoConfig = null;

async function loadContatoConfig() {
    if (typeof carregarConfiguracaoContato === 'function') {
        currentContatoConfig = await carregarConfiguracaoContato();
    }
    updateContatoUI();
    return currentContatoConfig;
}

function updateContatoUI() {
    if (!currentContatoConfig) {
        if (contatoStatusBanner) contatoStatusBanner.style.display = 'none';
        return;
    }

    const { whatsapp, instagram_url, email } = currentContatoConfig;
    const hasAny = !!(whatsapp || instagram_url || email);

    if (contatoStatusBanner) {
        if (hasAny) {
            contatoStatusBanner.style.display = 'flex';
            const summaryParts = [];
            if (whatsapp) summaryParts.push(`WhatsApp: ${whatsapp}`);
            if (instagram_url) summaryParts.push(`Instagram: ${instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\/?/, '@')}`);
            if (email) summaryParts.push(`E-mail: ${email}`);
            if (contatoBannerSummary) {
                contatoBannerSummary.textContent = summaryParts.join(' | ') || 'Configurado';
            }
            if (btnPreviewWhatsapp) {
                if (whatsapp && typeof validarWhatsApp === 'function' && validarWhatsApp(whatsapp)) {
                    btnPreviewWhatsapp.href = `https://wa.me/${formatarNumeroWhatsApp(whatsapp)}`;
                    btnPreviewWhatsapp.style.display = 'inline-flex';
                } else {
                    btnPreviewWhatsapp.style.display = 'none';
                }
            }
        } else {
            contatoStatusBanner.style.display = 'none';
        }
    }

    if (contatoWhatsappInput && !contatoWhatsappInput.value && whatsapp) {
        contatoWhatsappInput.value = whatsapp;
    }
    if (contatoInstagramInput && !contatoInstagramInput.value && instagram_url) {
        contatoInstagramInput.value = instagram_url;
    }
    if (contatoEmailInput && !contatoEmailInput.value && email) {
        contatoEmailInput.value = email;
    }

    updateContatoInputFeedbacks();
}

function updateContatoInputFeedbacks() {
    if (contatoWhatsappInput && whatsappIdFeedback) {
        const val = contatoWhatsappInput.value.trim();
        if (val && typeof validarWhatsApp === 'function' && validarWhatsApp(val)) {
            whatsappIdFeedback.style.display = 'flex';
            const digits = formatarNumeroWhatsApp(val);
            if (detectedWhatsappDigits) detectedWhatsappDigits.textContent = digits;
            if (testWhatsappModalLink) testWhatsappModalLink.href = `https://wa.me/${digits}`;
        } else {
            whatsappIdFeedback.style.display = 'none';
        }
    }

    if (contatoInstagramInput && instagramIdFeedback) {
        const val = contatoInstagramInput.value.trim();
        if (val && typeof validarInstagram === 'function' && validarInstagram(val)) {
            instagramIdFeedback.style.display = 'flex';
            if (testInstagramModalLink) testInstagramModalLink.href = normalizarUrlInstagram(val);
        } else {
            instagramIdFeedback.style.display = 'none';
        }
    }
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
        const safeImg = escapeHtml(safeUrl(normalized, 'assets/imagem-indisponivel.svg'));
        const isCover = index === 0;
        const card = document.createElement('div');
        card.className = `gallery-thumb-card ${isCover ? 'is-cover' : ''}`;
        card.innerHTML = `
            <img src="${safeImg}" alt="Foto ${index + 1}" data-fallback="assets/imagem-indisponivel.svg" onerror="this.onerror=null; this.src='assets/imagem-indisponivel.svg';">
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
        const defaultImg = getDefaultImageForCategory(p.categoria);
        const safeImg = escapeHtml(safeUrl(p.img, defaultImg));
        const safeNome = escapeHtml(p.nome);
        const safePreco = escapeHtml(p.preco);
        const safeCategoria = escapeHtml(p.categoria);
        const safeId = escapeHtml(String(p.id));

        const item = document.createElement('div');
        item.className = `cross-sell-item ${isSelected ? 'selected' : ''}`;
        item.dataset.id = p.id;
        item.innerHTML = `
            <img src="${safeImg}" alt="${safeNome}" data-fallback="assets/imagem-indisponivel.svg" onerror="this.onerror=null; this.src='assets/imagem-indisponivel.svg';">
            <div class="cross-sell-info">
                <strong>${safeNome}</strong>
                <span>${safePreco} • ${safeCategoria}</span>
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
        const defaultImg = getDefaultImageForCategory(p.categoria);
        const safeImg = escapeHtml(safeUrl(p.img, defaultImg));
        const safeNome = escapeHtml(p.nome);
        const safeColor = sanitizeHexColor(p.color, '#2b7fff');
        const safeTipoMadeira = escapeHtml(p.tipo_madeira || 'Madeira maciça');
        const safeMaterialEstofado = escapeHtml(p.material_estofado || 'Tecido');
        const safeCategoria = escapeHtml(p.categoria);
        const safePreco = escapeHtml(p.preco);
        const safeId = escapeHtml(String(p.id));
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${safeImg}" alt="${safeNome}" class="table-img-preview" data-fallback="assets/imagem-indisponivel.svg" onerror="this.onerror=null; this.src='assets/imagem-indisponivel.svg';">
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="background-color: ${safeColor}; display: inline-block; width: 10px; height: 10px; border-radius: 50%;"></span>
                        <strong>${safeNome}</strong>
                    </div>
                    <small style="color: #8b949e;">${safeTipoMadeira} • ${safeMaterialEstofado}</small>
                </div>
            </td>
            <td style="text-transform: capitalize;">${safeCategoria}</td>
            <td style="font-weight: 600;">${safePreco}</td>
            <td><span class="badge">📸 ${galleryCount}</span></td>
            <td><span class="badge">🔗 ${relatedCount} vinculado(s)</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" data-id="${safeId}" title="Editar Móvel">✏️</button>
                    <button class="action-btn delete" data-id="${safeId}" title="Excluir Móvel">🗑️</button>
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
    productColorInput.value = sanitizeHexColor(item.color, '#2b7fff');
    productColorPicker.value = sanitizeHexColor(item.color, '#2b7fff');

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

    const baseProductData = {
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
        produtos_relacionados: currentRelatedProducts
    };

    const now = new Date().toISOString();

    if (FirebaseService.isConfigured && FirebaseService.db) {
        try {
            if (id) {
                // Edição: preserva created_at existente e registra updated_at (RF01, RF02, CA01)
                const updateData = {
                    ...baseProductData,
                    updated_at: now
                };
                await FirebaseService.db.collection('produtos').doc(id).set(updateData, { merge: true });
                showToast("Móvel atualizado no Firestore!");
            } else {
                // Criação: registra created_at na criação (RF01)
                const newProductData = {
                    ...baseProductData,
                    created_at: now
                };
                await FirebaseService.db.collection('produtos').add(newProductData);
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
                const existing = localProducts[index];
                localProducts[index] = {
                    ...existing,
                    ...baseProductData,
                    updated_at: now
                };
                if (existing.created_at) {
                    localProducts[index].created_at = existing.created_at;
                }
            }
            showToast("Móvel atualizado localmente!");
        } else {
            const newId = "local_" + Date.now();
            localProducts.push({
                id: newId,
                ...baseProductData,
                created_at: now
            });
            showToast("Móvel cadastrado localmente!");
        }
        localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
    }

    // Avisar ao salvar se alguma imagem da galeria ainda aponta para o Drive (RF04, CA05)
    const hasDriveImages = gallery.some(url => isGoogleDriveUrl(url)) || isGoogleDriveUrl(mainImg);
    if (hasDriveImages) {
        setTimeout(() => {
            showToast("⚠️ Aviso: Este móvel possui imagens no Google Drive e pode sofrer bloqueio (HTTP 429). Recomendamos migrá-las para o Firebase Storage.", 6000);
        }, 1200);
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

    if (productIdInput.value === String(id)) {
        resetForm();
    }
    await renderTable();
    await renderCrossSellSelector();
}

// Modal & Ação de Exclusão em Massa (Excluir Todos os Móveis)
function openDeleteAllModal(count, storageType) {
    if (deleteAllCountDisplay) deleteAllCountDisplay.textContent = `${count} móvel(is)`;
    if (deleteAllStorageType) deleteAllStorageType.textContent = storageType;
    if (confirmDeleteText) confirmDeleteText.value = '';
    if (btnConfirmDeleteAll) {
        btnConfirmDeleteAll.disabled = true;
        btnConfirmDeleteAll.textContent = "Sim, Excluir Todos Definitivamente";
    }
    if (deleteAllModal) {
        deleteAllModal.classList.add('open');
        deleteAllModal.setAttribute('aria-hidden', 'false');
    }
    if (confirmDeleteText) {
        setTimeout(() => confirmDeleteText.focus(), 150);
    }
}

function closeMassDeleteModal() {
    if (deleteAllModal) {
        deleteAllModal.classList.remove('open');
        deleteAllModal.setAttribute('aria-hidden', 'true');
    }
    if (confirmDeleteText) confirmDeleteText.value = '';
    if (btnConfirmDeleteAll) btnConfirmDeleteAll.disabled = true;
}

if (btnDeleteAll) {
    btnDeleteAll.addEventListener('click', async () => {
        const products = await fetchProducts();
        if (!products || products.length === 0) {
            showToast("Não há nenhum móvel cadastrado para excluir.");
            return;
        }
        const storageType = (FirebaseService.isConfigured && FirebaseService.db) ? 'Nuvem Firestore' : 'Armazenamento Local';
        openDeleteAllModal(products.length, storageType);
    });
}

if (closeDeleteAllModal) {
    closeDeleteAllModal.addEventListener('click', closeMassDeleteModal);
}

if (btnCancelDeleteAll) {
    btnCancelDeleteAll.addEventListener('click', closeMassDeleteModal);
}

if (deleteAllModal) {
    deleteAllModal.addEventListener('click', (e) => {
        if (e.target === deleteAllModal) closeMassDeleteModal();
    });
}

if (confirmDeleteText) {
    confirmDeleteText.addEventListener('input', () => {
        const val = confirmDeleteText.value.trim().toUpperCase();
        if (btnConfirmDeleteAll) {
            btnConfirmDeleteAll.disabled = (val !== 'EXCLUIR');
        }
    });

    confirmDeleteText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && confirmDeleteText.value.trim().toUpperCase() === 'EXCLUIR') {
            e.preventDefault();
            if (btnConfirmDeleteAll && !btnConfirmDeleteAll.disabled) {
                btnConfirmDeleteAll.click();
            }
        }
    });
}

if (btnConfirmDeleteAll) {
    btnConfirmDeleteAll.addEventListener('click', async () => {
        if (confirmDeleteText.value.trim().toUpperCase() !== 'EXCLUIR') return;

        btnConfirmDeleteAll.disabled = true;
        btnConfirmDeleteAll.textContent = "Excluindo móveis...";

        try {
            if (FirebaseService.isConfigured && FirebaseService.db) {
                const snapshot = await FirebaseService.db.collection('produtos').get();
                const docs = snapshot.docs;

                // Batches do Firestore suportam até 500 operações por lote
                const batchSize = 400;
                for (let i = 0; i < docs.length; i += batchSize) {
                    const batch = FirebaseService.db.batch();
                    const chunk = docs.slice(i, i + batchSize);
                    chunk.forEach(doc => batch.delete(doc.ref));
                    await batch.commit();
                }

                localProducts = [];
                localStorage.setItem('fun_produtos', JSON.stringify([]));
                showToast("Todos os móveis foram excluídos do Firestore!");
            } else {
                localProducts = [];
                localStorage.setItem('fun_produtos', JSON.stringify([]));
                showToast("Todos os móveis locais foram excluídos!");
            }

            resetForm();
            closeMassDeleteModal();
            await renderTable();
            await renderCrossSellSelector();
        } catch (error) {
            console.error("Erro ao excluir todos os móveis:", error);
            showToast("Erro ao excluir móveis: " + error.message);
        } finally {
            if (btnConfirmDeleteAll) {
                btnConfirmDeleteAll.textContent = "Sim, Excluir Todos Definitivamente";
                btnConfirmDeleteAll.disabled = true;
            }
        }
    });
}


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
    btnAddManualImage.addEventListener('click', async () => {
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

        // Se for um link do Google Drive, baixa, converte para WebP e envia para o Storage (RF02, CA03)
        if (isGoogleDriveUrl(rawUrl)) {
            const originalBtnText = btnAddManualImage.textContent;
            btnAddManualImage.disabled = true;
            btnAddManualImage.textContent = 'Otimizando...';
            if (uploadStatus && uploadStatusText) {
                uploadStatus.style.display = 'flex';
                uploadStatusText.textContent = 'Baixando foto do Google Drive e convertendo para WebP...';
            }

            try {
                const optimizedUrl = await ImageOptimizer.optimizeAndUploadUrl(rawUrl, 'drive_foto');
                currentGalleryImages.push(optimizedUrl);
                productImageUrlInput.value = '';
                renderGalleryPreview();
                showToast("Foto do Drive otimizada e salva no Storage!");
            } catch (err) {
                console.error("Erro ao otimizar foto do Drive:", err);
                const normalized = normalizarUrlImagem(rawUrl);
                currentGalleryImages.push(normalized);
                productImageUrlInput.value = '';
                renderGalleryPreview();
                showToast(`Foto adicionada com link direto: ${err.message}`);
            } finally {
                btnAddManualImage.disabled = false;
                btnAddManualImage.textContent = originalBtnText;
                if (uploadStatus) uploadStatus.style.display = 'none';
            }
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

// Importador em lote de fotos do Google Drive (RF02, CA03)
if (btnImportBulkDrive && bulkDriveUrls) {
    btnImportBulkDrive.addEventListener('click', async () => {
        const rawText = bulkDriveUrls.value.trim();
        if (!rawText) {
            showToast("Cole os links das fotos do Google Drive na caixa de texto.");
            return;
        }

        // Separa por quebra de linha, vírgula ou ponto e vírgula
        const lines = rawText.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) {
            showToast("Nenhum link válido encontrado.");
            return;
        }

        const originalBtnText = btnImportBulkDrive.textContent;
        btnImportBulkDrive.disabled = true;
        btnImportBulkDrive.textContent = 'Importando...';
        if (uploadStatus && uploadStatusText) {
            uploadStatus.style.display = 'flex';
            uploadStatusText.textContent = `Importando ${lines.length} foto(s)...`;
        }

        let addedCount = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            if (uploadStatusText) {
                uploadStatusText.textContent = `Otimizando [${i + 1}/${lines.length}] foto...`;
            }

            if (isGoogleDriveUrl(line)) {
                try {
                    const optimizedUrl = await ImageOptimizer.optimizeAndUploadUrl(line, `drive_lote_${i + 1}`);
                    currentGalleryImages.push(optimizedUrl);
                    addedCount++;
                } catch (err) {
                    console.warn(`Aviso no link [${line}]:`, err);
                    const normalized = normalizarUrlImagem(line);
                    currentGalleryImages.push(normalized);
                    addedCount++;
                }
            } else {
                const normalized = normalizarUrlImagem(line);
                currentGalleryImages.push(normalized);
                addedCount++;
            }
        }

        btnImportBulkDrive.disabled = false;
        btnImportBulkDrive.textContent = originalBtnText;
        if (uploadStatus) uploadStatus.style.display = 'none';

        if (addedCount > 0) {
            bulkDriveUrls.value = '';
            renderGalleryPreview();
            showToast(`${addedCount} foto(s) importada(s) para a galeria!`);
        } else {
            showToast("Nenhum link válido encontrado.");
        }
    });
}

// Modal de Migração de Fotos do Google Drive (RF01, CA01, CA02)
const btnMigrateDrive = document.getElementById('btn-migrate-drive');
const driveMigrationModal = document.getElementById('drive-migration-modal');
const closeMigrateDriveModal = document.getElementById('close-migrate-drive-modal');
const btnCloseMigrationModal = document.getElementById('btn-close-migration-modal');
const btnStartDriveMigration = document.getElementById('btn-start-drive-migration');
const migrationSummaryText = document.getElementById('migration-summary-text');
const migrationProgressBar = document.getElementById('migration-progress-bar');
const migrationProgressInner = document.getElementById('migration-progress-inner');

if (btnMigrateDrive && driveMigrationModal) {
    btnMigrateDrive.addEventListener('click', async () => {
        driveMigrationModal.classList.add('open');
        driveMigrationModal.setAttribute('aria-hidden', 'false');
        if (migrationProgressBar) migrationProgressBar.style.display = 'none';
        
        // Verifica se há produtos com URLs do Drive pendentes
        if (migrationSummaryText) {
            migrationSummaryText.textContent = 'Analisando catálogo de móveis...';
        }
        
        const products = await fetchProducts();
        const pending = products.filter(p => {
            const hasMain = isGoogleDriveUrl(p.img);
            const hasGal = (p.imagens || []).some(u => isGoogleDriveUrl(u));
            return hasMain || hasGal;
        });

        if (migrationSummaryText) {
            if (pending.length === 0) {
                migrationSummaryText.innerHTML = `
                    <span style="color: #25D366; font-weight: 600;">✔ Excelente!</span> 
                    Todos os ${products.length} produto(s) já utilizam fotos otimizadas (Firebase Storage / WebP local). Nenhuma URL pendente do Google Drive.
                `;
                if (btnStartDriveMigration) btnStartDriveMigration.disabled = true;
            } else {
                migrationSummaryText.innerHTML = `
                    Encontrado(s) <strong>${pending.length} móvel(is)</strong> com fotos no Google Drive.<br>
                    Clique abaixo para baixar as fotos originais, converter para WebP e salvar no Storage.
                `;
                if (btnStartDriveMigration) btnStartDriveMigration.disabled = false;
            }
        }
    });
}

if (closeMigrateDriveModal && driveMigrationModal) {
    closeMigrateDriveModal.addEventListener('click', () => {
        driveMigrationModal.classList.remove('open');
        driveMigrationModal.setAttribute('aria-hidden', 'true');
    });
}

if (btnCloseMigrationModal && driveMigrationModal) {
    btnCloseMigrationModal.addEventListener('click', () => {
        driveMigrationModal.classList.remove('open');
        driveMigrationModal.setAttribute('aria-hidden', 'true');
    });
}

if (btnStartDriveMigration) {
    btnStartDriveMigration.addEventListener('click', async () => {
        btnStartDriveMigration.disabled = true;
        btnStartDriveMigration.textContent = 'Migrando...';
        if (migrationProgressBar) migrationProgressBar.style.display = 'block';
        if (migrationProgressInner) migrationProgressInner.style.width = '10%';

        const products = await fetchProducts();
        const pending = products.filter(p => {
            const hasMain = isGoogleDriveUrl(p.img);
            const hasGal = (p.imagens || []).some(u => isGoogleDriveUrl(u));
            return hasMain || hasGal;
        });

        if (pending.length === 0) {
            if (migrationSummaryText) {
                migrationSummaryText.innerHTML = `<span style="color: #25D366; font-weight: 600;">✔ Nenhuma imagem precisa ser migrada.</span>`;
            }
            btnStartDriveMigration.disabled = false;
            btnStartDriveMigration.textContent = '🚀 Iniciar Verificação e Migração';
            return;
        }

        let processed = 0;
        let errors = 0;

        for (let i = 0; i < pending.length; i++) {
            const p = pending[i];
            if (migrationSummaryText) {
                migrationSummaryText.textContent = `Processando [${i + 1}/${pending.length}]: ${p.nome}...`;
            }

            try {
                let newImg = p.img;
                if (isGoogleDriveUrl(p.img)) {
                    newImg = await ImageOptimizer.optimizeAndUploadUrl(p.img, `prod_${p.id}_capa`);
                }

                const newImagens = [];
                const gal = p.imagens || [p.img];
                for (let j = 0; j < gal.length; j++) {
                    const url = gal[j];
                    if (isGoogleDriveUrl(url)) {
                        const optUrl = await ImageOptimizer.optimizeAndUploadUrl(url, `prod_${p.id}_galeria_${j + 1}`);
                        newImagens.push(optUrl);
                    } else {
                        newImagens.push(url);
                    }
                }

                // Atualiza Firestore ou LocalStorage
                if (FirebaseService.isConfigured && FirebaseService.db) {
                    await FirebaseService.db.collection('produtos').doc(String(p.id)).set({
                        img: newImg,
                        imagens: newImagens,
                        updated_at: new Date().toISOString()
                    }, { merge: true });
                } else {
                    const idx = localProducts.findIndex(lp => String(lp.id) === String(p.id));
                    if (idx !== -1) {
                        localProducts[idx].img = newImg;
                        localProducts[idx].imagens = newImagens;
                        localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
                    }
                }

                processed++;
            } catch (err) {
                console.error(`Erro ao migrar ${p.nome}:`, err);
                errors++;
            }

            const pct = Math.round(((i + 1) / pending.length) * 100);
            if (migrationProgressInner) migrationProgressInner.style.width = `${pct}%`;
        }

        await renderTable();
        btnStartDriveMigration.disabled = false;
        btnStartDriveMigration.textContent = '🚀 Iniciar Verificação e Migração';
        if (migrationSummaryText) {
            migrationSummaryText.innerHTML = `
                <span style="color: #25D366; font-weight: 600;">✔ Sucesso!</span> 
                ${processed} produto(s) migrado(s) para WebP / Storage.${errors > 0 ? ` (${errors} aviso(s))` : ''}
            `;
        }
        showToast("Migração de imagens concluída com sucesso!");
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
            const targetUrl = val.startsWith('http') ? val : `https://drive.google.com/drive/folders/${folderId}`;
            testDriveLink.href = safeUrl(targetUrl, '#');
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

// Modal de Contatos - Eventos e Validação (RF04, CA04)
if (btnContatoConfig && contatoModal) {
    btnContatoConfig.addEventListener('click', () => {
        if (currentContatoConfig) {
            if (contatoWhatsappInput) contatoWhatsappInput.value = currentContatoConfig.whatsapp || '';
            if (contatoInstagramInput) contatoInstagramInput.value = currentContatoConfig.instagram_url || '';
            if (contatoEmailInput) contatoEmailInput.value = currentContatoConfig.email || '';
            updateContatoInputFeedbacks();
        }
        if (contatoErrorBox) contatoErrorBox.style.display = 'none';
        contatoModal.classList.add('open');
    });
}

if (btnEditContatoBanner && contatoModal) {
    btnEditContatoBanner.addEventListener('click', () => {
        if (btnContatoConfig) btnContatoConfig.click();
    });
}

if (closeContatoModal && contatoModal) {
    closeContatoModal.addEventListener('click', () => contatoModal.classList.remove('open'));
}

window.addEventListener('click', (e) => {
    if (e.target === contatoModal) contatoModal.classList.remove('open');
});

if (contatoWhatsappInput) {
    contatoWhatsappInput.addEventListener('input', () => {
        updateContatoInputFeedbacks();
        if (contatoErrorBox) contatoErrorBox.style.display = 'none';
    });
}

if (contatoInstagramInput) {
    contatoInstagramInput.addEventListener('input', () => {
        updateContatoInputFeedbacks();
        if (contatoErrorBox) contatoErrorBox.style.display = 'none';
    });
}

if (contatoConfigForm) {
    contatoConfigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (contatoErrorBox) {
            contatoErrorBox.style.display = 'none';
            contatoErrorBox.textContent = '';
        }

        const rawWhatsapp = (contatoWhatsappInput ? contatoWhatsappInput.value : '').trim();
        const rawInstagram = (contatoInstagramInput ? contatoInstagramInput.value : '').trim();
        const rawEmail = (contatoEmailInput ? contatoEmailInput.value : '').trim();

        // Validação CA04: número inválido exibe erro de validação e NADA é gravado
        if (rawWhatsapp && typeof validarWhatsApp === 'function' && !validarWhatsApp(rawWhatsapp)) {
            const errorMsg = 'Número de WhatsApp comercial inválido. Digite um número válido no formato internacional E.164 (ex: +5511999998888 ou 5511999998888).';
            if (contatoErrorBox) {
                contatoErrorBox.textContent = errorMsg;
                contatoErrorBox.style.display = 'block';
            }
            showToast(errorMsg);
            return;
        }

        if (rawInstagram && typeof validarInstagram === 'function' && !validarInstagram(rawInstagram)) {
            const errorMsg = 'Perfil do Instagram inválido. Digite uma URL válida ou @usuario (ex: https://instagram.com/pacomoveis ou @pacomoveis).';
            if (contatoErrorBox) {
                contatoErrorBox.textContent = errorMsg;
                contatoErrorBox.style.display = 'block';
            }
            showToast(errorMsg);
            return;
        }

        if (rawEmail && typeof validarEmail === 'function' && !validarEmail(rawEmail)) {
            const errorMsg = 'E-mail de atendimento inválido (ex: contato@pacomoveis.com.br).';
            if (contatoErrorBox) {
                contatoErrorBox.textContent = errorMsg;
                contatoErrorBox.style.display = 'block';
            }
            showToast(errorMsg);
            return;
        }

        try {
            const saved = await salvarConfiguracaoContato(
                (FirebaseService.isConfigured && FirebaseService.db) ? FirebaseService.db : null,
                {
                    whatsapp: rawWhatsapp,
                    instagram_url: rawInstagram,
                    email: rawEmail
                }
            );
            currentContatoConfig = saved;
            updateContatoUI();
            if (contatoModal) contatoModal.classList.remove('open');
            showToast('Contatos oficiais da loja salvos com sucesso!');
        } catch (err) {
            if (contatoErrorBox) {
                contatoErrorBox.textContent = err.message;
                contatoErrorBox.style.display = 'block';
            }
            showToast(err.message);
        }
    });
}

if (btnClearContato) {
    btnClearContato.addEventListener('click', async () => {
        if (confirm("Deseja remover as configurações de contato da loja?")) {
            if (FirebaseService.isConfigured && FirebaseService.db) {
                try {
                    await FirebaseService.db.collection('configuracoes').doc('contato').delete();
                } catch (e) {
                    console.error('Erro ao deletar configuracoes/contato:', e);
                }
            }
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(CONTATO_CACHE_KEY);
            }
            currentContatoConfig = null;
            if (contatoWhatsappInput) contatoWhatsappInput.value = '';
            if (contatoInstagramInput) contatoInstagramInput.value = '';
            if (contatoEmailInput) contatoEmailInput.value = '';
            updateContatoUI();
            if (contatoModal) contatoModal.classList.remove('open');
            showToast('Configurações de contatos removidas.');
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

searchInput.addEventListener('input', renderTable);
btnCancel.addEventListener('click', resetForm);

// Inicialização Principal com Guard de Autenticação (RF04, RF06, CA04)
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Guard de autenticação antes de qualquer carregamento de dados
    const user = await Auth.requireAuth();
    if (!user) {
        return;
    }

    // 2. Revela o painel apenas após autenticação confirmada
    document.body.classList.add('authenticated');
    userDisplay.style.display = 'inline-flex';
    userEmail.textContent = user.email || 'Admin';

    // 3. Atualizar conexão e carregar dados
    updateConnectionStatus();
    await loadDriveConfig();
    await loadContatoConfig();
    await renderTable();
    await renderCrossSellSelector();
});
