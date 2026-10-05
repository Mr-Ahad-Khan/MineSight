const SHELL_CACHE = 'minesight-shell-v' + 1791222303453;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-DJKutvle.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-Bffbem9t.js","/assets/Layout-Clw183sa.js","/assets/HomePage-B8FAcSOO.js","/assets/sun-BaarcJyd.js","/assets/Login-DNGhJdkF.js","/assets/languages-DnGW8Coy.js","/assets/Register-BY8-ooWs.js","/assets/ReCAPTCHA-t6o48iRj.js","/assets/BrandLogo-DvwD4c9Q.js","/assets/CreateInspection-C74Qe8V0.js","/assets/eye-aACxt7e9.js","/assets/Inspections-BortZfcy.js","/assets/Dashboard-OUpUTs96.js","/assets/clipboard-list-BLiLEBQ_.js","/assets/building-2-DQN1i8V1.js","/assets/InspectionDetail-CXsjK5MJ.js","/assets/RiskAnalysisModal-CowC3-Jo.js","/assets/CameraCaptureModal-D9vqwXrh.js","/assets/check-_BDzXN89.js","/assets/circle-check-big-CLlz7bvh.js","/assets/zoom-out-DEYY5RK3.js","/assets/Compliances-DS4lalIb.js","/assets/Mines-8kNT9HjY.js","/assets/hooks-BuiLbllj.js","/assets/leafletAssets-1plQdlwM.js","/assets/MineralResourcesDashboard-C-y26pRy.js","/assets/loader-circle-kAz1RRSg.js","/assets/Contractors-D1wLXDCV.js","/assets/Alerts-CyoyryPp.js","/assets/hi-BiADQGDV.js","/assets/Analytics-2_VFvhSq.js","/assets/PieChart-BfTN6h2F.js","/assets/Chat-Cw8Z9v9w.js","/assets/bot-CoXFHgRn.js","/assets/speechUtils-Bt3a60sv.js","/assets/mic-DoAmsjp7.js","/assets/shield-check-tQKn1zRJ.js","/assets/sparkles-J2Yze3Tx.js","/assets/chevron-right-cvp2vXM6.js","/assets/Profile-D6pyPWDs.js","/assets/circle-user-BdxkxDNv.js","/assets/camera-_8vIbIK_.js","/assets/arrow-left-D7z9qmFi.js","/assets/Workers-CllsTzsa.js","/assets/users-N4N9o0kP.js","/assets/bell-CmeUk5zM.js","/assets/save-DWnEUuHF.js","/assets/Attendance-Drjst-7S.js","/assets/user-check-CH2hQCUK.js","/assets/shield-Cs0RwFFQ.js","/assets/search-XJLtB4T_.js","/assets/map-pin-BEyabana.js","/assets/TableScrollContainer-DAajA4uj.js","/assets/arrow-right-C4QyTmUO.js","/assets/rotate-ccw-BEBRO3wd.js","/assets/Support-BlzkjvSs.js","/assets/chevron-down-CnAKpHk3.js","/assets/send-C8dsUnb5.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-COhZALl0.js","/assets/siren-DCamDUSv.js","/assets/jspdf.plugin.autotable-_474bmcP.js","/assets/trash-2-a6NlvDfd.js","/assets/shield-alert-C3L883OR.js","/assets/clipboard-check-7Zw74OaV.js","/assets/circle-check-CeXWRL3W.js","/assets/radio-BurzPw5W.js","/assets/octagon-alert-Q3c2qMHj.js","/assets/life-buoy-DRWj2JNG.js","/assets/phone-call-D95ZQM8N.js","/assets/plus-d4qcz6nG.js","/assets/web-DtWTP6rY.js","/assets/web-BcMu04ND.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-C4LulkNT.js"];

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