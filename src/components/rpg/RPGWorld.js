// src/components/rpg/RPGWorld.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './RPGWorld.css';

const TS = 48;
const COLS = 32;
const ROWS = 22;

const T = { GRASS: 0, PATH: 1, WATER: 2, TREE: 3, TALL: 4 };
const SOLID = new Set([T.WATER, T.TREE]);
const ENCOUNTER_TILES = new Set([T.TALL]);

// Route 1 style map — path winds north-south, tall grass flanks the route
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
  { id: 16, name: 'Pidgey' },    { id: 19, name: 'Rattata' },
  { id: 10, name: 'Caterpie' },  { id: 13, name: 'Weedle' },
  { id: 52, name: 'Meowth' },    { id: 46, name: 'Paras' },
  { id: 35, name: 'Clefairy' },  { id: 39, name: 'Jigglypuff' },
];

const CHARS = {
  red:     { label: 'ROJO',    shirt: '#CC2222', pants: '#1A237E', cap: '#AA1111', capBrim: '#881111', hair: '#222',    skin: '#FFCC80', scarf: null },
  leaf:    { label: 'LEAF',    shirt: '#FFFFFF', pants: '#2E7D32', cap: '#FFFFFF', capBrim: '#E0E0E0', hair: '#8B4513', skin: '#FFCC80', scarf: '#4CAF50' },
  brendan: { label: 'BRENDAN', shirt: '#FFFFFF', pants: '#C62828', cap: '#FFFFFF', capBrim: '#E0E0E0', hair: '#111',    skin: '#FFCC80', scarf: null },
  may:     { label: 'MAY',     shirt: '#F44336', pants: '#1565C0', cap: null,      capBrim: null,      hair: '#8B4513', skin: '#FFCC80', scarf: null },
  ethan:   { label: 'ETHAN',   shirt: '#E65100', pants: '#37474F', cap: '#BF360C', capBrim: '#8D2A0A', hair: '#222',    skin: '#FFCC80', scarf: null },
};

