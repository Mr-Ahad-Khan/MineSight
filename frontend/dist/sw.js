const SHELL_CACHE = 'minesight-shell-v' + 1791046902872;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CQiSMb_y.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CBqDPXGq.js","/assets/Layout-DGVwpVZL.js","/assets/HomePage-Cm9bqcVj.js","/assets/sun-cqoRieMP.js","/assets/Login-CjryMQil.js","/assets/languages-D11rrxyH.js","/assets/Register-BeUrPMLG.js","/assets/ReCAPTCHA-CndmMBfD.js","/assets/BrandLogo-f5wVTKLC.js","/assets/Dashboard-rlms6ZgI.js","/assets/clipboard-list-Byo-k0Tj.js","/assets/building-2-1fHlQriy.js","/assets/Inspections-DKNwpcQv.js","/assets/CreateInspection-idI-dKC4.js","/assets/InspectionDetail-DOmaXBIZ.js","/assets/circle-check-big-DtetF9dT.js","/assets/imageCompressor-Di3pNf21.js","/assets/zoom-out-BUsR543o.js","/assets/Compliances-CERauMye.js","/assets/Mines-EvnZAWyU.js","/assets/hooks-C4PqJQ6k.js","/assets/leafletAssets-BJWevsJb.js","/assets/MineralResourcesDashboard-DQbR5yI4.js","/assets/loader-circle-JRkgXv4p.js","/assets/Contractors-BbLZW6oL.js","/assets/Alerts-tPfR8seZ.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CA_WaWqz.js","/assets/PieChart-D_1LxJAx.js","/assets/Chat-BtWSAVDC.js","/assets/bot-UR-phRf-.js","/assets/volume-x-mMCHeQ4l.js","/assets/mic-Bw2yyOyf.js","/assets/shield-check-DWvjWMou.js","/assets/chevron-right-D2YvIFme.js","/assets/Profile-BlwzYA8C.js","/assets/circle-user-CO9ulkNC.js","/assets/camera-BmYOKBRe.js","/assets/arrow-left-C55bQP1L.js","/assets/Workers-CrwYo24-.js","/assets/users-CPJK64jl.js","/assets/bell-DwXdWrjT.js","/assets/save-C-BqFyZy.js","/assets/Attendance-CXtSwM1m.js","/assets/log-out-DIkcS_PM.js","/assets/shield-UzX6ZjIV.js","/assets/user-check-2Ggj0bpf.js","/assets/search-Bbh4EXck.js","/assets/x-DwRa0ytP.js","/assets/map-pin-CJYNsERR.js","/assets/TableScrollContainer-CA-YZ5Km.js","/assets/arrow-right-BgF55i-l.js","/assets/Support-qzHCDOvl.js","/assets/chevron-down-DUuttmab.js","/assets/send-Cq_0rOdA.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CwhBc8y2.js","/assets/siren-BnbgFtNd.js","/assets/shield-alert-kF3gUSkt.js","/assets/clipboard-check-D_l5kzie.js","/assets/circle-check-DipYBCcF.js","/assets/radio-D7cGAUGe.js","/assets/octagon-alert-DiO5DXLM.js","/assets/life-buoy-DrXo7yQs.js","/assets/phone-call-CjKfJsHU.js","/assets/plus-DyUtkfpE.js","/assets/translations-Bkk7MiZ9.js","/assets/web-CZ44PPRz.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-B-i_R1G-.js"];

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