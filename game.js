class Dungeon {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.map = Array(height).fill(0).map(() => Array(width).fill(0));
    }

    generate() {
        // Create border walls
        for (let x = 0; x < this.width; x++) {
            this.map[0][x] = 1;
            this.map[this.height - 1][x] = 1;
        }
        for (let y = 0; y < this.height; y++) {
            this.map[y][0] = 1;
            this.map[y][this.width - 1] = 1;
        }

        // Add random wall lines
        const wallLineCount = 20; // Number of wall lines
        const minWallLength = 3;
        const maxWallLength = 8;

        for (let i = 0; i < wallLineCount; i++) {
            const startX = Phaser.Math.Between(1, this.width - 2);
            const startY = Phaser.Math.Between(1, this.height - 2);
            const length = Phaser.Math.Between(minWallLength, maxWallLength);
            const direction = Phaser.Math.Between(0, 3); // 0: up, 1: right, 2: down, 3: left

            let currentX = startX;
            let currentY = startY;

            for (let j = 0; j < length; j++) {
                if (currentX > 0 && currentX < this.width - 1 && currentY > 0 && currentY < this.height - 1) {
                    this.map[currentY][currentX] = 1;
                }

                switch (direction) {
                    case 0: // up
                        currentY--;
                        break;
                    case 1: // right
                        currentX++;
                        break;
                    case 2: // down
                        currentY++;
                        break;
                    case 3: // left
                        currentX--;
                        break;
                }
            }
        }

        return this.map;
    }

    getRandomOpenTile() {
        let x, y;
        do {
            x = Phaser.Math.Between(1, this.width - 2);
            y = Phaser.Math.Between(1, this.height - 2);
        } while (this.map[y][x] === 1);
        return { x: x, y: y };
    }
}

class Music {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlaying = false;
    }

    play() {
        if (this.isPlaying) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.isPlaying = true;
        this.playAmbiance();
    }

    stop() {
        this.isPlaying = false;
        // This needs to be implemented properly to stop the sounds
    }

    playAmbiance() {
        if (!this.isPlaying) return;

        // Low hum
        const hum = this.audioContext.createOscillator();
        hum.type = 'sine';
        hum.frequency.setValueAtTime(50, this.audioContext.currentTime);
        const humGain = this.audioContext.createGain();
        humGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        hum.connect(humGain);
        humGain.connect(this.audioContext.destination);
        hum.start();

        // Wind-like noise
        const noise = this.audioContext.createBufferSource();
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        noise.loop = true;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(100, this.audioContext.currentTime);

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        noise.start();
    }
}

class SFX {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playPlayerDamage() {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playEnemyDamage() {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playBossDamage() {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playGameOver() {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 1);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }
}

class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Dungeon Crawler', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        const highScore = localStorage.getItem('highScore') || 0;
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Your High Score: ' + highScore, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        const startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Start Game', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                if (!this.music) {
                    this.music = new Music();
                    this.music.play();
                }
                this.scene.start('GameScene');
            });
    }
}


