const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-D7-Cbqnj.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-b39JHse5.js","/assets/Layout-3EHrKcE-.js","/assets/HomePage-DFH7tsS0.js","/assets/sun-Djrg8KgX.js","/assets/Login-DMp-wUtF.js","/assets/languages-DmUBggpj.js","/assets/Register-BL_EHVRb.js","/assets/recaptcha-wrapper-Bkn-4ZFt.js","/assets/BrandLogo-BE3TU4I1.js","/assets/Dashboard-jstwPS9n.js","/assets/clipboard-list-DwF_LGJE.js","/assets/building-2-BhD9wdDw.js","/assets/Inspections-CwyiPzuW.js","/assets/CreateInspection-Cq9GUggj.js","/assets/arrow-right-qHDPlNAl.js","/assets/InspectionDetail-B_RPOY_I.js","/assets/file-text-Czxaw5TG.js","/assets/loader-circle-DrpBs6jD.js","/assets/zoom-out-BHIX06nZ.js","/assets/Compliances-CFPNFak-.js","/assets/Mines-Df1qkWuJ.js","/assets/hooks-CkKXus3g.js","/assets/leafletAssets-DAk98ftB.js","/assets/MineralResourcesDashboard-ztO7Pq4Y.js","/assets/Contractors-DZ3bD8ds.js","/assets/Alerts-ChR-fAe6.js","/assets/hi-BiADQGDV.js","/assets/Analytics-B9LtHw7X.js","/assets/PieChart-CHq6auC4.js","/assets/index-BJMD8-dj.js","/assets/Chat-BJNWjDL2.js","/assets/bot-DGRJ4CwA.js","/assets/mic-DjmRrRYp.js","/assets/shield-check-uhpONQQg.js","/assets/Profile-QNuL1ly6.js","/assets/circle-user-DrZgD8XM.js","/assets/arrow-left-BSrAKH6y.js","/assets/Workers-5l4zIxh3.js","/assets/users-BHukuTsb.js","/assets/bell-aoun8aX-.js","/assets/save-BXRT_1HD.js","/assets/Attendance-BPc5559x.js","/assets/log-out-Db2ozZNl.js","/assets/shield-DLlGc0Qa.js","/assets/user-check-DC_l6Ewm.js","/assets/refresh-cw-vLBoW_uj.js","/assets/x-DbCtMFW9.js","/assets/search-VM8xniS0.js","/assets/map-pin-C14h85jC.js","/assets/Support-B91DUDWO.js","/assets/send-Dcg98ShR.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-D3n3M6v1.js","/assets/siren-C91MtLjP.js","/assets/shield-alert-CyUCmg1X.js","/assets/clipboard-check-BW4Qo9Qu.js","/assets/circle-check-BYvvnul5.js","/assets/radio-yCUh62NI.js","/assets/octagon-alert-HbRGzAcW.js","/assets/life-buoy-Cymd7XG4.js","/assets/phone-call-BGB2a0ex.js","/assets/plus-DEMJ9mLU.js","/assets/translations-4lB6-QN_.js","/assets/web-Q5Yf_qpN.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CU9YNp3e.js"];

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