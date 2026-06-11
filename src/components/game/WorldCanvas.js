// src/components/game/WorldCanvas.js
// Motor de mundo: render canvas estilo GBA, movimiento fluido, fade de mapa,
// línea de visión de entrenadores, flash de batalla.
import React, { useRef, useEffect, useCallback } from 'react';
import { MAPS, SOLID_TILES, ENCOUNTER_RATE } from '../../game/maps';
import { drawTile, TILE } from '../../game/tileRenderer';
import { drawHero } from '../../game/heroSprites';

// ── Constantes de pantalla ────────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 768;

const getViewParams = () => {
    if (isMobile()) {
        return { VIEW_W: 15, VIEW_H: 11, SCALE: 2 };
    }
    return { VIEW_W: 21, VIEW_H: 15, SCALE: 3 };
};

const MOVE_MS = 160;

const KEY_DIRS = {
    ArrowUp: 'up',   ArrowDown: 'down',   ArrowLeft: 'left',   ArrowRight: 'right',
    w: 'up',         s: 'down',           a: 'left',           d: 'right',
    W: 'up',         S: 'down',           A: 'left',           D: 'right',
};

const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// ── Línea de visión de entrenadores ──────────────────────────────────────────
const checkTrainerSight = (trainers, px, py, defeatedTrainers) => {
    if (!trainers || trainers.length === 0) return null;
    const DELTAS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    for (const t of trainers) {
        if (defeatedTrainers && defeatedTrainers.includes(t.id)) continue;
        const [dx, dy] = DELTAS[t.dir] ?? [0, 0];
        for (let s = 1; s <= (t.sight ?? 4); s++) {
            if (t.x + dx * s === px && t.y + dy * s === py) return t;
        }
    }
    return null;
};

