var CACHE = 'temax-v2';

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request);
    })
  );
});

self.addEventListener('push', function(e) {
  var d = e.data ? e.data.json() : {title:'ТеМАХ РМ', body:'Напомняне'};
  e.waitUntil(
    self.registration.showNotification(d.title, {
      body: d.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: d.tag || 'temax'
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});

// Handle showNotification messages from the page
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    e.waitUntil(
      self.registration.showNotification(e.data.title, {
        body: e.data.body,
        icon: 'icon-192.png'
      })
    );
  }
});
