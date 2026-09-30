/**
 * Script de Migração de Imagens do Google Drive para WebP / Firebase Storage
 * 
 * Este script verifica todos os produtos cadastrados no Firestore (e/ou locais),
 * identifica imagens que apontam para URLs do Google Drive (thumbnail, file/d, etc.),
 * baixa as fotos diretamente com qualidade total, converte para WebP (≤1600px, q=82)
 * e atualiza os documentos do Firestore para evitar erros HTTP 429.
 * 
 * Uso:
 *   node scripts/migrate-drive-images.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

const PROJECT_ID = 'paco-moveis';
const ASSETS_OUTPUT_DIR = path.resolve(__dirname, '../assets/produtos');

// Mapeamento de IDs conhecidos para nomes amigáveis de arquivo
const KNOWN_NAMES = {
    '1W2L251aE7LfS7lz-kjSLkPO_H0FEy83H': 'poltrona_azul_1',
    '1vHrx6SoVnK025fC-eu76ev6e_mU8mPkW': 'poltrona_azul_2',
    '1GC67VMTBN85Jo5EcfMkF_Yh614Hv4yj4': 'novo_movel_1',
    '1l1uW6rBrH9X56f4wLEiusEVoeowFCxuc': 'kit_poltronas',
    '1MYogDCG3jGcAzl8-G9fbnFC42HwfE978': 'poltrona_guerra'
};

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

function isGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return /drive\.google\.com/i.test(trimmed) ||
           /docs\.google\.com/i.test(trimmed) ||
           /googleusercontent\.com\/d\//i.test(trimmed) ||
           /\/thumbnail\?id=/i.test(trimmed) ||
           !!extractDriveFileId(trimmed);
}

function getFirebaseCliToken() {
    try {
        const homedir = require('os').homedir();
        const cfgPath = path.join(homedir, '.config/configstore/firebase-tools.json');
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

async function downloadDriveImage(fileId) {
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
    const res = await httpsRequest(directUrl);
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return (await httpsRequest(res.headers.location)).buffer;
    }
    if (res.statusCode !== 200) {
        throw new Error(`HTTP ${res.statusCode} ao baixar imagem do Drive ID ${fileId}`);
    }
    return res.buffer;
}

function convertBufferToWebP(inputBuffer, outputFilename) {
    if (!fs.existsSync(ASSETS_OUTPUT_DIR)) {
        fs.mkdirSync(ASSETS_OUTPUT_DIR, { recursive: true });
    }

    const tempJpg = path.join(ASSETS_OUTPUT_DIR, `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
    const outputPath = path.join(ASSETS_OUTPUT_DIR, outputFilename);
    fs.writeFileSync(tempJpg, inputBuffer);

    try {
        // Tenta usar o python do venv do projeto com Pillow
        const venvPython = path.resolve(__dirname, '../venv/bin/python');
        const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';

        const script = `
from PIL import Image
import sys

img = Image.open(sys.argv[1]).convert('RGB')
w, h = img.size
max_dim = 1600
if w > max_dim or h > max_dim:
    if w > h:
        h = int(h * max_dim / w)
        w = max_dim
    else:
        w = int(w * max_dim / h)
        h = max_dim
    img = img.resize((w, h), Image.Resampling.LANCZOS)
img.save(sys.argv[2], 'WEBP', quality=82)
`;
        execSync(`${pythonCmd} -c "${script.replace(/"/g, '\\"')}" "${tempJpg}" "${outputPath}"`);
    } catch (err) {
        // Fallback: se não tiver python/pillow, tenta sips ou mantém como webp/jpeg
        try {
            execSync(`sips -s format jpeg "${tempJpg}" --out "${outputPath}" 2>/dev/null`);
        } catch (_) {
            fs.copyFileSync(tempJpg, outputPath);
        }
    } finally {
        if (fs.existsSync(tempJpg)) {
            try { fs.unlinkSync(tempJpg); } catch (_) {}
        }
    }

    return `assets/produtos/${outputFilename}`;
}

async function listFirestoreProducts(token) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/produtos`;
    const res = await httpsRequest(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (res.statusCode !== 200) {
        throw new Error(`Falha ao listar produtos do Firestore: ${res.statusCode} ${res.text}`);
    }

    const data = JSON.parse(res.text);
    return data.documents || [];
}

async function updateFirestoreProductImages(token, docName, newImg, newImagens) {
    const url = `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=img&updateMask.fieldPaths=imagens`;
    const body = JSON.stringify({
        fields: {
            img: { stringValue: newImg },
            imagens: {
                arrayValue: {
                    values: newImagens.map(u => ({ stringValue: u }))
                }
            }
        }
    });

    const res = await httpsRequest(url, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    }, body);

    if (res.statusCode !== 200) {
        throw new Error(`Falha ao atualizar documento no Firestore: ${res.statusCode} ${res.text}`);
    }
}

async function runMigration() {
    console.log('=== Início da Migração de Imagens do Google Drive ===');
    const isDryRun = process.argv.includes('--dry-run');
    if (isDryRun) {
        console.log('[DRY-RUN] Nenhuma alteração será persistida.');
    }

    const token = getFirebaseCliToken();
    if (!token) {
        console.error('Erro: Token do Firebase CLI não encontrado. Faça login com "npx firebase login".');
        process.exit(1);
    }

    console.log(`Conectando ao Firestore (${PROJECT_ID})...`);
    const docs = await listFirestoreProducts(token);
    console.log(`Encontrados ${docs.length} produtos no Firestore.`);

    let migratedProducts = 0;
    let totalImagesMigrated = 0;

    for (const doc of docs) {
        const docId = doc.name.split('/').pop();
        const fields = doc.fields || {};
        const nome = fields.nome ? fields.nome.stringValue : docId;
        const currentImg = fields.img ? fields.img.stringValue : '';
        const currentImagens = (fields.imagens && fields.imagens.arrayValue && fields.imagens.arrayValue.values)
            ? fields.imagens.arrayValue.values.map(v => v.stringValue)
            : [];

        const hasDriveImg = isGoogleDriveUrl(currentImg);
        const hasDriveGallery = currentImagens.some(u => isGoogleDriveUrl(u));

        if (!hasDriveImg && !hasDriveGallery) {
            console.log(`✔ [OK] Produto "${nome}" (${docId}) já não utiliza URLs do Drive.`);
            continue;
        }

        console.log(`\n🔄 Processando produto "${nome}" (${docId})...`);

        let newImg = currentImg;
        if (hasDriveImg) {
            const fileId = extractDriveFileId(currentImg);
            const baseName = KNOWN_NAMES[fileId] || `prod_${docId}_main`;
            const filename = `${baseName}.webp`;
            console.log(`  -> Baixando e otimizando imagem principal (${fileId})...`);
            try {
                const buf = await downloadDriveImage(fileId);
                newImg = convertBufferToWebP(buf, filename);
                console.log(`     Salvo como ${newImg}`);
                totalImagesMigrated++;
            } catch (err) {
                console.error(`     Erro ao migrar imagem principal: ${err.message}`);
            }
        }

        const newImagens = [];
        for (let i = 0; i < currentImagens.length; i++) {
            const url = currentImagens[i];
            if (isGoogleDriveUrl(url)) {
                const fileId = extractDriveFileId(url);
                const baseName = KNOWN_NAMES[fileId] || `prod_${docId}_${i + 1}`;
                const filename = `${baseName}.webp`;
                console.log(`  -> Baixando foto da galeria [${i + 1}/${currentImagens.length}] (${fileId})...`);
                try {
                    const buf = await downloadDriveImage(fileId);
                    const localPath = convertBufferToWebP(buf, filename);
                    newImagens.push(localPath);
                    console.log(`     Salvo como ${localPath}`);
                    totalImagesMigrated++;
                } catch (err) {
                    console.error(`     Erro na foto da galeria: ${err.message}`);
                    newImagens.push(url);
                }
            } else {
                newImagens.push(url);
            }
        }

        if (!isDryRun) {
            console.log(`  -> Atualizando documento ${docId} no Firestore...`);
            await updateFirestoreProductImages(token, doc.name, newImg, newImagens);
            console.log(`     Documento atualizado com sucesso!`);
        }

        migratedProducts++;
    }

    console.log('\n=== Resumo da Migração ===');
    console.log(`Total de produtos analisados: ${docs.length}`);
    console.log(`Produtos migrados: ${migratedProducts}`);
    console.log(`Total de imagens processadas para WebP: ${totalImagesMigrated}`);
    console.log('Status: Concluído com sucesso!\n');
}

if (require.main === module) {
    runMigration().catch(err => {
        console.error('Falha na migração:', err);
        process.exit(1);
    });
}

module.exports = {
    extractDriveFileId,
    isGoogleDriveUrl,
    downloadDriveImage,
    convertBufferToWebP
};
