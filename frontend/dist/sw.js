const CACHE_NAME = 'minesight-offline-v' + 1790947117394;
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-Dmyx77kK.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-juDSsCbB.js","/assets/Layout-BhZKZ9Zr.js","/assets/HomePage-by8We7C1.js","/assets/sun-G9UiJppZ.js","/assets/Login-DThcRbwN.js","/assets/languages-DEF7HHsp.js","/assets/Register-BMK7_bPE.js","/assets/recaptcha-wrapper-BMEJ6zAW.js","/assets/BrandLogo-Cnw8ccSx.js","/assets/Dashboard-C782Gwgv.js","/assets/clipboard-list-C9YSWhD2.js","/assets/building-2-I_sZj7Aa.js","/assets/Inspections-0YVflVyU.js","/assets/CreateInspection-lFLw17OU.js","/assets/arrow-right-B-oL8OUA.js","/assets/InspectionDetail-dcHhHchu.js","/assets/file-text-1DUJhRAe.js","/assets/loader-circle-DOfiOQEz.js","/assets/zoom-out-B_55ssrS.js","/assets/Compliances-DdCM22PP.js","/assets/Mines-Dp-rjMZA.js","/assets/hooks-BWfuHUQY.js","/assets/leafletAssets-DXoOkZoD.js","/assets/MineralResourcesDashboard-BInEHqr6.js","/assets/Contractors-CHhfl_bE.js","/assets/Alerts-D3kID8ti.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DJFz4wvv.js","/assets/PieChart-CXAgHXnr.js","/assets/index-DrMnZ8av.js","/assets/Chat-C3dbZxvF.js","/assets/bot-DKyeJsSb.js","/assets/mic-D6e2wSQd.js","/assets/shield-check-tjIcu9xx.js","/assets/Profile-CdrZk4FC.js","/assets/circle-user-BQMoqFou.js","/assets/arrow-left-DooHITXF.js","/assets/Workers-CrnOMCdy.js","/assets/users-Bg6vpQvG.js","/assets/bell-DvpjmTo4.js","/assets/save-Bo97nF9v.js","/assets/Attendance-Bb0nfkX1.js","/assets/log-out-ChOm5wSD.js","/assets/shield-CLrZGkCX.js","/assets/user-check-BBy2vaAV.js","/assets/refresh-cw-DReyIk4w.js","/assets/x-DeFd4h9l.js","/assets/search-D1cgc0Gn.js","/assets/map-pin-CQTPRLcX.js","/assets/Support-CsJP9ksq.js","/assets/chevron-down-DjQb27IJ.js","/assets/send-CVtPG3kT.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CyYzpyNC.js","/assets/siren-DXfXjmNf.js","/assets/shield-alert-DkNOSbe-.js","/assets/clipboard-check-DhRrOvvM.js","/assets/circle-check-BvfxIpln.js","/assets/radio-BUAd4VCC.js","/assets/octagon-alert-BBOdR_0c.js","/assets/life-buoy-Blv7DFVn.js","/assets/phone-call-DIhiiwZv.js","/assets/plus-D855Gf2d.js","/assets/translations-CmXZgOBw.js","/assets/web-DSaDyVDM.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-D_BZpT3s.js"];

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