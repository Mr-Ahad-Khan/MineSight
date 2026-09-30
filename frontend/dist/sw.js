const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CXm0LBsX.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BQ-u4BYt.js","/assets/Layout-DZjpWH-F.js","/assets/HomePage-D4f9kA3e.js","/assets/sun-C9O9c_T-.js","/assets/Login-BGqYZZZ2.js","/assets/languages-Bbl2LE64.js","/assets/Register-BApXTqAP.js","/assets/recaptcha-wrapper-BBuErqav.js","/assets/BrandLogo-Bj04ACkP.js","/assets/Dashboard-C1d9cOXv.js","/assets/clipboard-list-BkfjYjfQ.js","/assets/building-2-DW4NbRoH.js","/assets/Inspections-CQuBMGAq.js","/assets/CreateInspection-DUngfWHA.js","/assets/arrow-right-Zpo7hGom.js","/assets/InspectionDetail-DEG74MsX.js","/assets/file-text-BuanQ5Z2.js","/assets/loader-circle-CSEpmsgr.js","/assets/zoom-out-DKoa1cM3.js","/assets/Compliances-Dq4in_gJ.js","/assets/Mines-BjZmHH7Q.js","/assets/hooks-SbSHQ5oJ.js","/assets/leafletAssets-O_7LwrDg.js","/assets/MineralResourcesDashboard-DgEzZ1uP.js","/assets/Contractors-xbG6mp-O.js","/assets/Alerts-BANMgW7D.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DOlaXzIG.js","/assets/PieChart-CS9_fqrg.js","/assets/index-r-qVbp-f.js","/assets/Chat-ni3qcEFc.js","/assets/bot-C89alDq9.js","/assets/mic-DsF9yh0g.js","/assets/shield-check-CFHDYlsi.js","/assets/Profile-BhNZZpY9.js","/assets/circle-user-C6giTMtn.js","/assets/arrow-left-DiQk6PDW.js","/assets/translations-dTjUQ25p.js","/assets/Workers-3F54hHum.js","/assets/users-CVKVtA2e.js","/assets/bell-CGDZWjPi.js","/assets/save-u-QhhdWL.js","/assets/Attendance-KxkxpTU2.js","/assets/log-out-BmHd_sI6.js","/assets/shield-9OjlH8zQ.js","/assets/user-check-lHGkau0c.js","/assets/refresh-cw-D9j8SAmO.js","/assets/x-BdORQuh7.js","/assets/search-CkO9SuW9.js","/assets/map-pin-DUnxq6hh.js","/assets/Support-DWP05UH5.js","/assets/send-CxiwOjqu.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-i4ucL_HH.js","/assets/siren-DvJtLOjt.js","/assets/shield-alert-CVyax395.js","/assets/clipboard-check-CiOU4uYU.js","/assets/circle-check-f1pOz4H_.js","/assets/radio-Z0hE-Q81.js","/assets/octagon-alert-Pa9nmSzG.js","/assets/life-buoy-Cp7ge18z.js","/assets/phone-call-DUziCjBb.js","/assets/plus-BPlh3PrD.js","/assets/web-Bf1R25Ua.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-C5Cc_1SH.js"];

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