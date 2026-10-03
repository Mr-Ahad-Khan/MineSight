const CACHE_NAME = 'minesight-offline-v' + 1791042649535;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-zZG8wlB4.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CJ2CusQw.js","/assets/Layout-CxUfxxX6.js","/assets/HomePage-C2jjA_rG.js","/assets/sun-CcF56a3Q.js","/assets/Login-Dj-xlyZz.js","/assets/languages-CEBBsase.js","/assets/Register-C37l0LLU.js","/assets/ReCAPTCHA-6Ycfacyv.js","/assets/BrandLogo-CqZvsDOR.js","/assets/Dashboard-Bmjr5ii4.js","/assets/clipboard-list-RwOsVkOR.js","/assets/building-2-bwePd2es.js","/assets/Inspections-BpqHe7z9.js","/assets/CreateInspection-BFRVyFZ0.js","/assets/InspectionDetail-DW45J1Yu.js","/assets/circle-check-big-59aPaoqq.js","/assets/imageCompressor-CuND9028.js","/assets/zoom-out-CSsQIFwW.js","/assets/Compliances-D05U4vkT.js","/assets/Mines-DX1kRm0d.js","/assets/hooks-yx2Tqwqm.js","/assets/leafletAssets-i0-A71U2.js","/assets/MineralResourcesDashboard-KKgLxenI.js","/assets/loader-circle-DIHJGWml.js","/assets/Contractors-CjE6x5TO.js","/assets/Alerts-ErY2Qbw1.js","/assets/hi-BiADQGDV.js","/assets/Analytics-B8_qCM9-.js","/assets/PieChart-CcnltZgf.js","/assets/Chat-BdIxQck-.js","/assets/bot-DiVJj6hv.js","/assets/volume-x-CRHBj4ym.js","/assets/mic-C9NIdbJh.js","/assets/shield-check-BaRx9Vl3.js","/assets/chevron-right-BsRem-9R.js","/assets/Profile-Bf0yjSKv.js","/assets/circle-user-D2Jg_lU1.js","/assets/camera-DVXKgJV9.js","/assets/arrow-left-LbzGqO5j.js","/assets/Workers-BvnhfbYs.js","/assets/users-9Sx1MDDp.js","/assets/bell-CvI_mn5t.js","/assets/save-DMrhUMFo.js","/assets/Attendance-B_w-BGl8.js","/assets/log-out-DZitCsLB.js","/assets/shield-B22yQ0Ur.js","/assets/user-check-C_JEZZKZ.js","/assets/refresh-cw-DtX3fqfQ.js","/assets/search-GHVmbzuT.js","/assets/x-DwYnEwAf.js","/assets/map-pin-cJpr48SM.js","/assets/TableScrollContainer-BTuOgvFb.js","/assets/arrow-right-CV8N_rZZ.js","/assets/Support-oCAWVf5_.js","/assets/chevron-down-3KjLWPIm.js","/assets/send-BU-jyPXZ.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-EkzscgGo.js","/assets/siren-CQroafos.js","/assets/shield-alert-Cuwc_QEn.js","/assets/clipboard-check-CYru7I37.js","/assets/circle-check-8LYhscmQ.js","/assets/radio-nS7EmHMI.js","/assets/octagon-alert-ATlHfT30.js","/assets/life-buoy-BnveH9xc.js","/assets/phone-call-BtXoaxHr.js","/assets/plus-C5V-CRam.js","/assets/translations-DzApDVcQ.js","/assets/web-YqMmLNLU.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BeTFD12K.js"];

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