// src/components/rpg/RPGWorld.js
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Phaser from 'phaser';
import './RPGWorld.css';

const TS = 16;
const COLS = 32;
const ROWS = 22;

const T = { GRASS: 0, PATH: 1, WATER: 2, TREE: 3, TALL: 4 };
const SOLID = new Set([T.WATER, T.TREE]);
const ENCOUNTER_TILES = new Set([T.TALL]);

const MAP = [
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,3],
  [3,0,0,3,3,3,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,4,0,0,0,0,0,3],
  [3,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,4,0,0,0,0,0,3],
  [3,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,2,2,2,2,2,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,2,2,2,2,2,0,0,0,0,0,3],
  [3,0,0,0,0,4,4,4,4,0,0,0,0,0,0,0,1,0,0,0,2,2,2,2,2,2,0,0,0,0,0,3],
  [3,0,0,0,0,4,4,4,4,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4,4,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,4,4,0,0,0,0,3],
  [3,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],
  [3,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0,1,0,0,4,4,4,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,4,4,4,0,0,0,0,3],
  [3,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],
  [3,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
];

const WILD_POKEMON = [
  { id: 16, name: 'Pidgey' },   { id: 19, name: 'Rattata' },
  { id: 10, name: 'Caterpie' }, { id: 13, name: 'Weedle' },
  { id: 52, name: 'Meowth' },   { id: 46, name: 'Paras' },
  { id: 35, name: 'Clefairy' }, { id: 39, name: 'Jigglypuff' },
];

const CHARS = {
  red:     { label: 'ROJO',    shirt: '#CC2222', pants: '#1A237E', cap: '#AA1111', capBrim: '#881111', hair: '#222',    skin: '#FFCC80', scarf: null },
  leaf:    { label: 'LEAF',    shirt: '#FFFFFF', pants: '#2E7D32', cap: '#FFFFFF', capBrim: '#E0E0E0', hair: '#8B4513', skin: '#FFCC80', scarf: '#4CAF50' },
  brendan: { label: 'BRENDAN', shirt: '#FFFFFF', pants: '#C62828', cap: '#FFFFFF', capBrim: '#E0E0E0', hair: '#111',    skin: '#FFCC80', scarf: null },
  may:     { label: 'MAY',     shirt: '#F44336', pants: '#1565C0', cap: null,      capBrim: null,      hair: '#8B4513', skin: '#FFCC80', scarf: null },
  ethan:   { label: 'ETHAN',   shirt: '#E65100', pants: '#37474F', cap: '#BF360C', capBrim: '#8D2A0A', hair: '#222',    skin: '#FFCC80', scarf: null },
};

const TILE_KEYS = ['grass', 'path', 'water', 'tree', 'tall'];

