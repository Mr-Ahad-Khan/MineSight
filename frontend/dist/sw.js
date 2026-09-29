const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-tbXelhhz.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DVH1MUBE.js","/assets/Layout-7E6FoUUA.js","/assets/HomePage-CHBq_AHy.js","/assets/sun-lfhPbunQ.js","/assets/Login-DmKZoifs.js","/assets/languages-cUOmKHSK.js","/assets/Register-Bvf1gG1s.js","/assets/recaptcha-wrapper-CEr-GNai.js","/assets/BrandLogo-C0V8Cnxy.js","/assets/Dashboard-CiCxsJDN.js","/assets/clipboard-list-quQJLN8s.js","/assets/building-2-DHmGAQwu.js","/assets/Inspections-Dnzi5AXO.js","/assets/CreateInspection-CeQDCLBb.js","/assets/arrow-right-B8KLunyw.js","/assets/InspectionDetail-DO1Pg11V.js","/assets/file-text-BCYou-Oi.js","/assets/loader-circle-K84sf6zm.js","/assets/trash-2-Bvf0fKDu.js","/assets/Compliances-Dr8PLZ9t.js","/assets/Mines-CvVYyVMC.js","/assets/hooks-DISdG3iK.js","/assets/leafletAssets-DVP01NxJ.js","/assets/Contractors-MTW3WdCq.js","/assets/Alerts-_yKYgKcl.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BgP12SyT.js","/assets/index-BZjjUIDt.js","/assets/Chat-BcxiHUEH.js","/assets/bot-Ckg2_hXX.js","/assets/shield-check-Z5uoHdLh.js","/assets/mic-CLd6wUS8.js","/assets/Profile-jmzevz5X.js","/assets/circle-user-IPAoCk_f.js","/assets/arrow-left-CAIMMV0n.js","/assets/translations-dTjUQ25p.js","/assets/Workers-CTKZHVx4.js","/assets/users-BbvrQ50f.js","/assets/bell-5egZFOtx.js","/assets/save-CU01kZma.js","/assets/Attendance-QVlS7JVg.js","/assets/log-out-BS-WElsh.js","/assets/shield-Cgt2pSPT.js","/assets/user-check-Zo7t7iXa.js","/assets/search-BqgRTL9V.js","/assets/x-D0GvAWtM.js","/assets/map-pin-D83E7-fT.js","/assets/Support-BHBH3Ioi.js","/assets/send-MJ0IMrxm.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-C30FkEZV.js","/assets/siren-kxYfyA0p.js","/assets/shield-alert-B1LCl4ZD.js","/assets/clipboard-check-4Ii_OFxj.js","/assets/circle-check-C45CC_NJ.js","/assets/radio-Dg5IOt3P.js","/assets/octagon-alert-DfM-c7jl.js","/assets/life-buoy-Ct-BpoBx.js","/assets/phone-call-D95sbjGf.js","/assets/plus-ujzYY2LY.js","/assets/web-B0DdpBTE.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-C1gLOEUt.js"];

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