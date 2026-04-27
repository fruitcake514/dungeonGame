const CACHE_NAME = 'dungeon-crawler-v9';
const ASSETS = [
    '/',
'/index.html',
'/game.js',
'/assets/sprites/player.svg',
'/assets/sprites/slime.svg',
'/assets/sprites/skeleton.svg',
'/assets/sprites/zombie.svg',
'/assets/sprites/projectile.svg',
'/assets/sprites/potion.svg',
'/assets/sprites/portal.svg',
'/assets/sprites/floor.svg',
'/assets/sprites/wall.svg',
'/assets/sprites/solid.svg',
'/assets/sprites/lantern.svg',
'/assets/sprites/weapon_blade.svg',
'/assets/sprites/weapon_wand.svg',
'/assets/sprites/mini_boss.svg',
'/assets/sprites/major_boss.svg',
'/assets/sprites/light_mask.svg',
'/assets/sprites/ground_glow_mask.svg',
'/assets/audio/music_cozy.ogg',
'/assets/audio/music_ambient_lofi.ogg',
'/assets/audio/sfx_shoot.ogg',
'/assets/audio/sfx_hit.ogg',
'/assets/audio/sfx_heal.ogg',
'/assets/audio/sfx_level_clear.ogg',
'/assets/audio/sfx_player_hurt.ogg',
'/assets/audio/sfx_slime_move.ogg',
'/assets/audio/sfx_skeleton_creak.ogg',
'/assets/audio/sfx_zombie_ugh.ogg',
'/assets/audio/sfx_lantern_pickup.ogg',
'/assets/audio/sfx_weapon_pickup.ogg',
'/assets/audio/sfx_boss_roar.ogg',
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
