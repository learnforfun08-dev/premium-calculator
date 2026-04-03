/* ================================================================
   Premium Calculator — Service Worker
   Strategy:
     • App shell (index.html + icons) → Cache First
     • Google Fonts                   → Stale-While-Revalidate
     • Everything else                → Network First w/ cache fallback
================================================================ */

const CACHE_NAME   = 'premium-calc-v1';
const FONT_CACHE   = 'premium-calc-fonts-v1';

/* All files that make up the app shell — must be served for offline */
const APP_SHELL = [
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png'
];

/* ----------------------------------------------------------------
   INSTALL — pre-cache the app shell
---------------------------------------------------------------- */
self.addEventListener('install', event => {
    console.log('[SW] Installing…');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Pre-caching app shell');
                /* Use individual adds so one 404 doesn't break everything */
                return Promise.allSettled(
                    APP_SHELL.map(url => cache.add(url).catch(e => console.warn('[SW] Could not cache:', url, e)))
                );
            })
            .then(() => self.skipWaiting())   /* activate immediately */
    );
});

/* ----------------------------------------------------------------
   ACTIVATE — delete old caches
---------------------------------------------------------------- */
self.addEventListener('activate', event => {
    console.log('[SW] Activating…');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME && k !== FONT_CACHE)
                    .map(k => {
                        console.log('[SW] Deleting old cache:', k);
                        return caches.delete(k);
                    })
            )
        ).then(() => self.clients.claim())    /* take control of all open tabs */
    );
});

/* ----------------------------------------------------------------
   FETCH — routing logic
---------------------------------------------------------------- */
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    /* 1. Google Fonts — Stale-While-Revalidate */
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(staleWhileRevalidate(event.request, FONT_CACHE));
        return;
    }

    /* 2. App shell files — Cache First */
    if (url.pathname === '/' ||
        url.pathname.endsWith('index.html') ||
        url.pathname.endsWith('manifest.json') ||
        url.pathname.includes('/icons/')) {
        event.respondWith(cacheFirst(event.request, CACHE_NAME));
        return;
    }

    /* 3. Everything else — Network First with cache fallback */
    event.respondWith(networkFirst(event.request, CACHE_NAME));
});

/* ----------------------------------------------------------------
   STRATEGY HELPERS
---------------------------------------------------------------- */

/** Cache First: serve from cache, fall back to network & update cache */
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        console.warn('[SW] Cache first — network failed, no cache for:', request.url);
        return new Response('Offline — resource not cached', { status: 503, statusText: 'Service Unavailable' });
    }
}

/** Network First: try network, fall back to cache */
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

/** Stale-While-Revalidate: serve cache immediately, update in background */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then(response => {
        if (response && response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);   /* if network fails, fallback handled below */

    return cached || fetchPromise;
}

/* ----------------------------------------------------------------
   MESSAGE — allow pages to trigger SW actions
---------------------------------------------------------------- */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => console.log('[SW] Cache cleared'));
    }
});
