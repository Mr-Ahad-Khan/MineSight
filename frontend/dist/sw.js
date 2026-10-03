const CACHE_NAME = 'minesight-offline-v' + 1791023182464;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-Dlix-iSI.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-JcWiPzQz.js","/assets/Layout-CKJ6etYi.js","/assets/HomePage-Dw3J2S2Y.js","/assets/sun-cBifVdjX.js","/assets/Login-DqTbpYcv.js","/assets/languages-CTufk4wW.js","/assets/Register-DpxmfcpA.js","/assets/recaptcha-wrapper-BH4tW9PD.js","/assets/BrandLogo-pQc_AJSe.js","/assets/Dashboard-Bo0KprC2.js","/assets/clipboard-list-Dk-NRQfF.js","/assets/building-2-DPU_pbxo.js","/assets/Inspections-CC4shdrD.js","/assets/CreateInspection-BxMV57_S.js","/assets/InspectionDetail-byRHU5nI.js","/assets/circle-check-big-D6i-17Uj.js","/assets/upload-13uLN6a_.js","/assets/zoom-out-ro7YxDAq.js","/assets/Compliances-Ch6xrINs.js","/assets/Mines-DYbODOOb.js","/assets/hooks-DyXd7llE.js","/assets/leafletAssets-DNNl68HV.js","/assets/MineralResourcesDashboard-C8JTkfj7.js","/assets/loader-circle-mQt_DHM5.js","/assets/Contractors-C0e6lYi-.js","/assets/Alerts-DPObG6hg.js","/assets/hi-BiADQGDV.js","/assets/Analytics-W7-rXkwn.js","/assets/PieChart-CsVHDZVF.js","/assets/index-CnofCgNx.js","/assets/Chat-BiXAWpt1.js","/assets/bot-CaTJ5Ju1.js","/assets/mic-_Go3BC16.js","/assets/shield-check-B3gSINN8.js","/assets/Profile-CoEi2JBq.js","/assets/circle-user-C4ebCo6F.js","/assets/camera-AukB8V9x.js","/assets/arrow-left-BA24pLfX.js","/assets/Workers-CPWcBwx-.js","/assets/users-BmCcJiLa.js","/assets/bell-BVc6s7t9.js","/assets/save-B6gRHAUq.js","/assets/Attendance-nHAWWzsl.js","/assets/log-out-BQUhIkVu.js","/assets/shield-XWlm4G4e.js","/assets/user-check-ikdEbnh_.js","/assets/refresh-cw-BxKEyufk.js","/assets/search-CiM-Q5Ci.js","/assets/x-DuO5gXgA.js","/assets/map-pin-DazCj4o2.js","/assets/TableScrollContainer-DYlOadiB.js","/assets/arrow-right-DWgJJ9pm.js","/assets/Support-uZ7umwvE.js","/assets/chevron-down-Bkl5Dw-X.js","/assets/send-C7agqAKx.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-B8BnmYk0.js","/assets/siren-MC0kYRpS.js","/assets/shield-alert-C6-ZNdHQ.js","/assets/clipboard-check-Duu0Sard.js","/assets/circle-check-mC26Bgzt.js","/assets/radio-B5gUW4UE.js","/assets/octagon-alert-L5CXYYIC.js","/assets/life-buoy-D6I_cEXe.js","/assets/phone-call-CNPLD6eA.js","/assets/plus-K2221bfP.js","/assets/translations-DbrZn9zW.js","/assets/web-DiJCldN0.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CzV2g0Ge.js"];

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