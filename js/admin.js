// Configuração inicial / fallbacks locais de demonstração
const PRODUTOS_PADRAO = [
    { id: 1, nome: "FUN Shampoo Hidratante", preco: "R$ 89,90", categoria: "shampoo", img: "assets/prod_shampoo.jpg", color: "#2b7fff" },
    { id: 2, nome: "FUN Condicionador Reconstrutor", preco: "R$ 94,90", categoria: "condicionador", img: "assets/prod_condicionador.jpg", color: "#ff5722" },
    { id: 3, nome: "FUN Creme de Pentear Leve", preco: "R$ 79,90", categoria: "creme", img: "assets/prod_creme.jpg", color: "#ffeb3b" },
    { id: 4, nome: "FUN Máscara Nutrição Intensa", preco: "R$ 119,90", categoria: "mascara", img: "assets/prod_mascara.jpg", color: "#9c27b0" }
];

let localProducts = JSON.parse(localStorage.getItem('fun_produtos')) || PRODUTOS_PADRAO;
if (!localStorage.getItem('fun_produtos')) {
    localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
}

let supabaseClient = null;
let isUsingSupabase = false;

// Elementos do DOM
const connectionBanner = document.getElementById('connection-banner');
const productForm = document.getElementById('product-form');
const productTableBody = document.getElementById('products-table-body');
const searchInput = document.getElementById('search-input');
const productCount = document.getElementById('product-count');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');

