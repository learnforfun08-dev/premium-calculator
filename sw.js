/* ================================================================
   Premium Calculator — Service Worker  (GitHub Pages build)
   Scope: /premium-calculator/
================================================================ */

const CACHE_NAME = 'premium-calc-v2';
const FONT_CACHE = 'premium-calc-fonts-v1';
const BASE       = '/premium-calculator';

const APP_SHELL = [
    BASE + '/',
    BASE + '/index.html',
    BASE + '/manifest.json',
    BASE + '/icons/icon-192.png',
    BASE + '/icons/icon-512.png',
    BASE + '/icons/icon-maskable-192.png',
    BASE + '/icons/icon-maskable-512.png'
];

/* ----------------------------------------------------------------
   INSTALL — pre-cache the app shell
---------------------------------------------------------------- */
self.addEventListener('install', event => {
    console.log('[SW] Installing v2…');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            Promise.allSettled(
                APP_SHELL.map(url =>
                    cache.add(url).catch(e => console.warn('[SW] Could not cache:', url, e))
                )
            )
        ).then(() => self.skipWaiting())
    );
});

/* ----------------------------------------------------------------
   ACTIVATE — delete old caches, claim all clients
---------------------------------------------------------------- */
self.addEventListener('activate', event => {
    console.log('[SW] Activating v2…');
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME && k !== FONT_CACHE)
                    .map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

/* ----------------------------------------------------------------
   FETCH — routing
---------------------------------------------------------------- */
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    /* Skip non-GET */
    if (event.request.method !== 'GET') return;

    /* Google Fonts → stale-while-revalidate */
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(staleWhileRevalidate(event.request, FONT_CACHE));
        return;
    }

    /* App shell → cache first */
    if (url.hostname === self.location.hostname &&
        url.pathname.startsWith(BASE)) {
        event.respondWith(cacheFirst(event.request, CACHE_NAME));
        return;
    }

    /* Everything else → network first */
    event.respondWith(networkFirst(event.request, CACHE_NAME));
});

/* ----------------------------------------------------------------
   STRATEGIES
---------------------------------------------------------------- */
async function cacheFirst(req, cacheName) {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
        const res = await fetch(req);
        if (res && res.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(req, res.clone());
        }
        return res;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

async function networkFirst(req, cacheName) {
    try {
        const res = await fetch(req);
        if (res && res.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(req, res.clone());
        }
        return res;
    } catch {
        return (await caches.match(req)) ||
               new Response('Offline', { status: 503 });
    }
}

async function staleWhileRevalidate(req, cacheName) {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(req);
    const fetchP = fetch(req).then(res => {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
    }).catch(() => cached);
    return cached || fetchP;
}

/* ----------------------------------------------------------------
   MESSAGES
---------------------------------------------------------------- */
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
    if (event.data?.type === 'CLEAR_CACHE') caches.delete(CACHE_NAME);
});
