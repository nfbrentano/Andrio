/**
 * Suíte de Testes Automatizados - Segurança: Open Redirect e Parâmetro Redirect no Login
 * Especificação: SDD/2026-09-24_open-redirect-no-login.md
 * 
 * Cobre:
 * - RF01: Destino restrito a allowlist interna (admin.html)
 * - RF02: Destinos externos ou perigosos redirecionam para fallback padrão seguro (admin.html)
 * - RNF01: Resolução com new URL(valor, location.origin), validação de origin e pathname
 * - RNF02: Eliminação de script inline em login.html e modularização em js/login.js
 * - CA01 / CT01: Prevenção de execução de payloads javascript:
 * - CA02 / CT02: Bloqueio de redirecionamento para URLs externas (https://exemplo.com)
 * - CA03 / CT03: Suporte correto a caminhos permitidos (admin.html)
 * - CA04 / CT04: Bloqueio de URLs protocol-relative (//exemplo.com)
 * - CT05: Testes unitários exaustivos da função de validação com payloads maliciosos
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${name}`);
        console.error(`     Erro: ${err.message}`);
    }
}

async function runAsyncTest(name, fn) {
    totalTests++;
    try {
        await fn();
        console.log(`  ✅ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${name}`);
        console.error(`     Erro: ${err.message}`);
    }
}

async function runAllTests() {
    console.log('\n============================================================');
    console.log('🧪 Iniciando Testes: Open Redirect e Segurança do Login');
    console.log('============================================================\n');

    // 1. Carregar módulos e arquivos
    const loginJsPath = path.resolve(__dirname, '../js/login.js');
    const securityJsPath = path.resolve(__dirname, '../js/shared/security.js');
    const loginHtmlPath = path.resolve(__dirname, '../login.html');
    const swJsPath = path.resolve(__dirname, '../sw.js');

    const loginJs = require(loginJsPath);
    const securityJs = require(securityJsPath);
    const loginHtmlContent = fs.readFileSync(loginHtmlPath, 'utf8');
    const swJsContent = fs.readFileSync(swJsPath, 'utf8');

    // =========================================================================
    // 1. RNF02: Desacoplamento e Ausência de Scripts Inline em login.html
    // =========================================================================
    console.log('📄 1. RNF02: Ausência de scripts inline e carregamento externo:');

    runTest('login.html não deve conter tags <script> inline no <body>', () => {
        // Verifica se existe alguma tag <script> que não contenha atributo src
        const scriptTags = loginHtmlContent.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || [];
        const inlineScripts = scriptTags.filter(tag => !tag.toLowerCase().includes('src='));
        assert.strictEqual(
            inlineScripts.length,
            0,
            `Encontrados scripts inline em login.html: ${inlineScripts.join('\n')}`
        );
    });

    runTest('login.html deve carregar js/login.js e js/shared/security.js com atributo defer', () => {
        assert.ok(
            loginHtmlContent.includes('src="js/login.js"') && loginHtmlContent.includes('defer'),
            'login.html deve incluir js/login.js com defer'
        );
        assert.ok(
            loginHtmlContent.includes('src="js/shared/security.js"') && loginHtmlContent.includes('defer'),
            'login.html deve incluir js/shared/security.js com defer'
        );
    });

    runTest('sw.js não deve pré-cachear js/login.js para visitantes anônimos (SDD Service Worker RF02)', () => {
        assert.ok(
            !swJsContent.includes("'js/login.js'"),
            'sw.js não deve pré-cachear js/login.js'
        );
    });

    // =========================================================================
    // 2. CT01 / CA01: Prevenção de Injeção de Scripts (javascript:)
    // =========================================================================
    console.log('\n🛡️  2. CT01 / CA01: Prevenção de execução de payloads javascript:');

    runTest('validarRedirect com payload javascript:alert(1) deve retornar admin.html (CA01)', () => {
        const resultado = loginJs.validarRedirect('javascript:alert(1)', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com payload javascript:alert(document.domain) deve retornar admin.html (CT01)', () => {
        const resultado = loginJs.validarRedirect('javascript:alert(document.domain)', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com javascript:void(0) ou variações com espaços deve retornar admin.html', () => {
        assert.strictEqual(loginJs.validarRedirect(' javascript:void(0) ', 'https://pacomoveis.com.br'), 'admin.html');
        assert.strictEqual(loginJs.validarRedirect('JAVASCRIPT:alert(1)', 'https://pacomoveis.com.br'), 'admin.html');
    });

    // =========================================================================
    // 3. CT02 / CA02: Bloqueio de URLs Externas Absolutas
    // =========================================================================
    console.log('\n🌐 3. CT02 / CA02: Bloqueio de redirecionamento para URLs externas:');

    runTest('validarRedirect com https://exemplo.com deve retornar admin.html (CA02)', () => {
        const resultado = loginJs.validarRedirect('https://exemplo.com', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com https://google.com deve retornar admin.html (CT02)', () => {
        const resultado = loginJs.validarRedirect('https://google.com', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com subdomínio malicioso de terceiros deve retornar admin.html', () => {
        const resultado = loginJs.validarRedirect('https://pacomoveis.com.br.attacker.com/admin.html', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    // =========================================================================
    // 4. CT03 / CA03: Caminhos Internos Permitidos na Allowlist
    // =========================================================================
    console.log('\n✅ 4. CT03 / CA03: Caminhos válidos permitidos (admin.html):');

    runTest('validarRedirect com admin.html relativo deve retornar admin.html (CA03, CT03)', () => {
        const resultado = loginJs.validarRedirect('admin.html', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com /admin.html absoluto no mesmo domínio deve retornar admin.html', () => {
        const resultado = loginJs.validarRedirect('/admin.html', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com URL absoluta da mesma origem apontando para admin.html deve retornar admin.html', () => {
        const resultado = loginJs.validarRedirect('https://pacomoveis.com.br/admin.html', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect preserva parâmetros de query e hash válidos em admin.html', () => {
        const comQuery = loginJs.validarRedirect('admin.html?tab=produtos', 'https://pacomoveis.com.br');
        assert.strictEqual(comQuery, 'admin.html?tab=produtos');

        const comHash = loginJs.validarRedirect('admin.html#vitrine', 'https://pacomoveis.com.br');
        assert.strictEqual(comHash, 'admin.html#vitrine');

        const comAmbos = loginJs.validarRedirect('admin.html?filtro=ativo#vitrine', 'https://pacomoveis.com.br');
        assert.strictEqual(comAmbos, 'admin.html?filtro=ativo#vitrine');
    });

    // =========================================================================
    // 5. CT04 / CA04: URLs Protocol-Relative (//host)
    // =========================================================================
    console.log('\n🔗 5. CT04 / CA04: Bloqueio de URLs protocol-relative:');

    runTest('validarRedirect com //exemplo.com deve retornar admin.html (CA04)', () => {
        const resultado = loginJs.validarRedirect('//exemplo.com', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com //google.com deve retornar admin.html (CT04)', () => {
        const resultado = loginJs.validarRedirect('//google.com', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com //admin.html deve retornar admin.html (pois tenta host admin.html)', () => {
        const resultado = loginJs.validarRedirect('//admin.html', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    // =========================================================================
    // 6. CT05: Casos Limite e Payloads Maliciosos Adicionais
    // =========================================================================
    console.log('\n🧪 6. CT05: Casos limite, data: URIs, esquemas e formatos inválidos:');

    runTest('validarRedirect com payload data:text/html deve retornar admin.html (CT05)', () => {
        const resultado = loginJs.validarRedirect('data:text/html,<script>alert(1)</script>', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com vbscript: deve retornar admin.html', () => {
        const resultado = loginJs.validarRedirect('vbscript:msgbox(1)', 'https://pacomoveis.com.br');
        assert.strictEqual(resultado, 'admin.html');
    });

    runTest('validarRedirect com barras invertidas (\\\\evil.com/admin.html) deve retornar admin.html', () => {
        assert.strictEqual(loginJs.validarRedirect('\\\\evil.com/admin.html', 'https://pacomoveis.com.br'), 'admin.html');
        assert.strictEqual(loginJs.validarRedirect('/\\evil.com', 'https://pacomoveis.com.br'), 'admin.html');
    });

    runTest('validarRedirect com valores nulos, vazios ou indefinidos deve retornar admin.html', () => {
        assert.strictEqual(loginJs.validarRedirect(null), 'admin.html');
        assert.strictEqual(loginJs.validarRedirect(undefined), 'admin.html');
        assert.strictEqual(loginJs.validarRedirect(''), 'admin.html');
        assert.strictEqual(loginJs.validarRedirect('   '), 'admin.html');
    });

    runTest('validarRedirect com páginas não permitidas na allowlist (ex.: catalogo.html) deve retornar admin.html (RF01)', () => {
        assert.strictEqual(loginJs.validarRedirect('catalogo.html', 'https://pacomoveis.com.br'), 'admin.html');
        assert.strictEqual(loginJs.validarRedirect('index.html', 'https://pacomoveis.com.br'), 'admin.html');
        assert.strictEqual(loginJs.validarRedirect('/outra-pagina.html', 'https://pacomoveis.com.br'), 'admin.html');
    });

    runTest('validarRedirect com tentativas de path traversal (admin.html/../evil) deve retornar admin.html', () => {
        assert.strictEqual(loginJs.validarRedirect('admin.html/../evil.html', 'https://pacomoveis.com.br'), 'admin.html');
    });

    // =========================================================================
    // 7. Paridade com js/shared/security.js
    // =========================================================================
    console.log('\n🔒 7. Paridade entre js/login.js e js/shared/security.js:');

    runTest('js/shared/security.js deve expor validarRedirect, safeRedirect e getSafeRedirect', () => {
        assert.strictEqual(typeof securityJs.validarRedirect, 'function', 'security.js deve exportar validarRedirect');
        assert.strictEqual(typeof securityJs.safeRedirect, 'function', 'security.js deve exportar safeRedirect');
        assert.strictEqual(typeof securityJs.getSafeRedirect, 'function', 'security.js deve exportar getSafeRedirect');

        // Testa mesma resposta entre os dois módulos
        const payloads = ['javascript:alert(1)', 'https://google.com', 'admin.html', '//evil.com', 'data:text/html,...'];
        for (const p of payloads) {
            assert.strictEqual(
                securityJs.validarRedirect(p, 'https://pacomoveis.com.br'),
                loginJs.validarRedirect(p, 'https://pacomoveis.com.br'),
                `Divergência entre security.js e login.js para payload: ${p}`
            );
        }
    });

    // =========================================================================
    // 8. Simulação de Fluxo do Usuário / DOM (Integração)
    // =========================================================================
    console.log('\n🔄 8. Simulação do Fluxo de Login com Parâmetro de URL:');

    await runAsyncTest('Fluxo de login redireciona com segurança quando há payload malicioso na URL', async () => {
        // Mock do ambiente do navegador
        const mockWindow = {
            location: {
                search: '?redirect=javascript:alert(1)',
                origin: 'https://pacomoveis.com.br',
                href: ''
            }
        };

        const params = new URLSearchParams(mockWindow.location.search);
        const destination = loginJs.validarRedirect(params.get('redirect'), mockWindow.location.origin);
        mockWindow.location.href = destination;

        assert.strictEqual(mockWindow.location.href, 'admin.html', 'Nenhum script deve rodar e destino deve ser admin.html');
    });

    await runAsyncTest('Fluxo de login com usuário já autenticado redireciona com segurança', async () => {
        const mockWindow = {
            location: {
                search: '?redirect=https://hacker.com',
                origin: 'https://pacomoveis.com.br',
                href: ''
            }
        };

        const params = new URLSearchParams(mockWindow.location.search);
        const destination = loginJs.validarRedirect(params.get('redirect'), mockWindow.location.origin);
        mockWindow.location.href = destination;

        assert.strictEqual(mockWindow.location.href, 'admin.html', 'Usuário logado deve ser enviado para admin.html e não hacker.com');
    });

    console.log('\n============================================================');
    console.log(`📊 Resultado dos Testes: ${passedTests}/${totalTests} passaram com sucesso!`);
    console.log('============================================================\n');

    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

runAllTests().catch(err => {
    console.error('Erro na execução dos testes:', err);
    process.exit(1);
});
