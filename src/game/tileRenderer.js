// src/game/tileRenderer.js
// Dibuja tiles 16×16 estilo GBA (Verde Hoja / Esmeralda) con primitivas de canvas
export const TILE = 16;

const C = {
    grass1: '#7ac74c', grass2: '#6db542', grassDot: '#5ea636',
    tall1: '#3e8e2f', tall2: '#34782a', tallHi: '#52a83e',
    path1: '#e8d8a0', path2: '#dcc98c', pathDot: '#c9b478',
    treeTrunk: '#7a5230', treeDark: '#1e5c28', treeMid: '#2d7a35', treeLight: '#43a047',
    water1: '#4a90d9', water2: '#3a7cc4', waterHi: '#7ab8ec',
    sand1: '#f0e0b0', sand2: '#e4d29c',
    roofRed1: '#d04838', roofRed2: '#b03828', roofBlue1: '#4868c8', roofBlue2: '#3854a8',
    roofC1: '#e85848', roofC2: '#c84030',
    wall1: '#e8e0d0', wall2: '#d8ccb8', wallLine: '#b8a890',
    door1: '#6a4a2a', door2: '#54381e',
    fence: '#c8a868', fenceDark: '#a8884a',
    sign: '#c8a868', signDark: '#8a6a3a',
    flower1: '#e84858', flower2: '#f8d048',
    outline: '#2a2a2a',
};

const rect = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };

export const drawTile = (ctx, char, px, py, frame = 0) => {
    switch (char) {
        case '.': { // césped
            rect(ctx, px, py, TILE, TILE, C.grass1);
            rect(ctx, px + 3, py + 4, 2, 1, C.grassDot);
            rect(ctx, px + 10, py + 9, 2, 1, C.grassDot);
            rect(ctx, px + 6, py + 13, 2, 1, C.grass2);
            break;
        }
        case ',': { // flores (anima 2 frames)
            rect(ctx, px, py, TILE, TILE, C.grass1);
            const sway = frame % 2;
            rect(ctx, px + 3 + sway, py + 3, 3, 3, C.flower1);
            rect(ctx, px + 4 + sway, py + 4, 1, 1, C.flower2);
            rect(ctx, px + 10 - sway, py + 9, 3, 3, C.flower2);
            rect(ctx, px + 11 - sway, py + 10, 1, 1, C.flower1);
            break;
        }
        case 'G': { // hierba alta
            rect(ctx, px, py, TILE, TILE, C.tall1);
            for (let i = 0; i < 4; i++) {
                const gx = px + 1 + i * 4;
                rect(ctx, gx, py + 4, 2, 11, C.tall2);
                rect(ctx, gx + 1, py + 2, 1, 4, C.tallHi);
            }
            break;
        }
        case 'p': { // camino
            rect(ctx, px, py, TILE, TILE, C.path1);
            rect(ctx, px + 2, py + 3, 2, 2, C.pathDot);
            rect(ctx, px + 11, py + 8, 2, 2, C.path2);
            rect(ctx, px + 5, py + 12, 2, 1, C.pathDot);
            break;
        }
        case 'T': { // árbol
            rect(ctx, px, py, TILE, TILE, C.grass2);
            rect(ctx, px + 6, py + 11, 4, 5, C.treeTrunk);
            rect(ctx, px + 1, py + 4, 14, 8, C.treeMid);
            rect(ctx, px + 3, py + 1, 10, 5, C.treeLight);
            rect(ctx, px + 2, py + 9, 12, 3, C.treeDark);
            rect(ctx, px + 4, py + 2, 3, 2, '#5cc25c');
            break;
        }
        case 'w': { // agua (anima)
            rect(ctx, px, py, TILE, TILE, C.water1);
            const o = (frame % 2) * 2;
            rect(ctx, px + 2 + o, py + 4, 4, 1, C.waterHi);
            rect(ctx, px + 9 - o, py + 10, 4, 1, C.water2);
            rect(ctx, px + 5, py + 14, 4, 1, C.waterHi);
            break;
        }
        case 's': { // arena
            rect(ctx, px, py, TILE, TILE, C.sand1);
            rect(ctx, px + 4, py + 5, 2, 1, C.sand2);
            rect(ctx, px + 10, py + 11, 2, 1, C.sand2);
            break;
        }
        case 'R': case 'C': { // techo rojo / centro pokémon
            const a = char === 'R' ? C.roofRed1 : C.roofC1;
            const b = char === 'R' ? C.roofRed2 : C.roofC2;
            rect(ctx, px, py, TILE, TILE, a);
            rect(ctx, px, py + 12, TILE, 4, b);
            rect(ctx, px, py, TILE, 2, b);
            if (char === 'C') { // cruz blanca del centro
                rect(ctx, px + 6, py + 4, 4, 8, '#fff');
                rect(ctx, px + 4, py + 6, 8, 4, '#fff');
            }
            break;
        }
        case 'B': { // techo azul (laboratorio)
            rect(ctx, px, py, TILE, TILE, C.roofBlue1);
            rect(ctx, px, py + 12, TILE, 4, C.roofBlue2);
            rect(ctx, px, py, TILE, 2, C.roofBlue2);
            break;
        }
        case 'W': { // pared
            rect(ctx, px, py, TILE, TILE, C.wall1);
            rect(ctx, px, py + 7, TILE, 1, C.wallLine);
            rect(ctx, px + 7, py, 1, TILE, C.wallLine);
            rect(ctx, px + 2, py + 2, 4, 4, '#a8c8e8'); // ventana
            break;
        }
        case 'D': { // puerta
            rect(ctx, px, py, TILE, TILE, C.wall1);
            rect(ctx, px + 3, py + 2, 10, 14, C.door1);
            rect(ctx, px + 4, py + 3, 8, 12, C.door2);
            rect(ctx, px + 10, py + 8, 2, 2, '#e8c048');
            break;
        }
        case 'S': { // cartel
            rect(ctx, px, py, TILE, TILE, C.grass1);
            rect(ctx, px + 7, py + 9, 2, 6, C.signDark);
            rect(ctx, px + 2, py + 3, 12, 7, C.sign);
            rect(ctx, px + 3, py + 4, 10, 5, C.signDark);
            rect(ctx, px + 4, py + 5, 8, 1, C.sign);
            rect(ctx, px + 4, py + 7, 6, 1, C.sign);
            break;
        }
        case '=': { // valla
            rect(ctx, px, py, TILE, TILE, C.grass1);
            rect(ctx, px, py + 6, TILE, 3, C.fence);
            rect(ctx, px + 2, py + 4, 3, 9, C.fence);
            rect(ctx, px + 11, py + 4, 3, 9, C.fence);
            rect(ctx, px + 2, py + 12, 3, 1, C.fenceDark);
            rect(ctx, px + 11, py + 12, 3, 1, C.fenceDark);
            break;
        }
        case 'i': { // pokébola en el suelo
            rect(ctx, px, py, TILE, TILE, C.grass1);
            rect(ctx, px + 4, py + 5, 8, 4, '#e83030');
            rect(ctx, px + 4, py + 9, 8, 4, '#f8f8f8');
            rect(ctx, px + 4, py + 8, 8, 2, C.outline);
            rect(ctx, px + 7, py + 8, 2, 2, '#fff');
            break;
        }
        default:
            rect(ctx, px, py, TILE, TILE, C.grass1);
    }
};
