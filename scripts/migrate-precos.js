/**
 * Script de Migração de Preços no Firestore (RF06, CA05)
 * 
 * Atualiza todos os documentos da coleção 'produtos' para:
 * - preco_centavos (inteiro em centavos)
 * - preco_sob_consulta (booleano)
 * - preco (string formatada em BRL: "R$ X.XXX,XX" ou "Sob consulta")
 * 
 * Uso:
 *   node scripts/migrate-precos.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');
const {
    parsePrecoParaCentavos,
    formatarPrecoCentavos,
    isSobConsulta
} = require('../js/shared/catalogo-data.js');

const PROJECT_ID = 'paco-moveis';
const isDryRun = process.argv.includes('--dry-run');

function getFirebaseCliToken() {
    try {
        const cfgPath = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
        if (fs.existsSync(cfgPath)) {
            const data = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
            if (data.tokens && data.tokens.access_token) {
                return data.tokens.access_token;
            }
        }
    } catch (_) {}
    return null;
}

function httpsRequest(url, options = {}, postData = null) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const req = https.request(parsed, options, (res) => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    buffer,
                    text: buffer.toString('utf8')
                });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function runMigration() {
    console.log(`\n============================================================`);
    console.log(`🚀 Iniciando Migração de Preços: paco-moveis`);
    console.log(`Modo: ${isDryRun ? 'DRY-RUN (Simulação - sem alterações)' : 'PRODUÇÃO (Grava no Firestore)'}`);
    console.log(`============================================================\n`);

    const token = getFirebaseCliToken();
    if (!token) {
        console.error('❌ Token do Firebase CLI não encontrado em ~/.config/configstore/firebase-tools.json.');
        console.error('   Certifique-se de executar `firebase login` antes.');
        process.exit(1);
    }

    const listUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/produtos`;
    const res = await httpsRequest(listUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    if (res.statusCode !== 200) {
        console.error(`❌ Erro ao listar produtos do Firestore: HTTP ${res.statusCode}`);
        console.error(res.text);
        process.exit(1);
    }

    const body = JSON.parse(res.text);
    const docs = body.documents || [];
    console.log(`Encontrados ${docs.length} documentos em 'produtos'.\n`);

    let migrated = 0;
    let unchanged = 0;
    let errors = 0;

    for (const doc of docs) {
        const docId = doc.name.split('/').pop();
        const fields = doc.fields || {};

        const nome = fields.nome?.stringValue || '(Sem Nome)';
        const rawPreco = fields.preco?.stringValue || '';
        const existingCentavos = fields.preco_centavos?.integerValue ? Number(fields.preco_centavos.integerValue) : null;
        const existingSobConsulta = fields.preco_sob_consulta?.booleanValue || false;

        const sobConsulta = existingSobConsulta || isSobConsulta(rawPreco);
        let targetCentavos = null;
        if (!sobConsulta) {
            if (existingCentavos !== null && existingCentavos > 0) {
                targetCentavos = existingCentavos;
            } else {
                targetCentavos = parsePrecoParaCentavos(rawPreco);
            }
        }

        const targetPrecoStr = sobConsulta || targetCentavos === null
            ? 'Sob consulta'
            : formatarPrecoCentavos(targetCentavos);

        const jaAtualizado = (
            (sobConsulta && existingSobConsulta && rawPreco === 'Sob consulta') ||
            (!sobConsulta && existingCentavos === targetCentavos && rawPreco === targetPrecoStr)
        );

        if (jaAtualizado) {
            console.log(`  ℹ️  [OK] ${docId} ("${nome}") já está no padrão: ${targetPrecoStr}`);
            unchanged++;
            continue;
        }

        console.log(`  🔄 [MIGRAR] ${docId} ("${nome}"):`);
        console.log(`     - Antes : preco = "${rawPreco}", preco_centavos = ${existingCentavos}`);
        console.log(`     - Depois: preco = "${targetPrecoStr}", preco_centavos = ${targetCentavos}, sob_consulta = ${sobConsulta}`);

        if (isDryRun) {
            migrated++;
            continue;
        }

        // Monta o PATCH do documento no Firestore
        const patchFields = {
            preco: { stringValue: targetPrecoStr },
            preco_sob_consulta: { booleanValue: sobConsulta }
        };
        let mask = 'updateMask.fieldPaths=preco&updateMask.fieldPaths=preco_sob_consulta';

        if (targetCentavos !== null) {
            patchFields.preco_centavos = { integerValue: String(targetCentavos) };
            mask += '&updateMask.fieldPaths=preco_centavos';
        }

        const patchUrl = `https://firestore.googleapis.com/v1/${doc.name}?${mask}`;
        const patchRes = await httpsRequest(patchUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }, JSON.stringify({ fields: patchFields }));

        if (patchRes.statusCode === 200) {
            console.log(`     ✅ Atualizado com sucesso!`);
            migrated++;
        } else {
            console.error(`     ❌ Falha ao atualizar: HTTP ${patchRes.statusCode}`);
            console.error(`        ${patchRes.text}`);
            errors++;
        }
    }

    console.log(`\n============================================================`);
    console.log(`📊 Resultado da Migração:`);
    console.log(`   - Atualizados: ${migrated}`);
    console.log(`   - Inalterados: ${unchanged}`);
    console.log(`   - Erros      : ${errors}`);
    console.log(`============================================================\n`);
}

if (require.main === module) {
    runMigration().catch(err => {
        console.error('Erro fatal durante a migração:', err);
        process.exit(1);
    });
}

module.exports = { runMigration };
