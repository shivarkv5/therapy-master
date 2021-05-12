importScripts('/worker-polyfill.js')
self.addEventListener('install', function(event) {
    
    self.registration.unregister()
    .then(function() {
      return self.clients.matchAll();
    })
    .then(function(clients) {
      clients.forEach(client => client.navigate(client.url));
    });

    caches.delete('mue').then(function(boolean) {
      console.log('cache deleted');
      console.log('History deleted from cache');
    });

    event.waitUntil(caches.open('mue').then(function(cache) {
        return cache.addAll([
            '/',
            '/index.html',
            '/dist/build.js',
        ])
    }))
})

self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
        return response || fetch(event.request)
    }))
})