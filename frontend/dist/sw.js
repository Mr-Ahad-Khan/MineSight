const SHELL_CACHE = 'minesight-shell-v' + 1791234147524;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-CkumFqtx.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DNaxuQed.js","/assets/Layout-G8pth4Oy.js","/assets/HomePage-zSgSg_bp.js","/assets/sun-vlOhi2S_.js","/assets/Login-B7cGyQvf.js","/assets/languages-BjHUpO9W.js","/assets/Register-BJIGPiWc.js","/assets/ReCAPTCHA-wTBicSjO.js","/assets/BrandLogo-xeATf0tp.js","/assets/CreateInspection-C1vIvkQo.js","/assets/eye-CawwChJ8.js","/assets/Inspections-BAcFRuv4.js","/assets/Dashboard-Jer2WuiU.js","/assets/clipboard-list-DLrlsgL0.js","/assets/building-2-D-UD8VAS.js","/assets/InspectionDetail-D8bpf97t.js","/assets/RiskAnalysisModal-Bo1kiU4N.js","/assets/CameraCaptureModal-q2_aQyoh.js","/assets/check-CEFDDTIj.js","/assets/circle-check-big-Dlic47nc.js","/assets/zoom-out-BzjSJavE.js","/assets/Compliances-Y9E0L76y.js","/assets/Mines-BzaUuSyn.js","/assets/hooks-B_zgcZhv.js","/assets/leafletAssets-DHCR9BjJ.js","/assets/MineralResourcesDashboard-CnTw46ps.js","/assets/loader-circle-l71uTx0r.js","/assets/Contractors-Dde3gXzy.js","/assets/Alerts-B4YTmI3L.js","/assets/hi-BiADQGDV.js","/assets/Analytics-fxaLyg-Y.js","/assets/PieChart-NSzOvhwN.js","/assets/Chat-8oyr44aN.js","/assets/bot-BRxl1fat.js","/assets/speechUtils-1eIKzgcu.js","/assets/mic-DMEdma-v.js","/assets/shield-check-DTjHDMM3.js","/assets/sparkles-CH3HxU-u.js","/assets/chevron-right-DjwP8lrX.js","/assets/Profile-Doc3RhF6.js","/assets/circle-user-BDTZOMBQ.js","/assets/camera-oDQD9GO7.js","/assets/arrow-left-wkKFHcII.js","/assets/Workers--tgDw6yy.js","/assets/users-CcErLFKU.js","/assets/bell-CfEh9nqQ.js","/assets/save-BGJaOy1Z.js","/assets/Attendance-DyyN-zPK.js","/assets/user-check-BtAgjxM9.js","/assets/shield-BMBwn4p7.js","/assets/search-CD5DkPzi.js","/assets/map-pin-Dy32R04X.js","/assets/TableScrollContainer-D6ddC366.js","/assets/arrow-right-K8OzKn2m.js","/assets/rotate-ccw-NXRp4Bqm.js","/assets/Support-C9nZrNpZ.js","/assets/chevron-down-DEeNQv1t.js","/assets/send-DSdL1TYC.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-5SJoMxSJ.js","/assets/siren-CZ0kQQfn.js","/assets/jspdf.plugin.autotable-CNxzJyT9.js","/assets/shield-alert-Bq0LFD-T.js","/assets/trash-2-DHCsnNh2.js","/assets/clipboard-check-CaxRnWkY.js","/assets/circle-check-DUUBylFd.js","/assets/radio-Bc7sjiFG.js","/assets/octagon-alert-BBHCSUlx.js","/assets/life-buoy-CnjFo7Qt.js","/assets/phone-call-TqzqFkE_.js","/assets/plus-D03OC7bw.js","/assets/web-D_Ias335.js","/assets/web-Cwu0A0_1.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BMOQ0hEK.js"];

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