// src/components/rpg/RPGWorld.js
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Phaser from 'phaser';
import './RPGWorld.css';

const TS = 16;
const COLS = 24;
const ROWS = 20;

const T = { GRASS: 0, PATH: 1, WATER: 2, TREE: 3, TALL: 4, FLOWER: 5, SIGN: 6, HOUSE: 7 };
const SOLID = new Set([T.WATER, T.TREE, T.SIGN, T.HOUSE]);
const ENCOUNTER_TILES = new Set([T.TALL]);
const TILE_KEYS = ['grass', 'path', 'water', 'tree', 'tall', 'flower', 'sign', 'house'];

// Ruta Verde — 1=árbol, 0=libre, 2=hierba alta (encuentros)
const MAP = [
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
];

const WILD_POKEMON = [
  { id: 16, name: 'Pidgey' },   { id: 19, name: 'Rattata' },
  { id: 10, name: 'Caterpie' }, { id: 13, name: 'Weedle' },
  { id: 52, name: 'Meowth' },   { id: 46, name: 'Paras' },
  { id: 35, name: 'Clefairy' }, { id: 39, name: 'Jigglypuff' },
];

const CHARS = {
  red:     { label: 'ROJO',    shirt: '#CC2222', pants: '#1A237E', cap: '#AA1111', capBrim: '#881111', hair: '#222222', skin: '#FFCC80', scarf: null },
  leaf:    { label: 'LEAF',    shirt: '#FFFFFF', pants: '#2E7D32', cap: '#FFFFFF', capBrim: '#E0E0E0', hair: '#8B4513', skin: '#FFCC80', scarf: '#4CAF50' },
  brendan: { label: 'BRENDAN', shirt: '#FFFFFF', pants: '#C62828', cap: '#FFFFFF', capBrim: '#E0E0E0', hair: '#111111', skin: '#FFCC80', scarf: null },
  may:     { label: 'MAY',     shirt: '#F44336', pants: '#1565C0', cap: null,      capBrim: null,      hair: '#8B4513', skin: '#FFCC80', scarf: null },
  ethan:   { label: 'ETHAN',   shirt: '#E65100', pants: '#37474F', cap: '#BF360C', capBrim: '#8D2A0A', hair: '#222222', skin: '#FFCC80', scarf: null },
};

