const SHELL_CACHE = 'minesight-shell-v' + 1791055484374;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-0Zrk1eD5.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Bi-hhhHz.js","/assets/Layout-r163J6rP.js","/assets/HomePage-DvFcCQtv.js","/assets/sun-BH2ZW7Sr.js","/assets/Login-C3tAM-Ma.js","/assets/languages-P2unzRyL.js","/assets/Register-vOOkZI-d.js","/assets/ReCAPTCHA-C_5_JpaS.js","/assets/BrandLogo-B7glZX1K.js","/assets/Dashboard-DFmsrCyH.js","/assets/clipboard-list-DTWQl9aH.js","/assets/building-2-Q6p83Yga.js","/assets/Inspections-Cjis4Kp6.js","/assets/CreateInspection-C6fmwwOQ.js","/assets/InspectionDetail-D2AGxLhW.js","/assets/circle-check-big-DauBUlQE.js","/assets/RiskAnalysisModal-B-IxiuVH.js","/assets/triangle-alert-lrDKI9OS.js","/assets/zoom-out-Do1P14pJ.js","/assets/Compliances-BgdjyHM0.js","/assets/Mines-BsNLMalV.js","/assets/hooks-e8nZ3T7N.js","/assets/leafletAssets-jTY5SDTv.js","/assets/MineralResourcesDashboard-B5YfFKJJ.js","/assets/loader-circle-XT2grK0p.js","/assets/Contractors-CnqIV6N-.js","/assets/Alerts-5OdPraAg.js","/assets/hi-BiADQGDV.js","/assets/Analytics-NbGyK1LM.js","/assets/PieChart-Df2Q7KLL.js","/assets/Chat-BURX5DMZ.js","/assets/bot-CGDuvFbD.js","/assets/volume-x-CZMZ5iKF.js","/assets/mic-D8p9XgzP.js","/assets/shield-check-D5PVilza.js","/assets/sparkles-T7A0y1-N.js","/assets/chevron-right-x2BSkRWG.js","/assets/Profile-CuoTIOxP.js","/assets/circle-user-GtyvSGal.js","/assets/arrow-left-C8l2AT7I.js","/assets/camera-DqYlT5z-.js","/assets/Workers-vTLb2_o7.js","/assets/users-C4uiuLnW.js","/assets/bell-BYxDaojc.js","/assets/save-BdbihPj4.js","/assets/Attendance-B4cjV_gz.js","/assets/log-out-DSQpacO0.js","/assets/user-check-BCr0Y2hF.js","/assets/shield-DMULiXbS.js","/assets/search-Da1MSDzX.js","/assets/x-DfUGGIKA.js","/assets/map-pin-CKMkOXIu.js","/assets/TableScrollContainer-CWhkJkEj.js","/assets/arrow-right-Cxu0suRV.js","/assets/rotate-ccw-iv33xPD7.js","/assets/Support-_0ZS9EbF.js","/assets/chevron-down-D_vMJy9i.js","/assets/send-DqNA9M-q.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BGKKFw1E.js","/assets/siren-v-beNWaQ.js","/assets/shield-alert-DaITUCJd.js","/assets/clipboard-check-CTOPWxON.js","/assets/circle-check-SpCFYXvF.js","/assets/radio-n2tfMEpa.js","/assets/octagon-alert-DVC2jCOl.js","/assets/life-buoy-D5JZdEFU.js","/assets/phone-call-BdJyLNiR.js","/assets/plus-ChhTszMh.js","/assets/translations-m0cHdOZ5.js","/assets/web-8mu6lK3R.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DyOCr6Cd.js"];

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