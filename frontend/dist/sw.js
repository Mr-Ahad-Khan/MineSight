const CACHE_NAME = 'minesight-offline-v' + 1790949267302;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DR47SItv.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-PmO3Mxx9.js","/assets/Layout-Bpit8vep.js","/assets/HomePage-B5ncIFSF.js","/assets/sun-BVgSCehl.js","/assets/Login-DCm3GXyP.js","/assets/languages-BgRdKfFS.js","/assets/Register-BkM3i0aw.js","/assets/recaptcha-wrapper-qy-zxbTB.js","/assets/BrandLogo-CKKUKjpl.js","/assets/Dashboard-Dd6BZxcF.js","/assets/clipboard-list-BlFKOaRX.js","/assets/building-2-DvTMfM1I.js","/assets/Inspections-C5tNpqmP.js","/assets/CreateInspection-B67oyuPN.js","/assets/InspectionDetail-BQygSQgz.js","/assets/file-text-CDhpXcrQ.js","/assets/loader-circle-DB3zKZ48.js","/assets/zoom-out-Brg9ogBc.js","/assets/Compliances-DEks41oO.js","/assets/Mines-v8MTS_Xu.js","/assets/hooks-CteTJTP0.js","/assets/leafletAssets-BnreILxn.js","/assets/MineralResourcesDashboard-DZ_uTiVQ.js","/assets/Contractors-Co9u4r29.js","/assets/Alerts-6MveobBK.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CafTxFru.js","/assets/PieChart-wb7CkGIA.js","/assets/index-yugjnAau.js","/assets/Chat-G0fa3Avd.js","/assets/bot-DNT13Dm9.js","/assets/mic-ljQa9xSo.js","/assets/shield-check-BkWU9PHc.js","/assets/Profile-Dy0W6YgQ.js","/assets/circle-user-DMTemyYr.js","/assets/arrow-left-C3J_M9B9.js","/assets/Workers-FjR6Tewp.js","/assets/users-IELlRiW0.js","/assets/bell-BncsZRZl.js","/assets/save-DjXRf0oy.js","/assets/Attendance-BrdlD4n_.js","/assets/log-out-Boiai706.js","/assets/shield-DxSNZSQF.js","/assets/user-check-BjLw2Y4M.js","/assets/refresh-cw-Bwt7C3yh.js","/assets/x-D-yqghFP.js","/assets/search-BB8Hlkhu.js","/assets/map-pin-DF8tEu9Q.js","/assets/TableScrollContainer-DlrMcAM0.js","/assets/arrow-right-DtLKq6tc.js","/assets/Support-BMOwzwHx.js","/assets/chevron-down-BfN_fxsW.js","/assets/send-C6YShmGF.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Hv2sSLpO.js","/assets/siren-Cqbl4VGy.js","/assets/shield-alert-CLLxFrbd.js","/assets/clipboard-check-CffRZR7n.js","/assets/circle-check-DTRtPYep.js","/assets/radio-p-PyfbNj.js","/assets/octagon-alert-CWiaFh_F.js","/assets/life-buoy-CosjHwbg.js","/assets/phone-call-BjMHOPpv.js","/assets/plus-cIXN1MAt.js","/assets/translations-DbrZn9zW.js","/assets/web-DVyLO3vP.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CAz3oiE8.js"];

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