const SHELL_CACHE = 'minesight-shell-v' + 1791048763992;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CGy3U-ak.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-ACkQAFNn.js","/assets/Layout-Cu5VY2ma.js","/assets/HomePage-C8ouFcjt.js","/assets/sun-CgIFoMhj.js","/assets/Login-ClxYbeYx.js","/assets/languages-TrnlfMfp.js","/assets/Register-CEFOcJeS.js","/assets/ReCAPTCHA-D7QzvO2y.js","/assets/BrandLogo-CwTQoCRt.js","/assets/Dashboard-CMTrGexN.js","/assets/clipboard-list-BmZssahS.js","/assets/building-2-h4_6yoo7.js","/assets/Inspections-CerVz5tH.js","/assets/CreateInspection-R_mwVm-G.js","/assets/InspectionDetail-CjjNIq_w.js","/assets/circle-check-big-jKt0kB_Z.js","/assets/imageCompressor-BM9WU0sQ.js","/assets/zoom-out-ChJMJo1P.js","/assets/Compliances-CV53HI-0.js","/assets/Mines-CkHlimh2.js","/assets/hooks-x5dOdNKs.js","/assets/leafletAssets-BVJ86T0Y.js","/assets/MineralResourcesDashboard-yg9Np5eN.js","/assets/loader-circle-FvIenEGC.js","/assets/Contractors-DTOahBOp.js","/assets/Alerts-7AYRQyMb.js","/assets/hi-BiADQGDV.js","/assets/Analytics-D2Juuruv.js","/assets/PieChart-DWH8nbz2.js","/assets/Chat-BNnZ_SHI.js","/assets/bot-Cc2CD_nL.js","/assets/volume-x-C3gkCjlf.js","/assets/mic-D9Q9Tlzu.js","/assets/shield-check-D5GXHNnV.js","/assets/chevron-right-KTdISwLZ.js","/assets/Profile-BRtyZ0Lq.js","/assets/circle-user-Bg1OgfyL.js","/assets/camera-24qwNV8y.js","/assets/arrow-left-CCOkeijW.js","/assets/Workers-DewtCvvE.js","/assets/users-COHTj2ph.js","/assets/bell-hZEq8-oQ.js","/assets/save-D9ap0-mE.js","/assets/Attendance-DDtqYspD.js","/assets/log-out-ClPPDAup.js","/assets/shield-BMmy-d_m.js","/assets/user-check-uSzMqZxo.js","/assets/search-B7P-Nx_e.js","/assets/x-CJF3tN8J.js","/assets/map-pin-BLZlJo7N.js","/assets/TableScrollContainer-e1OfZoax.js","/assets/arrow-right-Qx6I8b22.js","/assets/Support-B1dHEiTW.js","/assets/chevron-down-aX7DjKwH.js","/assets/send-B4kCU9dC.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DqCSQ9Us.js","/assets/siren-Cu7OSTJP.js","/assets/shield-alert-CdI10UA7.js","/assets/clipboard-check-0YhxWxxL.js","/assets/circle-check-CaOEbN2K.js","/assets/radio-CAN63Kcw.js","/assets/octagon-alert-DBxfRIA6.js","/assets/life-buoy-BFL5tXeq.js","/assets/phone-call-BAkkKgeH.js","/assets/plus-De9C7dAx.js","/assets/translations-Bkk7MiZ9.js","/assets/web-CA1q-S0O.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Dc2mb2Yk.js"];

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