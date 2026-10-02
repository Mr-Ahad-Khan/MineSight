const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-Bzqww9ee.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CPmXWOEW.js","/assets/Layout-B7vO1dq9.js","/assets/HomePage-DV6MNHQy.js","/assets/sun-C322zw26.js","/assets/Login-AIrOzUlT.js","/assets/languages-DEIC4HsN.js","/assets/Register-CXZtKf4H.js","/assets/recaptcha-wrapper-Rp0TKly8.js","/assets/BrandLogo-S76ZmD4m.js","/assets/Dashboard-BSZ9xpM9.js","/assets/clipboard-list-D7-X2_aU.js","/assets/building-2-DX_Tn35Z.js","/assets/Inspections-xtd-wRyS.js","/assets/CreateInspection-Blk5ojJF.js","/assets/arrow-right-C-wJP1Up.js","/assets/InspectionDetail--LKJxq-D.js","/assets/file-text-CVQ73u2m.js","/assets/loader-circle-CKc9nBM5.js","/assets/zoom-out-Dfg8WEJE.js","/assets/Compliances-CqkrVt9B.js","/assets/Mines-C3Meu6hR.js","/assets/hooks-CYkHFWF_.js","/assets/leafletAssets-DKETHWIu.js","/assets/MineralResourcesDashboard-MDT0bUb8.js","/assets/Contractors-D-OFQpPk.js","/assets/Alerts-DE1LlQHK.js","/assets/hi-BiADQGDV.js","/assets/Analytics-B_1NoV9b.js","/assets/PieChart-BjsyR1Rw.js","/assets/index-Dch4IBEF.js","/assets/Chat-B2eazvNf.js","/assets/bot-smfVxTGI.js","/assets/mic-CbPoOy33.js","/assets/shield-check-BGi98MOm.js","/assets/Profile-DlkEIYN2.js","/assets/circle-user-2a_YtJKM.js","/assets/arrow-left-Dn9GeeWn.js","/assets/Workers-DEYqkKUj.js","/assets/users-U5NyNgu7.js","/assets/bell-CuIMdDqe.js","/assets/save-0JN3aAVV.js","/assets/Attendance-ChzRCeHF.js","/assets/log-out-CCeUu0Na.js","/assets/shield-DEOEzEGj.js","/assets/user-check-BKQYFrm0.js","/assets/refresh-cw-DdaqKvMH.js","/assets/x-Dixrgw9-.js","/assets/search-Dzsy1E01.js","/assets/map-pin-BZMfsc7e.js","/assets/Support-B_W7n4gc.js","/assets/send-B8k78Vgc.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-C1DCCBYG.js","/assets/siren-Da3kZ03g.js","/assets/shield-alert-CygJG0qR.js","/assets/clipboard-check-BX6ng7Lq.js","/assets/circle-check-Dz2n_yl_.js","/assets/radio-Cgj9GCH1.js","/assets/octagon-alert-_aKoy7fp.js","/assets/life-buoy-DZfQvSCC.js","/assets/phone-call-DmQK8Sju.js","/assets/plus-BKRoXQdy.js","/assets/translations-quTRLGt9.js","/assets/web-C_xxdWVf.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Bccml-Bs.js"];

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