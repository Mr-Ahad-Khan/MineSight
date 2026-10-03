const CACHE_NAME = 'minesight-offline-v' + 1791035777614;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DeOMy4ny.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BMsDnARP.js","/assets/Layout-CxQ6GjKO.js","/assets/HomePage-uT6xFI9V.js","/assets/sun-CGBaP-Ib.js","/assets/Login-DHA0u_ug.js","/assets/languages-CIwSb5cV.js","/assets/Register-DuaqK4wX.js","/assets/recaptcha-wrapper-BMJ9BDR3.js","/assets/BrandLogo-7BLI6pxa.js","/assets/Dashboard-DQyimtky.js","/assets/clipboard-list-CKJwldEp.js","/assets/building-2-DqDAPCy-.js","/assets/Inspections-BGRvblWw.js","/assets/CreateInspection-jhnFB3SE.js","/assets/InspectionDetail-BKCqvo2f.js","/assets/circle-check-big-Du8O__hf.js","/assets/imageCompressor-Dz1Lsee6.js","/assets/zoom-out-M2l-5W51.js","/assets/Compliances-0fcaYnlE.js","/assets/Mines-B0IRym1A.js","/assets/hooks-1j1b2UEC.js","/assets/leafletAssets-DIfLn1S0.js","/assets/MineralResourcesDashboard-DEwS3Fs5.js","/assets/loader-circle-VmWdwaBt.js","/assets/Contractors-HDwhNfIC.js","/assets/Alerts-KlXZqkJ8.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DMJMmp5D.js","/assets/PieChart-DWhNGAs4.js","/assets/index-iQE0ujQt.js","/assets/Chat-B3su6huZ.js","/assets/bot-DvIIImGE.js","/assets/mic-DnaamDWJ.js","/assets/shield-check-BZszyrUK.js","/assets/Profile-436hrnHN.js","/assets/circle-user-BGiae9n_.js","/assets/camera-2EAJdgpu.js","/assets/arrow-left-BfpVIKzm.js","/assets/Workers-Cbqed5mz.js","/assets/users-CqxLgpRx.js","/assets/bell-DJZZUn0j.js","/assets/save-6zUrJQYP.js","/assets/Attendance-Bm2Sd2Dx.js","/assets/log-out-D0NBSyM0.js","/assets/shield-IXqVAsoS.js","/assets/user-check-DJz6RRYM.js","/assets/refresh-cw-DPkjov6l.js","/assets/search-Tq_xxQLR.js","/assets/x-DgOUCipk.js","/assets/map-pin-CVQ0a8fH.js","/assets/TableScrollContainer-CqAlyns7.js","/assets/arrow-right-BLsILJ0E.js","/assets/Support-DfcK0lvr.js","/assets/chevron-down-t67QV4jE.js","/assets/send-0XbZi4BD.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-bpuOE4qq.js","/assets/siren-CG3H-VG8.js","/assets/shield-alert-32oW0PDd.js","/assets/clipboard-check-ByC-ECGM.js","/assets/circle-check-CssYV_1P.js","/assets/radio-D_yRwO1c.js","/assets/octagon-alert-D6eutVUP.js","/assets/life-buoy-CQ0JcYLz.js","/assets/phone-call-DZbBzcP4.js","/assets/plus-D6gHPj-r.js","/assets/translations-acmd7qdg.js","/assets/web--wKGVIjb.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DISem51o.js"];

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