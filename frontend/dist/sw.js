const SHELL_CACHE = 'minesight-shell-v' + 1791045014736;
const TILE_CACHE = 'minesight-tiles-v1';
const FONT_CACHE = 'minesight-fonts-v1';
const RUNTIME_CACHE = 'minesight-runtime-v1';
const PRECACHE_URLS = ["/index.html","/manifest.webmanifest","/minesight-icon.svg","/minesight-logo.svg","/coal-miners.webp","/assets/index-9_3xxYRw.css","/assets/leafletAssets-Dgihpmma.css","/assets/index-C0qZxCDh.js","/assets/Layout-DiQf8nxC.js","/assets/HomePage-CgC5hKMu.js","/assets/sun-BBNr0bPu.js","/assets/Login-NOBIdFkf.js","/assets/languages-DEPW7UA1.js","/assets/Register-BM4ufC0p.js","/assets/ReCAPTCHA-Cloicmva.js","/assets/BrandLogo-DzmTgXBM.js","/assets/Dashboard-Bcpq4S6C.js","/assets/clipboard-list-noT8p0fG.js","/assets/building-2-BefrFc0b.js","/assets/Inspections-B2g87QrF.js","/assets/CreateInspection-BUUGpbwk.js","/assets/InspectionDetail-CcB17amq.js","/assets/circle-check-big-Cr0jaqVn.js","/assets/imageCompressor-B0F6SUGn.js","/assets/zoom-out-BOGbNSzR.js","/assets/Compliances-Bfl6_1s0.js","/assets/Mines-Cv7WhFJC.js","/assets/hooks-ClLi9RB2.js","/assets/leafletAssets-D25FKhDG.js","/assets/MineralResourcesDashboard-IKh4YECe.js","/assets/loader-circle-C9Xy6oe8.js","/assets/Contractors-8UOrEsOD.js","/assets/Alerts-Do72IQb7.js","/assets/hi-BiADQGDV.js","/assets/Analytics-Cr_5GM1z.js","/assets/PieChart-B6V8oOg3.js","/assets/Chat-N3f-uSjD.js","/assets/bot-u4LaLRrO.js","/assets/volume-x-Bgwi4q2W.js","/assets/mic-C0vPYZ23.js","/assets/shield-check-DhBluJKb.js","/assets/chevron-right-C2vWlu4w.js","/assets/Profile-Nj2orYS2.js","/assets/circle-user-9C6KCbKu.js","/assets/camera-B5iEMtvo.js","/assets/arrow-left-CNFAV3e5.js","/assets/Workers-DAbAQpC3.js","/assets/users-C36vEXk_.js","/assets/bell-udvT_T_w.js","/assets/save-Dd_BAVLy.js","/assets/Attendance-CuNa0EK7.js","/assets/log-out-DkJ5nZbj.js","/assets/shield-DieAOCEG.js","/assets/user-check-CHVzF7QT.js","/assets/search-BPSRLNRm.js","/assets/x-CS2C2LS6.js","/assets/map-pin-CejTR165.js","/assets/TableScrollContainer-DYDtjXIx.js","/assets/arrow-right-CwdL8nHu.js","/assets/Support-BZEn9xrS.js","/assets/chevron-down-C7j64li6.js","/assets/send-CwdwE7xU.js","/assets/format-B1Lg2MPm.js","/assets/en-US-BnG8yBpZ.js","/assets/DisasterManagement-G8i3eL5C.js","/assets/siren-CeGyOwgg.js","/assets/shield-alert-BYGSiPDk.js","/assets/clipboard-check-CN4whFvG.js","/assets/circle-check-D7sIsvbT.js","/assets/radio-BM9QitI6.js","/assets/octagon-alert-BqNr6ePO.js","/assets/life-buoy-tz-tEywo.js","/assets/phone-call-awi9_mu0.js","/assets/plus-wzHISaYl.js","/assets/translations-Bkk7MiZ9.js","/assets/web-CQHcf0BC.js","/assets/html2canvas.esm-DXEQVQnt.js","/assets/purify.es-BPuvlvQ_.js","/assets/index.es-DwihfznL.js"];

const FALLBACK_TILE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#e9ecef" stroke="#ced4da" stroke-width="0.5"/><path d="M 0,64 L 256,64 M 0,128 L 256,128 M 0,192 L 256,192 M 64,0 L 64,256 M 128,0 L 128,256 M 192,0 L 192,256" stroke="#dee2e6" stroke-width="0.5"/><text x="128" y="132" font-family="sans-serif" font-size="10" fill="#adb5bd" text-anchor="middle">MineSight Offline Grid</text></svg>';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => null)),
      );
      return results;
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
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res && res.status === 200) cache.put(request, res.clone());
            return res;
          }).catch(() => caches.match(request));
        })
      )
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        return cachedIndex || new Response('Offline app shell ready', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const responseCopy = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseCopy));
            }
            return response;
          })
          .catch(() => caches.match('/index.html'));
      }),
    );
  }
});