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
            if (!FirebaseService.isConfigured || !FirebaseService.auth) {
                throw new Error('Serviço de autenticação do Firebase indisponível.');
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

    // Protege a rota administrativa (admin.html) - RF04, CA04
    async requireAuth() {
        const isConnected = FirebaseService.init();

        if (typeof firebase === 'undefined' || !isConnected || !FirebaseService.isConfigured || !FirebaseService.auth) {
            console.warn('[Auth] Firebase indisponível ou SDK bloqueado. Redirecionando para login.');
            window.location.replace('login.html?redirect=admin.html');
            return false;
        }

        const user = await this.getCurrentUser();
        if (!user) {
            console.info('[Auth] Acesso não autenticado. Redirecionando para login.');
            window.location.replace('login.html?redirect=admin.html');
            return false;
        }

        return user;
    }
};

window.Auth = Auth;
