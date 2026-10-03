const SHELL_CACHE = 'minesight-shell-v' + 1791053883549;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-DCccnnSN.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BBeCjMc9.js","/assets/Layout-lf73W3Aq.js","/assets/HomePage-CTvrntXj.js","/assets/sun-Du1E7_A5.js","/assets/Login-M8yFhHJj.js","/assets/languages-DGbnWBTq.js","/assets/Register-C_BBj2BI.js","/assets/ReCAPTCHA-D6jMnhYM.js","/assets/BrandLogo-D46Xn2DF.js","/assets/Dashboard-Bhx9sL2W.js","/assets/clipboard-list-Dr7r7ZUi.js","/assets/building-2-DS9SdNpN.js","/assets/Inspections-qyq7oKIw.js","/assets/CreateInspection-ymfG6O1Z.js","/assets/InspectionDetail-C4daKhXM.js","/assets/circle-check-big-k6ozwm8A.js","/assets/RiskAnalysisModal-DcmAeDZd.js","/assets/triangle-alert-L8nOvJj0.js","/assets/zoom-out-R8kAh0SC.js","/assets/Compliances-dLqNY1p8.js","/assets/Mines-CClhFc1W.js","/assets/hooks-CdhuWSwf.js","/assets/leafletAssets-FZHXzVDK.js","/assets/MineralResourcesDashboard-C8AMkLJ7.js","/assets/loader-circle-CDMwNpFp.js","/assets/Contractors-BCvMDdDL.js","/assets/Alerts-2Kivdc5i.js","/assets/hi-BiADQGDV.js","/assets/Analytics-dLEqtwIM.js","/assets/PieChart-CLRw0sYw.js","/assets/Chat-DfPbkLQ5.js","/assets/bot-D0qlwwsP.js","/assets/volume-x-DQ9AlQSE.js","/assets/mic-BXWsW1hm.js","/assets/shield-check-CD7RzU7a.js","/assets/sparkles-C0IwHx9r.js","/assets/chevron-right-Bf75mKf3.js","/assets/Profile-DtIk62BC.js","/assets/circle-user-DQ6pIb7c.js","/assets/arrow-left-2p7kzf_p.js","/assets/camera-BbaZfiXP.js","/assets/Workers-Rm21sMfJ.js","/assets/users-BKChoNEs.js","/assets/bell-BpWIOAfk.js","/assets/save-Ch6QX-W-.js","/assets/Attendance-C8f6GaU8.js","/assets/log-out-BG_Snm87.js","/assets/user-check-BqESR3za.js","/assets/shield-D0NZJWuW.js","/assets/search-9wSOrbvK.js","/assets/x-xxr8yPRo.js","/assets/map-pin-DL1eWK8j.js","/assets/TableScrollContainer-CJ_0-VdR.js","/assets/arrow-right-C24mZPPi.js","/assets/rotate-ccw-CibKCpY_.js","/assets/Support-Dm_-ky34.js","/assets/chevron-down-qCXZRC-4.js","/assets/send-Q0rRnSLG.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-y6eV3Cg0.js","/assets/siren-BJIr1knf.js","/assets/shield-alert-DzZy8TcR.js","/assets/clipboard-check-BH2xdEjF.js","/assets/circle-check-DsleLwXJ.js","/assets/radio-YFNQJrUt.js","/assets/octagon-alert-DKXhxTF-.js","/assets/life-buoy-b4Spo6Rm.js","/assets/phone-call-CAFQpfgC.js","/assets/plus-B0aID3a5.js","/assets/translations-Bkk7MiZ9.js","/assets/web-Du4ULtEy.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BYrGZnaK.js"];

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