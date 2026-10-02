const CACHE_NAME = 'minesight-offline-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-DEZlG04r.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DXNTwxJV.js","/assets/Layout-DcBSQUIV.js","/assets/HomePage-BIZ_Atll.js","/assets/sun-C56Zr1Ro.js","/assets/Login-BLwtS6vY.js","/assets/languages-kWHm6TVG.js","/assets/Register-ITcytQ0z.js","/assets/recaptcha-wrapper-COXnxmkg.js","/assets/BrandLogo-ChTBed9S.js","/assets/Dashboard-yKEqKhQG.js","/assets/clipboard-list-BxuSGCRO.js","/assets/building-2-DIvDFwGh.js","/assets/Inspections-BtnCdk9I.js","/assets/CreateInspection-DZZk_8Rr.js","/assets/arrow-right-BcW3RiEA.js","/assets/InspectionDetail-Bi-Ie6J6.js","/assets/file-text-Bplre195.js","/assets/loader-circle-BOTbW3tx.js","/assets/zoom-out-D9uFgttk.js","/assets/Compliances-5aB4vF-b.js","/assets/Mines-Br70fGUX.js","/assets/hooks-BMfxDvVz.js","/assets/leafletAssets-DGAcfGff.js","/assets/MineralResourcesDashboard-lV7xqpcL.js","/assets/Contractors-DiL6F4w1.js","/assets/Alerts-T2NMQLPl.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CgUpLr7F.js","/assets/PieChart-DtPsJyiM.js","/assets/index-CQ-PsZoB.js","/assets/Chat-DSkMptAp.js","/assets/bot-XPTDUl1J.js","/assets/mic-l2S8sVaS.js","/assets/shield-check-jMtGl-cW.js","/assets/Profile-CLE6a3H6.js","/assets/circle-user-Bgr0W2Yu.js","/assets/arrow-left-CoTXkZ3A.js","/assets/Workers-dDCMyd9J.js","/assets/users-BxakhuGs.js","/assets/bell-Bs1OkUVZ.js","/assets/save-CExqQWcr.js","/assets/Attendance-BfUZIsCV.js","/assets/log-out-DinykV1c.js","/assets/shield-B0F3agNm.js","/assets/user-check-CmiQJiq_.js","/assets/refresh-cw-D_bZ7OPz.js","/assets/x-R-nJMtjg.js","/assets/search-2pMH4T1_.js","/assets/map-pin-BCsHgE9V.js","/assets/Support-BM0TPjXs.js","/assets/chevron-down-DcjAHXro.js","/assets/send-DLhiL5iu.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BEHlqj2l.js","/assets/siren-C1Zf0ZyX.js","/assets/shield-alert-nw-Bau2d.js","/assets/clipboard-check-OJ_Agi9J.js","/assets/circle-check-B-mnnemN.js","/assets/radio-DzkZ7OEK.js","/assets/octagon-alert-ChK3Trxp.js","/assets/life-buoy-DI3-n4XT.js","/assets/phone-call-ZvwIGbLy.js","/assets/plus-BbEWAVwd.js","/assets/translations-CmXZgOBw.js","/assets/web-DcwR8bTN.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-ClaMZCRB.js"];

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