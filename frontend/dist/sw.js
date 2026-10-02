const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-34YzSxRN.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CEkqIdHe.js","/assets/Layout-kQ-oiV4E.js","/assets/HomePage-B00IKHL7.js","/assets/sun-BB6EPTqI.js","/assets/Login-BTeRrJZ4.js","/assets/languages-DtbaJxxM.js","/assets/Register-CLPWUzwB.js","/assets/recaptcha-wrapper-DSKGza5f.js","/assets/BrandLogo-CwFd1QDF.js","/assets/Dashboard-BsndM4pH.js","/assets/clipboard-list-CwpInPKr.js","/assets/building-2-DXXzbCPu.js","/assets/Inspections-YXs6p31E.js","/assets/CreateInspection-Btzzgngv.js","/assets/arrow-right-ClIuoob8.js","/assets/InspectionDetail-BsMP8Y-F.js","/assets/file-text-fiBhraFk.js","/assets/loader-circle-QgP59Ebo.js","/assets/zoom-out-rmpSqS9G.js","/assets/Compliances-3o-Nng0f.js","/assets/Mines-AQrnzxbG.js","/assets/hooks-DM7X45i0.js","/assets/leafletAssets-Bbgz4e_m.js","/assets/MineralResourcesDashboard-UVvWG0Qn.js","/assets/Contractors-BZo-IXNg.js","/assets/Alerts-DjuFQRaI.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BneI_CBT.js","/assets/PieChart-Dgln5JYp.js","/assets/index-DxQW1cJg.js","/assets/Chat-B5vYb55r.js","/assets/bot-CpgSwbPS.js","/assets/mic-CARc9Zco.js","/assets/shield-check-DzPkPlUh.js","/assets/Profile-W3hexFXd.js","/assets/circle-user-CFQ2-P6-.js","/assets/arrow-left-DSvgg1yr.js","/assets/Workers-CQ11gjUe.js","/assets/users-DRd-_gOR.js","/assets/bell-ComgcemH.js","/assets/save-BKC2A480.js","/assets/Attendance-DRGFSXsm.js","/assets/log-out-C-GRomNg.js","/assets/shield-JjDtaGCR.js","/assets/user-check-DhtlhnDi.js","/assets/refresh-cw-DrLyrxQw.js","/assets/x-CUj-wPld.js","/assets/search-CVD24n7q.js","/assets/map-pin-D1sApDG6.js","/assets/Support-CTtlj8Ld.js","/assets/send-D3Mw2Fsw.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-8HJp8DUa.js","/assets/siren-CygiLzeJ.js","/assets/shield-alert-BcMCQ_mI.js","/assets/clipboard-check-Vr8lgiMx.js","/assets/circle-check-C_jBMdnI.js","/assets/radio-HopoN40D.js","/assets/octagon-alert-C-E_kdfY.js","/assets/life-buoy-DPBVixbm.js","/assets/phone-call-yDoIDCe3.js","/assets/plus-oY61uhGg.js","/assets/translations-CmXZgOBw.js","/assets/web-D6-Mpp3N.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Bz34oHeJ.js"];

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