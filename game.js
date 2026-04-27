const TILE_SIZE = 24;
const DARKNESS_DEPTH = 500;
const HUD_DEPTH = 1000;
const MIN_PLAYER_LIGHT_TILES = 2;
const MAX_PLAYER_LIGHT_TILES = 7;
const BASE_ENEMY_CAP = 22;
const DUNGEON_WIDTH = 56;
const DUNGEON_HEIGHT = 56;

const WORLD_THEMES = [
    {
        name: 'Mosslight Caverns',
        subtitle: 'Cozy and damp, with sleepy critters',
        floor: 0x465a42,
        wall: 0x2a3a2a,
        accent: 0xa8c686,
        fog: 0x9fc9a2
    },
    {
        name: 'Amber Crypts',
        subtitle: 'Warm torchlight over old bones',
        floor: 0x5f4d3e,
        wall: 0x37291f,
        accent: 0xe6b566,
        fog: 0xd9b37f
    },
    {
        name: 'Moonroot Keep',
        subtitle: 'Quiet ruins under silver glow',
        floor: 0x3d4b63,
        wall: 0x202a3e,
        accent: 0x86b6e6,
        fog: 0x8fb2d4
    }
];

const ENEMY_TYPES = {
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
        hp: 8,
        speed: 60,
        damage: 14,
        score: 18,
        knockback: 150,
        moveSfx: 'zombieMove'
    },
    miniBoss: {
        key: 'miniBoss',
        hp: 30,
        speed: 95,
        damage: 20,
        score: 80,
        knockback: 220,
        moveSfx: 'skeletonMove'
    },
    majorBoss: {
        key: 'majorBoss',
        hp: 75,
        speed: 115,
        damage: 30,
        score: 240,
        knockback: 280,
        moveSfx: 'zombieMove'
    }
};

const WEAPON_TYPES = {
    wand: {
        name: 'Ember Wand',
        mode: 'ranged',
        damage: 1,
        speed: 560,
        cooldown: 220,
        spread: 0.04
    },
    blade: {
        name: 'Moon Blade',
        mode: 'melee',
        damage: 3,
        cooldown: 280,
        arc: 1.7,
        range: 72,
        knockback: 220
    }
};

const ENEMY_VARIANTS = {
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

const SPRITE_ASSETS = {
    player: 'assets/sprites/player.svg',
    slime: 'assets/sprites/slime.svg',
    skeleton: 'assets/sprites/skeleton.svg',
    zombie: 'assets/sprites/zombie.svg',
    projectile: 'assets/sprites/projectile.svg',
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

const AUDIO_ASSETS = {
    musicAmbient: 'assets/audio/music_ambient_lofi.ogg',
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

class Dungeon {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.map = [];
    }

    generate() {
        this.map = Array(this.height).fill(0).map(() => Array(this.width).fill(1));
        const rooms = [];
        const roomCount = 11;
        const corridorHalfWidth = 1;

        const carveRect = (x, y, w, h) => {
            for (let yy = y; yy < y + h; yy++) {
                for (let xx = x; xx < x + w; xx++) {
                    if (yy <= 0 || xx <= 0 || yy >= this.height - 1 || xx >= this.width - 1) continue;
                    this.map[yy][xx] = 0;
                }
            }
        };

        const carveHall = (x1, y1, x2, y2) => {
            let x = x1;
            let y = y1;
            while (x !== x2) {
                x += x < x2 ? 1 : -1;
                carveRect(x - corridorHalfWidth, y - corridorHalfWidth, corridorHalfWidth * 2 + 1, corridorHalfWidth * 2 + 1);
            }
            while (y !== y2) {
                y += y < y2 ? 1 : -1;
                carveRect(x - corridorHalfWidth, y - corridorHalfWidth, corridorHalfWidth * 2 + 1, corridorHalfWidth * 2 + 1);
            }
        };

        let attempts = 0;
        while (rooms.length < roomCount && attempts < 260) {
            attempts += 1;
            const w = Phaser.Math.Between(8, 12);
            const h = Phaser.Math.Between(8, 12);
            const x = Phaser.Math.Between(2, this.width - w - 3);
            const y = Phaser.Math.Between(2, this.height - h - 3);
            const candidate = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2) };

            let overlaps = false;
            for (let i = 0; i < rooms.length; i++) {
                const room = rooms[i];
                const separated =
                    candidate.x + candidate.w + 2 < room.x ||
                    room.x + room.w + 2 < candidate.x ||
                    candidate.y + candidate.h + 2 < room.y ||
                    room.y + room.h + 2 < candidate.y;
                if (!separated) {
                    overlaps = true;
                    break;
                }
            }
            if (overlaps) continue;

            carveRect(candidate.x, candidate.y, candidate.w, candidate.h);
            rooms.push(candidate);
        }

        for (let i = 1; i < rooms.length; i++) {
            carveHall(rooms[i - 1].cx, rooms[i - 1].cy, rooms[i].cx, rooms[i].cy);
        }

        for (let i = 0; i < 3 && rooms.length > 3; i++) {
            const a = rooms[Phaser.Math.Between(0, rooms.length - 1)];
            const b = rooms[Phaser.Math.Between(0, rooms.length - 1)];
            if (a !== b) carveHall(a.cx, a.cy, b.cx, b.cy);
        }

        return this.map;
    }

    getRandomOpenTile() {
        let x = 0;
        let y = 0;
        let tries = 0;
        do {
            x = Phaser.Math.Between(1, this.width - 2);
            y = Phaser.Math.Between(1, this.height - 2);
            tries += 1;
            if (tries > 2000) return null;
        } while (this.map[y][x] !== 0);
        return { x, y };
    }
}

function preloadAssets(scene) {
    Object.entries(SPRITE_ASSETS).forEach(([key, path]) => {
        if (!scene.textures.exists(key)) {
            scene.load.image(key, path);
        }
    });
    Object.entries(AUDIO_ASSETS).forEach(([key, path]) => {
        if (!scene.cache.audio.exists(key)) {
            scene.load.audio(key, path);
        }
    });
}

function ensureRadialLightTexture(scene, key, size, stops) {
    if (scene.textures.exists(key)) return;
    const tex = scene.textures.createCanvas(key, size, size);
    const ctx = tex.getContext();
    const c = size / 2;
    const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
    for (let i = 0; i < stops.length; i++) {
        grad.addColorStop(stops[i].offset, `rgba(255,255,255,${stops[i].alpha})`);
    }
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    tex.refresh();
}

function ensureLightTextures(scene) {
    ensureRadialLightTexture(scene, 'playerLightMask', 256, [
        { offset: 0, alpha: 0.62 },
        { offset: 0.55, alpha: 0.4 },
        { offset: 0.86, alpha: 0.12 },
        { offset: 1, alpha: 0 }
    ]);
    ensureRadialLightTexture(scene, 'warmLightMask', 256, [
        { offset: 0, alpha: 0.25 },
        { offset: 0.45, alpha: 0.1 },
        { offset: 1, alpha: 0 }
    ]);
    ensureRadialLightTexture(scene, 'lanternLightMask', 128, [
        { offset: 0, alpha: 0.5 },
        { offset: 1, alpha: 0 }
    ]);
    ensureRadialLightTexture(scene, 'weakLightMask', 128, [
        { offset: 0, alpha: 0.25 },
        { offset: 1, alpha: 0 }
    ]);
}

function levelProfile(levelIndex) {
    const growth = (levelIndex - 1) * 0.15;
    const worldIndex = (levelIndex - 1) % WORLD_THEMES.length;
    const base = {
        slime: Math.max(4, 8 - Math.floor(levelIndex / 4)),
        skeleton: 2 + Math.floor(levelIndex / 2),
        zombie: levelIndex < 2 ? 0 : 1 + Math.floor(levelIndex / 2.7)
    };

    return {
        worldIndex,
        growth,
        levelIndex,
        counts: {
            slime: base.slime,
            skeleton: base.skeleton,
            zombie: base.zombie
        },
        playerDamageScale: 1 + growth * 0.35,
        hasMajorBoss: levelIndex % 5 === 0
    };
}

class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        preloadAssets(this);
        ensureLightTextures(this);
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        this.cameras.main.setBackgroundColor(0x1d201b);

        this.add.rectangle(width / 2, height / 2, width, height, 0x2a3426, 0.7);
        this.add.circle(width * 0.2, height * 0.28, Math.max(width, height) * 0.28, 0xa8c686, 0.16);
        this.add.circle(width * 0.8, height * 0.7, Math.max(width, height) * 0.32, 0x5b7a5d, 0.14);
        const title = this.add.text(width / 2, height / 2 - 130, 'Cozy Dungeon Crawler', {
            fontSize: '42px',
            color: '#f2e8d0',
            stroke: '#161810',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 55, 'Endless Levels • Upgrade Between Floors\nSlimes, Skeletons, Zombies', {
            fontSize: '20px',
            color: '#d8d4c4',
            align: 'center'
        }).setOrigin(0.5);

        const highScore = Number(localStorage.getItem('highScore') || 0);
        this.add.text(width / 2, height / 2 + 10, `High Score: ${highScore}`, {
            fontSize: '22px',
            color: '#ffe49a'
        }).setOrigin(0.5);

        const startPrompt = this.add.text(width / 2, height / 2 + 85, 'Tap / Click to Start', {
            fontSize: '28px',
            color: '#b7f2a1',
            backgroundColor: '#22301f'
        }).setOrigin(0.5).setPadding(10, 8, 10, 8)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('GameScene', { levelIndex: 1, score: 0, health: 100, lanternFuel: 100, weaponType: 'wand' });
            });

        this.tweens.add({
            targets: title,
            y: title.y - 6,
            yoyo: true,
            repeat: -1,
            duration: 2100,
            ease: 'Sine.InOut'
        });
        this.tweens.add({
            targets: startPrompt,
            alpha: 0.55,
            yoyo: true,
            repeat: -1,
            duration: 820,
            ease: 'Sine.InOut'
        });
    }
}

class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    create(data) {
        const width = this.scale.width;
        const height = this.scale.height;
        const score = data.score || 0;
        const saved = Number(localStorage.getItem('highScore') || 0);
        if (score > saved) localStorage.setItem('highScore', String(score));

        this.cameras.main.setBackgroundColor(0x1f2f3f);
        this.add.text(width / 2, height / 2 - 90, 'Dungeon Cleared!', {
            fontSize: '52px',
            color: '#f9f4cf',
            stroke: '#111',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 10, `Final Score: ${score}`, {
            fontSize: '30px',
            color: '#f1dfa4'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 75, 'Play Again', {
            fontSize: '30px',
            color: '#b9ffbf',
            backgroundColor: '#163127'
        }).setOrigin(0.5).setPadding(14, 8, 14, 8)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('GameScene', { levelIndex: 1, score: 0, health: 100, lanternFuel: 100, weaponType: 'wand' }));
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.levelIndex = data.levelIndex || 1;
        this.score = data.score || 0;
        this.startingHealth = data.health || 100;
        this.startingLanternFuel = data.lanternFuel ?? 100;
        this.startingWeapon = data.weaponType || 'wand';
        this.startingInventory = Array.isArray(data.inventory) ? data.inventory : ['wand', 'blade'];
        this.startingSelectedSlot = Number.isInteger(data.selectedWeaponSlot) ? data.selectedWeaponSlot : 0;
        this.coins = data.coins || 0;
        this.upgrades = {
            wandBurst: 0,
            wandDamage: 0,
            bladeDamage: 0,
            moveSpeed: 0,
            maxLantern: 0,
            maxHealth: 0,
            ...(data.upgrades || {})
        };
        this.tempPotions = data.tempPotions || 0;
    }

