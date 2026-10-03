const CACHE_NAME = 'minesight-offline-v' + 1791016749507;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BsKB40VH.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-C0i3stq3.js","/assets/Layout-BkROvvW7.js","/assets/HomePage-CcMVACUz.js","/assets/sun-DhLejGTD.js","/assets/Login-D-UZa7Pu.js","/assets/languages-BOwKHcrf.js","/assets/Register-CyoUR_4Z.js","/assets/recaptcha-wrapper-DUgfyTv0.js","/assets/BrandLogo-BEbbs7Ik.js","/assets/Dashboard-BvJWeu-1.js","/assets/clipboard-list-BEQogCkp.js","/assets/building-2-ZD3cMWWv.js","/assets/Inspections-4x7WbhI-.js","/assets/CreateInspection-Bc0miaOt.js","/assets/InspectionDetail-iB51ateA.js","/assets/circle-check-big-CUNHkSKF.js","/assets/upload-BRRON9-E.js","/assets/loader-circle-BFyfoz2a.js","/assets/zoom-out-BZyORe9p.js","/assets/Compliances-CrhSuwEw.js","/assets/Mines-JqxGFRWO.js","/assets/hooks-vWpeRcFw.js","/assets/leafletAssets-WDTRKPsK.js","/assets/MineralResourcesDashboard-T88ridDG.js","/assets/Contractors-B1ueAnAj.js","/assets/Alerts-C3Odp0V5.js","/assets/hi-BiADQGDV.js","/assets/Analytics-sZ26cJl7.js","/assets/PieChart-DlI_zeSU.js","/assets/index-DPSp0Yry.js","/assets/Chat-6QG2XVc_.js","/assets/bot-Dx-FW9-n.js","/assets/mic-DbOg49IG.js","/assets/shield-check-IYWhC-uq.js","/assets/Profile-eF7fclzR.js","/assets/circle-user-B828OXA4.js","/assets/arrow-left-CY0iR-aI.js","/assets/Workers-C1ZyKv6Q.js","/assets/users-D_8VChym.js","/assets/bell-CvhKOmOh.js","/assets/save-CYMk8KBT.js","/assets/Attendance-DqnH5JGJ.js","/assets/log-out-CGDSc5nu.js","/assets/shield-CqvHDoLP.js","/assets/user-check-Ccs-nNje.js","/assets/refresh-cw-BvT_9MGJ.js","/assets/x-Dd5ygbV9.js","/assets/search-DtVQSFt7.js","/assets/map-pin-1TVMkch0.js","/assets/TableScrollContainer-Bgfh-WkH.js","/assets/arrow-right-BT6hTGq-.js","/assets/Support-B3gSGgN4.js","/assets/chevron-down-CDE_VGD6.js","/assets/send-B-RNMX0_.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-pz8K_GYz.js","/assets/siren-BcQvPWK9.js","/assets/shield-alert-CcQeBJP1.js","/assets/clipboard-check-BSbKxIGY.js","/assets/circle-check-D8STk8Ps.js","/assets/radio-B1aFEAM9.js","/assets/octagon-alert-5v61u_8c.js","/assets/life-buoy-DmL7Wf9P.js","/assets/phone-call-Dwof2alV.js","/assets/plus-F6fllBp1.js","/assets/translations-DbrZn9zW.js","/assets/web-ytQu6AJo.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BOTVdaLI.js"];

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