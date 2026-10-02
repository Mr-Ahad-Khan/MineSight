const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DtC5nQvG.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-ex_jgBTf.js","/assets/Layout-Clpm_wJI.js","/assets/HomePage-CcreArmu.js","/assets/sun-DGzrf6Cl.js","/assets/Login-B3DFnqnh.js","/assets/languages-BcGxMo1K.js","/assets/Register-Dr-wTwh2.js","/assets/recaptcha-wrapper-C9Tm6crK.js","/assets/BrandLogo-sD3HlpRU.js","/assets/Dashboard-BsEa5OO_.js","/assets/clipboard-list-DqXNXP--.js","/assets/building-2-Bbx4QclB.js","/assets/Inspections-BB_-MbVa.js","/assets/CreateInspection-CSuiJZzt.js","/assets/arrow-right-B_Oyt_77.js","/assets/InspectionDetail-CZ3QGLFy.js","/assets/file-text-Bznr9mIE.js","/assets/loader-circle-z8aLwFne.js","/assets/zoom-out-DlcEo-ZT.js","/assets/Compliances-BXN2guKw.js","/assets/Mines-jqw2Fj4r.js","/assets/hooks-BNQIQFrG.js","/assets/leafletAssets-8b8IAWk8.js","/assets/MineralResourcesDashboard-Dshdy7Ar.js","/assets/Contractors-Bh1zdtHr.js","/assets/Alerts-kESMJh-y.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DeznCM6h.js","/assets/PieChart-BSjrhXlu.js","/assets/index-CPpZOWfh.js","/assets/Chat-DyUwCNU2.js","/assets/bot-X7f3jEh1.js","/assets/mic-DQlFf0V3.js","/assets/shield-check-lQhszmZ3.js","/assets/Profile-B3Hylkvi.js","/assets/circle-user-DLZ-EcSB.js","/assets/arrow-left-BJvNFO8v.js","/assets/translations-hHSYFoAi.js","/assets/Workers-Ct1DqOSi.js","/assets/users-CJwVsiIK.js","/assets/bell-DCWX5rVj.js","/assets/save-DBPMRpvg.js","/assets/Attendance-oOugBjQY.js","/assets/log-out-ByKWXM4x.js","/assets/shield-Cs6m3jQl.js","/assets/user-check-D12acf81.js","/assets/refresh-cw-F21wAt8c.js","/assets/x-5JazA-Ma.js","/assets/search-BeIhEAPO.js","/assets/map-pin-BgulS7GZ.js","/assets/Support-nJah_PjW.js","/assets/send-BkkaKaUr.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CeoSZPQY.js","/assets/siren-Ch_u45D1.js","/assets/shield-alert-DEpd05Se.js","/assets/clipboard-check-A2gAFhpR.js","/assets/circle-check-CKIjTAzN.js","/assets/radio-C40MZjsr.js","/assets/octagon-alert-DWt2tM3V.js","/assets/life-buoy-B_smYNz5.js","/assets/phone-call-sVHUURxa.js","/assets/plus-BLauvX0r.js","/assets/web-BWndMYAP.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BOmXHW0b.js"];

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