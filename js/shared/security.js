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

// Aliases para compatibilidade e semântica
const validarCorHex = sanitizeHexColor;
const safeHexColor = sanitizeHexColor;

// Exportação no escopo global do navegador
if (typeof window !== 'undefined') {
    window.escapeHtml = escapeHtml;
    window.safeUrl = safeUrl;
    window.sanitizeHexColor = sanitizeHexColor;
    window.validarCorHex = validarCorHex;
    window.safeHexColor = safeHexColor;
}

// Suporte para testes automatizados em ambiente Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        safeUrl,
        sanitizeHexColor,
        validarCorHex,
        safeHexColor
    };
}