    preload() {
        preloadAssets(this);
    }

    create() {
        this.physics.resume();
        const profile = levelProfile(this.levelIndex);
        this.profile = profile;
        this.theme = WORLD_THEMES[profile.worldIndex];
        this.weaponInventory = [null, null];
        this.startingInventory.forEach((weaponType) => this.tryStoreWeapon(weaponType));
        if (!this.weaponInventory.includes('wand')) this.tryStoreWeapon('wand');
        if (!this.weaponInventory.includes('blade')) this.tryStoreWeapon('blade');
        if (!this.weaponInventory.includes(this.startingWeapon)) this.tryStoreWeapon(this.startingWeapon);
        if (!this.weaponInventory[0]) this.weaponInventory[0] = 'wand';
        this.selectedWeaponSlot = Phaser.Math.Clamp(this.startingSelectedSlot, 0, this.weaponInventory.length - 1);
        if (!this.weaponInventory[this.selectedWeaponSlot]) {
            this.selectedWeaponSlot = Math.max(0, this.weaponInventory.findIndex((weapon) => weapon));
        }
        this.currentWeaponType = this.weaponInventory[this.selectedWeaponSlot] || 'wand';
        this.currentWeapon = this.buildWeaponConfig(this.currentWeaponType);
        this.lastShotAt = 0;
        this.maxLanternFuel = 100 + this.upgrades.maxLantern * 18;
        this.lanternFuel = Phaser.Math.Clamp(this.startingLanternFuel, 0, this.maxLanternFuel);
        this.lanternDrainPerSecond = 3.2;
        this.requiredBosses = 1;
        this.defeatedBosses = 0;
        this.majorBossLevel = this.profile.hasMajorBoss;
        if (this.majorBossLevel) this.requiredBosses += 1;
        this.isTouchDevice = this.sys.game.device.input.touch;
        this.isActionPressed = false;
        this.desktopAutoFire = false;

        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.comboWindowMs = 3200;
        this.comboExpiresAt = 0;

        this.threatLevel = 1;
        this.nextThreatTick = this.time.now + 18000;
        this.reinforcementCadenceMs = Math.max(7500, 14500 - this.levelIndex * 260);
        this.nextReinforcementAt = this.time.now + this.reinforcementCadenceMs;
        this.allowReinforcements = false;
        this.tempInvincibleUntil = 0;
        this.isUpgradeMenuOpen = false;
        this.transitioning = false;
        this.upgradeSelectionLocked = false;
        this.lightFlicker = 1;
        this.lightFlickerTarget = 1;
        this.nextFlickerTick = this.time.now;

        this.setupAudio(profile.worldIndex);
        this.cameras.main.setBackgroundColor(this.theme.wall);

        this.dungeon = new Dungeon(DUNGEON_WIDTH, DUNGEON_HEIGHT);
        const map = this.dungeon.generate();

        this.floors = this.add.group();
        this.wallVisuals = this.add.group();
        this.walls = this.physics.add.staticGroup();
        for (let y = 0; y < this.dungeon.height; y++) {
            for (let x = 0; x < this.dungeon.width; x++) {
                if (map[y][x] === 0) {
                    const f = this.add.image(x * TILE_SIZE, y * TILE_SIZE, 'floor').setOrigin(0);
                    f.setDisplaySize(TILE_SIZE, TILE_SIZE);
                    f.setTint(this.theme.floor);
                    this.floors.add(f);
                } else {
                    const wall = this.walls.create(x * TILE_SIZE, y * TILE_SIZE, 'solid').setOrigin(0);
                    wall.setDisplaySize(TILE_SIZE, TILE_SIZE);
                    wall.refreshBody();
                    wall.setVisible(false);
                    const rect = this.add.image(x * TILE_SIZE, y * TILE_SIZE, 'wall').setOrigin(0);
                    rect.setDisplaySize(TILE_SIZE, TILE_SIZE);
                    rect.setTint(this.theme.wall);
                    this.wallVisuals.add(rect);
                }
            }
        }

        const spawn = this.dungeon.getRandomOpenTile();
        this.player = this.physics.add.sprite(spawn.x * TILE_SIZE, spawn.y * TILE_SIZE, 'player').setScale(1.5, 1.26);
        this.player.setSize(12, 12);
        this.player.setOffset(6, 7);
        this.player.maxHealth = 100 + this.upgrades.maxHealth * 22;
        this.player.health = Phaser.Math.Clamp(this.startingHealth, 1, this.player.maxHealth);
        this.player.isInvulnerable = false;
        this.player.setMaxVelocity(205, 205);
        this.player.setDrag(520, 520);
        this.applyDepth(this.player, 120);

        this.physics.world.setBounds(0, 0, this.dungeon.width * TILE_SIZE, this.dungeon.height * TILE_SIZE);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.walls);

        this.cameras.main.startFollow(this.player, true, 1, 1);
        this.cameras.main.setDeadzone(0, 0);
        this.cameras.main.roundPixels = true;
        this.updateCameraZoom();
        this.nextCullTick = 0;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.lastMoveDir = new Phaser.Math.Vector2(1, 0);

        const controls = this.getControlMetrics(this.scale.width, this.scale.height);

