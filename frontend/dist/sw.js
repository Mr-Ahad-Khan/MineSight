const SHELL_CACHE = 'minesight-shell-v' + 1791125266039;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-D-OqNsjE.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-ZlyLs5C6.js","/assets/Layout-DsTfeiw_.js","/assets/HomePage-mNXKLJzT.js","/assets/sun-DfueKmUy.js","/assets/Login-CQWVX10j.js","/assets/languages-BosUMlFG.js","/assets/Register-Dp8NWInd.js","/assets/ReCAPTCHA-CCXK0AOu.js","/assets/BrandLogo-BhC295K-.js","/assets/CreateInspection-D5OT1Ma4.js","/assets/eye-DoIk91CB.js","/assets/Inspections-DDa_Dk0i.js","/assets/Dashboard-BtntstbF.js","/assets/clipboard-list-BgF-iZZU.js","/assets/building-2-ZTY06ogY.js","/assets/InspectionDetail-DxoVlQeu.js","/assets/RiskAnalysisModal-D1m_coZF.js","/assets/CameraCaptureModal-Dk4FrB4-.js","/assets/check-DlIl5m1E.js","/assets/circle-check-big-BnXrCtEW.js","/assets/zoom-out-CbuNCvSX.js","/assets/triangle-alert-CF7f9-P_.js","/assets/Compliances-BXve0ULh.js","/assets/Mines-C4wLCFem.js","/assets/hooks-johE3Lsi.js","/assets/leafletAssets-Dxfnbqlr.js","/assets/MineralResourcesDashboard-ZAKKcfc6.js","/assets/loader-circle-Bj3uh_jN.js","/assets/Contractors-Ch9wlZWb.js","/assets/Alerts-DyWu3jfP.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BLuK_f7I.js","/assets/PieChart-BXqYAED-.js","/assets/Chat-Cqjte4Ty.js","/assets/bot-R0N1xRh5.js","/assets/volume-x-DuOauXAc.js","/assets/mic-uoZYvQGx.js","/assets/shield-check-D1CDAFhr.js","/assets/sparkles-xEDTsMx8.js","/assets/chevron-right-lo64qPhQ.js","/assets/Profile-BQrayOEz.js","/assets/circle-user-B4XegU73.js","/assets/camera-Cjd-15aS.js","/assets/arrow-left-DXhF0H7i.js","/assets/Workers-qSJTFwBf.js","/assets/users-DcV9vVpg.js","/assets/bell-D7UXooGq.js","/assets/save-Bbc50vk6.js","/assets/Attendance-CR3WPInL.js","/assets/log-out-ct_eG40b.js","/assets/user-check-SyXlnwmn.js","/assets/shield-XanVOfBU.js","/assets/search-_UsSCLgp.js","/assets/map-pin-wdDjXoat.js","/assets/TableScrollContainer-B0bvsYro.js","/assets/arrow-right-rxKj0qZz.js","/assets/rotate-ccw-CI_LOWc0.js","/assets/Support-B-svO0pa.js","/assets/chevron-down-CHqJq3EY.js","/assets/send-BlePFyt9.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-2aX2wOF1.js","/assets/siren-7Qu90xm5.js","/assets/shield-alert-ThdlVNni.js","/assets/clipboard-check-D0_N84d_.js","/assets/circle-check-BolysFot.js","/assets/radio-grkqVJL2.js","/assets/x-B9iQlaCM.js","/assets/octagon-alert-Culzxqo2.js","/assets/life-buoy-hMKKdQII.js","/assets/phone-call-DsniHGEj.js","/assets/plus-BC2KSYuq.js","/assets/translations-DZ8A6dW-.js","/assets/web-lNkCY1I8.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-8R3ssWnT.js"];

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