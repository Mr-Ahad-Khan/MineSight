const CACHE_NAME = 'minesight-offline-v' + 1791037094014;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-C0iww7lC.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Dr_go5GV.js","/assets/Layout-B86eLI5O.js","/assets/HomePage-v0aeZd49.js","/assets/sun-CrzimJxi.js","/assets/Login-BRCzt6WV.js","/assets/languages-DATF5vhW.js","/assets/Register-BZGpf57N.js","/assets/ReCAPTCHA-BDn66wR5.js","/assets/BrandLogo-BgPMpEcu.js","/assets/Dashboard-BlODVjlY.js","/assets/clipboard-list-DfCOZccp.js","/assets/building-2-2HNWmXO9.js","/assets/Inspections-OTlo3V0D.js","/assets/CreateInspection-CyrEwUEb.js","/assets/InspectionDetail-BlojYC5-.js","/assets/circle-check-big-BqAWZzWv.js","/assets/imageCompressor-bUvOzsGy.js","/assets/zoom-out-TlUbddJE.js","/assets/Compliances-hq3iJCsC.js","/assets/Mines-dxUa0wMH.js","/assets/hooks-T3CH0QCR.js","/assets/leafletAssets-30Qu0ywW.js","/assets/MineralResourcesDashboard-DBFgkU_V.js","/assets/loader-circle-BGKtByJq.js","/assets/Contractors-CHsszZ_f.js","/assets/Alerts-Lujp42Hn.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CL9iXuO9.js","/assets/PieChart-D2gMlB-A.js","/assets/Chat-BQrN7jfW.js","/assets/bot-DHrRlhKA.js","/assets/mic-nIyZ-g70.js","/assets/shield-check-BTC1qcVN.js","/assets/chevron-right-E20bIlrf.js","/assets/Profile-B_774ZHZ.js","/assets/circle-user-C90b2TOS.js","/assets/camera-B1CLcrFO.js","/assets/arrow-left-Ch-iIJ6n.js","/assets/Workers-cIyi62Zp.js","/assets/users-MgYtsVVs.js","/assets/bell-DSsLvRoZ.js","/assets/save-njPMQhG4.js","/assets/Attendance-COsknGGW.js","/assets/log-out-D3ONy8mB.js","/assets/shield-D2ixY1SL.js","/assets/user-check-MIuLhrhj.js","/assets/refresh-cw-Du_6LQFv.js","/assets/search-BF3n9QnX.js","/assets/x-CJoT6HQW.js","/assets/map-pin-BtQIQIrf.js","/assets/TableScrollContainer-B43MNxz7.js","/assets/arrow-right-W3RoJAiC.js","/assets/Support-C6b4NG4a.js","/assets/chevron-down-uWxQxHUq.js","/assets/send-CdWQDtSY.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DjNefG-w.js","/assets/siren-DXxw5iVx.js","/assets/shield-alert-Vl399tdg.js","/assets/clipboard-check-NrDihCqa.js","/assets/circle-check-BC1x1Gum.js","/assets/radio-CdW2-dmT.js","/assets/octagon-alert-jiS4Y3a6.js","/assets/life-buoy-KGaj_MzL.js","/assets/phone-call-BVnfoyrJ.js","/assets/plus-CjGOq5GB.js","/assets/translations-acmd7qdg.js","/assets/web-DyENaHI5.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-D7vHn1-l.js"];

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