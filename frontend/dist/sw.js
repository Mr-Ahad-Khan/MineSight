const CACHE_NAME = 'minesight-offline-v' + 1791032688105;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-qbeTLAnL.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DJxEZMMX.js","/assets/Layout-DnaqrI6z.js","/assets/HomePage-BUstbfBH.js","/assets/sun-M-IfmB3-.js","/assets/Login-Bh75uPcC.js","/assets/languages-BZA5Ihpn.js","/assets/Register-BhB_NRaH.js","/assets/recaptcha-wrapper-D7T0JngP.js","/assets/BrandLogo-va3qgw_A.js","/assets/Dashboard-CH-Onhm5.js","/assets/clipboard-list-B83IJj_2.js","/assets/building-2-BA13BiZA.js","/assets/Inspections-C3fMVZvQ.js","/assets/CreateInspection-9aUaQptL.js","/assets/InspectionDetail-D9T49Myn.js","/assets/circle-check-big-DFWim5Oe.js","/assets/imageCompressor-CDfVRVWl.js","/assets/zoom-out-4GL4y5wK.js","/assets/Compliances-5ByeWCne.js","/assets/Mines-gZM1ogrO.js","/assets/hooks-6NWJgaK1.js","/assets/leafletAssets-BJNMUYVY.js","/assets/MineralResourcesDashboard-wMoB9su5.js","/assets/loader-circle-Dw5FuDrP.js","/assets/Contractors-CuWqAfcb.js","/assets/Alerts-BVnoELVt.js","/assets/hi-BiADQGDV.js","/assets/Analytics-aIsDFprX.js","/assets/PieChart-7G1nbQpx.js","/assets/index-1RRCXJHB.js","/assets/Chat-Bm3qCswy.js","/assets/bot-DjhWys4P.js","/assets/mic-gSgUfJGM.js","/assets/shield-check-B9LoaREI.js","/assets/Profile-CiiOeH00.js","/assets/circle-user-CZ2W5DZg.js","/assets/camera-ByrbuKT6.js","/assets/arrow-left-Cw16uSsn.js","/assets/Workers-CEVPOS0n.js","/assets/users-IDvUGsQI.js","/assets/bell-L1oqRjsd.js","/assets/save-D17ca5qR.js","/assets/Attendance-DI-tzv7C.js","/assets/log-out-BwxKLgxO.js","/assets/shield-LYSfNj0t.js","/assets/user-check-DvLVnnQX.js","/assets/refresh-cw-BIA2_S3i.js","/assets/search-DaLdt41S.js","/assets/x-DnGR1-J6.js","/assets/map-pin-ENmR0V6y.js","/assets/TableScrollContainer-z61wLVH7.js","/assets/arrow-right-DMkIcLdb.js","/assets/Support-D3URPUkR.js","/assets/chevron-down-9NT-mIgl.js","/assets/send-C_MSmkru.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CDjmI9HY.js","/assets/siren-8enC_u4m.js","/assets/shield-alert-FduTcy3A.js","/assets/clipboard-check-gNspmDqd.js","/assets/circle-check-CKkBre2y.js","/assets/radio-B6YVrt_y.js","/assets/octagon-alert-Dj3bkFB3.js","/assets/life-buoy-od0rp2Xa.js","/assets/phone-call-B41TacZ0.js","/assets/plus-U63OjQip.js","/assets/translations-DbrZn9zW.js","/assets/web-DBMy5bcF.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DKioAzYZ.js"];

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