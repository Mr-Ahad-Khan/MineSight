const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CPvirMlX.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CAMI7djg.js","/assets/Layout-C_KggijE.js","/assets/HomePage-Dr7ienFB.js","/assets/sun-CSAFPOAm.js","/assets/Login-OtUvzLXY.js","/assets/languages-BjHti0nO.js","/assets/Register-CnO2K92O.js","/assets/recaptcha-wrapper-DVGmBUkq.js","/assets/BrandLogo-Dl54niuv.js","/assets/Dashboard-iQ7q6-70.js","/assets/clipboard-list-CbP63aKl.js","/assets/building-2-BpfT_5pq.js","/assets/Inspections-Do5GiLHE.js","/assets/CreateInspection-YrpROSBn.js","/assets/arrow-right-3kdWgWLX.js","/assets/InspectionDetail-DPYoxh-E.js","/assets/file-text-CWdAlhCq.js","/assets/loader-circle-DKZfANcH.js","/assets/zoom-out-CdyxgmkU.js","/assets/Compliances-D65WBjZ6.js","/assets/Mines-CiHzr5Cl.js","/assets/hooks-kVgJSPvZ.js","/assets/leafletAssets-DuM30eLb.js","/assets/MineralResourcesDashboard-BwZxlcIA.js","/assets/Contractors-DtWmCQLs.js","/assets/Alerts-qTfsltGH.js","/assets/hi-BiADQGDV.js","/assets/Analytics-ByOy2Ml3.js","/assets/PieChart-BqsAqW1u.js","/assets/index-D1s-56UQ.js","/assets/Chat-DJjQu-xt.js","/assets/bot-CLNa_U1H.js","/assets/mic-BZob6uL5.js","/assets/shield-check-Dc-KW_2z.js","/assets/Profile-4927MpZ6.js","/assets/circle-user-D6_ek6aR.js","/assets/arrow-left-RVFx80sS.js","/assets/translations-dTjUQ25p.js","/assets/Workers-Dp0WQtwU.js","/assets/users-DWBaAmww.js","/assets/bell-DWLmKDaj.js","/assets/save-Bu_06HPV.js","/assets/Attendance-DGZ8nKBh.js","/assets/log-out-DQFewvB-.js","/assets/shield-COJPtouy.js","/assets/user-check-Dw7-TBu1.js","/assets/refresh-cw-kMRxkaO6.js","/assets/x-BDt1kIJU.js","/assets/search-C4t7T0-e.js","/assets/map-pin-CokXAt-9.js","/assets/Support-B_j5_zuh.js","/assets/send-BKGvfz7a.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-HJwv58ha.js","/assets/siren-DoPyzdYM.js","/assets/shield-alert-BUcO12Q9.js","/assets/clipboard-check-TVuA5zp8.js","/assets/circle-check-BmN3eKuK.js","/assets/radio-hLa6A0GA.js","/assets/octagon-alert-zIUWbsJT.js","/assets/life-buoy-DqtEtkKj.js","/assets/phone-call-DHFWYQi1.js","/assets/plus-CG-p52tQ.js","/assets/web-wn-fPQat.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CbqEJzVj.js"];

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