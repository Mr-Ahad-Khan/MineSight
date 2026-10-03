const CACHE_NAME = 'minesight-offline-v' + 1791031196593;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-qbeTLAnL.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-7Kti3X9C.js","/assets/Layout-jSHOgK4T.js","/assets/HomePage-BMDRIMMp.js","/assets/sun-BF27RqPL.js","/assets/Login-B5FzoLTr.js","/assets/languages-BaijLSHy.js","/assets/Register-DLWNFL9W.js","/assets/recaptcha-wrapper-DqBHl5Mc.js","/assets/BrandLogo-CCwdEG6M.js","/assets/Dashboard-DHFO5T_d.js","/assets/clipboard-list-CRS5BQDO.js","/assets/building-2-Mxi606n9.js","/assets/Inspections-Cu2zwJxn.js","/assets/CreateInspection-Bci6HKiD.js","/assets/InspectionDetail-S949LwEa.js","/assets/circle-check-big-DdnYwLpX.js","/assets/imageCompressor-DRTGFDrW.js","/assets/zoom-out-DfKiorUf.js","/assets/Compliances-DlStLiF7.js","/assets/Mines-0sENMesh.js","/assets/hooks-BJPZRex9.js","/assets/leafletAssets-CGhjIgx3.js","/assets/MineralResourcesDashboard-m5zNFRJw.js","/assets/loader-circle-BeuhYein.js","/assets/Contractors-gEDW68w0.js","/assets/Alerts-Bu4M6kyz.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BFDKQkH_.js","/assets/PieChart-DoUgm8Ar.js","/assets/index-B1JYWM7w.js","/assets/Chat-eCmpgiS4.js","/assets/bot-DaK4Df37.js","/assets/mic-BT8zSI1y.js","/assets/shield-check-D8R8mFhw.js","/assets/Profile-CVesgtm9.js","/assets/circle-user-D0G3N7A2.js","/assets/camera-6z3dxSNr.js","/assets/arrow-left-PyD3FG4f.js","/assets/Workers-D3onJM4K.js","/assets/users-Bp6nG82P.js","/assets/bell-BBfMzrE7.js","/assets/save-DVMq02QH.js","/assets/Attendance-t2NKC2lE.js","/assets/log-out-nTjhP0B0.js","/assets/shield-BHiYpsbE.js","/assets/user-check-BssiO6QH.js","/assets/refresh-cw-BOWudD-A.js","/assets/search-CG-eaOT0.js","/assets/x-DZbcqUvh.js","/assets/map-pin-3jr-Qjyd.js","/assets/TableScrollContainer-CzyYsMMM.js","/assets/arrow-right-oygiVmZU.js","/assets/Support-D43gsIva.js","/assets/chevron-down-ewJ2swo_.js","/assets/send-0OHsdt1h.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-0KiRst-g.js","/assets/siren-CMRNPaMm.js","/assets/shield-alert-C8RZmkPZ.js","/assets/clipboard-check-68VdsHBm.js","/assets/circle-check-BQI4hVQD.js","/assets/radio-IooqJksL.js","/assets/octagon-alert-DULynTlK.js","/assets/life-buoy-BEywQFmr.js","/assets/phone-call-C617EeIA.js","/assets/plus-U-uMmqsM.js","/assets/translations-DbrZn9zW.js","/assets/web-C5ts-w9Y.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-sAsKXfSl.js"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
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
        .filter((key) => key.startsWith('minesight-offline-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        return cachedIndex || new Response('Offline app shell unavailable', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'));
    }),
  );
});