        this.joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: controls.leftX,
            y: controls.y,
            radius: controls.radius,
            base: this.add.circle(0, 0, controls.radius, this.theme.accent, 0.35).setScrollFactor(0),
            thumb: this.add.circle(0, 0, controls.thumbRadius, 0xffffff, 0.4).setScrollFactor(0)
        });
        this.joystick.base.setDepth(HUD_DEPTH);
        this.joystick.thumb.setDepth(HUD_DEPTH);

        this.actionButton = this.add.circle(controls.rightX, controls.y, controls.buttonRadius, this.theme.accent, 0.5)
            .setScrollFactor(0)
            .setDepth(HUD_DEPTH)
            .setInteractive()
            .on('pointerdown', () => {
                this.isActionPressed = true;
                this.shoot();
            })
            .on('pointerup', () => {
                this.isActionPressed = false;
            })
            .on('pointerout', () => {
                this.isActionPressed = false;
            });
        this.input.keyboard.on('keydown-SPACE', this.shoot, this);
        this.input.keyboard.on('keydown-ONE', () => this.selectWeaponSlot(0));
        this.input.keyboard.on('keydown-TWO', () => this.selectWeaponSlot(1));
        this.input.keyboard.on('keydown-Q', () => this.cycleWeapon(-1));
        this.input.keyboard.on('keydown-E', () => this.cycleWeapon(1));
        this.input.keyboard.on('keydown-R', () => this.useTempPotion());
        this.portalInteractKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.input.on('pointermove', this.updateAimFromPointer, this);
        this.input.on('pointerdown', (pointer) => {
            if (this.isTouchDevice) return;
            if (pointer.button !== 0) return;
            this.updateAimFromPointer(pointer);
            this.desktopAutoFire = true;
            this.shoot();
        });
        this.input.on('pointerup', () => {
            this.desktopAutoFire = false;
        });
        if (!this.isTouchDevice) {
            this.joystick.base.setAlpha(0.2);
            this.joystick.thumb.setAlpha(0.2);
            this.actionButton.setAlpha(0.2);
        }

        this.projectiles = this.physics.add.group({ defaultKey: 'projectile', maxSize: 60 });
        this.enemyProjectiles = this.physics.add.group({ defaultKey: 'projectile', maxSize: 80 });
        this.physics.add.collider(this.projectiles, this.walls, this.despawnProjectile, null, this);
        this.physics.add.collider(this.enemyProjectiles, this.walls, this.despawnProjectile, null, this);

        this.enemies = this.physics.add.group();
        this.spawnEnemies(profile);
        this.spawnBosses(profile);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.enemies, this.enemies);

        this.potions = this.physics.add.group();
        for (let i = 0; i < 3; i++) {
            const tile = this.dungeon.getRandomOpenTile();
            if (tile) {
                const potion = this.potions.create(tile.x * TILE_SIZE, tile.y * TILE_SIZE, 'potion').setScale(1.46, 1.16);
                this.applyDepth(potion, 78);
            }
        }

        this.lanterns = this.physics.add.group();
        for (let i = 0; i < 5; i++) {
            const tile = this.dungeon.getRandomOpenTile();
            if (tile) {
                const lantern = this.lanterns.create(tile.x * TILE_SIZE, tile.y * TILE_SIZE, 'lantern').setScale(1.4, 1.12);
                this.applyDepth(lantern, 76);
            }
        }

        this.coinsGroup = this.physics.add.group();
        const coinCount = 5 + Math.min(6, Math.floor(this.levelIndex / 2));
        for (let i = 0; i < coinCount; i++) {
            const tile = this.dungeon.getRandomOpenTile();
            if (tile) {
                const coin = this.coinsGroup.create(tile.x * TILE_SIZE, tile.y * TILE_SIZE, 'projectile').setScale(1.35, 1.02);
                coin.setTint(0xf4d35e);
                coin.value = 3 + Phaser.Math.Between(0, 5);
                coin.baseY = coin.y;
                coin.bobOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
                this.applyDepth(coin, 84);
            }
        }

        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.enemyProjectiles, this.player, this.playerHitByProjectile, null, this);
        this.physics.add.overlap(this.player, this.potions, this.collectPotion, null, this);
        this.physics.add.overlap(this.player, this.lanterns, this.collectLantern, null, this);
        this.physics.add.overlap(this.player, this.coinsGroup, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

        const hud = this.getHudLayout(this.scale.width, this.scale.height);
        this.hud = hud;
        this.scoreText = this.add.text(hud.x, hud.y, `Score: ${this.score}`, { fontSize: `${hud.fontLarge}px`, color: '#ffffff' }).setScrollFactor(0);
        this.levelText = this.add.text(hud.x, hud.y + hud.rowGap, `Level ${this.levelIndex}`, {
            fontSize: `${hud.fontMedium}px`,
            color: '#ffe6ae'
        }).setScrollFactor(0);
        this.worldText = this.add.text(hud.x, hud.y + hud.rowGap * 2, this.theme.name, { fontSize: `${hud.fontSmall}px`, color: '#d1f1cc' }).setScrollFactor(0);

        this.healthBar = this.add.graphics().setScrollFactor(0);
        this.healthBar.setDepth(HUD_DEPTH);
        this.updateHealthBar();
        this.lanternBar = this.add.graphics().setScrollFactor(0);
        this.lanternBar.setDepth(HUD_DEPTH);
        this.weaponText = this.add.text(hud.x, hud.y + hud.statsStartY, `Weapon: ${this.currentWeapon.name}`, { fontSize: `${hud.fontSmall}px`, color: '#cde3ff' }).setScrollFactor(0);
        this.updateLanternBar();

        this.enemyCountText = this.add.text(hud.x, hud.y + hud.statsStartY + hud.rowGap, '', { fontSize: `${hud.fontSmall}px`, color: '#ffd4b9' }).setScrollFactor(0);
        this.statusText = this.add.text(hud.x, hud.y + hud.statsStartY + hud.rowGap * 2, '', {
            fontSize: `${hud.fontSmall}px`,
            color: '#fff0a8'
        }).setScrollFactor(0);
        this.coinText = this.add.text(hud.x, hud.y + hud.statsStartY + hud.rowGap * 3, `Coins: ${this.coins}`, {
            fontSize: `${hud.fontSmall}px`,
            color: '#ffe28d'
        }).setScrollFactor(0);
        this.inventoryText = this.add.text(hud.x, hud.y + hud.statsStartY + hud.rowGap * 3, 'Inventory', {
            fontSize: `${hud.fontSmall}px`,
            color: '#e9dcff'
        }).setScrollFactor(0);
        this.inventoryText.setY(hud.y + hud.statsStartY + hud.rowGap * 4);
        this.tempPotionText = this.add.text(hud.x, hud.y + hud.statsStartY + hud.rowGap * 4.95, '', {
            fontSize: `${Math.round(hud.fontSmall * 0.9)}px`,
            color: '#b9ffe0'
        }).setScrollFactor(0);
        this.portalHintText = this.add.text(this.scale.width / 2, this.scale.height - Math.round(hud.rowGap * 1.4), '', {
            fontSize: `${Math.round(hud.fontSmall * 1.02)}px`,
            color: '#fff0c2',
            stroke: '#34240f',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(HUD_DEPTH).setVisible(false);
        this.weaponSlots = this.createWeaponSlotUi();
        this.scoreText.setDepth(HUD_DEPTH);
        this.levelText.setDepth(HUD_DEPTH);
        this.worldText.setDepth(HUD_DEPTH);
        this.weaponText.setDepth(HUD_DEPTH);
        this.enemyCountText.setDepth(HUD_DEPTH);
        this.statusText.setDepth(HUD_DEPTH);
        this.coinText.setDepth(HUD_DEPTH);
        this.inventoryText.setDepth(HUD_DEPTH);
        this.tempPotionText.setDepth(HUD_DEPTH);
        this.portalHintText.setDepth(HUD_DEPTH);
        this.refreshWeaponSlots();
        this.refreshTempPotionText();

        this.fog = this.add.particles(this.player.x, this.player.y, 'projectile', {
            speed: { min: 10, max: 30 },
            lifespan: { min: 1500, max: 2800 },
            scale: { start: 0.35, end: 0 },
            quantity: 1,
            tint: [this.theme.fog],
            alpha: { start: 0.25, end: 0 },
            frequency: 120,
            follow: this.player
        });

        this.ambientDust = this.add.particles(0, 0, 'projectile', {
            x: { min: 0, max: this.dungeon.width * TILE_SIZE },
            y: { min: 0, max: this.dungeon.height * TILE_SIZE },
            speed: { min: 8, max: 24 },
            lifespan: { min: 3200, max: 5200 },
            scale: { start: 0.24, end: 0 },
            alpha: { start: 0.1, end: 0 },
            tint: [this.theme.fog],
            quantity: 1,
            frequency: 180
        });

        this.darkness = this.add.renderTexture(0, 0, this.scale.width, this.scale.height)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(DARKNESS_DEPTH);
        this.warmLight = this.add.renderTexture(0, 0, this.scale.width, this.scale.height)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(DARKNESS_DEPTH - 1)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.lightStamp = this.add.image(-9999, -9999, 'playerLightMask').setScrollFactor(0).setAlpha(0);
        this.warmStamp = this.add.image(-9999, -9999, 'warmLightMask').setScrollFactor(0).setAlpha(0).setTint(0xffbe63);
        this.lanternStamp = this.add.image(-9999, -9999, 'lanternLightMask').setScrollFactor(0).setAlpha(0);
        this.weakStamp = this.add.image(-9999, -9999, 'weakLightMask').setScrollFactor(0).setAlpha(0);
        this.redrawDarkness();

        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'ui');
        this.uiCamera.setZoom(1);
        this.refreshCameraIgnores();
        this.refreshHudLayer();

        this.scale.on('resize', this.resize, this);
        this.resize({ width: this.scale.width, height: this.scale.height });
        this.updateMapVisibility();

        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resize, this);
            if (this.bgMusic) this.bgMusic.stop();
            if (this.portalWhoosh) this.portalWhoosh.stop();
        });
    }

    setupAudio(worldIndex) {
        const rateByWorld = [0.92, 1.0, 1.08];
        this.bgMusic = this.sound.add('musicAmbient', {
            loop: true,
            volume: 0.26,
            rate: rateByWorld[worldIndex] || 1
        });
        if (!this.bgMusic.isPlaying) {
            this.bgMusic.play();
        }
    }

    updateCameraZoom() {
        const visibleTilesShortestAxis = 20;
        const minDim = Math.min(this.scale.width, this.scale.height);
        const zoom = Phaser.Math.Clamp(minDim / (TILE_SIZE * visibleTilesShortestAxis), 0.8, 3.5);
        this.cameras.main.setZoom(zoom);
    }

    updateMapVisibility() {
        const view = this.cameras.main.worldView;
        const padded = new Phaser.Geom.Rectangle(
            view.x - TILE_SIZE,
            view.y - TILE_SIZE,
            view.width + TILE_SIZE * 2,
            view.height + TILE_SIZE * 2
        );

        this.floors.children.each((tile) => {
            tile.setVisible(padded.contains(tile.x, tile.y));
        });

        this.wallVisuals.children.each((tile) => {
            tile.setVisible(padded.contains(tile.x, tile.y));
        });
    }

    playSfx(key, config = {}) {
        this.sound.play(key, config);
    }

    refreshHudLayer() {
        const hudObjects = [
            this.scoreText,
            this.levelText,
            this.worldText,
            this.weaponText,
            this.enemyCountText,
            this.statusText,
            this.coinText,
            this.inventoryText,
            this.tempPotionText,
            this.portalHintText,
            this.healthBar,
            this.lanternBar,
            this.actionButton,
            this.joystick?.base,
            this.joystick?.thumb,
            ...((this.weaponSlots || []).map((slot) => slot.bg)),
            ...((this.weaponSlots || []).map((slot) => slot.icon)),
            ...((this.weaponSlots || []).map((slot) => slot.keyText))
        ].filter(Boolean);

        for (let i = 0; i < hudObjects.length; i++) {
            hudObjects[i].setDepth(HUD_DEPTH);
            this.children.bringToTop(hudObjects[i]);
            this.cameras.main.ignore(hudObjects[i]);
        }
    }

    refreshCameraIgnores() {
        if (!this.uiCamera) return;
        const worldObjects = [
            ...this.floors.getChildren(),
            ...this.wallVisuals.getChildren(),
            ...this.walls.getChildren(),
            this.player,
            ...this.projectiles.getChildren(),
            ...this.enemyProjectiles.getChildren(),
            ...this.enemies.getChildren(),
            ...this.enemies.getChildren().map((enemy) => enemy.hpBarBg),
            ...this.enemies.getChildren().map((enemy) => enemy.hpBarFill),
            ...this.potions.getChildren(),
            ...this.lanterns.getChildren(),
            ...this.coinsGroup.getChildren(),
            this.portalGlow,
            this.portalRing,
            this.portal,
            this.portalAura,
            this.fog,
            this.ambientDust,
            this.warmLight,
            this.darkness
        ].filter(Boolean);
        this.uiCamera.ignore(worldObjects);
    }

    applyDepth(obj, offset = 0) {
        if (!obj) return;
        obj.setDepth(offset + Math.floor(obj.y));
    }

    ignoreForUiCamera(...objects) {
        if (!this.uiCamera) return;
        const valid = objects.filter(Boolean);
        if (valid.length > 0) this.uiCamera.ignore(valid);
    }

    spawnEnemies(profile) {
        const addEnemy = (typeName, count) => {
            for (let i = 0; i < count; i++) {
                this.createEnemy(typeName, this.dungeon.getRandomOpenTile(), {
                    scale: 1.5,
                    hpGrowthBoost: 0,
                    speedGrowthBoost: 0.5,
                    scoreGrowthBoost: 0.25
                });
            }
        };

        addEnemy('slime', profile.counts.slime);
        addEnemy('skeleton', profile.counts.skeleton);
        addEnemy('zombie', profile.counts.zombie);
    }

    spawnBosses(profile) {
        const spawnBoss = (typeName, textureKey, scale) => {
            this.createEnemy(typeName, this.dungeon.getRandomOpenTile(), {
                textureKey,
                scale,
                isBoss: true,
                size: 14,
                hpGrowthBoost: 0,
                speedGrowthBoost: 0.35,
                scoreGrowthBoost: 0.25
            });
        };

        spawnBoss('miniBoss', 'miniBoss', 2.1);
        if (this.majorBossLevel) {
            spawnBoss('majorBoss', 'majorBoss', 2.4);
        }
    }

    createEnemy(typeName, tile, options = {}) {
        if (!tile) return null;
        if (tile.x < 1 || tile.y < 1 || tile.x >= this.dungeon.width - 1 || tile.y >= this.dungeon.height - 1) return null;
        if (this.dungeon.map[tile.y][tile.x] !== 0) return null;
        const base = ENEMY_TYPES[typeName];
        if (!base) return null;

        const textureKey = options.textureKey || base.key;
        const scale = options.scale || 1.5;
        const hpGrowthBoost = options.hpGrowthBoost ?? 0;
        const speedGrowthBoost = options.speedGrowthBoost ?? 0.5;
        const scoreGrowthBoost = options.scoreGrowthBoost ?? 0.25;

        const enemy = this.enemies.create(tile.x * TILE_SIZE, tile.y * TILE_SIZE, textureKey).setScale(scale);
        enemy.typeName = typeName;
        enemy.variant = this.pickEnemyVariant(typeName);
        enemy.maxHealth = Math.max(2, Math.round(base.hp * (1 + this.profile.growth + hpGrowthBoost) * (enemy.variant.hpMult || 1)));
        enemy.health = enemy.maxHealth;
        enemy.speed = Math.round(base.speed * (1 + this.profile.growth * speedGrowthBoost) * (enemy.variant.speedMult || 1));
        enemy.damage = Math.round(base.damage * this.profile.playerDamageScale * (enemy.variant.damageMult || 1));
        enemy.score = Math.round(base.score * (1 + this.profile.growth * scoreGrowthBoost));
        enemy.nextMoveTick = 0;
        enemy.nextAbilityTick = 0;
        enemy.nextSoundTick = 0;
        enemy.nextRangedTick = this.time.now + Phaser.Math.Between(650, 1200);
        enemy.setScale(scale, scale * 0.84);
        this.applyDepth(enemy, options.isBoss ? 170 : 140);
        enemy.setSize(options.size || 12, options.size || 12);
        enemy.setCollideWorldBounds(true);
        enemy.setDrag(340, 340);
        enemy.setBounce(0.12);
        enemy.isBoss = Boolean(options.isBoss);
        enemy.hpBarUntil = 0;
        enemy.hpBarBg = this.add.rectangle(enemy.x, enemy.y - 18, 20, 4, 0x1a1a1a, 0.86)
            .setDepth(8)
            .setVisible(false);
        enemy.hpBarFill = this.add.rectangle(enemy.x, enemy.y - 18, 18, 2, 0x78e78f, 0.95)
            .setDepth(9)
            .setVisible(false);
        this.applyVariantVisual(enemy);
        this.ignoreForUiCamera(enemy, enemy.hpBarBg, enemy.hpBarFill);
        return enemy;
    }

    pickEnemyVariant(typeName) {
        const variants = ENEMY_VARIANTS[typeName] || [{ id: 'normal', weight: 100 }];
        const total = variants.reduce((sum, variant) => sum + variant.weight, 0);
        let roll = Phaser.Math.Between(1, total);
        for (let i = 0; i < variants.length; i++) {
            roll -= variants[i].weight;
            if (roll <= 0) return variants[i];
        }
        return variants[0];
    }

    applyVariantVisual(enemy) {
        if (!enemy.variant || !enemy.variant.tint) return;
        enemy.setTint(enemy.variant.tint);
    }

    updateDynamicDepths(now) {
        this.applyDepth(this.player, 120);
        this.enemies.children.each((enemy) => {
            if (!enemy || !enemy.active) return;
            this.applyDepth(enemy, enemy.isBoss ? 170 : 140);
        });
        this.potions.children.each((potion) => {
            if (!potion || !potion.active) return;
            this.applyDepth(potion, 78);
        });
        this.lanterns.children.each((lantern) => {
            if (!lantern || !lantern.active) return;
            this.applyDepth(lantern, 76);
        });
        this.projectiles.children.each((projectile) => {
            if (!projectile || !projectile.active) return;
            this.applyDepth(projectile, 146);
        });
        this.enemyProjectiles.children.each((projectile) => {
            if (!projectile || !projectile.active) return;
            this.applyDepth(projectile, 146);
        });
        this.coinsGroup.children.each((coin) => {
            if (!coin || !coin.active) return;
            const bob = Math.sin(now * 0.004 + (coin.bobOffset || 0)) * 3;
            coin.y = (coin.baseY ?? coin.y) + bob;
            this.applyDepth(coin, 84);
        });
        if (this.portalGlow && this.portal && this.portal.active) {
            this.portalGlow.setPosition(this.portal.x, this.portal.y + 2);
            this.applyDepth(this.portalGlow, 116);
        }
        if (this.portalRing && this.portal && this.portal.active) {
            this.portalRing.setPosition(this.portal.x, this.portal.y);
            this.applyDepth(this.portalRing, 124);
        }
        if (this.portal && this.portal.active) this.applyDepth(this.portal, 130);
    }

    resize(gameSize) {
        if (!this.joystick || !this.joystick.base || !this.actionButton || !this.scoreText) return;
        const controls = this.getControlMetrics(gameSize.width, gameSize.height);
        this.joystick.base.setRadius(controls.radius);
        this.joystick.thumb.setRadius(controls.thumbRadius);
        this.joystick.x = controls.leftX;
        this.joystick.y = controls.y;
        this.actionButton.setRadius(controls.buttonRadius);
        this.actionButton.x = controls.rightX;
        this.actionButton.y = controls.y;

        this.hud = this.getHudLayout(gameSize.width, gameSize.height);
        this.scoreText.setPosition(this.hud.x, this.hud.y).setFontSize(this.hud.fontLarge);
        this.levelText.setPosition(this.hud.x, this.hud.y + this.hud.rowGap).setFontSize(this.hud.fontMedium);
        this.worldText.setPosition(this.hud.x, this.hud.y + this.hud.rowGap * 2).setFontSize(this.hud.fontSmall);
        this.weaponText.setPosition(this.hud.x, this.hud.y + this.hud.statsStartY).setFontSize(this.hud.fontSmall);
        this.enemyCountText.setPosition(this.hud.x, this.hud.y + this.hud.statsStartY + this.hud.rowGap).setFontSize(this.hud.fontSmall);
        this.statusText.setPosition(this.hud.x, this.hud.y + this.hud.statsStartY + this.hud.rowGap * 2).setFontSize(this.hud.fontSmall);
        this.coinText.setPosition(this.hud.x, this.hud.y + this.hud.statsStartY + this.hud.rowGap * 3).setFontSize(this.hud.fontSmall);
        this.inventoryText.setPosition(this.hud.x, this.hud.y + this.hud.statsStartY + this.hud.rowGap * 4).setFontSize(this.hud.fontSmall);
        this.tempPotionText.setPosition(this.hud.x, this.hud.y + this.hud.statsStartY + this.hud.rowGap * 5).setFontSize(Math.round(this.hud.fontSmall * 0.9));
        this.portalHintText.setPosition(gameSize.width / 2, gameSize.height - Math.round(this.hud.rowGap * 1.4)).setFontSize(Math.round(this.hud.fontSmall * 1.02));
        this.layoutWeaponSlots();
        if (!this.isTouchDevice) {
            this.joystick.base.setAlpha(0.2);
            this.joystick.thumb.setAlpha(0.2);
            this.actionButton.setAlpha(0.2);
        }

        this.updateCameraZoom();
        this.updateMapVisibility();
        if (this.darkness) {
            this.darkness.setSize(gameSize.width, gameSize.height);
            this.darkness.setDisplaySize(gameSize.width, gameSize.height);
        }
        if (this.warmLight) {
            this.warmLight.setSize(gameSize.width, gameSize.height);
            this.warmLight.setDisplaySize(gameSize.width, gameSize.height);
        }
        if (this.uiCamera) {
            this.uiCamera.setViewport(0, 0, gameSize.width, gameSize.height);
        }
        this.refreshHudLayer();
        this.refreshCameraIgnores();
    }

    update(_time, delta) {
        if (!this.player) return;
        if (this.isGameOver) return;

        if (this.isUpgradeMenuOpen) {
            this.updatePortalAudio();
            this.updateDynamicDepths(_time);
            this.redrawDarkness();
            if (this.portalHintText) this.portalHintText.setVisible(false);
            return;
        }

        if (this.isActionPressed || this.desktopAutoFire) {
            this.shoot();
        }

        this.updateLightFlicker(_time);
        this.updateThreat(_time);
        this.updateCombo(_time);
        this.spawnReinforcements(_time);
        this.updateLantern(delta);
        this.updatePlayerMovement();
        this.updateProjectiles(delta);
        this.updateEnemies();
        this.updateEnemyCounter();
        this.checkLevelClear();
        this.updatePortalInteraction();
        this.updatePortalAudio();
        this.updateTempInvincibility(_time);
        this.updateDynamicDepths(_time);
        this.redrawDarkness();

        if (_time > this.nextCullTick) {
            this.nextCullTick = _time + 120;
            this.updateMapVisibility();
            this.ignoreForUiCamera(
                ...this.projectiles.getChildren(),
                ...this.enemyProjectiles.getChildren(),
                ...this.enemies.getChildren(),
                ...this.enemies.getChildren().map((enemy) => enemy.hpBarBg),
                ...this.enemies.getChildren().map((enemy) => enemy.hpBarFill),
                ...this.coinsGroup.getChildren()
            );
        }
    }

    updatePlayerMovement() {
        const speed = 190 + this.upgrades.moveSpeed * 12;
        this.player.setVelocity(0, 0);

        let x = 0;
        let y = 0;

        if (this.joystick.force > 0) {
            const vec = new Phaser.Math.Vector2(this.joystick.forceX, this.joystick.forceY).normalize();
            x = vec.x;
            y = vec.y;
        } else {
            if (this.cursors.left.isDown || this.wasd.A.isDown) x = -1;
            if (this.cursors.right.isDown || this.wasd.D.isDown) x = 1;
            if (this.cursors.up.isDown || this.wasd.W.isDown) y = -1;
            if (this.cursors.down.isDown || this.wasd.S.isDown) y = 1;
        }

        if (x !== 0 || y !== 0) {
            const diagonalPenalty = x !== 0 && y !== 0 ? 0.9 : 1;
            const move = new Phaser.Math.Vector2(x, y).normalize().scale(speed * diagonalPenalty);
            this.player.setVelocity(move.x, move.y);
            this.lastMoveDir.set(x, y).normalize();
        }
    }

    updateProjectiles(delta) {
        const decay = (group) => {
            group.children.each((proj) => {
                if (!proj.active) return;
                proj.lifespan -= delta;
                if (proj.lifespan <= 0) this.despawnProjectile(proj);
            });
        };
        decay(this.projectiles);
        decay(this.enemyProjectiles);
    }

    updateLantern(delta) {
        const threatDrain = Phaser.Math.Linear(1, 1.25, (this.threatLevel - 1) / 4);
        this.lanternFuel -= (delta / 1000) * this.lanternDrainPerSecond * threatDrain;
        this.lanternFuel = Phaser.Math.Clamp(this.lanternFuel, 0, this.maxLanternFuel);
        this.updateLanternBar();
        if (this.lanternFuel <= 0) {
            this.playerLightOut();
        }
    }

    redrawDarkness() {
        if (!this.darkness || !this.player) return;
        this.darkness.clear();
        if (this.warmLight) this.warmLight.clear();

        const fuelRatio = this.lanternFuel / this.maxLanternFuel;
        const lightFactor = Phaser.Math.Easing.Cubic.Out(fuelRatio);
        const darknessAlpha = Phaser.Math.Linear(0.965, 0.84, lightFactor);
        this.darkness.fill(0x000000, darknessAlpha);

        const cam = this.cameras.main;
        const view = cam.worldView;
        const zoom = cam.zoom;
        const toScreen = (wx, wy) => ({
            x: (wx - cam.worldView.x) * zoom,
            y: (wy - cam.worldView.y) * zoom
        });

        const playerScreen = toScreen(this.player.x, this.player.y);

        const radiusPx = TILE_SIZE * Phaser.Math.Linear(MIN_PLAYER_LIGHT_TILES, MAX_PLAYER_LIGHT_TILES, lightFactor) * this.lightFlicker;
        const maskBase = this.textures.get('playerLightMask').getSourceImage();
        const scale = ((radiusPx * 2) / maskBase.width) * zoom;
        this.lightStamp.setPosition(playerScreen.x, playerScreen.y).setScale(scale).setAlpha(Phaser.Math.Linear(0.5, 0.7, lightFactor));
        this.darkness.erase(this.lightStamp);

        if (this.warmLight) {
            const warmBase = this.textures.get('warmLightMask').getSourceImage();
            const warmScale = (((radiusPx * 1.9) / warmBase.width) * zoom);
            const warmAlpha = Phaser.Math.Linear(0.03, 0.08, lightFactor) * this.lightFlicker;
            this.warmStamp.setPosition(playerScreen.x, playerScreen.y).setScale(warmScale).setAlpha(warmAlpha);
            this.warmLight.draw(this.warmStamp);
        }

        this.lanterns.children.each((lantern) => {
            if (!lantern.active) return;
            const screen = toScreen(lantern.x, lantern.y);
            const groundRadius = TILE_SIZE;
            const groundBase = this.textures.get('lanternLightMask').getSourceImage();
            const glowScale = ((groundRadius * 2) / groundBase.width) * zoom;
            this.lanternStamp.setPosition(screen.x, screen.y).setScale(glowScale);
            this.darkness.erase(this.lanternStamp);
        });

        const applyWeakGlow = (obj) => {
            if (!obj || !obj.active) return;
            if (!view.contains(obj.x, obj.y)) return;
            const screen = toScreen(obj.x, obj.y);
            const weakRadius = TILE_SIZE;
            const weakBase = this.textures.get('weakLightMask').getSourceImage();
            const weakScale = ((weakRadius * 2) / weakBase.width) * zoom;
            this.weakStamp.setPosition(screen.x, screen.y).setScale(weakScale);
            this.darkness.erase(this.weakStamp);
        };

        this.enemies.children.each((enemy) => applyWeakGlow(enemy));
        this.potions.children.each((potion) => applyWeakGlow(potion));
        this.coinsGroup.children.each((coin) => applyWeakGlow(coin));
        this.lanterns.children.each((lantern) => applyWeakGlow(lantern));
        if (this.portal && this.portal.active) applyWeakGlow(this.portal);
    }

    updateEnemies() {
        const now = this.time.now;
        const worldView = this.cameras.main.worldView;
        const threatSpeedFactor = Phaser.Math.Linear(1, 1.35, (this.threatLevel - 1) / 4);
        this.enemies.children.iterate((enemy) => {
            if (!enemy || !enemy.active) return;
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            const seek = (multiplier = 1) => this.physics.moveToObject(enemy, this.player, enemy.speed * threatSpeedFactor * multiplier);

            this.updateEnemyHealthBar(enemy, now, worldView);

            if (enemy.typeName === 'slime') {
                const leapBoost = enemy.variant.id === 'charger' ? 3.1 : 2.7;
                if (distance < TILE_SIZE * 3.6 && now > enemy.nextAbilityTick) {
                    enemy.nextAbilityTick = now + (enemy.variant.id === 'charger' ? 1400 : 1800);
                    seek(leapBoost);
                }
                if (now > enemy.nextMoveTick) {
                    enemy.nextMoveTick = now + (enemy.variant.id === 'splitter' ? 430 : 520);
                    const rush = distance < 250 ? 1.55 : 0.72;
                    seek(rush);
                }
            }

            if (enemy.typeName === 'skeleton') {
                const ray = new Phaser.Geom.Line(enemy.x, enemy.y, this.player.x, this.player.y);
                let blocked = false;
                const walls = this.walls.getChildren();
                for (let i = 0; i < walls.length; i++) {
                    if (Phaser.Geom.Intersects.LineToRectangle(ray, walls[i].getBounds())) {
                        blocked = true;
                        break;
                    }
                }
                if (!blocked) {
                    if (enemy.variant.id === 'archer' && distance <= TILE_SIZE * 14 && now > enemy.nextRangedTick) {
                        enemy.nextRangedTick = now + Phaser.Math.Between(1050, 1550);
                        this.fireEnemyProjectile(enemy, 220, Math.max(4, Math.round(enemy.damage * 0.65)), 0xcad6ff);
                    }
                    if (distance <= TILE_SIZE * 10 && now > enemy.nextAbilityTick) {
                        enemy.nextAbilityTick = now + 2400;
                        const dashBoost = enemy.variant.id === 'duelist' ? 3.8 : 3.4;
                        seek(dashBoost);
                    } else {
                        const strafe = enemy.variant.id === 'archer' && distance < TILE_SIZE * 7;
                        if (strafe && now > enemy.nextMoveTick) {
                            enemy.nextMoveTick = now + 550;
                            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y) + Phaser.Math.DegToRad(90);
                            this.physics.velocityFromRotation(angle, enemy.speed * 0.8, enemy.body.velocity);
                        } else {
                            seek(enemy.variant.id === 'duelist' ? 1.35 : 1.16);
                        }
                    }
                } else if (now > enemy.nextMoveTick) {
                    enemy.nextMoveTick = now + 700;
                    enemy.setVelocity(Phaser.Math.Between(-60, 60), Phaser.Math.Between(-60, 60));
                }
            }

            if (enemy.typeName === 'zombie') {
                if (distance <= TILE_SIZE * 100 && now > enemy.nextAbilityTick) {
                    enemy.nextAbilityTick = now + 3800;
                    this.enemies.children.iterate((other) => {
                        if (!other || !other.active || other.typeName !== 'zombie') return;
                        const near = Phaser.Math.Distance.Between(other.x, other.y, enemy.x, enemy.y);
                        if (near <= TILE_SIZE * 100) {
                            this.physics.moveToObject(other, this.player, other.speed * threatSpeedFactor * 1.9);
                            other.nextMoveTick = now + 550;
                        }
                    });
                }
                const bruteBoost = enemy.variant.id === 'brute' && enemy.health < enemy.maxHealth * 0.45 ? 1.45 : 1;
                seek(bruteBoost);
            }

            if (enemy.typeName === 'miniBoss') {
                if (now > enemy.nextAbilityTick) {
                    enemy.nextAbilityTick = now + 2600;
                    seek(2.2);
                    this.playSfx('bossRoar', { volume: 0.11, rate: 1.05, seek: 0.1, duration: 0.3 });
                } else {
                    seek(1.2);
                }
            }

            if (enemy.typeName === 'majorBoss') {
                if (now > enemy.nextAbilityTick) {
                    enemy.nextAbilityTick = now + 1800;
                    seek(2.8);
                    this.playSfx('bossRoar', { volume: 0.14, rate: 0.85, seek: 0.42, duration: 0.44 });
                } else {
                    seek(1.2);
                }
            }

            if (worldView.contains(enemy.x, enemy.y) && now > enemy.nextSoundTick) {
                const base = ENEMY_TYPES[enemy.typeName];
                if (base && base.moveSfx) {
                    const config = {
                        volume: 0.03,
                        rate: 1,
                        seek: 0.12,
                        duration: 0.14
                    };
                    if (enemy.typeName === 'slime') {
                        config.rate = Phaser.Math.FloatBetween(1.25, 1.55);
                        config.seek = 0.64;
                    }
                    if (enemy.typeName === 'skeleton') {
                        config.rate = Phaser.Math.FloatBetween(0.75, 0.95);
                        config.seek = 0.2;
                    }
                    if (enemy.typeName === 'zombie') {
                        config.rate = Phaser.Math.FloatBetween(0.62, 0.82);
                        config.seek = 0.44;
                    }
                    this.playSfx(base.moveSfx, config);
                }
                enemy.nextSoundTick = now + Phaser.Math.Between(650, 1300);
            }
        });
    }

    updateEnemyCounter() {
        const alive = this.enemies.countActive(true);
        const bossesLeft = Math.max(0, this.requiredBosses - this.defeatedBosses);
        this.enemyCountText.setText(`Enemies: ${alive}  Bosses Needed: ${bossesLeft}`);
        this.statusText.setText(`Threat x${this.threatLevel.toFixed(2)}  Combo x${this.comboMultiplier.toFixed(1)}`);
    }

    shoot() {
        if (!this.player.active) return;
        if (this.time.now - this.lastShotAt < this.currentWeapon.cooldown) return;
        this.lastShotAt = this.time.now;
        const aimDir = this.getAimDirection();
        this.lastMoveDir.copy(aimDir);
        if (this.currentWeapon.mode === 'melee') {
            this.performBladeSlash();
            return;
        }

        this.playSfx('shoot', { volume: 0.14, rate: 1.2, seek: 0.08, duration: 0.14 });
        const burst = this.currentWeapon.burst || 1;
        for (let i = 0; i < burst; i++) {
            const projectile = this.projectiles.get(this.player.x, this.player.y);
            if (!projectile) continue;
            projectile.enableBody(true, this.player.x, this.player.y, true, true);
            projectile.setScale(1.3, 0.9);
            projectile.setTint(0xffffff);
            projectile.lifespan = 950;
            projectile.damage = this.currentWeapon.damage;
            this.ignoreForUiCamera(projectile);
            const centered = burst === 1 ? 0 : (i - (burst - 1) / 2) / (burst - 1);
            const spread = centered * this.currentWeapon.spread + Phaser.Math.FloatBetween(-0.01, 0.01);
            const angle = aimDir.angle() + spread;
            this.physics.velocityFromRotation(angle, this.currentWeapon.speed, projectile.body.velocity);
        }
    }

    performBladeSlash() {
        const angle = this.getAimDirection().angle();
        const arc = this.currentWeapon.arc;
        const radius = this.currentWeapon.range;
        const start = angle - arc / 2;
        const end = angle + arc / 2;

        const slash = this.add.graphics({ x: this.player.x, y: this.player.y });
        slash.setDepth(5);
        slash.lineStyle(5, 0xc7efff, 0.75);
        slash.beginPath();
        slash.arc(0, 0, radius, start, end, false);
        slash.strokePath();
        this.tweens.add({
            targets: slash,
            alpha: 0,
            duration: 130,
            onComplete: () => slash.destroy()
        });

        this.playSfx('hit', { volume: 0.14, rate: 0.98, seek: 0.24, duration: 0.16 });
        this.enemies.children.iterate((enemy) => {
            if (!enemy || !enemy.active) return;
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            if (dist > radius) return;
            const enemyAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            const delta = Phaser.Math.Angle.Wrap(enemyAngle - angle);
            if (Math.abs(delta) > arc / 2) return;
            this.damageEnemy(enemy, this.currentWeapon.damage, this.currentWeapon.knockback);
        });
    }

    getAimDirection() {
        const pointer = this.input.activePointer;
        if (pointer && (!this.isTouchDevice || pointer.isDown)) {
            const worldPoint = pointer.positionToCamera(this.cameras.main);
            const vec = new Phaser.Math.Vector2(worldPoint.x - this.player.x, worldPoint.y - this.player.y);
            if (vec.lengthSq() > 64) return vec.normalize();
        }

        if (this.joystick?.force > 0.18) {
            const joy = new Phaser.Math.Vector2(this.joystick.forceX, this.joystick.forceY);
            if (joy.lengthSq() > 0.01) return joy.normalize();
        }

        let nearest = null;
        let nearestDist = TILE_SIZE * 14;
        this.enemies.children.each((enemy) => {
            if (!enemy || !enemy.active) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < nearestDist) {
                nearest = enemy;
                nearestDist = dist;
            }
        });
        if (nearest) {
            return new Phaser.Math.Vector2(nearest.x - this.player.x, nearest.y - this.player.y).normalize();
        }

        if (this.lastMoveDir.lengthSq() > 0.001) return this.lastMoveDir.clone().normalize();
        return new Phaser.Math.Vector2(1, 0);
    }

    hitEnemy(projectile, enemy) {
        this.despawnProjectile(projectile);
        this.damageEnemy(enemy, projectile.damage || 1, 0);
    }

    damageEnemy(enemy, damageAmount, knockback = 0) {
        if (!enemy || !enemy.active) return;
        enemy.health -= damageAmount;
        enemy.hpBarUntil = this.time.now + 1800;
        this.updateEnemyHealthBar(enemy, this.time.now, this.cameras.main.worldView, true);
        enemy.setTintFill(0xffffff);
        this.time.delayedCall(60, () => {
            if (!enemy.active) return;
            enemy.clearTint();
            this.applyVariantVisual(enemy);
        });

        if (knockback > 0) {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            this.physics.velocityFromRotation(angle, knockback, enemy.body.velocity);
        }

        if (enemy.health > 0) return;
        this.onEnemyDefeated(enemy);
    }

    onEnemyDefeated(enemy) {
        this.playSfx('hit', { volume: 0.12, rate: Phaser.Math.FloatBetween(0.85, 1.15), seek: 0.35, duration: 0.18 });
        this.spawnSparkBurst(enemy.x, enemy.y, enemy.isBoss ? 0xffbf8f : 0xbdd6ff, enemy.isBoss ? 24 : 12, enemy.isBoss ? 180 : 120);
        this.registerKillCombo();
        const awardedScore = Math.round(enemy.score * this.comboMultiplier);
        this.score += awardedScore;
        this.scoreText.setText(`Score: ${this.score}`);
        if (this.comboCount > 0 && this.comboCount % 3 === 0) {
            this.flashMessage(`Combo x${this.comboMultiplier.toFixed(1)}!`, '#fff1a9', 900);
        }
        if (enemy.variant?.id === 'splitter' && enemy.typeName === 'slime' && !enemy.isBoss) {
            for (let i = 0; i < 2; i++) {
                const childTile = this.findNearbyOpenTile(enemy.x, enemy.y, 4) || this.dungeon.getRandomOpenTile();
                const child = this.createEnemy('slime', childTile, {
                    scale: 1.15,
                    hpGrowthBoost: -0.15,
                    speedGrowthBoost: 0.65,
                    scoreGrowthBoost: 0.1
                });
                if (child) {
                    child.health = Math.max(1, Math.round(child.health * 0.55));
                    child.maxHealth = child.health;
                }
            }
        }

        if (enemy.isBoss) {
            this.defeatedBosses += 1;
            const msg = enemy.typeName === 'majorBoss' ? 'Major boss defeated!' : 'Mini boss defeated!';
            this.flashMessage(msg, '#ffdca7');
        }
        if (enemy.hpBarBg) enemy.hpBarBg.destroy();
        if (enemy.hpBarFill) enemy.hpBarFill.destroy();
        enemy.disableBody(true, true);
        this.refreshCameraIgnores();
    }

    findNearbyOpenTile(worldX, worldY, radiusTiles) {
        const cx = Math.floor(worldX / TILE_SIZE);
        const cy = Math.floor(worldY / TILE_SIZE);
        for (let r = 0; r <= radiusTiles; r++) {
            for (let y = cy - r; y <= cy + r; y++) {
                for (let x = cx - r; x <= cx + r; x++) {
                    if (x < 1 || y < 1 || x >= this.dungeon.width - 1 || y >= this.dungeon.height - 1) continue;
                    if (this.dungeon.map[y][x] === 0) return { x, y };
                }
            }
        }
        return null;
    }

    updateEnemyHealthBar(enemy, now, worldView, forceVisible = false) {
        if (!enemy.hpBarBg || !enemy.hpBarFill) return;
        if (!enemy.active) {
            enemy.hpBarBg.setVisible(false);
            enemy.hpBarFill.setVisible(false);
            return;
        }
        enemy.hpBarBg.setPosition(enemy.x, enemy.y - 16);
        enemy.hpBarFill.setPosition(enemy.x, enemy.y - 16);
        this.applyDepth(enemy.hpBarBg, Math.floor(enemy.depth) + 8);
        this.applyDepth(enemy.hpBarFill, Math.floor(enemy.depth) + 9);
        const hpRatio = Phaser.Math.Clamp(enemy.health / enemy.maxHealth, 0, 1);
        enemy.hpBarFill.width = 18 * hpRatio;
        enemy.hpBarFill.setOrigin(0.5 - 0.5 * (1 - hpRatio), 0.5);
        const show = forceVisible || (now <= enemy.hpBarUntil && worldView.contains(enemy.x, enemy.y));
        enemy.hpBarBg.setVisible(show);
        enemy.hpBarFill.setVisible(show);
    }

    despawnProjectile(projectile) {
        if (!projectile || !projectile.body) return;
        projectile.disableBody(true, true);
    }

    checkLevelClear() {
        if (this.portalSpawned || this.defeatedBosses < this.requiredBosses) return;
        this.portalSpawned = true;
        this.playSfx('levelClear', { volume: 0.16, rate: 1.1, seek: 0.55, duration: 0.45 });
        const tile = this.dungeon.getRandomOpenTile();
        if (!tile) return;
        this.portalGlow = this.add.image(tile.x * TILE_SIZE, tile.y * TILE_SIZE + 2, 'groundGlowMask')
            .setScale(2.8, 2.1)
            .setTint(this.theme.accent)
            .setAlpha(0.42)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.portalRing = this.add.image(tile.x * TILE_SIZE, tile.y * TILE_SIZE, 'lightMask')
            .setScale(2.05)
            .setTint(this.theme.accent)
            .setAlpha(0.33)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.portal = this.physics.add.sprite(tile.x * TILE_SIZE, tile.y * TILE_SIZE, 'portal').setScale(2.4, 1.9);
        this.portal.setDepth(2);
        this.portal.setTint(this.theme.accent);
        this.portal.body.setSize(TILE_SIZE * 2.6, TILE_SIZE * 2.1, true);
        this.portal.setInteractive({ useHandCursor: true });
        this.portal.on('pointerdown', () => this.enterPortal());
        this.tweens.add({
            targets: this.portalGlow,
            scaleX: 3.15,
            scaleY: 2.34,
            alpha: 0.72,
            yoyo: true,
            duration: 820,
            repeat: -1,
            ease: 'Sine.InOut'
        });
        this.tweens.add({
            targets: this.portalRing,
            angle: 360,
            duration: 2600,
            repeat: -1,
            ease: 'Linear'
        });
        this.tweens.add({
            targets: this.portalRing,
            scale: 2.4,
            alpha: 0.5,
            yoyo: true,
            duration: 1050,
            repeat: -1,
            ease: 'Sine.InOut'
        });
        this.tweens.add({
            targets: this.portal,
            angle: 360,
            duration: 3000,
            repeat: -1
        });
        this.tweens.add({
            targets: this.portal,
            scaleX: 2.7,
            scaleY: 1.9,
            yoyo: true,
            duration: 780,
            repeat: -1,
            ease: 'Sine.InOut'
        });
        this.portalAura = this.add.particles(this.portal.x, this.portal.y, 'projectile', {
            speed: { min: 12, max: 55 },
            lifespan: { min: 500, max: 1100 },
            alpha: { start: 0.38, end: 0 },
            scale: { start: 0.4, end: 0 },
            tint: [this.theme.accent],
            quantity: 1,
            frequency: 85,
            follow: this.portal,
            blendMode: Phaser.BlendModes.ADD
        });
        this.portalWhoosh = this.sound.add('levelClear', { loop: true, volume: 0, rate: 0.55 });
        this.portalWhoosh.play();
        this.physics.add.overlap(this.player, this.portal, this.enterPortal, null, this);
        this.refreshCameraIgnores();
        this.flashMessage('Path to next level opened!', '#fff2bf');
    }

    updatePortalInteraction() {
        if (!this.portalHintText) return;
        if (!this.portal || !this.portal.active || this.transitioning || this.isUpgradeMenuOpen) {
            this.portalHintText.setVisible(false);
            return;
        }
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portal.x, this.portal.y);
        const near = dist <= TILE_SIZE * 2.4;
        this.portalHintText.setVisible(near);
        if (!near) return;
        const action = this.isTouchDevice ? 'Tap portal' : 'Press F or click portal';
        this.portalHintText.setText(`${action} to continue`);
        if (!this.isTouchDevice && Phaser.Input.Keyboard.JustDown(this.portalInteractKey)) {
            this.enterPortal();
        }
    }

    enterPortal() {
        if (this.transitioning) return;
        this.transitioning = true;
        this.portalHintText?.setVisible(false);
        this.showUpgradeChoices();
    }

    fireEnemyProjectile(enemy, speed, damage, tint = 0xffcaa0) {
        const shot = this.enemyProjectiles.get(enemy.x, enemy.y);
        if (!shot) return;
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        shot.enableBody(true, enemy.x, enemy.y, true, true);
        shot.setScale(1.0, 0.72);
        shot.setTint(tint);
        shot.damage = damage;
        shot.lifespan = 1200;
        this.ignoreForUiCamera(shot);
        this.physics.velocityFromRotation(angle, speed, shot.body.velocity);
    }

    playerHitByProjectile(player, projectile) {
        this.despawnProjectile(projectile);
        this.playerHit(player, { damage: projectile.damage || 6, typeName: 'skeleton', x: player.x - 2, y: player.y - 2 });
    }

    playerHit(player, enemy) {
        if (this.isGameOver) return;
        if (this.tempInvincibleUntil > this.time.now) return;
        if (player.isInvulnerable) return;
        this.playSfx('playerHurt', { volume: 0.16, rate: 0.85, seek: 0.2, duration: 0.22 });
        this.cameras.main.shake(90, 0.0028);
        const threatDamageFactor = Phaser.Math.Linear(1, 1.25, (this.threatLevel - 1) / 4);
        player.health -= Math.round(enemy.damage * threatDamageFactor);
        if (enemy.variant?.id === 'leech' && enemy.active) {
            enemy.health = Math.min(enemy.maxHealth, enemy.health + 1);
        }
        this.updateHealthBar();

        if (player.health <= 0) {
            this.isGameOver = true;
            const high = Number(localStorage.getItem('highScore') || 0);
            if (this.score > high) localStorage.setItem('highScore', String(this.score));
            this.physics.pause();
            player.setTint(0xff6666);
            if (this.bgMusic) this.bgMusic.stop();
            if (this.darkness) this.darkness.setVisible(false);
            if (this.warmLight) this.warmLight.setVisible(false);
            const over = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 70, 'You Fainted', {
                fontSize: '56px',
                color: '#ffb4b4',
                stroke: '#220d0d',
                strokeThickness: 7
            }).setOrigin(0.5).setScrollFactor(0).setDepth(HUD_DEPTH + 20);

            const retry = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 10, 'Retry', {
                fontSize: '30px',
                color: '#f3f3f3',
                backgroundColor: '#20323a'
            }).setOrigin(0.5).setPadding(14, 8, 14, 8)
                .setScrollFactor(0)
                .setDepth(HUD_DEPTH + 20)
                .setInteractive()
                .on('pointerdown', () => {
                    over.destroy();
                    this.scene.start('GameScene', { levelIndex: 1, score: 0, health: 100, lanternFuel: 100, weaponType: 'wand' });
                });

            const home = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 58, 'Home', {
                fontSize: '30px',
                color: '#f3f3f3',
                backgroundColor: '#253123'
            }).setOrigin(0.5).setPadding(14, 8, 14, 8)
                .setScrollFactor(0)
                .setDepth(HUD_DEPTH + 20)
                .setInteractive()
                .on('pointerdown', () => {
                    over.destroy();
                    this.scene.start('StartScene');
                });
            this.cameras.main.ignore([over, retry, home]);
            return;
        }

        player.isInvulnerable = true;
        this.tweens.add({
            targets: player,
            alpha: 0.4,
            yoyo: true,
            repeat: 4,
            duration: 80,
            onComplete: () => {
                player.alpha = 1;
                player.isInvulnerable = false;
            }
        });

        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        if (enemy.body) {
            this.physics.velocityFromRotation(angle, ENEMY_TYPES[enemy.typeName]?.knockback || 120, enemy.body.velocity);
        }
        this.time.delayedCall(120, () => {
            if (enemy.active && enemy.body) enemy.setVelocity(0, 0);
        });
    }

    collectPotion(player, potion) {
        potion.destroy();
        player.health = Math.min(player.maxHealth, player.health + 22);
        this.playSfx('heal', { volume: 0.13, rate: 1.35, seek: 0.7, duration: 0.2 });
        this.spawnSparkBurst(player.x, player.y - 12, 0x9effb5, 12, 110);
        this.updateHealthBar();
    }

    collectLantern(_player, lantern) {
        lantern.destroy();
        this.lanternFuel = Math.min(this.maxLanternFuel, this.lanternFuel + 32);
        this.playSfx('lanternPickup', { volume: 0.12, rate: 1.22, seek: 0.18, duration: 0.18 });
        this.spawnSparkBurst(_player.x, _player.y - 10, 0xffdf8a, 11, 100);
        this.updateLanternBar();
    }

    collectCoin(_player, coin) {
        const value = coin.value || 3;
        coin.destroy();
        this.coins += value;
        this.coinText.setText(`Coins: ${this.coins}`);
        this.playSfx('weaponPickup', { volume: 0.12, rate: 1.3, seek: 0.26, duration: 0.15 });
        this.spawnSparkBurst(_player.x, _player.y - 8, 0xfdd56e, 10, 90);
    }

    playerLightOut() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.physics.pause();
        this.player.setTint(0x333333);
        if (this.bgMusic) this.bgMusic.stop();
        if (this.darkness) this.darkness.setVisible(false);
        if (this.warmLight) this.warmLight.setVisible(false);
        this.flashMessage('Your lantern burned out...', '#f8e7b5', 2400);

        this.time.delayedCall(1200, () => {
            const retry = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 42, 'Retry', {
                fontSize: '30px',
                color: '#f3f3f3',
                backgroundColor: '#20323a'
            }).setOrigin(0.5).setPadding(14, 8, 14, 8)
                .setScrollFactor(0)
                .setDepth(HUD_DEPTH + 20)
                .setInteractive()
                .on('pointerdown', () => this.scene.start('GameScene', { levelIndex: 1, score: 0, health: 100, lanternFuel: 100, weaponType: 'wand' }));

            const home = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 90, 'Home', {
                fontSize: '30px',
                color: '#f3f3f3',
                backgroundColor: '#253123'
            }).setOrigin(0.5).setPadding(14, 8, 14, 8)
                .setScrollFactor(0)
                .setDepth(HUD_DEPTH + 20)
                .setInteractive()
                .on('pointerdown', () => {
                    retry.destroy();
                    this.scene.start('StartScene');
                });
            this.cameras.main.ignore([retry, home]);
        });
    }

    flashMessage(text, color, duration = 1600) {
        const msg = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, text, {
            fontSize: '34px',
            color,
            stroke: '#3e2a1f',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(HUD_DEPTH + 10);
        this.cameras.main.ignore(msg);
        this.tweens.add({
            targets: msg,
            alpha: 0,
            duration,
            onComplete: () => msg.destroy()
        });
    }

    spawnSparkBurst(x, y, tint = 0xffffff, count = 10, speed = 120) {
        const burst = this.add.particles(x, y, 'projectile', {
            speed: { min: speed * 0.35, max: speed },
            lifespan: { min: 220, max: 360 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.65, end: 0 },
            tint: [tint],
            quantity: count,
            blendMode: Phaser.BlendModes.ADD
        });
        this.ignoreForUiCamera(burst);
        this.time.delayedCall(380, () => burst.destroy());
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0x111111, 0.9);
        this.healthBar.fillRect(this.hud.x, this.hud.y + this.hud.healthY, this.hud.barOuterWidth, this.hud.barOuterHeight);
        this.healthBar.fillStyle(0x7d2b2b, 1);
        this.healthBar.fillRect(this.hud.x + this.hud.barInset, this.hud.y + this.hud.healthY + this.hud.barInset, this.hud.barInnerWidth, this.hud.barInnerHeight);
        this.healthBar.fillStyle(0x7de08f, 1);
        this.healthBar.fillRect(
            this.hud.x + this.hud.barInset,
            this.hud.y + this.hud.healthY + this.hud.barInset,
            this.hud.barInnerWidth * (this.player.health / this.player.maxHealth),
            this.hud.barInnerHeight
        );
    }

    updateLanternBar() {
        if (!this.lanternBar) return;
        this.lanternBar.clear();
        this.lanternBar.fillStyle(0x111111, 0.9);
        this.lanternBar.fillRect(this.hud.x, this.hud.y + this.hud.lanternY, this.hud.barOuterWidth, this.hud.lanternOuterHeight);
        this.lanternBar.fillStyle(0x61491f, 1);
        this.lanternBar.fillRect(this.hud.x + this.hud.barInset, this.hud.y + this.hud.lanternY + this.hud.barInset, this.hud.barInnerWidth, this.hud.lanternInnerHeight);
        this.lanternBar.fillStyle(0xffd46b, 1);
        this.lanternBar.fillRect(
            this.hud.x + this.hud.barInset,
            this.hud.y + this.hud.lanternY + this.hud.barInset,
            this.hud.barInnerWidth * (this.lanternFuel / this.maxLanternFuel),
            this.hud.lanternInnerHeight
        );
    }

    updateLightFlicker(now) {
        if (now > this.nextFlickerTick) {
            this.nextFlickerTick = now + Phaser.Math.Between(120, 220);
            this.lightFlickerTarget = Phaser.Math.FloatBetween(0.98, 1.02);
        }
        this.lightFlicker = Phaser.Math.Linear(this.lightFlicker, this.lightFlickerTarget, 0.06);
    }

    registerKillCombo() {
        const now = this.time.now;
        this.comboCount = now <= this.comboExpiresAt ? this.comboCount + 1 : 1;
        this.comboExpiresAt = now + this.comboWindowMs;
        this.comboMultiplier = Math.min(4, 1 + Math.floor(this.comboCount / 3) * 0.5);
    }

    updateCombo(now) {
        if (this.comboCount === 0) return;
        if (now <= this.comboExpiresAt) return;
        this.comboCount = 0;
        this.comboMultiplier = 1;
    }

    updateThreat(now) {
        if (now < this.nextThreatTick) return;
        this.nextThreatTick = now + 18000;
        this.threatLevel = Math.min(5, this.threatLevel + 0.25);
        this.flashMessage(`Threat Rising x${this.threatLevel.toFixed(2)}`, '#ffc9a7', 850);
    }

    spawnReinforcements(now) {
        if (!this.allowReinforcements) return;
        if (now < this.nextReinforcementAt) return;
        this.nextReinforcementAt = now + this.reinforcementCadenceMs;

        const activeEnemies = this.enemies.countActive(true);
        const maxEnemies = BASE_ENEMY_CAP + Math.round(this.profile.growth * 5);
        if (activeEnemies >= maxEnemies) return;

        const pool = this.levelIndex < 3
            ? ['slime', 'skeleton']
            : this.levelIndex < 6
                ? ['slime', 'skeleton', 'zombie']
                : ['skeleton', 'zombie'];

        const typeName = Phaser.Utils.Array.GetRandom(pool);
        this.createEnemy(typeName, this.dungeon.getRandomOpenTile(), {
            scale: 1.5,
            hpGrowthBoost: (this.threatLevel - 1) * 0.3,
            speedGrowthBoost: 0.5,
            scoreGrowthBoost: 0.25
        });
    }

    updatePortalAudio() {
        if (!this.portalWhoosh) return;
        if (!this.portal || !this.portal.active) {
            this.portalWhoosh.setVolume(Math.max(0, this.portalWhoosh.volume - 0.01));
            return;
        }
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portal.x, this.portal.y);
        const nearRadius = TILE_SIZE * 12;
        const farRadius = TILE_SIZE * 28;
        const target = Phaser.Math.Clamp(1 - (dist - nearRadius) / (farRadius - nearRadius), 0, 1) * 0.2;
        this.portalWhoosh.setVolume(Phaser.Math.Linear(this.portalWhoosh.volume, target, 0.08));
    }

    showUpgradeChoices() {
        this.isUpgradeMenuOpen = true;
        this.upgradeSelectionLocked = false;
        this.physics.pause();
        this.isActionPressed = false;
        this.desktopAutoFire = false;
        if (this.portalWhoosh) this.portalWhoosh.stop();

        const options = this.pickUpgradeChoices(3);
        const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x06090f, 0.82)
            .setScrollFactor(0)
            .setDepth(HUD_DEPTH + 40)
            .setInteractive();
        const title = this.add.text(this.scale.width / 2, 56, 'Choose Upgrade', {
            fontSize: '34px',
            color: '#f4f0d8'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(HUD_DEPTH + 41);
        const subtitle = this.add.text(this.scale.width / 2, 92, `Coins: ${this.coins}`, {
            fontSize: '20px',
            color: '#ffe28d'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(HUD_DEPTH + 41);

        const cards = [];
        const width = this.scale.width;
        const cardWidth = Math.min(260, Math.max(170, Math.floor(width / 3.8)));
        const spacing = Math.floor(cardWidth * 1.1);
        const startX = this.scale.width / 2 - spacing;
        const y = this.scale.height / 2 + 10;

        let skip;
        const finalize = () => {
            if (this.upgradeSelectionLocked) return;
            this.upgradeSelectionLocked = true;
            cards.forEach((card) => {
                card.bg.destroy();
                card.text.destroy();
            });
            if (skip) skip.destroy();
            title.destroy();
            subtitle.destroy();
            overlay.destroy();
            this.continueToNextLevel();
        };

        options.forEach((option, index) => {
            const affordable = this.coins >= option.cost;
            const bg = this.add.rectangle(startX + index * spacing, y, cardWidth, 170, affordable ? 0x16223a : 0x2c1f24, 0.95)
                .setStrokeStyle(2, affordable ? 0x9fbbe0 : 0x9b6f7a, 0.9)
                .setScrollFactor(0)
                .setDepth(HUD_DEPTH + 41)
                .setInteractive();
            const text = this.add.text(bg.x, bg.y, `${option.title}\n\n${option.desc}\n\nCost: ${option.cost}`, {
                fontSize: '18px',
                color: affordable ? '#eef6ff' : '#dcc9cf',
                align: 'center',
                wordWrap: { width: cardWidth - 20 }
            }).setOrigin(0.5).setScrollFactor(0).setDepth(HUD_DEPTH + 42);
            bg.on('pointerdown', () => {
                if (this.coins < option.cost) {
                    this.flashMessage('Not enough coins', '#ffb8b8', 700);
                    return;
                }
                this.coins -= option.cost;
                this.coinText.setText(`Coins: ${this.coins}`);
                this.applyUpgrade(option.id);
                finalize();
            });
            cards.push({ bg, text });
        });

        skip = this.add.text(this.scale.width / 2, this.scale.height - 54, 'Skip Upgrade', {
            fontSize: '24px',
            color: '#cde7ff',
            backgroundColor: '#1a2a3f'
        }).setOrigin(0.5).setPadding(12, 6, 12, 6)
            .setScrollFactor(0)
            .setDepth(HUD_DEPTH + 42)
            .setInteractive()
            .on('pointerdown', () => {
                skip.destroy();
                finalize();
            });

        this.cameras.main.ignore([overlay, title, subtitle, skip, ...cards.map((c) => c.bg), ...cards.map((c) => c.text)]);
    }

    pickUpgradeChoices(count) {
        const choices = [
            { id: 'wandBurst', title: 'Wand Volley', desc: 'Fire extra wand bolts each shot.', cost: 18 + this.upgrades.wandBurst * 6 },
            { id: 'wandDamage', title: 'Arcane Core', desc: 'Increase wand bolt damage.', cost: 20 + this.upgrades.wandDamage * 8 },
            { id: 'bladeDamage', title: 'Sharpened Edge', desc: 'Increase sword slash damage.', cost: 20 + this.upgrades.bladeDamage * 8 },
            { id: 'moveSpeed', title: 'Fleet Boots', desc: 'Increase movement speed.', cost: 16 + this.upgrades.moveSpeed * 8 },
            { id: 'maxLantern', title: 'Larger Lantern', desc: 'Increase max lantern fuel.', cost: 16 + this.upgrades.maxLantern * 10 },
            { id: 'maxHealth', title: 'Vitality', desc: 'Increase max health.', cost: 18 + this.upgrades.maxHealth * 10 },
            { id: 'tempPotion', title: 'Temp Potion', desc: 'Gain one 30s invincibility potion.', cost: 14 + this.tempPotions * 4 }
        ];

        const picked = [];
        const pool = choices.slice();
        while (picked.length < count && pool.length > 0) {
            const index = Phaser.Math.Between(0, pool.length - 1);
            picked.push(pool.splice(index, 1)[0]);
        }
        return picked;
    }

    applyUpgrade(id) {
        if (id === 'tempPotion') {
            this.tempPotions += 1;
            this.refreshTempPotionText();
            return;
        }
        this.upgrades[id] = (this.upgrades[id] || 0) + 1;
        if (id === 'maxLantern') {
            const prevMax = this.maxLanternFuel;
            this.maxLanternFuel = 100 + this.upgrades.maxLantern * 18;
            this.lanternFuel += this.maxLanternFuel - prevMax;
            this.lanternFuel = Phaser.Math.Clamp(this.lanternFuel, 0, this.maxLanternFuel);
            this.updateLanternBar();
        }
        if (id === 'maxHealth') {
            const prevMax = this.player.maxHealth;
            this.player.maxHealth = 100 + this.upgrades.maxHealth * 22;
            this.player.health += this.player.maxHealth - prevMax;
            this.player.health = Phaser.Math.Clamp(this.player.health, 1, this.player.maxHealth);
            this.updateHealthBar();
        }
        this.currentWeapon = this.buildWeaponConfig(this.currentWeaponType);
    }

    continueToNextLevel() {
        this.isUpgradeMenuOpen = false;
        this.physics.resume();
        const nextMaxHealth = 100 + this.upgrades.maxHealth * 22;
        const nextMaxLantern = 100 + this.upgrades.maxLantern * 18;
        this.scene.start('GameScene', {
            levelIndex: this.levelIndex + 1,
            score: this.score,
            health: nextMaxHealth,
            lanternFuel: nextMaxLantern,
            weaponType: this.currentWeaponType,
            inventory: this.weaponInventory,
            selectedWeaponSlot: this.selectedWeaponSlot,
            coins: this.coins,
            upgrades: this.upgrades,
            tempPotions: this.tempPotions
        });
    }

    createWeaponSlotUi() {
        const slots = [];
        for (let i = 0; i < 2; i++) {
            const bg = this.add.rectangle(0, 0, 42, 42, 0x0f1520, 0.86)
                .setScrollFactor(0)
                .setStrokeStyle(2, 0x6d7c8a, 0.7)
                .setInteractive()
                .on('pointerdown', () => this.selectWeaponSlot(i));
            const icon = this.add.image(0, 0, 'weaponWand').setScrollFactor(0).setScale(0.85);
            const keyText = this.add.text(0, 0, `${i + 1}`, {
                fontSize: `${Math.round(this.hud.fontSmall * 0.72)}px`,
                color: '#d7deea'
            }).setScrollFactor(0).setOrigin(0.5);
            slots.push({ bg, icon, keyText });
        }
        this.layoutWeaponSlots();
        return slots;
    }

    layoutWeaponSlots() {
        if (!this.weaponSlots) return;
        const size = Math.max(50, Math.round(58 * (this.hud.fontSmall / 18)));
        const spacing = Math.max(8, Math.round(8 * (this.hud.fontSmall / 18)));
        const top = this.hud.y + this.hud.statsStartY + this.hud.rowGap * 4 + Math.round(this.hud.fontSmall * 1.35);
        for (let i = 0; i < this.weaponSlots.length; i++) {
            const x = this.hud.x + Math.round(size / 2) + i * (size + spacing);
            const slot = this.weaponSlots[i];
            if (!slot.bg || !slot.bg.geom) continue;
            slot.bg.setSize(size, size).setPosition(x, top);
            slot.icon.setPosition(x, top).setScale(size / 36);
            slot.keyText.setPosition(x + Math.round(size * 0.32), top - Math.round(size * 0.34)).setFontSize(Math.round(size * 0.32));
        }
    }

    refreshWeaponSlots() {
        if (!this.weaponSlots) return;
        for (let i = 0; i < this.weaponSlots.length; i++) {
            const weaponType = this.weaponInventory[i];
            const selected = i === this.selectedWeaponSlot;
            const slot = this.weaponSlots[i];
            if (weaponType) {
                slot.icon.setTexture(weaponType === 'blade' ? 'weaponBlade' : 'weaponWand').setVisible(true);
                slot.bg.setFillStyle(selected ? 0x1f2f44 : 0x0f1520, selected ? 0.95 : 0.86);
                slot.bg.setStrokeStyle(selected ? 3 : 2, selected ? 0xc9e6ff : 0x6d7c8a, selected ? 1 : 0.7);
            } else {
                slot.icon.setVisible(false);
                slot.bg.setFillStyle(0x0b1018, 0.72);
                slot.bg.setStrokeStyle(2, 0x3d4653, 0.55);
            }
        }
    }

    refreshTempPotionText() {
        const activeFor = Math.max(0, Math.ceil((this.tempInvincibleUntil - this.time.now) / 1000));
        const active = activeFor > 0 ? ` • Active ${activeFor}s` : '';
        this.tempPotionText.setText(`Temp Potions [R]: ${this.tempPotions}${active}`);
    }

    tryStoreWeapon(weaponType) {
        if (!WEAPON_TYPES[weaponType]) return -1;
        const existingSlot = this.weaponInventory.indexOf(weaponType);
        if (existingSlot >= 0) return existingSlot;
        const emptySlot = this.weaponInventory.findIndex((weapon) => !weapon);
        if (emptySlot >= 0) {
            this.weaponInventory[emptySlot] = weaponType;
            return emptySlot;
        }
        this.weaponInventory[this.selectedWeaponSlot] = weaponType;
        return this.selectedWeaponSlot;
    }

    cycleWeapon(step) {
        const unlocked = this.weaponInventory
            .map((weapon, index) => ({ weapon, index }))
            .filter((entry) => entry.weapon);
        if (unlocked.length < 2) return;
        const position = unlocked.findIndex((entry) => entry.index === this.selectedWeaponSlot);
        const next = Phaser.Math.Wrap(position + step, 0, unlocked.length);
        this.selectWeaponSlot(unlocked[next].index);
    }

    selectWeaponSlot(slotIndex) {
        const weaponType = this.weaponInventory[slotIndex];
        if (!weaponType) return;
        this.selectedWeaponSlot = slotIndex;
        this.currentWeaponType = weaponType;
        this.currentWeapon = this.buildWeaponConfig(weaponType);
        this.weaponText.setText(`Weapon: ${this.currentWeapon.name}`);
        this.refreshWeaponSlots();
    }

    buildWeaponConfig(weaponType) {
        const base = { ...WEAPON_TYPES[weaponType] };
        if (weaponType === 'wand') {
            base.damage += this.upgrades.wandDamage;
            base.burst = 1 + this.upgrades.wandBurst;
            base.spread = Math.min(0.32, base.spread + this.upgrades.wandBurst * 0.025);
        }
        if (weaponType === 'blade') {
            base.damage += this.upgrades.bladeDamage;
            base.range += this.upgrades.bladeDamage * 4;
        }
        return base;
    }

    useTempPotion() {
        if (this.tempPotions <= 0) return;
        if (this.tempInvincibleUntil > this.time.now) return;
        this.tempPotions -= 1;
        this.tempInvincibleUntil = this.time.now + 30000;
        this.player.isInvulnerable = true;
        this.player.setTint(0x9dfde3);
        this.refreshTempPotionText();
        this.flashMessage('Invincible for 30s', '#b8ffe8', 1100);
    }

    updateTempInvincibility(now) {
        if (this.tempInvincibleUntil <= 0) return;
        if (now <= this.tempInvincibleUntil) {
            this.refreshTempPotionText();
            return;
        }
        this.tempInvincibleUntil = 0;
        if (this.player.active) {
            this.player.clearTint();
        }
        this.player.isInvulnerable = false;
        this.refreshTempPotionText();
    }

    updateAimFromPointer(pointer) {
        if (!pointer) return;
        if (!this.player || !this.player.active) return;
        if (this.isTouchDevice && !pointer.isDown) return;
        const worldPoint = pointer.positionToCamera(this.cameras.main);
        const dx = worldPoint.x - this.player.x;
        const dy = worldPoint.y - this.player.y;
        if (dx === 0 && dy === 0) return;
        this.lastMoveDir.set(dx, dy).normalize();
    }

    getControlMetrics(width, height) {
        const minDim = Math.min(width, height);
        const margin = Phaser.Math.Clamp(Math.round(minDim * 0.06), 12, 28);
        const radius = Phaser.Math.Clamp(Math.round(minDim * 0.09), 36, 58);
        const thumbRadius = Math.round(radius * 0.5);
        const buttonRadius = Phaser.Math.Clamp(Math.round(radius * 1.02), 38, 62);
        const y = height - margin - radius;
        return {
            leftX: margin + radius,
            rightX: width - margin - buttonRadius,
            y,
            radius,
            thumbRadius,
            buttonRadius
        };
    }

    getHudLayout(width, height) {
        const minDim = Math.min(width, height);
        const scale = Phaser.Math.Clamp(minDim / 420, 0.78, 1.25);
        const x = Math.round(12 * scale);
        const y = Math.round(8 * scale);
        const rowGap = Math.round(26 * scale);
        const barInnerWidth = Math.round(200 * scale);
        const barInset = Math.max(2, Math.round(2 * scale));
        return {
            x,
            y,
            rowGap,
            fontLarge: Math.round(24 * scale),
            fontMedium: Math.round(20 * scale),
            fontSmall: Math.round(18 * scale),
            statsStartY: Math.round(118 * scale),
            healthY: Math.round(74 * scale),
            lanternY: Math.round(98 * scale),
            barInset,
            barInnerWidth,
            barInnerHeight: Math.round(12 * scale),
            lanternInnerHeight: Math.round(10 * scale),
            barOuterWidth: barInnerWidth + barInset * 2,
            barOuterHeight: Math.round(16 * scale),
            lanternOuterHeight: Math.round(14 * scale)
        };
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-root',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
    },
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            fps: 120,
            overlapBias: 12,
            debug: false
        }
    },
    scene: [StartScene, GameScene, WinScene],
    plugins: {
        global: [{
            key: 'rexvirtualjoystickplugin',
            plugin: rexvirtualjoystickplugin,
            start: true
        }]
    }
};

new Phaser.Game(config);
