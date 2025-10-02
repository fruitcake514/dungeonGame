const CACHE_NAME = 'dungeon-crawler-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/game.js',
  'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js',
  'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.59/dist/rexvirtualjoystickplugin.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});