function buildTextures(scene, c) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const H = (str) => parseInt(str.replace('#', ''), 16);

    // GRASS
    g.fillStyle(0x78C850); g.fillRect(0, 0, TS, TS);
    g.fillStyle(0x60A038); for (let i = 2; i < TS; i += 2) g.fillRect(0, i, TS, 1);
    g.fillStyle(0x90D860); g.fillRect(1,1,2,1); g.fillRect(1,1,1,2); g.fillRect(TS-3,TS-2,2,1);
    g.generateTexture('grass', TS, TS); g.clear();

    // PATH
    g.fillStyle(0xD8B870); g.fillRect(0, 0, TS, TS);
    g.fillStyle(0xE8C880); g.fillRect(1,1,TS-2,TS-2);
    g.fillStyle(0xB09048);
    [[2,3],[7,6],[11,3],[4,10],[13,8]].forEach(([x,y]) => g.fillRect(x,y,1,1));
    g.generateTexture('path', TS, TS); g.clear();

    // WATER
    g.fillStyle(0x2060C0); g.fillRect(0, 0, TS, TS);
    g.fillStyle(0x3878D8); g.fillRect(1,1,TS-2,TS-2);
    g.fillStyle(0x60A8F8);
    g.fillRect(1,3,TS-2,1); g.fillRect(1,8,TS-2,1); g.fillRect(1,12,TS-2,1);
    g.fillStyle(0xFFFFFF); g.fillRect(3,4,2,1); g.fillRect(10,10,1,1);
    g.generateTexture('water', TS, TS); g.clear();

    // TREE
    g.fillStyle(0x78C850); g.fillRect(0, 0, TS, TS);
    g.fillStyle(0x7A4A28); g.fillRect(6,11,4,5);
    g.fillStyle(0x5A3018); g.fillRect(6,11,1,5);
    g.fillStyle(0x187010); g.fillCircle(8,7,7);
    g.fillStyle(0x2A9E20); g.fillCircle(8,6,6);
    g.fillStyle(0x42C032); g.fillCircle(6,5,4);
    g.fillStyle(0x68E054); g.fillRect(5,2,4,2);
    g.generateTexture('tree', TS, TS); g.clear();

    // TALL GRASS
    g.fillStyle(0x3E8820); g.fillRect(0, 0, TS, TS);
    g.fillStyle(0x2E7018); g.fillRect(0,9,TS,7);
    const blade = (bx, ty, h) => {
        g.fillStyle(0x388018); g.fillRect(bx,ty,1,h);
        g.fillStyle(0x58B030); g.fillRect(bx+1,ty,2,h);
        g.fillStyle(0x4EAC28); g.fillRect(bx-1,ty,1,Math.floor(h*0.5));
        g.fillStyle(0x88E050); g.fillRect(bx,ty,3,1);
    };
    blade(3,1,9); blade(8,2,8); blade(12,1,9);
    g.generateTexture('tall', TS, TS); g.clear();

    // PLAYER (16x16)
    g.fillStyle(0x222222); g.fillRect(2,14,5,2); g.fillRect(9,14,5,2);       // shoes
    g.fillStyle(H(c.pants)); g.fillRect(3,10,4,5); g.fillRect(9,10,4,5);      // pants
    g.fillStyle(H(c.shirt));
    g.fillRect(3,6,10,5); g.fillRect(1,7,3,3); g.fillRect(12,7,3,3);          // torso+arms
    if (c.scarf) { g.fillStyle(H(c.scarf)); g.fillRect(3,5,10,2); }           // scarf
    g.fillStyle(H(c.skin)); g.fillRect(0,9,2,2); g.fillRect(14,9,2,2);        // hands
    g.fillStyle(H(c.skin)); g.fillCircle(8,4,4);                               // head
    g.fillStyle(H(c.hair));
    if (c.cap) { g.fillRect(3,3,2,1); g.fillRect(11,3,2,1); }                 // hair sides
    else { g.fillRect(5,0,6,3); }                                              // full hair (may)
    if (c.cap) {
        g.fillStyle(H(c.cap)); g.fillRect(4,0,8,4);                           // cap
        g.fillStyle(H(c.capBrim || c.cap)); g.fillRect(2,3,5,1);              // brim
    } else {
        g.fillStyle(H(c.shirt)); g.fillRect(4,2,8,2);                         // bandana
    }
    g.fillStyle(0x222222); g.fillRect(6,4,1,1); g.fillRect(10,4,1,1);         // eyes
    g.generateTexture('player', TS, TS);
    g.destroy();
}

