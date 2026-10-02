import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function offlineShellPlugin() {
  return {
    name: 'offline-shell',
    apply: 'build',
    generateBundle(_, bundle) {
      const precacheUrls = [
        '/index.html',
        '/manifest.webmanifest',
        '/minesight-icon.svg',
        '/minesight-logo.svg',
        '/coal-miners.webp',
        ...Object.keys(bundle)
          .filter((fileName) => fileName !== 'sw.js')
          .map((fileName) => `/${fileName}`),
      ]

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const CACHE_NAME = 'minesight-offline-v' + ${Date.now()};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => null)),
      );
      return results;
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith('minesight-offline-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        return cachedIndex || new Response('Offline app shell unavailable', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'));
    }),
  );
});`
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), offlineShellPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})