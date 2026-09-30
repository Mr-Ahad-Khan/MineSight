const CACHE_NAME = 'minesight-offline-v2';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CyS39i1g.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BIzW2Dfg.js","/assets/Layout-B4z7gLvm.js","/assets/HomePage-DJ9jVhhn.js","/assets/sun-DRK28sqH.js","/assets/Login-Ci2gu5zc.js","/assets/languages-CTJYGn_3.js","/assets/Register-CSQqN_gi.js","/assets/recaptcha-wrapper-ClnAMRB_.js","/assets/BrandLogo-DJJ4HMIe.js","/assets/Dashboard-DWPb0hur.js","/assets/clipboard-list-4DiUMUDd.js","/assets/building-2-Bi_Z2YjD.js","/assets/Inspections-BgbjaF8u.js","/assets/CreateInspection-BbLA57fz.js","/assets/arrow-right-Db3pR9bG.js","/assets/InspectionDetail-CHip46TY.js","/assets/file-text-CSF-nouj.js","/assets/loader-circle-Dp1OCI3L.js","/assets/trash-2-jSeXS6Ho.js","/assets/Compliances-DbxvXgJe.js","/assets/Mines--tJrlwK1.js","/assets/hooks-BitWCRuz.js","/assets/leafletAssets-DFTX9V7b.js","/assets/MineralResourcesDashboard-DRk79Tl5.js","/assets/Contractors-CbHPhhVq.js","/assets/Alerts-Bold3OiK.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BWuUrvLX.js","/assets/PieChart-C9bR5tjz.js","/assets/index-BNxF-pj7.js","/assets/Chat-C0lqDLph.js","/assets/bot-DWoeMdMS.js","/assets/mic-Brug1YC9.js","/assets/shield-check-DmE5KEyZ.js","/assets/Profile-BAointRa.js","/assets/circle-user-DD4o4qon.js","/assets/arrow-left-CSIG2OSc.js","/assets/Workers-BSd3gqLw.js","/assets/users-l8OOV56a.js","/assets/bell-Bszfp5TI.js","/assets/save-Dd10WQ_s.js","/assets/Attendance-Dh8VPtlJ.js","/assets/log-out-DFl1Zm__.js","/assets/shield-D4jnR1fQ.js","/assets/user-check-CZCWjDZ-.js","/assets/refresh-cw-LViWKyUS.js","/assets/x-UC-rv5lA.js","/assets/search-B5X0MUvP.js","/assets/map-pin-ef_I5keZ.js","/assets/Support-UYJp5orI.js","/assets/send-J2wejyPM.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-eZYfdCqC.js","/assets/siren-Bbh4xFk2.js","/assets/shield-alert-DCw5Cj0m.js","/assets/clipboard-check-CvEfDCuz.js","/assets/circle-check-DEXxWlyv.js","/assets/radio-CFoLSCCw.js","/assets/octagon-alert-S0kemPzB.js","/assets/life-buoy-C_ZBjWzB.js","/assets/phone-call-BUAnoV4X.js","/assets/plus-BsnkuWPR.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Zzb_gxRl.js"];

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
      fetch(request).catch(() => caches.match('/index.html', { ignoreVary: true })),
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cachedResponse) => {
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