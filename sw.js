const STATIC_CACHE = "pickle-panic-static-v7";
const RUNTIME_CACHE = "pickle-panic-runtime-v1";
const DATA_CACHE = "pickle-panic-data-v1";
const APP_ASSETS = [
  "./",
  "/",
  "/?source=pwa",
  "./index.html",
  "/index.html",
  "./manifest.webmanifest",
  "/manifest.webmanifest",
  "./public/game.js",
  "/public/game.js",
  "./public/levels.js",
  "/public/levels.js",
  "./public/assets/pwa/icon-192.svg",
  "./public/assets/pwa/icon-512.svg",
  "./public/assets/pwa/splash.svg",
  "./public/assets/images/pickle.svg",
  "./public/assets/images/knife.svg",
  "./public/assets/images/bread.svg",
  "./public/assets/images/sandwich.svg",
  "./public/assets/images/ground.svg",
  "./public/assets/images/ground_w2.svg",
  "./public/assets/images/ground_w3.svg",
  "./public/assets/images/trap_6.svg",
  "./public/assets/images/trap_7.svg",
  "./public/assets/images/trap_8.svg",
  "./public/assets/images/trap_9.svg",
  "./public/assets/images/condiment.svg",
  "./public/assets/images/meat.svg",
  "./public/assets/images/cheese.svg",
  "./public/assets/audio/music_world1.wav",
  "./public/assets/audio/music_world2.wav",
  "./public/assets/audio/music_world3.wav",
  "./public/assets/audio/jump.wav",
  "./public/assets/audio/collect.wav",
  "./public/assets/audio/hit.wav",
  "./public/assets/audio/bread.wav",
  "./public/assets/audio/click.wav"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE && key !== DATA_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, responseCopy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);
          if (cachedPage) {
            return cachedPage;
          }
          return caches.match("/index.html") || caches.match("./index.html");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, responseCopy));
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
