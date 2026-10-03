const CACHE_NAME = 'minesight-offline-v' + 1791020962543;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CrbTUOWr.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BzsZKYIY.js","/assets/Layout-BymSr8yk.js","/assets/HomePage-C0C4bbUC.js","/assets/sun-i1LbRdEw.js","/assets/Login-D20Pjqbh.js","/assets/languages-C_5SxpTz.js","/assets/Register-DEw65JB-.js","/assets/recaptcha-wrapper-GnZVxivI.js","/assets/BrandLogo-DbaR34pS.js","/assets/Dashboard-DV4iTzb_.js","/assets/clipboard-list-7izDtkFe.js","/assets/building-2-DidmhOZE.js","/assets/Inspections-C28Jkxpx.js","/assets/CreateInspection-CGxBvmBk.js","/assets/InspectionDetail-CXf3EP-B.js","/assets/circle-check-big-DC4H2Pib.js","/assets/upload-Ddmrnxgo.js","/assets/loader-circle-Cp7zxWTJ.js","/assets/zoom-out-BCSNYzfs.js","/assets/Compliances-jQTtWDE_.js","/assets/Mines-BKQGJuz7.js","/assets/hooks-han6Zs0n.js","/assets/leafletAssets-BDDU24aH.js","/assets/MineralResourcesDashboard-CiI8iWdQ.js","/assets/Contractors-BUUPJEz-.js","/assets/Alerts-C6fTz14O.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DdjcJyLk.js","/assets/PieChart-BQLJ33SQ.js","/assets/index-BaAilbeU.js","/assets/Chat-4TBg7EuV.js","/assets/bot-B2YF6GBZ.js","/assets/mic-CGnK95mI.js","/assets/shield-check-BttDsmc9.js","/assets/Profile-CeDaurHt.js","/assets/circle-user-Cao8kwMo.js","/assets/camera-CPF3Tcv8.js","/assets/arrow-left-BPuTGDaE.js","/assets/Workers-_WQEWq0f.js","/assets/users-CuMH8INl.js","/assets/bell-D1dxwDtX.js","/assets/save-CPE0Aa_j.js","/assets/Attendance-CYq4nwom.js","/assets/log-out-DLN4W2Rs.js","/assets/shield-DV7kdA36.js","/assets/user-check-DevuIhyN.js","/assets/refresh-cw-CJyuHMGu.js","/assets/x-DT8fvErk.js","/assets/search-R_NkRiO4.js","/assets/map-pin-BVDVUkiB.js","/assets/TableScrollContainer-CfXn8tzm.js","/assets/arrow-right-Ck1O0w-5.js","/assets/Support-h0Guq_b4.js","/assets/chevron-down-CwFAsJk2.js","/assets/send-BEnIcub3.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CtkHIvUO.js","/assets/siren-BSTCt_PM.js","/assets/shield-alert-SLOhuTPi.js","/assets/clipboard-check-BVrDH3pu.js","/assets/circle-check-DqWiIHGV.js","/assets/radio-BMcprCQt.js","/assets/octagon-alert-D6NzWLaL.js","/assets/life-buoy-1g6DgM47.js","/assets/phone-call-DUoT5i7_.js","/assets/plus-DJoQfowJ.js","/assets/translations-DbrZn9zW.js","/assets/web-C8ljy-qE.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CwnjR_Zf.js"];

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