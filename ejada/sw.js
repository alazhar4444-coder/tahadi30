/* أهدافي — يعمل بدون إنترنت بعد أول فتح */
const CACHE = 'ejada-v2';
const FILES = ['./', 'index.html', 'app.css?v=2', 'app.js?v=2', 'content.js?v=2', 'fonts/thmanyah-regular.otf', 'fonts/thmanyah-bold.otf', 'fonts/thmanyah-black.otf', 'ejada-logo.png', 'ejada-logo-w.png', 'icon-180.png', 'icon-512.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ejada-') && k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match(e.request, { ignoreSearch: true })).then(r => r || caches.match('index.html'))));
});
