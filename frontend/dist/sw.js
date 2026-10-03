const CACHE_NAME = 'minesight-offline-v' + 1791016123187;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-0a0h5sAw.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BQfwhLNg.js","/assets/Layout-AHzjMCTE.js","/assets/HomePage-Gp3quOHq.js","/assets/sun-CXVos3jt.js","/assets/Login-BmWZkNpd.js","/assets/languages-DspizR98.js","/assets/Register-DfxGXvyF.js","/assets/recaptcha-wrapper-JFHdNofl.js","/assets/BrandLogo-BcGZeK3h.js","/assets/Dashboard-Dy9DsRbW.js","/assets/clipboard-list-CbQcMIz4.js","/assets/building-2-D2eGoqa1.js","/assets/Inspections-BwKro7Oj.js","/assets/CreateInspection-BRp6rFlc.js","/assets/InspectionDetail-BW7BrjYX.js","/assets/circle-check-big-EDYf_LmU.js","/assets/upload-D03Km1-K.js","/assets/loader-circle-DeoKgwco.js","/assets/zoom-out-3Ep_yDl_.js","/assets/Compliances-DoiZavWi.js","/assets/Mines-B0iCUPMi.js","/assets/hooks-Dfzpurxc.js","/assets/leafletAssets-DhJ4LpFV.js","/assets/MineralResourcesDashboard-CjFRWhIU.js","/assets/Contractors-BIz58fTg.js","/assets/Alerts-EI1HIZ8Q.js","/assets/hi-BiADQGDV.js","/assets/Analytics---ljfwc7.js","/assets/PieChart-DD9IEGD9.js","/assets/index-CWA2APsv.js","/assets/Chat-B0o_o4M_.js","/assets/bot-DgfcTRoD.js","/assets/mic-D93O5xn8.js","/assets/shield-check-DB0Z_ZwB.js","/assets/Profile-Bw54a7ew.js","/assets/circle-user-CTCCHWa_.js","/assets/arrow-left-D_oQp4bQ.js","/assets/Workers-Dkvn6fCh.js","/assets/users-DXEiySD4.js","/assets/bell-zWa4qlc9.js","/assets/save-CHQrVvwX.js","/assets/Attendance-BHFzjCkL.js","/assets/log-out-CojNw3Pn.js","/assets/shield-BU4KieKh.js","/assets/user-check-Bqgw24mi.js","/assets/refresh-cw-nSdnk2ZQ.js","/assets/x-DQn45f6I.js","/assets/search-CuGnXWkP.js","/assets/map-pin-BnIngFbi.js","/assets/TableScrollContainer-BhpVDjnJ.js","/assets/arrow-right-DDwEo5HL.js","/assets/Support-BvFpdY1i.js","/assets/chevron-down-qyL61Bru.js","/assets/send-KZWgHJWL.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BfBtXFPQ.js","/assets/siren-CLVAmL6L.js","/assets/shield-alert-CCdUJB0k.js","/assets/clipboard-check-Df3PQ5H3.js","/assets/circle-check-C4rrG8PW.js","/assets/radio-XkzA0Di8.js","/assets/octagon-alert-mpZzQQJg.js","/assets/life-buoy-DisHuhY5.js","/assets/phone-call-BD2oeSGI.js","/assets/plus-OLpNEumg.js","/assets/translations-DbrZn9zW.js","/assets/web-Ck-KGe4T.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CBTdp6WL.js"];

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