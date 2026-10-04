const SHELL_CACHE = 'minesight-shell-v' + 1791121134948;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-wrkkntJT.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-8KDUXVK5.js","/assets/Layout-Du5R9blR.js","/assets/HomePage-DV7rTnvX.js","/assets/sun-4c74on9l.js","/assets/Login-DwF0Zqfz.js","/assets/languages-DmD7usVH.js","/assets/Register-CUKivcEu.js","/assets/ReCAPTCHA-B330rmIW.js","/assets/BrandLogo-DeHX954b.js","/assets/Dashboard-COgtAZZ4.js","/assets/clipboard-list-CI0s-Wvm.js","/assets/building-2-mJHM-0OU.js","/assets/Inspections-JjcR_6WX.js","/assets/CreateInspection-Btz4TKSd.js","/assets/InspectionDetail-q8X64Y43.js","/assets/circle-check-big-B3Cz9sZg.js","/assets/RiskAnalysisModal-BC7W95y2.js","/assets/CameraCaptureModal-Cg_cz108.js","/assets/check-S2MWmpLi.js","/assets/triangle-alert-DrwCWu5u.js","/assets/zoom-out-Du1DplXE.js","/assets/Compliances-kj2946nv.js","/assets/Mines-Cv6_aQkN.js","/assets/hooks-CdKskEZo.js","/assets/leafletAssets-D2RQsodJ.js","/assets/MineralResourcesDashboard-B8U0fA7k.js","/assets/loader-circle-B3aJdWOI.js","/assets/Contractors-DLUhrpDQ.js","/assets/Alerts-DAVgpkK6.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BXiIyKdJ.js","/assets/PieChart-OMsgsC6h.js","/assets/Chat-Ch_CIsfJ.js","/assets/bot-PNYfBvxe.js","/assets/volume-x-o7d-jm3w.js","/assets/mic-C7qowpj_.js","/assets/shield-check-CMhlC2kC.js","/assets/sparkles-BN5hNFoy.js","/assets/chevron-right-DArbIN_m.js","/assets/Profile-CAOJoafF.js","/assets/circle-user-Bfm8uNkP.js","/assets/camera-C6cJgdc6.js","/assets/arrow-left-_mM7R_uL.js","/assets/Workers-CsPwu2ZQ.js","/assets/users-vkqVhr_q.js","/assets/bell-CvYDExIy.js","/assets/save-Dq2BypUv.js","/assets/Attendance-DLCVcdBk.js","/assets/log-out-C8KIQ1wC.js","/assets/user-check-B6rzkHEF.js","/assets/shield-BfFcl8Co.js","/assets/search-CSqADFrp.js","/assets/x-f0HWFdOD.js","/assets/map-pin-CfLR5hNh.js","/assets/TableScrollContainer-CHwoAIp-.js","/assets/arrow-right-BtGr5MHN.js","/assets/rotate-ccw-D9WyBaaV.js","/assets/Support-C-4AZq13.js","/assets/chevron-down-CuEz6IOB.js","/assets/send-Bv_vrf7O.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DdltrfKo.js","/assets/siren-Df-W1BMQ.js","/assets/shield-alert-BX4_Q3AZ.js","/assets/clipboard-check-CeTIS109.js","/assets/circle-check-B-bC3jl4.js","/assets/radio-TgFyGiJL.js","/assets/octagon-alert-YXpLro9T.js","/assets/life-buoy-CSFLQ9jC.js","/assets/phone-call-CxEwQEKL.js","/assets/plus-4aFfhjmz.js","/assets/translations-DZ8A6dW-.js","/assets/web-DYueuwNy.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-CH5319Jw.js"];

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