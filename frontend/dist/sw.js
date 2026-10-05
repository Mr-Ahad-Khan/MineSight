const SHELL_CACHE = 'minesight-shell-v' + 1791200425715;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-C-dP_cqb.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DhXlPiM1.js","/assets/Layout-COq3c__v.js","/assets/HomePage-BvDwr04d.js","/assets/sun-BmaYQpjS.js","/assets/Login-BxuG8Dbh.js","/assets/languages-BLyMELny.js","/assets/Register-6DH23s0D.js","/assets/ReCAPTCHA-DHi1pSuk.js","/assets/BrandLogo-DvXZLJWQ.js","/assets/CreateInspection-DrrZ9eMq.js","/assets/eye-DYzia3Nb.js","/assets/Inspections-Duo6Y6lF.js","/assets/Dashboard-Dz1UwGwB.js","/assets/clipboard-list-B8h2cOVQ.js","/assets/building-2-DD66M_fy.js","/assets/InspectionDetail-CARED65m.js","/assets/RiskAnalysisModal-Dh0sphEn.js","/assets/CameraCaptureModal-DC8EvxUW.js","/assets/check-mVtoxwt1.js","/assets/circle-check-big-kx2qe6o2.js","/assets/zoom-out-CSzRZnmO.js","/assets/Compliances-DZSF5OCx.js","/assets/Mines-CENnrcJS.js","/assets/hooks-Dwst7HiL.js","/assets/leafletAssets-0IjfLTqR.js","/assets/MineralResourcesDashboard-BRm2Y2Vh.js","/assets/loader-circle-PuEOxQ_7.js","/assets/Contractors-z_riHZMj.js","/assets/Alerts-C9cKQFtZ.js","/assets/hi-BiADQGDV.js","/assets/Analytics-D3RSts22.js","/assets/PieChart-CtxYefvn.js","/assets/Chat-CWij4J_f.js","/assets/bot-yK-qvS2y.js","/assets/speechUtils-lpjFaEIz.js","/assets/mic-BCuejUdU.js","/assets/shield-check-CGngSW1N.js","/assets/sparkles-6vrPX9F5.js","/assets/chevron-right-CrKnmFAz.js","/assets/Profile-BTq9pICO.js","/assets/circle-user-V72mouga.js","/assets/camera-BZBo1wQn.js","/assets/arrow-left-U6GXEDD_.js","/assets/Workers-BaiVe-YI.js","/assets/users-DMx1ZDWc.js","/assets/bell-CMGxXY-k.js","/assets/save-DLA5k0aO.js","/assets/Attendance-Dby7xw5-.js","/assets/user-check-DA9FCHby.js","/assets/shield-8g7vTLMH.js","/assets/search-Csc7wsrf.js","/assets/map-pin-DuH6_V_z.js","/assets/TableScrollContainer-l4zuBo_q.js","/assets/arrow-right-B1GYt7Wv.js","/assets/rotate-ccw-CMvmb7Pv.js","/assets/Support-BawWDecN.js","/assets/chevron-down-BXSpwU83.js","/assets/send-CVIuUB8j.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-BtmerjT-.js","/assets/siren-CLHhf_Zo.js","/assets/fileDownloader-9vWzA7mr.js","/assets/trash-2-JvhouahW.js","/assets/shield-alert-CWc_qMD6.js","/assets/clipboard-check-15Du7yuj.js","/assets/circle-check-nWUPPr2y.js","/assets/radio-qQdX66aI.js","/assets/x-Jy24rSXc.js","/assets/octagon-alert-DlIrEHG6.js","/assets/life-buoy-1UvJOFzy.js","/assets/phone-call-CvyDYfgH.js","/assets/plus-BUoG2DN_.js","/assets/translations-DZ8A6dW-.js","/assets/web-B-Cd_EN3.js","/assets/web-DBO9IKwT.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-C4I2w4RZ.js"];

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