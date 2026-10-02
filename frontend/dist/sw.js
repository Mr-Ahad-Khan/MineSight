const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-Bzqww9ee.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-B0RK_kU8.js","/assets/Layout-Cs-z6RLf.js","/assets/HomePage-ImsmPkcj.js","/assets/sun-CZXsizOF.js","/assets/Login-BaIRzP0a.js","/assets/languages-Ba1vw4h9.js","/assets/Register-9MtPQ7Nm.js","/assets/recaptcha-wrapper-iVO2VEQd.js","/assets/BrandLogo-Cpg-FHdN.js","/assets/Dashboard-DkmHRJ5Z.js","/assets/clipboard-list-DMZaBFCl.js","/assets/building-2-CpdpB8m4.js","/assets/Inspections-DqFsiqUh.js","/assets/CreateInspection-B6ABMAYK.js","/assets/arrow-right-Dbnb6EeH.js","/assets/InspectionDetail-BnfARBAy.js","/assets/file-text-DptArVT5.js","/assets/loader-circle-C-krzcqw.js","/assets/zoom-out-BZuAhJGS.js","/assets/Compliances-BSsqa6nh.js","/assets/Mines-Ch2fzslp.js","/assets/hooks-Zc1Fp5rS.js","/assets/leafletAssets-DA8-lIHq.js","/assets/MineralResourcesDashboard-BsoZSCNl.js","/assets/Contractors-ogMyaTJk.js","/assets/Alerts-Dn0LYV2O.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DqDC1GZx.js","/assets/PieChart-D2ljZygG.js","/assets/index-huKrNK_j.js","/assets/Chat-DEFzqvSD.js","/assets/bot-CKpbmOqR.js","/assets/mic-C3Pw-bjf.js","/assets/shield-check-PzS6lh99.js","/assets/Profile-BHVobM_6.js","/assets/circle-user-DQIpKLCs.js","/assets/arrow-left-CUrwjUYY.js","/assets/Workers-CRLxun9s.js","/assets/users-DQ4c4YFq.js","/assets/bell-Blfyks6Z.js","/assets/save-jFtFN9M-.js","/assets/Attendance-BlsYvSjp.js","/assets/log-out-Bq5ePVZI.js","/assets/shield-HeLT6eDs.js","/assets/user-check-DfIZuFoR.js","/assets/refresh-cw-CaYnsmku.js","/assets/x-CsNr-5YO.js","/assets/search-B9dSpQwR.js","/assets/map-pin-DfuMbS-N.js","/assets/Support-B-pRatRL.js","/assets/send-D9wUQwJW.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BavL0p4c.js","/assets/siren-H3XUMkwk.js","/assets/shield-alert-BvD11b45.js","/assets/clipboard-check-DbeBbzzB.js","/assets/circle-check-CxV24hSs.js","/assets/radio-lKcd2Wp5.js","/assets/octagon-alert-BT-ql6Hi.js","/assets/life-buoy-CaL-_NFH.js","/assets/phone-call-hArHT17R.js","/assets/plus-B0Bo5Qrl.js","/assets/translations-quTRLGt9.js","/assets/web-CGWwWOij.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BzuzC0Eb.js"];

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