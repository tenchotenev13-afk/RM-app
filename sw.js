const CACHE = 'temax-v1';
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE)));
self.addEventListener('fetch', e => e.respondWith(
  caches.match(e.request).then(r => r || fetch(e.request))
));
self.addEventListener('push', e => {
  const d = e.data ? e.data.json() : {title:'ТеМАХ', body:'Напомняне'};
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body, icon: '/icon.png', badge: '/icon.png',
    tag: d.tag || 'temax', data: d
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});
