const CACHE_NAME = 'minesight-offline-v' + 1791030593365;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-qbeTLAnL.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CwSv7QNK.js","/assets/Layout-CI_0QqxT.js","/assets/HomePage-ndnuBPuP.js","/assets/sun-neAEyhmo.js","/assets/Login-CHYnNRZc.js","/assets/languages-C8w7_C-1.js","/assets/Register-DBqpgTCN.js","/assets/recaptcha-wrapper-BgHz_Q9R.js","/assets/BrandLogo-JrWf7oD5.js","/assets/Dashboard-dVBBHEQA.js","/assets/clipboard-list-BedeY4Hd.js","/assets/building-2-C5VDKBxz.js","/assets/Inspections-DlJ-IEi4.js","/assets/CreateInspection-C3NXgKNO.js","/assets/InspectionDetail-DK6LGXFf.js","/assets/circle-check-big-BwATipFs.js","/assets/imageCompressor-BtTLbMLE.js","/assets/zoom-out-UpoKNTQ8.js","/assets/Compliances-CTAfVD16.js","/assets/Mines-E06hOIQI.js","/assets/hooks-DyuQY_JX.js","/assets/leafletAssets-3mmSWSez.js","/assets/MineralResourcesDashboard-3irFeW4h.js","/assets/loader-circle-Dnasj4ie.js","/assets/Contractors-DCvjhvdf.js","/assets/Alerts-D2rDdQla.js","/assets/hi-BiADQGDV.js","/assets/Analytics-C1ygz1Ha.js","/assets/PieChart-Co5BUmcg.js","/assets/index-BPVBkas4.js","/assets/Chat-TUfAOqJh.js","/assets/bot-DQAZbQKK.js","/assets/mic-epw6Nqgi.js","/assets/shield-check-d4BcEcez.js","/assets/Profile-Be9MGNEd.js","/assets/circle-user-CvQy_AG_.js","/assets/camera-B84JYLej.js","/assets/arrow-left-ZYnpEBia.js","/assets/Workers-y4Mn_zAa.js","/assets/users-C3-AUx5h.js","/assets/bell-vh7aV4LJ.js","/assets/save-BOOEo4t9.js","/assets/Attendance-4LaFyp7N.js","/assets/log-out-Dz-TVidd.js","/assets/shield-DCKc9dYw.js","/assets/user-check-4ZKu6-gD.js","/assets/refresh-cw-DdMadXaL.js","/assets/search-D9HOdV6a.js","/assets/x-CvsIySd1.js","/assets/map-pin-wvQfyrFe.js","/assets/TableScrollContainer-mvG8DwjO.js","/assets/arrow-right-B952IHiH.js","/assets/Support-Bcrd5vAu.js","/assets/chevron-down-BSAHLCed.js","/assets/send-CvqAwUES.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DdMarbuS.js","/assets/siren-DI3ief1-.js","/assets/shield-alert-D_vuUlNK.js","/assets/clipboard-check-BGRcwBYG.js","/assets/circle-check-DaEMDeBE.js","/assets/radio-DzyHE6W0.js","/assets/octagon-alert-Dd-lsg4S.js","/assets/life-buoy-nkLKKJDF.js","/assets/phone-call-BqxdNDva.js","/assets/plus-BIfmKbTj.js","/assets/translations-DbrZn9zW.js","/assets/web-DAhioBQ8.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-f7DNI2DF.js"];

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