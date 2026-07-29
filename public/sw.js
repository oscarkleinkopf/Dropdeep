const CACHE_NAME = 'dropdeep-cache-v5';
const BASE = new URL('.', self.location.href).pathname;
const ASSETS_TO_CACHE = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  `${BASE}icon-512.png`,
  `${BASE}icon-192.png`,
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://unpkg.com/lucide@latest'
];

// Install Event - Pre-cache Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching App Shell assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[Service Worker] Failed to cache some assets during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache First Strategy with Network Fallback
self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  // Skip caching for external API endpoints (e.g. Gemini generative API)
  if (url.hostname.includes('googleapis.com')) {
    return;
  }

  // Skip bypass for other origins that don't need offline caching (unless static fonts/cdns)
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts') && !url.hostname.includes('cdn') && !url.hostname.includes('unpkg')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Return cached asset, fetch update in background
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => { /* ignore network error when offline */ });
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(err => {
        // If offline and request is for page, return cached index
        if (event.request.mode === 'navigate') {
          return caches.match(`${BASE}index.html`) || caches.match(BASE);
        }
        throw err;
      });
    })
  );
});
