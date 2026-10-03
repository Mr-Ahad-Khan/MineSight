const CACHE_NAME = 'minesight-offline-v' + 1791040751302;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DREQ4PvO.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DKjgN895.js","/assets/Layout-4Y6eUElT.js","/assets/HomePage-CSQXHV9p.js","/assets/sun-DdAzV_eR.js","/assets/Login-CsA6D4ae.js","/assets/languages-Bab-Uadp.js","/assets/Register-Ds66LfU-.js","/assets/ReCAPTCHA-B7Dat2TV.js","/assets/BrandLogo-DnALWd6v.js","/assets/Dashboard-BvF0qpX8.js","/assets/clipboard-list-XaX_3ywt.js","/assets/building-2-CmTFzxpc.js","/assets/Inspections-LfXJZ9U4.js","/assets/CreateInspection-BdFwtVim.js","/assets/InspectionDetail-C5Vd6w4K.js","/assets/circle-check-big-CbvGxc57.js","/assets/imageCompressor-BNtgIPVD.js","/assets/zoom-out-DXa0L5rq.js","/assets/Compliances-CBz23mKf.js","/assets/Mines-MJ7pKN4S.js","/assets/hooks-DZH_eNcQ.js","/assets/leafletAssets-CydvXVSM.js","/assets/MineralResourcesDashboard-CaDdAsG1.js","/assets/loader-circle-DBisHJ0V.js","/assets/Contractors-ojYe3MQw.js","/assets/Alerts-DoLp1W_n.js","/assets/hi-BiADQGDV.js","/assets/Analytics-MGDQaj_l.js","/assets/PieChart-DslwAtLu.js","/assets/Chat-C4SlaMiR.js","/assets/bot-Bmi8i2AF.js","/assets/mic-Dk2s2Zn_.js","/assets/shield-check-DTBId3B8.js","/assets/chevron-right-BsKQWEzb.js","/assets/Profile-5I1ies-0.js","/assets/circle-user-BV2J1CKP.js","/assets/camera-DuAMHbLt.js","/assets/arrow-left-DM5r7C4h.js","/assets/Workers-B2t5LTcM.js","/assets/users-Vk_7G5L5.js","/assets/bell-CpyjkRC0.js","/assets/save-2ZfEt5-k.js","/assets/Attendance-BOcVbGsm.js","/assets/log-out-BFSi3PYx.js","/assets/shield-CgEzo2bo.js","/assets/user-check-CxwVegeo.js","/assets/refresh-cw-DP1OZLtP.js","/assets/search-C3WI37i-.js","/assets/x-D10SALf1.js","/assets/map-pin-Cbmis7rV.js","/assets/TableScrollContainer-Dm-sF6X0.js","/assets/arrow-right-3pEtjHnv.js","/assets/Support-Cf5Ri66y.js","/assets/chevron-down-CPg65LVU.js","/assets/send-Bpt581Ax.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-D3hDxUwg.js","/assets/siren-npjeCKAz.js","/assets/shield-alert-C_BrjkHa.js","/assets/clipboard-check-8EbkcjHi.js","/assets/circle-check-B2GJnULR.js","/assets/radio-xoaJAa8x.js","/assets/octagon-alert-dOFDgp_1.js","/assets/life-buoy-C71Qn2lN.js","/assets/phone-call-Cv3yzwYj.js","/assets/plus-CHebWnPR.js","/assets/translations-DzApDVcQ.js","/assets/web-CYaNpq1g.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-7iuC87X_.js"];

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