const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CDgZCTQM.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DDdbZFEY.js","/assets/Layout-T6dxCGJU.js","/assets/HomePage-ByTnaW5i.js","/assets/sun-CPLylo59.js","/assets/Login-D4hcYTsL.js","/assets/languages-J9N2pnfO.js","/assets/Register-DhUHjS_0.js","/assets/recaptcha-wrapper-C8wBSTMf.js","/assets/BrandLogo-Bp2tzNhj.js","/assets/Dashboard-DTl9x2Rz.js","/assets/clipboard-list-hQ8MAPsl.js","/assets/building-2-D_0IOZ2_.js","/assets/Inspections-BSxpQc2U.js","/assets/CreateInspection-zhwqqjYo.js","/assets/arrow-right-DjWndsGo.js","/assets/InspectionDetail-lJQBEr6c.js","/assets/file-text-C9sDnP0b.js","/assets/loader-circle-CIRjvv28.js","/assets/zoom-out-B52pek4L.js","/assets/Compliances-BpU1-Jl7.js","/assets/Mines-BRVDmUms.js","/assets/hooks-D21OVkZC.js","/assets/leafletAssets-BO4WK2aX.js","/assets/MineralResourcesDashboard-B-vZCejA.js","/assets/Contractors-nGY4LZed.js","/assets/Alerts-DkZFxlHB.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BRwoZT3E.js","/assets/PieChart-BcSCJ109.js","/assets/index-DW2I5a4I.js","/assets/Chat-CwhyQmqK.js","/assets/bot-PhkGbOtA.js","/assets/mic-DD48hgtI.js","/assets/shield-check--WF5zCHl.js","/assets/Profile-Bi8FcW4J.js","/assets/circle-user-BpGn-L88.js","/assets/arrow-left-_1n1covW.js","/assets/Workers-CFxKorJg.js","/assets/users-rLqgSU4A.js","/assets/bell-BGpA7hVY.js","/assets/save-DxfJ_6CR.js","/assets/Attendance-C8IA9YNM.js","/assets/log-out-Bacgayu6.js","/assets/shield-Q_eKZ44U.js","/assets/user-check-D5e3UXOx.js","/assets/refresh-cw-DoSK8RbG.js","/assets/x-KiUi7PXJ.js","/assets/search-yKkpctIl.js","/assets/map-pin-CUc5PGuB.js","/assets/Support-Cll6OJcg.js","/assets/send-RDMJdomE.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-D8E_5_if.js","/assets/siren-BopqKHEz.js","/assets/shield-alert-DmwRAJyC.js","/assets/clipboard-check-v2WCp-lI.js","/assets/circle-check-BJ8zpxV3.js","/assets/radio-C2EB99M3.js","/assets/translations-D1mg6cwZ.js","/assets/octagon-alert-trFhNDAt.js","/assets/life-buoy-DX0rMzIp.js","/assets/phone-call-BiHRzAmj.js","/assets/plus-CMcG-SzW.js","/assets/web-3Ma-mAn1.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-re22pmxF.js"];

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