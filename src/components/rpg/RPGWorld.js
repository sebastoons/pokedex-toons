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

const POKEBALLS_INIT = 30;
const BASE_CATCH = 0.35;
const BASE_FLEE  = 0.20;

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

// Solo genera texturas para los tiles del mapa (sin sprites de personaje)
function buildTileTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  g.fillStyle(0x68B848); g.fillRect(0, 0, TS, TS);
  g.fillStyle(0x50A030); [1,5,9,13].forEach(y => g.fillRect(0, y, TS, 1));
  g.fillStyle(0x90D860);
  [[2,0],[6,3],[11,1],[14,4],[4,8],[9,6],[1,11],[13,9]].forEach(([x,y]) => g.fillRect(x,y,1,1));
  g.generateTexture('grass', TS, TS); g.clear();

  g.fillStyle(0xB89850); g.fillRect(0,0,TS,TS);
  g.fillStyle(0xCCAC60); g.fillRect(1,1,TS-2,TS-2);
  g.fillStyle(0xD8BC74); g.fillRect(2,2,TS-4,TS-4);
  g.fillStyle(0x907038);
  [[3,4],[8,11],[13,6],[5,13],[11,3],[7,9]].forEach(([x,y]) => g.fillRect(x,y,1,1));
  g.generateTexture('path', TS, TS); g.clear();

  g.fillStyle(0x2858C0); g.fillRect(0,0,TS,TS);
  g.fillStyle(0x4070D8); g.fillRect(0,2,TS,4); g.fillRect(0,10,TS,4);
  g.fillStyle(0x6898F0); g.fillRect(0,4,TS,1); g.fillRect(0,12,TS,1);
  g.fillStyle(0xC0D8FF); [[4,3],[10,11],[14,3],[2,11]].forEach(([x,y]) => g.fillRect(x,y,1,1));
  g.fillStyle(0xFFFFFF); [[6,2],[12,10]].forEach(([x,y]) => g.fillRect(x,y,1,1));
  g.generateTexture('water', TS, TS); g.clear();

  g.fillStyle(0x68B848); g.fillRect(0,0,TS,TS);
  g.fillStyle(0x7A4828); g.fillRect(6,9,4,7);
  g.fillStyle(0x5A3818); g.fillRect(6,9,1,7);
  g.fillStyle(0x0A5010); g.fillCircle(8,6,7);
  g.fillStyle(0x207020); g.fillCircle(8,6,6);
  g.fillStyle(0x30A030); g.fillCircle(6,4,4);
  g.fillStyle(0x50C050); g.fillRect(5,1,4,2);
  g.fillStyle(0x002800); g.fillRect(1,9,14,1);
  g.generateTexture('tree', TS, TS); g.clear();

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

  g.fillStyle(0x68B848); g.fillRect(0,0,TS,TS);
  g.fillStyle(0x50A030); [1,5,9,13].forEach(y => g.fillRect(0,y,TS,1));
  g.fillStyle(0x287800); g.fillRect(7,9,2,5);
  g.fillStyle(0xFF5858); [[5,5],[9,5],[7,3],[7,7]].forEach(([x,y]) => g.fillRect(x,y,2,2));
  g.fillStyle(0xFFE040); g.fillRect(7,5,2,2);
  g.generateTexture('flower', TS, TS); g.clear();

  g.fillStyle(0x68B848); g.fillRect(0,0,TS,TS);
  g.fillStyle(0x50A030); [1,5,9,13].forEach(y => g.fillRect(0,y,TS,1));
  g.fillStyle(0x8B5E3C); g.fillRect(7,8,2,8);
  g.fillStyle(0xE8D088); g.fillRect(2,1,12,8);
  g.fillStyle(0xC0A850); g.fillRect(2,1,12,1); g.fillRect(2,1,1,8); g.fillRect(13,1,1,8);
  g.fillStyle(0x282808); g.fillRect(4,3,8,1); g.fillRect(4,5,6,1); g.fillRect(4,7,7,1);
  g.generateTexture('sign', TS, TS); g.clear();

  g.fillStyle(0xE8D4B8); g.fillRect(0,0,TS,TS);
  g.fillStyle(0xB06040); g.fillRect(0,0,TS,5);
  g.fillStyle(0x803820); g.fillRect(0,4,TS,1);
  g.fillStyle(0xC07448); g.fillRect(2,0,TS-4,4);
  g.fillStyle(0x90C8F0); g.fillRect(4,6,5,5);
  g.fillStyle(0x5898C8); g.fillRect(4,6,5,1); g.fillRect(4,6,1,5);
  g.fillStyle(0xFFFFFF); g.fillRect(5,7,1,2);
  g.fillStyle(0xC0A880); g.fillRect(7,11,3,5);
  g.generateTexture('house', TS, TS); g.clear();

  g.destroy();
}

