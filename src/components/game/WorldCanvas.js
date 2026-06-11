// src/components/game/WorldCanvas.js
// Motor del mundo: render canvas estilo GBA, movimiento por casillas, encuentros
import React, { useRef, useEffect, useCallback } from 'react';
import { MAPS, SOLID_TILES, ENCOUNTER_RATE } from '../../game/maps';
import { drawTile, TILE } from '../../game/tileRenderer';
import { drawHero } from '../../game/heroSprites';

const VIEW_W = 15; // tiles visibles
const VIEW_H = 11;
const SCALE = 2;
const MOVE_MS = 170;

const KEY_DIRS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right',
};

const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export default function WorldCanvas({ gameState, onAction, onEncounter, onMoved, paused }) {
    const canvasRef = useRef(null);
    const heldDir = useRef(null);
    const pausedRef = useRef(paused);
    pausedRef.current = paused;

    // Posición viva en refs (sin re-render por paso)
    const pos = useRef({
        map: gameState.map, x: gameState.x, y: gameState.y, dir: gameState.dir,
        moving: false, fromX: gameState.x, fromY: gameState.y, moveStart: 0, step: 0,
    });
    const collectedRef = useRef(gameState.collectedItems);
    collectedRef.current = gameState.collectedItems;

    // Sincroniza si el padre teletransporta (warp/blackout)
    useEffect(() => {
        const p = pos.current;
        if (p.map !== gameState.map || (!p.moving && (p.x !== gameState.x || p.y !== gameState.y))) {
            pos.current = {
                map: gameState.map, x: gameState.x, y: gameState.y, dir: gameState.dir,
                moving: false, fromX: gameState.x, fromY: gameState.y, moveStart: 0, step: 0,
            };
        }
    }, [gameState.map, gameState.x, gameState.y, gameState.dir]);

    const attemptStep = useCallback((dir) => {
        const p = pos.current;
        if (p.moving || pausedRef.current) return;
        p.dir = dir;
        const mapDef = MAPS[p.map];
        const [dx, dy] = DELTA[dir];
        const nx = p.x + dx, ny = p.y + dy;
        const grid = mapDef.grid;
        if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) return;

        const action = mapDef.actions?.[`${nx},${ny}`];
        const tile = grid[ny][nx];

        // Puertas: disparan su acción sin moverse
        if (tile === 'D') {
            onAction(action || { type: 'msg', text: 'La puerta está cerrada.' }, p.map);
            return;
        }
        // Salidas de mapa (tiles transitables con warp)
        if (action?.type === 'warp') {
            onAction(action, p.map);
            return;
        }
        if (SOLID_TILES.has(tile)) return; // bloqueado: solo gira

        // Mover
        p.moving = true;
        p.fromX = p.x; p.fromY = p.y;
        p.x = nx; p.y = ny;
        p.moveStart = performance.now();
        p.step += 1;

        // Al completar el paso (timeout = duración de animación)
        setTimeout(() => {
            p.moving = false;
            const t = grid[p.y][p.x];
            const key = `${p.map}:${p.x},${p.y}`;
            if (t === 'i' && !collectedRef.current.includes(key)) {
                onAction({ type: 'item', key }, p.map);
            } else if (t === 'G' && mapDef.zoneTypes && Math.random() < ENCOUNTER_RATE) {
                onEncounter(mapDef);
            }
            onMoved({ map: p.map, x: p.x, y: p.y, dir: p.dir });
        }, MOVE_MS);
    }, [onAction, onEncounter, onMoved]);

    // Teclado
    useEffect(() => {
        const down = (e) => {
            const dir = KEY_DIRS[e.key];
            if (dir) { e.preventDefault(); heldDir.current = dir; }
        };
        const up = (e) => {
            if (KEY_DIRS[e.key] === heldDir.current) heldDir.current = null;
        };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, []);

    // Bucle de render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        let raf;

        const render = (now) => {
            const p = pos.current;
            if (heldDir.current && !p.moving && !pausedRef.current) attemptStep(heldDir.current);

            const mapDef = MAPS[p.map];
            const grid = mapDef.grid;
            const mapW = grid[0].length, mapH = grid.length;
            const animFrame = Math.floor(now / 480) % 2;

            // Interpolación del paso
            let t = 1;
            if (p.moving) t = Math.min(1, (now - p.moveStart) / MOVE_MS);
            const ix = p.fromX + (p.x - p.fromX) * t;
            const iy = p.fromY + (p.y - p.fromY) * t;

            // Cámara centrada y limitada al mapa
            let camX = ix - VIEW_W / 2 + 0.5;
            let camY = iy - VIEW_H / 2 + 0.5;
            camX = Math.max(0, Math.min(mapW - VIEW_W, camX));
            camY = Math.max(0, Math.min(mapH - VIEW_H, camY));
            if (mapW < VIEW_W) camX = (mapW - VIEW_W) / 2;
            if (mapH < VIEW_H) camY = (mapH - VIEW_H) / 2;

            ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, VIEW_W * TILE, VIEW_H * TILE);

            const startX = Math.floor(camX), startY = Math.floor(camY);
            for (let ty = startY; ty <= startY + VIEW_H && ty < mapH; ty++) {
                if (ty < 0) continue;
                for (let tx = startX; tx <= startX + VIEW_W && tx < mapW; tx++) {
                    if (tx < 0) continue;
                    let ch = grid[ty][tx];
                    if (ch === 'i' && collectedRef.current.includes(`${p.map}:${tx},${ty}`)) ch = '.';
                    drawTile(ctx, ch, Math.round((tx - camX) * TILE), Math.round((ty - camY) * TILE), animFrame);
                }
            }

            // Héroe (12×16, centrado en su tile, pies en la base)
            const hx = Math.round((ix - camX) * TILE) + 2;
            const hy = Math.round((iy - camY) * TILE) - 2;
            drawHero(ctx, gameState.trainer.gender, gameState.trainer.palette, p.dir, hx, hy, p.moving ? p.step : 0);

            raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);
        return () => cancelAnimationFrame(raf);
    }, [attemptStep, gameState.trainer]);

    const press = (dir) => { heldDir.current = dir; };
    const release = () => { heldDir.current = null; };

    return (
        <div className="world-wrap">
            <div className="world-mapname">{MAPS[pos.current.map]?.name ?? ''}</div>
            <canvas
                ref={canvasRef}
                width={VIEW_W * TILE * SCALE}
                height={VIEW_H * TILE * SCALE}
                className="world-canvas"
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
