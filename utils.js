import { SPRITE_ASSETS, AUDIO_ASSETS } from './constants.js';

export function preloadAssets(scene) {
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

export function ensureRadialLightTexture(scene, key, size, stops) {
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

export function ensureLightTextures(scene) {
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
    if (!scene.textures.exists('portalSpiral')) {
        const size = 256;
        const tex = scene.textures.createCanvas('portalSpiral', size, size);
        const ctx = tex.getContext();
        const c = size / 2;
        ctx.clearRect(0, 0, size, size);

        const halo = ctx.createRadialGradient(c, c, size * 0.06, c, c, size * 0.48);
        halo.addColorStop(0, 'rgba(255,248,208,0.78)');
        halo.addColorStop(0.35, 'rgba(179,244,255,0.48)');
        halo.addColorStop(1, 'rgba(82,120,148,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(c, c, size * 0.48, 0, Math.PI * 2);
        ctx.fill();

        const spiral = (lineWidth, alpha, hueShift = 0) => {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = `hsla(${190 + hueShift}, 95%, 80%, ${alpha})`;
            ctx.shadowBlur = 14;
            ctx.shadowColor = `hsla(${190 + hueShift}, 95%, 72%, ${Math.min(1, alpha + 0.14)})`;
            ctx.beginPath();
            const maxT = 7.2 * Math.PI;
            for (let t = 0; t <= maxT; t += 0.035) {
                const radius = (size * 0.035) + (t / maxT) * (size * 0.35);
                const x = c + Math.cos(t) * radius;
                const y = c + Math.sin(t) * radius;
                if (t === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        };

        spiral(10, 0.24, -16);
        spiral(6, 0.44, 10);
        spiral(3, 0.7, 28);
        tex.refresh();
    }
}

export function ensureUiTextures(scene) {
    if (scene.textures.exists('uiPanel')) return;

    // Terraria-style Wood Panel
    const panelSize = 128;
    const panel = scene.textures.createCanvas('uiPanel', panelSize, panelSize);
    const ctx = panel.getContext();
    
    // Wood texture background
    ctx.fillStyle = '#5d4037'; // Dark wood
    ctx.fillRect(0, 0, panelSize, panelSize);
    
    // Wood grain
    ctx.fillStyle = '#4e342e';
    for (let i = 0; i < panelSize; i += 8) {
        ctx.fillRect(0, i, panelSize, 2);
    }
    
    // Border
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, panelSize - 6, panelSize - 6);
    
    // Inner bevel
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, panelSize - 16, panelSize - 16);
    panel.refresh();

    // Terraria-style Inventory Slot
    const slotSize = 64;
    const slot = scene.textures.createCanvas('uiSlot', slotSize, slotSize);
    const sCtx = slot.getContext();
    sCtx.fillStyle = 'rgba(63, 81, 181, 0.7)'; // Blueish semi-transparent
    sCtx.fillRect(0, 0, slotSize, slotSize);
    sCtx.strokeStyle = '#9fa8da';
    sCtx.lineWidth = 4;
    sCtx.strokeRect(2, 2, slotSize - 4, slotSize - 4);
    slot.refresh();

    // Life Ember (Health) - Unique to Ember & Blade
    const emberSize = 32;
    const ember = scene.textures.createCanvas('lifeEmber', emberSize, emberSize);
    const hCtx = ember.getContext();
    const ec = emberSize / 2;
    
    // Outer glow
    const eGrad = hCtx.createRadialGradient(ec, ec, 2, ec, ec, 14);
    eGrad.addColorStop(0, '#ff5252');
    eGrad.addColorStop(0.6, '#b71c1c');
    eGrad.addColorStop(1, 'rgba(0,0,0,0)');
    hCtx.fillStyle = eGrad;
    hCtx.beginPath();
    hCtx.arc(ec, ec, 14, 0, Math.PI * 2);
    hCtx.fill();
    
    // Core
    hCtx.fillStyle = '#ff8a80';
    hCtx.beginPath();
    hCtx.moveTo(ec, ec - 8);
    hCtx.lineTo(ec + 6, ec);
    hCtx.lineTo(ec, ec + 10);
    hCtx.lineTo(ec - 6, ec);
    hCtx.closePath();
    hCtx.fill();
    ember.refresh();

    // Energy Shard (Lantern Fuel) - Unique to Ember & Blade
    const shardSize = 32;
    const shard = scene.textures.createCanvas('energyShard', shardSize, shardSize);
    const stCtx = shard.getContext();
    const sc = shardSize / 2;
    
    // Glow
    const sGrad = stCtx.createRadialGradient(sc, sc, 2, sc, sc, 14);
    sGrad.addColorStop(0, '#ffd740');
    sGrad.addColorStop(0.6, '#ff8f00');
    sGrad.addColorStop(1, 'rgba(0,0,0,0)');
    stCtx.fillStyle = sGrad;
    stCtx.beginPath();
    stCtx.arc(sc, sc, 14, 0, Math.PI * 2);
    stCtx.fill();
    
    // Shard shape
    stCtx.fillStyle = '#ffff8d';
    stCtx.beginPath();
    stCtx.moveTo(sc, sc - 10);
    stCtx.lineTo(sc + 4, sc - 4);
    stCtx.lineTo(sc + 4, sc + 4);
    stCtx.lineTo(sc, sc + 10);
    stCtx.lineTo(sc - 4, sc + 4);
    stCtx.lineTo(sc - 4, sc - 4);
    stCtx.closePath();
    stCtx.fill();
    shard.refresh();

    // Stylized Button (Normal)
    const btnWidth = 200;
    const btnHeight = 60;
    const btn = scene.textures.createCanvas('uiButton', btnWidth, btnHeight);
    const bCtx = btn.getContext();
    bCtx.fillStyle = '#3e2723';
    bCtx.strokeStyle = '#ffca28';
    bCtx.lineWidth = 3;
    bCtx.fillRect(0, 0, btnWidth, btnHeight);
    bCtx.strokeRect(1.5, 1.5, btnWidth - 3, btnHeight - 3);
    btn.refresh();
}
