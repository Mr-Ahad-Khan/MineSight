const CACHE_NAME = 'minesight-offline-v' + 1791040343756;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-Ceg5WRlP.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DWgpMVmG.js","/assets/Layout-Cm3cNFNe.js","/assets/HomePage-CNCMG8ZM.js","/assets/sun-DexLaY3p.js","/assets/Login-CsyGy-xC.js","/assets/languages-kXFheviO.js","/assets/Register-_q3klUHN.js","/assets/ReCAPTCHA-B4CIpd7I.js","/assets/BrandLogo-BzxOQv3O.js","/assets/Dashboard-D7jZHvWX.js","/assets/clipboard-list-mWuM05iD.js","/assets/building-2-M5J1kqSj.js","/assets/Inspections-moPiP6Jh.js","/assets/CreateInspection-BkUwD-o_.js","/assets/InspectionDetail-Bd1sco79.js","/assets/circle-check-big-DCnue68B.js","/assets/imageCompressor-DVPmoySk.js","/assets/zoom-out-C5VVDunH.js","/assets/Compliances-BPsyVrNk.js","/assets/Mines-iMhfwa22.js","/assets/hooks-BlmBlAu_.js","/assets/leafletAssets-DH4ZNdQH.js","/assets/MineralResourcesDashboard-BbHpJVvT.js","/assets/loader-circle-D3hDUTS_.js","/assets/Contractors-D5_Z5VBh.js","/assets/Alerts-8Lk_sFm-.js","/assets/hi-BiADQGDV.js","/assets/Analytics-Ccasjc2I.js","/assets/PieChart-CUQm74N3.js","/assets/Chat-DDYLjNbm.js","/assets/bot-Cd3Y_RK8.js","/assets/mic-DpmJtdaU.js","/assets/shield-check-Bpd96Sm6.js","/assets/chevron-right-DyXb9SyP.js","/assets/Profile-CeK6JkdR.js","/assets/circle-user-Cqc5NXZG.js","/assets/camera-DDbqyajD.js","/assets/arrow-left-CVY06S_2.js","/assets/Workers-Wdytqf7o.js","/assets/users-r4J_kENz.js","/assets/bell-CMBTr5dV.js","/assets/save-kHpwg44O.js","/assets/Attendance-D9cCW5Jx.js","/assets/log-out-UiIjqKNB.js","/assets/shield-CMlOaYr4.js","/assets/user-check-DIs96vkK.js","/assets/refresh-cw-B_SdQH1p.js","/assets/search-wLlr407k.js","/assets/x-CCPtggEy.js","/assets/map-pin-Zq983tr7.js","/assets/TableScrollContainer-BLF8GcE6.js","/assets/arrow-right-FR5fXdY-.js","/assets/Support-R8GtYQiA.js","/assets/chevron-down-BX50-iRP.js","/assets/send-B0XBG0EO.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CAANnUOh.js","/assets/siren-CDFcT2iH.js","/assets/shield-alert-Bt6SWyhx.js","/assets/clipboard-check-ByL6oXvp.js","/assets/circle-check-D60CcnlA.js","/assets/radio-Cv2HCdW2.js","/assets/octagon-alert-CTSalX-5.js","/assets/life-buoy-CU90rDIo.js","/assets/phone-call-BDMvEZqG.js","/assets/plus-dPDZFH6J.js","/assets/translations-DzApDVcQ.js","/assets/web-DyivzRcS.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-TNHoU2g-.js"];

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