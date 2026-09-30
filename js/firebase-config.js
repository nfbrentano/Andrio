/**
 * Configuração e Inicialização do Firebase para PACO Móveis
 * Suporta Firestore, Firebase Auth e Firebase Storage.
 */

// Configuração oficial do projeto paco-moveis
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC4bUfj-xdzCroTtpa5TdNTlLQagVQwWew",
  authDomain: "paco-moveis.firebaseapp.com",
  projectId: "paco-moveis",
  storageBucket: "paco-moveis.firebasestorage.app",
  messagingSenderId: "650992237551",
  appId: "1:650992237551:web:216835d2f8096068f9941a",
  measurementId: "G-92CT0SN53F"
};

// Remove qualquer configuração legada salva no localStorage para impedir substituição via cliente (RF07, CA06)
try {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('firebase_config');
    }
} catch (e) {
    // Silencia eventuais restrições de storage do navegador
}

const FirebaseService = {
    app: null,
    auth: null,
    db: null,
    storage: null,
    isConfigured: false,

    // Retorna a configuração estrita e oficial do projeto (RF07)
    getConfig() {
        return DEFAULT_FIREBASE_CONFIG;
    },

    init() {
        if (typeof firebase === 'undefined') {
            console.warn('[Firebase] SDK do Firebase ainda não carregado no DOM.');
            return false;
        }

        const config = this.getConfig();
        if (!config || !config.apiKey) {
            this.isConfigured = false;
            return false;
        }

        try {
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(config);
            } else {
                this.app = firebase.app();
            }

            if (typeof firebase.auth === 'function') this.auth = firebase.auth();
            if (typeof firebase.firestore === 'function') this.db = firebase.firestore();
            if (typeof firebase.storage === 'function') this.storage = firebase.storage();
            this.isConfigured = true;

            console.log('[Firebase] Conectado com sucesso ao projeto:', config.projectId);
            return true;
        } catch (err) {
            console.error('[Firebase] Erro ao inicializar:', err);
            this.isConfigured = false;
            return false;
        }
    }
};

// Auto inicializa se o SDK do Firebase já estiver carregado
if (typeof firebase !== 'undefined') {
    FirebaseService.init();
}

window.FirebaseService = FirebaseService;
