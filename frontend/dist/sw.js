const CACHE_NAME = 'minesight-offline-v' + 1791032266197;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-qbeTLAnL.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Dnh8N43Z.js","/assets/Layout-DDJH5c-F.js","/assets/HomePage-DqBBxW0F.js","/assets/sun-Bh-pJ798.js","/assets/Login-HRM_OjBc.js","/assets/languages-CY0Z6o93.js","/assets/Register-BqKF3Mn1.js","/assets/recaptcha-wrapper-BVGOimmV.js","/assets/BrandLogo-DqStpjRQ.js","/assets/Dashboard-CqmhkB-k.js","/assets/clipboard-list-EVOoZEqV.js","/assets/building-2-ByybAiJU.js","/assets/Inspections-BRoPZlHs.js","/assets/CreateInspection-B8jUXw5K.js","/assets/InspectionDetail-BoOo5JGe.js","/assets/circle-check-big-BQm_7Ngj.js","/assets/imageCompressor-CT9I_ntH.js","/assets/zoom-out-C4i5MAC2.js","/assets/Compliances-l3qW1dGt.js","/assets/Mines-C1X9ZREP.js","/assets/hooks-CRvpAVyy.js","/assets/leafletAssets-BxttusIS.js","/assets/MineralResourcesDashboard-C4JPsB-a.js","/assets/loader-circle-D7h4VPOw.js","/assets/Contractors-f8rnlrBY.js","/assets/Alerts-BZWNZ0dC.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BSIHfJ8X.js","/assets/PieChart-BjnZWXko.js","/assets/index-7UtRdNck.js","/assets/Chat-BDyqrhPI.js","/assets/bot--mXMI5xo.js","/assets/mic-B_m1SYzX.js","/assets/shield-check-CdA0xBo8.js","/assets/Profile-BUrCk77G.js","/assets/circle-user-DBR56Pwk.js","/assets/camera-lsGhrydC.js","/assets/arrow-left-DMma8IWG.js","/assets/Workers-a4Sg4dF9.js","/assets/users-DDxs9amo.js","/assets/bell-PteN65zO.js","/assets/save-DJdTb66Z.js","/assets/Attendance-BTcbcamL.js","/assets/log-out-CrBVFrUg.js","/assets/shield-DDtu8VvS.js","/assets/user-check-DfmcNt8k.js","/assets/refresh-cw-BEeIYov_.js","/assets/search-DWGXBixB.js","/assets/x-NBifuayT.js","/assets/map-pin-Cy--xHPA.js","/assets/TableScrollContainer-5b2l466y.js","/assets/arrow-right-BBWL1ZLz.js","/assets/Support-C-k6IzEm.js","/assets/chevron-down-uJX69i18.js","/assets/send-CSYYe8cL.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BVNNB9ok.js","/assets/siren-BjJUTFD1.js","/assets/shield-alert-BAqK3Ip6.js","/assets/clipboard-check-Bj0Rt-Ml.js","/assets/circle-check-DxIGYgNW.js","/assets/radio-CdqdzXcZ.js","/assets/octagon-alert-Bilppvvq.js","/assets/life-buoy-BGFG2-18.js","/assets/phone-call-Ddl0crZI.js","/assets/plus-DZNHCBFX.js","/assets/translations-DbrZn9zW.js","/assets/web-FXCawh6o.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-UbkgJ0B2.js"];

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