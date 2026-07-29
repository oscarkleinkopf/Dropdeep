const CACHE_NAME = 'dropdeep-cache-v6';
const BASE = new URL('.', self.location.href).pathname;
const ASSETS_TO_CACHE = [
  `${BASE}manifest.json`,
  `${BASE}icon-512.png`,
  `${BASE}icon-192.png`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS_TO_CACHE).catch(() => undefined)
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');
}

function isHashedAsset(url) {
  return url.pathname.includes('/assets/');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.hostname.includes('googleapis.com') || url.hostname.includes('supabase.co')) {
    return;
  }

  if (url.origin !== self.location.origin &&
      !url.hostname.includes('fonts') &&
      !url.hostname.includes('cdn') &&
      !url.hostname.includes('unpkg')) {
    return;
  }

  // Always prefer network for HTML and Vite hashed bundles (avoid stale CSS/JS after deploy)
  if (isNavigationRequest(event.request) || isHashedAsset(url)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && isHashedAsset(url)) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (isNavigationRequest(event.request)) {
            return caches.match(`${BASE}index.html`) || caches.match(BASE);
          }
          throw new Error('Offline');
        })
    );
    return;
  }

  // Other same-origin / CDN: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
