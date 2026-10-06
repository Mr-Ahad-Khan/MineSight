const SHELL_CACHE = 'minesight-shell-v' + 1791262026102;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-DpMt-smS.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-D6TKsq_d.js","/assets/Layout-DZZr845i.js","/assets/HomePage-CN6BvMft.js","/assets/sun-gSYyk3JJ.js","/assets/Login-CTIJ99uf.js","/assets/languages-CUbtd4Z7.js","/assets/Register-wF0MpDX8.js","/assets/ReCAPTCHA-Djo7fp6i.js","/assets/BrandLogo-CmFqFK39.js","/assets/CreateInspection-DBAjS6Ny.js","/assets/eye-Bpyqh3ic.js","/assets/Inspections-BFtWQNT3.js","/assets/Dashboard-Bti36cC2.js","/assets/clipboard-list-DSczuJms.js","/assets/building-2-DqeHfC3g.js","/assets/InspectionDetail-w4gitoWb.js","/assets/RiskAnalysisModal-Bj5CBEpu.js","/assets/CameraCaptureModal-Zxy6whCT.js","/assets/check-jZm9cmz6.js","/assets/circle-check-big-BDw2sPbN.js","/assets/zoom-out-C3mSspOM.js","/assets/Compliances-C9aHm8Y6.js","/assets/Mines-BQrmtSmx.js","/assets/hooks-Cvczkl1N.js","/assets/leafletAssets-JuiIo2NJ.js","/assets/MineralResourcesDashboard-LVYBt0KX.js","/assets/loader-circle-wm--p1e_.js","/assets/Contractors-zUdavS4W.js","/assets/Alerts-In8LCnwq.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BJ-XA_R3.js","/assets/PieChart-UDb3vMWV.js","/assets/Chat-2PFR33Dk.js","/assets/bot-I1rAWe6n.js","/assets/speechUtils-hcomkYFS.js","/assets/mic-ViJgQw_W.js","/assets/shield-check-D7tnBd0e.js","/assets/sparkles-D4DRgx41.js","/assets/chevron-right-t7JUjWac.js","/assets/Profile-CkZaE6--.js","/assets/circle-user-8dEJd50G.js","/assets/camera-BYtQkpM1.js","/assets/arrow-left-vsJZHj35.js","/assets/Workers-DU8q5kCy.js","/assets/users-C1EfQwhu.js","/assets/bell-a8q5mMX_.js","/assets/save-ruGWoIzJ.js","/assets/Attendance-CqNlVXPE.js","/assets/user-check-DCpet3IS.js","/assets/shield-tMe56hkh.js","/assets/search-vZG20KRj.js","/assets/map-pin-DVtmp-s6.js","/assets/TableScrollContainer-Cbc_ZTQf.js","/assets/arrow-right-CrYl-4uM.js","/assets/rotate-ccw-B9dXpIlq.js","/assets/Support-BYrYqp9G.js","/assets/chevron-down-tChABM2f.js","/assets/send-CZpC3zTv.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-DGRtlkDT.js","/assets/siren-BWO6FTCx.js","/assets/jspdf.plugin.autotable-B4egawkO.js","/assets/shield-alert-DxufN_kc.js","/assets/trash-2-C3Cxw51d.js","/assets/clipboard-check-BlJeZT5p.js","/assets/circle-check-CcwwDKLl.js","/assets/radio-DquYKty5.js","/assets/octagon-alert-Bsqr1zVy.js","/assets/life-buoy-aJaXnUru.js","/assets/phone-call-DT2fU8oC.js","/assets/plus-DobTFBhm.js","/assets/web-Dmd3UUnR.js","/assets/web-FBfemzC-.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BgVC9KVa.js"];

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