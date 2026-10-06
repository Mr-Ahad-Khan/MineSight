const SHELL_CACHE = 'minesight-shell-v' + 1791263541839;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-C46mNvUN.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BJbIwW2h.js","/assets/Layout-1EqjWdcK.js","/assets/HomePage-BjKWQBkU.js","/assets/sun-BFCczvV_.js","/assets/Login-CAXH7MWr.js","/assets/languages-D-biXcpv.js","/assets/Register-FmrCX3-v.js","/assets/ReCAPTCHA-CCfqdql8.js","/assets/BrandLogo-DZq-Hypx.js","/assets/CreateInspection-CqwZTvG6.js","/assets/eye-Cq0fb2uA.js","/assets/Inspections-8vk-Jh_j.js","/assets/Dashboard-FcKBjH8M.js","/assets/clipboard-list-DUEm5JJr.js","/assets/building-2-BTeaVZhh.js","/assets/InspectionDetail-C3-wqebJ.js","/assets/RiskAnalysisModal-DewnbXGp.js","/assets/CameraCaptureModal-kz8DoKAn.js","/assets/check-CZ5hLZ5-.js","/assets/circle-check-big-uxeuhrG8.js","/assets/zoom-out-CV_KUbXG.js","/assets/Compliances-D55p2_Ze.js","/assets/Mines-BzI_hWVl.js","/assets/hooks-BW9X7_d_.js","/assets/leafletAssets-B8pMvEds.js","/assets/MineralResourcesDashboard-C1DQy5sA.js","/assets/loader-circle-_n2Whip5.js","/assets/Contractors-CLeg8AEb.js","/assets/Alerts-lJLE01Rf.js","/assets/hi-BiADQGDV.js","/assets/Analytics-Nbf-kZlc.js","/assets/PieChart-BvUfHwjH.js","/assets/Chat-C8PJ-NR4.js","/assets/bot-BLztE-K0.js","/assets/speechUtils-CPdc4Tx6.js","/assets/mic-Bz8sMZ76.js","/assets/shield-check-CFK4ZzDh.js","/assets/sparkles-Bmsnu5Gw.js","/assets/chevron-right-COMT81RS.js","/assets/Profile-BigfDj02.js","/assets/circle-user-B_Sx6TeN.js","/assets/camera-Bbs77cvi.js","/assets/arrow-left-BLhRxieV.js","/assets/Workers-DkBWJdUD.js","/assets/users-CjOcn6aT.js","/assets/bell-DAOd3Nzy.js","/assets/save-kepl_cM6.js","/assets/Attendance-CTN6Fhu2.js","/assets/user-check-CxBJSvv4.js","/assets/shield-BMSN0gs2.js","/assets/search-CamaIvDO.js","/assets/map-pin-ocInS9N3.js","/assets/TableScrollContainer-X96bVQ0J.js","/assets/arrow-right-DUHNIlEZ.js","/assets/rotate-ccw-B5TdLIhf.js","/assets/Support-Co7liUYb.js","/assets/chevron-down-BE8ObhhU.js","/assets/send-DN4harVE.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-sB3B061J.js","/assets/siren-CIUDk-b3.js","/assets/jspdf.plugin.autotable-DDQIK6zv.js","/assets/shield-alert-C2647A5S.js","/assets/trash-2-imPA02MV.js","/assets/clipboard-check-8KuZlxR6.js","/assets/circle-check-0bP7t6Iv.js","/assets/radio-BAgw3jxP.js","/assets/octagon-alert--aKgkk-q.js","/assets/life-buoy-Dhc48xO8.js","/assets/phone-call-CHVT9LRx.js","/assets/plus-Z1OWk6RA.js","/assets/web-B69JBW7m.js","/assets/web-BChtlgAm.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CU7HCvrV.js"];

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