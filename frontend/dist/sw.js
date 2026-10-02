const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index--CIC2y72.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CASCKoXn.js","/assets/Layout-CNDF7ffq.js","/assets/HomePage-q_sxlERA.js","/assets/sun-DCrFOjgG.js","/assets/Login-DYAg4z2I.js","/assets/languages-CLi337qe.js","/assets/Register-odkOHCXg.js","/assets/recaptcha-wrapper-Bzwx-76q.js","/assets/BrandLogo-GtVt6X5a.js","/assets/Dashboard-D3ujNu_r.js","/assets/clipboard-list-LnVbkeri.js","/assets/building-2-CLG_54G5.js","/assets/Inspections-Cl67GF2q.js","/assets/CreateInspection-COOvJtDC.js","/assets/arrow-right-Bq1pd6hB.js","/assets/InspectionDetail-DGhmsLpY.js","/assets/file-text-Bh3nM0HR.js","/assets/loader-circle-BJStTKtc.js","/assets/zoom-out-CVhlrLh5.js","/assets/Compliances-0zHPeb-R.js","/assets/Mines-CZt2SGRi.js","/assets/hooks-B6hT8C83.js","/assets/leafletAssets-Bw87yhkk.js","/assets/MineralResourcesDashboard-BlXgDzG_.js","/assets/Contractors-BtQz7FPQ.js","/assets/Alerts-BVOJN67d.js","/assets/hi-BiADQGDV.js","/assets/Analytics-C5buDVrl.js","/assets/PieChart-D_n1W2z1.js","/assets/index-CxcKz9Ej.js","/assets/Chat-BTrqM5wj.js","/assets/bot-QFwhq1ME.js","/assets/mic-CZ2hceqf.js","/assets/shield-check-Dke9t9Fm.js","/assets/Profile-DICAjfXh.js","/assets/circle-user-CWCFbZNj.js","/assets/arrow-left-J8VfQHOj.js","/assets/Workers-CTcuMVe8.js","/assets/users-CMfP7Q0U.js","/assets/bell-BQrFxhx5.js","/assets/save-kbDmcTaU.js","/assets/Attendance-DZZFkouj.js","/assets/log-out-DI3WM3Zs.js","/assets/shield-BqtdPQf7.js","/assets/user-check-DmFWg-6p.js","/assets/refresh-cw-BeLeuCKc.js","/assets/x-C0HcUJnJ.js","/assets/search-DprOrxfG.js","/assets/map-pin-YazjVT4Z.js","/assets/Support-DzdcBZG2.js","/assets/send-Cw4VabL1.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CVgvdAyW.js","/assets/siren-BBuU8xEW.js","/assets/shield-alert-DxiCJlym.js","/assets/clipboard-check-B_B0Fs04.js","/assets/circle-check-CvW5eaYp.js","/assets/radio-BaTC3J3I.js","/assets/octagon-alert-DC6bWtXl.js","/assets/life-buoy-CHcJ4_NS.js","/assets/phone-call-CSxZdodM.js","/assets/plus-CtEksP2-.js","/assets/translations-CmXZgOBw.js","/assets/web-C5wEdYLo.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Bm3e0yJr.js"];

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