const SHELL_CACHE = 'minesight-shell-v' + 1791357688634;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-BQ4J0EjU.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-scu2ukY9.js","/assets/Layout-nCy7pXFb.js","/assets/HomePage-B-vFS8St.js","/assets/sun-TrTZR1cb.js","/assets/Login-DBtXMowF.js","/assets/languages-C_s0MKZa.js","/assets/Register-DplJd5TP.js","/assets/ReCAPTCHA-DmsJ6vhb.js","/assets/BrandLogo-DceDu44W.js","/assets/CreateInspection-B2MO28U0.js","/assets/eye-DQblmUyG.js","/assets/Inspections-Cd-Ln3hE.js","/assets/Dashboard-z276zRG-.js","/assets/clipboard-list-CdSocQMD.js","/assets/building-2-C7maJ1lM.js","/assets/InspectionDetail-DGsZPitj.js","/assets/RiskAnalysisModal-D1quMLjd.js","/assets/CameraCaptureModal-BBE6OuuF.js","/assets/check-dH0i2_dh.js","/assets/circle-check-big-DH0zEA39.js","/assets/zoom-out-C-ya48eO.js","/assets/Compliances-Brwe_Bo9.js","/assets/Mines-BGgJ1Fhj.js","/assets/hooks-CLdBKth5.js","/assets/leafletAssets-CqZ9n9Ql.js","/assets/MineralResourcesDashboard-Xa0rM0QX.js","/assets/loader-circle-D2ksQEE3.js","/assets/Contractors-B4VKQJoK.js","/assets/Alerts-NNrjAhc3.js","/assets/hi-BiADQGDV.js","/assets/Analytics-dUyaj4_o.js","/assets/PieChart-C7Qoy9pA.js","/assets/Chat-DdI8hm_W.js","/assets/bot-DxWlnAu2.js","/assets/speechUtils-Bb8q6Xoi.js","/assets/shield-check-xX77_Jfe.js","/assets/sparkles-BWtdamUK.js","/assets/mic-DRm4NE7g.js","/assets/chevron-right-klBwrs3l.js","/assets/Profile-BmX5zHfV.js","/assets/circle-user-DtSZG5JE.js","/assets/camera-c8M-PjdW.js","/assets/arrow-left-BQbhFdS5.js","/assets/Workers-j5qx_AFQ.js","/assets/users-CnbVkChV.js","/assets/bell-EWS2We2i.js","/assets/save-DgoLX2eP.js","/assets/Attendance-CMc0ZTYv.js","/assets/user-check-CdD1rQV-.js","/assets/shield-FEGxY7Ua.js","/assets/search-ZI5eDF_V.js","/assets/map-pin-Cb3rP686.js","/assets/TableScrollContainer-DwV_ECe6.js","/assets/arrow-right-I7aRPHFc.js","/assets/rotate-ccw-qNOV5YJf.js","/assets/Support-CO4ZPEji.js","/assets/chevron-down-DIYoRQ-S.js","/assets/send-BJQ0e8Er.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-PfYZOhmE.js","/assets/siren-B4Q9lwrC.js","/assets/jspdf.plugin.autotable-DiUP0eby.js","/assets/shield-alert-67VRLf8d.js","/assets/trash-2-B_AFnUR2.js","/assets/clipboard-check-DvD7HvqF.js","/assets/circle-check-BCs1QTaG.js","/assets/radio-O_UactJD.js","/assets/octagon-alert-CArT2d0c.js","/assets/life-buoy-DhDdmL3B.js","/assets/phone-call-Kav0X55e.js","/assets/plus-Da4YKndo.js","/assets/web-8hd_H72h.js","/assets/web-BhPQERkb.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-Ib6nLTT4.js"];

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