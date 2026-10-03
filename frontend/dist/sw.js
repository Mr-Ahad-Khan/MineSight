const CACHE_NAME = 'minesight-offline-v' + 1791012942880;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-B-jRMSST.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-1UTzwnHz.js","/assets/Layout-Bcn915XZ.js","/assets/HomePage-B5so0zAO.js","/assets/sun-9vLdASyy.js","/assets/Login-7suieiAn.js","/assets/languages-C68JWAdN.js","/assets/Register-DCdXklc4.js","/assets/recaptcha-wrapper-Bs5kjaNz.js","/assets/BrandLogo-D2voyXDz.js","/assets/Dashboard-DcOAkQE0.js","/assets/clipboard-list-irTd0Rxc.js","/assets/building-2-OdZMs5LY.js","/assets/Inspections-DwIw4Sjq.js","/assets/CreateInspection-DmipNo5b.js","/assets/InspectionDetail-BOOOTguw.js","/assets/file-text-PhNaGHwS.js","/assets/loader-circle-Cb6KfZro.js","/assets/zoom-out-d6oPjnJY.js","/assets/Compliances-Brp1VGZP.js","/assets/Mines-B08v5fQs.js","/assets/hooks-I-eWdR0N.js","/assets/leafletAssets-wXVSa94b.js","/assets/MineralResourcesDashboard-DBe3pddP.js","/assets/Contractors-B77mfo7K.js","/assets/Alerts-BW-cPlTl.js","/assets/hi-BiADQGDV.js","/assets/Analytics-JFYpQ_6Q.js","/assets/PieChart-DnxnscWt.js","/assets/index-C7Gq3jzn.js","/assets/Chat-CORjfgdj.js","/assets/bot-CDgH8Gpi.js","/assets/mic-3fPP2rOu.js","/assets/shield-check-Cej5-W4-.js","/assets/Profile-BjuGBMn6.js","/assets/circle-user-Bs8vQ3DW.js","/assets/arrow-left-D_8g6N0J.js","/assets/Workers-B6w5-2-V.js","/assets/users-BgYO6ceI.js","/assets/bell-MOKrJsF8.js","/assets/save-D8umE42q.js","/assets/Attendance-8z8bHnyn.js","/assets/log-out-CWsO-bJ0.js","/assets/shield-CNhex9RW.js","/assets/user-check-Cl9FFnmV.js","/assets/refresh-cw-DQy3mWU7.js","/assets/x-Ce7zU7te.js","/assets/search-BYbANhVq.js","/assets/map-pin-7Y0lHru6.js","/assets/TableScrollContainer-MoAguktN.js","/assets/arrow-right-CCBcU8QE.js","/assets/Support-DBF81KF5.js","/assets/chevron-down-C9pHGLfE.js","/assets/send-B-82RKMw.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BNaYNLNP.js","/assets/siren-yp7piFQN.js","/assets/shield-alert-ChYix1nR.js","/assets/clipboard-check-DuRnRhkV.js","/assets/circle-check-XWxI7zKG.js","/assets/radio-BDNQ-EVM.js","/assets/octagon-alert-CFKJtyPY.js","/assets/life-buoy-CJB9umKb.js","/assets/phone-call-PHn7CpC3.js","/assets/plus-DTrmIYGE.js","/assets/translations-DbrZn9zW.js","/assets/web-C4PUZcal.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Dfx_6lj4.js"];

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