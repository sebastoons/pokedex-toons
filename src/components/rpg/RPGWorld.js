// src/components/rpg/RPGWorld.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './RPGWorld.css';

const TS = 48; // tile size px
const COLS = 32;
const ROWS = 22;

const T = { GRASS: 0, PATH: 1, WATER: 2, TREE: 3, TALL: 4 };
const SOLID = new Set([T.WATER, T.TREE]);
const ENCOUNTER_TILES = new Set([T.TALL]);

/* eslint-disable no-sparse-arrays */
const MAP = [
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,0,0,0,3],
  [3,0,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,0,0,0,3],
  [3,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,3],
  [3,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,1,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,3],
  [3,0,0,0,1,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,3],
  [3,0,0,0,1,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,3],
  [3,0,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,3],
  [3,0,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
];

const WILD_POKEMON = [
  { id: 16, name: 'Pidgey' }, { id: 19, name: 'Rattata' },
  { id: 10, name: 'Caterpie' }, { id: 13, name: 'Weedle' },
  { id: 52, name: 'Meowth' }, { id: 46, name: 'Paras' },
  { id: 35, name: 'Clefairy' }, { id: 39, name: 'Jigglypuff' },
];

const TILE_BASE = { 0:'#5a9e3a', 1:'#c4a882', 2:'#1e6ed4', 3:'#2d6e25', 4:'#3d8a30' };

