/**
 * Service Worker - PACO Móveis
 * Estratégia de Cache e PWA
 */

// Versão injetada automaticamente no build/deploy via GitHub Actions
const BUILD_VERSION = '__BUILD_VERSION__';
const VERSION = (BUILD_VERSION && !BUILD_VERSION.startsWith('__'))
    ? BUILD_VERSION.slice(0, 8)
    : 'v20';

const CACHE_NAME = `paco-cache-${VERSION}`;
const RUNTIME_CACHE_NAME = `paco-runtime-${VERSION}`;
const MAX_RUNTIME_ITEMS = 60;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias de retenção máxima para runtime

// Recursos estáticos essenciais pré-cacheados na instalação (apenas assets públicos)
const PRECACHE_ASSETS = [
    './',
    'index.html',
    'catalogo.html',
    'produto.html',
    'manifest.json',
    'css/style.css',
    'css/antigravity.min.css',
    'js/shared/security.js',
    'js/shared/contatos.js',
    'js/shared/catalogo-data.js',
    'js/shared/ui.js',
    'js/app.js',
    'js/firebase-config.js',
    'js/catalogo.js',
    'js/produto.js',
    'assets/logo.webp',
    'assets/imagem-indisponivel.svg',
    'assets/produtos/poltrona_azul_1.webp',
    'assets/produtos/poltrona_azul_2.webp',
    'assets/produtos/novo_movel_1.webp',
    'assets/produtos/kit_poltronas.webp',
    'assets/produtos/poltrona_guerra.webp',
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
    'assets/prod_cadeira.webp',
    'assets/prod_mesa.webp',
    'assets/prod_luminaria.webp'
];

/**
 * Limita a quantidade de entradas em um cache (FIFO eviction)
 */
async function limitCacheEntries(cacheName, maxItems) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        if (keys.length > maxItems) {
            const excess = keys.length - maxItems;
            const itemsToDelete = keys.slice(0, excess);
            await Promise.all(itemsToDelete.map((req) => cache.delete(req)));
        }
    } catch (err) {
        console.warn('[SW] Erro ao limitar tamanho do cache:', err);
    }
}

/**
 * Identifica se a requisição é para uma imagem
 */
function isImageRequest(request, url) {
    return request.destination === 'image' ||
        /\.(webp|png|jpg|jpeg|svg|gif|avif|ico)(\?.*)?$/i.test(url.pathname) ||
        url.hostname.includes('googleusercontent.com');
}

/**
 * Identifica se a requisição é para CSS ou JS
 */
function isCssOrJsRequest(request, url) {
    return request.destination === 'style' ||
        request.destination === 'script' ||
        /\.(css|js)(\?.*)?$/i.test(url.pathname);
}

// Event Listeners do Service Worker
if (typeof self !== 'undefined') {
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
        const expectedCaches = [CACHE_NAME, RUNTIME_CACHE_NAME];
        event.waitUntil(
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.map((key) => {
                        if (!expectedCaches.includes(key)) {
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

        // Ignora requisições não-GET e esquemas não-HTTP
        if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
            return;
        }

        // Não intercepta chamadas às APIs externas (Firebase, Google Auth, etc)
        if (url.hostname.includes('firestore.googleapis.com') ||
            url.hostname.includes('identitytoolkit.googleapis.com') ||
            url.hostname.includes('firebasestorage.googleapis.com') ||
            url.hostname.includes('securetoken.googleapis.com')) {
            return;
        }

        // 1. Para navegações de página (HTML): Network-First (com fallback de cache)
        if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
            event.respondWith(
                fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        return caches.match(request, { ignoreSearch: true }).then((cached) => {
                            return cached || caches.match('index.html');
                        });
                    })
            );
            return;
        }

        // 2. Para CSS e JS: Network-First (com fallback de cache) para garantir atualizações imediatas em deploy
        if (isCssOrJsRequest(request, url)) {
            event.respondWith(
                fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        return caches.match(request);
                    })
            );
            return;
        }

        // 3. Para Imagens: Cache-First com expiração e limite máximo no cache de runtime
        if (isImageRequest(request, url)) {
            event.respondWith(
                caches.match(request).then(async (cachedResponse) => {
                    if (cachedResponse) {
                        const dateHeader = cachedResponse.headers.get('date');
                        const isExpired = dateHeader && (Date.now() - new Date(dateHeader).getTime() > MAX_AGE_MS);
                        if (!isExpired) {
                            return cachedResponse;
                        }
                    }

                    try {
                        const networkResponse = await fetch(request);
                        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                            const responseClone = networkResponse.clone();
                            caches.open(RUNTIME_CACHE_NAME).then(async (cache) => {
                                await cache.put(request, responseClone);
                                await limitCacheEntries(RUNTIME_CACHE_NAME, MAX_RUNTIME_ITEMS);
                            });
                        }
                        return networkResponse;
                    } catch (err) {
                        return cachedResponse || caches.match('assets/imagem-indisponivel.svg');
                    }
                })
            );
            return;
        }

        // 4. Demais assets estáticos (Fontes, Manifest, etc.): Stale-While-Revalidate
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(RUNTIME_CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);

                return cachedResponse || fetchPromise;
            })
        );
    });
}

// Exporta para testes se em ambiente Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BUILD_VERSION,
        VERSION,
        CACHE_NAME,
        RUNTIME_CACHE_NAME,
        MAX_RUNTIME_ITEMS,
        MAX_AGE_MS,
        PRECACHE_ASSETS,
        limitCacheEntries,
        isImageRequest,
        isCssOrJsRequest
    };
}
