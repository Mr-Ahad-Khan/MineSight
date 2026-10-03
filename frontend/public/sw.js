// MineSight Service Worker - Complete Offline-First Caching Engine

const SHELL_CACHE = 'minesight-shell-v2';
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/minesight-icon.svg',
  '/minesight-logo.svg',
  '/minesight-logo-light.svg',
  '/coal-miners.webp',
];

// Offline fallback tile (256x256 SVG tile with subtle grid and terrain hint)
const FALLBACK_TILE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#e9ecef" stroke="#ced4da" stroke-width="0.5"/>
  <path d="M 0,64 L 256,64 M 0,128 L 256,128 M 0,192 L 256,192 M 64,0 L 64,256 M 128,0 L 128,256 M 192,0 L 192,256" stroke="#dee2e6" stroke-width="0.5"/>
  <text x="128" y="132" font-family="sans-serif" font-size="10" fill="#adb5bd" text-anchor="middle">MineSight Offline Grid</text>
</svg>
`.trim();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_ASSETS.map((url) => cache.add(url).catch(() => null))
      );
      return results;
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith('minesight-') &&
              ![SHELL_CACHE, TILE_CACHE, FONT_CACHE, RUNTIME_CACHE].includes(key)
          )
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass API requests to allow api.js interceptor / offlineStorage to handle data
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Leaflet Map Tiles (e.g. tile.openstreetmap.org)
  if (url.hostname.includes('tile.openstreetmap.org') || url.pathname.includes('/tiles/')) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(request).then((cachedTile) => {
          if (cachedTile) return cachedTile;

          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Return SVG grid tile fallback when offline
              return new Response(FALLBACK_TILE_SVG, {
                headers: { 'Content-Type': 'image/svg+xml' },
              });
            });
        })
      )
    );
    return;
  }

  // 2. Google Fonts & CDNs
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res && res.status === 200) {
              cache.put(request, res.clone());
            }
            return res;
          }).catch(() => caches.match(request));
        })
      )
    );
    return;
  }

  // 3. Navigation requests (App Shell)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/index.html');
        return (
          cached ||
          new Response('MineSight Offline Shell Ready', {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        );
      })
    );
    return;
  }

  // 4. Same-origin assets (JS, CSS, SVGs, WebP)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(async () => {
            if (request.destination === 'image') {
              return caches.match('/minesight-icon.svg');
            }
            return caches.match('/index.html');
          });
      })
    );
  }
});
