const SHELL_CACHE = 'minesight-shell-v' + 1791230585866;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-DJKutvle.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-DnF3QxVF.js","/assets/Layout-DbAMtx9Y.js","/assets/HomePage-Dco9TmGt.js","/assets/sun-5go_Cek6.js","/assets/Login-CxeTfM16.js","/assets/languages-CDT7QCaG.js","/assets/Register-BcEXcFAl.js","/assets/ReCAPTCHA-CfBx5Lst.js","/assets/BrandLogo-Dt72MxrB.js","/assets/CreateInspection-D2mxobDv.js","/assets/eye-Dk3gvhH3.js","/assets/Inspections-CvxvLFfw.js","/assets/Dashboard-CqTw4iGp.js","/assets/clipboard-list-D-YIqEHd.js","/assets/building-2-DagBel9T.js","/assets/InspectionDetail-DmJ1zEzZ.js","/assets/RiskAnalysisModal-Duo-kli1.js","/assets/CameraCaptureModal-CXodFSVo.js","/assets/check-DwCtGPp5.js","/assets/circle-check-big-TGlDc5x4.js","/assets/zoom-out-J7HU6XGm.js","/assets/Compliances-BMK2yzcJ.js","/assets/Mines-CsEaNNpo.js","/assets/hooks-ySz5j4Ny.js","/assets/leafletAssets-ZAGAiw5E.js","/assets/MineralResourcesDashboard-Cw_25zvg.js","/assets/loader-circle-DFW079JY.js","/assets/Contractors-CPK2meBW.js","/assets/Alerts-CAbqRtCA.js","/assets/hi-BiADQGDV.js","/assets/Analytics-BGML_JQ7.js","/assets/PieChart-GmJQuJfu.js","/assets/Chat-B7feOQm8.js","/assets/bot-VCZ9fdo7.js","/assets/speechUtils-BH54iq_G.js","/assets/mic-BpNJHF88.js","/assets/shield-check-CtjDwcoe.js","/assets/sparkles-8BPEFFWc.js","/assets/chevron-right-BB2u-bX0.js","/assets/Profile-DFWkiZS3.js","/assets/circle-user-Bs7PCTsz.js","/assets/camera-C5pF_Pd4.js","/assets/arrow-left-DZ1TrA0b.js","/assets/Workers-CGnc-SVs.js","/assets/users-BufLWdD3.js","/assets/bell-B57oLZC9.js","/assets/save-TmUrIcO7.js","/assets/Attendance-XtEuRF3_.js","/assets/user-check-C5U1uHEH.js","/assets/shield-lCfsfAXU.js","/assets/search-C3o-lzu7.js","/assets/map-pin-119LWNlB.js","/assets/TableScrollContainer-BvxbSgWP.js","/assets/arrow-right-DeibeW9A.js","/assets/rotate-ccw-DMvdpBXL.js","/assets/Support-BKz_0USE.js","/assets/chevron-down-BBcYYkaS.js","/assets/send-hWfOsK6w.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-CCfzWMv-.js","/assets/siren-CVxoFYRm.js","/assets/jspdf.plugin.autotable-C2zVbsit.js","/assets/trash-2-Cj3DhxXq.js","/assets/shield-alert-C4JwAsDo.js","/assets/clipboard-check-DdIRbjWm.js","/assets/circle-check-CD2wtt0h.js","/assets/radio-BgYlRUzR.js","/assets/octagon-alert-3ZHr-iQd.js","/assets/life-buoy-CLf1vJIs.js","/assets/phone-call-Bgpww2YE.js","/assets/plus-DaC1O40f.js","/assets/web-BpdfUmYx.js","/assets/web-9QVDBmEA.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-BUplb0-W.js"];

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