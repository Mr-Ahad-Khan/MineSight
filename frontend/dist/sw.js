const SHELL_CACHE = 'minesight-shell-v' + 1791115310529;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-CINuQDlv.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-qkm_CaIg.js","/assets/Layout-Dapm-Fk1.js","/assets/HomePage-CrVDhbhE.js","/assets/sun-CMMioAMq.js","/assets/Login-MHQtLoSO.js","/assets/languages-tNfKeAJh.js","/assets/Register-CwIIUaur.js","/assets/ReCAPTCHA-Cutz_nig.js","/assets/BrandLogo-BKzBFDfV.js","/assets/Dashboard-DANDPzaI.js","/assets/clipboard-list-BaK2Fgnh.js","/assets/building-2-D3gDO-_H.js","/assets/Inspections-CMfgMANK.js","/assets/CreateInspection-CNNvbYPw.js","/assets/InspectionDetail-0grkS_bd.js","/assets/circle-check-big-BeiZXtvo.js","/assets/RiskAnalysisModal-B0tO-tR9.js","/assets/CameraCaptureModal-B-FmwOc6.js","/assets/check-Bc6EeVJK.js","/assets/triangle-alert-D0ohV1ud.js","/assets/zoom-out-BlutiY54.js","/assets/Compliances-D5aNu0ym.js","/assets/Mines-CErldkiV.js","/assets/hooks-C0dqOz_Y.js","/assets/leafletAssets-DOk610Kr.js","/assets/MineralResourcesDashboard-D6HLlYdC.js","/assets/loader-circle-5KXqS2ko.js","/assets/Contractors-CXBGREEr.js","/assets/Alerts-Bwz_ze2s.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DyfrQx18.js","/assets/PieChart-DGN19eCJ.js","/assets/Chat-DAKDViQg.js","/assets/bot-D-1zQ7oL.js","/assets/volume-x-TCXzJGF8.js","/assets/mic-NOhoKE3L.js","/assets/shield-check-E5Ina8yq.js","/assets/sparkles-CWK4YSCr.js","/assets/chevron-right-DMlBaN4L.js","/assets/Profile-CRMJQ1NK.js","/assets/circle-user-BfEz5HP2.js","/assets/arrow-left-rGVUEsJl.js","/assets/camera-DvPb73xe.js","/assets/Workers-OGrZ02rH.js","/assets/users-BixJ1ZeS.js","/assets/bell-C7LsdHFy.js","/assets/save-BjBKxcSL.js","/assets/Attendance-Doqw5LH5.js","/assets/log-out-41Rm24Sd.js","/assets/user-check-BFYlAx3A.js","/assets/shield-D9fXezy1.js","/assets/search-DGbXmOHH.js","/assets/x-Dl6qDowr.js","/assets/map-pin-C1QPmE_U.js","/assets/TableScrollContainer-DKt6YggO.js","/assets/arrow-right-C5CFG_RA.js","/assets/rotate-ccw-DzG5617I.js","/assets/Support-GFx_BvY5.js","/assets/chevron-down-IQZPTKJ1.js","/assets/send-CPiBlQBw.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-JftJIe74.js","/assets/siren-D_MskEUW.js","/assets/shield-alert-BIZhUTOI.js","/assets/clipboard-check-CejLDthj.js","/assets/circle-check-BLGrNzf2.js","/assets/radio-B-fmCNh2.js","/assets/octagon-alert-BKU3eeql.js","/assets/life-buoy-D-Ug7lOv.js","/assets/phone-call-WKCUKsSK.js","/assets/plus-DqPb4Zid.js","/assets/translations-DZ8A6dW-.js","/assets/web-ar3yHWtn.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DNGQjlZg.js"];

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