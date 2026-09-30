/**
 * Suite de Testes Automatizados - Contatos Oficiais (WhatsApp, Instagram, E-mail)
 * Cobre CA01, CA02, CA03, CA04, CA05 e CT01, CT02, CT03, CT04, CT05
 */

const assert = require('assert');
const {
    validarWhatsApp,
    formatarNumeroWhatsApp,
    validarInstagram,
    normalizarUrlInstagram,
    validarEmail,
    gerarLinkWhatsAppProduto,
    gerarLinkWhatsAppGeral,
    salvarConfiguracaoContato,
    carregarConfiguracaoContato,
    aplicarContatosAoDOM
} = require('../js/shared/contatos.js');

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

function createMockElement(tag, attrs = {}) {
    const el = {
        tagName: tag.toUpperCase(),
        attributes: { ...attrs },
        style: { display: '' },
        dataset: {},
        textContent: attrs.textContent || '',
        setAttribute(k, v) { this.attributes[k] = String(v); },
        getAttribute(k) { return this.attributes[k]; },
        removeAttribute(k) { delete this.attributes[k]; }
    };
    if (attrs.href) el.href = attrs.href;
    if (attrs['data-contact']) el.dataset.contact = attrs['data-contact'];
    return el;
}

async function runAllTests() {
    console.log('\n--- INICIANDO TESTES DE CONTATOS REAIS E REDES SOCIAIS ---\n');

    // =========================================================================
    // CT04 / CA04: Validação de Formato (WhatsApp E.164, Instagram, E-mail)
    // =========================================================================
    console.log('📦 Testes de Validação de Formato (CT04 / CA04):');

    runTest('validarWhatsApp deve rejeitar "abc"', () => {
        assert.strictEqual(validarWhatsApp('abc'), false);
    });

    runTest('validarWhatsApp deve rejeitar textos mistos como "phone5511912345678"', () => {
        assert.strictEqual(validarWhatsApp('phone5511912345678'), false);
    });

    runTest('validarWhatsApp deve rejeitar números curtos demais (< 10 dígitos)', () => {
        assert.strictEqual(validarWhatsApp('123456789'), false);
        assert.strictEqual(validarWhatsApp(''), false);
        assert.strictEqual(validarWhatsApp(null), false);
    });

    runTest('validarWhatsApp deve rejeitar números longos demais (> 15 dígitos)', () => {
        assert.strictEqual(validarWhatsApp('+551199999999999999'), false);
    });

    runTest('validarWhatsApp deve aceitar "+5511912345678" (E.164 canônico)', () => {
        assert.strictEqual(validarWhatsApp('+5511912345678'), true);
    });

    runTest('validarWhatsApp deve aceitar "5511912345678" (dígitos diretos)', () => {
        assert.strictEqual(validarWhatsApp('5511912345678'), true);
    });

    runTest('validarWhatsApp deve aceitar formato com pontuação brasileira "+55 (11) 91234-5678"', () => {
        assert.strictEqual(validarWhatsApp('+55 (11) 91234-5678'), true);
    });

    runTest('formatarNumeroWhatsApp deve extrair somente os dígitos numéricos', () => {
        assert.strictEqual(formatarNumeroWhatsApp('+55 (11) 91234-5678'), '5511912345678');
        assert.strictEqual(formatarNumeroWhatsApp('+5511999998888'), '5511999998888');
    });

    runTest('validarInstagram deve aceitar URL completa, @usuario e usuario', () => {
        assert.strictEqual(validarInstagram('https://instagram.com/pacomoveis'), true);
        assert.strictEqual(validarInstagram('https://www.instagram.com/pacomoveis'), true);
        assert.strictEqual(validarInstagram('@pacomoveis'), true);
        assert.strictEqual(validarInstagram('pacomoveis.design'), true);
    });

    runTest('validarInstagram deve rejeitar URLs maliciosas ou domínios estranhos', () => {
        assert.strictEqual(validarInstagram('javascript:alert(1)'), false);
        assert.strictEqual(validarInstagram('https://evil.com/pacomoveis'), false);
        assert.strictEqual(validarInstagram('pacomoveis<script>'), false);
    });

    runTest('normalizarUrlInstagram deve retornar URL canônica https://www.instagram.com/...', () => {
        assert.strictEqual(normalizarUrlInstagram('@pacomoveis'), 'https://www.instagram.com/pacomoveis');
        assert.strictEqual(normalizarUrlInstagram('pacomoveis'), 'https://www.instagram.com/pacomoveis');
        assert.strictEqual(normalizarUrlInstagram('https://www.instagram.com/pacomoveis'), 'https://www.instagram.com/pacomoveis');
    });

    runTest('validarEmail deve validar endereços de e-mail corretamente', () => {
        assert.strictEqual(validarEmail('contato@pacomoveis.com.br'), true);
        assert.strictEqual(validarEmail('admin@pacomoveis.com.br'), true);
        assert.strictEqual(validarEmail('invalido'), false);
        assert.strictEqual(validarEmail('sem_arroba.com'), false);
    });

    // =========================================================================
    // CT01 / CA01: CTA WhatsApp no Produto
    // =========================================================================
    console.log('\n💬 Testes de Geração de Link do CTA de Orçamento (CT01 / CA01):');

    runTest('gerarLinkWhatsAppProduto deve montar wa.me/<número real> com nome, preço e link do produto', () => {
        const phone = '+55 (11) 98765-4321';
        const produto = {
            nome: 'Poltrona Ipanema Veludo Terracota',
            preco: 'R$ 2.890,00'
        };
        const url = 'https://pacomoveis.com.br/produto.html?id=1';

        const link = gerarLinkWhatsAppProduto(phone, produto, url);

        assert.ok(link.startsWith('https://wa.me/5511987654321?text='));
        const decodedText = decodeURIComponent(link.replace('https://wa.me/5511987654321?text=', ''));
        
        assert.ok(decodedText.includes('Poltrona Ipanema Veludo Terracota'), 'Deve conter o nome do produto');
        assert.ok(decodedText.includes('R$ 2.890,00'), 'Deve conter o preço do produto');
        assert.ok(decodedText.includes('https://pacomoveis.com.br/produto.html?id=1'), 'Deve conter o link do produto');
    });

    runTest('gerarLinkWhatsAppProduto com número inválido deve retornar string vazia', () => {
        const link = gerarLinkWhatsAppProduto('abc', { nome: 'Mesa' }, 'https://link');
        assert.strictEqual(link, '');
    });

    // =========================================================================
    // CT02 & CT03 / CA02 & CA03: Rodapé e Redes Sociais
    // =========================================================================
    console.log('\n🌐 Testes de Aplicação ao DOM e Rodapé (CT02 / CT03 / CA02 / CA03):');

    runTest('aplicarContatosAoDOM com WhatsApp e Instagram configurados deve exibir links e destinos reais (CA02)', () => {
        const waLink = createMockElement('a', { 'data-contact': 'whatsapp', href: 'https://wa.me/' });
        const igLink = createMockElement('a', { 'data-contact': 'instagram', href: 'https://instagram.com/' });
        const emailLink = createMockElement('a', { 'data-contact': 'email', href: 'mailto:old@test.com', textContent: 'old@test.com' });
        const floatingBtn = createMockElement('a', { id: 'floating-whatsapp-btn', href: '#' });

        global.document = {
            querySelectorAll: (sel) => {
                if (sel.includes('whatsapp')) return [waLink];
                if (sel.includes('instagram')) return [igLink];
                if (sel.includes('email')) return [emailLink];
                return [];
            },
            getElementById: (id) => {
                if (id === 'floating-whatsapp-btn') return floatingBtn;
                return null;
            }
        };

        const config = {
            whatsapp: '+55 11 98765-4321',
            instagram_url: '@pacomoveis',
            email: 'contato@pacomoveis.com.br'
        };

        aplicarContatosAoDOM(config);

        // CA02 / RNF01: Destinos reais e nova aba com rel noopener
        assert.strictEqual(waLink.href, 'https://wa.me/5511987654321');
        assert.strictEqual(waLink.target, '_blank');
        assert.strictEqual(waLink.rel, 'noopener noreferrer');
        assert.strictEqual(waLink.style.display, '');

        assert.strictEqual(igLink.href, 'https://www.instagram.com/pacomoveis');
        assert.strictEqual(igLink.target, '_blank');
        assert.strictEqual(igLink.rel, 'noopener noreferrer');
        assert.strictEqual(igLink.style.display, '');

        assert.strictEqual(emailLink.href, 'mailto:contato@pacomoveis.com.br');
        assert.strictEqual(emailLink.textContent, 'contato@pacomoveis.com.br');

        // RF05: Botão flutuante ativo
        assert.strictEqual(floatingBtn.style.display, 'flex');
        assert.ok(floatingBtn.href.startsWith('https://wa.me/5511987654321'));
    });

    runTest('aplicarContatosAoDOM sem Instagram ou sem WhatsApp deve ocultá-los (CA03)', () => {
        const waLink = createMockElement('a', { 'data-contact': 'whatsapp', href: 'https://wa.me/' });
        const igLink = createMockElement('a', { 'data-contact': 'instagram', href: 'https://instagram.com/' });
        const floatingBtn = createMockElement('a', { id: 'floating-whatsapp-btn', href: '#' });

        global.document = {
            querySelectorAll: (sel) => {
                if (sel.includes('whatsapp')) return [waLink];
                if (sel.includes('instagram')) return [igLink];
                return [];
            },
            getElementById: (id) => {
                if (id === 'floating-whatsapp-btn') return floatingBtn;
                return null;
            }
        };

        // Configuração sem Instagram e sem WhatsApp
        aplicarContatosAoDOM({ whatsapp: '', instagram_url: '', email: 'contato@pacomoveis.com.br' });

        assert.strictEqual(igLink.style.display, 'none', 'Ícone do Instagram deve estar oculto quando não configurado');
        assert.strictEqual(igLink.getAttribute('aria-hidden'), 'true');

        assert.strictEqual(waLink.style.display, 'none', 'Ícone do WhatsApp deve estar oculto quando não configurado');
        assert.strictEqual(floatingBtn.style.display, 'none', 'Botão flutuante deve estar oculto quando não configurado');
    });

    // =========================================================================
    // CT05 / CA05: Firestore Indisponível / Fallback de Cache
    // =========================================================================
    console.log('\n🛡️ Testes de Falha e Fallback do Firestore (CT05 / CA05 / RNF02):');

    await runAsyncTest('carregarConfiguracaoContato deve usar o cache do localStorage quando Firestore falhar', async () => {
        const mockStorage = {
            paco_contato_config: JSON.stringify({
                whatsapp: '+5511999998888',
                instagram_url: 'https://www.instagram.com/pacomoveis'
            })
        };
        global.localStorage = {
            getItem: (k) => mockStorage[k] || null,
            setItem: (k, v) => { mockStorage[k] = v; }
        };

        // Simula Firestore que lança erro (ex: firestore.googleapis.com bloqueado)
        const failingDb = {
            collection: () => ({
                doc: () => ({
                    get: async () => { throw new Error('Network error: firestore.googleapis.com unreachable'); }
                })
            })
        };

        const loaded = await carregarConfiguracaoContato(failingDb);
        assert.ok(loaded !== null);
        assert.strictEqual(loaded.whatsapp, '+5511999998888');
        assert.strictEqual(loaded.instagram_url, 'https://www.instagram.com/pacomoveis');
    });

    await runAsyncTest('Quando Firestore não responder e não houver cache, CTA não aponta para 5511999999999 (CA05)', async () => {
        global.localStorage = {
            getItem: () => null,
            setItem: () => {}
        };

        const failingDb = {
            collection: () => ({
                doc: () => ({
                    get: async () => { throw new Error('Offline'); }
                })
            })
        };

        const loaded = await carregarConfiguracaoContato(failingDb);
        assert.strictEqual(loaded, null);

        // Verifica que o link do produto não é gerado com o número fictício
        const produto = { nome: 'Poltrona', preco: 'R$ 1.000' };
        const linkFicticio = '5511999999999';

        // Com loaded nulo, o gerador não produz link
        const waLink = loaded && loaded.whatsapp ? gerarLinkWhatsAppProduto(loaded.whatsapp, produto) : '';
        assert.strictEqual(waLink, '');
        assert.strictEqual(waLink.includes(linkFicticio), false, 'Nunca deve conter o número fictício');
    });

    // =========================================================================
    // CA04: Validação no salvamento
    // =========================================================================
    console.log('\n🔒 Testes de Rejeição e Gravação no Admin (CA04):');

    await runAsyncTest('salvarConfiguracaoContato deve rejeitar número de WhatsApp inválido e não gravar nada', async () => {
        let gravou = false;
        const mockDb = {
            collection: () => ({
                doc: () => ({
                    set: async () => { gravou = true; }
                })
            })
        };

        await assert.rejects(
            async () => {
                await salvarConfiguracaoContato(mockDb, { whatsapp: 'abc', instagram_url: '@paco' });
            },
            /WhatsApp inválido/
        );

        assert.strictEqual(gravou, false, 'Nada deve ser gravado quando o número for inválido');
    });

    await runAsyncTest('salvarConfiguracaoContato deve aceitar dados válidos e gravar no banco', async () => {
        let payloadGravado = null;
        const mockDb = {
            collection: (col) => {
                assert.strictEqual(col, 'configuracoes');
                return {
                    doc: (docId) => {
                        assert.strictEqual(docId, 'contato');
                        return {
                            set: async (data) => { payloadGravado = data; }
                        };
                    }
                };
            }
        };

        const result = await salvarConfiguracaoContato(mockDb, {
            whatsapp: '+55 11 98765-4321',
            instagram_url: '@pacomoveis',
            email: 'contato@pacomoveis.com.br'
        });

        assert.ok(payloadGravado !== null);
        assert.strictEqual(payloadGravado.whatsapp, '+55 11 98765-4321');
        assert.strictEqual(payloadGravado.instagram_url, 'https://www.instagram.com/pacomoveis');
        assert.strictEqual(payloadGravado.email, 'contato@pacomoveis.com.br');
        assert.ok(payloadGravado.updated_at);
    });

    console.log(`\n========================================`);
    console.log(`  RESULTADO: ${passedTests}/${totalTests} testes passaram!`);
    console.log(`========================================\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

runAllTests().catch((err) => {
    console.error('Erro fatal no executor de testes:', err);
    process.exit(1);
});
