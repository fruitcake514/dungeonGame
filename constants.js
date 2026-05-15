export const TILE_SIZE = 24;
export const DARKNESS_DEPTH = 500;
export const HUD_DEPTH = 1000;
export const MIN_PLAYER_LIGHT_TILES = 2;
export const MAX_PLAYER_LIGHT_TILES = 7;
export const BASE_ENEMY_CAP = 22;
export const DUNGEON_WIDTH = 56;
export const DUNGEON_HEIGHT = 56;

export const WORLD_THEMES = [
    {
        name: 'Mosslight Caverns',
        subtitle: 'Watch your step, slimes are jumping!',
        floor: 0x465a42,
        wall: 0x2a3a2a,
        accent: 0xa8c686,
        fog: 0x9fc9a2
    },
    {
        name: 'Amber Crypts',
        subtitle: 'Old bones rattle in the dark...',
        floor: 0x5f4d3e,
        wall: 0x37291f,
        accent: 0xe6b566,
        fog: 0xd9b37f
    },
    {
        name: 'Moonroot Keep',
        subtitle: 'A silver glow hides ancient dangers.',
        floor: 0x3d4b63,
        wall: 0x202a3e,
        accent: 0x86b6e6,
        fog: 0x8fb2d4
    }
];

export const ENEMY_TYPES = {
    slime: {
        key: 'slime',
        hp: 3,
        speed: 65,
        damage: 8,
        score: 8,
        knockback: 90,
        moveSfx: 'slimeMove'
    },
    skeleton: {
        key: 'skeleton',
        hp: 5,
        speed: 90,
        damage: 10,
        score: 12,
        knockback: 120,
        moveSfx: 'skeletonMove'
    },
    zombie: {
        key: 'zombie',
        hp: 6,
        speed: 45,
        damage: 12,
        score: 18,
        knockback: 180,
        moveSfx: 'zombieMove'
    },
    miniBoss: {
        key: 'miniBoss',
        hp: 45,
        speed: 65,
        damage: 35,
        score: 150,
        knockback: 250,
        moveSfx: 'skeletonMove'
    },
    majorBoss: {
        key: 'majorBoss',
        hp: 120,
        speed: 55,
        damage: 60,
        score: 500,
        knockback: 350,
        moveSfx: 'zombieMove'
    }
};

export const WEAPON_TYPES = {
    wand: {
        name: 'Ember Wand',
        mode: 'ranged',
        damage: 1,
        speed: 480,
        cooldown: 450, // Slower cooldown for the 360 burst
        spread: 0.04
    },
    blade: {
        name: 'Moon Blade',
        mode: 'melee',
        damage: 5,
        cooldown: 280,
        arc: 1.8,
        range: 84,
        knockback: 280
    }
};

export const ENEMY_VARIANTS = {
    slime: [
        { id: 'normal', weight: 56 },
        { id: 'splitter', weight: 24, hpMult: 0.9, speedMult: 1.06, tint: 0x92e8a6 },
        { id: 'charger', weight: 20, hpMult: 0.95, speedMult: 1.2, damageMult: 1.1, tint: 0xa0f7d5 }
    ],
    skeleton: [
        { id: 'normal', weight: 56 },
        { id: 'archer', weight: 25, hpMult: 0.9, damageMult: 0.9, tint: 0xd7e8ff },
        { id: 'duelist', weight: 19, hpMult: 0.95, speedMult: 1.18, damageMult: 1.12, tint: 0xded2ff }
    ],
    zombie: [
        { id: 'normal', weight: 52 },
        { id: 'leech', weight: 24, hpMult: 0.9, speedMult: 1.08, tint: 0xb2f0a0 },
        { id: 'brute', weight: 24, hpMult: 1.35, speedMult: 0.82, damageMult: 1.2, tint: 0xe3c47f }
    ],
    miniBoss: [
        { id: 'normal', weight: 100 }
    ],
    majorBoss: [
        { id: 'normal', weight: 100 }
    ]
};

export const SPRITE_ASSETS = {
    player: 'assets/sprites/player.svg',
    slime: 'assets/sprites/slime.svg',
    skeleton: 'assets/sprites/skeleton.svg',
    zombie: 'assets/sprites/zombie.svg',
    projectile: 'assets/sprites/projectile.svg',
    coin: 'assets/sprites/coin.svg',
    potion: 'assets/sprites/potion.svg',
    portal: 'assets/sprites/portal.svg',
    floor: 'assets/sprites/floor.svg',
    wall: 'assets/sprites/wall.svg',
    solid: 'assets/sprites/solid.svg',
    lantern: 'assets/sprites/lantern.svg',
    weaponBlade: 'assets/sprites/weapon_blade.svg',
    weaponWand: 'assets/sprites/weapon_wand.svg',
    miniBoss: 'assets/sprites/mini_boss.svg',
    majorBoss: 'assets/sprites/major_boss.svg',
    lightMask: 'assets/sprites/light_mask.svg',
    groundGlowMask: 'assets/sprites/ground_glow_mask.svg'
};

export const AUDIO_ASSETS = {
    musicAmbient: 'assets/audio/music_ambient_lofi.ogg',
    musicCozy: 'assets/audio/music_cozy.ogg',
    shoot: 'assets/audio/sfx_shoot.ogg',
    hit: 'assets/audio/sfx_hit.ogg',
    heal: 'assets/audio/sfx_heal.ogg',
    levelClear: 'assets/audio/sfx_level_clear.ogg',
    playerHurt: 'assets/audio/sfx_player_hurt.ogg',
    slimeMove: 'assets/audio/sfx_slime_move.ogg',
    skeletonMove: 'assets/audio/sfx_skeleton_creak.ogg',
    zombieMove: 'assets/audio/sfx_zombie_ugh.ogg',
    lanternPickup: 'assets/audio/sfx_lantern_pickup.ogg',
    weaponPickup: 'assets/audio/sfx_weapon_pickup.ogg',
    bossRoar: 'assets/audio/sfx_boss_roar.ogg'
};
