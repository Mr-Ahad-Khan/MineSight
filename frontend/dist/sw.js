const SHELL_CACHE = 'minesight-shell-v' + 1791166961634;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-1X4YrEjH.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-GqNsfFmv.js","/assets/Layout-BMbaxDi5.js","/assets/HomePage-CMkTQrup.js","/assets/sun-uX51GKwF.js","/assets/Login-CPU_lIBg.js","/assets/languages-Bx6HPo-U.js","/assets/Register-DcOHlUuy.js","/assets/ReCAPTCHA-uRw25Ndi.js","/assets/BrandLogo-CVM6uxZj.js","/assets/CreateInspection-BzjaLvMO.js","/assets/eye-ChiZkDsx.js","/assets/Inspections-64o1NnzR.js","/assets/Dashboard-D7e-xRIU.js","/assets/clipboard-list-BCD53i4J.js","/assets/building-2-Ba__p8on.js","/assets/InspectionDetail-B65kkP4G.js","/assets/RiskAnalysisModal-0grgLq52.js","/assets/CameraCaptureModal-C2FcxHYA.js","/assets/check-DRSi8QO1.js","/assets/circle-check-big-BwVNMjZT.js","/assets/zoom-out-BJuli_HU.js","/assets/Compliances-DKAyIcke.js","/assets/Mines-B8vHYnm0.js","/assets/hooks-Bx6ncwsD.js","/assets/leafletAssets-BnhOzgYC.js","/assets/MineralResourcesDashboard-Biqz-ic0.js","/assets/loader-circle-BhksP2W7.js","/assets/Contractors-eKA-AHIi.js","/assets/Alerts-CzXDd-kK.js","/assets/hi-BiADQGDV.js","/assets/Analytics-ComHnLNj.js","/assets/PieChart-mNoxEx4T.js","/assets/Chat-y-7qX8Xn.js","/assets/bot-ByugqiAu.js","/assets/volume-x-CVE6NEe9.js","/assets/mic-DYRp9nm8.js","/assets/shield-check-Da3MKtWl.js","/assets/sparkles-DadcyV_Y.js","/assets/chevron-right-AKUW5KVx.js","/assets/Profile-CWy6I_n0.js","/assets/circle-user-MF-w5czy.js","/assets/camera-D8mMJKEg.js","/assets/arrow-left-DLi-BUop.js","/assets/Workers-sgQmCtXK.js","/assets/users-CKAMp4_I.js","/assets/bell-CEsd9dfG.js","/assets/save-D99EOnRC.js","/assets/Attendance-DpFtivC9.js","/assets/user-check-CEa0ouUE.js","/assets/shield-CwNCE0nC.js","/assets/search-CV_VimmQ.js","/assets/map-pin-B0biQVeJ.js","/assets/TableScrollContainer-C-BsjUdm.js","/assets/arrow-right-Cg5LO1lp.js","/assets/rotate-ccw-CeseDruZ.js","/assets/Support-Go9GF6qQ.js","/assets/chevron-down-BSGd_Ucf.js","/assets/send-CzHOB12t.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-D_DNev99.js","/assets/siren-DPu4WhHx.js","/assets/shield-alert-COS4uTRw.js","/assets/clipboard-check-DWMo26zH.js","/assets/circle-check-COjFuzUL.js","/assets/radio-CMN3lq29.js","/assets/x-Ch7G-iFW.js","/assets/octagon-alert-CNcrzjQl.js","/assets/life-buoy-CZ8SccHI.js","/assets/phone-call-Cg0xvYB1.js","/assets/plus-QPXUYXv1.js","/assets/translations-DZ8A6dW-.js","/assets/web-G7RUjBlm.js","/assets/web-DXIHp3i-.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DrRPu3X1.js"];

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