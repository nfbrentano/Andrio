/**
 * Contatos Oficiais - Módulo Compartilhado - PACO Móveis
 * Validação, formatação e aplicação dinâmica de contatos (WhatsApp, Instagram, E-mail)
 */

const CONTATO_CACHE_KEY = 'paco_contato_config';

/**
 * Valida se um número de telefone está no formato internacional E.164
 * Aceita opcionalmente prefixo +, seguido de 10 a 15 dígitos.
 * Permite formatação amigável (espaços, hífens, parênteses) desde que não contenha letras ou outros símbolos.
 * @param {string} phone
 * @returns {boolean}
 */
function validarWhatsApp(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const trimmed = phone.trim();
    if (!trimmed) return false;

    // Rejeita qualquer caractere alfabético
    if (/[a-zA-Z]/.test(trimmed)) return false;

    // Permite apenas dígitos, +, espaços, parênteses e hífens
    if (/[^0-9+\s\-()]/.test(trimmed)) return false;

    const digitsOnly = trimmed.replace(/\D/g, '');
    // Padrão internacional E.164: entre 10 e 15 dígitos
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Extrai somente os dígitos do número de WhatsApp para montar o link wa.me
 * @param {string} phone
 * @returns {string} Dígitos numéricos limpos
 */
function formatarNumeroWhatsApp(phone) {
    if (!phone || typeof phone !== 'string') return '';
    return phone.replace(/\D/g, '');
}

/**
 * Valida o perfil ou URL do Instagram
 * Aceita URL completa (https://instagram.com/...), @usuario ou usuario
 * @param {string} input
 * @returns {boolean}
 */
function validarInstagram(input) {
    if (!input || typeof input !== 'string') return false;
    const trimmed = input.trim();
    if (!trimmed) return false;

    // Bloqueia caracteres de controle ou injeções
    if (/[\s"'<>\\]|[\x00-\x1F\x7F]/.test(trimmed)) return false;

    // Se for URL completa, deve ser http(s) e apontar para instagram.com
    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const parsed = new URL(trimmed);
            const host = parsed.hostname.toLowerCase();
            return host === 'instagram.com' || host === 'www.instagram.com';
        } catch (_) {
            return false;
        }
    }

    // Se for formato @usuario ou usuario: letras, números, sublinhados e pontos (1 a 30 caracteres)
    const handle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
    return /^[a-zA-Z0-9._]{1,30}$/.test(handle);
}

/**
 * Normaliza um perfil de Instagram para uma URL completa e segura
 * @param {string} input
 * @returns {string} URL https://www.instagram.com/<usuario> ou vazia se inválido
 */
function normalizarUrlInstagram(input) {
    if (!validarInstagram(input)) return '';
    const trimmed = input.trim();

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    const handle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
    return `https://www.instagram.com/${handle}`;
}

/**
 * Valida formato de e-mail
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();
    if (!trimmed || trimmed.length > 120) return false;
    // Padrão RFC básico de e-mail
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Gera link oficial do WhatsApp (wa.me) para solicitação de orçamento de um produto
 * @param {string} phone - Número de WhatsApp configurado
 * @param {Object} produto - Objeto do produto { nome, preco }
 * @param {string} urlProduto - URL da página do produto (opcional)
 * @returns {string} URL completa wa.me com mensagem codificada
 */
function gerarLinkWhatsAppProduto(phone, produto, urlProduto) {
    if (!validarWhatsApp(phone)) return '';
    const cleanNumber = formatarNumeroWhatsApp(phone);
    const nome = produto && produto.nome ? produto.nome : 'Móvel';
    const preco = produto && produto.preco ? produto.preco : '';
    const precoInfo = preco ? ` (${preco})` : '';

    let urlFinal = urlProduto;
    if (!urlFinal && typeof window !== 'undefined' && window.location) {
        urlFinal = window.location.href;
    }

    let mensagem = `Olá, gostaria de solicitar um orçamento para a peça: ${nome}${precoInfo}`;
    if (urlFinal) {
        mensagem += `\nLink do produto: ${urlFinal}`;
    }

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Gera link oficial do WhatsApp (wa.me) para atendimento geral
 * @param {string} phone - Número de WhatsApp configurado
 * @param {string} mensagem - Mensagem inicial opcional
 * @returns {string} URL completa wa.me
 */
function gerarLinkWhatsAppGeral(phone, mensagem) {
    if (!validarWhatsApp(phone)) return '';
    const cleanNumber = formatarNumeroWhatsApp(phone);
    const msg = mensagem || 'Olá! Gostaria de tirar dúvidas sobre os móveis da PACO.';
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
}

/**
 * Carrega a configuração de contatos do Firestore (configuracoes/contato) com fallback para cache local
 * @param {Object} db - Instância do Firestore (opcional)
 * @returns {Promise<Object|null>} Objeto de configuração ou null
 */
async function carregarConfiguracaoContato(db) {
    let config = null;

    const firestoreDb = db || (
        typeof FirebaseService !== 'undefined' && FirebaseService.isConfigured ? FirebaseService.db : null
    );

    if (firestoreDb) {
        try {
            const doc = await firestoreDb.collection('configuracoes').doc('contato').get();
            if (doc.exists) {
                config = doc.data();
                if (typeof localStorage !== 'undefined') {
                    try {
                        localStorage.setItem(CONTATO_CACHE_KEY, JSON.stringify(config));
                    } catch (_) {}
                }
            }
        } catch (err) {
            console.warn('[Contatos] Erro ao carregar do Firestore. Usando cache local.', err);
        }
    }

    // Se o Firestore falhou ou não retornou dados, usa o cache do localStorage
    if (!config && typeof localStorage !== 'undefined') {
        try {
            const cached = localStorage.getItem(CONTATO_CACHE_KEY);
            if (cached) {
                config = JSON.parse(cached);
            }
        } catch (_) {}
    }

    return config;
}

/**
 * Salva a configuração de contatos no Firestore e no cache local com validação estrita
 * @param {Object} db - Instância do Firestore
 * @param {Object} data - { whatsapp, instagram_url, email }
 * @returns {Promise<Object>} Dados validados e salvos
 */
async function salvarConfiguracaoContato(db, data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Dados de configuração inválidos.');
    }

    const payload = {};

    // Validação de WhatsApp
    if (data.whatsapp !== undefined && data.whatsapp !== null && String(data.whatsapp).trim() !== '') {
        const rawPhone = String(data.whatsapp).trim();
        if (!validarWhatsApp(rawPhone)) {
            throw new Error('Número de WhatsApp inválido. Utilize o formato internacional E.164 (ex: +5511999998888 ou 5511999998888).');
        }
        payload.whatsapp = rawPhone;
    } else {
        payload.whatsapp = '';
    }

    // Validação de Instagram
    if (data.instagram_url !== undefined && data.instagram_url !== null && String(data.instagram_url).trim() !== '') {
        const rawIg = String(data.instagram_url).trim();
        if (!validarInstagram(rawIg)) {
            throw new Error('Perfil ou URL do Instagram inválido (ex: https://instagram.com/pacomoveis ou @pacomoveis).');
        }
        payload.instagram_url = normalizarUrlInstagram(rawIg);
    } else {
        payload.instagram_url = '';
    }

    // Validação de E-mail
    if (data.email !== undefined && data.email !== null && String(data.email).trim() !== '') {
        const rawEmail = String(data.email).trim();
        if (!validarEmail(rawEmail)) {
            throw new Error('Endereço de e-mail inválido (ex: contato@pacomoveis.com.br).');
        }
        payload.email = rawEmail;
    } else {
        payload.email = '';
    }

    payload.updated_at = new Date().toISOString();

    const firestoreDb = db || (
        typeof FirebaseService !== 'undefined' && FirebaseService.isConfigured ? FirebaseService.db : null
    );

    if (firestoreDb) {
        await firestoreDb.collection('configuracoes').doc('contato').set(payload, { merge: true });
    }

    if (typeof localStorage !== 'undefined') {
        try {
            localStorage.setItem(CONTATO_CACHE_KEY, JSON.stringify(payload));
        } catch (_) {}
    }

    return payload;
}

/**
 * Aplica os contatos carregados aos elementos do DOM da página atual
 * - Rodapé (WhatsApp e Instagram ocultos se ausentes)
 * - Botão flutuante de WhatsApp (oculto se ausente)
 * - E-mail de atendimento
 * @param {Object} config - Configuração de contatos
 */
function aplicarContatosAoDOM(config) {
    if (typeof document === 'undefined') return;

    const whatsappConfigured = !!(config && config.whatsapp && validarWhatsApp(config.whatsapp));
    const instagramConfigured = !!(config && config.instagram_url && validarInstagram(config.instagram_url));
    const emailConfigured = !!(config && config.email && validarEmail(config.email));

    // 1. Links do WhatsApp no rodapé e páginas
    const waLinks = document.querySelectorAll('[data-contact="whatsapp"], .footer-whatsapp-link');
    waLinks.forEach(link => {
        if (whatsappConfigured) {
            const clean = formatarNumeroWhatsApp(config.whatsapp);
            link.href = `https://wa.me/${clean}`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = '';
            link.removeAttribute('aria-hidden');
        } else {
            link.style.display = 'none';
            link.setAttribute('aria-hidden', 'true');
        }
    });

    // 2. Links do Instagram no rodapé
    const igLinks = document.querySelectorAll('[data-contact="instagram"], .footer-instagram-link');
    igLinks.forEach(link => {
        if (instagramConfigured) {
            link.href = normalizarUrlInstagram(config.instagram_url);
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = '';
            link.removeAttribute('aria-hidden');
        } else {
            link.style.display = 'none';
            link.setAttribute('aria-hidden', 'true');
        }
    });

    // 3. Links de E-mail de Atendimento
    const emailLinks = document.querySelectorAll('[data-contact="email"], .footer-email-link');
    emailLinks.forEach(link => {
        if (emailConfigured) {
            link.href = `mailto:${config.email}`;
            // Se o link exibir o endereço de e-mail como texto, atualiza também
            if (link.textContent.includes('@')) {
                link.textContent = config.email;
            }
            link.style.display = '';
        } else if (link.dataset.required === 'true') {
            link.style.display = 'none';
        }
    });

    // 4. Botão Flutuante de WhatsApp (RF05)
    const floatingBtn = document.getElementById('floating-whatsapp-btn');
    if (floatingBtn) {
        if (whatsappConfigured) {
            floatingBtn.href = gerarLinkWhatsAppGeral(config.whatsapp);
            floatingBtn.target = '_blank';
            floatingBtn.rel = 'noopener noreferrer';
            floatingBtn.style.display = 'flex';
            floatingBtn.removeAttribute('aria-hidden');
        } else {
            floatingBtn.style.display = 'none';
            floatingBtn.setAttribute('aria-hidden', 'true');
        }
    }
}

/**
 * Inicialização automática dos contatos no carregamento da página
 */
async function inicializarContatos() {
    try {
        const config = await carregarConfiguracaoContato();
        aplicarContatosAoDOM(config);
    } catch (e) {
        console.warn('[Contatos] Falha ao inicializar contatos no DOM:', e);
    }
}

// Escopo global no navegador
if (typeof window !== 'undefined') {
    window.CONTATO_CACHE_KEY = CONTATO_CACHE_KEY;
    window.validarWhatsApp = validarWhatsApp;
    window.formatarNumeroWhatsApp = formatarNumeroWhatsApp;
    window.validarInstagram = validarInstagram;
    window.normalizarUrlInstagram = normalizarUrlInstagram;
    window.validarEmail = validarEmail;
    window.gerarLinkWhatsAppProduto = gerarLinkWhatsAppProduto;
    window.gerarLinkWhatsAppGeral = gerarLinkWhatsAppGeral;
    window.carregarConfiguracaoContato = carregarConfiguracaoContato;
    window.salvarConfiguracaoContato = salvarConfiguracaoContato;
    window.aplicarContatosAoDOM = aplicarContatosAoDOM;
    window.inicializarContatos = inicializarContatos;

    // Executa assim que o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarContatos);
    } else {
        inicializarContatos();
    }
}

// Suporte a módulos Node.js / testes automatizados
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONTATO_CACHE_KEY,
        validarWhatsApp,
        formatarNumeroWhatsApp,
        validarInstagram,
        normalizarUrlInstagram,
        validarEmail,
        gerarLinkWhatsAppProduto,
        gerarLinkWhatsAppGeral,
        carregarConfiguracaoContato,
        salvarConfiguracaoContato,
        aplicarContatosAoDOM,
        inicializarContatos
    };
}
