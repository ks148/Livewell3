const CACHE_NAME = 'livewell-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './bin/',
  './bin/index.html',
  './transfers/',
  './transfers/index.html',
  './putaway/',
  './putaway/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Network-first so you always get latest when online.
  // Falls back to cache when offline.
  event.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => {
        if (req.method === 'GET') cache.put(req, copy);
      });
      return res;
    }).catch(() => caches.match(req).then((m) => m || caches.match('./')))
  );
});
