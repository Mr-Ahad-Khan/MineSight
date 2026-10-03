const SHELL_CACHE = 'minesight-shell-v' + 1791046328718;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-Bc7oTFg-.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-cTSZjulr.js","/assets/Layout-Dwam_XuW.js","/assets/HomePage-kjqqbPaV.js","/assets/sun-CI7p_OYZ.js","/assets/Login-CbYi5kls.js","/assets/languages-BYXSux2X.js","/assets/Register-CIvXmlh8.js","/assets/ReCAPTCHA-CVZKGKrW.js","/assets/BrandLogo-DPd52RRg.js","/assets/Dashboard-6itfikaR.js","/assets/clipboard-list-DJX04dge.js","/assets/building-2-93C_jwMa.js","/assets/Inspections-BBQrqVeK.js","/assets/CreateInspection-CkZa7V2t.js","/assets/InspectionDetail-CDKDLG0I.js","/assets/circle-check-big-D9yNpzJX.js","/assets/imageCompressor-CX4RqffO.js","/assets/zoom-out-B7iEMYvl.js","/assets/Compliances-DS6AFgk0.js","/assets/Mines-B8SZDrhm.js","/assets/hooks-B0cJlgei.js","/assets/leafletAssets-DU3iXJn0.js","/assets/MineralResourcesDashboard-BVVWhrDd.js","/assets/loader-circle-CzEZDrwd.js","/assets/Contractors-B7wGgPDy.js","/assets/Alerts-CjvXgsQC.js","/assets/hi-BiADQGDV.js","/assets/Analytics-De6ichx2.js","/assets/PieChart-CQ8PZzBD.js","/assets/Chat-MwrLi7X_.js","/assets/bot-D8BYs_7m.js","/assets/volume-x-DvSGfSfK.js","/assets/mic-ot6Ip5oR.js","/assets/shield-check-D9BuCeY_.js","/assets/chevron-right-Do2W-AT6.js","/assets/Profile-BL0UgSMm.js","/assets/circle-user-C4fpDAqX.js","/assets/camera-CrjFXDMC.js","/assets/arrow-left-B-Ow4PlL.js","/assets/Workers-CwWT3TUc.js","/assets/users-DSh64WPC.js","/assets/bell-Du7gh4ev.js","/assets/save-KNlMEJgK.js","/assets/Attendance-DU5DI10l.js","/assets/log-out-DeG4w0d2.js","/assets/shield-D0Oq0FM0.js","/assets/user-check-D1xDmedM.js","/assets/search-BMMjftTA.js","/assets/x-B4ZRYyop.js","/assets/map-pin-BTUtwYSQ.js","/assets/TableScrollContainer-C11cxaGA.js","/assets/arrow-right-CMEcFylP.js","/assets/Support-DTfhmSx0.js","/assets/chevron-down-DsefowvE.js","/assets/send-DYvbPFBJ.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CxIK1mTh.js","/assets/siren-BaCSz_7o.js","/assets/shield-alert-mrt6fpkY.js","/assets/clipboard-check-BxIcMSP_.js","/assets/circle-check-CuxLPEwx.js","/assets/radio-Bxeh_IZC.js","/assets/octagon-alert-C8FJzaqF.js","/assets/life-buoy-8M8t3YOC.js","/assets/phone-call-B-rKaTLu.js","/assets/plus-CCN0MKrH.js","/assets/translations-Bkk7MiZ9.js","/assets/web-B-qM_VvC.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BBRn_YML.js"];

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