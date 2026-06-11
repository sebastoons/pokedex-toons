// src/game/tileRenderer.js
// Dibuja tiles 16×16 estilo GBA con gráficos detallados
export const TILE = 16;

const C = {
    // Césped
    grass1: '#7ac74c', grass2: '#6db542', grass3: '#5ea636', grassDot: '#4e9628',
    // Hierba alta
    tall1: '#2d6e1f', tall2: '#3e8e2f', tall3: '#52a83e', tallHi: '#6ec050',
    // Camino
    path1: '#e8d8a0', path2: '#dcc98c', path3: '#c9b478', pathPeb: '#b89c60',
    // Árbol
    trunk: '#7a5230', trunkDark: '#5a3818', treeDark: '#1e5c28', treeMid: '#2d7a35',
    treeLight: '#43a047', treePeak: '#5cc25c', treeShadow: '#164820',
    // Agua
    water1: '#4a90d9', water2: '#3a7cc4', water3: '#2e6aae', waterHi: '#7ab8ec', waterFoam: '#b8e0ff',
    // Arena
    sand1: '#f0e0a8', sand2: '#e4d098', sand3: '#d4bc82', sandDot: '#c4a86c',
    // Techos
    roofRed1: '#d04838', roofRed2: '#b03828', roofRed3: '#901c14',
    roofC1: '#e85848', roofC2: '#c84030',
    roofBlue1: '#4868c8', roofBlue2: '#3854a8', roofBlue3: '#2840888',
    // Pared / edificio
    wall1: '#e8e0d0', wall2: '#d8ccb8', wall3: '#c8baa0', wallLine: '#b8a890',
    winGlass: '#a0c8e8', winGlint: '#d8f0ff',
    // Puerta
    door1: '#6a4a2a', door2: '#54381e', doorKnob: '#e8c048',
    // Valla
    fence: '#c8a868', fenceDark: '#a8884a', fencePost: '#8a6a30',
    // Cartel
    sign: '#c8a868', signDark: '#8a6a3a', signPost: '#6a4a20',
    // Flores
    flower1: '#e84858', flower2: '#f8d048', flower3: '#e870a0', flowerCenter: '#fff8c0',
    // Montaña / roca
    rock1: '#8a7a6a', rock2: '#7a6a5a', rock3: '#6a5a4a', rockDark: '#4a3a2c',
    rockCrack: '#3a2a1c', rockSnow: '#f0f0f8', rockSnowShadow: '#d0d0e8',
    // Cueva
    cave1: '#3a3040', cave2: '#2a2030', cave3: '#1a1020', caveLight: '#504060',
    // Costa / orilla
    shore1: '#c8e8b8', shore2: '#a8c8a0', shoreWave: '#88c8e0',
    // Gym
    gym1: '#c8a828', gym2: '#e8c840', gym3: '#f8e060', gymDark: '#a88818',
    // Pokébola en suelo
    ballRed: '#e83030', ballWhite: '#f8f8f8',
    // Contorno
    outline: '#2a2a2a', outlineLight: '#4a4a4a',
};

const rect = (ctx, x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
};

// Círculo (para canopias de árboles)
const circle = (ctx, cx, cy, r, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
};

