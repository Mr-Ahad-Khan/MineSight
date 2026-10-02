const CACHE_NAME = 'minesight-offline-v' + 1790955092821;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BrTehDFo.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Bee4Y9TF.js","/assets/Layout-AWiyrnTu.js","/assets/HomePage-C1qbVDDK.js","/assets/sun-CjS0E8Me.js","/assets/Login-CtTJlkML.js","/assets/languages--mcN0KP_.js","/assets/Register-qRg3DWvJ.js","/assets/recaptcha-wrapper-D-Nlzhq4.js","/assets/BrandLogo-ByXWQFiU.js","/assets/Dashboard-D821ri5E.js","/assets/clipboard-list-DSbVvr5N.js","/assets/building-2-D4o2-ps6.js","/assets/Inspections-BuoLeuqy.js","/assets/CreateInspection-D94NB5oa.js","/assets/InspectionDetail-CIsKDneE.js","/assets/file-text-D9bqDi56.js","/assets/loader-circle-DF6_rMiz.js","/assets/zoom-out-EhKnjg7K.js","/assets/Compliances-D0QzoHwE.js","/assets/Mines-D5fPw_zf.js","/assets/hooks-Dvjy1Xz5.js","/assets/leafletAssets-DjngIL5k.js","/assets/MineralResourcesDashboard-qgCb12wh.js","/assets/Contractors-3ktCMljP.js","/assets/Alerts-CNA7GKYG.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CT1YFTjQ.js","/assets/PieChart-BuIYshBc.js","/assets/index-hD2N1Gb0.js","/assets/Chat-B0z5ffT2.js","/assets/bot-DrzdT3q-.js","/assets/mic-Be5rqef8.js","/assets/shield-check-CtOKPaN3.js","/assets/Profile-Cz4hfV82.js","/assets/circle-user-D6_8OJ47.js","/assets/arrow-left-Dn_M2mNK.js","/assets/Workers-DkaZnacS.js","/assets/users-Bo0_nXN6.js","/assets/bell-HgbGJEHn.js","/assets/save-DMcugPzq.js","/assets/Attendance-CfzMy8G4.js","/assets/log-out-lc1Ot0X0.js","/assets/shield-DeVizxTt.js","/assets/user-check-gr0Dpb6l.js","/assets/refresh-cw-DWX_uP2r.js","/assets/x-CLE3yJQy.js","/assets/search-BZtRraT4.js","/assets/map-pin-D9OQ5cSh.js","/assets/TableScrollContainer-Bd7hUEMP.js","/assets/arrow-right-JyqBgBQI.js","/assets/Support-CrTUroVC.js","/assets/chevron-down-Bxw3LaHy.js","/assets/send-DTIwZ8wi.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DLfmDeC5.js","/assets/siren-DTTiNUh8.js","/assets/shield-alert-IUqnF1o-.js","/assets/clipboard-check-rwJCst7X.js","/assets/circle-check-DkikSYKb.js","/assets/radio-D53q2lmU.js","/assets/octagon-alert-l5AklFZZ.js","/assets/life-buoy-nhneAFJD.js","/assets/phone-call-JxkH9_Nj.js","/assets/plus-BJC4-w8N.js","/assets/translations-DbrZn9zW.js","/assets/web-CHgPKeKB.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CFA0Pb2D.js"];

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