const CACHE_NAME = 'minesight-offline-v' + 1790943682760;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DEZlG04r.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CwqC3s8T.js","/assets/Layout-DyxHE-ZG.js","/assets/HomePage-4HltXFwa.js","/assets/sun-CYX5X9nf.js","/assets/Login-B8sfIHmp.js","/assets/languages-DqhE1F38.js","/assets/Register-SeBQmeKS.js","/assets/recaptcha-wrapper-Dt0IXejD.js","/assets/BrandLogo-Bxpb8FuR.js","/assets/Dashboard-Bh0bvu_M.js","/assets/clipboard-list-CYIhK9Ge.js","/assets/building-2-B7KFTkUm.js","/assets/Inspections-BLECVKvd.js","/assets/CreateInspection-BILhY5ms.js","/assets/arrow-right-CU7Zp2Ab.js","/assets/InspectionDetail-BUHV296O.js","/assets/file-text-D9CTXKeb.js","/assets/loader-circle-CuwJIpZA.js","/assets/zoom-out-Bb8gkPth.js","/assets/Compliances-D3-2dzWu.js","/assets/Mines-1p_Xx2ff.js","/assets/hooks-Bbp0e2xc.js","/assets/leafletAssets-U9ZUbKwa.js","/assets/MineralResourcesDashboard-Boc4DciF.js","/assets/Contractors-DUu2QXID.js","/assets/Alerts-JgHVLcEw.js","/assets/hi-BiADQGDV.js","/assets/Analytics-Da7qDxc9.js","/assets/PieChart-Bu-NfpeF.js","/assets/index-0gYyiOiQ.js","/assets/Chat-DfgAOZsp.js","/assets/bot-KYC8O6he.js","/assets/mic-YJDC_OQr.js","/assets/shield-check-BWGsD1Ja.js","/assets/Profile-BUaYGP5D.js","/assets/circle-user-CFRSN4ds.js","/assets/arrow-left-Ducurbe8.js","/assets/Workers-CULng32x.js","/assets/users-Cav84uc5.js","/assets/bell-D61PDxki.js","/assets/save-D6-ZYoPQ.js","/assets/Attendance-DNbFda6-.js","/assets/log-out-Br9_YAXg.js","/assets/shield-CodYccCr.js","/assets/user-check-DXysV5ev.js","/assets/refresh-cw-CkUwr3m4.js","/assets/x-0rw50c73.js","/assets/search-8uLuyNQg.js","/assets/map-pin-BL3_rBLP.js","/assets/Support-C1ciq5Dh.js","/assets/chevron-down-D4CdMtLS.js","/assets/send-_njZKPE5.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BSuD4TAr.js","/assets/siren-CBFX-Q8D.js","/assets/shield-alert-Di5bRKDP.js","/assets/clipboard-check-dMDNo5dS.js","/assets/circle-check-CwvrBOvo.js","/assets/radio-BTVCJZub.js","/assets/octagon-alert-BZn7hh52.js","/assets/life-buoy-DQgk21MR.js","/assets/phone-call-C2S_Q6Tb.js","/assets/plus-BIqd6e7J.js","/assets/translations-CmXZgOBw.js","/assets/web-CGfo9WfQ.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-gCGZzZHv.js"];

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