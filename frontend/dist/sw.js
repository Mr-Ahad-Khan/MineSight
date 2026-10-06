const SHELL_CACHE = 'minesight-shell-v' + 1791269873145;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-C46mNvUN.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-q2SUs41l.js","/assets/Layout-DJW-1cGt.js","/assets/HomePage-DJXiZl8Z.js","/assets/sun-C_f1iz4e.js","/assets/Login-BRCSkMbI.js","/assets/languages-BOqckmKq.js","/assets/Register-QrABjc3d.js","/assets/ReCAPTCHA-Cwnd0YBL.js","/assets/BrandLogo-IoQtfNay.js","/assets/CreateInspection-BKp8GHv4.js","/assets/eye-C8yKl1cB.js","/assets/Inspections-DHxFEEf_.js","/assets/Dashboard-D-t9w8k6.js","/assets/clipboard-list-Dho4XOI-.js","/assets/building-2-p_eWTu8Z.js","/assets/InspectionDetail-DdrQkrXd.js","/assets/RiskAnalysisModal-DtBiNiFZ.js","/assets/CameraCaptureModal-pkPxFQJ-.js","/assets/check-CyKLE6Nt.js","/assets/circle-check-big-1opGDn28.js","/assets/zoom-out-DsYwbAkx.js","/assets/Compliances-BvM-AYBV.js","/assets/Mines-DG-yo2YU.js","/assets/hooks-BWPa9rzl.js","/assets/leafletAssets-cA1WHUM4.js","/assets/MineralResourcesDashboard-DrQaOGsx.js","/assets/loader-circle-wTBQYH_l.js","/assets/Contractors-C00K8OAs.js","/assets/Alerts-BIm398-x.js","/assets/hi-BiADQGDV.js","/assets/Analytics-B2KVGxMV.js","/assets/PieChart-BVRz9TR6.js","/assets/Chat-bynl3KCp.js","/assets/bot-CUEaNq7T.js","/assets/speechUtils-BLMjFuI8.js","/assets/mic-o-Wxj82u.js","/assets/shield-check-Ck9shWax.js","/assets/sparkles-DTE_LNnb.js","/assets/chevron-right-BeqTs_JN.js","/assets/Profile-BCWWGBsr.js","/assets/circle-user-PwRkCWo-.js","/assets/camera-DZCxBCPz.js","/assets/arrow-left-D0QDFKps.js","/assets/Workers-Ddp33LDg.js","/assets/users-C_QfGm9A.js","/assets/bell-d0TBquOU.js","/assets/save-vd29Kfn1.js","/assets/Attendance-CvFjn684.js","/assets/user-check-CtC21A9b.js","/assets/shield-Cd890R23.js","/assets/search-C-pY2Suf.js","/assets/map-pin-DXIeO1FH.js","/assets/TableScrollContainer-CpAnD6TT.js","/assets/arrow-right-tiM766Eg.js","/assets/rotate-ccw-BFA4n6-0.js","/assets/Support-Du1YxAN4.js","/assets/chevron-down-4B4vhnXL.js","/assets/send-DeKiauNG.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-C76Aw78x.js","/assets/siren-2sW7cjAG.js","/assets/jspdf.plugin.autotable-Dd0NMKJ4.js","/assets/shield-alert-BbjWkt0g.js","/assets/trash-2-B-6K4TRf.js","/assets/clipboard-check-DgQB_ybA.js","/assets/circle-check-DibeDqvJ.js","/assets/radio-C7KgNK0i.js","/assets/octagon-alert-BYxjRjlT.js","/assets/life-buoy-ClKd0Rt9.js","/assets/phone-call-CPMXS7Fz.js","/assets/plus-B0QjaWng.js","/assets/web-BrjDYadf.js","/assets/web-B-Nt1XiL.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DqQ_ZFSt.js"];

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