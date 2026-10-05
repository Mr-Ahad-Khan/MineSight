const SHELL_CACHE = 'minesight-shell-v' + 1791232832636;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-BzyW4GJU.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DwavW2i5.js","/assets/Layout-Bsq1Q94i.js","/assets/HomePage-DizbgqnI.js","/assets/sun-DqBitXtK.js","/assets/Login-2qC4YKiY.js","/assets/languages-DbCqdpDy.js","/assets/Register-lHsObxuc.js","/assets/ReCAPTCHA-DeMKeZez.js","/assets/BrandLogo-BjwRHjoS.js","/assets/CreateInspection-BS6wCRJf.js","/assets/eye-ByfapWHe.js","/assets/Inspections-BcFKLVFL.js","/assets/Dashboard-B2oVyKuE.js","/assets/clipboard-list-Det6EPHm.js","/assets/building-2-aehZi5pz.js","/assets/InspectionDetail-DsUFx94X.js","/assets/RiskAnalysisModal-DyaMfioy.js","/assets/CameraCaptureModal-CTIYzvn5.js","/assets/check-zTTWPOuw.js","/assets/circle-check-big-CcZUMZuR.js","/assets/zoom-out-BYAi4Y88.js","/assets/Compliances-CcgtPn-b.js","/assets/Mines-CukqN-3_.js","/assets/hooks-xqAZywVh.js","/assets/leafletAssets-B_ULnGK6.js","/assets/MineralResourcesDashboard-BSW2JjIF.js","/assets/loader-circle-CguNSIk-.js","/assets/Contractors-HRNMO7Jb.js","/assets/Alerts-BfZQRRXA.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DOKcTpqE.js","/assets/PieChart-C28g-VOT.js","/assets/Chat-Dr5Y320B.js","/assets/bot-BXCOO9P9.js","/assets/speechUtils-DYWR-xn5.js","/assets/mic-BwvAV8v8.js","/assets/shield-check-CQ8PlW1C.js","/assets/sparkles-DMOTSHO-.js","/assets/chevron-right-ByuRMrC4.js","/assets/Profile-CLsk3iIM.js","/assets/circle-user-fo_E6E5d.js","/assets/camera-DlXKluOH.js","/assets/arrow-left-KpvhlueV.js","/assets/Workers-CEnRYrpH.js","/assets/users-aldur0NV.js","/assets/bell-CJfrmFLM.js","/assets/save-De889rBX.js","/assets/Attendance-CjfFD7YF.js","/assets/user-check-rSNQ_0jm.js","/assets/shield-hxQAYJ0t.js","/assets/search-BIv59k4i.js","/assets/map-pin-CfoSIuf1.js","/assets/TableScrollContainer-BVQmRsvH.js","/assets/arrow-right-14fs7dyG.js","/assets/rotate-ccw-BA7o1J9G.js","/assets/Support-BObn0TYe.js","/assets/chevron-down-fnNeAgHN.js","/assets/send-zx15z40E.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-7obUx7VU.js","/assets/siren-BozEFFLQ.js","/assets/jspdf.plugin.autotable-BP27jKSd.js","/assets/trash-2-DTleFqku.js","/assets/shield-alert-C0oFfdEa.js","/assets/clipboard-check-BcssopC2.js","/assets/circle-check-DFtLT4rU.js","/assets/radio-1np9ff3T.js","/assets/octagon-alert-BKNBIUei.js","/assets/life-buoy-egnTdmUQ.js","/assets/phone-call-zrWQPTDt.js","/assets/plus-BAvO59Cc.js","/assets/web-xdLZaqvD.js","/assets/web-DVOPF-Dx.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-2ybR8G6U.js"];

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