export default function WorldCanvas({
    gameState,
    onAction,
    onEncounter,
    onMoved,
    onTrainerEncounter,
    paused,
}) {
    const { VIEW_W, VIEW_H, SCALE } = getViewParams();

    const canvasRef = useRef(null);
    const heldDir   = useRef(null);
    const pausedRef = useRef(paused);
    pausedRef.current = paused;

    // Posición viva (sin re-render)
    const pos = useRef({
        map: gameState.map,
        x: gameState.x, y: gameState.y, dir: gameState.dir,
        moving: false,
        fromX: gameState.x, fromY: gameState.y,
        moveStart: 0, step: 0,
    });
    const collectedRef = useRef(gameState.collectedItems);
    collectedRef.current = gameState.collectedItems;

    const defeatedRef = useRef(gameState.defeatedTrainers || []);
    defeatedRef.current = gameState.defeatedTrainers || [];

    // Fade overlay
    const fadeRef = useRef({ alpha: 0, dir: 0, cb: null });
    // Batalla: flashes blancos
    const flashRef = useRef({ count: 0, on: false, timer: 0 });
    // Tick de animación global
    const tickRef = useRef(0);

    const startFade = useCallback((direction, callback) => {
        fadeRef.current = {
            alpha: direction > 0 ? 0 : 1,
            dir: direction,
            cb: callback,
        };
    }, []);

    // Exponer startFade y flash para uso externo (batalla flash)
    const startBattleFlash = useCallback((onDone) => {
        flashRef.current = { count: 6, on: true, timer: 0, cb: onDone };
    }, []);

    // Propagar referencias hacia afuera via objeto en ref
    const apiRef = useRef({ startFade, startBattleFlash });
    apiRef.current = { startFade, startBattleFlash };

    // Sincroniza si el padre teletransporta
    useEffect(() => {
        const p = pos.current;
        if (p.map !== gameState.map || (!p.moving && (p.x !== gameState.x || p.y !== gameState.y))) {
            pos.current = {
                map: gameState.map, x: gameState.x, y: gameState.y, dir: gameState.dir,
                moving: false, fromX: gameState.x, fromY: gameState.y, moveStart: 0, step: 0,
            };
        }
    }, [gameState.map, gameState.x, gameState.y, gameState.dir]);

    // Paso de movimiento
    const attemptStep = useCallback((dir) => {
        const p = pos.current;
        if (p.moving || pausedRef.current) return;
        p.dir = dir;

        const mapDef = MAPS[p.map];
        if (!mapDef) return;
        const [dx, dy] = DELTA[dir];
        const nx = p.x + dx, ny = p.y + dy;
        const grid = mapDef.grid;
        if (ny < 0 || ny >= grid.length || nx < 0 || nx >= (grid[ny]?.length ?? 0)) return;

        const action = mapDef.actions?.[`${nx},${ny}`];
        const tile = grid[ny]?.[nx] ?? '.';

        // Puerta
        if (tile === 'D') {
            onAction(action || { type: 'msg', text: 'La puerta está cerrada.' }, p.map);
            return;
        }

        // Warp con fade
        if (action?.type === 'warp') {
            startFade(1, () => {
                onAction(action, p.map);
                startFade(-1, null);
            });
            return;
        }

        // Acción no-warp en tile transitable (heal, msg, etc.)
        if (action && action.type !== 'warp') {
            // permitir pisar pero disparar acción al entrar
        }

        if (SOLID_TILES.has(tile)) return;

        // Moverse
        p.moving = true;
        p.fromX = p.x; p.fromY = p.y;
        p.x = nx; p.y = ny;
        p.moveStart = performance.now();
        p.step += 1;

        setTimeout(() => {
            p.moving = false;
            const t = grid[p.y]?.[p.x] ?? '.';
            const key = `${p.map}:${p.x},${p.y}`;

            // Objeto recogible
            if (t === 'i' && !collectedRef.current.includes(key)) {
                onAction({ type: 'item', key }, p.map);
            }
            // Acciones de tile (heal, msg)
            if (action && action.type !== 'warp' && action.type !== 'item') {
                onAction(action, p.map);
            }

            // Encuentro salvaje
            if (t === 'G' && mapDef.zoneTypes && Math.random() < ENCOUNTER_RATE) {
                onEncounter(mapDef);
                onMoved({ map: p.map, x: p.x, y: p.y, dir: p.dir });
                return;
            }

            // Línea de visión de entrenadores
            const trainer = checkTrainerSight(
                mapDef.trainers,
                p.x, p.y,
                defeatedRef.current
            );
            if (trainer && onTrainerEncounter) {
                onMoved({ map: p.map, x: p.x, y: p.y, dir: p.dir });
                onTrainerEncounter(trainer);
                return;
            }

            onMoved({ map: p.map, x: p.x, y: p.y, dir: p.dir });
        }, MOVE_MS);
    }, [onAction, onEncounter, onMoved, onTrainerEncounter, startFade]);

    // Teclado
    useEffect(() => {
        const down = (e) => {
            const dir = KEY_DIRS[e.key];
            if (dir) { e.preventDefault(); heldDir.current = dir; }
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                // dismiss dialog manejado por padre via paused
            }
        };
        const up = (e) => {
            if (KEY_DIRS[e.key] === heldDir.current) heldDir.current = null;
        };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, []);

    // Bucle de render principal
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        let raf;

        const render = (now) => {
            tickRef.current += 1;
            const tick = tickRef.current;

            const p = pos.current;
            if (heldDir.current && !p.moving && !pausedRef.current) {
                attemptStep(heldDir.current);
            }

            const mapDef = MAPS[p.map];
            if (!mapDef) { raf = requestAnimationFrame(render); return; }
            const grid = mapDef.grid;
            const mapW = grid[0]?.length ?? VIEW_W;
            const mapH = grid.length;
            const animFrame = Math.floor(tick / 30) % 2;

            // Interpolación de movimiento
            let t = 1;
            if (p.moving) t = Math.min(1, (now - p.moveStart) / MOVE_MS);
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease in-out
            const ix = p.fromX + (p.x - p.fromX) * ease;
            const iy = p.fromY + (p.y - p.fromY) * ease;

            // Cámara centrada
            let camX = ix - VIEW_W / 2 + 0.5;
            let camY = iy - VIEW_H / 2 + 0.5;
            camX = Math.max(0, Math.min(mapW - VIEW_W, camX));
            camY = Math.max(0, Math.min(mapH - VIEW_H, camY));
            if (mapW < VIEW_W) camX = (mapW - VIEW_W) / 2;
            if (mapH < VIEW_H) camY = (mapH - VIEW_H) / 2;

            ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, VIEW_W * TILE, VIEW_H * TILE);

            const startX = Math.floor(camX), startY = Math.floor(camY);
            for (let ty = startY; ty <= startY + VIEW_H + 1 && ty < mapH; ty++) {
                if (ty < 0) continue;
                const row = grid[ty];
                if (!row) continue;
                for (let tx = startX; tx <= startX + VIEW_W + 1 && tx < mapW; tx++) {
                    if (tx < 0) continue;
                    let ch = row[tx] ?? '.';
                    if (ch === 'i' && collectedRef.current.includes(`${p.map}:${tx},${ty}`)) ch = '.';
                    drawTile(
                        ctx, ch,
                        Math.round((tx - camX) * TILE),
                        Math.round((ty - camY) * TILE),
                        animFrame, tick
                    );
                }
            }

            // Sprites de entrenadores NPC en el mapa
            const trainers = mapDef.trainers ?? [];
            for (const trainer of trainers) {
                if (defeatedRef.current.includes(trainer.id)) continue;
                const tx = Math.round((trainer.x - camX) * TILE);
                const ty = Math.round((trainer.y - camY) * TILE);
                // Dibuja un sprite NPC simple (mancha de color)
                ctx.fillStyle = '#e05050';
                ctx.fillRect(tx + 3, ty, 10, 14);
                ctx.fillStyle = '#f8c060';
                ctx.fillRect(tx + 4, ty + 1, 8, 7);
                ctx.fillStyle = '#fff';
                ctx.fillRect(tx + 5, ty + 2, 3, 2);
                ctx.fillRect(tx + 8, ty + 2, 3, 2);
            }

            // Héroe (12×16)
            const hx = Math.round((ix - camX) * TILE) + 2;
            const hy = Math.round((iy - camY) * TILE) - 2;
            drawHero(ctx, gameState.trainer.gender, gameState.trainer.palette, p.dir, hx, hy, p.moving ? p.step : 0);

            // ── Flash de batalla ─────────────────────────────────────────────
            const fl = flashRef.current;
            if (fl.count > 0) {
                fl.timer += 1;
                if (fl.timer % 8 === 0) {
                    fl.on = !fl.on;
                    fl.count -= 1;
                    if (fl.count <= 0) {
                        fl.on = false;
                        if (fl.cb) { fl.cb(); fl.cb = null; }
                    }
                }
                if (fl.on) {
                    ctx.fillStyle = 'rgba(255,255,255,0.85)';
                    ctx.fillRect(0, 0, VIEW_W * TILE, VIEW_H * TILE);
                }
            }

            // ── Fade overlay ─────────────────────────────────────────────────
            const fade = fadeRef.current;
            if (fade.dir !== 0) {
                fade.alpha += fade.dir * 0.05;
                if (fade.dir > 0 && fade.alpha >= 1) {
                    fade.alpha = 1;
                    fade.dir = 0;
                    if (fade.cb) { const cb = fade.cb; fade.cb = null; cb(); }
                } else if (fade.dir < 0 && fade.alpha <= 0) {
                    fade.alpha = 0;
                    fade.dir = 0;
                }
            }
            if (fade.alpha > 0) {
                ctx.fillStyle = `rgba(0,0,0,${fade.alpha})`;
                ctx.fillRect(0, 0, VIEW_W * TILE, VIEW_H * TILE);
            }

            raf = requestAnimationFrame(render);
        };

        raf = requestAnimationFrame(render);
        return () => cancelAnimationFrame(raf);
    }, [attemptStep, gameState.trainer, VIEW_W, VIEW_H, SCALE]); // eslint-disable-line react-hooks/exhaustive-deps

    const press   = (dir) => { heldDir.current = dir; };
    const release = ()    => { heldDir.current = null; };

    return (
        <div className="world-wrap">
            <div className="world-mapname">{MAPS[pos.current.map]?.name ?? ''}</div>
            <canvas
                ref={canvasRef}
                width={VIEW_W * TILE * SCALE}
                height={VIEW_H * TILE * SCALE}
                className="world-canvas"
                style={{ width: '100%', imageRendering: 'pixelated' }}
            />
            <div className="world-dpad">
                <div className="dpad-grid">
                    <button className="dpad-btn up"    onPointerDown={() => press('up')}    onPointerUp={release} onPointerLeave={release}>▲</button>
                    <button className="dpad-btn left"  onPointerDown={() => press('left')}  onPointerUp={release} onPointerLeave={release}>◀</button>
                    <button className="dpad-btn right" onPointerDown={() => press('right')} onPointerUp={release} onPointerLeave={release}>▶</button>
                    <button className="dpad-btn down"  onPointerDown={() => press('down')}  onPointerUp={release} onPointerLeave={release}>▼</button>
                </div>
            </div>
        </div>
    );
}
