const CACHE_NAME = 'minesight-offline-v' + 1790953141772;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BrTehDFo.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-tbmMX8L6.js","/assets/Layout-DF13R4AI.js","/assets/HomePage-DYHRVAAc.js","/assets/sun-Dt2gBrCM.js","/assets/Login-kDzktMfo.js","/assets/languages-CvSDBsVh.js","/assets/Register-C0b9sQE5.js","/assets/recaptcha-wrapper-D4cMK9uH.js","/assets/BrandLogo-CyQSv8Qp.js","/assets/Dashboard-DQ_K7asr.js","/assets/clipboard-list-DeXjKKVZ.js","/assets/building-2-B-rmNm8g.js","/assets/Inspections-D3FQvwyz.js","/assets/CreateInspection-Cq3C3kQZ.js","/assets/InspectionDetail-cT38NKCo.js","/assets/file-text-CztXTjPJ.js","/assets/loader-circle-BHgzNySS.js","/assets/zoom-out-D5tA-Q7n.js","/assets/Compliances-Dliidm3n.js","/assets/Mines-DJxe_a6r.js","/assets/hooks-B6yyh5CT.js","/assets/leafletAssets-BBafNerG.js","/assets/MineralResourcesDashboard-Cilw1CjV.js","/assets/Contractors-ZFKmBGTX.js","/assets/Alerts-BXrkJR67.js","/assets/hi-BiADQGDV.js","/assets/Analytics-D4CEGmIm.js","/assets/PieChart-8td37Gp5.js","/assets/index-9yhR72f5.js","/assets/Chat-B6IJ02JE.js","/assets/bot-Bq1gj_oS.js","/assets/mic-DZLf67z4.js","/assets/shield-check-DbShrGaP.js","/assets/Profile-DCZXVuo1.js","/assets/circle-user-BPmm6uQd.js","/assets/arrow-left-LetD2Ypq.js","/assets/Workers-CK0B5Xlq.js","/assets/users-C0ns7agL.js","/assets/bell-Dv6KVWQi.js","/assets/save-BR5T59QL.js","/assets/Attendance-DqkOOYs9.js","/assets/log-out-BoAfakLH.js","/assets/shield-CThJGzh3.js","/assets/user-check-BU3vU2pJ.js","/assets/refresh-cw-BAcmFh9t.js","/assets/x-BR-duCb8.js","/assets/search-BE2gCRfk.js","/assets/map-pin-BChLkkaW.js","/assets/TableScrollContainer-BQpeV71y.js","/assets/arrow-right-B9-kDw1J.js","/assets/Support-CVUGbFOX.js","/assets/chevron-down-BfLF6xci.js","/assets/send-CR7MI45o.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-D-8xepqc.js","/assets/siren-CpdZ8mU5.js","/assets/shield-alert--PWjdAY_.js","/assets/clipboard-check-BNcf4ykf.js","/assets/circle-check-DmfToFM3.js","/assets/radio-4h3FkIpl.js","/assets/octagon-alert-CsgwehJc.js","/assets/life-buoy-DZRw2n2W.js","/assets/phone-call-OIwM4cbL.js","/assets/plus-CoH9niBr.js","/assets/translations-DbrZn9zW.js","/assets/web-DXuIOQiu.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-D-hMQVml.js"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
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
      fetch(request).catch(() => caches.match('/index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
        }
        return response;
      });
    }),
  );
});