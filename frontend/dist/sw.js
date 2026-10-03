const CACHE_NAME = 'minesight-offline-v' + 1791042936415;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-zZG8wlB4.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DHoPDgtQ.js","/assets/Layout-Du2mCI26.js","/assets/HomePage-DbEVd9Kx.js","/assets/sun-DoRdg4Kj.js","/assets/Login-q3drmLij.js","/assets/languages-m2doRLDM.js","/assets/Register-CLFJ9Smu.js","/assets/ReCAPTCHA-iwddI5Mq.js","/assets/BrandLogo-DRj8y5S2.js","/assets/Dashboard-Cqtcbnx1.js","/assets/clipboard-list-BuNZ8IBU.js","/assets/building-2-Conv4flA.js","/assets/Inspections-DKY3mCrY.js","/assets/CreateInspection-CU6NNaId.js","/assets/InspectionDetail-CdZ4Lbad.js","/assets/circle-check-big-BkaeCDB6.js","/assets/imageCompressor-BuO_m_UM.js","/assets/zoom-out-dfz0f3C4.js","/assets/Compliances-CJ5TzaYC.js","/assets/Mines-DQwVuYyR.js","/assets/hooks-CgF0PamD.js","/assets/leafletAssets-BjDQ-aGk.js","/assets/MineralResourcesDashboard-B_JHbvAz.js","/assets/loader-circle-BnrnEmS_.js","/assets/Contractors-C7vHHMw7.js","/assets/Alerts-BbP4TCun.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CQ2Pu3li.js","/assets/PieChart-te1_n8XW.js","/assets/Chat-BfgPJcwO.js","/assets/bot-BQd8duhG.js","/assets/volume-x-BPhEwhxG.js","/assets/mic-oS4rsO4P.js","/assets/shield-check-Bjv94mkK.js","/assets/chevron-right-OqaSF_83.js","/assets/Profile-C3cxK3W6.js","/assets/circle-user-k5Ue-uVr.js","/assets/camera-BxwOn0yH.js","/assets/arrow-left-DOGLI7F0.js","/assets/Workers-C_iQC-X9.js","/assets/users-ZBDv84ir.js","/assets/bell-DGh289Yf.js","/assets/save-BNqdMaHg.js","/assets/Attendance-BEDI15Gh.js","/assets/log-out-CL-_Twhm.js","/assets/shield-BssgFZN8.js","/assets/user-check-CW-s3r-V.js","/assets/refresh-cw-DiqZUavL.js","/assets/search-BLyHxlN0.js","/assets/x-CfEhPkLl.js","/assets/map-pin-BNlgNfAg.js","/assets/TableScrollContainer-BXPvPUUU.js","/assets/arrow-right-OXZ6S2_K.js","/assets/Support-BbDj3CJh.js","/assets/chevron-down-JfhW5Utu.js","/assets/send-O-khAYv9.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BF1CbF6G.js","/assets/siren-Z2JEbB6M.js","/assets/shield-alert-BNuUr6b5.js","/assets/clipboard-check-Q04KI7EK.js","/assets/circle-check-7DMwc-5K.js","/assets/radio-BCRqNWkp.js","/assets/octagon-alert-C2-leQYr.js","/assets/life-buoy-Cl6_Hjv_.js","/assets/phone-call-8Q6Y8OiE.js","/assets/plus-BDKui6F-.js","/assets/translations-DzApDVcQ.js","/assets/web-CSD_fnb-.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CagDxP4E.js"];

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