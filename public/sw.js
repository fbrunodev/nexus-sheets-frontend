self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'Nexus Sheets', body: 'Nova notificação' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard'));
});
