// src/data/regionMaps.js
// Mapas ORIGINALES y estilizados por región — no son una copia de los mapas
// oficiales del juego (esos son propiedad de Nintendo/Game Freak/The Pokémon
// Company y no podemos redistribuirlos). Son un diagrama propio: ciudades,
// rutas y mazmorras como nodos conectados, en una disposición simplificada
// que respeta el orden/adyacencia general conocido de cada región, pero sin
// calcar el trazado real de los juegos.
//
// Cada nodo tiene "aliases": variantes de nombre esperadas desde PokeAPI
// (ya humanizadas, ej. "Viridian Forest") para poder emparejar el área real
// devuelta por la API con el nodo correcto del mapa.
//
// viewBox lógico: 0-100 en ambos ejes (porcentaje), independiente del tamaño
// real en pantalla.

const T = { town: 'town', route: 'route', dungeon: 'dungeon' };

export const REGION_MAPS = {
    kanto: {
        label: 'Kanto',
        nodes: [
            { id: 'pallet',    name: 'Pallet Town',      aliases: ['Pallet Town'],                         type: T.town,    x: 10, y: 88 },
            { id: 'r1',        name: 'Route 1',          aliases: ['Route 1'],                              type: T.route,   x: 10, y: 74 },
            { id: 'viridian',  name: 'Viridian City',    aliases: ['Viridian City'],                        type: T.town,    x: 10, y: 60 },
            { id: 'r2',        name: 'Route 2',          aliases: ['Route 2'],                              type: T.route,   x: 10, y: 46 },
            { id: 'vforest',   name: 'Viridian Forest',  aliases: ['Viridian Forest'],                      type: T.dungeon, x: 22, y: 42 },
            { id: 'pewter',    name: 'Pewter City',      aliases: ['Pewter City'],                          type: T.town,    x: 10, y: 30 },
            { id: 'r3',        name: 'Route 3',          aliases: ['Route 3'],                              type: T.route,   x: 26, y: 26 },
            { id: 'mtmoon',    name: 'Mt. Moon',         aliases: ['Mt Moon', 'Mount Moon'],                type: T.dungeon, x: 40, y: 22 },
            { id: 'r4',        name: 'Route 4',          aliases: ['Route 4'],                              type: T.route,   x: 54, y: 22 },
            { id: 'cerulean',  name: 'Cerulean City',    aliases: ['Cerulean City'],                        type: T.town,    x: 66, y: 22 },
            { id: 'r24',       name: 'Route 24',         aliases: ['Route 24'],                             type: T.route,   x: 66, y: 10 },
            { id: 'r9',        name: 'Route 9',          aliases: ['Route 9'],                              type: T.route,   x: 80, y: 22 },
            { id: 'rocktunnel',name: 'Rock Tunnel',      aliases: ['Rock Tunnel'],                          type: T.dungeon, x: 80, y: 34 },
            { id: 'r10',       name: 'Route 10',         aliases: ['Route 10'],                             type: T.route,   x: 80, y: 46 },
            { id: 'lavender',  name: 'Lavender Town',    aliases: ['Lavender Town'],                        type: T.town,    x: 80, y: 58 },
            { id: 'r8',        name: 'Route 8',          aliases: ['Route 8'],                              type: T.route,   x: 66, y: 34 },
            { id: 'saffron',   name: 'Saffron City',     aliases: ['Saffron City'],                         type: T.town,    x: 54, y: 34 },
            { id: 'r7',        name: 'Route 7',          aliases: ['Route 7'],                              type: T.route,   x: 42, y: 34 },
            { id: 'celadon',   name: 'Celadon City',     aliases: ['Celadon City'],                         type: T.town,    x: 30, y: 34 },
            { id: 'r6',        name: 'Route 6',          aliases: ['Route 6'],                              type: T.route,   x: 54, y: 46 },
            { id: 'vermilion', name: 'Vermilion City',   aliases: ['Vermilion City'],                       type: T.town,    x: 54, y: 58 },
            { id: 'r11',       name: 'Route 11',         aliases: ['Route 11'],                             type: T.route,   x: 66, y: 58 },
            { id: 'digcave',   name: "Diglett's Cave",   aliases: ["Digletts Cave", "Diglett's Cave"],      type: T.dungeon, x: 40, y: 58 },
            { id: 'r12',       name: 'Route 12',         aliases: ['Route 12'],                             type: T.route,   x: 80, y: 70 },
            { id: 'r13',       name: 'Route 13',         aliases: ['Route 13'],                             type: T.route,   x: 68, y: 76 },
            { id: 'r14',       name: 'Route 14',         aliases: ['Route 14'],                             type: T.route,   x: 56, y: 76 },
            { id: 'r15',       name: 'Route 15',         aliases: ['Route 15'],                             type: T.route,   x: 44, y: 76 },
            { id: 'fuchsia',   name: 'Fuchsia City',     aliases: ['Fuchsia City'],                         type: T.town,    x: 44, y: 88 },
            { id: 'safari',    name: 'Safari Zone',      aliases: ['Safari Zone'],                          type: T.dungeon, x: 56, y: 88 },
            { id: 'seafoam',   name: 'Seafoam Islands',  aliases: ['Seafoam Islands'],                      type: T.dungeon, x: 28, y: 88 },
            { id: 'cinnabar',  name: 'Cinnabar Island',  aliases: ['Cinnabar Island'],                      type: T.town,    x: 16, y: 96 },
            { id: 'r22',       name: 'Route 22',         aliases: ['Route 22'],                             type: T.route,   x: 2,  y: 74 },
            { id: 'victory',   name: 'Victory Road',     aliases: ['Victory Road'],                         type: T.dungeon, x: 2,  y: 62 },
            { id: 'plateau',   name: 'Indigo Plateau',   aliases: ['Indigo Plateau'],                       type: T.town,    x: 2,  y: 50 },
            { id: 'ccave',     name: 'Cerulean Cave',    aliases: ['Cerulean Cave'],                        type: T.dungeon, x: 78, y: 10 },
            { id: 'plant',     name: 'Power Plant',      aliases: ['Power Plant'],                          type: T.dungeon, x: 92, y: 22 },
        ],
        paths: [
            ['pallet','r1'], ['r1','viridian'], ['viridian','r2'], ['r2','vforest'], ['r2','pewter'],
            ['pewter','r3'], ['r3','mtmoon'], ['mtmoon','r4'], ['r4','cerulean'],
            ['cerulean','r24'], ['r24','plateau'], ['plateau','victory'], ['victory','r22'], ['r22','viridian'],
            ['cerulean','r9'], ['r9','rocktunnel'], ['rocktunnel','r10'], ['r10','lavender'],
            ['cerulean','r8'], ['r8','saffron'], ['saffron','r7'], ['r7','celadon'],
            ['saffron','r6'], ['r6','vermilion'], ['vermilion','r11'], ['r11','digcave'], ['digcave','pewter'],
            ['vermilion','r12'], ['r12','r13'], ['r13','r14'], ['r14','r15'], ['r15','fuchsia'],
            ['fuchsia','safari'], ['fuchsia','seafoam'], ['seafoam','cinnabar'],
            ['saffron','plant'], ['cerulean','ccave'],
        ],
    },

    teselia: {
        label: 'Teselia',
        nodes: [
            { id: 'nuvema',    name: 'Nuvema Town',      aliases: ['Nuvema Town'],                          type: T.town,    x: 10, y: 90 },
            { id: 'r1t',       name: 'Route 1',          aliases: ['Route 1'],                              type: T.route,   x: 10, y: 76 },
            { id: 'accumula',  name: 'Accumula Town',    aliases: ['Accumula Town'],                        type: T.town,    x: 10, y: 62 },
            { id: 'r2t',       name: 'Route 2',          aliases: ['Route 2'],                              type: T.route,   x: 22, y: 56 },
            { id: 'striaton',  name: 'Striaton City',    aliases: ['Striaton City'],                        type: T.town,    x: 34, y: 50 },
            { id: 'dreamyard',name: 'Dreamyard',         aliases: ['Dreamyard'],                            type: T.dungeon, x: 34, y: 38 },
            { id: 'r3t',       name: 'Route 3',          aliases: ['Route 3'],                              type: T.route,   x: 48, y: 50 },
            { id: 'wellspring',name: 'Wellspring Cave',  aliases: ['Wellspring Cave'],                      type: T.dungeon, x: 48, y: 38 },
            { id: 'nacrene',   name: 'Nacrene City',     aliases: ['Nacrene City'],                         type: T.town,    x: 62, y: 50 },
            { id: 'pinwheel',  name: 'Pinwheel Forest',  aliases: ['Pinwheel Forest'],                      type: T.dungeon, x: 62, y: 38 },
            { id: 'r4t',       name: 'Route 4',          aliases: ['Route 4'],                              type: T.route,   x: 76, y: 50 },
            { id: 'desertresort', name: 'Desert Resort', aliases: ['Desert Resort'],                        type: T.dungeon, x: 90, y: 44 },
            { id: 'castelia',  name: 'Castelia City',    aliases: ['Castelia City'],                        type: T.town,    x: 76, y: 62 },
            { id: 'r5t',       name: 'Route 5',          aliases: ['Route 5'],                              type: T.route,   x: 76, y: 74 },
            { id: 'nimbasa',   name: 'Nimbasa City',     aliases: ['Nimbasa City'],                         type: T.town,    x: 76, y: 86 },
            { id: 'r16',       name: 'Route 16',         aliases: ['Route 16'],                             type: T.route,   x: 62, y: 86 },
            { id: 'lostwoods', name: 'Lostlorn Forest',  aliases: ['Lostlorn Forest'],                      type: T.dungeon, x: 50, y: 86 },
            { id: 'r6t',       name: 'Route 6',          aliases: ['Route 6'],                              type: T.route,   x: 62, y: 74 },
            { id: 'chargestone',name:'Chargestone Cave', aliases: ['Chargestone Cave'],                     type: T.dungeon, x: 50, y: 68 },
            { id: 'mistralton',name: 'Mistralton City',  aliases: ['Mistralton City'],                      type: T.town,    x: 38, y: 68 },
            { id: 'r7t',       name: 'Route 7',          aliases: ['Route 7'],                              type: T.route,   x: 38, y: 80 },
            { id: 'celestial', name: 'Celestial Tower',  aliases: ['Celestial Tower'],                      type: T.dungeon, x: 26, y: 80 },
            { id: 'twist',     name: 'Twist Mountain',   aliases: ['Twist Mountain'],                       type: T.dungeon, x: 26, y: 68 },
            { id: 'icirrus',   name: 'Icirrus City',     aliases: ['Icirrus City'],                         type: T.town,    x: 14, y: 68 },
            { id: 'dragonspiral', name: 'Dragonspiral Tower', aliases: ['Dragonspiral Tower'],               type: T.dungeon, x: 14, y: 56 },
            { id: 'r8t',       name: 'Route 8',          aliases: ['Route 8'],                              type: T.route,   x: 90, y: 62 },
            { id: 'anville',   name: 'Anville Town',     aliases: ['Anville Town'],                         type: T.town,    x: 90, y: 74 },
            { id: 'giantchasm',name: 'Giant Chasm',      aliases: ['Giant Chasm'],                          type: T.dungeon, x: 90, y: 30 },
            { id: 'r22t',      name: 'Route 22',         aliases: ['Route 22'],                             type: T.route,   x: 22, y: 44 },
            { id: 'victoryroad2', name: 'Victory Road',  aliases: ['Victory Road'],                         type: T.dungeon, x: 22, y: 32 },
            { id: 'plateau2',  name: 'Pokémon League',   aliases: ['Pokemon League', 'Pokémon League'],     type: T.town,    x: 22, y: 20 },
        ],
        paths: [
            ['nuvema','r1t'], ['r1t','accumula'], ['accumula','r2t'], ['r2t','striaton'],
            ['striaton','dreamyard'], ['striaton','r3t'], ['r3t','wellspring'], ['r3t','nacrene'],
            ['nacrene','pinwheel'], ['nacrene','r4t'], ['r4t','castelia'], ['r4t','desertresort'],
            ['castelia','r5t'], ['r5t','nimbasa'], ['nimbasa','r16'], ['r16','lostwoods'],
            ['nimbasa','r6t'], ['r6t','chargestone'], ['chargestone','mistralton'], ['mistralton','r7t'],
            ['r7t','celestial'], ['celestial','twist'], ['twist','icirrus'], ['icirrus','dragonspiral'],
            ['castelia','r8t'], ['r8t','anville'], ['r8t','giantchasm'],
            ['accumula','r22t'], ['r22t','victoryroad2'], ['victoryroad2','plateau2'],
        ],
    },
};

export const hasRegionMap = (regionId) => Boolean(REGION_MAPS[regionId]);

// Empareja el nombre de área humanizado que llega de PokeAPI con un nodo del
// mapa: normaliza (minúsculas, sin tildes, sin sufijos de piso/número al
// final) y compara contra los alias de cada nodo.
const normalize = (str) => str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/\b(b?\d+f|floor \d+)\b/g, '') // solo sufijos de piso (b1f, floor 2...); conserva numeros de ruta
    .replace(/\s+/g, ' ')
    .trim();

export const matchAreaToNode = (regionId, areaName) => {
    const map = REGION_MAPS[regionId];
    if (!map) return null;
    const target = normalize(areaName);
    return map.nodes.find(node =>
        node.aliases.some(alias => normalize(alias) === target)
    ) || null;
};
