const CACHE_NAME = "guaguatime-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./app.css",
  "./js/main.js",
  "./js/ui.js",
  "./js/dataService.js",
  "./config.json",
  "./js/diccionario.json"
];

// instalar
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// fetch
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});