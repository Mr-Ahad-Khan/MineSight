const CACHE_NAME = 'minesight-offline-v' + 1791015449555;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BsqwVcwN.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BEty1hq-.js","/assets/Layout-D4r4Mu6O.js","/assets/HomePage-BYTLFRwU.js","/assets/sun-BSxkPJFU.js","/assets/Login-DfCjf4sJ.js","/assets/languages-rz2LM821.js","/assets/Register-DqI_8_eq.js","/assets/recaptcha-wrapper-BblrzrtF.js","/assets/BrandLogo-CpgXWYRj.js","/assets/Dashboard-Be36gxWF.js","/assets/clipboard-list-BKldQE-q.js","/assets/building-2-DTeCSTWY.js","/assets/Inspections-9FuRfXK0.js","/assets/CreateInspection-CeokwtRG.js","/assets/InspectionDetail-C94O5e79.js","/assets/circle-check-big-D7FYiItF.js","/assets/upload-DNfzRh0I.js","/assets/loader-circle-CgDgIssr.js","/assets/zoom-out-1EZZljIa.js","/assets/Compliances-tQOVJM7B.js","/assets/Mines-DHibf4J0.js","/assets/hooks-Bc9fWRnt.js","/assets/leafletAssets-GjVsT2B6.js","/assets/MineralResourcesDashboard-Bk3izZlA.js","/assets/Contractors-h4ZZJtfZ.js","/assets/Alerts-BtZtMLyX.js","/assets/hi-BiADQGDV.js","/assets/Analytics-Bj7r3VNa.js","/assets/PieChart-5hlmB1gm.js","/assets/index-Zs0Ttv7z.js","/assets/Chat-Dzvy4QKj.js","/assets/bot-B8sablm8.js","/assets/mic-CSDp1rs2.js","/assets/shield-check-BeOxaERa.js","/assets/Profile-DrdElq0q.js","/assets/circle-user-QKImhQdF.js","/assets/arrow-left-DxuFg1NH.js","/assets/Workers-aP1Qh3ts.js","/assets/users-DRSCIciJ.js","/assets/bell-CjvzNT8z.js","/assets/save-DxKOtCBn.js","/assets/Attendance-CPqRDbML.js","/assets/log-out-B85FkGnQ.js","/assets/shield-ju0ENmj_.js","/assets/user-check-CeGlVG6n.js","/assets/refresh-cw-C-9PK0aK.js","/assets/x-BaN-mDIo.js","/assets/search-DXkUte2D.js","/assets/map-pin-CJIpEOjG.js","/assets/TableScrollContainer-BwYBDES7.js","/assets/arrow-right-nTvdArkx.js","/assets/Support-DtClK2aD.js","/assets/chevron-down-kqU4_Fng.js","/assets/send-b4wVBNgZ.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-D265lNzs.js","/assets/siren-Bz38yFdv.js","/assets/shield-alert-CYoUrNXX.js","/assets/clipboard-check-Sd6roy4r.js","/assets/circle-check-8-qzAeIr.js","/assets/radio-Com7cQHV.js","/assets/octagon-alert-BKR2W66O.js","/assets/life-buoy-B-pPN-w3.js","/assets/phone-call-BjPEcja1.js","/assets/plus-Bt_M8Lvq.js","/assets/translations-DbrZn9zW.js","/assets/web-CyM1eMR2.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BqpE9BOV.js"];

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