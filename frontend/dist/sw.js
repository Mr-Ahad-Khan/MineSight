const SHELL_CACHE = 'minesight-shell-v' + 1791204829691;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-BJF3wwij.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DOE-AvOE.js","/assets/Layout-BhyjBs1x.js","/assets/HomePage-DqSdRbpU.js","/assets/sun-C364EGNU.js","/assets/Login-Bs-2ODn8.js","/assets/languages-qgGd2iVt.js","/assets/Register-CnUL4IsI.js","/assets/ReCAPTCHA-CHt9zgmf.js","/assets/BrandLogo-CTdb-3a9.js","/assets/CreateInspection-C0cWMCGP.js","/assets/eye-DIdEG8zE.js","/assets/Inspections-C5dDj-sl.js","/assets/Dashboard-DIBgGZ1P.js","/assets/clipboard-list-AVo6LwgK.js","/assets/building-2-DiFY_vBn.js","/assets/InspectionDetail-BQ4Ijnz6.js","/assets/RiskAnalysisModal-KGIZM-FV.js","/assets/CameraCaptureModal-DOvSZNMv.js","/assets/check-pd7oXH0R.js","/assets/circle-check-big-DTwVX6wX.js","/assets/zoom-out-Bl-yXMtF.js","/assets/Compliances-Df7QsYjQ.js","/assets/Mines-CzN2PhsL.js","/assets/hooks-C6SZQBvz.js","/assets/leafletAssets-C5qjD6km.js","/assets/MineralResourcesDashboard-BU0W666W.js","/assets/loader-circle-DpH9LyTX.js","/assets/Contractors-BbmcT7OD.js","/assets/Alerts-BfCwWE30.js","/assets/hi-BiADQGDV.js","/assets/Analytics-Cbp77nW8.js","/assets/PieChart-CNWQZ7mW.js","/assets/Chat-BIioroti.js","/assets/bot-BMH5s4gR.js","/assets/speechUtils-BLa01SPz.js","/assets/mic-DSp-tsQz.js","/assets/shield-check-DSmz3F7w.js","/assets/sparkles-D5WMOsr5.js","/assets/chevron-right-DB5O7Fnw.js","/assets/Profile-9qrNiIkq.js","/assets/circle-user-DpXusnJ_.js","/assets/camera-i0dzRqfI.js","/assets/arrow-left-Bg4A6vpy.js","/assets/Workers-exx2h_FO.js","/assets/users-DP27a-JE.js","/assets/bell-CMQQlmuy.js","/assets/save-BwsmgCgG.js","/assets/Attendance-C3WkqbB6.js","/assets/user-check-DE3ruky6.js","/assets/shield-syCVMwUr.js","/assets/search-CrWVYjMl.js","/assets/map-pin-DbxflOOi.js","/assets/TableScrollContainer-arkRDgNb.js","/assets/arrow-right-DbbE7iBW.js","/assets/rotate-ccw-Djqax-hW.js","/assets/Support-DoZ1Nj5X.js","/assets/chevron-down-WCVktanm.js","/assets/send-CRGKRd3N.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DYs8XNKz.js","/assets/siren-DsmX-Qr9.js","/assets/jspdf.plugin.autotable-D9yUe7O7.js","/assets/trash-2-BvOYO4bZ.js","/assets/shield-alert-CjWgvm_s.js","/assets/clipboard-check--1B9ht8X.js","/assets/circle-check-CDPwcN7K.js","/assets/radio-oje09c77.js","/assets/x-C_TR_VKS.js","/assets/octagon-alert-CrXZtHBj.js","/assets/life-buoy-B5_wNA64.js","/assets/phone-call-CkvjMYZy.js","/assets/plus-Cf_dFvk1.js","/assets/translations-1PeRISgm.js","/assets/web-Dxc_pvVL.js","/assets/web-D8vGzsNI.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BAuspiHE.js"];

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