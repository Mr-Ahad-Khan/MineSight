const SHELL_CACHE = 'minesight-shell-v' + 1791098951454;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-0Zrk1eD5.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BIzVw8MS.js","/assets/Layout-7FtKlqpu.js","/assets/HomePage-D0nQ3SsL.js","/assets/sun-CG6L39Gy.js","/assets/Login-DOoqw3q7.js","/assets/languages-Cs5oRdM3.js","/assets/Register-BLNqwVu8.js","/assets/ReCAPTCHA-Dc0lZLo5.js","/assets/BrandLogo-BaS43GGG.js","/assets/Dashboard-BxbRBhwF.js","/assets/clipboard-list-CIQfZJId.js","/assets/building-2-BS2YA-HI.js","/assets/Inspections-sKC1B9iO.js","/assets/CreateInspection-DIq91XqW.js","/assets/InspectionDetail-CpXm_o3A.js","/assets/circle-check-big-acY1dvma.js","/assets/RiskAnalysisModal-CjHRoz5i.js","/assets/triangle-alert-BXKlROzG.js","/assets/zoom-out-IOqM6T0i.js","/assets/Compliances-BIOh1gCr.js","/assets/Mines-Cka1x0mT.js","/assets/hooks-z5sCdqWf.js","/assets/leafletAssets-hqLGvmOj.js","/assets/MineralResourcesDashboard-DaimJXrF.js","/assets/loader-circle-DUHb8sBr.js","/assets/Contractors-DB6s3RJe.js","/assets/Alerts-BWtz1Nxu.js","/assets/hi-BiADQGDV.js","/assets/Analytics-u1njmHZJ.js","/assets/PieChart-CFy5kfDl.js","/assets/Chat-CC2tkZ5F.js","/assets/bot-D-Eriv2T.js","/assets/volume-x-2FV5r4xy.js","/assets/mic-n_wV61j7.js","/assets/shield-check-S96Dkwex.js","/assets/sparkles-CmFpAVD9.js","/assets/chevron-right-Cqb8VB7w.js","/assets/Profile-DV1vts03.js","/assets/circle-user-DfEHc-f8.js","/assets/arrow-left-C4Cx2hLO.js","/assets/camera-ItGOK2Ad.js","/assets/Workers-7pnAqqc5.js","/assets/users-C4VXwLgC.js","/assets/bell-el9I6jEp.js","/assets/save-DPqbY3sK.js","/assets/Attendance-FiDSwrqY.js","/assets/log-out-CbD8Y0IX.js","/assets/user-check-CYunJXo7.js","/assets/shield-BM4jGMih.js","/assets/search-BDHX8igW.js","/assets/x-CNbUzV9n.js","/assets/map-pin-C7z9eNML.js","/assets/TableScrollContainer-j0ozuLxi.js","/assets/arrow-right-C43iWFkV.js","/assets/rotate-ccw-BU8aExuq.js","/assets/Support-BlhewUsG.js","/assets/chevron-down-C47mCdrO.js","/assets/send-B134wUkp.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BH8YqXS1.js","/assets/siren-d6s4Ls33.js","/assets/shield-alert-OOv8MPFH.js","/assets/clipboard-check-DYtWIiKj.js","/assets/circle-check-BX5CA-0e.js","/assets/radio-y0R37PSK.js","/assets/octagon-alert-C-x23RYV.js","/assets/life-buoy-IyqF1XWU.js","/assets/phone-call-CZh6hSdO.js","/assets/plus-neOd4xO_.js","/assets/translations-m0cHdOZ5.js","/assets/web-BcGb3daV.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-YwKRGLDG.js"];

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