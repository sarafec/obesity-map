/** SERVICE WORKER EVENTS **/
// adds files to cache
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll([
                '/obesity-map/',
                '/obesity-map/index.html',
                '/obesity-map/styles.css',
                '/obesity-map/map.js',
                '/obesity-map/service-worker.js',
                '/obesity-map/world.geo.json',
                '/obesity-map/obesity.json'
            ]);
        })
    );
});

// listens for fetch event and responds accordingly
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            // if the file is found, return it
            if (response !== undefined) {
                return response;

            // otherwise request file and add to the cache
            } else {
                return fetch(event.request).then(function (response) {

                    let responseClone = response.clone();
                    caches.open('v1').then(function (cache) {
                        cache.put(event.request, responseClone);
                    });
                    
                    return response;
                });
            }
        })
    );
});