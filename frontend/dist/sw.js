const CACHE_NAME = 'minesight-offline-v' + 1791036659160;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BeCH37Xd.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-B8HeIf0E.js","/assets/Layout-BGMSpWLT.js","/assets/HomePage-DemBr2Na.js","/assets/sun-BK4r6Ozy.js","/assets/Login-CRCK-k6l.js","/assets/languages-dG21qv7b.js","/assets/Register-16VuzwzE.js","/assets/recaptcha-wrapper-3oJy5kFG.js","/assets/BrandLogo-DNBs7NCg.js","/assets/Dashboard-BH1Vo-Ml.js","/assets/clipboard-list-DPuw8F4D.js","/assets/building-2-DbQMJVAh.js","/assets/Inspections-Bq2Y7eHq.js","/assets/CreateInspection-BXgr62MZ.js","/assets/InspectionDetail-uVQrff90.js","/assets/circle-check-big-Cp7vcm53.js","/assets/imageCompressor-CRfpt--K.js","/assets/zoom-out-DdrZWJAy.js","/assets/Compliances-EVvKgFHu.js","/assets/Mines-C4soHK91.js","/assets/hooks-3eIgVdW2.js","/assets/leafletAssets-C4bMjKoK.js","/assets/MineralResourcesDashboard--dOsGajs.js","/assets/loader-circle-BBK4zdq7.js","/assets/Contractors-CgdlFPSN.js","/assets/Alerts-CF9oZKZz.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DDHHMVtY.js","/assets/PieChart-DyTxFYDG.js","/assets/index-DcVvxw12.js","/assets/Chat-Bl83KnAT.js","/assets/bot-Bh1xflC9.js","/assets/mic-CUuPQCzm.js","/assets/shield-check-D8K1EubP.js","/assets/chevron-right-B2cZxAsZ.js","/assets/Profile-cf2zn9xy.js","/assets/circle-user-CbGRLPfA.js","/assets/camera-Csc1YY_s.js","/assets/arrow-left-CFCxSPO8.js","/assets/Workers-BnE_Zgup.js","/assets/users-B7JKQFaB.js","/assets/bell-BZ7NCSHi.js","/assets/save-QD3Rgo81.js","/assets/Attendance-CySKkpBj.js","/assets/log-out-CISwSiJW.js","/assets/shield-C_iEoK39.js","/assets/user-check-CNE9T1nn.js","/assets/refresh-cw-BDRevUdJ.js","/assets/search-B74dhqCr.js","/assets/x-BE4jwX_F.js","/assets/map-pin-B7pDCDrS.js","/assets/TableScrollContainer-D3DcFXBQ.js","/assets/arrow-right-CeCdtgUt.js","/assets/Support-BBdKaB7l.js","/assets/chevron-down-Bft1_PJj.js","/assets/send-BvEbq0Q_.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BiLA9k3X.js","/assets/siren-BlGoN7ej.js","/assets/shield-alert-BtS_LJGM.js","/assets/clipboard-check-C4aAbtHA.js","/assets/circle-check-DyPQ7qbY.js","/assets/radio-bltNJwtg.js","/assets/octagon-alert-vmSIHN85.js","/assets/life-buoy-Bh59r1_D.js","/assets/phone-call-CnCh_cuU.js","/assets/plus-a5ZG8vM6.js","/assets/translations-acmd7qdg.js","/assets/web-Ws1FTBk2.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CA48Ca-C.js"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => null)),
      );
      return results;
    }),
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
      fetch(request).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        return cachedIndex || new Response('Offline app shell unavailable', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'));
    }),
  );
});