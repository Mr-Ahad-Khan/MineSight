const SHELL_CACHE = 'minesight-shell-v' + 1791227500643;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-DJKutvle.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-B6li0Ea0.js","/assets/Layout-p1v6Ayb1.js","/assets/HomePage-CNa9XPbW.js","/assets/sun-QSwiKdmY.js","/assets/Login-Bly5hjR3.js","/assets/languages-zF7oQ1nR.js","/assets/Register-CmO9NLpU.js","/assets/ReCAPTCHA-BLu50xp1.js","/assets/BrandLogo-BZVYyWf5.js","/assets/CreateInspection-uZXzW4bJ.js","/assets/eye-WefoS1-l.js","/assets/Inspections-CT5yqRch.js","/assets/Dashboard-BBc8_Ww6.js","/assets/clipboard-list-DrLXZnjj.js","/assets/building-2-D01Wg0_j.js","/assets/InspectionDetail-DtyQnnHj.js","/assets/RiskAnalysisModal-BXIgSWlj.js","/assets/CameraCaptureModal-CrA8DX8c.js","/assets/check-BmGT9g2v.js","/assets/circle-check-big-CEPOP9aA.js","/assets/zoom-out-DsWjhNZZ.js","/assets/Compliances-L_ilVy_3.js","/assets/Mines-B0Y7nnJt.js","/assets/hooks-DS9blnTI.js","/assets/leafletAssets-BJZodiIR.js","/assets/MineralResourcesDashboard-CrLHv6Wy.js","/assets/loader-circle-B_uMssNk.js","/assets/Contractors-2QYwBt69.js","/assets/Alerts-CD4x1WCs.js","/assets/hi-BiADQGDV.js","/assets/Analytics-1GNJQD6l.js","/assets/PieChart-BwX9nFtd.js","/assets/Chat-D1TUwhT_.js","/assets/bot-CUCIguyj.js","/assets/speechUtils-B88GcQzU.js","/assets/mic--kOvBkhQ.js","/assets/shield-check-C4BpWJV4.js","/assets/sparkles-Chydg4lU.js","/assets/chevron-right-gncq3_Sy.js","/assets/Profile-BZmBBHKT.js","/assets/circle-user-DMXsPuxO.js","/assets/camera-DBbeCvTo.js","/assets/arrow-left-YZ02gHNT.js","/assets/Workers-BNp5LzuH.js","/assets/users-BTBRqJ_8.js","/assets/bell-BXHZh5tR.js","/assets/save-Bz_MHw6j.js","/assets/Attendance-CvTNiYwl.js","/assets/user-check-Cdbkf5MA.js","/assets/shield-_eOt1UE1.js","/assets/search-BuLZWLy6.js","/assets/map-pin-Bp5oI7xE.js","/assets/TableScrollContainer-9xgz0iWA.js","/assets/arrow-right--ErRW5_M.js","/assets/rotate-ccw-DopVC0jh.js","/assets/Support-C3aD9ESv.js","/assets/chevron-down-r8NRJlGx.js","/assets/send-D1MYacvV.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Du2BeJUD.js","/assets/siren-CPzp2mWN.js","/assets/jspdf.plugin.autotable-CsuGL-ez.js","/assets/trash-2-BvqYniiW.js","/assets/shield-alert-DYLCmm_R.js","/assets/clipboard-check-DrBlEkbf.js","/assets/circle-check-DJTikvof.js","/assets/radio-DM_PUBZ7.js","/assets/octagon-alert-DnSRaqPc.js","/assets/life-buoy-B5PW4HA-.js","/assets/phone-call-kZxoEA8Z.js","/assets/plus-Cp7PJIUg.js","/assets/web-BESHaG8a.js","/assets/web-D-uktFpR.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DlUz2_W4.js"];

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