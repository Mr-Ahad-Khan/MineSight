const CACHE_NAME = 'minesight-offline-v' + 1790956493346;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-B-jRMSST.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DGgB_tMQ.js","/assets/Layout-C17OItsS.js","/assets/HomePage-SgdKrFXj.js","/assets/sun-B74Rqoww.js","/assets/Login-CxqxqsWE.js","/assets/languages-Cw56sOs5.js","/assets/Register-B0k_WKYe.js","/assets/recaptcha-wrapper-CZdaDtEb.js","/assets/BrandLogo-C2gPaY9B.js","/assets/Dashboard-C_LLqTb2.js","/assets/clipboard-list-Nm8Waq7P.js","/assets/building-2-BSfdx_Br.js","/assets/Inspections-BJSkx_ij.js","/assets/CreateInspection-DOxYK_Q7.js","/assets/InspectionDetail-O0Z8l3Qh.js","/assets/file-text-DLHFLVJk.js","/assets/loader-circle-C8ua2x1g.js","/assets/zoom-out-D6N6UDg4.js","/assets/Compliances-DZC75QcU.js","/assets/Mines-D4JSL2US.js","/assets/hooks-cEw875z8.js","/assets/leafletAssets-kxMppXZq.js","/assets/MineralResourcesDashboard-DMwP7ngh.js","/assets/Contractors-sBcE3TlH.js","/assets/Alerts-tnPyLFQ7.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DtTT0aM6.js","/assets/PieChart-Dx9OXwwK.js","/assets/index-B37HvS1z.js","/assets/Chat-CR2g6UUM.js","/assets/bot-DSJHVdBI.js","/assets/mic-CcSJdoMH.js","/assets/shield-check-dxKsnBpC.js","/assets/Profile-BVyP6vIk.js","/assets/circle-user-KevURFIq.js","/assets/arrow-left-B1L1mTnE.js","/assets/Workers-BH6YBUVf.js","/assets/users-CWcKnKVH.js","/assets/bell-CX1HROYk.js","/assets/save-xzoegyHQ.js","/assets/Attendance-DaDfLjEk.js","/assets/log-out-Cb17_KUB.js","/assets/shield-CPhB1B1h.js","/assets/user-check-CXAdpj3K.js","/assets/refresh-cw-T6iah0ib.js","/assets/x-5c48OVdJ.js","/assets/search-CPlDIv6k.js","/assets/map-pin-M2ug_Aiu.js","/assets/TableScrollContainer-bcBtBpBd.js","/assets/arrow-right-BbmZq0xt.js","/assets/Support-ekDnAZm_.js","/assets/chevron-down-PcMTliWX.js","/assets/send-pQmwdSrf.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Bytdg6M7.js","/assets/siren-eLCSQTZ1.js","/assets/shield-alert-catdUtVy.js","/assets/clipboard-check-D8TCQ8lY.js","/assets/circle-check-34LRYadX.js","/assets/radio-c8xbtTDT.js","/assets/octagon-alert-DvSgqMks.js","/assets/life-buoy-j1FTlyNk.js","/assets/phone-call-zqZ5lwGL.js","/assets/plus-C0Zf-4iV.js","/assets/translations-DbrZn9zW.js","/assets/web-C6eyovP0.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-hG9eEp7-.js"];

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