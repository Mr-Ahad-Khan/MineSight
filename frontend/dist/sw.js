const CACHE_NAME = 'minesight-offline-v' + 1790945349071;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-lGzCY1Qm.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CJ8QBHIH.js","/assets/Layout-4EYcY9RH.js","/assets/HomePage-D32-XASw.js","/assets/sun-Co8vSt09.js","/assets/Login-BfArDdKE.js","/assets/languages-VNsICk9f.js","/assets/Register-C_iGhHoN.js","/assets/recaptcha-wrapper-BnlzcaYx.js","/assets/BrandLogo-Do6AwDR8.js","/assets/Dashboard-BJVAWrUK.js","/assets/clipboard-list-DJiljN1p.js","/assets/building-2-Dj3TNUC9.js","/assets/Inspections-D-5CzWzY.js","/assets/CreateInspection-BwXhB7qh.js","/assets/arrow-right-CPkxFLqV.js","/assets/InspectionDetail-GBocXl8I.js","/assets/file-text-9InEe2Ku.js","/assets/loader-circle-CYKz4Cjo.js","/assets/zoom-out-BVbehlAN.js","/assets/Compliances-DWrUfCSL.js","/assets/Mines-CtNsGDdb.js","/assets/hooks-CjPUkWMb.js","/assets/leafletAssets-BcXlE-53.js","/assets/MineralResourcesDashboard-CjE4WLDR.js","/assets/Contractors-Bnngpyql.js","/assets/Alerts-Car3w6-L.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DYp_3im_.js","/assets/PieChart-CY-CaSP3.js","/assets/index-Bjj5QOm7.js","/assets/Chat-7Z_pzG1T.js","/assets/bot-CiToCpSN.js","/assets/mic-ohgd03UK.js","/assets/shield-check-BQwDGtf_.js","/assets/Profile-RJ1vh9UJ.js","/assets/circle-user-BGoQaFTv.js","/assets/arrow-left-BKsoB-5i.js","/assets/Workers-Yf6AYm2N.js","/assets/users-MVb9Br-N.js","/assets/bell-rSjJ3kMk.js","/assets/save-DooL3-If.js","/assets/Attendance-BnBVYUQO.js","/assets/log-out-DojtQmxe.js","/assets/shield-CNDVzTFw.js","/assets/user-check-D0XIrVRp.js","/assets/refresh-cw-CEo3kLMp.js","/assets/x-DdSmqVuy.js","/assets/search-Bn9w22at.js","/assets/map-pin-D07nWKgQ.js","/assets/Support-BWLxUmAl.js","/assets/chevron-down-COqm-TRN.js","/assets/send-D7TTH0FS.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-iB-UUPDR.js","/assets/siren-BaN777jK.js","/assets/shield-alert-LL_bXrNc.js","/assets/clipboard-check-CFyzmxAv.js","/assets/circle-check-D34tRYkM.js","/assets/radio-Bhw-YU28.js","/assets/octagon-alert-Fy3R4eSm.js","/assets/life-buoy-Dtu5Cn3A.js","/assets/phone-call-CY2KYmWl.js","/assets/plus-h3x9QxgV.js","/assets/translations-CmXZgOBw.js","/assets/web-CpHbIy8q.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-eyUt0cBP.js"];

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