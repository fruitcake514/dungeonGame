const CACHE_NAME = 'ember-blade-v11';
const ASSETS = [
    './',
    './index.html',
    './main.js',
    './Scenes.js',
    './Dungeon.js',
    './constants.js',
    './utils.js',
    './manifest.json',
    './assets/sprites/player.svg',
    './assets/sprites/slime.svg',
    './assets/sprites/skeleton.svg',
    './assets/sprites/zombie.svg',
    './assets/sprites/projectile.svg',
    './assets/sprites/coin.svg',
    './assets/sprites/potion.svg',
    './assets/sprites/portal.svg',
    './assets/sprites/floor.svg',
    './assets/sprites/wall.svg',
    './assets/sprites/solid.svg',
    './assets/sprites/lantern.svg',
    './assets/sprites/weapon_blade.svg',
    './assets/sprites/weapon_wand.svg',
    './assets/sprites/mini_boss.svg',
    './assets/sprites/major_boss.svg',
    './assets/sprites/light_mask.svg',
    './assets/sprites/ground_glow_mask.svg',
    './assets/audio/music_cozy.ogg',
    './assets/audio/music_ambient_lofi.ogg',
    './assets/audio/sfx_shoot.ogg',
    './assets/audio/sfx_hit.ogg',
    './assets/audio/sfx_heal.ogg',
    './assets/audio/sfx_level_clear.ogg',
    './assets/audio/sfx_player_hurt.ogg',
    './assets/audio/sfx_slime_move.ogg',
    './assets/audio/sfx_skeleton_creak.ogg',
    './assets/audio/sfx_zombie_ugh.ogg',
    './assets/audio/sfx_lantern_pickup.ogg',
    './assets/audio/sfx_weapon_pickup.ogg',
    './assets/audio/sfx_boss_roar.ogg',
    'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js',
    'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.59/dist/rexvirtualjoystickplugin.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests, like Google Analytics or fonts
    if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes('cdn.jsdelivr.net')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((response) => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});
