const CACHE_NAME = 'minesight-offline-v1';
<<<<<<< HEAD
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-BRpUiPmV.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-D-RMcW2n.js","/assets/Layout-CuTCaXZc.js","/assets/HomePage-De3-89pc.js","/assets/sun-1TCC1_D-.js","/assets/Login-KcaIiccg.js","/assets/languages-BxXA85Lq.js","/assets/Register-Cf_p09Ha.js","/assets/recaptcha-wrapper-B7inSku7.js","/assets/BrandLogo-CXkD0lKk.js","/assets/Dashboard-DWWBdFAy.js","/assets/clipboard-list-PscHXhWw.js","/assets/building-2-CQCBRT4E.js","/assets/Inspections-CUwq0ELN.js","/assets/CreateInspection-C-dhbs28.js","/assets/arrow-right-DCGpVbdG.js","/assets/InspectionDetail-DDeyKBYL.js","/assets/file-text-ITTByHeB.js","/assets/loader-circle-DrbUsSby.js","/assets/zoom-out-Cs3Q2MRI.js","/assets/Compliances-C3NM4YAY.js","/assets/Mines-q9P3tsRV.js","/assets/hooks-BKelXXbO.js","/assets/leafletAssets-B3RMTBBn.js","/assets/MineralResourcesDashboard-DTMSjDrp.js","/assets/Contractors-DyI9pEhs.js","/assets/Alerts-C04uk2hX.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CIYDsE7n.js","/assets/PieChart-DFythRMS.js","/assets/index-B2DOIWD9.js","/assets/Chat-BOlEnEb2.js","/assets/bot-EncX15KS.js","/assets/mic-BaZ-JSpX.js","/assets/shield-check-CMA0pU1D.js","/assets/Profile-ubofH5fl.js","/assets/circle-user-Cl_b8g4r.js","/assets/arrow-left-CfLo0b86.js","/assets/translations-ll4_NWuA.js","/assets/Workers-CT3J8s5G.js","/assets/users-1uxNp2HV.js","/assets/bell-DzCgSXlG.js","/assets/save-CeOy-Phj.js","/assets/Attendance-BYc77eiL.js","/assets/log-out-C366c-Vy.js","/assets/shield-CqiAQlcp.js","/assets/user-check-mX6etxD-.js","/assets/refresh-cw-h4HbocAT.js","/assets/x-BZHZuti1.js","/assets/search-CMS1qDGv.js","/assets/map-pin-DrB106Dl.js","/assets/Support-Lrw2iX2r.js","/assets/send-OBq4UcYI.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-ZDwLSTox.js","/assets/siren-GWSI8Rum.js","/assets/shield-alert-DQN42Ban.js","/assets/clipboard-check-CUhAUKPu.js","/assets/circle-check-BRwi8laz.js","/assets/radio-DTT82Pl9.js","/assets/octagon-alert-ENYe-mLU.js","/assets/life-buoy-CjUFhGiL.js","/assets/phone-call-HVA-a1aT.js","/assets/plus-BaNYWQvl.js","/assets/web-B0D6T5C5.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BLhVDJG1.js"];
=======
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-CPvirMlX.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-CAMI7djg.js","/assets/Layout-C_KggijE.js","/assets/HomePage-Dr7ienFB.js","/assets/sun-CSAFPOAm.js","/assets/Login-OtUvzLXY.js","/assets/languages-BjHti0nO.js","/assets/Register-CnO2K92O.js","/assets/recaptcha-wrapper-DVGmBUkq.js","/assets/BrandLogo-Dl54niuv.js","/assets/Dashboard-iQ7q6-70.js","/assets/clipboard-list-CbP63aKl.js","/assets/building-2-BpfT_5pq.js","/assets/Inspections-Do5GiLHE.js","/assets/CreateInspection-YrpROSBn.js","/assets/arrow-right-3kdWgWLX.js","/assets/InspectionDetail-DPYoxh-E.js","/assets/file-text-CWdAlhCq.js","/assets/loader-circle-DKZfANcH.js","/assets/zoom-out-CdyxgmkU.js","/assets/Compliances-D65WBjZ6.js","/assets/Mines-CiHzr5Cl.js","/assets/hooks-kVgJSPvZ.js","/assets/leafletAssets-DuM30eLb.js","/assets/MineralResourcesDashboard-BwZxlcIA.js","/assets/Contractors-DtWmCQLs.js","/assets/Alerts-qTfsltGH.js","/assets/hi-BiADQGDV.js","/assets/Analytics-ByOy2Ml3.js","/assets/PieChart-BqsAqW1u.js","/assets/index-D1s-56UQ.js","/assets/Chat-DJjQu-xt.js","/assets/bot-CLNa_U1H.js","/assets/mic-BZob6uL5.js","/assets/shield-check-Dc-KW_2z.js","/assets/Profile-4927MpZ6.js","/assets/circle-user-D6_ek6aR.js","/assets/arrow-left-RVFx80sS.js","/assets/translations-dTjUQ25p.js","/assets/Workers-Dp0WQtwU.js","/assets/users-DWBaAmww.js","/assets/bell-DWLmKDaj.js","/assets/save-Bu_06HPV.js","/assets/Attendance-DGZ8nKBh.js","/assets/log-out-DQFewvB-.js","/assets/shield-COJPtouy.js","/assets/user-check-Dw7-TBu1.js","/assets/refresh-cw-kMRxkaO6.js","/assets/x-BDt1kIJU.js","/assets/search-C4t7T0-e.js","/assets/map-pin-CokXAt-9.js","/assets/Support-B_j5_zuh.js","/assets/send-BKGvfz7a.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-HJwv58ha.js","/assets/siren-DoPyzdYM.js","/assets/shield-alert-BUcO12Q9.js","/assets/clipboard-check-TVuA5zp8.js","/assets/circle-check-BmN3eKuK.js","/assets/radio-hLa6A0GA.js","/assets/octagon-alert-zIUWbsJT.js","/assets/life-buoy-DqtEtkKj.js","/assets/phone-call-DHFWYQi1.js","/assets/plus-CG-p52tQ.js","/assets/web-wn-fPQat.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CbqEJzVj.js"];
>>>>>>> cb475083dc89b4ebcc03406caf4bfad62d618468

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