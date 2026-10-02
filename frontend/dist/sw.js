const CACHE_NAME = 'minesight-offline-v' + 1790944738163;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DJD0sEDS.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DjJKaIag.js","/assets/Layout-CbWllmes.js","/assets/HomePage-DD0m78xg.js","/assets/sun-COZqmpOe.js","/assets/Login-D0ClGzkH.js","/assets/languages-Dw2UOelT.js","/assets/Register-cRVI3RdK.js","/assets/recaptcha-wrapper-CZ_qvOyQ.js","/assets/BrandLogo-DP-JZs8K.js","/assets/Dashboard-DxKHozIL.js","/assets/clipboard-list-BcokiIyR.js","/assets/building-2-7Jau4Ihv.js","/assets/Inspections-BKyo2J0o.js","/assets/CreateInspection-qx8XZ6rJ.js","/assets/arrow-right-WHeMuqzO.js","/assets/InspectionDetail-DsmNTQZV.js","/assets/file-text-DzYN60Xo.js","/assets/loader-circle-D7YOmdAT.js","/assets/zoom-out-D47bTB8v.js","/assets/Compliances-CUomGSol.js","/assets/Mines-DpG4Jx_0.js","/assets/hooks--G-FBF2o.js","/assets/leafletAssets-D3XQpIfP.js","/assets/MineralResourcesDashboard-BCozEkOs.js","/assets/Contractors-CBzfBM00.js","/assets/Alerts-DJptoiVL.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CqAU-iu5.js","/assets/PieChart-BJuVon7R.js","/assets/index-CIImGJRA.js","/assets/Chat-BaJyK9_E.js","/assets/bot-D_saO-Pt.js","/assets/mic-D0LWpP7D.js","/assets/shield-check-D1NDamAU.js","/assets/Profile-C_QwOTPt.js","/assets/circle-user-BllMem2Y.js","/assets/arrow-left-BGEn1M5y.js","/assets/Workers-JKxmM9J1.js","/assets/users-D-8iceIS.js","/assets/bell-DE5PnFPt.js","/assets/save-BldC_6Tb.js","/assets/Attendance-DXxSOZd7.js","/assets/log-out-7BDvkZCQ.js","/assets/shield-Rhoh_6dv.js","/assets/user-check-B6oH15AI.js","/assets/refresh-cw-EtGUloPx.js","/assets/x-DAQqF7FG.js","/assets/search-DwQL2G5k.js","/assets/map-pin-wvP7KtGW.js","/assets/Support-DHkiEZhu.js","/assets/chevron-down-CKObpeMS.js","/assets/send-KAA6Ah3P.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BKaAEtML.js","/assets/siren-BmJTitun.js","/assets/shield-alert-hRGg185e.js","/assets/clipboard-check-Du8BrPUt.js","/assets/circle-check-DBEDR44v.js","/assets/radio-DZc6QHGT.js","/assets/octagon-alert-BD3zJ-Iy.js","/assets/life-buoy-GqPic4CB.js","/assets/phone-call-BMRvDmkS.js","/assets/plus-DkBDCmHG.js","/assets/translations-CmXZgOBw.js","/assets/web-CgYeb99V.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DuprJ3Wz.js"];

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