export default function RPGWorld() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const touchDirRef = useRef(null);
  const onEncounterRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [encounter, setEncounter] = useState(null);
  const [zone, setZone] = useState(null);
  const zoneRef = useRef(null);

  const [pokeballs, setPokeballs] = useState(() => {
    const s = localStorage.getItem('rpg_pokeballs');
    return s !== null ? parseInt(s) : POKEBALLS_INIT;
  });
  const [captured, setCaptured] = useState(() =>
    JSON.parse(localStorage.getItem('rpg_captured') || '[]')
  );
  const [showBodega, setShowBodega] = useState(false);
  const [bs, setBs] = useState(null);

  onEncounterRef.current = (poke) => {
    setEncounter(poke);
    setBs({ angered: false, baited: false, msg: null, resolved: false, caught: false });
  };

  useEffect(() => {
    if (!started || !containerRef.current) return;

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

      preload() {
        buildTileTextures(this);
        this.load.image('player', '/sprite/personajes/sprite1.png');
      }

      create() {
        for (let ty = 0; ty < ROWS; ty++)
          for (let tx = 0; tx < COLS; tx++)
            this.add.image(tx*TS+TS/2, ty*TS+TS/2, TILE_KEYS[MAP[ty][tx]] ?? 'grass');

        this.pt = { x: 12, y: 10 };
        this.pl = this.add.image(this.pt.x*TS+TS/2, this.pt.y*TS+TS/2, 'player')
          .setDisplaySize(TS + 2, Math.round(TS * 1.5))
          .setDepth(10);

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
        let dx = 0, dy = 0;

        if      (k.left.isDown  || w.A.isDown || td==='left')  { dx=-1; this.pl.setFlipX(false); }
        else if (k.right.isDown || w.D.isDown || td==='right') { dx=1;  this.pl.setFlipX(true);  }
        else if (k.up.isDown    || w.W.isDown || td==='up')    { dy=-1; }
        else if (k.down.isDown  || w.S.isDown || td==='down')  { dy=1;  }
        else return;

        const nx = this.pt.x+dx, ny = this.pt.y+dy;
        if (nx<0||nx>=COLS||ny<0||ny>=ROWS) return;
        if (SOLID.has(MAP[ny]?.[nx]??0)) return;

        this.pt.x = nx; this.pt.y = ny; this.busy = true;

        this.tweens.add({
          targets: this.pl,
          x: nx*TS+TS/2, y: ny*TS+TS/2,
          duration: 130, ease: 'Linear',
          onComplete: () => {
            this.busy = false;
            onZoneChange('RUTA VERDE');
            if (ENCOUNTER_TILES.has(MAP[ny]?.[nx]??0) && Math.random() < 0.18) {
              const poke = WILD_POKEMON[Math.floor(Math.random()*WILD_POKEMON.length)];
              this.busy = true;
              onEncounterRef.current(poke);
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
  }, [started]);

  const dismissEncounter = () => {
    setEncounter(null);
    setBs(null);
    const scene = gameRef.current?.scene?.getScene('GameScene');
    if (scene) scene.busy = false;
  };

  const doRock = () => {
    const fleeChance = Math.min(0.85, BASE_FLEE + (bs.baited ? -0.15 : 0) + 0.35);
    const flees = Math.random() < fleeChance;
    setBs(p => ({
      ...p, angered: true, resolved: flees,
      msg: flees
        ? `¡${encounter.name.toUpperCase()} se asustó con la roca y huyó!`
        : `¡${encounter.name.toUpperCase()} está furioso! Es más fácil capturarlo.`,
    }));
  };

  const doBait = () => {
    const fleeChance = Math.max(0.02, BASE_FLEE + (bs.angered ? 0.35 : 0) - 0.15);
    const flees = Math.random() < fleeChance;
    setBs(p => ({
      ...p, baited: true, resolved: flees,
      msg: flees
        ? `${encounter.name.toUpperCase()} comió el sebo... ¡y huyó de todos modos!`
        : `${encounter.name.toUpperCase()} come el sebo. Menos probable que huya.`,
    }));
  };

  const doBall = () => {
    if (pokeballs <= 0) { setBs(p => ({ ...p, msg: '¡No te quedan Pokéballs!' })); return; }
    const nb = pokeballs - 1;
    setPokeballs(nb);
    localStorage.setItem('rpg_pokeballs', String(nb));
    const catchRate = Math.min(0.95, BASE_CATCH + (bs.angered ? 0.25 : 0) - (bs.baited ? 0.20 : 0));
    if (Math.random() < catchRate) {
      const next = [...captured, { id: encounter.id, name: encounter.name }];
      setCaptured(next);
      localStorage.setItem('rpg_captured', JSON.stringify(next));
      setBs(p => ({ ...p, caught: true, resolved: true, msg: `¡${encounter.name.toUpperCase()} fue atrapado! Se guardó en la Bodega.` }));
    } else {
      const flees = Math.random() < Math.min(0.80, BASE_FLEE + (bs.angered ? 0.35 : 0) - (bs.baited ? 0.15 : 0));
      setBs(p => ({
        ...p, resolved: flees,
        msg: flees
          ? `¡${encounter.name.toUpperCase()} rompió la Pokéball y huyó!`
          : `¡Oh! ¡${encounter.name.toUpperCase()} se escapó de la Pokéball!`,
      }));
    }
  };

  // --- Pantalla de selección ---
  if (!started) {
    return (
      <div className="rpg-select-screen">
        <div className="rpg-select-box">
          <div className="rpg-select-header">
            <div className="rpg-select-pokeball" />
            <h2 className="rpg-select-title">MUNDO RPG</h2>
          </div>
          <div className="rpg-char-options">
            <button className="rpg-char-btn" onClick={() => setStarted(true)}>
              <div className="rpg-char-preview">
                <img
                  src="/sprite/personajes/pie1.png"
                  alt="Personaje"
                  className="rpg-char-img"
                />
              </div>
              <span className="rpg-char-label" style={{ color: '#E83030' }}>ROJO</span>
            </button>
          </div>
          <button className="rpg-back-btn" onClick={() => navigate('/')}>← VOLVER</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rpg-wrapper">
      {/* HUD */}
      <div className="rpg-hud">
        <div className="rpg-hud-left">
          <div className="rpg-hud-dot" />
          <span className="rpg-hud-title">MUNDO RPG</span>
        </div>
        <div className="rpg-hud-right">
          <span className="rpg-pokeball-count">
            <span className="rpg-pb-icon" />
            {pokeballs}
          </span>
          <button className="rpg-bodega-btn" onClick={() => setShowBodega(true)}>
            BODEGA {captured.length > 0 && `(${captured.length})`}
          </button>
          <button className="rpg-menu-btn" onClick={() => navigate('/')}>MENÚ</button>
        </div>
      </div>

      {/* Canvas del mundo */}
      <div className="rpg-canvas-container" ref={containerRef}>
        {zone && (
          <div key={zone} className="rpg-zone-banner"><span>{zone}</span></div>
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

      {/* Batalla con Pokémon salvaje */}
      {encounter && bs && (
        <div className="rpg-encounter-overlay">
          <div className="rpg-battle-field">
            {/* Entrenador de espaldas (izquierda) */}
            <img
              src="/sprite/personajes/espalda1.png"
              alt="Entrenador"
              className="rpg-trainer-sprite"
            />
            {/* Pokémon salvaje (derecha) */}
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${encounter.id}.png`}
              alt={encounter.name}
              className={`rpg-encounter-sprite${bs.caught ? ' caught' : ''}`}
            />
          </div>
          <div className="rpg-battle-dialog">
            {(bs.angered || bs.baited) && (
              <div className="rpg-battle-status">
                {bs.angered && <span className="rpg-status-chip rpg-status-angry">⚡ FURIOSO</span>}
                {bs.baited  && <span className="rpg-status-chip rpg-status-baited">🍖 ATRAÍDO</span>}
              </div>
            )}
            <p className="rpg-battle-text">
              {bs.msg || `¡Un ${encounter.name.toUpperCase()} salvaje apareció!`}
            </p>
            {bs.resolved ? (
              <button className="rpg-btn-continue" onClick={dismissEncounter}>CONTINUAR ▶</button>
            ) : (
              <div className="rpg-battle-actions">
                <button className="rpg-btn-rock" onClick={doRock}>
                  🪨 ROCA<small>+captura +huida</small>
                </button>
                <button className="rpg-btn-bait" onClick={doBait}>
                  🍖 SEBO<small>−huida −captura</small>
                </button>
                <button className="rpg-btn-ball" onClick={doBall} disabled={pokeballs <= 0}>
                  ⚪ POKÉBALL<small>x{pokeballs}</small>
                </button>
                <button className="rpg-btn-run" onClick={dismissEncounter}>
                  🏃 HUIR
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bodega */}
      {showBodega && (
        <div className="rpg-bodega-overlay" onClick={() => setShowBodega(false)}>
          <div className="rpg-bodega-box" onClick={e => e.stopPropagation()}>
            <div className="rpg-bodega-header">
              <span className="rpg-bodega-title">BODEGA — {captured.length} Pokémon</span>
              <div className="rpg-bodega-meta">
                <span className="rpg-pokeball-count">
                  <span className="rpg-pb-icon" /> {pokeballs} Pokéballs
                </span>
                <button className="rpg-bodega-close" onClick={() => setShowBodega(false)}>✕</button>
              </div>
            </div>
            {captured.length === 0 ? (
              <p className="rpg-bodega-empty">
                No has atrapado ningún Pokémon aún.<br />
                ¡Entra en la hierba alta y atrapa uno!
              </p>
            ) : (
              <div className="rpg-bodega-scroll">
                <div className="rpg-bodega-grid">
                  {captured.map((p, i) => (
                    <div key={i} className="rpg-bodega-card">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                        alt={p.name}
                      />
                      <span>{p.name.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
