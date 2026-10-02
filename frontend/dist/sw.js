const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DScH2afq.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CbNvi3tT.js","/assets/Layout-DNpRQat6.js","/assets/HomePage-Dv3xpuU-.js","/assets/sun-BRAo01Tr.js","/assets/Login-zLOFs1zQ.js","/assets/languages-CIAVFCg9.js","/assets/Register-Bpxy8BqB.js","/assets/recaptcha-wrapper-DcxxwR8X.js","/assets/BrandLogo-BmfqeZ1Y.js","/assets/Dashboard-DLHe1pP1.js","/assets/clipboard-list-DLo-VLQC.js","/assets/building-2-CuhlKC70.js","/assets/Inspections-COiwvdCZ.js","/assets/CreateInspection-DHPc75Qb.js","/assets/arrow-right-0Nb8G9YT.js","/assets/InspectionDetail-BX0le7Ew.js","/assets/file-text-C4pL6ZoG.js","/assets/loader-circle-DjW4y4D0.js","/assets/zoom-out-Dw8Nt1l8.js","/assets/Compliances-CzNDDYDu.js","/assets/Mines-UHqIQqeN.js","/assets/hooks-BsLouSjl.js","/assets/leafletAssets-EraM4PW-.js","/assets/MineralResourcesDashboard-CUFyecqV.js","/assets/Contractors-DV-U-wcC.js","/assets/Alerts-BkankYrg.js","/assets/hi-BiADQGDV.js","/assets/Analytics-C8mavzaM.js","/assets/PieChart-Yrv72AxU.js","/assets/index-g11q_T2q.js","/assets/Chat-ViNdzhCK.js","/assets/bot-D_UK6uE9.js","/assets/mic-Dz5K0uQa.js","/assets/shield-check-Cku2J3pC.js","/assets/Profile-BcjbPYtw.js","/assets/circle-user-DZcTyIWe.js","/assets/arrow-left-BTbREeLX.js","/assets/Workers-ejLPMG80.js","/assets/users-DsXtXH2z.js","/assets/bell-C6nuME0v.js","/assets/save-B2NVfqPD.js","/assets/Attendance-CJTAPPAY.js","/assets/log-out-CZMt6rhN.js","/assets/shield-Dx9BZ4sp.js","/assets/user-check-BoIPEcTi.js","/assets/refresh-cw-CgIwU1S5.js","/assets/x-CO_2k0jx.js","/assets/search-JZ1pFDjW.js","/assets/map-pin-BxkuLp4X.js","/assets/Support-DLolrbVk.js","/assets/chevron-down-CXdDBMke.js","/assets/send-Cv3tDS-b.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-amJXH7cU.js","/assets/siren-CIgQe_Q-.js","/assets/shield-alert-DBVndbj0.js","/assets/clipboard-check-B9XY2lJW.js","/assets/circle-check-DLDBHtoB.js","/assets/radio-YdGmy86Y.js","/assets/octagon-alert-B-CWTcfP.js","/assets/life-buoy-BP3MOw9j.js","/assets/phone-call-99EL43RZ.js","/assets/plus-CJbX502T.js","/assets/translations-CmXZgOBw.js","/assets/web-nUYoB3or.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-B_FYQpNv.js"];

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