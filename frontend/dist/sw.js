const CACHE_NAME = 'minesight-offline-v' + 1790946649811;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-B75AdPGQ.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-yWbs8x-7.js","/assets/Layout-BUBX1X99.js","/assets/HomePage-CqD3qcBf.js","/assets/sun-DMPSWo0l.js","/assets/Login-DsFbEgHt.js","/assets/languages-DId_kBBs.js","/assets/Register-7sjnTmRK.js","/assets/recaptcha-wrapper-WoaJVd9R.js","/assets/BrandLogo-B4YwPMHP.js","/assets/Dashboard-DsorSFj6.js","/assets/clipboard-list-COE212aV.js","/assets/building-2-Cwc7PDFj.js","/assets/Inspections-B5HQZlvp.js","/assets/CreateInspection-CLP9V0a8.js","/assets/arrow-right--oeP2whD.js","/assets/InspectionDetail-CzsK_43J.js","/assets/file-text-Dxo3WWaZ.js","/assets/loader-circle-e5UBujin.js","/assets/zoom-out-DlU3n-0y.js","/assets/Compliances-BJhV-jwI.js","/assets/Mines-BfyYakB2.js","/assets/hooks-D6VeKGIe.js","/assets/leafletAssets-CvcUnXcc.js","/assets/MineralResourcesDashboard-_5j06A--.js","/assets/Contractors-DSe5qpJ-.js","/assets/Alerts-Bf4vJE7J.js","/assets/hi-BiADQGDV.js","/assets/Analytics-JTqwZSJO.js","/assets/PieChart-C1ZCZ3md.js","/assets/index-DY4sOlFO.js","/assets/Chat-DCKWx8HH.js","/assets/bot-BeX1rGkK.js","/assets/mic-B-AGTAxI.js","/assets/shield-check-DOQaX4hy.js","/assets/Profile-ByKNqcD0.js","/assets/circle-user-Cep9S610.js","/assets/arrow-left-CWjK6-f-.js","/assets/Workers-DwSCWj3q.js","/assets/users-CaFqwllz.js","/assets/bell-Co44IdSt.js","/assets/save-DJmKAMyD.js","/assets/Attendance-DrH5paI8.js","/assets/log-out-DOZd_5Vr.js","/assets/shield-7E_tQBCt.js","/assets/user-check-BlW0qHGf.js","/assets/refresh-cw-CbnOOQpy.js","/assets/x-BiWV6dK5.js","/assets/search-BYdaaJ9B.js","/assets/map-pin-DTREwhOI.js","/assets/Support-D61W4TCy.js","/assets/chevron-down-BuWX_yZM.js","/assets/send-DWyYR14U.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-B-gwtJ4a.js","/assets/siren-DIRfz-eA.js","/assets/shield-alert-4GyFPQtf.js","/assets/clipboard-check-C7ZEV7Qn.js","/assets/circle-check-CJw8WFUS.js","/assets/radio-CChto01g.js","/assets/octagon-alert-BYy3eo4B.js","/assets/life-buoy-B7C8Z_U2.js","/assets/phone-call-B-oQdDgg.js","/assets/plus-CD2cJr19.js","/assets/translations-CmXZgOBw.js","/assets/web-BhjFId7B.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-k6pnr7OY.js"];

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