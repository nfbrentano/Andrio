/**
 * Suite de Testes Automatizados - Preço Numérico e Formatação BRL
 * Cobre Requisitos: RF01, RF02, RF03, RF04, RF05, RF06, RNF01
 * Cobre Critérios de Aceitação: CA01, CA02, CA03, CA04, CA05, CA06
 * Cobre Casos de Teste: CT01, CT02, CT03, CT04, CT05
 */

const assert = require('assert');
const {
    formatarPrecoCentavos,
    parsePrecoParaCentavos,
    isSobConsulta,
    obterPrecoCentavos,
    formatarPrecoProduto,
    compararPreco,
    carregarProdutos,
    PRODUTOS_PADRAO
} = require('../js/shared/catalogo-data.js');

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
    console.log('🧪 Iniciando Testes: Preço Numérico e Formatação BRL');
    console.log('============================================================\n');

    // =========================================================================
    // CT01 / CA01: Formatação de Preço em BRL
    // =========================================================================
    console.log('💵 1. CT01 / CA01: Formatação de centavos para BRL:');

    runTest('formatarPrecoCentavos deve formatar 290000 centavos como "R$ 2.900,00" (CT01)', () => {
        const res = formatarPrecoCentavos(290000);
        assert.strictEqual(res, 'R$ 2.900,00');
    });

    runTest('formatarPrecoCentavos deve formatar 950000 centavos como "R$ 9.500,00" (CA01)', () => {
        const res = formatarPrecoCentavos(950000);
        assert.strictEqual(res, 'R$ 9.500,00');
    });

    runTest('formatarPrecoCentavos deve formatar 80000 centavos como "R$ 800,00"', () => {
        const res = formatarPrecoCentavos(80000);
        assert.strictEqual(res, 'R$ 800,00');
    });

    runTest('formatarPrecoCentavos deve formatar 289050 centavos como "R$ 2.890,50"', () => {
        const res = formatarPrecoCentavos(289050);
        assert.strictEqual(res, 'R$ 2.890,50');
    });

    runTest('formatarPrecoCentavos com valor nulo, zero ou inválido deve retornar "Sob consulta"', () => {
        assert.strictEqual(formatarPrecoCentavos(null), 'Sob consulta');
        assert.strictEqual(formatarPrecoCentavos(undefined), 'Sob consulta');
        assert.strictEqual(formatarPrecoCentavos(0), 'Sob consulta');
        assert.strictEqual(formatarPrecoCentavos(-500), 'Sob consulta');
        assert.strictEqual(formatarPrecoCentavos(NaN), 'Sob consulta');
    });

    // =========================================================================
    // CT02 / CA02: Máscara e Parsing no Admin
    // =========================================================================
    console.log('\n📝 2. CT02 / CA02: Máscara e Parsing do Preço no Admin:');

    runTest('parsePrecoParaCentavos deve converter "2.890,50" para 289050 (CT02)', () => {
        const centavos = parsePrecoParaCentavos('2.890,50');
        assert.strictEqual(centavos, 289050);
    });

    runTest('parsePrecoParaCentavos deve converter "1500" para 150000 (CA02)', () => {
        const centavos = parsePrecoParaCentavos('1500');
        assert.strictEqual(centavos, 150000);
        const formatado = formatarPrecoCentavos(centavos);
        assert.strictEqual(formatado, 'R$ 1.500,00');
    });

    runTest('parsePrecoParaCentavos deve aceitar "R$ 1.500,00" e converter para 150000', () => {
        const centavos = parsePrecoParaCentavos('R$ 1.500,00');
        assert.strictEqual(centavos, 150000);
    });

    runTest('parsePrecoParaCentavos deve aceitar "2890,50" e converter para 289050', () => {
        const centavos = parsePrecoParaCentavos('2890,50');
        assert.strictEqual(centavos, 289050);
    });

    runTest('parsePrecoParaCentavos deve tratar formato americano "1,500.50" corretamente', () => {
        const centavos = parsePrecoParaCentavos('1,500.50');
        assert.strictEqual(centavos, 150050);
    });

    // =========================================================================
    // CT03 / CA03 / CA04: Ordenação por Preço
    // =========================================================================
    console.log('\n📊 3. CT03 / CA03 / CA04: Ordenação Numérica e "Sob consulta":');

    runTest('compararPreco deve ordenar R$ 800, R$ 1.500 e R$ 9.500 em ordem crescente (CA03)', () => {
        const lista = [
            { nome: 'C', preco_centavos: 950000 },
            { nome: 'A', preco_centavos: 80000 },
            { nome: 'B', preco_centavos: 150000 }
        ];

        lista.sort((a, b) => compararPreco(a, b, 'asc'));

        assert.strictEqual(lista[0].nome, 'A', 'R$ 800 deve ser o primeiro');
        assert.strictEqual(lista[1].nome, 'B', 'R$ 1.500 deve ser o segundo');
        assert.strictEqual(lista[2].nome, 'C', 'R$ 9.500 deve ser o terceiro');
    });

    runTest('compararPreco deve colocar produto "Sob consulta" no fim na ordenação crescente (CA04)', () => {
        const lista = [
            { nome: 'Sob', preco_sob_consulta: true },
            { nome: 'C', preco_centavos: 950000 },
            { nome: 'A', preco_centavos: 80000 },
            { nome: 'B', preco_centavos: 150000 }
        ];

        lista.sort((a, b) => compararPreco(a, b, 'asc'));

        assert.strictEqual(lista[0].nome, 'A');
        assert.strictEqual(lista[1].nome, 'B');
        assert.strictEqual(lista[2].nome, 'C');
        assert.strictEqual(lista[3].nome, 'Sob', '"Sob consulta" deve ficar no fim');
    });

    runTest('compararPreco deve colocar produto "Sob consulta" no fim na ordenação decrescente (CA04)', () => {
        const lista = [
            { nome: 'Sob', preco_sob_consulta: true },
            { nome: 'C', preco_centavos: 950000 },
            { nome: 'A', preco_centavos: 80000 },
            { nome: 'B', preco_centavos: 150000 }
        ];

        lista.sort((a, b) => compararPreco(a, b, 'desc'));

        assert.strictEqual(lista[0].nome, 'C');
        assert.strictEqual(lista[1].nome, 'B');
        assert.strictEqual(lista[2].nome, 'A');
        assert.strictEqual(lista[3].nome, 'Sob', '"Sob consulta" deve ficar no fim também no decrescente');
    });

    // =========================================================================
    // CT04 / CA05 / RNF01: Compatibilidade Retroativa (Legado)
    // =========================================================================
    console.log('\n🕰️ 4. CT04 / CA05 / RNF01: Compatibilidade com Documentos Legados:');

    runTest('Documentos legados com preco: "8000" e "R$ 1.500,00" devem ser formatados corretamente (CT04)', () => {
        const doc1 = { nome: 'Móvel 1', preco: '8000' };
        const doc2 = { nome: 'Móvel 2', preco: 'R$ 1.500,00' };

        assert.strictEqual(formatarPrecoProduto(doc1), 'R$ 8.000,00');
        assert.strictEqual(formatarPrecoProduto(doc2), 'R$ 1.500,00');
    });

    runTest('Documentos legados com "9500" e "2900" devem ser convertidos para centavos e formatados', () => {
        const doc1 = { preco: '9500' };
        const doc2 = { preco: '2900' };

        assert.strictEqual(obterPrecoCentavos(doc1), 950000);
        assert.strictEqual(formatarPrecoProduto(doc1), 'R$ 9.500,00');

        assert.strictEqual(obterPrecoCentavos(doc2), 290000);
        assert.strictEqual(formatarPrecoProduto(doc2), 'R$ 2.900,00');
    });

    runTest('Documento legado com preco: "Sob consulta" deve ser identificado como sob consulta', () => {
        const doc = { preco: 'Sob consulta' };
        assert.strictEqual(obterPrecoCentavos(doc), null);
        assert.strictEqual(formatarPrecoProduto(doc), 'Sob consulta');
    });

    // =========================================================================
    // CT05 / CA06: Validação de Preço no Admin
    // =========================================================================
    console.log('\n🔒 5. CT05 / CA06: Validação de Preço Vazio ou Inválido no Admin:');

    runTest('parsePrecoParaCentavos deve retornar null para string vazia ou espaços (CA06)', () => {
        assert.strictEqual(parsePrecoParaCentavos(''), null);
        assert.strictEqual(parsePrecoParaCentavos('   '), null);
        assert.strictEqual(parsePrecoParaCentavos(null), null);
    });

    runTest('parsePrecoParaCentavos deve retornar null para valores <= 0', () => {
        assert.strictEqual(parsePrecoParaCentavos('0'), null);
        assert.strictEqual(parsePrecoParaCentavos('0,00'), null);
        assert.strictEqual(parsePrecoParaCentavos('-1500'), null);
    });

    runTest('Simulação de submissão do formulário do admin sem preço e sem sob consulta deve rejeitar (CA06)', () => {
        function simularSubmissaoAdmin({ precoInput, sobConsultaChecked }) {
            if (sobConsultaChecked) {
                return { sucesso: true, preco: 'Sob consulta', preco_centavos: null, preco_sob_consulta: true };
            }
            const rawPreco = (precoInput || '').trim();
            if (!rawPreco) {
                return { sucesso: false, erro: 'Preço vazio' };
            }
            const centavos = parsePrecoParaCentavos(rawPreco);
            if (centavos === null || isNaN(centavos) || centavos <= 0) {
                return { sucesso: false, erro: 'Preço inválido' };
            }
            return {
                sucesso: true,
                preco: formatarPrecoCentavos(centavos),
                preco_centavos: centavos,
                preco_sob_consulta: false
            };
        }

        // Caso negativo: Vazio
        const resVazio = simularSubmissaoAdmin({ precoInput: '', sobConsultaChecked: false });
        assert.strictEqual(resVazio.sucesso, false);
        assert.strictEqual(resVazio.erro, 'Preço vazio');

        // Caso negativo: Zero
        const resZero = simularSubmissaoAdmin({ precoInput: '0', sobConsultaChecked: false });
        assert.strictEqual(resZero.sucesso, false);
        assert.strictEqual(resZero.erro, 'Preço inválido');

        // Caso positivo: Com Sob consulta marcado
        const resSob = simularSubmissaoAdmin({ precoInput: '', sobConsultaChecked: true });
        assert.strictEqual(resSob.sucesso, true);
        assert.strictEqual(resSob.preco, 'Sob consulta');
        assert.strictEqual(resSob.preco_sob_consulta, true);
        assert.strictEqual(resSob.preco_centavos, null);

        // Caso positivo: Com valor preenchido "1500" (CA02)
        const resValido = simularSubmissaoAdmin({ precoInput: '1500', sobConsultaChecked: false });
        assert.strictEqual(resValido.sucesso, true);
        assert.strictEqual(resValido.preco, 'R$ 1.500,00');
        assert.strictEqual(resValido.preco_centavos, 150000);
        assert.strictEqual(resValido.preco_sob_consulta, false);
    });

    // =========================================================================
    // 6. PRODUTOS_PADRAO e carregarProdutos
    // =========================================================================
    console.log('\n📦 6. PRODUTOS_PADRAO e Normalização Unificada:');

    runTest('PRODUTOS_PADRAO deve conter preco_centavos e preco formatado em todos os itens', () => {
        PRODUTOS_PADRAO.forEach(p => {
            assert.ok(typeof p.preco_centavos === 'number', `Produto ${p.nome} deve ter preco_centavos numérico`);
            assert.ok(p.preco_centavos > 0, `Produto ${p.nome} deve ter centavos > 0`);
            assert.strictEqual(p.preco_sob_consulta, false);
            assert.strictEqual(p.preco, formatarPrecoCentavos(p.preco_centavos));
        });
    });

    await runAsyncTest('carregarProdutos no modo fallback deve retornar produtos com preços devidamente normalizados', async () => {
        const produtos = await carregarProdutos();
        assert.ok(Array.isArray(produtos) && produtos.length >= 4);
        produtos.forEach(p => {
            assert.ok(typeof p.preco_centavos === 'number');
            assert.strictEqual(p.preco, formatarPrecoCentavos(p.preco_centavos));
        });
    });

    console.log('\n============================================================');
    console.log(`📊 Resultado dos Testes: ${passedTests} passaram, ${totalTests - passedTests} falharam`);
    console.log('============================================================\n');

    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

if (require.main === module) {
    runAllTests().catch(err => {
        console.error('Erro na execução dos testes:', err);
        process.exit(1);
    });
}

module.exports = { runAllTests };
