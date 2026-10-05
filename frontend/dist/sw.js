const SHELL_CACHE = 'minesight-shell-v' + 1791189785439;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-x3OPkpeH.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-5Y9FvpYu.js","/assets/Layout-Ba0sWIkQ.js","/assets/HomePage-CfFxdX8t.js","/assets/sun-CLfnDpy1.js","/assets/Login-BAKQ_FNi.js","/assets/languages-CMTr84Xg.js","/assets/Register-Cgc77WXk.js","/assets/ReCAPTCHA-lru8A-Vl.js","/assets/BrandLogo-ArzywPSd.js","/assets/CreateInspection-DB4iw4Gu.js","/assets/eye-D90gL_RR.js","/assets/Inspections-DEj8MvHL.js","/assets/Dashboard-BvtrxMZe.js","/assets/clipboard-list-BJEUM2jm.js","/assets/building-2-BFAI5KUn.js","/assets/InspectionDetail-Cqb7FeNi.js","/assets/RiskAnalysisModal-Ddf5Y2Sb.js","/assets/CameraCaptureModal-DCdmZnop.js","/assets/check-BuXgYCJ8.js","/assets/circle-check-big-ehoW0I1j.js","/assets/zoom-out-_BpiyWcT.js","/assets/Compliances-B1DMYjXG.js","/assets/Mines-QvhFlCUl.js","/assets/hooks-Cc0mATTh.js","/assets/leafletAssets-1buganf7.js","/assets/MineralResourcesDashboard-Cmfm6I39.js","/assets/loader-circle-DswGFLVu.js","/assets/Contractors-D94nGYH4.js","/assets/Alerts-bYACZyVy.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CDVUXd3M.js","/assets/PieChart-sMRkFo32.js","/assets/Chat-CLQFE2m7.js","/assets/bot-CKV4Gr78.js","/assets/volume-x-C4g1WPUr.js","/assets/mic-CEj-Deex.js","/assets/shield-check-C2xO-9bX.js","/assets/sparkles-C8yqjCSq.js","/assets/chevron-right-5ht7EyR6.js","/assets/Profile-DA3X_Uv6.js","/assets/circle-user-YrIcUrdY.js","/assets/camera-B_J-Pmfk.js","/assets/arrow-left-DLvmbbgo.js","/assets/Workers-BxHC8SDL.js","/assets/users-240Y01UH.js","/assets/bell-Dqift1Fc.js","/assets/save-CZ4WtGpf.js","/assets/Attendance-2BZd50-y.js","/assets/user-check-BXeMuwY6.js","/assets/shield-CkMDpmz3.js","/assets/search-DuSS10SX.js","/assets/map-pin-kGjyQcoE.js","/assets/TableScrollContainer-BqN1-ULM.js","/assets/arrow-right-BoXSZUpP.js","/assets/rotate-ccw-CvBvVqs6.js","/assets/Support-CjUusOG4.js","/assets/chevron-down-UugYnPth.js","/assets/send-DazmgOS3.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-C0NfrrmD.js","/assets/siren-Cf28ID5C.js","/assets/trash-2-CQilm5jg.js","/assets/shield-alert-kNdN4uqF.js","/assets/clipboard-check-DjZl2aRa.js","/assets/circle-check-CkByM5pI.js","/assets/radio-D-12CYe2.js","/assets/x-DSLl76eE.js","/assets/octagon-alert-DPA9Xwv_.js","/assets/life-buoy-DngDGofp.js","/assets/phone-call-DpBtDqOE.js","/assets/plus-TotKETmx.js","/assets/translations-DZ8A6dW-.js","/assets/web-BquY2VfY.js","/assets/web-B88uCN8Z.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-OCWnjold.js"];

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