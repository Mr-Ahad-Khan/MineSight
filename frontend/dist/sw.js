const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DtC5nQvG.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CxieJYCN.js","/assets/Layout-DXBKT7eY.js","/assets/HomePage-BLLuRRNl.js","/assets/sun-u2Hwm9w3.js","/assets/Login-BKH9SK1w.js","/assets/languages-DHSJe18x.js","/assets/Register-UqV_tzIl.js","/assets/recaptcha-wrapper-BdgeRYGO.js","/assets/BrandLogo-YDq2k0uj.js","/assets/Dashboard-DRgqmP4I.js","/assets/clipboard-list-C8Io99nY.js","/assets/building-2-Bbs4MF3R.js","/assets/Inspections-CDkRRWM_.js","/assets/CreateInspection-Br3sg1Pg.js","/assets/arrow-right-Br81HisI.js","/assets/InspectionDetail-C3UCLV8R.js","/assets/file-text-DDPbcN1h.js","/assets/loader-circle-DYswIPCd.js","/assets/zoom-out-Bhwe7cww.js","/assets/Compliances-DB5m8t2B.js","/assets/Mines-RWpYKBR8.js","/assets/hooks-Dt3hJ6NE.js","/assets/leafletAssets-DWWbCcDD.js","/assets/MineralResourcesDashboard-DqpGYdeS.js","/assets/Contractors-B0sZb1MI.js","/assets/Alerts-JCDD5lCs.js","/assets/hi-BiADQGDV.js","/assets/Analytics-D5yKm8Z7.js","/assets/PieChart-CqvyjvO0.js","/assets/index-BLWVCvfm.js","/assets/Chat-y_26mr4i.js","/assets/bot-C6yiB-om.js","/assets/mic-BTh2-bxa.js","/assets/shield-check-CM9K8uE4.js","/assets/Profile-BCbpm-8t.js","/assets/circle-user-DyMRu4ty.js","/assets/arrow-left-Bp0EYaGk.js","/assets/Workers-6Sfq7ogg.js","/assets/users-C4w5FQ-Y.js","/assets/bell-rW5RswsW.js","/assets/save-CGmT6sCF.js","/assets/Attendance-DVTPXJlB.js","/assets/log-out-DemmR0nB.js","/assets/shield-C2Klyp2g.js","/assets/user-check-CI_O0Cbe.js","/assets/refresh-cw-BeevIS2v.js","/assets/x-Db3QaiCO.js","/assets/search-DvBht0Rz.js","/assets/map-pin-CB3TAQKH.js","/assets/Support-CO0kxgXJ.js","/assets/send-Crgk74D-.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BWjl7jr2.js","/assets/siren-CIltdYb8.js","/assets/shield-alert-DjmZOGdB.js","/assets/clipboard-check-Bnw2EhYs.js","/assets/circle-check-BU2nriMZ.js","/assets/radio-DoyEgsbo.js","/assets/translations-Cg0Fu4mS.js","/assets/octagon-alert-DUQwowcq.js","/assets/life-buoy-D8r-Vm8R.js","/assets/phone-call-Da10PYNR.js","/assets/plus-VGMJcJDY.js","/assets/web-DfgwCRYs.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CSHLcugT.js"];

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