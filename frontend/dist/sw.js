const CACHE_NAME = 'minesight-offline-v2';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CQLEz7W5.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CYFmqBqI.js","/assets/Layout-Dz7aHV8X.js","/assets/HomePage-BGTdXCC_.js","/assets/sun-HL9-rAhe.js","/assets/Login-C7r0XH3p.js","/assets/languages-C_Eb-RIl.js","/assets/Register-CABba1_v.js","/assets/recaptcha-wrapper-DDGvl0wV.js","/assets/BrandLogo-DzVsXLo3.js","/assets/Dashboard--E1nB82c.js","/assets/clipboard-list-BgC-qXlX.js","/assets/building-2-DbQVhGYg.js","/assets/Inspections-CqhLks11.js","/assets/CreateInspection-bj2SOGzv.js","/assets/arrow-right-ebM86pp0.js","/assets/InspectionDetail-JhpaLVA1.js","/assets/file-text-BWfIa_Od.js","/assets/loader-circle-6Fi3tdez.js","/assets/trash-2-DdQEiOir.js","/assets/Compliances-CqH9OiXi.js","/assets/Mines-BZOrcLQg.js","/assets/hooks-ReKZkT-p.js","/assets/leafletAssets-CZ2v51sF.js","/assets/MineralResourcesDashboard-CygrcmY3.js","/assets/Contractors-DSvUOnLv.js","/assets/Alerts-hD142V9z.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BIHWtUDY.js","/assets/PieChart-CYgemctl.js","/assets/index-exls31ZA.js","/assets/Chat-BzDwd-dz.js","/assets/bot-BiW3rf52.js","/assets/mic-BPqVyyYC.js","/assets/shield-check-B2dDguL6.js","/assets/Profile-CdYpXQrE.js","/assets/circle-user-HjKlfjMd.js","/assets/arrow-left-CpZLeups.js","/assets/Workers-X5AZe3Z0.js","/assets/users-Banrj-F-.js","/assets/bell-DVdFBXV5.js","/assets/save-BGwX6R_v.js","/assets/Attendance-CFsCoIGB.js","/assets/log-out-hYIcey2o.js","/assets/shield-DPHz-c4v.js","/assets/user-check-eoANWsXI.js","/assets/refresh-cw-DwdEmzee.js","/assets/x-BMNTpXZi.js","/assets/search-CtBbp04a.js","/assets/map-pin-DQSvWajB.js","/assets/Support-DMZ-ljoA.js","/assets/send-Cs1JOl9j.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-C-_WF9mC.js","/assets/siren-BZ9_oxYY.js","/assets/shield-alert-URU8KB-Z.js","/assets/clipboard-check-lxj28Ln9.js","/assets/circle-check-DEdICMHl.js","/assets/radio-hN_mzRUI.js","/assets/octagon-alert-DVhZWCt1.js","/assets/life-buoy-Dsp6fx6Q.js","/assets/phone-call-D2Groq1Y.js","/assets/plus-ByP51CFV.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-yz75EzrP.js"];

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