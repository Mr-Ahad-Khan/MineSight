const SHELL_CACHE = 'minesight-shell-v' + 1791263204527;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-DN24B5T0.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DPEjA4we.js","/assets/Layout-CeXfOHFp.js","/assets/HomePage-DlqfLmah.js","/assets/sun-CEVSKw8i.js","/assets/Login-DN5vvKCH.js","/assets/languages-DPv5pj12.js","/assets/Register-1b7lTm0Q.js","/assets/ReCAPTCHA-BnmjW_v8.js","/assets/BrandLogo-Ky1k6dF_.js","/assets/CreateInspection-CpgFUa_O.js","/assets/eye-CdTinn4H.js","/assets/Inspections-BxqJbwdc.js","/assets/Dashboard-CBZyqgqw.js","/assets/clipboard-list-BH-cK99b.js","/assets/building-2-BU6bPaHW.js","/assets/InspectionDetail-Cc54QMZK.js","/assets/RiskAnalysisModal-TgAWfPff.js","/assets/CameraCaptureModal-ZirB9dTh.js","/assets/check-C5a6m4_Q.js","/assets/circle-check-big-oUo5JwKN.js","/assets/zoom-out-BM3BCE1_.js","/assets/Compliances-DE9fz7Nw.js","/assets/Mines-B8QMVwF8.js","/assets/hooks-CLA-SzMv.js","/assets/leafletAssets-BCfrQOTp.js","/assets/MineralResourcesDashboard-B2-kE9D0.js","/assets/loader-circle-XPY9LhiK.js","/assets/Contractors-BPcs10ln.js","/assets/Alerts-DeQJNIhT.js","/assets/hi-BiADQGDV.js","/assets/Analytics-CH3WMJ_C.js","/assets/PieChart-4q3rpSHo.js","/assets/Chat-Dt5pgY7R.js","/assets/bot-QG1lCW44.js","/assets/speechUtils-RH54TMh0.js","/assets/mic-BgN7r8wA.js","/assets/shield-check-TiIagpDK.js","/assets/sparkles-CyO_mQ7q.js","/assets/chevron-right-DbTzYmS3.js","/assets/Profile-DTmwB__R.js","/assets/circle-user-CBWCfltW.js","/assets/camera-DV1qmGRS.js","/assets/arrow-left-CKSDOIxy.js","/assets/Workers-Bu4__9o-.js","/assets/users-BZW7_q8D.js","/assets/bell-BgWS7jkK.js","/assets/save-wXWnj58L.js","/assets/Attendance-BoIUoWV9.js","/assets/user-check-CtvQ1RJE.js","/assets/shield-dpH1X6OT.js","/assets/search-8qeKR6Ql.js","/assets/map-pin-CyDglwr8.js","/assets/TableScrollContainer-CKfoyExQ.js","/assets/arrow-right-BGDw0h2q.js","/assets/rotate-ccw-DoLSvUdA.js","/assets/Support-D4rJfllI.js","/assets/chevron-down-D35V3mYs.js","/assets/send-Cs14ANAl.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BS-AaDBq.js","/assets/siren-CfJehKP9.js","/assets/jspdf.plugin.autotable-SoXQgTgP.js","/assets/shield-alert-CuhXoQLV.js","/assets/trash-2-C4hRgI5S.js","/assets/clipboard-check-LPFQFmT4.js","/assets/circle-check-DSiXCPh_.js","/assets/radio-DtUmUzwC.js","/assets/octagon-alert-DxSo9B9t.js","/assets/life-buoy-DCNo9280.js","/assets/phone-call-DwhImGZs.js","/assets/plus-Cn8amrPq.js","/assets/web-CsHYwkvF.js","/assets/web-vxIcjCFe.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-C7hy-hu2.js"];

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