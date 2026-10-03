const CACHE_NAME = 'minesight-offline-v' + 1791041363804;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CU4QfOOp.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DglLWmyF.js","/assets/Layout-CboBPpHZ.js","/assets/HomePage-_vp31ihV.js","/assets/sun-BQ_PE45A.js","/assets/Login-W0dY7wDS.js","/assets/languages-D88CZOmr.js","/assets/Register-BuyJMq9x.js","/assets/ReCAPTCHA-CkkfZOnn.js","/assets/BrandLogo-D52SKBeW.js","/assets/Dashboard-TNJ8C7hW.js","/assets/clipboard-list-tcKGeVaR.js","/assets/building-2-B6t2KyzG.js","/assets/Inspections-JjDkx5AL.js","/assets/CreateInspection-CNMxqorI.js","/assets/InspectionDetail-CejYhwTL.js","/assets/circle-check-big-CN2yx3d4.js","/assets/imageCompressor-Btxz690s.js","/assets/zoom-out-oSangrxp.js","/assets/Compliances-5Y-c7xub.js","/assets/Mines-CEbDwEA4.js","/assets/hooks-A-PtEtau.js","/assets/leafletAssets-DJ9zaS3C.js","/assets/MineralResourcesDashboard-BSl-jpgW.js","/assets/loader-circle-DRMko5tB.js","/assets/Contractors-CDztnMVO.js","/assets/Alerts-CYHcNYxZ.js","/assets/hi-BiADQGDV.js","/assets/Analytics-C6_szoU0.js","/assets/PieChart-C4MnnygA.js","/assets/Chat-BCkIHqkg.js","/assets/bot-DDgZKrUJ.js","/assets/volume-x-BLNJCZY1.js","/assets/mic-BvmNLGrM.js","/assets/shield-check-DGPfzE3f.js","/assets/chevron-right-4K5vSWNN.js","/assets/Profile-BznowiqP.js","/assets/circle-user-B9A4TuHN.js","/assets/camera-xIrkyibl.js","/assets/arrow-left-BHdCiKm3.js","/assets/Workers-Rdjhu8Oi.js","/assets/users-DYZZPh0v.js","/assets/bell-qzWNhWhN.js","/assets/save-Cx_3FJko.js","/assets/Attendance-C4pRRZhp.js","/assets/log-out-eepExLSH.js","/assets/shield-Crt3YV2O.js","/assets/user-check-6OLnCVbr.js","/assets/refresh-cw-BMqUjdN9.js","/assets/search-BCiOAxYX.js","/assets/x-tkHR8kDP.js","/assets/map-pin-BRr0xOlX.js","/assets/TableScrollContainer-CUC0WnW4.js","/assets/arrow-right-D1sZPYGO.js","/assets/Support-CLHMNTeg.js","/assets/chevron-down-DxfMi4bj.js","/assets/send-B02PhHH-.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Dw5SR_Il.js","/assets/siren-BLmJnbpZ.js","/assets/shield-alert-ByeXcgFv.js","/assets/clipboard-check-faYj0z9W.js","/assets/circle-check-Cv_bvELZ.js","/assets/radio-Ckxe0NAK.js","/assets/octagon-alert-QlFqqRIO.js","/assets/life-buoy-yUm1DphT.js","/assets/phone-call-CUkf_6K_.js","/assets/plus-C0k-k99T.js","/assets/translations-DzApDVcQ.js","/assets/web-BGL0xxV4.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CyJoEeG2.js"];

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