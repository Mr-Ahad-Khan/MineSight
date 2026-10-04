const SHELL_CACHE = 'minesight-shell-v' + 1791111306813;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-BdlEEHYK.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BDRup09T.js","/assets/Layout-DtNo0Flv.js","/assets/HomePage-C-_9YBLh.js","/assets/sun-CPpk7JT3.js","/assets/Login-DUP2VhBA.js","/assets/languages-BQR3YUQl.js","/assets/Register-Cy_FZKw6.js","/assets/ReCAPTCHA-DKCii1qC.js","/assets/BrandLogo-Bsas-cNO.js","/assets/Dashboard-COJYp4hR.js","/assets/clipboard-list-C2EsenV1.js","/assets/building-2-UkNj4CZa.js","/assets/Inspections-DGraf9fF.js","/assets/CreateInspection-DNBUUL7G.js","/assets/InspectionDetail-rr9tMDmR.js","/assets/circle-check-big-ChNGaOql.js","/assets/RiskAnalysisModal-CKjVSdU9.js","/assets/check-Bo9taDbT.js","/assets/triangle-alert-DIw9lgEb.js","/assets/zoom-out-F6vd9eSh.js","/assets/Compliances-DhqAuNNm.js","/assets/Mines-CHTQqNA_.js","/assets/hooks-DwMdf_I_.js","/assets/leafletAssets-PSpEXQNI.js","/assets/MineralResourcesDashboard-4gnbMSaS.js","/assets/loader-circle-CzqSzW5I.js","/assets/Contractors-CKu0StFq.js","/assets/Alerts-DXHl2hEa.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DikbTpOa.js","/assets/PieChart-Cri9y0df.js","/assets/Chat-ClHsPKl1.js","/assets/bot-DyBPWz5s.js","/assets/volume-x-CwVEM29X.js","/assets/mic-BeLwOYGH.js","/assets/shield-check-EqtYuExh.js","/assets/sparkles-CY9A4i_d.js","/assets/chevron-right-DKlDLsES.js","/assets/Profile-BvH-h9Zx.js","/assets/circle-user-WFIYD_Zl.js","/assets/arrow-left-2gi8LPrr.js","/assets/camera-BXyAU8Qx.js","/assets/Workers-BZHjnF28.js","/assets/users-RoIzgF4y.js","/assets/bell-eSTRyfoY.js","/assets/save-BnvLK3tp.js","/assets/Attendance-zZbtsClX.js","/assets/log-out-CXIz73-Q.js","/assets/user-check-DLbIlWdE.js","/assets/shield-6Rk4JSNz.js","/assets/search-BUym1CMS.js","/assets/x-CAYDSZOn.js","/assets/map-pin-Bl-kZRsx.js","/assets/TableScrollContainer-C2fAEyo8.js","/assets/arrow-right-DhoIIl-V.js","/assets/rotate-ccw-DWujKvRH.js","/assets/Support-DZr-h3sG.js","/assets/chevron-down-CgJ1ojEw.js","/assets/send-ewx7njzk.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BcEsIGCu.js","/assets/siren-0Z-y76XA.js","/assets/shield-alert-CeEW4ipK.js","/assets/clipboard-check-CeRGoLpB.js","/assets/circle-check-yCOyBtXI.js","/assets/radio-BzO7wcCB.js","/assets/octagon-alert-qKNqHE1M.js","/assets/life-buoy-0iSlSC4k.js","/assets/phone-call-gy97bgTt.js","/assets/plus-ByisIHKq.js","/assets/translations-m0cHdOZ5.js","/assets/web-DjXwMewZ.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-B9IJVvTE.js"];

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