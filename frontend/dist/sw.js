const CACHE_NAME = 'minesight-offline-v' + 1790945891559;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index--ZLojB1-.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Dmm2dCqx.js","/assets/Layout-DP_3RIe7.js","/assets/HomePage-CDJ3iuhB.js","/assets/sun-C9boRmvS.js","/assets/Login-dbVYqpS4.js","/assets/languages-DLAVGC6P.js","/assets/Register-BP0skurM.js","/assets/recaptcha-wrapper-Brcwv7iO.js","/assets/BrandLogo-CwHE2VZg.js","/assets/Dashboard-Bdt1eKtP.js","/assets/clipboard-list-DjzuG4PO.js","/assets/building-2-D3uF_Dog.js","/assets/Inspections-gOuAAD1w.js","/assets/CreateInspection-BNq3T5re.js","/assets/arrow-right-D_tyXibo.js","/assets/InspectionDetail-g-Zpp2tG.js","/assets/file-text-CUz_6rL3.js","/assets/loader-circle-CG9ch0FY.js","/assets/zoom-out-CGE25Zad.js","/assets/Compliances-wUa90MS4.js","/assets/Mines-BAVo2iyd.js","/assets/hooks-MNe8ZJ5f.js","/assets/leafletAssets-Bg1CEFze.js","/assets/MineralResourcesDashboard-BklnL0e4.js","/assets/Contractors-BdUyFBz2.js","/assets/Alerts-u2_lcXJF.js","/assets/hi-BiADQGDV.js","/assets/Analytics-C9FnUHr3.js","/assets/PieChart-Ce7UROL9.js","/assets/index-CyfoIgCV.js","/assets/Chat-QN0S87Lv.js","/assets/bot-DySJK_0a.js","/assets/mic-DEISkkhm.js","/assets/shield-check-T9kKljXN.js","/assets/Profile-BagjQ9La.js","/assets/circle-user-DnuPiYOA.js","/assets/arrow-left-WOn-G72o.js","/assets/Workers-zQeN574G.js","/assets/users-CLkjqFK-.js","/assets/bell-DlvdvCIX.js","/assets/save-l-fzXfB_.js","/assets/Attendance-DVCQMbk1.js","/assets/log-out-DcSxDEnj.js","/assets/shield-BNtwc0M8.js","/assets/user-check-B1mNEya6.js","/assets/refresh-cw-CVOFhWEw.js","/assets/x-DYS8fEap.js","/assets/search-Dd5HCbEm.js","/assets/map-pin-Bkq4NB7m.js","/assets/Support-KZ2aX_Ec.js","/assets/chevron-down-feDuRJ7A.js","/assets/send-PH1mAiUC.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CvxjP7uR.js","/assets/siren-BUGTRkdY.js","/assets/shield-alert-Bu-hbbEN.js","/assets/clipboard-check-B4URJIQI.js","/assets/circle-check-0mFMWcdX.js","/assets/radio-DT_xFCoW.js","/assets/octagon-alert-Bh_dFSio.js","/assets/life-buoy-pf1RLMnb.js","/assets/phone-call-Bc3Bb0Fv.js","/assets/plus-B52TYKn3.js","/assets/translations-CmXZgOBw.js","/assets/web-0RooLbUq.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-C6cbE7cK.js"];

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