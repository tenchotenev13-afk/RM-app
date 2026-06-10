var CACHE = 'temax-v3';
var REMINDER_HOURS = [8, 14, 17];
var DAY_BG = ['Неделя','Понеделник','Вторник','Сряда','Четвъртък','Петък','Събота'];

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
    }).catch(function() {
      return fetch(e.request);
    })
  );
});

// Periodic Background Sync — fires even when app is closed
self.addEventListener('periodicsync', function(e) {
  if (e.tag === 'temax-reminder') {
    e.waitUntil(checkAndNotify());
  }
});

function checkAndNotify() {
  var now = new Date();
  var h = now.getHours();
  var dow = now.getDay();
  if (dow === 0 || dow === 6) return Promise.resolve();
  if (REMINDER_HOURS.indexOf(h) === -1) return Promise.resolve();

  var labels = {8:'Сутрешни задачи ☀️', 14:'Следобедни задачи 🕑', 17:'Краен преглед 🏁'};
  var label = labels[h] || 'Напомняне';

  return self.registration.showNotification('ТеМАХ РМ — ' + label, {
    body: 'Провери незавършените задачи за ' + DAY_BG[dow],
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'temax-' + h,
    renotify: true,
    requireInteraction: false,
    actions: [
      {action: 'open', title: 'Отвори'},
      {action: 'dismiss', title: 'Затвори'}
    ]
  });
}

// Push notifications from server
self.addEventListener('push', function(e) {
  var d = e.data ? e.data.json() : {title:'ТеМАХ РМ', body:'Напомняне'};
  e.waitUntil(
    self.registration.showNotification(d.title, {
      body: d.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: d.tag || 'temax',
      renotify: true
    })
  );
});

// Messages from the page
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    e.waitUntil(
      self.registration.showNotification(e.data.title, {
        body: e.data.body,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        renotify: true
      })
    );
  }
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({type:'window'}).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes('RM-app') && 'focus' in list[i]) {
          return list[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
