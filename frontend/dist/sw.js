const CACHE_NAME = 'minesight-offline-v' + 1791042235111;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-zZG8wlB4.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DwMbnHns.js","/assets/Layout-DJYkrTsY.js","/assets/HomePage-eGDyLkvK.js","/assets/sun-Dk-8xFQ0.js","/assets/Login-D_cYPxYD.js","/assets/languages-C8Dc-oVQ.js","/assets/Register-GzD5c310.js","/assets/ReCAPTCHA-DOGeGT6I.js","/assets/BrandLogo-CGm5R6rJ.js","/assets/Dashboard-VlJjl_CP.js","/assets/clipboard-list-9C266Koc.js","/assets/building-2-Bg_FtTaD.js","/assets/Inspections-CMC6fJ-G.js","/assets/CreateInspection-B2SWvOp7.js","/assets/InspectionDetail-BwiiUlI3.js","/assets/circle-check-big-BgNuk_W9.js","/assets/imageCompressor-CbdCEibj.js","/assets/zoom-out-C4yxOPBv.js","/assets/Compliances-ufDibIUo.js","/assets/Mines-D-Q3os-E.js","/assets/hooks-D1V5h0_o.js","/assets/leafletAssets-DPR9rcwR.js","/assets/MineralResourcesDashboard-t-Jmrxxt.js","/assets/loader-circle-lD_JWTAF.js","/assets/Contractors-D63aUmko.js","/assets/Alerts-Hu2PfS1s.js","/assets/hi-BiADQGDV.js","/assets/Analytics-Da-7OR3F.js","/assets/PieChart-C6cOMius.js","/assets/Chat-Ceo6MGHa.js","/assets/bot-l4QZ-Vfa.js","/assets/volume-x-Cq72Jv_Y.js","/assets/mic-D-S8XIxD.js","/assets/shield-check-CdOhIcWn.js","/assets/chevron-right-COO4xJ9U.js","/assets/Profile-C0viojb_.js","/assets/circle-user-UolpzIge.js","/assets/camera-DKzItfQ1.js","/assets/arrow-left-B_8qSkSj.js","/assets/Workers-Dd2OA5Di.js","/assets/users-BvaLhXQf.js","/assets/bell-C-YbEqa1.js","/assets/save-B-t2u_S2.js","/assets/Attendance-Dx4GB4tP.js","/assets/log-out-DY3zouIB.js","/assets/shield-p92JVWTP.js","/assets/user-check-Cl0ScEa9.js","/assets/refresh-cw-lZ7OfgIE.js","/assets/search-C6KWJ8aM.js","/assets/x-Dhuxt8qT.js","/assets/map-pin-BWpNsl9b.js","/assets/TableScrollContainer-Ppfi-mvQ.js","/assets/arrow-right-wUBpYPN1.js","/assets/Support-BtavdYVm.js","/assets/chevron-down-BnghpEJn.js","/assets/send-BlTAhm_h.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CCV-BC05.js","/assets/siren-C8VCYtwr.js","/assets/shield-alert-BEHNZK8s.js","/assets/clipboard-check-lKJb76L_.js","/assets/circle-check-CgGK5Ra8.js","/assets/radio-B8EjlMSp.js","/assets/octagon-alert-B9gzBp0S.js","/assets/life-buoy-Ddzk6VAi.js","/assets/phone-call-B7_GPRhC.js","/assets/plus-C2Fs8hw8.js","/assets/translations-DzApDVcQ.js","/assets/web-DSu2YIWl.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CWi7Ohdh.js"];

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