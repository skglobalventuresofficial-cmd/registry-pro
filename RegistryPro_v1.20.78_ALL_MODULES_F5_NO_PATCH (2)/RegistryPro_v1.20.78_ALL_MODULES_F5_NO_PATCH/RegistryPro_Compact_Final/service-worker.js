/* Legacy service-worker retirement. Registry Pro now loads direct source files. */
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(names=>Promise.all(names.map(name=>caches.delete(name))))
    .then(()=>self.registration.unregister())
    .then(()=>self.clients.claim())
));
