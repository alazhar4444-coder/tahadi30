/* ميزان — يعمل بدون إنترنت بعد أول فتح */
const CACHE = 'mizan-v4';
const FILES = ['./', 'index.html', 'app.css?v=4', 'app.js?v=4', 'content.js?v=4', 'plan.js?v=4', 'mz3d.js?v=4', 'three.min.js?v=4', 'fonts/thmanyah-regular.otf', 'fonts/thmanyah-bold.otf', 'fonts/thmanyah-black.otf', 'icon-180.png?v=4', 'icon-512.png?v=4', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mizan-') && k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match(e.request, { ignoreSearch: true })).then(r => r || caches.match('index.html'))));
});
