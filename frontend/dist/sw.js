const SHELL_CACHE = 'minesight-shell-v' + 1791136551922;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-AYk3L8L9.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-bNK6Xl8f.js","/assets/Layout-BsQbKYYT.js","/assets/HomePage-BYoWgXbU.js","/assets/sun-DupKtJ8H.js","/assets/Login-B0HWfti7.js","/assets/languages-dQKuj0o5.js","/assets/Register-Cr3f-z_d.js","/assets/ReCAPTCHA-rHUZwqb1.js","/assets/BrandLogo-Y_9fMOyl.js","/assets/CreateInspection-DqNRK_Ml.js","/assets/eye-C0PUxFfa.js","/assets/Inspections-Bugw0ech.js","/assets/Dashboard-BNojztKK.js","/assets/clipboard-list-8MPj-wTO.js","/assets/building-2-FT7rORo2.js","/assets/InspectionDetail-DkVa-Q1B.js","/assets/RiskAnalysisModal-D0fgkqA9.js","/assets/CameraCaptureModal-D2gNE6Ka.js","/assets/check-CWJH0zZT.js","/assets/circle-check-big-N5PUi-VQ.js","/assets/zoom-out-C8cML3Pv.js","/assets/Compliances-lLsLEALi.js","/assets/Mines-ybjS8N6m.js","/assets/hooks-BaJCPFhq.js","/assets/leafletAssets-hfRgEnBC.js","/assets/MineralResourcesDashboard-DsNp-QZM.js","/assets/loader-circle-A38T9Y7W.js","/assets/Contractors-BIAIJtgy.js","/assets/Alerts-McYZ3rtE.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DTNj6wif.js","/assets/PieChart-Bbp2mH1i.js","/assets/Chat-DXhToRRP.js","/assets/bot-CrHlXt_m.js","/assets/volume-x-DevoEZOP.js","/assets/mic-CrByzeSh.js","/assets/shield-check-B2kk6bxG.js","/assets/sparkles-BaIBtUTN.js","/assets/chevron-right-ggBFaPgL.js","/assets/Profile-CVGrkRdP.js","/assets/circle-user-BUBirosc.js","/assets/camera-Caj1YQ16.js","/assets/arrow-left-6BstFEVb.js","/assets/Workers-D6fSJqAl.js","/assets/users-DSDU6dYw.js","/assets/bell-CVJKxYxf.js","/assets/save-Cx738mxy.js","/assets/Attendance-Cb3G2Rob.js","/assets/user-check-D3eAiXly.js","/assets/shield-D_P_c8Ow.js","/assets/search-Cvbmj0uq.js","/assets/map-pin-BsGx1C7u.js","/assets/TableScrollContainer-8eAZOEAK.js","/assets/arrow-right-vxI5icu5.js","/assets/rotate-ccw-N6N204Ao.js","/assets/Support-Bhcx-oP7.js","/assets/chevron-down-DKXxcUuJ.js","/assets/send-DGRsVA1p.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CH_aSchX.js","/assets/siren-DS72hmGY.js","/assets/shield-alert-CWalvN4F.js","/assets/clipboard-check-DjVOQsSb.js","/assets/circle-check-DDKcI6FV.js","/assets/radio-mk9Bzlhi.js","/assets/x-BlCwtqdP.js","/assets/octagon-alert-7vkV4wGS.js","/assets/life-buoy-aEs5Yp0n.js","/assets/phone-call-Cf_wj5TG.js","/assets/plus-BYgczbih.js","/assets/translations-DZ8A6dW-.js","/assets/web-zJBHicXL.js","/assets/web-0feXVtRB.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-oHVrm6J_.js"];

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