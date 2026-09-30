const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DAHJSEp0.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CNToqkrg.js","/assets/Layout-CS_bPxmb.js","/assets/HomePage-Vvo__FyG.js","/assets/sun-B2lZUca5.js","/assets/Login-BsDrexnE.js","/assets/languages-BJ7FEdwa.js","/assets/Register-DdtheAxB.js","/assets/recaptcha-wrapper-B6Dqme5I.js","/assets/BrandLogo-CE8gUtPi.js","/assets/Dashboard-tcftbYps.js","/assets/clipboard-list-BA8pjqCQ.js","/assets/building-2-DUBG_UZE.js","/assets/Inspections-BUlmxhYb.js","/assets/CreateInspection-BsSnRIYX.js","/assets/arrow-right-ufLLA9H7.js","/assets/InspectionDetail-NTARTvi3.js","/assets/file-text-C736CzST.js","/assets/loader-circle-C1YRYF6K.js","/assets/trash-2-Cwi0MDmb.js","/assets/Compliances-D7tVqtkq.js","/assets/Mines-Dq_QCeG3.js","/assets/hooks-TZhIcthi.js","/assets/leafletAssets-DLPNNiO-.js","/assets/MineralResourcesDashboard-BOcd0bP8.js","/assets/Contractors-CjBLz0xd.js","/assets/Alerts-DKXNw9hv.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DBkfVizz.js","/assets/PieChart-DJDdDGxc.js","/assets/index-pp7L_0eH.js","/assets/Chat-MXG0gVsb.js","/assets/bot-Ch04yeGW.js","/assets/mic-DwBnouol.js","/assets/shield-check-BwZ-oBs2.js","/assets/Profile-BFxMQN2a.js","/assets/circle-user-CwLAMCn6.js","/assets/arrow-left-C2KVPHO2.js","/assets/translations-dTjUQ25p.js","/assets/Workers-1HS6h3LK.js","/assets/users-BUTl16mn.js","/assets/bell-CULF0RUB.js","/assets/save-hK5jgf5J.js","/assets/Attendance-BB65b5la.js","/assets/log-out-DMI2T5eL.js","/assets/shield-38a_poUv.js","/assets/user-check-BpUswUxC.js","/assets/refresh-cw-B1B9UJe9.js","/assets/x-klLcZi6o.js","/assets/search-jvXl4R8l.js","/assets/map-pin-CsWAiqz8.js","/assets/Support-C1gf81UT.js","/assets/send-CKeSNmDV.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-H5ugkp-G.js","/assets/siren-c-0bRyRy.js","/assets/shield-alert-DaQAsfE5.js","/assets/clipboard-check-Cs8yBpuJ.js","/assets/circle-check-BXOp6ffy.js","/assets/radio-L05x8m4j.js","/assets/octagon-alert-GKQ_niQl.js","/assets/life-buoy-DM6I5Irv.js","/assets/phone-call-w6GYGwAp.js","/assets/plus-CTW5kQWi.js","/assets/web-CVp35Gy6.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DUDJvVvK.js"];

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