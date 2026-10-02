const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BRpUiPmV.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-D-RMcW2n.js","/assets/Layout-CuTCaXZc.js","/assets/HomePage-De3-89pc.js","/assets/sun-1TCC1_D-.js","/assets/Login-KcaIiccg.js","/assets/languages-BxXA85Lq.js","/assets/Register-Cf_p09Ha.js","/assets/recaptcha-wrapper-B7inSku7.js","/assets/BrandLogo-CXkD0lKk.js","/assets/Dashboard-DWWBdFAy.js","/assets/clipboard-list-PscHXhWw.js","/assets/building-2-CQCBRT4E.js","/assets/Inspections-CUwq0ELN.js","/assets/CreateInspection-C-dhbs28.js","/assets/arrow-right-DCGpVbdG.js","/assets/InspectionDetail-DDeyKBYL.js","/assets/file-text-ITTByHeB.js","/assets/loader-circle-DrbUsSby.js","/assets/zoom-out-Cs3Q2MRI.js","/assets/Compliances-C3NM4YAY.js","/assets/Mines-q9P3tsRV.js","/assets/hooks-BKelXXbO.js","/assets/leafletAssets-B3RMTBBn.js","/assets/MineralResourcesDashboard-DTMSjDrp.js","/assets/Contractors-DyI9pEhs.js","/assets/Alerts-C04uk2hX.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CIYDsE7n.js","/assets/PieChart-DFythRMS.js","/assets/index-B2DOIWD9.js","/assets/Chat-BOlEnEb2.js","/assets/bot-EncX15KS.js","/assets/mic-BaZ-JSpX.js","/assets/shield-check-CMA0pU1D.js","/assets/Profile-ubofH5fl.js","/assets/circle-user-Cl_b8g4r.js","/assets/arrow-left-CfLo0b86.js","/assets/translations-ll4_NWuA.js","/assets/Workers-CT3J8s5G.js","/assets/users-1uxNp2HV.js","/assets/bell-DzCgSXlG.js","/assets/save-CeOy-Phj.js","/assets/Attendance-BYc77eiL.js","/assets/log-out-C366c-Vy.js","/assets/shield-CqiAQlcp.js","/assets/user-check-mX6etxD-.js","/assets/refresh-cw-h4HbocAT.js","/assets/x-BZHZuti1.js","/assets/search-CMS1qDGv.js","/assets/map-pin-DrB106Dl.js","/assets/Support-Lrw2iX2r.js","/assets/send-OBq4UcYI.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-ZDwLSTox.js","/assets/siren-GWSI8Rum.js","/assets/shield-alert-DQN42Ban.js","/assets/clipboard-check-CUhAUKPu.js","/assets/circle-check-BRwi8laz.js","/assets/radio-DTT82Pl9.js","/assets/octagon-alert-ENYe-mLU.js","/assets/life-buoy-CjUFhGiL.js","/assets/phone-call-HVA-a1aT.js","/assets/plus-BaNYWQvl.js","/assets/web-B0D6T5C5.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BLhVDJG1.js"];

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