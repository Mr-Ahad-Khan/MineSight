const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CDgZCTQM.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CPttOSiu.js","/assets/Layout-DuD3YiUJ.js","/assets/HomePage-D7PEDQUw.js","/assets/sun-RS5cTNYn.js","/assets/Login-B1Se1xof.js","/assets/languages-DuvFkTOi.js","/assets/Register-BmgntvFz.js","/assets/recaptcha-wrapper-a_YgGfLz.js","/assets/BrandLogo-D9wPHHUK.js","/assets/Dashboard-DZTjVwm1.js","/assets/clipboard-list-C1evu9i1.js","/assets/building-2-Bk7sUyet.js","/assets/Inspections-CBM2U1pK.js","/assets/CreateInspection-BeqxFiRD.js","/assets/arrow-right-D5fd1t33.js","/assets/InspectionDetail-CZHFKtl5.js","/assets/file-text-4qibpACr.js","/assets/loader-circle-sgtQ2_4-.js","/assets/zoom-out-CYPSMimB.js","/assets/Compliances-BgjIHnav.js","/assets/Mines-Bh00WMjU.js","/assets/hooks-ojpe9gWb.js","/assets/leafletAssets-D-gu8S_M.js","/assets/MineralResourcesDashboard-ZHlyPdDW.js","/assets/Contractors-sJ9zO9NR.js","/assets/Alerts-DIIpfxTG.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BDTZtDjN.js","/assets/PieChart-B2R-lc8E.js","/assets/index-DLTK0KuE.js","/assets/Chat-DWDgGdbQ.js","/assets/bot-C6Pw2BiY.js","/assets/mic-GsJy4C-W.js","/assets/shield-check-D2MW1iEx.js","/assets/Profile-DdOdN0CU.js","/assets/circle-user-lGX-h71q.js","/assets/arrow-left-xPrS0xWe.js","/assets/Workers-BPGHaZ-j.js","/assets/users-BdYqZCw2.js","/assets/bell-DXtwf457.js","/assets/save-C_Vf8oOm.js","/assets/Attendance-UUudQzR8.js","/assets/log-out-DWEb8qUn.js","/assets/shield-jezitgHr.js","/assets/user-check-DILdmrPH.js","/assets/refresh-cw-CI4cSrLm.js","/assets/x-y4OPE9Pk.js","/assets/search-BLi8RVij.js","/assets/map-pin-B18qbKv-.js","/assets/Support-DbbGPB10.js","/assets/send-DsBHR7om.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Cgrjsi5f.js","/assets/siren-DQ4T7v1s.js","/assets/shield-alert-B2kDwZ33.js","/assets/clipboard-check-8yKH8DdD.js","/assets/circle-check-Bo12h6uE.js","/assets/radio-CheDingI.js","/assets/translations-Cg0Fu4mS.js","/assets/octagon-alert-o-qAbIkG.js","/assets/life-buoy-DFTdcReq.js","/assets/phone-call-j3k9e0dO.js","/assets/plus-CZyximB5.js","/assets/web-Do7mRzx_.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CBI-na6z.js"];

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