const SHELL_CACHE = 'minesight-shell-v' + 1791054194429;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-DCccnnSN.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BJ8bs_cT.js","/assets/Layout-Au8Q3qC4.js","/assets/HomePage-BNLboo5c.js","/assets/sun-DP1kJY1f.js","/assets/Login-2QlsTG2z.js","/assets/languages-CKuBuxmk.js","/assets/Register-C6rqUl1M.js","/assets/ReCAPTCHA-DTsJT2x_.js","/assets/BrandLogo-BXXqIjWg.js","/assets/Dashboard-MSInxER8.js","/assets/clipboard-list-DGS50kNq.js","/assets/building-2-Cl-uRgDB.js","/assets/Inspections-FJaIEgY2.js","/assets/CreateInspection-DoXUizdY.js","/assets/InspectionDetail-BOvSpT2L.js","/assets/circle-check-big-BUFewqO_.js","/assets/RiskAnalysisModal-DDHEGQw4.js","/assets/triangle-alert-Dp8TTsXK.js","/assets/zoom-out-fMqg53Ud.js","/assets/Compliances-CLglNGyO.js","/assets/Mines-3ivgEgIZ.js","/assets/hooks-CrwlVp0Y.js","/assets/leafletAssets-DZ2EadkH.js","/assets/MineralResourcesDashboard-Df0acdT1.js","/assets/loader-circle-BOw-JuYo.js","/assets/Contractors-C2Pvf5l1.js","/assets/Alerts-DHnKM9yv.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CEnZohU5.js","/assets/PieChart-4gDqyDL3.js","/assets/Chat-C34erfWo.js","/assets/bot-CIKU_zmD.js","/assets/volume-x-Du372z8c.js","/assets/mic-D3_pumg_.js","/assets/shield-check-Dk3pawOY.js","/assets/sparkles-CRK1X6My.js","/assets/chevron-right-DjwXpqzz.js","/assets/Profile-4Vr9ut0c.js","/assets/circle-user-O9NTXzZ9.js","/assets/arrow-left-Db-axDCM.js","/assets/camera-ma-hUO0d.js","/assets/Workers-CkY7ve6G.js","/assets/users-DpamNKWI.js","/assets/bell-DXELdYip.js","/assets/save-CBRYAl8c.js","/assets/Attendance-D6eO0oKI.js","/assets/log-out-C_E0dSVg.js","/assets/user-check-DldVv1cn.js","/assets/shield-BrvjnaEj.js","/assets/search-D5riZmi5.js","/assets/x-CAQwHStc.js","/assets/map-pin-D3EF_qkh.js","/assets/TableScrollContainer-MB932en2.js","/assets/arrow-right-BTKzOr7b.js","/assets/rotate-ccw-I4QOIXrf.js","/assets/Support-DgBP0OjB.js","/assets/chevron-down-Cu2PvjHw.js","/assets/send-C4waKZsb.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-Cv3Vn5dT.js","/assets/siren-BEk5mg26.js","/assets/shield-alert-MTCAydZ1.js","/assets/clipboard-check-BlzQYldM.js","/assets/circle-check-B2nLvu6u.js","/assets/radio-EYz3AUWw.js","/assets/octagon-alert-CjscWq9y.js","/assets/life-buoy-BDnDlbs0.js","/assets/phone-call-CgBT9KY1.js","/assets/plus-o8BPUAZb.js","/assets/translations-m0cHdOZ5.js","/assets/web-BWOEL1HR.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Dru0THPl.js"];

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