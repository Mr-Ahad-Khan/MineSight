const SHELL_CACHE = 'minesight-shell-v' + 1791194060548;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-Ch_F0SEL.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-3smhuWLz.js","/assets/Layout-q5nCoC6k.js","/assets/HomePage-U1zkP5Dm.js","/assets/sun-BeFn-k1H.js","/assets/Login-D_an5r1A.js","/assets/languages-Cc7d-GYI.js","/assets/Register-B2357uNF.js","/assets/ReCAPTCHA-CEJpgqUZ.js","/assets/BrandLogo-BKq2SIn7.js","/assets/CreateInspection-D2jvTLOs.js","/assets/eye-CqZDJ5y1.js","/assets/Inspections-6HelDKIg.js","/assets/Dashboard-B7-EvhRV.js","/assets/clipboard-list-DYCchugg.js","/assets/building-2-DXQnguvo.js","/assets/InspectionDetail-7TrcM5NJ.js","/assets/RiskAnalysisModal-Ciki3H6F.js","/assets/CameraCaptureModal-RP4Gy3wP.js","/assets/check-Dqwlr94u.js","/assets/circle-check-big-B7t4hgcw.js","/assets/zoom-out-3Qe0VxLU.js","/assets/Compliances-BehvInwD.js","/assets/Mines-DhSuT9Ek.js","/assets/hooks-DH1lmx09.js","/assets/leafletAssets-BMdjQEoG.js","/assets/MineralResourcesDashboard-_NT2CjQQ.js","/assets/loader-circle-DqJU4Dvl.js","/assets/Contractors-CB9Ql-vu.js","/assets/Alerts-DwOQCSfi.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DjIW1lUq.js","/assets/PieChart-DH5XPmxy.js","/assets/Chat-DRSFucIO.js","/assets/bot-BRVWIe-o.js","/assets/speechUtils-B30XTT1V.js","/assets/mic-D0MVqzUY.js","/assets/shield-check-DDNaRuAW.js","/assets/sparkles-CkN1Cbjw.js","/assets/chevron-right-BI6i6Lek.js","/assets/Profile-C0lnEJ5y.js","/assets/circle-user-BCY2ElgT.js","/assets/camera-D5IZyGRo.js","/assets/arrow-left-phB1MYe0.js","/assets/Workers-COKN0qer.js","/assets/users-i3SfEzQe.js","/assets/bell-zMbZD8k2.js","/assets/save-lo4lZJ6w.js","/assets/Attendance-Cyt1X6KT.js","/assets/user-check-C6eI25nW.js","/assets/shield-CEqQmhnx.js","/assets/search-BdOX_h3Z.js","/assets/map-pin-B1HtGFP3.js","/assets/TableScrollContainer-BJ62P7_6.js","/assets/arrow-right-C_8rhB-2.js","/assets/rotate-ccw-CG3lYTeT.js","/assets/Support-DCKr9kqp.js","/assets/chevron-down-D_uEFGQ_.js","/assets/send-CLM2NkFQ.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DBfeZBL5.js","/assets/siren-DB_Dy_X4.js","/assets/trash-2-Cc-7GEus.js","/assets/shield-alert-DbChXiEx.js","/assets/clipboard-check-Cm6Yps_E.js","/assets/circle-check-B3f33TTS.js","/assets/radio-D-YzEZuq.js","/assets/x-Dkm7Dvjc.js","/assets/octagon-alert-xn3kxi1w.js","/assets/life-buoy-BYkledeu.js","/assets/phone-call-BBVlQ4Bw.js","/assets/plus-CWzYZddi.js","/assets/translations-DZ8A6dW-.js","/assets/web-BOZO7lCE.js","/assets/web-Ba8k7z-h.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BOqrlYzB.js"];

const FALLBACK_TILE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#e9ecef" stroke="#ced4da" stroke-width="0.5"/><path d="M 0,64 L 256,64 M 0,128 L 256,128 M 0,192 L 256,192 M 64,0 L 64,256 M 128,0 L 128,256 M 192,0 L 192,256" stroke="#dee2e6" stroke-width="0.5"/><text x="128" y="132" font-family="sans-serif" font-size="10" fill="#adb5bd" text-anchor="middle">MineSight Offline Grid</text></svg>';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && res.ok) await cache.put(url, res);
          } catch (e) {}
        }),
      );
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith('minesight-') && ![SHELL_CACHE, TILE_CACHE, FONT_CACHE, RUNTIME_CACHE].includes(key))
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) return;

  if (url.hostname.includes('tile.openstreetmap.org') || url.pathname.includes('/tiles/')) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(request).then((cachedTile) => {
          if (cachedTile) return cachedTile;
          return fetch(request).then((res) => {
            if (res && res.status === 200) cache.put(request, res.clone());
            return res;
          }).catch(() => new Response(FALLBACK_TILE_SVG, { headers: { 'Content-Type': 'image/svg+xml' } }));
        })
      )
    );
    return;
  }

  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(FONT_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const res = await fetch(request);
          if (res && res.status === 200) {
            cache.put(request, res.clone()).catch(() => {});
          }
          return res;
        } catch {
          if (url.hostname.includes('fonts.googleapis.com')) {
            return new Response('/* offline font fallback */', {
              status: 200,
              headers: { 'Content-Type': 'text/css; charset=utf-8' },
            });
          }
          return new Response('', { status: 200 });
        }
      })()
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => {
              cache.put('/index.html', clone.clone()).catch(() => {});
              cache.put('/', clone.clone()).catch(() => {});
              cache.put(request, clone).catch(() => {});
            });
          }
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(request)) ||
            (await caches.match('/index.html')) ||
            (await caches.match('/'));
          if (cached) return cached;

          const keys = await caches.keys();
          for (const k of keys) {
            const c = await caches.open(k);
            const match = (await c.match('/index.html')) || (await c.match('/'));
            if (match) return match;
          }

          return new Response(
            '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MineSight - Offline</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#f8fafc;font-family:sans-serif;text-align:center;padding:20px}.card{max-width:420px;padding:32px;background:#1e293b;border-radius:12px;border:1px solid #334155}h1{margin:0 0 12px;color:#38bdf8}p{margin:0 0 20px;color:#94a3b8}button{background:#0f766e;color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:600}</style></head><body><div class="card"><h1>MineSight Offline</h1><p>You are currently offline. Please reconnect or reload once the connection is restored.</p><button onclick="window.location.reload()">Reload</button></div><script>window.addEventListener("online",()=>window.location.reload());</script></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return networkResponse;
        } catch (fetchError) {
          if (request.mode === 'navigate' || request.destination === 'document') {
            const fallback = (await caches.match('/index.html')) || (await caches.match('/'));
            if (fallback) return fallback;
          }
          if (
            request.destination === 'image' ||
            url.pathname.endsWith('.ico') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.webp')
          ) {
            const fallbackIcon =
              (await caches.match('/minesight-icon.svg')) ||
              (await caches.match('/minesight-logo.svg'));
            if (fallbackIcon) return fallbackIcon;
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#334155"/></svg>',
              { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
        }
      })()
    );
    return;
  }
});