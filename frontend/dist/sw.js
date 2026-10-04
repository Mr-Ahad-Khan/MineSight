const SHELL_CACHE = 'minesight-shell-v' + 1791096936604;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-0Zrk1eD5.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Cu4bbJ6c.js","/assets/Layout-a4qWjuOi.js","/assets/HomePage-CDrhSUCE.js","/assets/sun-BBQ_xoyq.js","/assets/Login-CmbZylu-.js","/assets/languages-BUSfv8UR.js","/assets/Register-MdVtzQ_w.js","/assets/ReCAPTCHA-B-3MT6q1.js","/assets/BrandLogo-vyXyupKE.js","/assets/Dashboard-Da-f5uH2.js","/assets/clipboard-list-fwGAGXSt.js","/assets/building-2-BYz8baox.js","/assets/Inspections-C2drLh_N.js","/assets/CreateInspection-fUQY9Np_.js","/assets/InspectionDetail-BVHIxVS-.js","/assets/circle-check-big-DeL9u-V9.js","/assets/RiskAnalysisModal-Bw1st_xy.js","/assets/triangle-alert-CXxtkI2B.js","/assets/zoom-out-9xpDElFQ.js","/assets/Compliances-BgZLLX_N.js","/assets/Mines-Df7ckWUO.js","/assets/hooks-BDDUQ7eY.js","/assets/leafletAssets-B5bCpOoL.js","/assets/MineralResourcesDashboard-Cbb7O05B.js","/assets/loader-circle-l-cyaQ76.js","/assets/Contractors-DsxOZIKO.js","/assets/Alerts-884eyVTg.js","/assets/hi-BiADQGDV.js","/assets/Analytics-ms0x6Dq5.js","/assets/PieChart-Bv3Gt3DB.js","/assets/Chat-Dwa3llFZ.js","/assets/bot-CdaDv4BL.js","/assets/volume-x-Cv8dWgvA.js","/assets/mic-CDA4P8Kf.js","/assets/shield-check-Bigs43FM.js","/assets/sparkles-B2kPxdSJ.js","/assets/chevron-right-BuVR6Zuf.js","/assets/Profile-DzeBLUXp.js","/assets/circle-user-DVwd8cq1.js","/assets/arrow-left-D6ySxXyX.js","/assets/camera-BfQQOMSt.js","/assets/Workers-CICXsD5i.js","/assets/users-BtGaoCQB.js","/assets/bell-Bch4j3EB.js","/assets/save-Br0BrtTn.js","/assets/Attendance-Qq5apFGn.js","/assets/log-out-x2ddjpfr.js","/assets/user-check-CwA2Bhio.js","/assets/shield-DYEALmuO.js","/assets/search-DDenDxRh.js","/assets/x-inxQxhTH.js","/assets/map-pin-D6T1i-nC.js","/assets/TableScrollContainer-DTx_4oph.js","/assets/arrow-right-E080Rv_C.js","/assets/rotate-ccw-Bt0xP5dZ.js","/assets/Support-D4PfaYD2.js","/assets/chevron-down-D7vVJ1P7.js","/assets/send-DxTrRgJZ.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CeepMGiy.js","/assets/siren-CTGhlRpl.js","/assets/shield-alert-sKoam-Gk.js","/assets/clipboard-check-BQXUMlD2.js","/assets/circle-check-CHB8eVM9.js","/assets/radio-Bj-sPCbd.js","/assets/octagon-alert-DVnA7lu4.js","/assets/life-buoy-DfvMGy0Y.js","/assets/phone-call-CkNYuOIk.js","/assets/plus-CZOlVM9M.js","/assets/translations-m0cHdOZ5.js","/assets/web-giEjkfdW.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BoPDAE-m.js"];

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