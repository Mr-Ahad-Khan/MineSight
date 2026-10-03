const CACHE_NAME = 'minesight-offline-v' + 1791039470619;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-Ceg5WRlP.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DB2ePP_v.js","/assets/Layout-BjcmvSa2.js","/assets/HomePage-m8NEd89L.js","/assets/sun-BxOthn8T.js","/assets/Login-Bokdb-7B.js","/assets/languages-caw_in-g.js","/assets/Register-DtYsu8Pt.js","/assets/ReCAPTCHA-DpyvdzlW.js","/assets/BrandLogo-CoNEESoa.js","/assets/Dashboard-BovoCTml.js","/assets/clipboard-list-BY5Wl8Q-.js","/assets/building-2-CWfo8tln.js","/assets/Inspections-CELu0qPY.js","/assets/CreateInspection-bwOwAUTu.js","/assets/InspectionDetail--DsdVWT6.js","/assets/circle-check-big-hyELVpLH.js","/assets/imageCompressor-CXGZWVu5.js","/assets/zoom-out-BV9Nh1ZO.js","/assets/Compliances-BontifbA.js","/assets/Mines-9vGyuS3v.js","/assets/hooks-B4ALersZ.js","/assets/leafletAssets-B3a_CYny.js","/assets/MineralResourcesDashboard-DVW3DSXP.js","/assets/loader-circle-SHwpWo5A.js","/assets/Contractors-y2i1OPHT.js","/assets/Alerts-Gr9DtNfi.js","/assets/hi-BiADQGDV.js","/assets/Analytics-B7iMDZgi.js","/assets/PieChart-DG0NiH91.js","/assets/Chat-DRjV3MNy.js","/assets/bot-urICqfaa.js","/assets/mic-_JXmDGRe.js","/assets/shield-check-Bkr82iUG.js","/assets/chevron-right-BA7e93r3.js","/assets/Profile-BMAspt7o.js","/assets/circle-user-DK_Xirtx.js","/assets/camera-CqybxT8M.js","/assets/arrow-left-CPx8kYbz.js","/assets/Workers-DiI4YJaH.js","/assets/users-CSt-qtNv.js","/assets/bell-IoPCiz66.js","/assets/save-nFNpfXCR.js","/assets/Attendance-DY194WEV.js","/assets/log-out-0AmpZ8ie.js","/assets/shield-CE_pr9QJ.js","/assets/user-check-DIUQ394C.js","/assets/refresh-cw-CTo1Zf-D.js","/assets/search-Bh1CEfmG.js","/assets/x-DSq33RVs.js","/assets/map-pin-Dy3s6SZg.js","/assets/TableScrollContainer-DQMYbUZC.js","/assets/arrow-right-hHLs6_p0.js","/assets/Support-2fKEyznN.js","/assets/chevron-down-BWyj15Vn.js","/assets/send-CTPOX72T.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-VH-PsilO.js","/assets/siren-i0EVbs10.js","/assets/shield-alert-CEjuJxqz.js","/assets/clipboard-check-PxmZdN4a.js","/assets/circle-check-Ckhy-MQe.js","/assets/radio-BQ0OmKGa.js","/assets/octagon-alert-BFBCqEkD.js","/assets/life-buoy-CYybM7qa.js","/assets/phone-call-D8YMuU9j.js","/assets/plus-B5c_VZYh.js","/assets/translations-B-iC4Mkf.js","/assets/web-BFeBVbpU.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-2S5dGUHM.js"];

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