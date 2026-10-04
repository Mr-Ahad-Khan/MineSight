const SHELL_CACHE = 'minesight-shell-v' + 1791113092829;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-D9NMn2-z.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BcVXYrqL.js","/assets/Layout-iiRyEuvw.js","/assets/HomePage-D9wNrrdo.js","/assets/sun-Dt3GArDq.js","/assets/Login-BDFmzTjR.js","/assets/languages-DoCh3pp3.js","/assets/Register-BnvDUklE.js","/assets/ReCAPTCHA-VDdm-KM2.js","/assets/BrandLogo-B5rTvxVu.js","/assets/Dashboard-ubKfwz0D.js","/assets/clipboard-list-Bl1uUHph.js","/assets/building-2-B21_56-M.js","/assets/Inspections-BguhVmVD.js","/assets/CreateInspection-DWhVT5EE.js","/assets/InspectionDetail-DyBTSB_v.js","/assets/circle-check-big-BiHoKp7v.js","/assets/RiskAnalysisModal-CZG4C4Ag.js","/assets/check-Ch-w4Itw.js","/assets/triangle-alert-B4e52BWX.js","/assets/zoom-out-BJ-j9FFC.js","/assets/Compliances-C3KB_9NV.js","/assets/Mines-c8d4UtCj.js","/assets/hooks-HsswfMOe.js","/assets/leafletAssets-CEZQDyMF.js","/assets/MineralResourcesDashboard-o2zGpHrJ.js","/assets/loader-circle-DSYh1Fj5.js","/assets/Contractors-DaVgxr4Z.js","/assets/Alerts-CvQfV8eT.js","/assets/hi-BiADQGDV.js","/assets/Analytics-fZn1o0IK.js","/assets/PieChart-x8avdCqb.js","/assets/Chat-5-Y-Q3XV.js","/assets/bot-3KT1uRFT.js","/assets/volume-x-DSTVWUPt.js","/assets/mic-DTmR_Boj.js","/assets/shield-check-ClNw0ura.js","/assets/sparkles-C5fSgKcd.js","/assets/chevron-right-DQWjewVO.js","/assets/Profile-CZcVxOiJ.js","/assets/circle-user-wX3Qtqgo.js","/assets/arrow-left-DjQn1txa.js","/assets/camera-Bg2Q5UZj.js","/assets/Workers-B4c6Tcm3.js","/assets/users-CffSKzSm.js","/assets/bell-BjgZrL9r.js","/assets/save-Iz2jym8X.js","/assets/Attendance-4ms9NJpQ.js","/assets/log-out-A5gKGD26.js","/assets/user-check-BPNINL3I.js","/assets/shield-mWhzYwHI.js","/assets/search-D8hQjIRH.js","/assets/x-B_zsEGf0.js","/assets/map-pin-DnfvMc_2.js","/assets/TableScrollContainer-GYPI6GT5.js","/assets/arrow-right-DKHcJ4y0.js","/assets/rotate-ccw-36RR3Mkj.js","/assets/Support-Ba2Eg50e.js","/assets/chevron-down-Cz2wlux1.js","/assets/send-EddDuGjh.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-oaZ4AQj5.js","/assets/siren-BSscTW-5.js","/assets/shield-alert-BWVCas-r.js","/assets/clipboard-check-yQHerKmc.js","/assets/circle-check-DHscdEQO.js","/assets/radio-DC0gPN3y.js","/assets/octagon-alert-DBdepEdm.js","/assets/life-buoy-BeEGT0Qx.js","/assets/phone-call-C9PvYqil.js","/assets/plus-DBUMixFo.js","/assets/translations-m0cHdOZ5.js","/assets/web-BSGn_DfL.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-vzo42t7U.js"];

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