// Campos do Formulário
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productCategoryInput = document.getElementById('product-category');
const productSubheadInput = document.getElementById('product-subhead');
const productDescInput = document.getElementById('product-desc');
const productImageInput = document.getElementById('product-image');
const productColorInput = document.getElementById('product-color');
const productColorPicker = document.getElementById('product-color-picker');

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

    if (url && key) {
        try {
            // Inicializar cliente globalmente do CDN
            supabaseClient = supabase.createClient(url, key);
            isUsingSupabase = true;
            
            // Atualiza banner
            connectionBanner.className = "status-banner success";
            connectionBanner.querySelector('.icon').textContent = "⚡";
            connectionBanner.querySelector('.message').textContent = `Conectado ao Supabase: ${url}`;
            
            // Popula os inputs do modal
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

// Mostrar notificações flutuantes (toasts)
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Buscar produtos do banco ou localStorage
async function fetchProducts() {
    if (isUsingSupabase) {
        try {
            const { data, error } = await supabaseClient
                .from('produtos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Erro ao carregar dados do Supabase:", error);
            showToast("Falha ao buscar dados do Supabase. Usando fallback local.");
            return localProducts;
        }
    } else {
        return localProducts;
    }
}

// Renderizar tabela de produtos
async function renderTable() {
    const query = searchInput.value.toLowerCase();
    const products = await fetchProducts();
    
    // Salvar localmente em caso de atualização bem-sucedida para fins de compatibilidade
    if (isUsingSupabase) {
        localStorage.setItem('fun_produtos', JSON.stringify(products));
    }

    const filtered = products.filter(p => 
        p.nome.toLowerCase().includes(query) || 
        p.categoria.toLowerCase().includes(query)
    );

    productCount.textContent = `${filtered.length} produto(s)`;
    productTableBody.innerHTML = '';

    if (filtered.length === 0) {
        productTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #666; padding: 30px 0;">
                    Nenhum produto cadastrado ou encontrado.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${p.img}" alt="${p.nome}" class="table-img-preview" onerror="this.src='assets/prod_shampoo.jpg'">
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="fun-card-dot" style="background-color: ${p.color}; display: inline-block; width: 12px; height: 12px; border-radius: 50%;"></span>
                    <strong>${p.nome}</strong>
                </div>
            </td>
            <td style="text-transform: capitalize;">${p.categoria}</td>
            <td>${p.preco}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" data-id="${p.id}" title="Editar">✏️</button>
                    <button class="action-btn delete" data-id="${p.id}" title="Excluir">🗑️</button>
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
            if (confirm("Deseja realmente remover este produto?")) {
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
    productDescInput.value = item.desc || '';
    productImageInput.value = item.img;
    productColorInput.value = item.color;
    productColorPicker.value = item.color;

    formTitle.textContent = "Editar Produto";
    btnSubmit.textContent = "Atualizar Produto";
    btnCancel.style.display = "block";
    productNameInput.focus();
}

// Resetar formulário
function resetForm() {
    productIdInput.value = '';
    productForm.reset();
    formTitle.textContent = "Cadastrar Novo Produto";
    btnSubmit.textContent = "Salvar Produto";
    btnCancel.style.display = "none";
    productColorInput.value = "#2b7fff";
    productColorPicker.value = "#2b7fff";
}

// Adicionar/Atualizar Produto
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = productIdInput.value;
    const nome = productNameInput.value;
    const preco = productPriceInput.value;
    const categoria = productCategoryInput.value;
    const subhead = productSubheadInput.value.trim() || 'Cuidados Especiais';
    const desc = productDescInput.value.trim() || 'Desenvolvido com ingredientes selecionados para seu cabelo';
    const img = productImageInput.value;
    const color = productColorInput.value;

    const productData = { nome, preco, categoria, subhead, desc, img, color, bg: color };

    if (isUsingSupabase) {
        try {
            if (id) {
                // Editar no Supabase
                const { error } = await supabaseClient
                    .from('produtos')
                    .update(productData)
                    .eq('id', id);
                if (error) throw error;
                showToast("Produto atualizado no Supabase!");
            } else {
                // Inserir no Supabase
                const { error } = await supabaseClient
                    .from('produtos')
                    .insert([productData]);
                if (error) throw error;
                showToast("Produto cadastrado no Supabase!");
            }
        } catch (error) {
            console.error("Erro na operação do Supabase:", error);
            showToast("Erro ao salvar no Supabase.");
            return;
        }
    } else {
        // Operação local no localStorage
        if (id) {
            const index = localProducts.findIndex(p => p.id == id);
            if (index !== -1) {
                localProducts[index] = { ...localProducts[index], ...productData };
            }
            showToast("Produto atualizado localmente!");
        } else {
            const newId = localProducts.length > 0 ? Math.max(...localProducts.map(p => p.id)) + 1 : 1;
            localProducts.push({ id: newId, ...productData });
            showToast("Produto cadastrado localmente!");
        }
        localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
    }

    resetForm();
    await renderTable();
});

// Remover Produto
async function deleteProduct(id) {
    if (isUsingSupabase) {
        try {
            const { error } = await supabaseClient
                .from('produtos')
                .delete()
                .eq('id', id);
            if (error) throw error;
            showToast("Produto excluído do Supabase!");
        } catch (error) {
            console.error("Erro ao deletar no Supabase:", error);
            showToast("Erro ao excluir do Supabase.");
            return;
        }
    } else {
        localProducts = localProducts.filter(p => p.id != id);
        localStorage.setItem('fun_produtos', JSON.stringify(localProducts));
        showToast("Produto removido localmente!");
    }

    await renderTable();
}

// Configurar chaves do Supabase
supabaseConfigForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();

    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);

    configModal.classList.remove('open');
    initSupabase();
    renderTable();
    showToast("Supabase conectado com sucesso!");
});

// Desconectar do Supabase
btnDisconnect.addEventListener('click', () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    supabaseUrlInput.value = '';
    supabaseKeyInput.value = '';
    configModal.classList.remove('open');
    useLocalMode();
    renderTable();
    showToast("Desconectado do Supabase. Usando modo de demonstração.");
});

// Eventos de Seleção de Cor
productColorPicker.addEventListener('input', (e) => {
    productColorInput.value = e.target.value;
});

productColorInput.addEventListener('input', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        productColorPicker.value = e.target.value;
    }
});

document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        productColorInput.value = color;
        productColorPicker.value = color;
        
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        e.target.classList.add('active');
    });
});

// Eventos de Presets de Imagem
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        productImageInput.value = e.target.dataset.url;
    });
});

// Busca dinâmica
searchInput.addEventListener('input', renderTable);

// Cancelar Edição
btnCancel.addEventListener('click', resetForm);

// Controle do Modal
btnConfig.addEventListener('click', () => configModal.classList.add('open'));
closeModal.addEventListener('click', () => configModal.classList.remove('open'));
window.addEventListener('click', (e) => {
    if (e.target === configModal) configModal.classList.remove('open');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    renderTable();
});