function buildTextures(scene, c) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const H = s => parseInt(s.replace('#', ''), 16);

  // GRASS
  g.fillStyle(0x68B848); g.fillRect(0, 0, TS, TS);
  g.fillStyle(0x50A030); [1,5,9,13].forEach(y => g.fillRect(0, y, TS, 1));
  g.fillStyle(0x90D860);
  [[2,0],[6,3],[11,1],[14,4],[4,8],[9,6],[1,11],[13,9]].forEach(([x,y]) => g.fillRect(x,y,1,1));
  g.generateTexture('grass', TS, TS); g.clear();

  // PATH
  g.fillStyle(0xB89850); g.fillRect(0,0,TS,TS);
  g.fillStyle(0xCCAC60); g.fillRect(1,1,TS-2,TS-2);
  g.fillStyle(0xD8BC74); g.fillRect(2,2,TS-4,TS-4);
  g.fillStyle(0x907038);
  [[3,4],[8,11],[13,6],[5,13],[11,3],[7,9]].forEach(([x,y]) => g.fillRect(x,y,1,1));
  g.generateTexture('path', TS, TS); g.clear();

  // WATER
  g.fillStyle(0x2858C0); g.fillRect(0,0,TS,TS);
  g.fillStyle(0x4070D8); g.fillRect(0,2,TS,4); g.fillRect(0,10,TS,4);
  g.fillStyle(0x6898F0); g.fillRect(0,4,TS,1); g.fillRect(0,12,TS,1);
  g.fillStyle(0xC0D8FF); [[4,3],[10,11],[14,3],[2,11]].forEach(([x,y]) => g.fillRect(x,y,1,1));
  g.fillStyle(0xFFFFFF); [[6,2],[12,10]].forEach(([x,y]) => g.fillRect(x,y,1,1));
  g.generateTexture('water', TS, TS); g.clear();

  // TREE
  g.fillStyle(0x68B848); g.fillRect(0,0,TS,TS);
  g.fillStyle(0x7A4828); g.fillRect(6,9,4,7);
  g.fillStyle(0x5A3818); g.fillRect(6,9,1,7);
  g.fillStyle(0x0A5010); g.fillCircle(8,6,7);
  g.fillStyle(0x207020); g.fillCircle(8,6,6);
  g.fillStyle(0x30A030); g.fillCircle(6,4,4);
  g.fillStyle(0x50C050); g.fillRect(5,1,4,2);
  g.fillStyle(0x002800); g.fillRect(1,9,14,1);
  g.generateTexture('tree', TS, TS); g.clear();

  // TALL GRASS
  g.fillStyle(0x409028); g.fillRect(0,0,TS,TS);
  g.fillStyle(0x306018); g.fillRect(0,10,TS,6);
  const blade = (bx, ty, h) => {
    g.fillStyle(0x285814); g.fillRect(bx,ty,1,h);
    g.fillStyle(0x4A9030); g.fillRect(bx+1,ty,2,h);
    g.fillStyle(0x72C840); g.fillRect(bx,ty,3,2);
    g.fillStyle(0x98E060); g.fillRect(bx+1,ty,1,1);
  };
  blade(2,0,10); blade(7,1,9); blade(12,0,10);
  g.generateTexture('tall', TS, TS); g.clear();

  // FLOWER
  g.fillStyle(0x68B848); g.fillRect(0,0,TS,TS);
  g.fillStyle(0x50A030); [1,5,9,13].forEach(y => g.fillRect(0,y,TS,1));
  g.fillStyle(0x287800); g.fillRect(7,9,2,5);
  g.fillStyle(0xFF5858); [[5,5],[9,5],[7,3],[7,7]].forEach(([x,y]) => g.fillRect(x,y,2,2));
  g.fillStyle(0xFFE040); g.fillRect(7,5,2,2);
  g.generateTexture('flower', TS, TS); g.clear();

  // SIGN
  g.fillStyle(0x68B848); g.fillRect(0,0,TS,TS);
  g.fillStyle(0x50A030); [1,5,9,13].forEach(y => g.fillRect(0,y,TS,1));
  g.fillStyle(0x8B5E3C); g.fillRect(7,8,2,8);
  g.fillStyle(0xE8D088); g.fillRect(2,1,12,8);
  g.fillStyle(0xC0A850); g.fillRect(2,1,12,1); g.fillRect(2,1,1,8); g.fillRect(13,1,1,8);
  g.fillStyle(0x282808); g.fillRect(4,3,8,1); g.fillRect(4,5,6,1); g.fillRect(4,7,7,1);
  g.generateTexture('sign', TS, TS); g.clear();

  // HOUSE
  g.fillStyle(0xE8D4B8); g.fillRect(0,0,TS,TS);
  g.fillStyle(0xB06040); g.fillRect(0,0,TS,5);
  g.fillStyle(0x803820); g.fillRect(0,4,TS,1);
  g.fillStyle(0xC07448); g.fillRect(2,0,TS-4,4);
  g.fillStyle(0x90C8F0); g.fillRect(4,6,5,5);
  g.fillStyle(0x5898C8); g.fillRect(4,6,5,1); g.fillRect(4,6,1,5);
  g.fillStyle(0xFFFFFF); g.fillRect(5,7,1,2);
  g.fillStyle(0xC0A880); g.fillRect(7,11,3,5);
  g.generateTexture('house', TS, TS); g.clear();

  // PLAYER SPRITES — 6 variants: down/up/side × idle/walk
  const skin = H(c.skin), shirt = H(c.shirt), pant = H(c.pants), hairC = H(c.hair);
  const capC = c.cap ? H(c.cap) : null, brimC = c.capBrim ? H(c.capBrim) : capC;
  const scarfC = c.scarf ? H(c.scarf) : null;
  const SHOE = 0x181818, EYE = 0x111111;

  function drawDown(key, walk) {
    g.fillStyle(SHOE);
    if (walk) { g.fillRect(3,13,3,2); g.fillRect(10,14,3,2); }
    else       { g.fillRect(4,14,3,2); g.fillRect(9,14,3,2); }
    g.fillStyle(pant);
    if (walk) { g.fillRect(3,9,3,4); g.fillRect(9,9,3,5); }
    else       { g.fillRect(4,9,3,5); g.fillRect(9,9,3,5); }
    g.fillStyle(shirt); g.fillRect(4,5,8,4); g.fillRect(2,6,2,3); g.fillRect(12,6,2,3);
    if (scarfC) { g.fillStyle(scarfC); g.fillRect(4,4,8,2); }
    g.fillStyle(skin); g.fillRect(1,8,2,2); g.fillRect(13,8,2,2); g.fillCircle(8,4,4);
    if (capC) {
      g.fillStyle(capC); g.fillRect(4,0,8,4);
      g.fillStyle(brimC); g.fillRect(2,3,5,1);
      g.fillStyle(hairC); g.fillRect(3,3,2,1); g.fillRect(11,3,2,1);
    } else { g.fillStyle(hairC); g.fillRect(5,0,6,3); }
    g.fillStyle(EYE); g.fillRect(6,4,1,1); g.fillRect(9,4,1,1);
    g.generateTexture(key, TS, TS); g.clear();
  }

  function drawUp(key, walk) {
    g.fillStyle(SHOE);
    if (walk) { g.fillRect(3,13,3,2); g.fillRect(10,14,3,2); }
    else       { g.fillRect(4,14,3,2); g.fillRect(9,14,3,2); }
    g.fillStyle(pant);
    if (walk) { g.fillRect(3,9,3,4); g.fillRect(9,9,3,5); }
    else       { g.fillRect(4,9,3,5); g.fillRect(9,9,3,5); }
    g.fillStyle(shirt); g.fillRect(4,5,8,4); g.fillRect(2,6,2,3); g.fillRect(12,6,2,3);
    if (scarfC) { g.fillStyle(scarfC); g.fillRect(4,4,8,2); }
    g.fillStyle(skin); g.fillRect(1,8,2,2); g.fillRect(13,8,2,2); g.fillCircle(8,4,4);
    if (capC) { g.fillStyle(capC); g.fillRect(4,0,8,6); }
    else { g.fillStyle(hairC); g.fillRect(4,0,8,5); }
    g.generateTexture(key, TS, TS); g.clear();
  }

  function drawSide(key, walk) {
    g.fillStyle(SHOE);
    if (walk) { g.fillRect(4,13,5,2); g.fillRect(8,14,4,2); }
    else       { g.fillRect(5,14,6,2); }
    g.fillStyle(pant);
    if (walk) { g.fillRect(4,9,5,4); g.fillRect(8,10,4,4); }
    else       { g.fillRect(5,9,6,5); }
    g.fillStyle(shirt); g.fillRect(5,5,6,4); g.fillRect(12,7,2,3);
    if (scarfC) { g.fillStyle(scarfC); g.fillRect(5,4,6,2); }
    g.fillStyle(skin); g.fillRect(12,9,2,2); g.fillCircle(8,4,4);
    if (capC) {
      g.fillStyle(capC); g.fillRect(4,0,8,4);
      g.fillStyle(brimC); g.fillRect(2,3,5,1);
    } else { g.fillStyle(hairC); g.fillRect(5,0,6,3); }
    g.fillStyle(EYE); g.fillRect(11,4,1,1);
    g.generateTexture(key, TS, TS); g.clear();
  }

  drawDown('pl_d0', false); drawDown('pl_d1', true);
  drawUp('pl_u0', false);   drawUp('pl_u1', true);
  drawSide('pl_s0', false); drawSide('pl_s1', true);
  g.destroy();
}

