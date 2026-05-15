import { StartScene, GameScene, WinScene } from './Scenes.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-root',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        expandParent: true
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
            plugin: window.rexvirtualjoystickplugin,
            start: true
        }]
    }
};

const game = new Phaser.Game(config);

game.events.once('ready', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
});

