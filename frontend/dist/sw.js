const SHELL_CACHE = 'minesight-shell-v' + 1791045298852;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-By2iEg9E.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-GGJIRZHM.js","/assets/Layout-DOSv7-1s.js","/assets/HomePage-CANdqLDk.js","/assets/sun-D_dghO6N.js","/assets/Login-CKv2qnxB.js","/assets/languages-m-YT9vg5.js","/assets/Register-FxUqfMbF.js","/assets/ReCAPTCHA-BtOuBh8m.js","/assets/BrandLogo-CjRfSVd5.js","/assets/Dashboard-CoD0Aj1a.js","/assets/clipboard-list-DW5IEBqy.js","/assets/building-2-eGYvA4Pg.js","/assets/Inspections-RIMeJ8ni.js","/assets/CreateInspection-CQKdZwmP.js","/assets/InspectionDetail-tDOfgcGX.js","/assets/circle-check-big-Chc_CMda.js","/assets/imageCompressor-BbthjbdY.js","/assets/zoom-out-BKEekrLZ.js","/assets/Compliances-CCuIVw6Q.js","/assets/Mines-BRBAL87n.js","/assets/hooks-nEpZmvFD.js","/assets/leafletAssets-JAnMIeU9.js","/assets/MineralResourcesDashboard-CVDG6rxr.js","/assets/loader-circle-Cg_VqoFa.js","/assets/Contractors-DxuLfROX.js","/assets/Alerts-5dz8SGgK.js","/assets/hi-BiADQGDV.js","/assets/Analytics-G73HLt0U.js","/assets/PieChart-CeDyGtPd.js","/assets/Chat-DslB9NhA.js","/assets/bot-Bg6aKKj5.js","/assets/volume-x-EImEuVZw.js","/assets/mic-gBanHikt.js","/assets/shield-check-DQtSUjU8.js","/assets/chevron-right-BMNQr6E8.js","/assets/Profile-CBThxuOi.js","/assets/circle-user-BNjRWCar.js","/assets/camera-Dwnwy9aR.js","/assets/arrow-left-BFNo-UQJ.js","/assets/Workers-CPva6eSB.js","/assets/users-B35YK6GW.js","/assets/bell-CRUEBocJ.js","/assets/save-qKQkwNUg.js","/assets/Attendance-CfmbFKEl.js","/assets/log-out-BFqguu2u.js","/assets/shield-v4S0T9UW.js","/assets/user-check-DgRyOxZl.js","/assets/search-CT6bdGXg.js","/assets/x-BClVVW91.js","/assets/map-pin-JY8IyW3V.js","/assets/TableScrollContainer-BeFcGhE1.js","/assets/arrow-right-D5d-QLny.js","/assets/Support-De7R_EyB.js","/assets/chevron-down-DPgWhPt4.js","/assets/send-BKJXA3TC.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BjiCHhrY.js","/assets/siren-dI4oab2a.js","/assets/shield-alert-CM8ST5h7.js","/assets/clipboard-check-LzEW7bKW.js","/assets/circle-check-CWdUL42y.js","/assets/radio-D77B5BM9.js","/assets/octagon-alert-Cja6UAcO.js","/assets/life-buoy-DikoycOI.js","/assets/phone-call-BKU2sQVU.js","/assets/plus-hlIia0yZ.js","/assets/translations-Bkk7MiZ9.js","/assets/web-C_8W0CTv.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-5SlR9_Dt.js"];

const FALLBACK_TILE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#e9ecef" stroke="#ced4da" stroke-width="0.5"/><path d="M 0,64 L 256,64 M 0,128 L 256,128 M 0,192 L 256,192 M 64,0 L 64,256 M 128,0 L 128,256 M 192,0 L 192,256" stroke="#dee2e6" stroke-width="0.5"/><text x="128" y="132" font-family="sans-serif" font-size="10" fill="#adb5bd" text-anchor="middle">MineSight Offline Grid</text></svg>';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => null)),
      );
      return results;
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
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res && res.status === 200) cache.put(request, res.clone());
            return res;
          }).catch(() => caches.match(request));
        })
      )
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        return cachedIndex || new Response('Offline app shell ready', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const responseCopy = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseCopy));
            }
            return response;
          })
          .catch(() => caches.match('/index.html'));
      }),
    );
  }
});