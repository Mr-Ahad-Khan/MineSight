const CACHE_NAME = 'minesight-offline-v' + 1791013691345;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BzRGzAJ6.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BK-8E-Wb.js","/assets/Layout-DTAud_OY.js","/assets/HomePage-C8vItAVK.js","/assets/sun-IEWGt_OB.js","/assets/Login--fxHnnZX.js","/assets/languages-bKqBgIVl.js","/assets/Register-CYTCmpMK.js","/assets/recaptcha-wrapper-D0bBnEzL.js","/assets/BrandLogo-pX1NGSSG.js","/assets/Dashboard-BzXswK4H.js","/assets/clipboard-list-DpfHA_uF.js","/assets/building-2-DwzljoM9.js","/assets/Inspections-D3QDpm7F.js","/assets/CreateInspection-gqu-1Tu4.js","/assets/InspectionDetail-CNir5FJr.js","/assets/upload-CTqE82iZ.js","/assets/loader-circle-D40EmSrq.js","/assets/zoom-out-Cs9mar0B.js","/assets/Compliances-Bee5BqPb.js","/assets/Mines-DDhxMT8v.js","/assets/hooks-CyFkFJT0.js","/assets/leafletAssets-CAj0SMQO.js","/assets/MineralResourcesDashboard-BqX1S7an.js","/assets/Contractors-s7div688.js","/assets/Alerts-CENk_vza.js","/assets/hi-BiADQGDV.js","/assets/Analytics-Bge8z0D_.js","/assets/PieChart-i8HzTbFB.js","/assets/index-DeQhLwU8.js","/assets/Chat-BVnXUIJ_.js","/assets/bot-D7TH4DPQ.js","/assets/mic-BD0eBfV-.js","/assets/shield-check-C_l9MlS-.js","/assets/Profile-CWNn6c5_.js","/assets/circle-user-B4A5nqBF.js","/assets/arrow-left-BZCxD4nF.js","/assets/Workers-DGlsCTIn.js","/assets/users-DDA-5w4e.js","/assets/bell-BkbPuIh0.js","/assets/save-D8TleBBy.js","/assets/Attendance-BeeKzH4q.js","/assets/log-out-D8BPIwNX.js","/assets/shield-Dbde2aBx.js","/assets/user-check-BEuOXhWW.js","/assets/refresh-cw-nggIvoN1.js","/assets/x-B6toJfC4.js","/assets/search-sCeBz2iZ.js","/assets/map-pin-Dm7Pkkz7.js","/assets/TableScrollContainer-KOXZtdYH.js","/assets/arrow-right-D8m94PDp.js","/assets/Support-Bor52zpU.js","/assets/chevron-down-DvsiMu0_.js","/assets/send-T3LTPkd7.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Dj3ngNwi.js","/assets/siren-Vk3bJwnA.js","/assets/shield-alert-BcamhyFL.js","/assets/clipboard-check-DpvNBTA6.js","/assets/circle-check-DfbzN1tk.js","/assets/radio-7f-6sAUK.js","/assets/octagon-alert-BjQn8c-J.js","/assets/life-buoy-DUIGPsIH.js","/assets/phone-call-U9N-vO_O.js","/assets/plus-CCgTg_NG.js","/assets/translations-DbrZn9zW.js","/assets/web-C7xTBaEI.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Bdlnuxx5.js"];

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