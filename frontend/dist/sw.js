const SHELL_CACHE = 'minesight-shell-v' + 1791192144398;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/","/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/minesight-logo-light.svg","/coal-miners.webp","/assets/index-Ch_F0SEL.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-BDf5faEF.js","/assets/Layout-Bb-jSiTc.js","/assets/HomePage-CpXuNoZd.js","/assets/sun-BIu_Hj_8.js","/assets/Login-DWcFDZNN.js","/assets/languages-DyJqBc0o.js","/assets/Register-D5un8_sL.js","/assets/ReCAPTCHA-CD3fBMH1.js","/assets/BrandLogo-DGIGnY3i.js","/assets/CreateInspection-DvDdQ-UB.js","/assets/eye-DOBH2LUP.js","/assets/Inspections-CIlfbtSM.js","/assets/Dashboard-Cg_nZnhD.js","/assets/clipboard-list-INUPk8Jc.js","/assets/building-2-Db7736U1.js","/assets/InspectionDetail-xDMTfJmB.js","/assets/RiskAnalysisModal-BN-_M3MP.js","/assets/CameraCaptureModal-BOEUDBas.js","/assets/check-aWOYLGvD.js","/assets/circle-check-big-C5YUWNL4.js","/assets/zoom-out-YCtAj0KI.js","/assets/Compliances-o1TjUd4w.js","/assets/Mines-BK2W4pKl.js","/assets/hooks-CofZC42L.js","/assets/leafletAssets-D2t4v2sd.js","/assets/MineralResourcesDashboard-CEtWOeJ9.js","/assets/loader-circle-DwSEjEtP.js","/assets/Contractors-BxLK0dZX.js","/assets/Alerts-kP81BM-t.js","/assets/hi-BiADQGDV.js","/assets/Analytics-DptB9s6E.js","/assets/PieChart-wVOh1A3v.js","/assets/Chat-BbogRZPj.js","/assets/bot-SLzHnRUj.js","/assets/volume-x-4B7WVdJw.js","/assets/mic-BBao9aqf.js","/assets/shield-check-C3nPRf9q.js","/assets/sparkles-Ct9FTa_K.js","/assets/chevron-right-CXVX2scv.js","/assets/Profile-BsuKD7Il.js","/assets/circle-user-CE0yhLM0.js","/assets/camera-D05ozXXK.js","/assets/arrow-left-ByACcZZa.js","/assets/Workers-lLa4Gfgg.js","/assets/users-6-Auk9cN.js","/assets/bell-B6OkXE2r.js","/assets/save-qT0qty44.js","/assets/Attendance-JywLA6Sp.js","/assets/user-check-D_OGb9yc.js","/assets/shield-BAHJHadT.js","/assets/search-78IOpfCm.js","/assets/map-pin-DrFAuOP4.js","/assets/TableScrollContainer-HFHk4Rd_.js","/assets/arrow-right-DjvHqPD9.js","/assets/rotate-ccw-DZwLyvwn.js","/assets/Support-CvxcCOFF.js","/assets/chevron-down-DdoDnwLd.js","/assets/send-D8JNlTmD.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-qP3K7Bam.js","/assets/siren-DP5SFPnF.js","/assets/trash-2-DrX-Cv7C.js","/assets/shield-alert-WAeF1Roi.js","/assets/clipboard-check-24abuyUm.js","/assets/circle-check-DjENiJLs.js","/assets/radio-B_fhCRUo.js","/assets/x-THCLVU_E.js","/assets/octagon-alert-BP33yaCJ.js","/assets/life-buoy-BhpY8aio.js","/assets/phone-call-BDePNPTJ.js","/assets/plus-CZnUPGxU.js","/assets/translations-DZ8A6dW-.js","/assets/web-DSTWEbRG.js","/assets/web-D4k4m9Ci.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-UO9rD-Tj.js"];

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