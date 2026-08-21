const CACHE_NAME = 'paco-cache-v1';

// Recursos estáticos essenciais pré-cacheados na instalação
const PRECACHE_ASSETS = [
    './',
    'index.html',
    'admin.html',
    'css/style.css',
    'css/antigravity.min.css',
    'css/admin.css',
    'js/app.js',
    'js/admin.js',
    'assets/hero_left_chair.webp',
    'assets/hero_right_chair.webp',
    'assets/hero_product.webp',
    'assets/middle_model.webp',
    'assets/pana_06.webp',
    'assets/people_grid_1.webp',
    'assets/people_grid_2.webp',
    'assets/people_grid_3.webp',
    'assets/people_grid_4.webp',
    'assets/lineup_products.webp',
    'assets/prod_poltrona.webp',
    'assets/prod_sofa.webp',
    'assets/prod_cadeira.webp',
    'assets/prod_mesa.webp',
    'assets/prod_shampoo.webp',
    'assets/prod_condicionador.webp',
    'assets/prod_creme.webp',
    'assets/prod_mascara.webp'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('[SW] Falha ao pré-cachear alguns itens:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptação de requisições de rede
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Ignora requisições não-GET e extensões/esquemas não-HTTP
    if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
        return;
    }

    // Não intercepta chamadas à API REST/Realtime do Supabase
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // Para navegações de página (HTML): Network-First (com fallback de cache)
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return networkResponse;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match('index.html')))
        );
        return;
    }

    // Para assets estáticos (Imagens, CSS, JS, CDNs): Stale-While-Revalidate / Cache-First
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            // Retorna o cache imediatamente se existir, caso contrário aguarda a rede
            return cachedResponse || fetchPromise;
        })
    );
});
