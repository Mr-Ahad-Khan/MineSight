const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DkF7EPf-.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Dc8zuAul.js","/assets/Layout-BJN6fmGZ.js","/assets/HomePage-C0Fq4Rt_.js","/assets/sun-DX64PRaL.js","/assets/Login-CdJw7fsl.js","/assets/languages-Dsz5ob_2.js","/assets/Register-DGPRjpmv.js","/assets/recaptcha-wrapper-dKzBjnSr.js","/assets/BrandLogo-DBBqLswI.js","/assets/Dashboard-Dc92NRbl.js","/assets/clipboard-list-C8Ly-PZt.js","/assets/building-2-BPKAH_g6.js","/assets/Inspections-xBxPe6Pu.js","/assets/CreateInspection-CF4LRuwW.js","/assets/arrow-right-Byh7omCe.js","/assets/InspectionDetail-BNHlgM88.js","/assets/file-text-DQeQQnqF.js","/assets/loader-circle-DjqiXcox.js","/assets/trash-2-DdVttH1Y.js","/assets/Compliances-CvZKsKxP.js","/assets/Mines-CjsNDX7O.js","/assets/hooks-CtnyNiA8.js","/assets/leafletAssets-BCq3KdIi.js","/assets/MineralResourcesDashboard-CjJ1FE36.js","/assets/Contractors-Df1N9YWS.js","/assets/Alerts-CFeiKQMb.js","/assets/hi-BiADQGDV.js","/assets/Analytics-LApcn7TR.js","/assets/PieChart-Dp6FzxeG.js","/assets/index-DhZCSLUC.js","/assets/Chat-BwpPavJI.js","/assets/bot-BzQApusG.js","/assets/mic-S4IHBFU2.js","/assets/shield-check-BHZRe5X_.js","/assets/Profile-C8iWKOcW.js","/assets/circle-user-C5YfN1l5.js","/assets/arrow-left-BzDHmjGE.js","/assets/translations-dTjUQ25p.js","/assets/Workers-jKhyAtZU.js","/assets/users-DhEyCmVV.js","/assets/bell-DqyN7Ypx.js","/assets/save-CX35Lt4H.js","/assets/Attendance-B0o_hJo_.js","/assets/log-out-DDmgFZpR.js","/assets/shield-BhAZqxvD.js","/assets/user-check-r0i9Lwbx.js","/assets/refresh-cw-BsrIJ84E.js","/assets/x-CFXZ9Xqq.js","/assets/search-DBDqTpJF.js","/assets/map-pin-DCBOoTzZ.js","/assets/Support-0bVZpzHM.js","/assets/send-CniLUgLV.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-SMZOkQU8.js","/assets/siren-DFKMcZnT.js","/assets/shield-alert-C16_fg3X.js","/assets/clipboard-check-BunacGy-.js","/assets/circle-check-CYqLN-Oc.js","/assets/radio-Ho-H3aP7.js","/assets/octagon-alert-DIBWb6KT.js","/assets/life-buoy-CXBSbRQu.js","/assets/phone-call-BzOPsCpn.js","/assets/plus-CO9wWP6v.js","/assets/web-Jt0jdNCB.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-mohMRWTW.js"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
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
      fetch(request).catch(() => caches.match('/index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
        }
        return response;
      });
    }),
  );
});