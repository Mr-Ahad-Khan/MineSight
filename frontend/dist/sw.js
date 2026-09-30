const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-l1CEq2yb.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CygAeyt7.js","/assets/Layout-K3BzxR2y.js","/assets/HomePage-BDXF3jhQ.js","/assets/sun-C2BgNTZA.js","/assets/Login-DSdnsaxD.js","/assets/languages-DmLwsdtw.js","/assets/Register-B75WMNCP.js","/assets/recaptcha-wrapper-C37q6wI3.js","/assets/BrandLogo-JoU9I6zd.js","/assets/Dashboard-CIJi52BP.js","/assets/clipboard-list-B2lh2DG6.js","/assets/building-2-Y9Gn5ZtZ.js","/assets/Inspections-1Um1JWhA.js","/assets/CreateInspection-BSaEpc0Q.js","/assets/arrow-right-DEFCPJpN.js","/assets/InspectionDetail-DuTQWI40.js","/assets/file-text-CQ1HMTZ2.js","/assets/loader-circle-BhGWardI.js","/assets/trash-2-BDxYEai_.js","/assets/Compliances-4JoJlh3Q.js","/assets/Mines-BjxagEtA.js","/assets/hooks-D9EudptF.js","/assets/leafletAssets--Evi68St.js","/assets/MineralResourcesDashboard-8aMheT7I.js","/assets/Contractors-0Vnr4DtU.js","/assets/Alerts-DiWTyK6c.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BdmWtM3r.js","/assets/PieChart-CclUTk7Y.js","/assets/index-iLK3SHAS.js","/assets/Chat-CGB2kIOO.js","/assets/bot-Br2agagY.js","/assets/mic-DbUBDXBX.js","/assets/shield-check-Cxw8VQjW.js","/assets/Profile-YoGkYyko.js","/assets/circle-user-JLeTpkof.js","/assets/arrow-left-C2rvYcxd.js","/assets/translations-dTjUQ25p.js","/assets/Workers-D1_ovRHd.js","/assets/users-B8bgPFPv.js","/assets/bell-Cls5doYi.js","/assets/save-DTmkQJtq.js","/assets/Attendance-DRVU6DsQ.js","/assets/log-out-DwZ3SC8e.js","/assets/shield-Bv7uXqQt.js","/assets/user-check-DzYFdXt0.js","/assets/refresh-cw-5in68rX7.js","/assets/x-BjSdkDLA.js","/assets/search-D1y7uq2c.js","/assets/map-pin-Dkyoa-7e.js","/assets/Support-BmsoG7eq.js","/assets/send-DlCWErMU.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Cmsf48um.js","/assets/siren-CK9c2LvF.js","/assets/shield-alert-B8Gp-uUL.js","/assets/clipboard-check-b7DcsFJE.js","/assets/circle-check-DXs69Vuc.js","/assets/radio-DF0K5jZN.js","/assets/octagon-alert-CbHl6O3v.js","/assets/life-buoy-BkL4IggO.js","/assets/phone-call-DqV0POLT.js","/assets/plus-bNOGVd_V.js","/assets/web-DCpMk1JK.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-9DSg7YFR.js"];

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