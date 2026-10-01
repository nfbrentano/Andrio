/**
 * Módulo Compartilhado de Segurança - PACO Móveis
 * Sanitização e escape contra XSS (Cross-Site Scripting) e injeção de dados
 */

/**
 * Escapa caracteres HTML perigosos em textos e atributos
 * Converte &, <, >, ", ' para entidades HTML seguras
 * @param {*} str - Texto a ser escapado
 * @returns {string} Texto seguro contra injeção de tags ou quebra de atributos
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Valida se uma URL é segura para uso em atributos src ou href
 * Aceita: https:, http:, caminhos relativos e data:image/ (png, jpeg, webp, gif, bmp)
 * Rejeita: javascript:, vbscript:, URLs com aspas, espaços ou quebras de linha
 * @param {string} url - URL para validação
 * @param {string} fallback - Valor retornado caso a URL seja inválida ou perigosa
 * @returns {string} URL validada ou fallback
 */
function safeUrl(url, fallback = '') {
    if (!url || typeof url !== 'string') return fallback;
    const trimmed = url.trim();
    if (!trimmed) return fallback;

    // Bloqueia caracteres que poderiam quebrar atributos ou injetar atributos/código
    if (/[\s"'<>\\]|[\x00-\x1F\x7F]/.test(trimmed)) {
        return fallback;
    }

    // Aceita data:image segura em base64 (PNG, JPEG, WEBP, GIF, BMP) - rejeita data:text, data:image/svg+xml etc.
    if (/^data:image\/(?:png|jpeg|jpg|webp|gif|bmp);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed)) {
        return trimmed;
    }

    // Aceita protocolos web explícitos http:// e https://
    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const parsed = new URL(trimmed);
            if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                return trimmed;
            }
            return fallback;
        } catch (_) {
            return fallback;
        }
    }

    // Rejeita links protocol-relative que apontem para hosts arbitrários (//host)
    if (trimmed.startsWith('//')) {
        return fallback;
    }

    // Aceita caminhos relativos seguros (não contêm ':' antes de '/', '?' ou '#')
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
        const firstSlash = trimmed.indexOf('/');
        const firstQuestion = trimmed.indexOf('?');
        const firstHash = trimmed.indexOf('#');
        const hasDelimiterBeforeColon = (firstSlash !== -1 && firstSlash < colonIndex) ||
                                       (firstQuestion !== -1 && firstQuestion < colonIndex) ||
                                       (firstHash !== -1 && firstHash < colonIndex);
        if (!hasDelimiterBeforeColon) {
            return fallback;
        }
    }

    return trimmed;
}

/**
 * Valida se uma cor CSS está no formato hexadecimal estrito (#RGB ou #RRGGBB)
 * Impede injeção de CSS malicioso em estilos inline como 'red;background:url(//evil)'
 * @param {string} color - Cor a validar
 * @param {string} defaultColor - Cor padrão se inválida
 * @returns {string} Cor hex segura ou cor padrão
 */
function sanitizeHexColor(color, defaultColor = '#2b7fff') {
    if (!color || typeof color !== 'string') return defaultColor;
    const trimmed = color.trim();
    if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
        return trimmed;
    }
    return defaultColor;
}

/**
 * Valida o destino de redirecionamento pós-login contra uma allowlist estrita (RF01, RF02, RNF01)
 * Impede ataques de Open Redirect e execução de scripts por javascript:, data: ou hosts externos
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

// Aliases para compatibilidade e semântica
const validarCorHex = sanitizeHexColor;
const safeHexColor = sanitizeHexColor;
const safeRedirect = validarRedirect;
const getSafeRedirect = validarRedirect;

// Exportação no escopo global do navegador
if (typeof window !== 'undefined') {
    window.escapeHtml = escapeHtml;
    window.safeUrl = safeUrl;
    window.sanitizeHexColor = sanitizeHexColor;
    window.validarCorHex = validarCorHex;
    window.safeHexColor = safeHexColor;
    window.validarRedirect = validarRedirect;
    window.safeRedirect = safeRedirect;
    window.getSafeRedirect = getSafeRedirect;
}

// Suporte para testes automatizados em ambiente Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        safeUrl,
        sanitizeHexColor,
        validarCorHex,
        safeHexColor,
        validarRedirect,
        safeRedirect,
        getSafeRedirect
    };
}

