/* ميزان — يعمل بدون إنترنت بعد أول فتح */
const CACHE = 'mizan-v3';
const FILES = ['./', 'index.html', 'app.css?v=3', 'app.js?v=3', 'content.js?v=3', 'plan.js?v=3', 'mz3d.js?v=3', 'three.min.js?v=3', 'fonts/thmanyah-regular.otf', 'fonts/thmanyah-bold.otf', 'fonts/thmanyah-black.otf', 'icon-180.png', 'icon-512.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mizan-') && k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match(e.request, { ignoreSearch: true })).then(r => r || caches.match('index.html'))));
});
