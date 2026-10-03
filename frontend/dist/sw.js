const CACHE_NAME = 'minesight-offline-v' + 1791014801018;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BzRGzAJ6.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DGklC2C6.js","/assets/Layout-DFolnoSO.js","/assets/HomePage-BZmz3NXW.js","/assets/sun-Cslcj5Sq.js","/assets/Login-CzLYjaf-.js","/assets/languages-DA9mhckV.js","/assets/Register-Dl5fzATN.js","/assets/recaptcha-wrapper-DKbSzPof.js","/assets/BrandLogo-BEvJUDeV.js","/assets/Dashboard-dL5Wr0i1.js","/assets/clipboard-list-2Tr0N4KX.js","/assets/building-2-Ce0WRy3c.js","/assets/Inspections-CCEj4kiM.js","/assets/CreateInspection-CHIv5PwT.js","/assets/InspectionDetail-C3xSqOm2.js","/assets/circle-check-big-B-O_rldW.js","/assets/upload-CI0gg25C.js","/assets/loader-circle-DF7q5Beo.js","/assets/zoom-out-Bb1WN3Vr.js","/assets/Compliances-Cjb2DuuR.js","/assets/Mines-DrgrsAGy.js","/assets/hooks-Ds4LfiIX.js","/assets/leafletAssets-fhSJ6Xqk.js","/assets/MineralResourcesDashboard-ZNoCWMGJ.js","/assets/Contractors-BNWyvvbx.js","/assets/Alerts-BVeo1xfD.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CmURM6Io.js","/assets/PieChart-Cw_7lARo.js","/assets/index-CeRTqTUA.js","/assets/Chat-C7b2fPaa.js","/assets/bot-DtmN9KsU.js","/assets/mic-BL92T3I2.js","/assets/shield-check-DLAxExX3.js","/assets/Profile-CMcHcYMB.js","/assets/circle-user-DS4x4-Ol.js","/assets/arrow-left-wpO-zuhx.js","/assets/Workers-fcnJAT53.js","/assets/users-CmK4A7M-.js","/assets/bell-BK1M1KTE.js","/assets/save-CpYyDoKX.js","/assets/Attendance-DCPN7KiJ.js","/assets/log-out-ChDq-d41.js","/assets/shield-B3XtLCJD.js","/assets/user-check-BrgHk7Is.js","/assets/refresh-cw-69mW-t9z.js","/assets/x-YmzJz2CN.js","/assets/search-cwSfRcb3.js","/assets/map-pin-Ddbjdwp5.js","/assets/TableScrollContainer-3HVQ8xvl.js","/assets/arrow-right-OM6ERcGQ.js","/assets/Support-CZr2tv5E.js","/assets/chevron-down-CUWy0E2d.js","/assets/send-B49pWnhm.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Cmt2QTi_.js","/assets/siren-CWruvS0e.js","/assets/shield-alert-DlyboE8z.js","/assets/clipboard-check-n3_AMQo8.js","/assets/circle-check-DVA2PF2K.js","/assets/radio-DlIEyQ_o.js","/assets/octagon-alert-EAfcQ41N.js","/assets/life-buoy-lckFioeN.js","/assets/phone-call-D0tnI1s0.js","/assets/plus-6LNEc4St.js","/assets/translations-DbrZn9zW.js","/assets/web-DS0JzcoD.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-D3mZvDSh.js"];

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