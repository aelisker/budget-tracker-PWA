const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/index.js",
  "./js/chart.js",
  "./js/idb.js",
  "./manifest.json",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png"
];
const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// listen for install, wait for promise response from opening cache and installing
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('installing cache: ' + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  )
});

// listen for activate
self.addEventListener('activate', function(e) {
  e.waitUntil(
    // is item already cached?
    caches.keys().then(function(keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      });
      cacheKeeplist.push(CACHE_NAME);

      // delete caches that aren't in cachekeeplist
      return Promise.all(keyList.map(function(key, i) {
        if (cacheKeeplist.indexOf(key) === -1) {
          console.log('deleting cache : ' + keyList[i]);
          return caches.delete(keyList[i]);
        }
      }))
        .catch(err => console.log(err));
    })
  )
});

self.addEventListener('fetch', function(e) {
  console.log('fetch request : ' + e.request.url)
  e.respondWith(
    caches.match(e.request).then(function(request) {
      // determine is item is cached or not, respond either with cached item or make request to url of resource
      if (request) {
        console.log('responding with cache : ' + e.request.url);
        return request;
      } else {
        console.log('file is not cached, fetching : ' + e.request.url);
        return fetch(e.request);
      }
    // You can omit if/else for console.log & put one line below like this too.
    // return request || fetch(e.request)
    })
  )
})

// these were all used for troubleshooting - taken from web.dev
self.onerror = function(message) {
  console.log(message);
};

self.addEventListener('install', (event) => {
  console.log('Inside the install handler:', event);
});

self.addEventListener('activate', (event) => {
  console.log('Inside the activate handler:', event);
});

self.addEventListener(fetch, (event) => {
  console.log('Inside the fetch handler:', event);
});