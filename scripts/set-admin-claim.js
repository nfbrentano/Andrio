/**
 * Utilitário Administrativo para Atribuição de Custom Claims no Firebase Auth
 * 
 * Requisitos:
 * 1. Chave privada da conta de serviço do Firebase (baixada do Firebase Console em
 *    Configurações do Projeto > Contas de Serviço > Gerar nova chave privada).
 * 2. Variável de ambiente GOOGLE_APPLICATION_CREDENTIALS apontando para o arquivo .json da chave
 *    OU arquivo salvo como `serviceAccountKey.json` na raiz do projeto (não comitar no git!).
 * 3. Dependência: npm install firebase-admin
 * 
 * Uso:
 *   node scripts/set-admin-claim.js <email-ou-uid>
 * 
 * Exemplo:
 *   node scripts/set-admin-claim.js admin@pacomoveis.com.br
 */

const fs = require('fs');
const path = require('path');

async function main() {
    const targetIdentifier = process.argv[2];

    if (!targetIdentifier) {
        console.error('Uso: node scripts/set-admin-claim.js <email-ou-uid>');
        process.exit(1);
    }

    let admin;
    try {
        admin = require('firebase-admin');
    } catch (e) {
        console.error('Erro: o pacote "firebase-admin" não está instalado.');
        console.error('Por favor, execute: npm install firebase-admin');
        process.exit(1);
    }

    // Inicialização do Firebase Admin SDK
    if (!admin.apps.length) {
        const localKeyPath = path.resolve(__dirname, '../serviceAccountKey.json');
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        } else if (fs.existsSync(localKeyPath)) {
            const serviceAccount = require(localKeyPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            console.error('Erro: credenciais do Firebase Admin SDK não encontradas.');
            console.error('Defina a variável GOOGLE_APPLICATION_CREDENTIALS ou adicione serviceAccountKey.json');
            process.exit(1);
        }
    }

    try {
        let user;
        if (targetIdentifier.includes('@')) {
            user = await admin.auth().getUserByEmail(targetIdentifier.trim());
        } else {
            user = await admin.auth().getUser(targetIdentifier.trim());
        }

        console.log(`Usuário encontrado: ${user.email} (UID: ${user.uid})`);
        console.log(`Claims atuais:`, user.customClaims || {});

        // Define a claim { admin: true }
        await admin.auth().setCustomUserClaims(user.uid, {
            ...(user.customClaims || {}),
            admin: true
        });

        const updatedUser = await admin.auth().getUser(user.uid);
        console.log(`Sucesso: Claim 'admin: true' atribuída com sucesso a ${updatedUser.email}!`);
        console.log(`Claims atualizadas:`, updatedUser.customClaims);
        console.log(`Nota: O usuário precisará deslogar e relogar para atualizar seu ID Token.`);
    } catch (err) {
        console.error('Erro ao definir custom claim:', err.message);
        process.exit(1);
    }
}

main();
