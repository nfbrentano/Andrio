/**
 * Módulo de Autenticação Firebase Auth para PACO Móveis Admin
 */

const Auth = {
    // Retorna a promessa com o usuário atual ou null
    getCurrentUser() {
        return new Promise((resolve) => {
            if (!FirebaseService.isConfigured || !FirebaseService.auth) {
                resolve(null);
                return;
            }

            const unsubscribe = FirebaseService.auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            }, (err) => {
                console.error('[Auth] Erro no listener de auth:', err);
                resolve(null);
            });
        });
    },

    // Efetua login com e-mail e senha no Firebase
    async signIn(email, password) {
        if (!FirebaseService.isConfigured || !FirebaseService.auth) {
            FirebaseService.init();
            if (!FirebaseService.isConfigured) {
                throw new Error('Firebase não configurado. Por favor, cole as credenciais do seu projeto Firebase.');
            }
        }

        try {
            const userCredential = await FirebaseService.auth.signInWithEmailAndPassword(
                email.trim(),
                password
            );
            return userCredential.user;
        } catch (error) {
            let message = error.message;
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                message = 'E-mail ou senha incorretos.';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Muitas tentativas sem sucesso. Aguarde alguns instantes.';
            }
            throw new Error(message);
        }
    },

    // Efetua logout
    async signOut() {
        if (FirebaseService.auth) {
            try {
                await FirebaseService.auth.signOut();
            } catch (err) {
                console.warn('[Auth] Erro ao deslogar:', err);
            }
        }
        sessionStorage.removeItem('paco_admin_authenticated');
        window.location.href = 'login.html';
    },

    // Protege a rota administrativa (admin.html)
    async requireAuth() {
        FirebaseService.init();

        if (FirebaseService.isConfigured) {
            const user = await this.getCurrentUser();
            if (!user) {
                window.location.href = 'login.html?redirect=admin.html';
                return false;
            }
            return user;
        } else {
            console.warn('[Auth] Modo Demonstração Local ativo (sem Firebase configurado).');
            return { email: 'admin@local.demo', isDemo: true };
        }
    }
};

window.Auth = Auth;
