const CACHE_NAME = 'minesight-offline-v' + 1791037988774;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-C0iww7lC.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DfXElwmh.js","/assets/Layout-CJqRlXJH.js","/assets/HomePage-DtS5whVu.js","/assets/sun-pFxbMeXX.js","/assets/Login-DyFQ0qV-.js","/assets/languages-jOibdSqm.js","/assets/Register-g0hOajIJ.js","/assets/ReCAPTCHA-DkdHEwj9.js","/assets/BrandLogo-BE2CcKRQ.js","/assets/Dashboard-D0mZx4br.js","/assets/clipboard-list-DcQC5I7N.js","/assets/building-2-rKXeD55J.js","/assets/Inspections-D_vXYMsr.js","/assets/CreateInspection-Jak96MGX.js","/assets/InspectionDetail-DxiyWDfv.js","/assets/circle-check-big-BhZovqSe.js","/assets/imageCompressor-C97tyAgs.js","/assets/zoom-out-CHejWruo.js","/assets/Compliances-Dv10eELi.js","/assets/Mines-BfRDd3am.js","/assets/hooks-iLOB5jz6.js","/assets/leafletAssets-BQr-lyqS.js","/assets/MineralResourcesDashboard-Fp0uaXe-.js","/assets/loader-circle-pSkCQCwl.js","/assets/Contractors-C2n40Ezu.js","/assets/Alerts-CqBvJGlV.js","/assets/hi-BiADQGDV.js","/assets/Analytics-bmYtS4pV.js","/assets/PieChart-DuuW-AFY.js","/assets/Chat-FNXbf-pv.js","/assets/bot-BPG_1w1j.js","/assets/mic-BiNU7TCk.js","/assets/shield-check-R3g7L_cs.js","/assets/chevron-right-BKN3rM99.js","/assets/Profile-575Vnut6.js","/assets/circle-user-DPDV-IHN.js","/assets/camera-Dv55yttI.js","/assets/arrow-left-B2_lWkGw.js","/assets/Workers-ZhGBO_Zw.js","/assets/users-D48BSoJ4.js","/assets/bell-Ds963qCN.js","/assets/save-NN-rtjkr.js","/assets/Attendance-DZutYlkf.js","/assets/log-out-64wM63NF.js","/assets/shield-BfPeeIzW.js","/assets/user-check-D_X2KJZ6.js","/assets/refresh-cw-Ds29e3tL.js","/assets/search-CwozVGNk.js","/assets/x--vdPGQic.js","/assets/map-pin-CsVKBP2g.js","/assets/TableScrollContainer-BqsxX61w.js","/assets/arrow-right-BDFl7iQ3.js","/assets/Support-Ctz6Eqpo.js","/assets/chevron-down-hcyIL3B_.js","/assets/send-CcUI-47v.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BEEkzrjP.js","/assets/siren-spsQv6ag.js","/assets/shield-alert-BSR0LlpZ.js","/assets/clipboard-check-Btm9yqZD.js","/assets/circle-check-BSZ8wSyC.js","/assets/radio-F7q8hVm1.js","/assets/octagon-alert-dTxzVBQo.js","/assets/life-buoy-BdC2lgXr.js","/assets/phone-call-D2P1pQtl.js","/assets/plus-rzGLu_1B.js","/assets/translations-acmd7qdg.js","/assets/web-Bz50iR6M.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-JRJeF_nb.js"];

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