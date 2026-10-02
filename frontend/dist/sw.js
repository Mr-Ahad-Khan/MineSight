const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-h1dtC6wy.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-D8x9jRuv.js","/assets/Layout-CkwaBE5P.js","/assets/HomePage-BqNoxVxw.js","/assets/sun-DAFBhiS4.js","/assets/Login-CYCrj8m7.js","/assets/languages-CsxM9Lwe.js","/assets/Register-BOnB1QCt.js","/assets/recaptcha-wrapper-Dpc4sJmy.js","/assets/BrandLogo-HaOgbjcV.js","/assets/Dashboard-Cmkc9Lds.js","/assets/clipboard-list-DKvqopF4.js","/assets/building-2-DDD4uMP6.js","/assets/Inspections-BR51WbqB.js","/assets/CreateInspection-DMIhwZcy.js","/assets/arrow-right-BMe0xlPs.js","/assets/InspectionDetail-CC1Cizcq.js","/assets/file-text-Bnb461Zb.js","/assets/loader-circle-DU2mJkMs.js","/assets/zoom-out-C9_XiA17.js","/assets/Compliances-ChjBEeKr.js","/assets/Mines-dDpEAmoW.js","/assets/hooks-BIjqmCc9.js","/assets/leafletAssets-BVEjNWds.js","/assets/MineralResourcesDashboard-Nwki1odf.js","/assets/Contractors-CdGPvY0Y.js","/assets/Alerts-DWjOfj4S.js","/assets/hi-BiADQGDV.js","/assets/Analytics-B3M4oIS_.js","/assets/PieChart-DPEZb80Y.js","/assets/index-ChXYcQqD.js","/assets/Chat-DSk30nXC.js","/assets/bot-0gngZBB8.js","/assets/mic-DKvpjOxc.js","/assets/shield-check-qdMDTFeY.js","/assets/Profile-D4UqcQ_Z.js","/assets/circle-user-aO06-IeG.js","/assets/arrow-left-A5iGwPSB.js","/assets/translations-CcWNuMqk.js","/assets/Workers-DbHmoIjI.js","/assets/users-Dp5yzfOz.js","/assets/bell-DHkPh-r-.js","/assets/save-B0TFhJ_F.js","/assets/Attendance-fLxcnNOq.js","/assets/log-out-KhcKx2QK.js","/assets/shield-CE4ZITT0.js","/assets/user-check-D8jh5NGM.js","/assets/refresh-cw-CHVoqoXf.js","/assets/x-BC3f0raC.js","/assets/search-D9-YHNuA.js","/assets/map-pin-C-5Ku5uI.js","/assets/Support-DEGJg9Bv.js","/assets/send-QmcWRRxY.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-B74HixQE.js","/assets/siren-Cgqj88vc.js","/assets/shield-alert-CyrFt852.js","/assets/clipboard-check-zyACyzzW.js","/assets/circle-check-CAjdqYLk.js","/assets/radio-CanPNrN6.js","/assets/octagon-alert-WsmpzKGc.js","/assets/life-buoy-C2STI4JN.js","/assets/phone-call-D-Fa_AZr.js","/assets/plus-C2g7dus8.js","/assets/web-BYKGHDZL.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CxJ43jTT.js"];

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