// Canvas-based preview for character selection screen
function drawCharPreview(ctx, c) {
    ctx.clearRect(0, 0, 64, 64);
    ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(32, 58, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#222'; ctx.fillRect(14,52,12,6); ctx.fillRect(34,52,12,6);
    ctx.fillStyle = c.pants; ctx.fillRect(14,36,11,17); ctx.fillRect(33,36,11,17);
    ctx.fillStyle = c.shirt;
    ctx.fillRect(13,22,28,15); ctx.fillRect(5,23,9,12); ctx.fillRect(50,23,9,12);
    if (c.scarf) { ctx.fillStyle = c.scarf; ctx.fillRect(13,20,28,4); }
    ctx.fillStyle = c.skin;
    ctx.beginPath(); ctx.arc(8,33,5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(56,33,5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(32,13,11,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = c.hair;
    if (c.cap) { ctx.fillRect(14,12,6,5); ctx.fillRect(44,12,6,5); }
    else { ctx.fillRect(22,2,20,8); }
    if (c.cap) {
        ctx.fillStyle = c.cap; ctx.fillRect(18,3,28,10);
        ctx.fillStyle = c.capBrim || c.cap; ctx.fillRect(10,11,14,4);
    } else {
        ctx.fillStyle = c.shirt; ctx.fillRect(20,6,24,7);
    }
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(26,14,2.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(38,14,2.5,0,Math.PI*2); ctx.fill();
}

const CharPreview = React.memo(({ charKey }) => {
    const cvs = useRef(null);
    useEffect(() => {
        if (!cvs.current) return;
        drawCharPreview(cvs.current.getContext('2d'), CHARS[charKey]);
    }, [charKey]);
    return <canvas ref={cvs} width={64} height={64} />;
});

export default function RPGWorld() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const gameRef = useRef(null);
    const touchDirRef = useRef(null);
    const [charColor, setCharColor] = useState(null);
    const [encounter, setEncounter] = useState(null);

    useEffect(() => {
        if (!charColor || !containerRef.current) return;

        const charConfig = CHARS[charColor];
        const onEncounter = setEncounter;
        const getTD = () => touchDirRef.current;

        class GameScene extends Phaser.Scene {
            constructor() { super('GameScene'); }

            preload() {
                buildTextures(this, charConfig);
            }

            create() {
                for (let ty = 0; ty < ROWS; ty++)
                    for (let tx = 0; tx < COLS; tx++)
                        this.add.image(tx * TS + TS / 2, ty * TS + TS / 2, TILE_KEYS[MAP[ty][tx]] ?? 'grass');

                this.pt = { x: 16, y: 10 };
                this.pl = this.add.image(
                    this.pt.x * TS + TS / 2,
                    this.pt.y * TS + TS / 2,
                    'player'
                ).setDepth(10);

                this.cameras.main.startFollow(this.pl, true, 0.08, 0.08);
                this.cameras.main.setZoom(2);
                this.cameras.main.setBounds(0, 0, COLS * TS, ROWS * TS);

                this.cursors = this.input.keyboard.createCursorKeys();
                this.wasd = this.input.keyboard.addKeys('W,A,S,D');
                this.busy = false;
            }

            update() {
                if (this.busy) return;
                const k = this.cursors, w = this.wasd, td = getTD();
                let dx = 0, dy = 0;
                if      (k.left.isDown  || w.A.isDown || td === 'left')  { dx = -1; this.pl.setFlipX(false); }
                else if (k.right.isDown || w.D.isDown || td === 'right') { dx =  1; this.pl.setFlipX(true); }
                else if (k.up.isDown    || w.W.isDown || td === 'up')    { dy = -1; }
                else if (k.down.isDown  || w.S.isDown || td === 'down')  { dy =  1; }
                else return;

                const nx = this.pt.x + dx, ny = this.pt.y + dy;
                if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;
                if (SOLID.has(MAP[ny]?.[nx] ?? 0)) return;

                this.pt.x = nx; this.pt.y = ny; this.busy = true;
                this.tweens.add({
                    targets: this.pl,
                    x: nx * TS + TS / 2, y: ny * TS + TS / 2,
                    duration: 150, ease: 'Linear',
                    onComplete: () => {
                        this.busy = false;
                        if (ENCOUNTER_TILES.has(MAP[ny]?.[nx] ?? 0) && Math.random() < 0.18) {
                            const poke = WILD_POKEMON[Math.floor(Math.random() * WILD_POKEMON.length)];
                            this.busy = true;
                            onEncounter(poke);
                        }
                    },
                });
            }
        }

        const game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: containerRef.current,
            backgroundColor: '#78C850',
            pixelArt: true,
            scene: GameScene,
            scale: { mode: Phaser.Scale.RESIZE },
        });

        gameRef.current = game;
        return () => { game.destroy(true); gameRef.current = null; };
    }, [charColor]);

    const dismissEncounter = () => {
        setEncounter(null);
        const scene = gameRef.current?.scene?.getScene('GameScene');
        if (scene) scene.busy = false;
    };

    if (!charColor) {
        return (
            <div className="rpg-select-screen">
                <div className="rpg-select-box">
                    <h2 className="rpg-select-title">ELIGE TU PERSONAJE</h2>
                    <div className="rpg-char-options">
                        {Object.keys(CHARS).map(key => (
                            <button key={key} className="rpg-char-btn" onClick={() => setCharColor(key)}>
                                <CharPreview charKey={key} />
                                <span className="rpg-char-label" style={{ color: CHARS[key].cap || CHARS[key].shirt }}>
                                    {CHARS[key].label}
                                </span>
                            </button>
                        ))}
                    </div>
                    <button className="rpg-back-btn" onClick={() => navigate('/')}>← Volver al inicio</button>
                </div>
            </div>
        );
    }

    return (
        <div className="rpg-wrapper">
            <div className="rpg-hud">
                <span className="rpg-hud-title">🌿 MUNDO RPG — Ruta 1</span>
                <button className="rpg-menu-btn" onClick={() => navigate('/')}>← Menú</button>
            </div>

            <div className="rpg-canvas-container" ref={containerRef}>
                <div className="rpg-dpad">
                    {[['up','▲'],['down','▼'],['left','◀'],['right','▶']].map(([dir, icon]) => (
                        <button key={dir} className={`rpg-dpad-btn ${dir}`}
                            onPointerDown={() => { touchDirRef.current = dir; }}
                            onPointerUp={() => { touchDirRef.current = null; }}
                            onPointerLeave={() => { touchDirRef.current = null; }}
                        >{icon}</button>
                    ))}
                </div>
                <div className="rpg-legend">
                    <span>🟩 Hierba alta = encuentros</span>
                    <span>⌨️ WASD / flechas</span>
                </div>
            </div>

            {encounter && (
                <div className="rpg-encounter-overlay" onClick={e => e.stopPropagation()}>
                    <div className="rpg-encounter-box">
                        <p className="rpg-encounter-excl">¡Un Pokémon salvaje apareció!</p>
                        <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${encounter.id}.png`}
                            alt={encounter.name}
                            className="rpg-encounter-sprite"
                        />
                        <p className="rpg-encounter-name">¡{encounter.name.toUpperCase()}!</p>
                        <div className="rpg-encounter-actions">
                            <button className="rpg-btn-run" onClick={dismissEncounter}>HUIR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
