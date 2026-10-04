const SHELL_CACHE = 'minesight-shell-v' + 1791126300720;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-VjXRkovP.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BWGV7PK9.js","/assets/Layout-THyFvb0I.js","/assets/HomePage-BmNDBKyR.js","/assets/sun-RpjB0pH_.js","/assets/Login-BYSusvom.js","/assets/languages-D3fTY2hl.js","/assets/Register-Crus0dtP.js","/assets/ReCAPTCHA-DJikT-oh.js","/assets/BrandLogo-B7ianrXA.js","/assets/CreateInspection-DsIy00eS.js","/assets/eye-D1pHh0wO.js","/assets/Inspections-BleBsRD9.js","/assets/Dashboard-BKHXXGeS.js","/assets/clipboard-list-i7uDTum8.js","/assets/building-2-CXi9rfBA.js","/assets/InspectionDetail-D8q3r4pe.js","/assets/RiskAnalysisModal-BYRyiSne.js","/assets/CameraCaptureModal-DfCAfRmE.js","/assets/check-CWJdLjCw.js","/assets/circle-check-big-DbJ-cztg.js","/assets/zoom-out-CxopnuPW.js","/assets/triangle-alert-BKiMvnrb.js","/assets/Compliances-e-zcyDAw.js","/assets/Mines-Bqnz35me.js","/assets/hooks-CsrA33o9.js","/assets/leafletAssets-BO-7AZkb.js","/assets/MineralResourcesDashboard-BUNQRoqQ.js","/assets/loader-circle-CjaYVfdQ.js","/assets/Contractors-BeCdvi72.js","/assets/Alerts-gkSdEBHW.js","/assets/hi-BiADQGDV.js","/assets/Analytics-dOg1pU_T.js","/assets/PieChart-DgO0Jm0l.js","/assets/Chat-DhDAs4Nb.js","/assets/bot-BcPW7p-v.js","/assets/volume-x-BYng_V4I.js","/assets/mic-BexxsaHU.js","/assets/shield-check-DxgdtuwQ.js","/assets/sparkles-DoMxniq6.js","/assets/chevron-right-C9WhvQj3.js","/assets/Profile-CdUpd1Oz.js","/assets/circle-user-D5J1BKoO.js","/assets/camera-BE8fw9En.js","/assets/arrow-left-DvLrH7wB.js","/assets/Workers-CizAjxwJ.js","/assets/users-DA3PbFji.js","/assets/bell-xfto9BF5.js","/assets/save-B1LMxzvL.js","/assets/Attendance-CTIPnJdL.js","/assets/log-out-N5pcD6Y1.js","/assets/user-check-CaZQC8sL.js","/assets/shield-rzT5Yyb4.js","/assets/search-DbYARMWF.js","/assets/map-pin-CdbtWQPn.js","/assets/TableScrollContainer-DNHflrkI.js","/assets/arrow-right-awMVbx7A.js","/assets/rotate-ccw-DyUL1Cke.js","/assets/Support-B-49Ao-p.js","/assets/chevron-down-DK1VcaGg.js","/assets/send-BolQx31G.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Bj6edxV_.js","/assets/siren-2YP_XBj6.js","/assets/shield-alert-CUbXTXlz.js","/assets/clipboard-check-CpXadago.js","/assets/circle-check-DTfY8yfU.js","/assets/radio-B062V4kF.js","/assets/x-DmKbkOCu.js","/assets/octagon-alert-BBRlevkF.js","/assets/life-buoy-Cy-GgjDL.js","/assets/phone-call-CdOXpOI0.js","/assets/plus-BuzrqFHu.js","/assets/translations-DZ8A6dW-.js","/assets/web-CD88nH9K.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-B3KhhHqt.js"];

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