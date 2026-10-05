const SHELL_CACHE = 'minesight-shell-v' + 1791187535754;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-BaWJiEVC.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BOrhCTHw.js","/assets/Layout-n0JzXPAK.js","/assets/HomePage-C3_hhmuB.js","/assets/sun-CY8vayHV.js","/assets/Login-QYCb6_WL.js","/assets/languages-BwMrFH1L.js","/assets/Register-BDPVPdv9.js","/assets/ReCAPTCHA-DjaV8gAL.js","/assets/BrandLogo-CaKLA9vg.js","/assets/CreateInspection-BQWs-cQj.js","/assets/eye-JhqC-Rtm.js","/assets/Inspections-CSMGim_U.js","/assets/Dashboard-Db7JNELf.js","/assets/clipboard-list-DLAgJ7_e.js","/assets/building-2-pfvCfg9-.js","/assets/InspectionDetail-C6f8Y80o.js","/assets/RiskAnalysisModal-D_xC7iVZ.js","/assets/CameraCaptureModal-BJoE_zLD.js","/assets/check-AmOr8yOE.js","/assets/circle-check-big-DZEcfofV.js","/assets/zoom-out-tM7LaD-K.js","/assets/Compliances-D4etJatj.js","/assets/Mines-BTvAgp9m.js","/assets/hooks-UyamenCu.js","/assets/leafletAssets-B7hpN65u.js","/assets/MineralResourcesDashboard-JZfVCOdr.js","/assets/loader-circle-9D2HgpaC.js","/assets/Contractors-m5TfNXTG.js","/assets/Alerts-mI95eNqS.js","/assets/hi-BiADQGDV.js","/assets/Analytics-a1Tmmxbb.js","/assets/PieChart-CtxsOu2G.js","/assets/Chat-DCy1WfRB.js","/assets/bot-nMghlLE0.js","/assets/volume-x-uUL8XK1t.js","/assets/mic-C4b7miq4.js","/assets/shield-check-CrGQ8txY.js","/assets/sparkles-P7UyYa_M.js","/assets/chevron-right-BRDGFfUj.js","/assets/Profile-Cems5ytx.js","/assets/circle-user-CFzG7s4D.js","/assets/camera-Dx2SpMXR.js","/assets/arrow-left-o4pe2Wne.js","/assets/Workers-BMf_jNcd.js","/assets/users-CrZiu3oG.js","/assets/bell-BqEM2_i0.js","/assets/save-CbqIv1EH.js","/assets/Attendance-D2tRD0Es.js","/assets/user-check-BtmwP9uX.js","/assets/shield-b0t8VOfq.js","/assets/search-DSTbuCKn.js","/assets/map-pin-Dx5qvaT8.js","/assets/TableScrollContainer-Cx1hTSK-.js","/assets/arrow-right-DJ040Wco.js","/assets/rotate-ccw-DWHfX8j1.js","/assets/Support-Bc_izebC.js","/assets/chevron-down-DHsoaxDp.js","/assets/send-BsHlQWMH.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CdCKoHiM.js","/assets/siren-BlfSVk9o.js","/assets/shield-alert-EWiRgjZw.js","/assets/clipboard-check-BivDw7m0.js","/assets/circle-check-x5g_6fmi.js","/assets/radio-CPqzbJ2F.js","/assets/x-DpdB-Uf3.js","/assets/octagon-alert-C9CZeI99.js","/assets/life-buoy-Bki-1NPd.js","/assets/phone-call-DwB9iVl0.js","/assets/plus-BypCbuVd.js","/assets/translations-DZ8A6dW-.js","/assets/web-CvzqM4Vr.js","/assets/web-Ch_7RLmR.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BTfIYOQU.js"];

const FALLBACK_TILE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#e9ecef" stroke="#ced4da" stroke-width="0.5"/><path d="M 0,64 L 256,64 M 0,128 L 256,128 M 0,192 L 256,192 M 64,0 L 64,256 M 128,0 L 128,256 M 192,0 L 192,256" stroke="#dee2e6" stroke-width="0.5"/><text x="128" y="132" font-family="sans-serif" font-size="10" fill="#adb5bd" text-anchor="middle">MineSight Offline Grid</text></svg>';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && res.ok) await cache.put(url, res);
          } catch (e) {}
        }),
      );
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith('minesight-') && ![SHELL_CACHE, TILE_CACHE, FONT_CACHE, RUNTIME_CACHE].includes(key))
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) return;

  if (url.hostname.includes('tile.openstreetmap.org') || url.pathname.includes('/tiles/')) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(request).then((cachedTile) => {
          if (cachedTile) return cachedTile;
          return fetch(request).then((res) => {
            if (res && res.status === 200) cache.put(request, res.clone());
            return res;
          }).catch(() => new Response(FALLBACK_TILE_SVG, { headers: { 'Content-Type': 'image/svg+xml' } }));
        })
      )
    );
    return;
  }

  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(FONT_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const res = await fetch(request);
          if (res && res.status === 200) {
            cache.put(request, res.clone()).catch(() => {});
          }
          return res;
        } catch {
          if (url.hostname.includes('fonts.googleapis.com')) {
            return new Response('/* offline font fallback */', {
              status: 200,
              headers: { 'Content-Type': 'text/css; charset=utf-8' },
            });
          }
          return new Response('', { status: 200 });
        }
      })()
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => {
              cache.put('/index.html', clone.clone()).catch(() => {});
              cache.put('/', clone.clone()).catch(() => {});
              cache.put(request, clone).catch(() => {});
            });
          }
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(request)) ||
            (await caches.match('/index.html')) ||
            (await caches.match('/'));
          if (cached) return cached;

          const keys = await caches.keys();
          for (const k of keys) {
            const c = await caches.open(k);
            const match = (await c.match('/index.html')) || (await c.match('/'));
            if (match) return match;
          }

          return new Response(
            '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MineSight - Offline</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#f8fafc;font-family:sans-serif;text-align:center;padding:20px}.card{max-width:420px;padding:32px;background:#1e293b;border-radius:12px;border:1px solid #334155}h1{margin:0 0 12px;color:#38bdf8}p{margin:0 0 20px;color:#94a3b8}button{background:#0f766e;color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:600}</style></head><body><div class="card"><h1>MineSight Offline</h1><p>You are currently offline. Please reconnect or reload once the connection is restored.</p><button onclick="window.location.reload()">Reload</button></div><script>window.addEventListener("online",()=>window.location.reload());</script></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return networkResponse;
        } catch (fetchError) {
          if (request.mode === 'navigate' || request.destination === 'document') {
            const fallback = (await caches.match('/index.html')) || (await caches.match('/'));
            if (fallback) return fallback;
          }
          if (
            request.destination === 'image' ||
            url.pathname.endsWith('.ico') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.webp')
          ) {
            const fallbackIcon =
              (await caches.match('/minesight-icon.svg')) ||
              (await caches.match('/minesight-logo.svg'));
            if (fallbackIcon) return fallbackIcon;
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#334155"/></svg>',
              { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
        }
      })()
    );
    return;
  }
});