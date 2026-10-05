const SHELL_CACHE = 'minesight-shell-v' + 1791188827726;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-IqIKzeby.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-C1F7Pmu7.js","/assets/Layout-Y37BxZM7.js","/assets/HomePage-BmQtsAkZ.js","/assets/sun-Mjx92FQ2.js","/assets/Login-BY1iC2h9.js","/assets/languages-mPGK7XKt.js","/assets/Register-Club-0wq.js","/assets/ReCAPTCHA-MhLphUr2.js","/assets/BrandLogo-OgaOf-1g.js","/assets/CreateInspection-D_h13IDu.js","/assets/eye-DsBoBTOg.js","/assets/Inspections-1jFFwDG4.js","/assets/Dashboard-bjHv_iZT.js","/assets/clipboard-list-BMGZ9sFL.js","/assets/building-2-Cbop3ksP.js","/assets/InspectionDetail-3SByGHOI.js","/assets/RiskAnalysisModal-D5yBkvb3.js","/assets/CameraCaptureModal-CvcILBnp.js","/assets/check-DGgW-lIF.js","/assets/circle-check-big-DZts6uJv.js","/assets/zoom-out-DQbxAH0U.js","/assets/Compliances-C1eK-SDv.js","/assets/Mines-pN5V-MK3.js","/assets/hooks-C53JUWlU.js","/assets/leafletAssets-C7J0HCKz.js","/assets/MineralResourcesDashboard-DXUyScGJ.js","/assets/loader-circle-BZAV4sSU.js","/assets/Contractors-C3uo6SQ9.js","/assets/Alerts-C46_kP_U.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BWMaKxMY.js","/assets/PieChart-CANYTYMF.js","/assets/Chat-Bin9DpwR.js","/assets/bot-DqtCZfPC.js","/assets/volume-x-CF2RC-c1.js","/assets/mic-Ba6wQkPj.js","/assets/shield-check-Dd4ri56G.js","/assets/sparkles-CDweK4hz.js","/assets/chevron-right-CkFv7jjG.js","/assets/Profile-CFLLRZEb.js","/assets/circle-user-CFZCWypn.js","/assets/camera-CS3bwTGP.js","/assets/arrow-left-Cj53D7zO.js","/assets/Workers-C6zzxOqF.js","/assets/users-B_pVTYLY.js","/assets/bell-CZQhjVCS.js","/assets/save-BYZAJuGq.js","/assets/Attendance-Ca9ZyARk.js","/assets/user-check-B6XLahod.js","/assets/shield-B1zJiGYu.js","/assets/search-BJ9UYMq0.js","/assets/map-pin-CbnOhVlf.js","/assets/TableScrollContainer-DjyJZ7k3.js","/assets/arrow-right-CNbZg3tA.js","/assets/rotate-ccw-CTFw-2U8.js","/assets/Support-hcyhkEcw.js","/assets/chevron-down-gkgVLG4U.js","/assets/send-DiYliCAE.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-hstBW9Dz.js","/assets/siren-CHLN8Qyo.js","/assets/shield-alert-mI7Kc_bh.js","/assets/clipboard-check-DS71af1R.js","/assets/circle-check-BM6oclPO.js","/assets/radio-CdKVvzAj.js","/assets/x-Dj9JXJjU.js","/assets/octagon-alert-DkDTUQwK.js","/assets/life-buoy-eusJKGvq.js","/assets/phone-call-pzGFSfZR.js","/assets/plus-DyC7pGRh.js","/assets/translations-DZ8A6dW-.js","/assets/web-DJ6LglG0.js","/assets/web-DJVUPERP.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-kARLDOT-.js"];

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