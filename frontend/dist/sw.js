const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-Cd1xoz6x.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-C2gLpfED.js","/assets/Layout-DJ7tZqeH.js","/assets/HomePage-Ch3F4MkE.js","/assets/sun-B9juS_tP.js","/assets/Login-CvdruK8a.js","/assets/languages-DcyMENDg.js","/assets/Register-hPNuEkDe.js","/assets/recaptcha-wrapper-ZipIW2Q3.js","/assets/BrandLogo-BuVVDCKl.js","/assets/Dashboard-vrqv1fIT.js","/assets/clipboard-list-DLK903NC.js","/assets/building-2-CVtPlnXg.js","/assets/Inspections-Bm8NcjQU.js","/assets/CreateInspection-DoFz4YzO.js","/assets/arrow-right-CrQOAUtF.js","/assets/InspectionDetail-JMTf5zCn.js","/assets/file-text-DNb_V7-y.js","/assets/loader-circle-C1oWAwXk.js","/assets/zoom-out-DbnO_AE5.js","/assets/Compliances-CEA560g2.js","/assets/Mines-CAkACeN3.js","/assets/hooks-BYdPoZvU.js","/assets/leafletAssets-B2mfcYuw.js","/assets/MineralResourcesDashboard-coIqeIrf.js","/assets/Contractors-bCtqoCJc.js","/assets/Alerts-CBYuX25V.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BAgaPAjU.js","/assets/PieChart-CpM_v07B.js","/assets/index-B_moXOYg.js","/assets/Chat-DKY3GIBI.js","/assets/bot-FGM6sBZX.js","/assets/mic-DfBqBKXj.js","/assets/shield-check-BxTKp6le.js","/assets/Profile-CZKQ1-ac.js","/assets/circle-user-CaZybFfy.js","/assets/arrow-left-kD_TsexP.js","/assets/translations-dTjUQ25p.js","/assets/Workers-B8ymwI12.js","/assets/users-XSMOG7Z6.js","/assets/bell-DFJtI1en.js","/assets/save-nQV4EJZh.js","/assets/Attendance-BRl2YCk8.js","/assets/log-out-Cokf3oPa.js","/assets/shield-dhds_Fxj.js","/assets/user-check-Bw0eUqDb.js","/assets/refresh-cw-lGc5xTAm.js","/assets/x-Df6RV7YR.js","/assets/search-3sBc9WTF.js","/assets/map-pin-B9jpFoCL.js","/assets/Support-CxyshK07.js","/assets/send-AWANqAw8.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-SMPCwdDF.js","/assets/siren-9t27a5gR.js","/assets/shield-alert-D009_5r9.js","/assets/clipboard-check-DFK7dC9t.js","/assets/circle-check-DXXmQukT.js","/assets/radio-C3r5IkEd.js","/assets/octagon-alert-BLiInQll.js","/assets/life-buoy-YsBj-R-Q.js","/assets/phone-call-4H13NPNR.js","/assets/plus-DyTfL6z0.js","/assets/web-D0a6Cvic.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CdTKSoRp.js"];

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