const CACHE_NAME = 'minesight-offline-v' + 1791014253120;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BzRGzAJ6.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BG7R3tfh.js","/assets/Layout-B49_Jct8.js","/assets/HomePage-2tTBIB0b.js","/assets/sun-DzgevXVs.js","/assets/Login-B2gi6rgw.js","/assets/languages-D92BdbGL.js","/assets/Register-Dfsc5P-3.js","/assets/recaptcha-wrapper-C5nxb26C.js","/assets/BrandLogo-BvyWgQZ-.js","/assets/Dashboard-BMclerMU.js","/assets/clipboard-list-B8yRbtoU.js","/assets/building-2-DHeRc9RI.js","/assets/Inspections-Dny_Vaqx.js","/assets/CreateInspection-B5qtX_iw.js","/assets/InspectionDetail-BK717lPw.js","/assets/upload-CBwIoxlc.js","/assets/loader-circle-BVY6smRV.js","/assets/zoom-out-DDKe88LR.js","/assets/Compliances-FZ9Pqg1u.js","/assets/Mines-BAYMmAI_.js","/assets/hooks-BC6-zUzz.js","/assets/leafletAssets-DFdrjmIq.js","/assets/MineralResourcesDashboard-CILIaieg.js","/assets/Contractors-C2mAou8q.js","/assets/Alerts-CGeBQKJy.js","/assets/hi-BiADQGDV.js","/assets/Analytics-ORkMi-aI.js","/assets/PieChart-gWzZUW1l.js","/assets/index-F2bRJLSb.js","/assets/Chat-CdnYof8L.js","/assets/bot-CCzVXBG-.js","/assets/mic-CAU2X_ph.js","/assets/shield-check-KYC1tGd7.js","/assets/Profile-CGmurPFG.js","/assets/circle-user-D5WhsaS3.js","/assets/arrow-left-3cOA5Td-.js","/assets/Workers-D01U9Csx.js","/assets/users-JHMoGVwY.js","/assets/bell-Cl3Fld-K.js","/assets/save-CSKaiMJM.js","/assets/Attendance-CxYxauL5.js","/assets/log-out-N2MEH8B9.js","/assets/shield-uaw1euWy.js","/assets/user-check-BrNMq_uV.js","/assets/refresh-cw-BodUw1I_.js","/assets/x-DVrPXTyP.js","/assets/search-BpvGmsCa.js","/assets/map-pin-ylz2ka--.js","/assets/TableScrollContainer-Ba5y5iEp.js","/assets/arrow-right-DwPUocba.js","/assets/Support-ClPl2rgl.js","/assets/chevron-down-kqO8oayO.js","/assets/send-rhVuHiPT.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-v8ChYPzn.js","/assets/siren-BtuqdfsF.js","/assets/shield-alert-CIVyIDq3.js","/assets/clipboard-check-CIPlhttK.js","/assets/circle-check-CP8UPnbP.js","/assets/radio-sVgOgKh0.js","/assets/octagon-alert-CRMLNSQ-.js","/assets/life-buoy-CV4LgHea.js","/assets/phone-call-jsdOaIfC.js","/assets/plus-DjnYH0Yo.js","/assets/translations-DbrZn9zW.js","/assets/web-iWVC2umC.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-C5V01_DX.js"];

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