export const drawTile = (ctx, char, px, py, frame = 0, tick = 0) => {
    switch (char) {

        // ── Césped base ──────────────────────────────────────────────────────
        case '.': {
            rect(ctx, px, py, TILE, TILE, C.grass1);
            // Tres tonos de textura
            rect(ctx, px + 2,  py + 3,  2, 1, C.grass2);
            rect(ctx, px + 9,  py + 7,  2, 1, C.grassDot);
            rect(ctx, px + 5,  py + 11, 2, 1, C.grass2);
            rect(ctx, px + 13, py + 4,  1, 2, C.grassDot);
            rect(ctx, px + 0,  py + 13, 3, 1, C.grass3);
            rect(ctx, px + 12, py + 13, 4, 1, C.grass3);
            break;
        }

        // ── Flores (animadas) ─────────────────────────────────────────────────
        case ',': {
            rect(ctx, px, py, TILE, TILE, C.grass1);
            rect(ctx, px + 1, py + 12, 5, 1, C.grass2);
            rect(ctx, px + 10, py + 9, 5, 1, C.grass2);
            const s = (tick % 60 < 30) ? 0 : 1; // sway
            // Flor 1 (rosa)
            rect(ctx, px + 2 + s, py + 4,  2, 2, C.flower1);
            rect(ctx, px + 3 + s, py + 3,  1, 1, C.flower1);
            rect(ctx, px + 3 + s, py + 5,  1, 1, C.flower1);
            rect(ctx, px + 3 + s, py + 4,  1, 1, C.flowerCenter);
            // Flor 2 (amarilla)
            rect(ctx, px + 10 - s, py + 9,  2, 2, C.flower2);
            rect(ctx, px + 11 - s, py + 8,  1, 1, C.flower2);
            rect(ctx, px + 11 - s, py + 10, 1, 1, C.flower2);
            rect(ctx, px + 11 - s, py + 9,  1, 1, C.flowerCenter);
            // Flor 3 (lila)
            rect(ctx, px + 6, py + 13 - s, 2, 2, C.flower3);
            rect(ctx, px + 7, py + 12 - s, 1, 1, C.flower3);
            rect(ctx, px + 7, py + 14 - s, 1, 1, C.flower3);
            rect(ctx, px + 7, py + 13 - s, 1, 1, C.flowerCenter);
            break;
        }

        // ── Hierba alta (blade-shaped, con sway) ─────────────────────────────
        case 'G': {
            rect(ctx, px, py, TILE, TILE, C.tall1);
            const sw = (tick % 80 < 40) ? 0 : 1;
            // 4 briznas de hierba
            for (let i = 0; i < 4; i++) {
                const bx = px + 1 + i * 4;
                const sway = (i % 2 === 0) ? sw : -sw;
                // Tallo
                rect(ctx, bx + sway,     py + 6,  2, 10, C.tall2);
                // Hoja izquierda
                rect(ctx, bx - 1 + sway, py + 3,  1,  5, C.tall3);
                // Hoja derecha
                rect(ctx, bx + 2 + sway, py + 5,  1,  4, C.tall3);
                // Punta de la brizna
                rect(ctx, bx + sway,     py + 1,  2,  3, C.tallHi);
                rect(ctx, bx + 1 + sway, py,      1,  2, C.tallHi);
            }
            break;
        }

        // ── Camino / tierra ───────────────────────────────────────────────────
        case 'p': {
            rect(ctx, px, py, TILE, TILE, C.path1);
            rect(ctx, px, py + 15, TILE, 1, C.path3);
            rect(ctx, px + 15, py, 1, TILE, C.path3);
            // Piedras / guijarros
            rect(ctx, px + 3,  py + 4,  2, 1, C.pathPeb);
            rect(ctx, px + 10, py + 9,  2, 2, C.path2);
            rect(ctx, px + 6,  py + 13, 3, 1, C.pathPeb);
            rect(ctx, px + 1,  py + 11, 2, 2, C.path3);
            rect(ctx, px + 13, py + 3,  2, 1, C.pathPeb);
            break;
        }

        // ── Árbol (canopia circular con ctx.arc) ──────────────────────────────
        case 'T': {
            // Base de césped
            rect(ctx, px, py, TILE, TILE, C.grass2);
            // Tronco
            rect(ctx, px + 6, py + 10, 4, 6, C.trunk);
            rect(ctx, px + 7, py + 10, 2, 6, C.trunkDark);
            // Sombra de la canopia
            circle(ctx, px + 8, py + 7, 6.5, C.treeShadow);
            // Canopia (capas de verde)
            circle(ctx, px + 8, py + 6, 7, C.treeDark);
            circle(ctx, px + 8, py + 5, 6, C.treeMid);
            circle(ctx, px + 7, py + 4, 5, C.treeLight);
            circle(ctx, px + 6, py + 3, 3.5, C.treePeak);
            // Brillo (puntito claro arriba-izquierda)
            rect(ctx, px + 4, py + 2, 2, 1, '#7adc6a');
            break;
        }

        // ── Agua (animada, con olas y reflejos) ───────────────────────────────
        case 'w': {
            rect(ctx, px, py, TILE, TILE, C.water1);
            rect(ctx, px, py + 15, TILE, 1, C.water3);
            // Olas animadas
            const wf = tick % 60;
            const o1 = Math.floor(wf / 10) % 6;
            const o2 = Math.floor(wf / 8) % 8;
            // Ola 1
            rect(ctx, px + o1,         py + 3,  4, 1, C.waterHi);
            rect(ctx, px + o1 + 1,     py + 2,  2, 1, C.waterFoam);
            // Ola 2
            rect(ctx, px + 8 + (o1 % 4), py + 9,  3, 1, C.waterHi);
            // Ola 3 (va al revés)
            rect(ctx, px + 14 - o2,    py + 6,  3, 1, C.water2);
            // Reflejo de luz
            rect(ctx, px + 4,  py + 12, 5, 1, C.waterHi);
            rect(ctx, px + 11, py + 14, 3, 1, C.water2);
            break;
        }

        // ── Arena ─────────────────────────────────────────────────────────────
        case 's': {
            rect(ctx, px, py, TILE, TILE, C.sand1);
            // Textura granulada
            rect(ctx, px + 3,  py + 5,  2, 1, C.sand2);
            rect(ctx, px + 9,  py + 2,  1, 2, C.sand3);
            rect(ctx, px + 13, py + 9,  2, 1, C.sand2);
            rect(ctx, px + 5,  py + 12, 2, 1, C.sand3);
            rect(ctx, px + 1,  py + 8,  1, 1, C.sandDot);
            rect(ctx, px + 11, py + 14, 2, 1, C.sandDot);
            break;
        }

        // ── Techo rojo ────────────────────────────────────────────────────────
        case 'R': {
            rect(ctx, px, py, TILE, TILE, C.roofRed1);
            // Líneas de tejas
            rect(ctx, px, py,     TILE, 2, C.roofRed3);
            rect(ctx, px, py + 5, TILE, 2, C.roofRed2);
            rect(ctx, px, py + 10, TILE, 2, C.roofRed2);
            rect(ctx, px, py + 14, TILE, 2, C.roofRed3);
            // Detalle de borde
            rect(ctx, px, py, 2, TILE, C.roofRed2);
            rect(ctx, px + 14, py, 2, TILE, C.roofRed2);
            break;
        }

        // ── Techo Centro Pokémon ──────────────────────────────────────────────
        case 'C': {
            rect(ctx, px, py, TILE, TILE, C.roofC1);
            rect(ctx, px, py,     TILE, 2, C.roofC2);
            rect(ctx, px, py + 14, TILE, 2, C.roofC2);
            rect(ctx, px, py + 7,  TILE, 2, C.roofC2);
            // Cruz blanca del centro
            rect(ctx, px + 6, py + 3, 4, 10, '#fff');
            rect(ctx, px + 3, py + 6, 10, 4,  '#fff');
            rect(ctx, px + 7, py + 4, 2, 8,   '#ffe0e0');
            break;
        }

        // ── Techo azul (laboratorio) ──────────────────────────────────────────
        case 'B': {
            rect(ctx, px, py, TILE, TILE, C.roofBlue1);
            rect(ctx, px, py,      TILE, 2, C.roofBlue2);
            rect(ctx, px, py + 14, TILE, 2, C.roofBlue2);
            rect(ctx, px, py + 7,  TILE, 2, C.roofBlue2);
            rect(ctx, px, py,  2, TILE, C.roofBlue2);
            rect(ctx, px + 14, py, 2, TILE, C.roofBlue2);
            break;
        }

        // ── Pared con ventana ─────────────────────────────────────────────────
        case 'W': {
            rect(ctx, px, py, TILE, TILE, C.wall1);
            // Líneas de ladrillos
            rect(ctx, px, py + 7, TILE, 1, C.wallLine);
            rect(ctx, px, py + 14, TILE, 1, C.wallLine);
            rect(ctx, px + 7, py, 1, 7, C.wallLine);
            rect(ctx, px + 3, py + 8, 1, 6, C.wallLine);
            rect(ctx, px + 11, py + 8, 1, 6, C.wallLine);
            // Ventana (con reflejo / brillo de vidrio)
            rect(ctx, px + 2, py + 2, 5, 4, C.winGlass);
            rect(ctx, px + 3, py + 3, 1, 2, C.winGlint);
            rect(ctx, px + 2, py + 2, 5, 1, C.winGlint);
            rect(ctx, px + 6, py + 2, 1, 4, C.wallLine);
            rect(ctx, px + 2, py + 4, 5, 1, C.wallLine);
            break;
        }

        // ── Puerta ────────────────────────────────────────────────────────────
        case 'D': {
            rect(ctx, px, py, TILE, TILE, C.wall1);
            // Marco de la puerta
            rect(ctx, px + 2, py + 1, 12, TILE - 1, C.wallLine);
            // Puerta
            rect(ctx, px + 3, py + 2, 10, TILE - 2, C.door1);
            rect(ctx, px + 4, py + 3,  8, TILE - 4, C.door2);
            // Manija
            rect(ctx, px + 10, py + 9, 2, 2, C.doorKnob);
            // Panel de ventana en la puerta
            rect(ctx, px + 5, py + 4, 6, 4, '#a0c0e0');
            rect(ctx, px + 5, py + 4, 3, 1, '#d0e8f8');
            break;
        }

        // ── Cartel ────────────────────────────────────────────────────────────
        case 'S': {
            rect(ctx, px, py, TILE, TILE, C.grass1);
            // Poste
            rect(ctx, px + 7, py + 8, 2, 8, C.signPost);
            rect(ctx, px + 8, py + 8, 1, 8, C.signDark);
            // Tablón
            rect(ctx, px + 1, py + 2, 14, 8, C.sign);
            rect(ctx, px + 2, py + 3, 12, 6, '#e0b050');
            // Texto simulado
            rect(ctx, px + 3, py + 4, 10, 1, C.signDark);
            rect(ctx, px + 3, py + 6, 7,  1, C.signDark);
            // Borde del cartel
            rect(ctx, px + 1, py + 2, 14, 1, C.signDark);
            rect(ctx, px + 1, py + 9, 14, 1, C.signDark);
            rect(ctx, px + 1, py + 2, 1, 8, C.signDark);
            rect(ctx, px + 14, py + 2, 1, 8, C.signDark);
            break;
        }

        // ── Valla ─────────────────────────────────────────────────────────────
        case '=': {
            rect(ctx, px, py, TILE, TILE, C.grass1);
            // Poste izquierdo
            rect(ctx, px + 1, py + 3, 3, 12, C.fence);
            rect(ctx, px + 3, py + 3, 1, 12, C.fenceDark);
            // Poste derecho
            rect(ctx, px + 12, py + 3, 3, 12, C.fence);
            rect(ctx, px + 14, py + 3, 1, 12, C.fenceDark);
            // Tablón superior
            rect(ctx, px + 4, py + 5, 8, 3, C.fence);
            rect(ctx, px + 4, py + 7, 8, 1, C.fenceDark);
            // Tablón inferior
            rect(ctx, px + 4, py + 10, 8, 3, C.fence);
            rect(ctx, px + 4, py + 12, 8, 1, C.fenceDark);
            break;
        }

        // ── Objeto en suelo (Pokébola) ────────────────────────────────────────
        case 'i': {
            rect(ctx, px, py, TILE, TILE, C.grass1);
            // Sombra
            rect(ctx, px + 4, py + 14, 8, 1, '#3a7a1a');
            // Cuerpo rojo (mitad superior)
            rect(ctx, px + 4, py + 5, 8, 4, C.ballRed);
            rect(ctx, px + 3, py + 6, 10, 3, C.ballRed);
            // Franja negra central
            rect(ctx, px + 3, py + 8, 10, 2, C.outline);
            // Cuerpo blanco (mitad inferior)
            rect(ctx, px + 4, py + 9, 8, 4, C.ballWhite);
            rect(ctx, px + 3, py + 10, 10, 2, C.ballWhite);
            // Botón central
            rect(ctx, px + 7, py + 8, 2, 2, '#fff');
            rect(ctx, px + 7, py + 8, 1, 1, '#ddd');
            // Brillo en rojo
            rect(ctx, px + 5, py + 6, 2, 1, '#ff8070');
            break;
        }

        // ── Roca montañosa ────────────────────────────────────────────────────
        case '#': {
            rect(ctx, px, py, TILE, TILE, C.rock2);
            // Forma de roca con variación
            rect(ctx, px,      py,      TILE, TILE, C.rock2);
            rect(ctx, px + 2,  py,      12,   2,    C.rock1);
            rect(ctx, px,      py + 2,  2,    12,   C.rock1);
            rect(ctx, px + 12, py + 2,  4,    12,   C.rockDark);
            rect(ctx, px + 2,  py + 13, 10,   3,    C.rockDark);
            // Grietas
            rect(ctx, px + 5,  py + 3,  1,    6,    C.rockCrack);
            rect(ctx, px + 5,  py + 7,  4,    1,    C.rockCrack);
            rect(ctx, px + 10, py + 5,  1,    4,    C.rockCrack);
            // Resalte superior
            rect(ctx, px + 3,  py + 1,  4,    1,    '#a09080');
            break;
        }

        // ── Suelo de cueva ────────────────────────────────────────────────────
        case 'c': {
            rect(ctx, px, py, TILE, TILE, C.cave1);
            // Textura de piedra oscura
            rect(ctx, px,      py,      TILE, 1, C.cave2);
            rect(ctx, px,      py,      1,    TILE, C.cave2);
            rect(ctx, px + 4,  py + 5,  2,    1,   C.cave3);
            rect(ctx, px + 10, py + 10, 2,    1,   C.cave3);
            rect(ctx, px + 7,  py + 2,  1,    2,   C.caveLight);
            rect(ctx, px + 2,  py + 12, 3,    1,   C.caveLight);
            rect(ctx, px + 12, py + 7,  2,    1,   C.cave2);
            break;
        }

        // ── Orilla / agua poco profunda ───────────────────────────────────────
        case '~': {
            rect(ctx, px, py, TILE, TILE, C.shore1);
            // Ola suave animada
            const sf = (tick % 90);
            const so = Math.floor(sf / 15) % 3;
            rect(ctx, px + so,     py + 4,  5, 1, C.shoreWave);
            rect(ctx, px + 8 + so, py + 10, 5, 1, C.shoreWave);
            rect(ctx, px + 2,      py + 13, 4, 1, C.shore2);
            rect(ctx, px + 9,      py + 7,  4, 1, C.shore2);
            break;
        }

        // ── Cima de montaña (con nieve) ────────────────────────────────────────
        case 'm': {
            rect(ctx, px, py, TILE, TILE, C.rock2);
            // Roca
            rect(ctx, px + 2, py + 8, 12, 8, C.rock3);
            // Nieve
            rect(ctx, px + 4, py,     8,  10, C.rockSnow);
            rect(ctx, px + 2, py + 4, 12,  4, C.rockSnow);
            // Sombra de nieve
            rect(ctx, px + 2, py + 8,  12, 1, C.rockSnowShadow);
            // Grieta
            rect(ctx, px + 7, py + 5,  1,  4, C.rockCrack);
            break;
        }

        // ── Suelo del gimnasio ────────────────────────────────────────────────
        case 'g': {
            rect(ctx, px, py, TILE, TILE, C.gym1);
            // Patrón de losetas en damero
            const gx = (px / TILE) % 2, gy = (py / TILE) % 2;
            if ((gx + gy) % 2 === 0) {
                rect(ctx, px + 1, py + 1, 14, 14, C.gym2);
            } else {
                rect(ctx, px + 1, py + 1, 14, 14, C.gym3);
            }
            // Borde de loseta
            rect(ctx, px,      py,      TILE, 1, C.gymDark);
            rect(ctx, px,      py,      1,    TILE, C.gymDark);
            rect(ctx, px + 15, py,      1,    TILE, C.gymDark);
            rect(ctx, px,      py + 15, TILE, 1, C.gymDark);
            break;
        }

        // ── Default (césped) ──────────────────────────────────────────────────
        default:
            rect(ctx, px, py, TILE, TILE, C.grass1);
    }
};
