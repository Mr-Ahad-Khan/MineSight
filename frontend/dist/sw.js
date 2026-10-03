const CACHE_NAME = 'minesight-offline-v' + 1791028885841;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CC6ZUNcx.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-K0otblGu.js","/assets/Layout-Do_PJglQ.js","/assets/HomePage-CJ7BySHp.js","/assets/sun-Se-I_66A.js","/assets/Login-If_xt152.js","/assets/languages-Ck9MJ1KA.js","/assets/Register-CTuKxcdw.js","/assets/recaptcha-wrapper-Dm7ZjYyq.js","/assets/BrandLogo-DSSlstBo.js","/assets/Dashboard-va5r4pSU.js","/assets/clipboard-list-_-Kow346.js","/assets/building-2-ClfQN-BO.js","/assets/Inspections-BQGshxxx.js","/assets/CreateInspection-BkbvWJZj.js","/assets/InspectionDetail-XrxlOZM8.js","/assets/circle-check-big-B20c3lcs.js","/assets/upload-Cm-43Pfn.js","/assets/zoom-out-Clcc2cdi.js","/assets/Compliances-DGC81fy7.js","/assets/Mines-pmM5M9o0.js","/assets/hooks-0Pgzp8h-.js","/assets/leafletAssets-CZeX4CQ2.js","/assets/MineralResourcesDashboard-CVA1qlIJ.js","/assets/loader-circle-COgF5jc9.js","/assets/Contractors-DRyAxiIq.js","/assets/Alerts-CQ9BGotG.js","/assets/hi-BiADQGDV.js","/assets/Analytics-B4I5IM9z.js","/assets/PieChart-CdbMc-sY.js","/assets/index-bTJ7FgXD.js","/assets/Chat-oBBaCenZ.js","/assets/bot-DLXeasLM.js","/assets/mic-BOP_ssGA.js","/assets/shield-check-C9YRHJhs.js","/assets/Profile-DlIm0vjx.js","/assets/circle-user-BtC5pFLk.js","/assets/camera-IrzMvjAz.js","/assets/arrow-left-4niMN57q.js","/assets/Workers-wmDkDV0_.js","/assets/users-129WpkJC.js","/assets/bell-CW4BAGXN.js","/assets/save-BOFEKZnB.js","/assets/Attendance-B43oz8Jf.js","/assets/log-out-DbMG3i0e.js","/assets/shield-aZqhJBG_.js","/assets/user-check-D7Rd_zxn.js","/assets/refresh-cw-BSSeQzEG.js","/assets/search-DBPCsoC1.js","/assets/x-DBXsnMqj.js","/assets/map-pin-Dl3rOKnw.js","/assets/TableScrollContainer-eKqUBJQ_.js","/assets/arrow-right-BTI9kbpL.js","/assets/Support-AVfzjYHV.js","/assets/chevron-down-B0ISmjFu.js","/assets/send-8vnj6NJ0.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-zzCbz5yt.js","/assets/siren-CazX_tq1.js","/assets/shield-alert-BFD9RJnA.js","/assets/clipboard-check-Dwk9-s87.js","/assets/circle-check-BEUgNEzW.js","/assets/radio-DvFVgKjX.js","/assets/octagon-alert-b9bbHxEj.js","/assets/life-buoy-BP2NUesi.js","/assets/phone-call-8boR1FfN.js","/assets/plus-B-JcqVlC.js","/assets/translations-DbrZn9zW.js","/assets/web-WIuUziar.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-B3oQLcXJ.js"];

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