function drawTile(ctx, type, px, py) {
  ctx.fillStyle = TILE_BASE[type] ?? TILE_BASE[0];
  ctx.fillRect(px, py, TS, TS);
  if (type === T.TREE) {
    ctx.fillStyle = '#1B5E20';
    ctx.beginPath(); ctx.arc(px+TS/2, py+TS/2, TS*0.38, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#33691E';
    ctx.beginPath(); ctx.arc(px+TS/2-3, py+TS/2-4, TS*0.22, 0, Math.PI*2); ctx.fill();
  } else if (type === T.WATER) {
    ctx.fillStyle = 'rgba(100,180,255,0.3)';
    for (let i=0;i<3;i++) ctx.fillRect(px+4, py+9+i*12, TS-8, 4);
  } else if (type === T.TALL) {
    ctx.fillStyle = '#2E7D32';
    for (let i=0;i<5;i++) ctx.fillRect(px+5+i*8, py+TS-14, 3, 12);
    ctx.fillStyle = '#43A047';
    for (let i=0;i<4;i++) ctx.fillRect(px+9+i*8, py+TS-10, 2, 9);
  } else if (type === T.PATH) {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(px,py,TS/2,TS/2); ctx.fillRect(px+TS/2,py+TS/2,TS/2,TS/2);
  }
}

const CHARS = {
  red:   { shirt:'#C62828', pants:'#1A237E', cap:'#B71C1C', skin:'#FFCC80' },
  blue:  { shirt:'#0D47A1', pants:'#263238', cap:'#01579B', skin:'#FFCC80' },
  green: { shirt:'#1B5E20', pants:'#BF360C', cap:'#33691E', skin:'#FFCC80' },
};

function drawPlayer(ctx, sx, sy, dir, c) {
  const px = sx - TS/2, py = sy - TS/2;
  ctx.save(); ctx.globalAlpha=0.18; ctx.fillStyle='#000';
  ctx.beginPath(); ctx.ellipse(sx, py+TS-2, TS*0.28, TS*0.07, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.fillStyle=c.pants;
  ctx.fillRect(px+TS*.22, py+TS*.54, TS*.22, TS*.37);
  ctx.fillRect(px+TS*.56, py+TS*.54, TS*.22, TS*.37);
  ctx.fillStyle='#222';
  ctx.fillRect(px+TS*.19, py+TS*.87, TS*.27, TS*.1);
  ctx.fillRect(px+TS*.54, py+TS*.87, TS*.27, TS*.1);
  ctx.fillStyle=c.shirt;
  ctx.fillRect(px+TS*.18, py+TS*.3, TS*.64, TS*.27);
  ctx.fillRect(px+TS*.04, py+TS*.32, TS*.16, TS*.23);
  ctx.fillRect(px+TS*.8, py+TS*.32, TS*.16, TS*.23);
  ctx.fillStyle=c.skin;
  ctx.beginPath(); ctx.arc(px+TS*.1, py+TS*.56, TS*.08, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(px+TS*.9, py+TS*.56, TS*.08, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx, py+TS*.21, TS*.19, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle=c.cap;
  ctx.fillRect(px+TS*.26, py+TS*.05, TS*.48, TS*.14);
  ctx.fillRect(px+TS*.14, py+TS*.1, TS*.18, TS*.08);
  if (dir !== 'up') {
    const ey = py+TS*.21;
    const ex = dir==='left'?-TS*.06:dir==='right'?TS*.06:0;
    ctx.fillStyle='#222';
    ctx.beginPath(); ctx.arc(sx+ex-TS*.07, ey, TS*.04, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx+ex+TS*.07, ey, TS*.04, 0, Math.PI*2); ctx.fill();
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
    tileX:5, tileY:5, pixelX:5*TS, pixelY:5*TS,
    targetX:5, targetY:5, moving:false, direction:'down', stepProgress:0,
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
    const camX = Math.max(0, Math.min(p.pixelX - w/2, COLS*TS - w));
    const camY = Math.max(0, Math.min(p.pixelY - h/2, ROWS*TS - h));
    ctx.clearRect(0, 0, w, h);
    const tx0=Math.max(0,Math.floor(camX/TS)), ty0=Math.max(0,Math.floor(camY/TS));
    const tx1=Math.min(COLS,Math.ceil((camX+w)/TS)+1), ty1=Math.min(ROWS,Math.ceil((camY+h)/TS)+1);
    for (let ty=ty0;ty<ty1;ty++) for (let tx=tx0;tx<tx1;tx++)
      drawTile(ctx, MAP[ty]?.[tx]??0, tx*TS-camX, ty*TS-camY);
    const c = CHARS[charRef.current] || CHARS.red;
    drawPlayer(ctx, p.pixelX-camX+TS/2, p.pixelY-camY+TS/2, p.direction, c);
  }, []);

  const gameLoop = useCallback(() => {
    const p = playerRef.current;
    if (!p.moving) {
      const k = keysRef.current, td = touchDirRef.current;
      let dx=0, dy=0, dir=p.direction;
      if      (k['ArrowLeft'] ||k['KeyA']||td==='left')  { dx=-1; dir='left'; }
      else if (k['ArrowRight']||k['KeyD']||td==='right') { dx= 1; dir='right'; }
      else if (k['ArrowUp']   ||k['KeyW']||td==='up')    { dy=-1; dir='up'; }
      else if (k['ArrowDown'] ||k['KeyS']||td==='down')  { dy= 1; dir='down'; }
      p.direction = dir;
      if (dx||dy) {
        const nx=p.tileX+dx, ny=p.tileY+dy;
        if (nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&!SOLID.has(MAP[ny]?.[nx]??0)) {
          p.targetX=nx; p.targetY=ny; p.moving=true; p.stepProgress=0;
        }
      }
    }
    if (p.moving) {
      p.stepProgress = Math.min(1, p.stepProgress + 0.13);
      p.pixelX = lerp(p.tileX*TS, p.targetX*TS, p.stepProgress);
      p.pixelY = lerp(p.tileY*TS, p.targetY*TS, p.stepProgress);
      animTickRef.current++;
      if (p.stepProgress >= 1) {
        p.tileX=p.targetX; p.tileY=p.targetY; p.moving=false;
        if (ENCOUNTER_TILES.has(MAP[p.tileY]?.[p.tileX]) && Math.random()<0.18) {
          const poke = WILD_POKEMON[Math.floor(Math.random()*WILD_POKEMON.length)];
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
    const kd = (e) => {
      keysRef.current[e.code] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    };
    const ku = (e) => { keysRef.current[e.code] = false; };
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
                <span className="rpg-char-label" style={{ color: CHARS[key].shirt }}>
                  {key === 'red' ? 'ROJO' : key === 'blue' ? 'AZUL' : 'VERDE'}
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
          <button className="rpg-dpad-btn up"    onPointerDown={()=>touchDirRef.current='up'}    onPointerUp={()=>touchDirRef.current=null} onPointerLeave={()=>touchDirRef.current=null}>▲</button>
          <button className="rpg-dpad-btn left"  onPointerDown={()=>touchDirRef.current='left'}  onPointerUp={()=>touchDirRef.current=null} onPointerLeave={()=>touchDirRef.current=null}>◀</button>
          <button className="rpg-dpad-btn right" onPointerDown={()=>touchDirRef.current='right'} onPointerUp={()=>touchDirRef.current=null} onPointerLeave={()=>touchDirRef.current=null}>▶</button>
          <button className="rpg-dpad-btn down"  onPointerDown={()=>touchDirRef.current='down'}  onPointerUp={()=>touchDirRef.current=null} onPointerLeave={()=>touchDirRef.current=null}>▼</button>
        </div>

        <div className="rpg-legend">
          <span>🟩 Hierba alta = encuentros</span>
          <span>⌨️ WASD / ↑←↓→</span>
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