// GBA Pokemon-style tile renderer
function drawTile(ctx, type, px, py, tick) {
  switch (type) {
    case T.GRASS: {
      ctx.fillStyle = '#78C850';
      ctx.fillRect(px, py, TS, TS);
      // Subtle horizontal shadow lines (GBA grid look)
      ctx.fillStyle = '#60A838';
      for (let i = 8; i < TS; i += 8) ctx.fillRect(px, py + i, TS, 1);
      // Corner leaf highlights
      ctx.fillStyle = '#90DC68';
      ctx.fillRect(px + 1, py + 1, 4, 2);
      ctx.fillRect(px + 1, py + 1, 2, 4);
      ctx.fillRect(px + TS - 5, py + TS - 3, 4, 2);
      break;
    }
    case T.PATH: {
      ctx.fillStyle = '#D8B870';
      ctx.fillRect(px, py, TS, TS);
      ctx.fillStyle = '#E8C880';
      ctx.fillRect(px + 2, py + 2, TS - 4, TS - 4);
      // Pebble speckles
      ctx.fillStyle = '#B09048';
      [[6,8],[20,20],[34,10],[12,36],[38,26],[24,4],[4,30],[42,40]].forEach(
        ([dx, dy]) => ctx.fillRect(px + dx, py + dy, 2, 2)
      );
      // Thin edge lines
      ctx.fillStyle = '#C0A058';
      ctx.fillRect(px, py, TS, 1);
      ctx.fillRect(px, py, 1, TS);
      break;
    }
    case T.WATER: {
      ctx.fillStyle = '#2060C0';
      ctx.fillRect(px, py, TS, TS);
      ctx.fillStyle = '#3878D8';
      ctx.fillRect(px + 2, py + 2, TS - 4, TS - 4);
      // Animated ripple stripes
      const wOff = Math.floor((tick ?? 0) / 8) % 16;
      ctx.fillStyle = '#60A8F8';
      [4, 20, 36].forEach(wy => {
        ctx.fillRect(px + 3, py + 2 + ((wy + wOff) % (TS - 4)), TS - 6, 3);
      });
      // White sparkles
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillRect(px + 10, py + 6 + (wOff % 8), 4, 1);
      ctx.fillRect(px + 30, py + 22 + ((wOff + 4) % 8), 3, 1);
      break;
    }
    case T.TREE: {
      // Grass underlay
      ctx.fillStyle = '#78C850';
      ctx.fillRect(px, py, TS, TS);
      // Ground shadow
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(px + TS / 2 + 3, py + TS - 6, TS * 0.28, TS * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Trunk
      ctx.fillStyle = '#7A4A28';
      ctx.fillRect(px + TS / 2 - 4, py + TS - 13, 8, 11);
      ctx.fillStyle = '#5A3018';
      ctx.fillRect(px + TS / 2 - 4, py + TS - 13, 3, 11);
      // Canopy: 4 layers (outermost dark → inner highlight)
      ctx.fillStyle = '#187010';
      ctx.beginPath(); ctx.arc(px + TS / 2, py + TS * 0.42, TS * 0.42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2A9E20';
      ctx.beginPath(); ctx.arc(px + TS / 2 + 1, py + TS * 0.40, TS * 0.36, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#42C032';
      ctx.beginPath(); ctx.arc(px + TS / 2 - 4, py + TS * 0.33, TS * 0.20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#68E054';
      ctx.beginPath(); ctx.arc(px + TS / 2 - 6, py + TS * 0.27, TS * 0.10, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case T.TALL: {
      // Dark grass base
      ctx.fillStyle = '#3E8820';
      ctx.fillRect(px, py, TS, TS);
      ctx.fillStyle = '#2E7018';
      ctx.fillRect(px, py + TS * 0.55, TS, TS * 0.45);
      // GBA-style tall grass blades (stem + fork tips)
      const blade = (bx, topY, h, main, dark) => {
        ctx.fillStyle = dark;
        ctx.fillRect(bx, topY, 1, h);
        ctx.fillStyle = main;
        ctx.fillRect(bx + 1, topY, 2, h);
        // Fork left
        ctx.fillRect(bx - 3, topY, 2, Math.floor(h * 0.45));
        ctx.fillRect(bx - 5, topY + 2, 2, Math.floor(h * 0.28));
        // Fork right
        ctx.fillRect(bx + 3, topY, 2, Math.floor(h * 0.40));
        ctx.fillRect(bx + 5, topY + 2, 1, Math.floor(h * 0.22));
        // Bright tip
        ctx.fillStyle = '#88E050';
        ctx.fillRect(bx, topY, 3, 2);
      };
      const bH = Math.floor(TS * 0.58);
      blade(px + 8,  py + 5,        bH,        '#58B030', '#388018');
      blade(px + 18, py + 7,        Math.floor(bH * 0.88), '#4EAC28', '#2E7018');
      blade(px + 28, py + 4,        bH,        '#62BA38', '#3E8820');
      blade(px + 38, py + 6,        Math.floor(bH * 0.92), '#58B030', '#366018');
      break;
    }
    default: {
      ctx.fillStyle = '#78C850';
      ctx.fillRect(px, py, TS, TS);
    }
  }
}

function drawPlayer(ctx, sx, sy, dir, c) {
  const px = sx - TS / 2, py = sy - TS / 2;
  // Shadow
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(sx, py + TS - 2, TS * 0.28, TS * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Legs
  ctx.fillStyle = c.pants;
  ctx.fillRect(px + TS * .22, py + TS * .54, TS * .22, TS * .37);
  ctx.fillRect(px + TS * .56, py + TS * .54, TS * .22, TS * .37);
  ctx.fillStyle = '#222';
  ctx.fillRect(px + TS * .19, py + TS * .87, TS * .27, TS * .1);
  ctx.fillRect(px + TS * .54, py + TS * .87, TS * .27, TS * .1);
  // Torso
  ctx.fillStyle = c.shirt;
  ctx.fillRect(px + TS * .18, py + TS * .3, TS * .64, TS * .27);
  ctx.fillRect(px + TS * .04, py + TS * .32, TS * .16, TS * .23);
  ctx.fillRect(px + TS * .8,  py + TS * .32, TS * .16, TS * .23);
  // Scarf (optional)
  if (c.scarf) {
    ctx.fillStyle = c.scarf;
    ctx.fillRect(px + TS * .28, py + TS * .28, TS * .44, TS * .07);
  }
  // Hands
  ctx.fillStyle = c.skin;
  ctx.beginPath(); ctx.arc(px + TS * .1, py + TS * .56, TS * .08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + TS * .9, py + TS * .56, TS * .08, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.fillStyle = c.skin;
  ctx.beginPath(); ctx.arc(sx, py + TS * .21, TS * .19, 0, Math.PI * 2); ctx.fill();
  // Hair (drawn before cap so cap covers top)
  ctx.fillStyle = c.hair;
  if (c.cap) {
    // Only show hair below cap on sides
    ctx.fillRect(px + TS * .22, py + TS * .16, TS * .1, TS * .1);
    ctx.fillRect(px + TS * .68, py + TS * .16, TS * .1, TS * .1);
  } else {
    // May: full hair visible (bandana instead of cap)
    ctx.beginPath(); ctx.arc(sx, py + TS * .17, TS * .19, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(px + TS * .18, py + TS * .06, TS * .64, TS * .12);
    // Bandana strip
    ctx.fillStyle = c.shirt;
    ctx.fillRect(px + TS * .18, py + TS * .10, TS * .64, TS * .05);
  }
  // Cap (if character has one)
  if (c.cap) {
    ctx.fillStyle = c.cap;
    ctx.fillRect(px + TS * .26, py + TS * .04, TS * .48, TS * .13);
    // Cap brim
    ctx.fillStyle = c.capBrim || c.cap;
    ctx.fillRect(px + TS * .12, py + TS * .12, TS * .22, TS * .07);
    // Cap top button
    ctx.fillStyle = c.capBrim || c.cap;
    ctx.fillRect(px + TS * .45, py + TS * .02, TS * .1, TS * .04);
  }
  // Eyes
  if (dir !== 'up') {
    const ey = py + TS * .22;
    const ex = dir === 'left' ? -TS * .06 : dir === 'right' ? TS * .06 : 0;
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(sx + ex - TS * .07, ey, TS * .04, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + ex + TS * .07, ey, TS * .04, 0, Math.PI * 2); ctx.fill();
  }
}

const lerp = (a, b, t) => a + (b - a) * t;

function CharPreview({ color }) {
  const cvs = useRef(null);
  useEffect(() => {
    if (!cvs.current) return;
    const ctx = cvs.current.getContext('2d');
    ctx.clearRect(0, 0, 80, 80);
    drawPlayer(ctx, 40, 44, 'down', CHARS[color]);
  }, [color]);
  return <canvas ref={cvs} width={80} height={80} />;
}

export default function RPGWorld() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const keysRef = useRef({});
  const touchDirRef = useRef(null);
  const rafRef = useRef(null);
  const animTickRef = useRef(0);

  const playerRef = useRef({
    tileX: 16, tileY: 10,
    pixelX: 16 * TS, pixelY: 10 * TS,
    targetX: 16, targetY: 10,
    moving: false, direction: 'down', stepProgress: 0,
  });

  const [charColor, setCharColor] = useState(null);
  const [encounter, setEncounter] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 520 });

  const charRef = useRef(charColor);
  useEffect(() => { charRef.current = charColor; }, [charColor]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = { w: canvas.width, h: canvas.height };
    const p = playerRef.current;
    const camX = Math.max(0, Math.min(p.pixelX - w / 2, COLS * TS - w));
    const camY = Math.max(0, Math.min(p.pixelY - h / 2, ROWS * TS - h));
    ctx.clearRect(0, 0, w, h);
    const tx0 = Math.max(0, Math.floor(camX / TS));
    const ty0 = Math.max(0, Math.floor(camY / TS));
    const tx1 = Math.min(COLS, Math.ceil((camX + w) / TS) + 1);
    const ty1 = Math.min(ROWS, Math.ceil((camY + h) / TS) + 1);
    for (let ty = ty0; ty < ty1; ty++)
      for (let tx = tx0; tx < tx1; tx++)
        drawTile(ctx, MAP[ty]?.[tx] ?? 0, tx * TS - camX, ty * TS - camY, animTickRef.current);
    const c = CHARS[charRef.current] || CHARS.red;
    drawPlayer(ctx, p.pixelX - camX + TS / 2, p.pixelY - camY + TS / 2, p.direction, c);
  }, []);

  const gameLoop = useCallback(() => {
    animTickRef.current++;
    const p = playerRef.current;
    if (!p.moving) {
      const k = keysRef.current, td = touchDirRef.current;
      let dx = 0, dy = 0, dir = p.direction;
      if      (k['ArrowLeft']  || k['KeyA'] || td === 'left')  { dx = -1; dir = 'left'; }
      else if (k['ArrowRight'] || k['KeyD'] || td === 'right') { dx =  1; dir = 'right'; }
      else if (k['ArrowUp']    || k['KeyW'] || td === 'up')    { dy = -1; dir = 'up'; }
      else if (k['ArrowDown']  || k['KeyS'] || td === 'down')  { dy =  1; dir = 'down'; }
      p.direction = dir;
      if (dx || dy) {
        const nx = p.tileX + dx, ny = p.tileY + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !SOLID.has(MAP[ny]?.[nx] ?? 0)) {
          p.targetX = nx; p.targetY = ny; p.moving = true; p.stepProgress = 0;
        }
      }
    }
    if (p.moving) {
      p.stepProgress = Math.min(1, p.stepProgress + 0.13);
      p.pixelX = lerp(p.tileX * TS, p.targetX * TS, p.stepProgress);
      p.pixelY = lerp(p.tileY * TS, p.targetY * TS, p.stepProgress);
      if (p.stepProgress >= 1) {
        p.tileX = p.targetX; p.tileY = p.targetY; p.moving = false;
        if (ENCOUNTER_TILES.has(MAP[p.tileY]?.[p.tileX]) && Math.random() < 0.18) {
          const poke = WILD_POKEMON[Math.floor(Math.random() * WILD_POKEMON.length)];
          setEncounter(poke);
          render(); return;
        }
      }
    }
    render();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [render]);

  useEffect(() => {
    if (!charColor || encounter) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [charColor, encounter, gameLoop]);

  useEffect(() => {
    const kd = e => {
      keysRef.current[e.code] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    };
    const ku = e => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      const el = containerRef.current;
      if (el) setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  if (!charColor) {
    return (
      <div className="rpg-select-screen">
        <div className="rpg-select-box">
          <h2 className="rpg-select-title">ELIGE TU PERSONAJE</h2>
          <div className="rpg-char-options">
            {Object.keys(CHARS).map(key => (
              <button key={key} className="rpg-char-btn" onClick={() => setCharColor(key)}>
                <CharPreview color={key} />
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
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          className="rpg-canvas"
        />

        <div className="rpg-dpad">
          <button className="rpg-dpad-btn up"    onPointerDown={() => touchDirRef.current = 'up'}    onPointerUp={() => touchDirRef.current = null} onPointerLeave={() => touchDirRef.current = null}>▲</button>
          <button className="rpg-dpad-btn left"  onPointerDown={() => touchDirRef.current = 'left'}  onPointerUp={() => touchDirRef.current = null} onPointerLeave={() => touchDirRef.current = null}>◀</button>
          <button className="rpg-dpad-btn right" onPointerDown={() => touchDirRef.current = 'right'} onPointerUp={() => touchDirRef.current = null} onPointerLeave={() => touchDirRef.current = null}>▶</button>
          <button className="rpg-dpad-btn down"  onPointerDown={() => touchDirRef.current = 'down'}  onPointerUp={() => touchDirRef.current = null} onPointerLeave={() => touchDirRef.current = null}>▼</button>
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
              <button className="rpg-btn-run" onClick={() => setEncounter(null)}>HUIR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
