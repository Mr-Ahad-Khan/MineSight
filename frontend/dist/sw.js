const CACHE_NAME = 'minesight-offline-v' + 1790949753108;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BrTehDFo.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BqcL2Zbr.js","/assets/Layout-G6DFfeCy.js","/assets/HomePage-i13I9D-_.js","/assets/sun-CgDnw5Ch.js","/assets/Login-T0UKy159.js","/assets/languages-BFCMkwbd.js","/assets/Register-Bh-wispr.js","/assets/recaptcha-wrapper-CvPdkxrQ.js","/assets/BrandLogo-DsTnef72.js","/assets/Dashboard-3Fulx8S5.js","/assets/clipboard-list-BZA0Ukgd.js","/assets/building-2-BHY1-Ncw.js","/assets/Inspections-wJ2U5cSc.js","/assets/CreateInspection-C5te80lG.js","/assets/InspectionDetail-B4wvLIi2.js","/assets/file-text-C7HMrhpQ.js","/assets/loader-circle-Dqv_ITOF.js","/assets/zoom-out-o8Yau9wm.js","/assets/Compliances-Km-3-1X_.js","/assets/Mines-BCMZWtBW.js","/assets/hooks-BfK5YxbU.js","/assets/leafletAssets-BIPX9scr.js","/assets/MineralResourcesDashboard-Wl4WdTFw.js","/assets/Contractors-BUhJGDzR.js","/assets/Alerts-nTaBkYpI.js","/assets/hi-BiADQGDV.js","/assets/Analytics-Bk2YiPiM.js","/assets/PieChart-DMT5CM2g.js","/assets/index-BbWMC0vf.js","/assets/Chat-DyiWQp1k.js","/assets/bot-BUFf3rsQ.js","/assets/mic-CvXS1erb.js","/assets/shield-check-Bq7utG0D.js","/assets/Profile-DvodOWZ5.js","/assets/circle-user-DdZpvHjl.js","/assets/arrow-left-fs41tJqq.js","/assets/Workers-C549Vd_8.js","/assets/users-CHbVXc8V.js","/assets/bell-CUZFL4jC.js","/assets/save-CdyIllVr.js","/assets/Attendance-xb2w4-V6.js","/assets/log-out-DgrjEjyJ.js","/assets/shield-B509-Ow2.js","/assets/user-check-CBf4OatF.js","/assets/refresh-cw-Dp4-GsyH.js","/assets/x-CnZDWsKE.js","/assets/search-BQEAsh6D.js","/assets/map-pin-DRcmeD-R.js","/assets/TableScrollContainer-ITeyFmgp.js","/assets/arrow-right-QBPZdf2h.js","/assets/Support-C6jWSm-S.js","/assets/chevron-down-E1ks-gns.js","/assets/send-SARtbcq5.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-C8IEUIS5.js","/assets/siren-wOgHUuCA.js","/assets/shield-alert-C_TfSfjX.js","/assets/clipboard-check-BKMBuOMT.js","/assets/circle-check-B1P6NKhr.js","/assets/radio-Cx0H8p_t.js","/assets/octagon-alert-BfrWYBg0.js","/assets/life-buoy-C1pIWpKC.js","/assets/phone-call-DKP5dDek.js","/assets/plus-Cdav9ynw.js","/assets/translations-DbrZn9zW.js","/assets/web-DsL56gqx.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-ddWbumND.js"];

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