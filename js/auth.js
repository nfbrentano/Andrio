/**
 * Módulo de Autenticação Supabase Auth para PACO Móveis Admin
 */

const Auth = {
    client: null,

    // Inicializa o cliente Supabase para Auth
    getClient() {
        if (this.client) return this.client;
        
        const url = localStorage.getItem('supabase_url');
        const key = localStorage.getItem('supabase_key');

        if (url && key && window.supabase) {
            this.client = window.supabase.createClient(url, key);
            return this.client;
        }
        return null;
    },

    // Retorna a sessão ativa atual
    async getSession() {
        const client = this.getClient();
        if (!client) return null;

        try {
            const { data, error } = await client.auth.getSession();
            if (error) {
                console.error('[Auth] Erro ao obter sessão:', error.message);
                return null;
            }
            return data.session;
        } catch (err) {
            console.error('[Auth] Exceção ao obter sessão:', err);
            return null;
        }
    },

    // Retorna o usuário logado atualmente
    async getUser() {
        const session = await this.getSession();
        return session ? session.user : null;
    },

    // Efetua login com email e senha
    async signIn(email, password) {
        const client = this.getClient();
        if (!client) {
            throw new Error('Supabase não configurado. Por favor, configure a URL e a Anon Key no Painel ou na tela de Login.');
        }

        const { data, error } = await client.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });

        if (error) {
            throw error;
        }

        return data;
    },

    // Efetua logout
    async signOut() {
        const client = this.getClient();
        if (client) {
            try {
                await client.auth.signOut();
            } catch (err) {
                console.warn('[Auth] Erro ao deslogar:', err);
            }
        }
        sessionStorage.removeItem('paco_admin_authenticated');
        window.location.href = 'login.html';
    },

    // Protege a página de administração (chamar no carregamento do admin.html)
    async requireAuth() {
        const url = localStorage.getItem('supabase_url');
        const key = localStorage.getItem('supabase_key');

        // Se o Supabase estiver configurado, exige autenticação real
        if (url && key) {
            const session = await this.getSession();
            if (!session) {
                // Redireciona para o login salvando a intenção de retorno
                window.location.href = 'login.html?redirect=admin.html';
                return false;
            }
            return session.user;
        } else {
            // Se estiver em modo local/demo sem Supabase configurado, permite acesso direto com aviso
            console.warn('[Auth] Modo Demonstração Local ativo (sem Supabase configurado).');
            return { email: 'admin@local.demo', isDemo: true };
        }
    }
};

window.Auth = Auth;
