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

const FirebaseService = {
    app: null,
    auth: null,
    db: null,
    storage: null,
    isConfigured: false,

    // Retorna a configuração salva no localStorage ou a configuração padrão do projeto
    getConfig() {
        const saved = localStorage.getItem('firebase_config');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('[Firebase] Erro ao parsear firebase_config do localStorage:', e);
            }
        }
        return DEFAULT_FIREBASE_CONFIG;
    },

    saveConfig(configObj) {
        if (!configObj || !configObj.projectId || !configObj.apiKey) {
            throw new Error('Configuração do Firebase inválida. apiKey e projectId são obrigatórios.');
        }
        localStorage.setItem('firebase_config', JSON.stringify(configObj));
        this.init();
    },

    clearConfig() {
        localStorage.removeItem('firebase_config');
        this.init();
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

            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.storage = firebase.storage();
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
