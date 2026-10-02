const CACHE_NAME = 'minesight-offline-v' + 1790950150106;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BrTehDFo.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Cn__K6d6.js","/assets/Layout-NQy74sAl.js","/assets/HomePage-BgB8vALV.js","/assets/sun-CopLtzmG.js","/assets/Login-DZ5WHxQI.js","/assets/languages-DDGm_R1i.js","/assets/Register-DdrUfkzW.js","/assets/recaptcha-wrapper-yBJsLjtn.js","/assets/BrandLogo-GUspxaXj.js","/assets/Dashboard-hEITPc8k.js","/assets/clipboard-list-Cf3XVtGz.js","/assets/building-2-DUe_YTHi.js","/assets/Inspections-CsfjZAZH.js","/assets/CreateInspection-CJN140tv.js","/assets/InspectionDetail-CkV-5Y_9.js","/assets/file-text-DKgo-oPb.js","/assets/loader-circle-Dq5l-U5I.js","/assets/zoom-out-D9y_JpSh.js","/assets/Compliances-D0oF1EVX.js","/assets/Mines-Dq14nv4y.js","/assets/hooks-C74wL1jv.js","/assets/leafletAssets-B91I8n_z.js","/assets/MineralResourcesDashboard-MVDQ1foZ.js","/assets/Contractors-X1hK9ke8.js","/assets/Alerts--Fp1nUk0.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BOSWYbyD.js","/assets/PieChart-BWA2fU_f.js","/assets/index-Jrl5GDmY.js","/assets/Chat-CGNO4SU5.js","/assets/bot-CReLU9BK.js","/assets/mic-9nkU1jiU.js","/assets/shield-check-B9wmcoz1.js","/assets/Profile-CUISnS3f.js","/assets/circle-user-Cz0Ysa2F.js","/assets/arrow-left-CDBtV0Ie.js","/assets/Workers-0REYkmJq.js","/assets/users-CnYCxqRI.js","/assets/bell-C04cunDv.js","/assets/save-CDRHpM0-.js","/assets/Attendance-CzOl5Ic5.js","/assets/log-out-Xg_3kc3Q.js","/assets/shield-CGiwn0ad.js","/assets/user-check-Cc8WglJj.js","/assets/refresh-cw-D1rmApve.js","/assets/x-zMPkSeE5.js","/assets/search-CdQ6QjjV.js","/assets/map-pin-ByhNS4FZ.js","/assets/TableScrollContainer-D_FMDPzI.js","/assets/arrow-right--T7KBCbI.js","/assets/Support-DR4452FU.js","/assets/chevron-down-DECU8HVf.js","/assets/send--i97HZqM.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BfxiSjWI.js","/assets/siren-CStC9DFZ.js","/assets/shield-alert-BmPyv_Ah.js","/assets/clipboard-check-CJqc3cCG.js","/assets/circle-check-BrdE9rwV.js","/assets/radio-CQuEim1g.js","/assets/octagon-alert-BSDkSoHJ.js","/assets/life-buoy-BUfFJXGS.js","/assets/phone-call-CgPgTP5s.js","/assets/plus-B3bI9roY.js","/assets/translations-DbrZn9zW.js","/assets/web-BHi81mnA.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-D0-J_c1j.js"];

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