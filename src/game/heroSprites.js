// src/game/heroSprites.js
// Sprites pixel-art del héroe (12×16), estilo GBA. Paletas intercambiables.
// Claves: . transparente  O contorno  S piel  H pelo  C gorra/camisa  P pantalón  W blanco

const MALE_DOWN = [
    '...OOOOOO...',
    '..OCCCCCCO..',
    '.OCCCCCCCCO.',
    '.OHHCCCCHHO.',
    '.OSSSSSSSSO.',
    '.OSOSSSSOSO.',
    '..OSSSSSSO..',
    '...OSSSSO...',
    '..OCCCCCCO..',
    '.OCCCCCCCCO.',
    '.OSOCCCCOSO.',
    '..OPPPPPPO..',
    '..OPPOOPPO..',
    '..OPPOOPPO..',
    '..OOO..OOO..',
    '............',
];

const MALE_UP = [
    '...OOOOOO...',
    '..OCCCCCCO..',
    '.OCCCCCCCCO.',
    '.OHHHHHHHHO.',
    '.OHHHHHHHHO.',
    '.OHHHHHHHHO.',
    '..OHHHHHHO..',
    '...OSSSSO...',
    '..OCCCCCCO..',
    '.OCCCCCCCCO.',
    '.OSOCCCCOSO.',
    '..OPPPPPPO..',
    '..OPPOOPPO..',
    '..OPPOOPPO..',
    '..OOO..OOO..',
    '............',
];

const MALE_LEFT = [
    '...OOOOOO...',
    '..OCCCCCCO..',
    '.OCCCCCCCCO.',
    '.OHHCCCCHHO.',
    '.OSSSSSSHHO.',
    '.OOSSSSSHOO.',
    '..OSSSSSHO..',
    '...OSSSSO...',
    '..OCCCCCCO..',
    '..OCCCCCCO..',
    '..OSCCCCOO..',
    '..OPPPPPPO..',
    '..OPPPOPPO..',
    '..OPPOOPPO..',
    '..OOO.OOO...',
    '............',
];

const FEMALE_DOWN = [
    '...OOOOOO...',
    '..OCCCCCCO..',
    '.OHCCCCCCHO.',
    'OHHHCCCCHHHO',
    'OHSSSSSSSSHO',
    'OHSOSSSSOSHO',
    'OH.OSSSSO.HO',
    '.O.OSSSSO.O.',
    '..OCCCCCCO..',
    '.OCCCCCCCCO.',
    '.OSOCCCCOSO.',
    '..OPPPPPPO..',
    '.OPPPPPPPPO.',
    '..OSSOOSSO..',
    '..OOO..OOO..',
    '............',
];

const FEMALE_UP = [
    '...OOOOOO...',
    '..OCCCCCCO..',
    '.OHCCCCCCHO.',
    'OHHHHHHHHHHO',
    'OHHHHHHHHHHO',
    'OHHHHHHHHHHO',
    'OH.HHHHHH.HO',
    '.O.OSSSSO.O.',
    '..OCCCCCCO..',
    '.OCCCCCCCCO.',
    '.OSOCCCCOSO.',
    '..OPPPPPPO..',
    '.OPPPPPPPPO.',
    '..OSSOOSSO..',
    '..OOO..OOO..',
    '............',
];

const FEMALE_LEFT = [
    '...OOOOOO...',
    '..OCCCCCCO..',
    '.OHCCCCCCHO.',
    '.OHHCCCCHHO.',
    '.OSSSSSHHHO.',
    '.OOSSSSHHHO.',
    '..OSSSSHHO..',
    '...OSSSSO...',
    '..OCCCCCCO..',
    '..OCCCCCCO..',
    '..OSCCCCOO..',
    '..OPPPPPPO..',
    '..OPPPPPPO..',
    '..OSSOOSSO..',
    '..OOO.OOO...',
    '............',
];

const SPRITES = {
    m: { down: MALE_DOWN, up: MALE_UP, left: MALE_LEFT },
    f: { down: FEMALE_DOWN, up: FEMALE_UP, left: FEMALE_LEFT },
};

const SKIN = '#f0c8a0';
const OUTLINE = '#2a2a2a';
const SHOE = '#5a4a3a';

// Dibuja el héroe en (px, py) — tamaño 12×16 px. dir: down|up|left|right
export const drawHero = (ctx, gender, palette, dir, px, py, step = 0) => {
    const flip = dir === 'right';
    const matrix = SPRITES[gender][flip ? 'left' : dir] || SPRITES[gender].down;
    const bob = step % 2 === 1 ? 1 : 0; // pequeño rebote al caminar

    for (let row = 0; row < matrix.length; row++) {
        const line = matrix[row];
        for (let col = 0; col < line.length; col++) {
            const ch = line[col];
            if (ch === '.') continue;
            let color;
            switch (ch) {
                case 'O': color = OUTLINE; break;
                case 'S': color = row >= 13 ? SHOE : SKIN; break;
                case 'H': color = palette.hair; break;
                case 'C': color = row <= 3 ? palette.cap : palette.shirt; break;
                case 'P': color = palette.pants; break;
                case 'W': color = '#f8f8f8'; break;
                default: continue;
            }
            const dx = flip ? (line.length - 1 - col) : col;
            ctx.fillStyle = color;
            ctx.fillRect(px + dx, py + row + bob, 1, 1);
        }
    }
};