class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }
    
    init(data) {
        this.score = data.score || 0;
    }

    preload() {
        // Player
        let playerGraphics = this.make.graphics();
        playerGraphics.fillStyle(0x0000ff);
        playerGraphics.fillCircle(16, 16, 16);
        playerGraphics.fillStyle(0xffff00);
        playerGraphics.fillCircle(16, 16, 8);
        playerGraphics.generateTexture('player', 32, 32);
        playerGraphics.destroy();

        // Enemy
        let enemyGraphics = this.make.graphics();
        enemyGraphics.fillStyle(0xff0000);
        enemyGraphics.fillTriangle(0, 32, 16, 0, 32, 32);
        enemyGraphics.generateTexture('enemy', 32, 32);
        enemyGraphics.destroy();

        // Boss
        let bossGraphics = this.make.graphics();
        bossGraphics.fillStyle(0xff00ff);
        bossGraphics.fillRect(0, 0, 64, 64);
        bossGraphics.fillStyle(0x000000);
        bossGraphics.fillRect(10, 10, 44, 44);
        bossGraphics.fillStyle(0xffff00);
        bossGraphics.fillRect(22, 22, 20, 20);
        bossGraphics.generateTexture('boss', 64, 64);
        bossGraphics.destroy();

        // Projectile
        let projectileGraphics = this.make.graphics();
        projectileGraphics.fillStyle(0x00ff00);
        projectileGraphics.fillCircle(4, 4, 4);
        projectileGraphics.generateTexture('projectile', 8, 8);
        projectileGraphics.destroy();

        // Wall
        let wallGraphics = this.make.graphics();
        wallGraphics.fillStyle(0x333333);
        wallGraphics.fillRect(0, 0, 32, 32);
        wallGraphics.lineStyle(2, 0x828282, 1);
        wallGraphics.strokeRect(0, 0, 32, 32);
        wallGraphics.generateTexture('wall', 32, 32);
        wallGraphics.destroy();
        
        // Floor
        let floorGraphics = this.make.graphics();
        floorGraphics.fillStyle(0x666666);
        floorGraphics.fillRect(0, 0, 32, 32);
        floorGraphics.generateTexture('floor', 32, 32);
        floorGraphics.destroy();

        // Portal
        let portalGraphics = this.make.graphics();
        portalGraphics.fillStyle(0x000000, 0);
        portalGraphics.fillCircle(64, 64, 64);
        portalGraphics.lineStyle(4, 0xff00ff, 1);
        portalGraphics.strokeCircle(64, 64, 62);
        portalGraphics.lineStyle(2, 0xffffff, 1);
        portalGraphics.strokeCircle(64, 64, 58);
        portalGraphics.generateTexture('portal', 128, 128);
        portalGraphics.destroy();
        
        // Potion
        let potionGraphics = this.make.graphics();
        potionGraphics.fillStyle(0x00ff00);
        potionGraphics.fillRect(10, 0, 12, 32);
        potionGraphics.fillRect(0, 10, 32, 12);
        potionGraphics.generateTexture('potion', 32, 32);
        potionGraphics.destroy();

        // Yellow glow particle
        let glowGraphics = this.make.graphics();
        glowGraphics.fillStyle(0xffff00, 0.5);
        glowGraphics.fillCircle(16, 16, 16);
        glowGraphics.generateTexture('yellow-glow', 32, 32);
        glowGraphics.destroy();
    }

    create() {
        this.sfx = new SFX();

        // Dungeon generation
        const dungeonWidth = 100;
        const dungeonHeight = 100;
        const tileSize = 32;
        this.dungeon = new Dungeon(dungeonWidth, dungeonHeight, tileSize);
        const dungeonMap = this.dungeon.generate();

        for (let y = 0; y < dungeonHeight; y++) {
            for (let x = 0; x < dungeonWidth; x++) {
                if (dungeonMap[y][x] === 0) {
                    this.add.image(x * tileSize, y * tileSize, 'floor').setOrigin(0);
                }
            }
        }

        this.walls = this.physics.add.staticGroup();
        for (let y = 0; y < dungeonHeight; y++) {
            for (let x = 0; x < dungeonWidth; x++) {
                if (dungeonMap[y][x] === 1) {
                    this.walls.create(x * tileSize, y * tileSize, 'wall').setOrigin(0);
                }
            }
        }

        const playerTile = this.dungeon.getRandomOpenTile();
        if (playerTile) {
            this.player = this.physics.add.sprite(playerTile.x * tileSize, playerTile.y * tileSize, 'player');
            this.player.body.setSize(24, 24);
            this.player.health = 100;
            this.player.maxHealth = 100;
            this.player.isInvulnerable = false;

            this.physics.world.setBounds(0, 0, dungeonWidth * tileSize, dungeonHeight * tileSize);
            this.player.setCollideWorldBounds(true);
            this.physics.add.collider(this.player, this.walls);

            this.cameras.main.startFollow(this.player);
            this.cameras.main.setBounds(0, 0, dungeonWidth * tileSize, dungeonHeight * tileSize);


            this.cursors = this.input.keyboard.createCursorKeys();

            this.joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
                x: 100,
                y: this.scale.height - 100,
                radius: 50,
                base: this.add.circle(0, 0, 50, 0x888888, 0.5),
                thumb: this.add.circle(0, 0, 25, 0xcccccc, 0.5),
            });

            this.joyStickState = this.joystick.createCursorKeys();

            // Action button
            this.actionButton = this.add.circle(this.scale.width - 100, this.scale.height - 100, 50, 0xcccccc, 0.5)
                .setScrollFactor(0)
                .setInteractive()
                .on('pointerdown', this.shoot, this);

            this.input.keyboard.on('keydown-SPACE', this.shoot, this);

            this.lastMoveDir = new Phaser.Math.Vector2(1, 0);


            // Projectiles
            this.projectiles = this.physics.add.group({
                defaultKey: 'projectile',
                maxSize: 50
            });
            this.physics.add.collider(this.projectiles, this.walls, (p) => p.setActive(false).setVisible(false));


            // Enemies
            this.enemies = this.physics.add.group();
            for (let i = 0; i < 10; i++) {
                const enemyTile = this.dungeon.getRandomOpenTile();
                if(enemyTile){
                    const enemy = this.enemies.create(enemyTile.x * tileSize, enemyTile.y * tileSize, 'enemy');
                    enemy.health = 10;
                    this.physics.add.collider(enemy, this.walls);
                    this.physics.add.collider(this.player, enemy, this.playerHit, null, this);
                }
            }
            
            // Boss
            const bossTile = this.dungeon.getRandomOpenTile();
            if(bossTile){
                this.boss = this.physics.add.sprite(bossTile.x * tileSize, bossTile.y * tileSize, 'boss');
                this.boss.health = 100;
                this.boss.maxHealth = 100;
                this.physics.add.collider(this.boss, this.walls);
                this.physics.add.collider(this.player, this.boss, this.playerHit, null, this);
                this.enemies.add(this.boss);
                
                this.boss.healthBar = this.add.graphics();
                this.updateBossHealthBar();
            }

            // Potions
            this.potions = this.physics.add.group();
            for (let i = 0; i < 3; i++) {
                const potionTile = this.dungeon.getRandomOpenTile();
                if(potionTile){
                    this.potions.create(potionTile.x * tileSize, potionTile.y * tileSize, 'potion');
                }
            }
            this.physics.add.overlap(this.player, this.potions, this.collectPotion, null, this);


            // Collision
            this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);

            // Score & Health UI
            this.scoreText = this.add.text(10, 10, 'Score: ' + this.score, { fontSize: '32px', fill: '#fff', backgroundColor: '#000000' }).setScrollFactor(0);
            this.healthBar = this.add.graphics().setScrollFactor(0);
            this.updateHealthBar();
            
            // Particles
            this.projectileParticles = this.add.particles('projectile');
            this.enemyDeathParticles = this.add.particles('enemy');
            this.portalParticles = this.add.particles('yellow-glow');

            this.portalEmitter = this.portalParticles.createEmitter({
                speed: 100,
                lifespan: 500,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD',
                on: false // Start turned off
            });
            
            this.scale.on('resize', this.resize, this);
            this.resize({width: this.scale.width, height: this.scale.height});

            this.enemiesActive = false;
            this.time.delayedCall(10000, () => { this.enemiesActive = true; });

        } else {
            // Handle case where no open tile was found
            this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Error: Could not find open tile.', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        }
    }
    
    resize(gameSize) {
        this.cameras.main.width = gameSize.width;
        this.cameras.main.height = gameSize.height;
        
        this.joystick.x = 100;
        this.joystick.y = gameSize.height - 100;
        
        this.actionButton.x = gameSize.width - 100;
        this.actionButton.y = gameSize.height - 100;
    }

    update() {
        if(!this.player) return;
        const speed = 200;

        this.player.setVelocity(0);

        let x = 0;
        let y = 0;

        // Joystick input
        if (this.joystick.force > 0) {
            // Use analog force for direction
            const forceVec = new Phaser.Math.Vector2(this.joystick.forceX, this.joystick.forceY).normalize();
            x = forceVec.x;
            y = forceVec.y;
        } 
        // Keyboard input (only if joystick is not used)
        else {
            if (this.cursors.left.isDown) {
                x = -1;
            } else if (this.cursors.right.isDown) {
                x = 1;
            }

            if (this.cursors.up.isDown) {
                y = -1;
            } else if (this.cursors.down.isDown) {
                y = 1;
            }
        }

        if (x !== 0 || y !== 0) {
            const vec = new Phaser.Math.Vector2(x, y).normalize().scale(speed);
            this.player.setVelocity(vec.x, vec.y);
            this.lastMoveDir.set(x, y).normalize();
        }

        this.projectiles.children.each(function(p) {
            if (p.active) {
                if(p.lifespan) p.lifespan -= this.time.delta;
                if (p.lifespan <= 0) {
                    p.setActive(false).setVisible(false);
                }
            }
            if (p.active && !Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, p.getBounds())) {
                p.setActive(false).setVisible(false);
            }
        }.bind(this));

        if (this.enemiesActive) {
            this.enemies.children.iterate((enemy) => {
                if (enemy.active) {
                    const ray = new Phaser.Geom.Line(enemy.x, enemy.y, this.player.x, this.player.y);
                    const tiles = this.walls.getChildren();
                    let seesPlayer = true;
                    for (const tile of tiles) {
                        if (Phaser.Geom.Intersects.LineToRectangle(ray, tile.getBounds())) {
                            seesPlayer = false;
                            break;
                        }
                    }

                    if (seesPlayer) {
                        if (enemy === this.boss) {
                            this.physics.moveToObject(enemy, this.player, 120);
                        } else {
                            this.physics.moveToObject(enemy, this.player, 150);
                        }
                    }
                }
            });
        }
        
        if (this.boss && this.boss.active) {
            this.updateBossHealthBar();
        }

        if (this.portal && this.portal.active) {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portal.x, this.portal.y);
            if (distance < 1000) {
                this.portalEmitter.on = true;
                this.portalEmitter.setPosition(this.player.x, this.player.y);
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.portal.x, this.portal.y);
                this.portalEmitter.setAngle(Phaser.Math.RadToDeg(angle));
            } else {
                this.portalEmitter.on = false;
            }
        }
    }

    shoot() {
        if(!this.player) return;
        let projectile = this.projectiles.get(this.player.x, this.player.y);
        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.lifespan = 1000;
            projectile.setScale(1);

            const angle = this.lastMoveDir.angle();
            this.physics.velocityFromRotation(angle, 600, projectile.body.velocity);
            
            this.tweens.add({
                targets: projectile,
                scaleX: 0,
                scaleY: 0,
                duration: 1000,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    if (projectile.active) {
                        projectile.setActive(false).setVisible(false);
                    }
                }
            });

            this.projectileParticles.createEmitter({
                speed: 100,
                angle: Phaser.Math.RadToDeg(angle),
                lifespan: 200,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD',
                follow: projectile
            });
        }
    }

    hitEnemy(projectile, enemy) {
        projectile.setActive(false).setVisible(false);
        
        if (enemy === this.boss) {
            this.sfx.playBossDamage();
            this.boss.health--;
            this.updateBossHealthBar();
            this.boss.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                this.boss.clearTint();
            });
            if (this.boss.health <= 0) {
                this.bossDefeated(this.boss);
            }
        } else {
            this.sfx.playEnemyDamage();
            enemy.health--;
            if (enemy.health <= 0) {
                enemy.setActive(false).setVisible(false);
                this.score += 10;
                this.scoreText.setText('Score: ' + this.score);
                this.enemyDeathParticles.createEmitter({
                    speed: 200,
                    lifespan: 300,
                    scale: { start: 1, end: 0 },
                    blendMode: 'ADD',
                    x: enemy.x,
                    y: enemy.y
                }).explode(20);
            }
        }
    }
    
    bossDefeated(boss) {
        if (this.portal && this.portal.active) return;

        boss.setActive(false).setVisible(false);
        this.boss.healthBar.clear();
        this.score += 100;
        this.scoreText.setText('Score: ' + this.score);

        const portalTile = this.dungeon.getRandomOpenTile();
        this.portal = this.physics.add.sprite(portalTile.x * 32, portalTile.y * 32, 'portal');
        this.portal.setBodySize(128, 128);
        this.physics.add.overlap(this.player, this.portal, this.enterPortal, null, this);
        
        this.tweens.add({
            targets: this.portal,
            angle: 360,
            duration: 2000,
            repeat: -1
        });

        const portalText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'The Portal is Open!', { fontSize: '48px', fill: '#ff00ff', stroke: '#ffffff', strokeThickness: 4 })
            .setOrigin(0.5)
            .setScrollFactor(0);

        this.tweens.add({
            targets: portalText,
            alpha: 0,
            duration: 3000,
            ease: 'Power2',
            onComplete: () => {
                portalText.destroy();
            }
        });
    }
    
    enterPortal() {
        this.scene.restart({ score: this.score });
    }

    playerHit(player, enemy) {
        if (player.isInvulnerable) return;

        this.sfx.playPlayerDamage();
        player.health -= 10;
        this.updateHealthBar();

        if (player.health <= 0) {
            this.sfx.playGameOver();
            this.physics.pause();
            player.setTint(0xff0000);
            
            this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'You Died', { fontSize: '64px', fill: '#ff0000', stroke: '#ffffff', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0);

            const restartButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Restart', { fontSize: '32px', fill: '#fff' })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setInteractive()
                .on('pointerdown', () => this.scene.start('GameScene', { score: 0 }));

            const homeButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Home', { fontSize: '32px', fill: '#fff' })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setInteractive()
                .on('pointerdown', () => this.scene.start('StartScene'));

            return;
        }

        player.isInvulnerable = true;
        this.tweens.add({
            targets: player,
            alpha: 0.5,
            duration: 100,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                player.isInvulnerable = false;
                player.alpha = 1;
            }
        });

        // Bounce enemy back
        const bounceAngle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
        this.physics.velocityFromRotation(bounceAngle, 150, enemy.body.velocity);
        this.time.delayedCall(200, () => {
            if (enemy.active) {
                enemy.body.velocity.x = 0;
                enemy.body.velocity.y = 0;
            }
        });
    }
    
    collectPotion(player, potion) {
        potion.destroy();
        player.health = Math.min(player.health + 25, player.maxHealth);
        this.updateHealthBar();
    }
    
    updateHealthBar() {
        if(!this.healthBar) return;
        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(9, 49, 202, 22);
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(10, 50, 200, 20);
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(10, 50, 200 * (this.player.health / this.player.maxHealth), 20);
    }

    updateBossHealthBar() {
        if (!this.boss || !this.boss.active) {
            if(this.boss && this.boss.healthBar) this.boss.healthBar.clear();
            return;
        };
        this.boss.healthBar.clear();
        const x = this.boss.x - 32;
        const y = this.boss.y - 50;
        this.boss.healthBar.fillStyle(0x000000);
        this.boss.healthBar.fillRect(x, y, 64, 10);
        this.boss.healthBar.fillStyle(0xff0000);
        this.boss.healthBar.fillRect(x, y, 64 * (this.boss.health / this.boss.maxHealth), 10);
    }
}



const config = {
    type: Phaser.CANVAS,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [StartScene, GameScene],
    plugins: {
        global: [{
            key: 'rexvirtualjoystickplugin',
            plugin: rexvirtualjoystickplugin,
            start: true
        }]
    }
};

const game = new Phaser.Game(config);
