const SHELL_CACHE = 'minesight-shell-v' + 1791105674160;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-CGVhCYFY.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-C-xzqCvh.js","/assets/Layout-N7NpLmV_.js","/assets/HomePage-CfnPLesY.js","/assets/sun-BdkFDeR4.js","/assets/Login-BTqIWIJY.js","/assets/languages-B7iRThZv.js","/assets/Register-DbjcSOSL.js","/assets/ReCAPTCHA-nBSam3yy.js","/assets/BrandLogo-CjeTiNz1.js","/assets/Dashboard-C0W5qeyS.js","/assets/clipboard-list-CxzhEoiQ.js","/assets/building-2-Brg78vIF.js","/assets/Inspections-DvN2e5ed.js","/assets/CreateInspection-D8N25gzC.js","/assets/InspectionDetail-D9loFbrF.js","/assets/circle-check-big-C6sIYTnG.js","/assets/RiskAnalysisModal-Dbf8RGfZ.js","/assets/triangle-alert-DlSJMsQT.js","/assets/zoom-out-D36wxYj9.js","/assets/Compliances-DZcwx1kt.js","/assets/Mines-D1TIqhP3.js","/assets/hooks-Dw9_9h11.js","/assets/leafletAssets-B3pRoTmv.js","/assets/MineralResourcesDashboard-CUed0fl0.js","/assets/loader-circle-DrNy9UxV.js","/assets/Contractors-Bx2MkegG.js","/assets/Alerts-cwQ3IhQp.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BUPRxa-6.js","/assets/PieChart-BxdigJpN.js","/assets/Chat-B_JvkB2_.js","/assets/bot-8T2VIfud.js","/assets/volume-x-B5WFjzzp.js","/assets/mic-Cf0rYPv0.js","/assets/shield-check-DH9ltdAt.js","/assets/sparkles-Cc7okspc.js","/assets/chevron-right-BFoQxCEh.js","/assets/Profile-BrvVC7Bs.js","/assets/circle-user-Dx2Yhniq.js","/assets/arrow-left-CgS8Ieid.js","/assets/camera-DFEMRIL1.js","/assets/Workers-BQIY_qh3.js","/assets/users-KJaX_V3U.js","/assets/bell-BAuzcCji.js","/assets/save-C0Urf2LH.js","/assets/Attendance-vnwt9Sjg.js","/assets/log-out-Y4om1Tc3.js","/assets/user-check-CvNp-uSZ.js","/assets/shield-DdGrrSp7.js","/assets/search-2PLNSXaH.js","/assets/x-CyCvyd7t.js","/assets/map-pin-nduojXL4.js","/assets/TableScrollContainer-YrRoSWIg.js","/assets/arrow-right-BRbrfIWg.js","/assets/rotate-ccw-DNIHRTzH.js","/assets/Support-Cum4rV13.js","/assets/chevron-down-DpyqMvt7.js","/assets/send-HokvjFQX.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-TEgQ7wul.js","/assets/siren-2aAfdSrh.js","/assets/shield-alert-Cj7hq7SO.js","/assets/clipboard-check-CTbaatXN.js","/assets/circle-check-DaRR7hoN.js","/assets/radio-CTUpwWHC.js","/assets/octagon-alert-D5_SnvuA.js","/assets/life-buoy-DjZqnBdg.js","/assets/phone-call-DckcfkSn.js","/assets/plus-DJNmWW9l.js","/assets/translations-m0cHdOZ5.js","/assets/web-3p9QYpcS.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BFoy8VUY.js"];

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