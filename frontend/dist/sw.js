const CACHE_NAME = 'minesight-offline-v' + 1791038272255;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-C0iww7lC.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BSE0Pkup.js","/assets/Layout-eX6BEE9w.js","/assets/HomePage-X_oGY8M6.js","/assets/sun-DPJ923eN.js","/assets/Login-Bpbo2O4V.js","/assets/languages-B5bZGSh8.js","/assets/Register-C3bAePrh.js","/assets/ReCAPTCHA-C5WHIkmG.js","/assets/BrandLogo-Boi8qyH1.js","/assets/Dashboard-Bbw75UXD.js","/assets/clipboard-list-BrZTvFnj.js","/assets/building-2-Dr4Av4E_.js","/assets/Inspections-BtBnlixX.js","/assets/CreateInspection-CONQ_nEc.js","/assets/InspectionDetail-4yKjUf7v.js","/assets/circle-check-big-N_HmHNRB.js","/assets/imageCompressor-C7GxdC7E.js","/assets/zoom-out-B6_Wl-Fe.js","/assets/Compliances-D2G_dTOm.js","/assets/Mines-BFDJumoT.js","/assets/hooks-D67oGiQn.js","/assets/leafletAssets-D_gy0Fop.js","/assets/MineralResourcesDashboard-w4Bw9Qv3.js","/assets/loader-circle-BUII2ktQ.js","/assets/Contractors-CwTPSgRS.js","/assets/Alerts-Dd9BsLex.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CLNUUUor.js","/assets/PieChart-Dg61nyPx.js","/assets/Chat-Cw-GQ4E4.js","/assets/bot-XlTLkmX_.js","/assets/mic-BRoMj_ZJ.js","/assets/shield-check-wPPQTOf_.js","/assets/chevron-right-rzb0eDxF.js","/assets/Profile-zVx4rX6q.js","/assets/circle-user-Da-Axd5W.js","/assets/camera-BBJqwL-u.js","/assets/arrow-left-DBu3Ukgb.js","/assets/Workers-CtMF_1F-.js","/assets/users-z0b1hesw.js","/assets/bell-D1YlGnB4.js","/assets/save-Cjr2mA2w.js","/assets/Attendance-0aowR8_W.js","/assets/log-out-eA0Qshwo.js","/assets/shield-CPMFz-eB.js","/assets/user-check-B08zT9pZ.js","/assets/refresh-cw-4eU5Goq6.js","/assets/search-BvFeiKPO.js","/assets/x-DH_-luKy.js","/assets/map-pin-PsRDP4jF.js","/assets/TableScrollContainer-B-VLObmh.js","/assets/arrow-right-Dt665l3-.js","/assets/Support-hvatyh5R.js","/assets/chevron-down-CHJJMe3f.js","/assets/send-ZvCGsWmZ.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BE9tdT7d.js","/assets/siren-D8jAJ8vs.js","/assets/shield-alert-CPUtAm_q.js","/assets/clipboard-check-CO05mk76.js","/assets/circle-check-Bj7sVJRZ.js","/assets/radio-CbYEOUlI.js","/assets/octagon-alert-D6BkhHfG.js","/assets/life-buoy-xgo6g4-c.js","/assets/phone-call-De5U5S6K.js","/assets/plus-BiwUKl6g.js","/assets/translations-B-iC4Mkf.js","/assets/web-Dt64lli1.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CGNCsK-9.js"];

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