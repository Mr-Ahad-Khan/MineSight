const SHELL_CACHE = 'minesight-shell-v' + 1791203973079;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-BJF3wwij.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BlXinp0F.js","/assets/Layout-D-Euc_ZL.js","/assets/HomePage-CiPkiI9M.js","/assets/sun-kEw-nN21.js","/assets/Login-S_3ZWLcQ.js","/assets/languages-CyKcWozU.js","/assets/Register-xOMKBSOh.js","/assets/ReCAPTCHA-DLyhTEph.js","/assets/BrandLogo-CpamcCpe.js","/assets/CreateInspection-ophztA6P.js","/assets/eye-CqwlwO3N.js","/assets/Inspections-CrwKFzmb.js","/assets/Dashboard-BVXc5y77.js","/assets/clipboard-list-v6KtDka6.js","/assets/building-2-C_lZ6X_M.js","/assets/InspectionDetail-Dr3alRWr.js","/assets/RiskAnalysisModal-oc21fbUv.js","/assets/CameraCaptureModal-CEwEUBxr.js","/assets/check-Bp-Cd_ag.js","/assets/circle-check-big-CduOcyyA.js","/assets/zoom-out-nem_4I8v.js","/assets/Compliances-BfE-ICfk.js","/assets/Mines-CmyMEHpM.js","/assets/hooks-JS7CCaX0.js","/assets/leafletAssets-DucCAkuc.js","/assets/MineralResourcesDashboard-DZ8pNr9Y.js","/assets/loader-circle-JpdGI0b8.js","/assets/Contractors-CZTqrDBt.js","/assets/Alerts-BvFISvXc.js","/assets/hi-BiADQGDV.js","/assets/Analytics-XgJax4VQ.js","/assets/PieChart-BfyKjEj7.js","/assets/Chat-BlzUVsyZ.js","/assets/bot-CtEIUfsf.js","/assets/speechUtils-DoRRdUj3.js","/assets/mic-CCMNBtv8.js","/assets/shield-check-BX_I0cmA.js","/assets/sparkles-Bq5ZUrXs.js","/assets/chevron-right-DZVnqH8V.js","/assets/Profile-Dh6dJlSs.js","/assets/circle-user-DpLCacWG.js","/assets/camera-CMI6j4l-.js","/assets/arrow-left-BOPjz0eI.js","/assets/Workers-CwRIJxLl.js","/assets/users-CUc99g5r.js","/assets/bell-CmerKWMd.js","/assets/save-CseUISPc.js","/assets/Attendance-CbwOS-fI.js","/assets/user-check-C9Hu8rC2.js","/assets/shield-BpBH-rwg.js","/assets/search-CF3MrQe4.js","/assets/map-pin-DgogcBxu.js","/assets/TableScrollContainer-DUWpb-2l.js","/assets/arrow-right-C1U3f-L7.js","/assets/rotate-ccw-CFnymI28.js","/assets/Support-Crb3BjtY.js","/assets/chevron-down-rs7ll2rm.js","/assets/send-CtAzz1Ua.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-C8i_aMbK.js","/assets/siren-mMLEsS7L.js","/assets/jspdf.plugin.autotable-DDIjDuQc.js","/assets/trash-2-B2Zykit9.js","/assets/shield-alert-Ct7OZ-EV.js","/assets/clipboard-check-QFVz3OE1.js","/assets/circle-check-Dj143mAf.js","/assets/radio-CyhbIuCs.js","/assets/x-MAP8-1PB.js","/assets/octagon-alert-CXbkcHqj.js","/assets/life-buoy-CQntbJRa.js","/assets/phone-call-MCqH25c4.js","/assets/plus-BmeroV5h.js","/assets/translations-1PeRISgm.js","/assets/web-BpZhS1yE.js","/assets/web-BMF03_Sf.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CqyyRcgs.js"];

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