const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BkzHaf7C.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-KZLleZwo.js","/assets/Layout-C0osJhbl.js","/assets/HomePage-DYGLbQQk.js","/assets/sun-Dbzj2QI2.js","/assets/Login-B8v3AnME.js","/assets/languages-Dx3OAQN_.js","/assets/Register-D2PCvujM.js","/assets/recaptcha-wrapper-CrPxo-MG.js","/assets/BrandLogo-WZ6QcKbr.js","/assets/Dashboard-DubeQrtS.js","/assets/clipboard-list-Dsoe_FYw.js","/assets/building-2-DkdE5ABL.js","/assets/Inspections-CKlCHnHY.js","/assets/CreateInspection-DiAqjI31.js","/assets/arrow-right-Qa4qGBTn.js","/assets/InspectionDetail-CpRxcife.js","/assets/file-text-1vKWVG7x.js","/assets/loader-circle-Bt1Em5q2.js","/assets/zoom-out-mYWcRzu2.js","/assets/Compliances-C2mNpIZh.js","/assets/Mines-SMLSDPXF.js","/assets/hooks-ClD_QdH0.js","/assets/leafletAssets-Cg0rM3as.js","/assets/MineralResourcesDashboard-Dx84Q4D-.js","/assets/Contractors-Bz7D9YX9.js","/assets/Alerts-OTFeDraH.js","/assets/hi-BiADQGDV.js","/assets/Analytics-uXg-gvVf.js","/assets/PieChart-B8xTQ8Dq.js","/assets/index-W_NuYXLJ.js","/assets/Chat-CzvND8Tg.js","/assets/bot-BqvXJD6Y.js","/assets/mic-DnWP7zbM.js","/assets/shield-check-a4adkcUa.js","/assets/Profile-EzxHn-0A.js","/assets/circle-user-C8w9t-8v.js","/assets/arrow-left-C0H-LlYF.js","/assets/Workers-CMjQqs1Y.js","/assets/users-B3b40ixS.js","/assets/bell-CWJgvq9F.js","/assets/save-C2mgJuD0.js","/assets/Attendance-DIkRMDm6.js","/assets/log-out-DbWOBgOa.js","/assets/shield-bfaZH9xc.js","/assets/user-check-U5xni5dr.js","/assets/refresh-cw-BS4kHB23.js","/assets/x-CykF4J2N.js","/assets/search-BwVuI5yn.js","/assets/map-pin-DKWVo1xs.js","/assets/Support-sNdIfwRB.js","/assets/send-PjKYeT5x.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DXXBlxxh.js","/assets/siren-Bjq9EfVf.js","/assets/shield-alert-Ct4cwvoU.js","/assets/clipboard-check-CVKA9pnX.js","/assets/circle-check-BaipAJOA.js","/assets/radio-qw6RJlRU.js","/assets/octagon-alert-CpXKFfkN.js","/assets/life-buoy-C474RSlW.js","/assets/phone-call-CGrqHYdY.js","/assets/plus-u3ekLPMp.js","/assets/translations-CmXZgOBw.js","/assets/web-BzjDelYK.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-rXzXmSd0.js"];

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