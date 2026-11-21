const C='monasiq-v6';const A=['./','index.html','app.css?v=4','app.js?v=4','me.png?v=1','mark-g.png?v=1','logo-w.png?v=1','icon-180.png?v=6','fonts/thmanyah-regular.otf','fonts/thmanyah-bold.otf','fonts/thmanyah-black.otf'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(w=>w[0]?w[0].focus():clients.openWindow('./')))});
