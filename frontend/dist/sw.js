const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-D7-Cbqnj.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Bu0IOzda.js","/assets/Layout-CU-PFIxr.js","/assets/HomePage-nOAydKMw.js","/assets/sun-BBOrx15H.js","/assets/Login-DUzOMl2b.js","/assets/languages-hCMbCgG6.js","/assets/Register-CR5VpG_E.js","/assets/recaptcha-wrapper-CRBkGHEM.js","/assets/BrandLogo-BG2YMWQt.js","/assets/Dashboard-cM6LOpVU.js","/assets/clipboard-list-BjtC2YCu.js","/assets/building-2-c-xQPGOr.js","/assets/Inspections-DdKtyrR2.js","/assets/CreateInspection-CexgBDoe.js","/assets/arrow-right-C3w8Nk-Q.js","/assets/InspectionDetail-DjE8fsD5.js","/assets/file-text-D914sKvP.js","/assets/loader-circle-CZMtVf0o.js","/assets/zoom-out-CtXk2Pma.js","/assets/Compliances-BxNzugrr.js","/assets/Mines-Dn_-ORJO.js","/assets/hooks-GQ3yHEan.js","/assets/leafletAssets-BYpbu9aU.js","/assets/MineralResourcesDashboard-Cyuj1BSf.js","/assets/Contractors-Cb9b-9nk.js","/assets/Alerts-CSkhoNCT.js","/assets/hi-BiADQGDV.js","/assets/Analytics-sxMKcB1Z.js","/assets/PieChart-BErWkYKI.js","/assets/index-Ct4Yh4QQ.js","/assets/Chat-BiErUi7e.js","/assets/bot-CTKljPKB.js","/assets/mic-86Nef_j0.js","/assets/shield-check-DxGOS3fy.js","/assets/Profile-6aJdXaK5.js","/assets/circle-user-DHUfRO6G.js","/assets/arrow-left-Caabqgil.js","/assets/Workers-Bn3NSOa6.js","/assets/users-BacFggKN.js","/assets/bell-DgiWVDB3.js","/assets/save-Cl9PtQbz.js","/assets/Attendance-EamnUDPU.js","/assets/log-out-CvEeOYc7.js","/assets/shield-Dfh5AuW5.js","/assets/user-check-Ci-1DkCQ.js","/assets/refresh-cw-DI4APW9b.js","/assets/x-DIb7WPCN.js","/assets/search-BzwqVWEm.js","/assets/map-pin-DBfFOxqx.js","/assets/Support-uZCWmIIq.js","/assets/send-DEon6NK_.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BLnhrNUd.js","/assets/siren-DMSmGY1f.js","/assets/shield-alert-DWsetZ1s.js","/assets/clipboard-check-D2XMj6ov.js","/assets/circle-check-BVeamIzV.js","/assets/radio-D7s69l9e.js","/assets/octagon-alert-CY9XwwIB.js","/assets/life-buoy-DuyfxbP7.js","/assets/phone-call-DtTqOm0U.js","/assets/plus-BD96LAhX.js","/assets/translations-CpkDQR4x.js","/assets/web-CXhqcGR_.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DfST556J.js"];

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