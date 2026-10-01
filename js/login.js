/**
 * Controlador da Página de Login Administrativo - PACO Móveis
 * Gerencia autenticação, redirecionamento seguro pós-login e mensagens de erro.
 * Atende aos requisitos: RF01, RF02, RNF01, RNF02 e Critérios de Aceitação CA01–CA04.
 */

/**
 * Valida o destino de redirecionamento pós-login contra uma allowlist estrita (RF01, RF02, RNF01)
 * Impede ataques de Open Redirect e execução de scripts por javascript:, data: ou hosts externos
 *
 * @param {string} redirectUrl - Valor do parâmetro redirect da query string
 * @param {string} [baseOrigin] - Origem base para validação (padrão: window.location.origin)
 * @returns {string} Destino seguro permitido ou 'admin.html' como padrão
 */
function validarRedirect(redirectUrl, baseOrigin) {
    const DEFAULT_REDIRECT = 'admin.html';
    const ALLOWED_PAGES = ['admin.html'];

    if (!redirectUrl || typeof redirectUrl !== 'string') {
        return DEFAULT_REDIRECT;
    }

    const trimmed = redirectUrl.trim();
    if (!trimmed) {
        return DEFAULT_REDIRECT;
    }

    // Bloqueia barras invertidas e caracteres de controle
    if (/[\x00-\x1F\x7F\\]/.test(trimmed)) {
        return DEFAULT_REDIRECT;
    }

    // Bloqueia explicitamente URLs protocol-relative (//host)
    if (trimmed.startsWith('//')) {
        return DEFAULT_REDIRECT;
    }

    // Determina a origem base
    let origin = baseOrigin;
    if (!origin) {
        if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
            origin = window.location.origin;
        } else {
            origin = 'http://localhost';
        }
    }

    try {
        // RNF01: Resolver o valor com new URL(valor, location.origin)
        const parsed = new URL(trimmed, origin);
        const expectedOrigin = new URL(origin).origin;

        // RNF01: Checar se origin === location.origin
        if (parsed.origin !== expectedOrigin) {
            return DEFAULT_REDIRECT;
        }

        // Garante protocolo estritamente http: ou https:
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return DEFAULT_REDIRECT;
        }

        // RF01 / RNF01: Checar se pathname está na allowlist interna
        const normalizedPath = parsed.pathname.replace(/^\/+/, '');

        const isAllowed = ALLOWED_PAGES.some((allowed) => {
            const normalizedAllowed = allowed.replace(/^\/+/, '');
            return normalizedPath === normalizedAllowed;
        });

        if (!isAllowed) {
            return DEFAULT_REDIRECT;
        }

        // Retorna o destino seguro preservando parâmetros de consulta e hash válidos
        return normalizedPath + parsed.search + parsed.hash;
    } catch (_) {
        return DEFAULT_REDIRECT;
    }
}

// Aliases para conveniência e semântica
const safeRedirect = validarRedirect;
const getSafeRedirect = validarRedirect;

/**
 * Inicialização dos eventos e listeners do formulário de login (RNF02)
 */
async function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const emailInput = document.getElementById('admin-email');
    const passInput = document.getElementById('admin-password');
    const alertBox = document.getElementById('login-alert');
    const btnSubmit = document.getElementById('btn-login-submit');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    function showAlert(msg, type = 'error') {
        if (!alertBox) return;
        alertBox.textContent = msg;
        alertBox.className = `login-alert ${type}`;
        alertBox.style.display = 'block';
    }

    // Se já estiver logado, redireciona de forma segura
    if (typeof Auth !== 'undefined' && typeof Auth.getCurrentUser === 'function') {
        try {
            const user = await Auth.getCurrentUser();
            if (user) {
                const params = new URLSearchParams(window.location.search);
                const redirect = validarRedirect(params.get('redirect'));
                window.location.href = redirect;
                return;
            }
        } catch (err) {
            console.warn('[Login] Erro ao verificar usuário atual:', err);
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (alertBox) alertBox.style.display = 'none';

        const email = emailInput ? emailInput.value : '';
        const password = passInput ? passInput.value : '';

        if (btnSubmit) btnSubmit.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnSpinner) btnSpinner.style.display = 'inline';

        if (typeof FirebaseService === 'undefined' || !FirebaseService.isConfigured) {
            showAlert('Serviço de autenticação temporariamente indisponível.', 'error');
            if (btnSubmit) btnSubmit.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnSpinner) btnSpinner.style.display = 'none';
            return;
        }

        try {
            await Auth.signIn(email, password);
            const params = new URLSearchParams(window.location.search);
            const redirect = validarRedirect(params.get('redirect'));
            window.location.href = redirect;
        } catch (err) {
            console.error('Erro de autenticação:', err);
            showAlert(err.message || 'Erro ao autenticar. Verifique email e senha.', 'error');
            if (btnSubmit) btnSubmit.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    });
}

// Inicializa no DOMContentLoaded quando executado no navegador
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoginPage);
    } else {
        initLoginPage();
    }
}

// Exposição global no navegador
if (typeof window !== 'undefined') {
    window.validarRedirect = validarRedirect;
    window.safeRedirect = safeRedirect;
    window.getSafeRedirect = getSafeRedirect;
    window.initLoginPage = initLoginPage;
}

// Exportação para testes automatizados Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validarRedirect,
        safeRedirect,
        getSafeRedirect,
        initLoginPage
    };
}
