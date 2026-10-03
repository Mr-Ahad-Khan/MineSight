const SHELL_CACHE = 'minesight-shell-v' + 1791045983220;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DHzmOqg_.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-xmQ9rNuw.js","/assets/Layout-C1m1Usht.js","/assets/HomePage-dSzo61nF.js","/assets/sun-BDPeqFyA.js","/assets/Login-i81htFDw.js","/assets/languages-Zrv9c1N-.js","/assets/Register-tu__YFvC.js","/assets/ReCAPTCHA-BzlH2R3_.js","/assets/BrandLogo-CLTPvawZ.js","/assets/Dashboard-BTCYOPII.js","/assets/clipboard-list-DP_ftikV.js","/assets/building-2-BkdGxte0.js","/assets/Inspections-D9WN7LrR.js","/assets/CreateInspection-DPJjTcAi.js","/assets/InspectionDetail-BD16PHDv.js","/assets/circle-check-big-CmfmvUv4.js","/assets/imageCompressor-BdrPVIiQ.js","/assets/zoom-out-DHs3z9Yh.js","/assets/Compliances-BflcEMTS.js","/assets/Mines-BN9sYslP.js","/assets/hooks-BFTy0CXS.js","/assets/leafletAssets-DGH8-QI-.js","/assets/MineralResourcesDashboard-H3Qbvjgp.js","/assets/loader-circle-BDNycdwr.js","/assets/Contractors-BZAqITiu.js","/assets/Alerts-NCItUQCR.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DwPuXeng.js","/assets/PieChart-UPXSXiFh.js","/assets/Chat-CLxjXDqm.js","/assets/bot-XLvQidii.js","/assets/volume-x-D4sJjbSw.js","/assets/mic-CPiDcnw3.js","/assets/shield-check-DgCsMmul.js","/assets/chevron-right-DX-Yd0qA.js","/assets/Profile-DgeQ-7Fi.js","/assets/circle-user--Mn0pmRx.js","/assets/camera-C4BeQaQk.js","/assets/arrow-left-s6Int8aw.js","/assets/Workers-CuiaVJgP.js","/assets/users-CktmU4Bk.js","/assets/bell-BWVUgsF4.js","/assets/save-D_pzk4-C.js","/assets/Attendance-CyS1bVIn.js","/assets/log-out-BEpONBsc.js","/assets/shield-D3WptZ8Y.js","/assets/user-check-dHH4rh6D.js","/assets/search-CB0Y3QK2.js","/assets/x-Bew6oH1c.js","/assets/map-pin-D1lNjccm.js","/assets/TableScrollContainer-xiJI-Hsk.js","/assets/arrow-right-BRBl0gjI.js","/assets/Support-DSZqx3CJ.js","/assets/chevron-down-pXP9J7Tu.js","/assets/send-BC_NXkoZ.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BsA4Rnft.js","/assets/siren-DhSD-Dbl.js","/assets/shield-alert-CHHBoSf3.js","/assets/clipboard-check-DGGaLNiZ.js","/assets/circle-check-DR12WoC-.js","/assets/radio-D9EbEiMm.js","/assets/octagon-alert-CCDZqbki.js","/assets/life-buoy-M1s_QXPH.js","/assets/phone-call-BHL3XNPw.js","/assets/plus-BGJLV9Ny.js","/assets/translations-Bkk7MiZ9.js","/assets/web-6iDM6oI7.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DbbjnVzh.js"];

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