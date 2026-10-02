const CACHE_NAME = 'minesight-offline-v' + 1790955690602;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-B-jRMSST.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CzU_S1CO.js","/assets/Layout-Dob6mdMh.js","/assets/HomePage-Bip6f_KG.js","/assets/sun-CzAq1SL5.js","/assets/Login-CcPOQiCF.js","/assets/languages-nUD64-j9.js","/assets/Register-C_DPIY0y.js","/assets/recaptcha-wrapper-DMPTEWBs.js","/assets/BrandLogo-CKngg2jQ.js","/assets/Dashboard-BgjaP7mv.js","/assets/clipboard-list-DD9MzVnn.js","/assets/building-2-DscsuR1d.js","/assets/Inspections-7qL9HnfV.js","/assets/CreateInspection-D_bxNnTa.js","/assets/InspectionDetail-CX8p0T9K.js","/assets/file-text-9lOqEpvt.js","/assets/loader-circle-BYDwk-Xx.js","/assets/zoom-out-T_blL-Db.js","/assets/Compliances-BkKuYz3R.js","/assets/Mines-CQKJo7e0.js","/assets/hooks-BLjqvfPR.js","/assets/leafletAssets-Bk70no5C.js","/assets/MineralResourcesDashboard-BXgGw_pp.js","/assets/Contractors-nau_b_EH.js","/assets/Alerts-BeUOsgun.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DlYPYG90.js","/assets/PieChart-iAZ17uD2.js","/assets/index-CCErDg_F.js","/assets/Chat-CWIZy-LQ.js","/assets/bot-BFx-zWQH.js","/assets/mic-8e6lt3RL.js","/assets/shield-check-CsoF09mm.js","/assets/Profile-Cwbxszt6.js","/assets/circle-user-tJFRCqUd.js","/assets/arrow-left-CStUHh7u.js","/assets/Workers-CcwPFtSv.js","/assets/users-Duzmsg51.js","/assets/bell-CmS7-rA_.js","/assets/save-AI2fUPO7.js","/assets/Attendance-eqj4ltkA.js","/assets/log-out-y8P5Lmnj.js","/assets/shield-BtKOis7M.js","/assets/user-check-CTqWHwql.js","/assets/refresh-cw-M7ZT0SzK.js","/assets/x-D_i71TQO.js","/assets/search-CX3NmSkV.js","/assets/map-pin-CM07zS_S.js","/assets/TableScrollContainer-CXV-bUYT.js","/assets/arrow-right-T6jR3OKd.js","/assets/Support-p8UYp_w3.js","/assets/chevron-down-Dmd77gUx.js","/assets/send-Ba6Air1m.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DY4Pxh-g.js","/assets/siren-DNwPURcm.js","/assets/shield-alert-BR-jGFkD.js","/assets/clipboard-check-CCedXzMU.js","/assets/circle-check-BEuR0C7C.js","/assets/radio-fOVdQoEM.js","/assets/octagon-alert-CXU_30TO.js","/assets/life-buoy-B4IwOesN.js","/assets/phone-call-DTl5fdp8.js","/assets/plus-jL4HM8kx.js","/assets/translations-DbrZn9zW.js","/assets/web-MWlYl2-u.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Cs8eUTBV.js"];

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