// Canvas-based character preview (64×64)
function drawCharPreview(ctx, c) {
  ctx.clearRect(0, 0, 64, 64);
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(32, 60, 14, 4, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#181818'; ctx.fillRect(14,52,12,6); ctx.fillRect(36,52,12,6);
  ctx.fillStyle = c.pants; ctx.fillRect(16,34,11,19); ctx.fillRect(37,34,11,19);
  ctx.fillStyle = c.shirt; ctx.fillRect(13,21,28,14); ctx.fillRect(5,22,9,11); ctx.fillRect(50,22,9,11);
  if (c.scarf) { ctx.fillStyle = c.scarf; ctx.fillRect(13,19,28,4); }
  ctx.fillStyle = c.skin;
  ctx.beginPath(); ctx.arc(8,31,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(56,31,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(32,12,11,0,Math.PI*2); ctx.fill();
  if (c.cap) {
    ctx.fillStyle = c.cap; ctx.fillRect(18,3,28,10);
    ctx.fillStyle = c.capBrim || c.cap; ctx.fillRect(10,11,14,4);
    ctx.fillStyle = c.hair; ctx.fillRect(14,11,5,4); ctx.fillRect(43,11,5,4);
  } else { ctx.fillStyle = c.hair; ctx.fillRect(22,2,20,8); }
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(26,13,2.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(38,13,2.5,0,Math.PI*2); ctx.fill();
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
  const [zone, setZone] = useState(null);
  const zoneRef = useRef(null);

  useEffect(() => {
    if (!charColor || !containerRef.current) return;

    const charConfig = CHARS[charColor];
    const onEncounter = setEncounter;
    const getTD = () => touchDirRef.current;
    const onZoneChange = (newZone) => {
      if (newZone !== zoneRef.current) {
        zoneRef.current = newZone;
        setZone(newZone);
        setTimeout(() => setZone(null), 3000);
      }
    };

    class GameScene extends Phaser.Scene {
      constructor() { super('GameScene'); }

      preload() { buildTextures(this, charConfig); }

      create() {
        for (let ty = 0; ty < ROWS; ty++)
          for (let tx = 0; tx < COLS; tx++)
            this.add.image(tx*TS+TS/2, ty*TS+TS/2, TILE_KEYS[MAP[ty][tx]] ?? 'grass');

        this.pt = { x: 12, y: 10 };
        this.facing = 'd';
        this.walkFrame = 0;
        this.pl = this.add.image(this.pt.x*TS+TS/2, this.pt.y*TS+TS/2, 'pl_d0').setDepth(10);

        this.cameras.main.startFollow(this.pl, true, 0.1, 0.1);
        this.cameras.main.setZoom(3);
        this.cameras.main.setBounds(0, 0, COLS*TS, ROWS*TS);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.busy = false;
      }

      update() {
        if (this.busy) return;
        const k = this.cursors, w = this.wasd, td = getTD();
        let dx = 0, dy = 0, f = this.facing, flip = this.pl.flipX;

        if      (k.left.isDown  || w.A.isDown || td==='left')  { dx=-1; f='s'; flip=false; }
        else if (k.right.isDown || w.D.isDown || td==='right') { dx=1;  f='s'; flip=true;  }
        else if (k.up.isDown    || w.W.isDown || td==='up')    { dy=-1; f='u'; }
        else if (k.down.isDown  || w.S.isDown || td==='down')  { dy=1;  f='d'; }
        else return;

        const nx = this.pt.x+dx, ny = this.pt.y+dy;
        if (nx<0||nx>=COLS||ny<0||ny>=ROWS) return;
        if (SOLID.has(MAP[ny]?.[nx]??0)) return;

        this.facing = f;
        this.walkFrame ^= 1;
        this.pl.setTexture(`pl_${f}${this.walkFrame}`).setFlipX(flip);
        this.pt.x = nx; this.pt.y = ny; this.busy = true;

        this.tweens.add({
          targets: this.pl,
          x: nx*TS+TS/2, y: ny*TS+TS/2,
          duration: 130, ease: 'Linear',
          onComplete: () => {
            this.pl.setTexture(`pl_${this.facing}0`);
            this.busy = false;
            onZoneChange('RUTA VERDE');
            if (ENCOUNTER_TILES.has(MAP[ny]?.[nx]??0) && Math.random() < 0.18) {
              const poke = WILD_POKEMON[Math.floor(Math.random()*WILD_POKEMON.length)];
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
      backgroundColor: '#68B848',
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
          <div className="rpg-select-header">
            <div className="rpg-select-pokeball" />
            <h2 className="rpg-select-title">ELIGE TU PERSONAJE</h2>
          </div>
          <div className="rpg-char-options">
            {Object.keys(CHARS).map(key => (
              <button key={key} className="rpg-char-btn" onClick={() => setCharColor(key)}>
                <div className="rpg-char-preview">
                  <CharPreview charKey={key} />
                </div>
                <span className="rpg-char-label" style={{ color: CHARS[key].cap || CHARS[key].shirt }}>
                  {CHARS[key].label}
                </span>
              </button>
            ))}
          </div>
          <button className="rpg-back-btn" onClick={() => navigate('/')}>← VOLVER</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rpg-wrapper">
      <div className="rpg-hud">
        <div className="rpg-hud-left">
          <div className="rpg-hud-dot" />
          <span className="rpg-hud-title">MUNDO RPG</span>
        </div>
        <button className="rpg-menu-btn" onClick={() => navigate('/')}>MENÚ</button>
      </div>

      <div className="rpg-canvas-container" ref={containerRef}>
        {zone && (
          <div key={zone} className="rpg-zone-banner">
            <span>{zone}</span>
          </div>
        )}

        <div className="rpg-legend">
          <span>WASD / Flechas para moverse</span>
          <span>Hierba oscura = encuentros</span>
        </div>

        <div className="rpg-dpad">
          {[['up','▲'],['left','◀'],['right','▶'],['down','▼']].map(([dir, icon]) => (
            <button key={dir} className={`rpg-dpad-btn ${dir}`}
              onPointerDown={() => { touchDirRef.current = dir; }}
              onPointerUp={() => { touchDirRef.current = null; }}
              onPointerLeave={() => { touchDirRef.current = null; }}
            >{icon}</button>
          ))}
        </div>
      </div>

      {encounter && (
        <div className="rpg-encounter-overlay">
          <div className="rpg-battle-field">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${encounter.id}.png`}
              alt={encounter.name}
              className="rpg-encounter-sprite"
            />
          </div>
          <div className="rpg-battle-dialog">
            <p className="rpg-battle-text">
              ¡Un {encounter.name.toUpperCase()} salvaje apareció!
            </p>
            <div className="rpg-battle-actions">
              <button className="rpg-btn-fight" onClick={() => navigate('/battle')}>LUCHAR</button>
              <button className="rpg-btn-run" onClick={dismissEncounter}>HUIR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
