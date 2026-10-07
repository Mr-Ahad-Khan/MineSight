const SHELL_CACHE = 'minesight-shell-v' + 1791355867165;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-m9UWSNOZ.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Bt9cSxKS.js","/assets/Layout-D22Iq3jm.js","/assets/HomePage-DXea_I-7.js","/assets/sun-D1fn96Vb.js","/assets/Login-puOC8U6-.js","/assets/languages-Dcaa24JJ.js","/assets/Register-_CSrdhW7.js","/assets/ReCAPTCHA-9QiPgKmH.js","/assets/BrandLogo-BRebEHCH.js","/assets/CreateInspection-Dz0GvPOw.js","/assets/eye-1ePCzfhW.js","/assets/Inspections-CuXSr9gi.js","/assets/Dashboard-BO3LN6js.js","/assets/clipboard-list-UK3aADPk.js","/assets/building-2-gcGS9_LY.js","/assets/InspectionDetail-DGUBV7Wl.js","/assets/RiskAnalysisModal-DrW5H3X-.js","/assets/CameraCaptureModal-BEB6wbLf.js","/assets/check-Bq1Jj4qr.js","/assets/circle-check-big-CMcLAcgr.js","/assets/zoom-out-CHwIKQoL.js","/assets/Compliances-Btt4Ry0D.js","/assets/Mines-D6jkQ-8C.js","/assets/hooks-OH4-9JCr.js","/assets/leafletAssets-CN_IJuxS.js","/assets/MineralResourcesDashboard-PRTfOIZv.js","/assets/loader-circle-Ctsi3X1J.js","/assets/Contractors-CjTil3H8.js","/assets/Alerts-BLdNnMIm.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DjePmME7.js","/assets/PieChart-BHrOR9_9.js","/assets/Chat-4ASNbJrq.js","/assets/bot-ClWJFZEj.js","/assets/speechUtils-DchHhwDp.js","/assets/mic-BHXX_tKM.js","/assets/shield-check-BD225MiN.js","/assets/sparkles-qqIk04ay.js","/assets/chevron-right-Bfn6-lqG.js","/assets/Profile-CnRWDJjk.js","/assets/circle-user-ligc4PDj.js","/assets/camera-B-1AsJ19.js","/assets/arrow-left-7zrgHPyh.js","/assets/Workers-Bcuk7CCK.js","/assets/users-BnavRD7P.js","/assets/bell-D_p03eW1.js","/assets/save-CBoF8wic.js","/assets/Attendance-WM40xBn0.js","/assets/user-check-BhH4Tp92.js","/assets/shield-BLQqEsNP.js","/assets/search-CGX3JKyk.js","/assets/map-pin-DVNkg-vZ.js","/assets/TableScrollContainer-D9gKGRYR.js","/assets/arrow-right-_w28JhqC.js","/assets/rotate-ccw-wlO9Uz1Q.js","/assets/Support-DIjLZiLB.js","/assets/chevron-down-Ct8cBVXp.js","/assets/send-Hl71KeWx.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DAMXmoUF.js","/assets/siren-P-R7PVzW.js","/assets/jspdf.plugin.autotable-C99joozh.js","/assets/shield-alert-CUxuQH64.js","/assets/trash-2-fqCXK8Sw.js","/assets/clipboard-check-BxUPj6dj.js","/assets/circle-check-810wLcqA.js","/assets/radio-Dw10Ame2.js","/assets/octagon-alert-Bk7OgKxx.js","/assets/life-buoy-BIJ_m8Xc.js","/assets/phone-call-DJaWO-1L.js","/assets/plus-DM1q8j7v.js","/assets/web-DrneiHhU.js","/assets/web-8ke3XbLx.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-97kuKahx.js"];

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