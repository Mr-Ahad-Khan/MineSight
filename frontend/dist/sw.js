const SHELL_CACHE = 'minesight-shell-v' + 1791189442483;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-BBS_xESe.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DzDMrUIn.js","/assets/Layout-DXbH4xgc.js","/assets/HomePage-DwmxNhMy.js","/assets/sun-DirwX8hl.js","/assets/Login-CDpjpVxA.js","/assets/languages-UYukaTGG.js","/assets/Register-D6TqGl4N.js","/assets/ReCAPTCHA-CftQsK7D.js","/assets/BrandLogo-xMAG3BoG.js","/assets/CreateInspection-BsF_8Uof.js","/assets/eye-rrmi8uy5.js","/assets/Inspections-C8mdFpl_.js","/assets/Dashboard-DitPQETl.js","/assets/clipboard-list-A-dRMy0_.js","/assets/building-2-CEPq2Zr5.js","/assets/InspectionDetail-sS710kLQ.js","/assets/RiskAnalysisModal-BXXuL4kz.js","/assets/CameraCaptureModal-Rp_0mhTZ.js","/assets/check-CXM-C27h.js","/assets/circle-check-big-BDksDkMR.js","/assets/zoom-out-ChrCQr5p.js","/assets/Compliances-CQdqbhNB.js","/assets/Mines-CSXF3xpA.js","/assets/hooks-BsZxqFpv.js","/assets/leafletAssets-CzZ95Ewo.js","/assets/MineralResourcesDashboard-Dpss1GN2.js","/assets/loader-circle-RHchI-kP.js","/assets/Contractors-BuCLgflx.js","/assets/Alerts-CHfG67X_.js","/assets/hi-BiADQGDV.js","/assets/Analytics-czCSagn8.js","/assets/PieChart-CEkiiVcI.js","/assets/Chat-BdTEFPNf.js","/assets/bot-CTG6OvVq.js","/assets/volume-x-DzcbTqD9.js","/assets/mic-tz_Fs3ed.js","/assets/shield-check-CxN21d2o.js","/assets/sparkles-BFKZMSC4.js","/assets/chevron-right-Bo80QAWu.js","/assets/Profile-u-BNoPrJ.js","/assets/circle-user-DjsTOxvt.js","/assets/camera-CKsFlpv6.js","/assets/arrow-left-B9Bb4BZp.js","/assets/Workers-cqIF7KQK.js","/assets/users-F3iilibR.js","/assets/bell-Cvcy4Yys.js","/assets/save-Dh-LPlE8.js","/assets/Attendance-SYVJD7VX.js","/assets/user-check-Dpsjl6iK.js","/assets/shield-DhB-tmN5.js","/assets/search-CeoesPVI.js","/assets/map-pin-CkyuEdaZ.js","/assets/TableScrollContainer-D8r1c06t.js","/assets/arrow-right-DZe2aaEN.js","/assets/rotate-ccw-BDziCZih.js","/assets/Support-knfAy6cq.js","/assets/chevron-down-B2a8XpcR.js","/assets/send-DQQFt39R.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DLFGS_9R.js","/assets/siren-CrLYNCe1.js","/assets/trash-2-BLTaIeNB.js","/assets/shield-alert-Cn0uxRJk.js","/assets/clipboard-check-7sdAlRqO.js","/assets/circle-check-BA0IaJ6q.js","/assets/radio-Brgum5xO.js","/assets/x-DiquXAjl.js","/assets/octagon-alert-cVTP5aLt.js","/assets/life-buoy-CcQtoemx.js","/assets/phone-call-C8raa-B2.js","/assets/plus-D5vvJQPw.js","/assets/translations-DZ8A6dW-.js","/assets/web-Dl30kz2O.js","/assets/web-A6ukJGRS.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DnMW4_Ds.js"];

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