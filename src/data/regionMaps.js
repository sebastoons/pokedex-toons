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

    johto: {
        label: 'Johto',
        nodes: [
            { id: 'newbark',     name: 'New Bark Town',   aliases: ['New Bark Town'],   type: T.town,    x: 12, y: 92 },
            { id: 'r29',         name: 'Route 29',        aliases: ['Route 29'],        type: T.route,   x: 12, y: 78 },
            { id: 'cherrygrove', name: 'Cherrygrove City',aliases: ['Cherrygrove City'],type: T.town,    x: 12, y: 64 },
            { id: 'r31',         name: 'Route 31',        aliases: ['Route 31'],        type: T.route,   x: 12, y: 50 },
            { id: 'violet',      name: 'Violet City',     aliases: ['Violet City'],     type: T.town,    x: 12, y: 36 },
            { id: 'r32',         name: 'Route 32',        aliases: ['Route 32'],        type: T.route,   x: 12, y: 22 },
            { id: 'unioncave',   name: 'Union Cave',      aliases: ['Union Cave'],      type: T.dungeon, x: 26, y: 22 },
            { id: 'r33',         name: 'Route 33',        aliases: ['Route 33'],        type: T.route,   x: 40, y: 22 },
            { id: 'azalea',      name: 'Azalea Town',     aliases: ['Azalea Town'],     type: T.town,    x: 54, y: 22 },
            { id: 'r34',         name: 'Route 34',        aliases: ['Route 34'],        type: T.route,   x: 54, y: 36 },
            { id: 'goldenrod',   name: 'Goldenrod City',  aliases: ['Goldenrod City'],  type: T.town,    x: 54, y: 50 },
            { id: 'r35',         name: 'Route 35',        aliases: ['Route 35'],        type: T.route,   x: 54, y: 64 },
            { id: 'natlpark',    name: 'National Park',   aliases: ['National Park'],   type: T.dungeon, x: 40, y: 64 },
            { id: 'r36',         name: 'Route 36',        aliases: ['Route 36'],        type: T.route,   x: 40, y: 50 },
            { id: 'r37',         name: 'Route 37',        aliases: ['Route 37'],        type: T.route,   x: 40, y: 36 },
            { id: 'ecruteak',    name: 'Ecruteak City',   aliases: ['Ecruteak City'],   type: T.town,    x: 26, y: 36 },
            { id: 'r38',         name: 'Route 38',        aliases: ['Route 38'],        type: T.route,   x: 26, y: 50 },
            { id: 'olivine',     name: 'Olivine City',    aliases: ['Olivine City'],    type: T.town,    x: 26, y: 64 },
            { id: 'r39',         name: 'Route 39',        aliases: ['Route 39'],        type: T.route,   x: 26, y: 78 },
            { id: 'cianwood',    name: 'Cianwood City',   aliases: ['Cianwood City'],   type: T.town,    x: 26, y: 92 },
            { id: 'r40',         name: 'Route 40',        aliases: ['Route 40'],        type: T.route,   x: 40, y: 78 },
            { id: 'lakeofrage',  name: 'Lake of Rage',    aliases: ['Lake Of Rage'],    type: T.dungeon, x: 54, y: 78 },
            { id: 'r42',         name: 'Route 42',        aliases: ['Route 42'],        type: T.route,   x: 68, y: 78 },
            { id: 'mahogany',    name: 'Mahogany Town',   aliases: ['Mahogany Town'],   type: T.town,    x: 68, y: 64 },
            { id: 'r44',         name: 'Route 44',        aliases: ['Route 44'],        type: T.route,   x: 68, y: 50 },
            { id: 'blackthorn',  name: 'Blackthorn City', aliases: ['Blackthorn City'], type: T.town,    x: 68, y: 36 },
            { id: 'dragonsden',  name: "Dragon's Den",    aliases: ["Dragons Den", "Dragon's Den"], type: T.dungeon, x: 68, y: 22 },
            { id: 'icepath',     name: 'Ice Path',        aliases: ['Ice Path'],        type: T.dungeon, x: 82, y: 36 },
            { id: 'mtmortar',    name: 'Mt. Mortar',      aliases: ['Mt Mortar', 'Mount Mortar'], type: T.dungeon, x: 82, y: 50 },
        ],
        paths: [
            ['newbark','r29'], ['r29','cherrygrove'], ['cherrygrove','r31'], ['r31','violet'],
            ['violet','r32'], ['r32','unioncave'], ['unioncave','r33'], ['r33','azalea'],
            ['azalea','r34'], ['r34','goldenrod'], ['goldenrod','r35'], ['r35','natlpark'],
            ['natlpark','r36'], ['r36','r37'], ['r37','ecruteak'], ['ecruteak','r38'],
            ['r38','olivine'], ['olivine','r39'], ['r39','cianwood'], ['olivine','r40'],
            ['r40','lakeofrage'], ['lakeofrage','r42'], ['r42','mahogany'], ['mahogany','r44'],
            ['r44','blackthorn'], ['blackthorn','dragonsden'], ['blackthorn','icepath'], ['mahogany','mtmortar'],
        ],
    },

    hoenn: {
        label: 'Hoenn',
        nodes: [
            { id: 'littleroot',  name: 'Littleroot Town', aliases: ['Littleroot Town'], type: T.town,    x: 12, y: 92 },
            { id: 'r101',        name: 'Route 101',       aliases: ['Route 101'],       type: T.route,   x: 12, y: 78 },
            { id: 'oldale',      name: 'Oldale Town',     aliases: ['Oldale Town'],     type: T.town,    x: 12, y: 64 },
            { id: 'r102',        name: 'Route 102',       aliases: ['Route 102'],       type: T.route,   x: 12, y: 50 },
            { id: 'petalburg',   name: 'Petalburg City',  aliases: ['Petalburg City'],  type: T.town,    x: 12, y: 36 },
            { id: 'rustboro',    name: 'Rustboro City',   aliases: ['Rustboro City'],   type: T.town,    x: 12, y: 22 },
            { id: 'r116',        name: 'Route 116',       aliases: ['Route 116'],       type: T.route,   x: 26, y: 22 },
            { id: 'meteorfalls', name: 'Meteor Falls',    aliases: ['Meteor Falls'],    type: T.dungeon, x: 40, y: 22 },
            { id: 'fallarbor',   name: 'Fallarbor Town',  aliases: ['Fallarbor Town'],  type: T.town,    x: 54, y: 22 },
            { id: 'r113',        name: 'Route 113',       aliases: ['Route 113'],       type: T.route,   x: 68, y: 22 },
            { id: 'lavaridge',   name: 'Lavaridge Town',  aliases: ['Lavaridge Town'],  type: T.town,    x: 82, y: 22 },
            { id: 'r111',        name: 'Route 111',       aliases: ['Route 111'],       type: T.route,   x: 82, y: 36 },
            { id: 'mauville',    name: 'Mauville City',   aliases: ['Mauville City'],   type: T.town,    x: 82, y: 50 },
            { id: 'r117',        name: 'Route 117',       aliases: ['Route 117'],       type: T.route,   x: 82, y: 64 },
            { id: 'verdanturf',  name: 'Verdanturf Town', aliases: ['Verdanturf Town'], type: T.town,    x: 82, y: 78 },
            { id: 'r118',        name: 'Route 118',       aliases: ['Route 118'],       type: T.route,   x: 68, y: 78 },
            { id: 'fortree',     name: 'Fortree City',    aliases: ['Fortree City'],    type: T.town,    x: 54, y: 78 },
            { id: 'r119',        name: 'Route 119',       aliases: ['Route 119'],       type: T.route,   x: 54, y: 64 },
            { id: 'lilycove',    name: 'Lilycove City',   aliases: ['Lilycove City'],   type: T.town,    x: 54, y: 50 },
            { id: 'r124',        name: 'Route 124',       aliases: ['Route 124'],       type: T.route,   x: 54, y: 36 },
            { id: 'sootopolis',  name: 'Sootopolis City', aliases: ['Sootopolis City'], type: T.town,    x: 68, y: 36 },
            { id: 'mtpyre',      name: 'Mt. Pyre',        aliases: ['Mt Pyre', 'Mount Pyre'], type: T.dungeon, x: 40, y: 50 },
            { id: 'r105',        name: 'Route 105',       aliases: ['Route 105'],       type: T.route,   x: 26, y: 36 },
            { id: 'dewford',     name: 'Dewford Town',    aliases: ['Dewford Town'],    type: T.town,    x: 26, y: 50 },
            { id: 'victoryroad', name: 'Victory Road',    aliases: ['Victory Road'],    type: T.dungeon, x: 26, y: 64 },
            { id: 'evergrande',  name: 'Ever Grande City',aliases: ['Ever Grande City'],type: T.town,    x: 26, y: 78 },
        ],
        paths: [
            ['littleroot','r101'], ['r101','oldale'], ['oldale','r102'], ['r102','petalburg'],
            ['petalburg','rustboro'], ['rustboro','r116'], ['r116','meteorfalls'], ['meteorfalls','fallarbor'],
            ['fallarbor','r113'], ['r113','lavaridge'], ['lavaridge','r111'], ['r111','mauville'],
            ['mauville','r117'], ['r117','verdanturf'], ['verdanturf','r118'], ['r118','fortree'],
            ['fortree','r119'], ['r119','lilycove'], ['lilycove','r124'], ['r124','sootopolis'],
            ['lilycove','mtpyre'], ['petalburg','r105'], ['r105','dewford'], ['dewford','victoryroad'],
            ['victoryroad','evergrande'],
        ],
    },

    sinnoh: {
        label: 'Sinnoh',
        nodes: [
            { id: 'twinleaf',    name: 'Twinleaf Town',   aliases: ['Twinleaf Town'],   type: T.town,    x: 12, y: 92 },
            { id: 'r201',        name: 'Route 201',       aliases: ['Route 201'],       type: T.route,   x: 12, y: 78 },
            { id: 'sandgem',     name: 'Sandgem Town',    aliases: ['Sandgem Town'],    type: T.town,    x: 12, y: 64 },
            { id: 'r202',        name: 'Route 202',       aliases: ['Route 202'],       type: T.route,   x: 12, y: 50 },
            { id: 'jubilife',    name: 'Jubilife City',   aliases: ['Jubilife City'],   type: T.town,    x: 12, y: 36 },
            { id: 'floaroma',    name: 'Floaroma Town',   aliases: ['Floaroma Town'],   type: T.town,    x: 12, y: 22 },
            { id: 'r203',        name: 'Route 203',       aliases: ['Route 203'],       type: T.route,   x: 26, y: 36 },
            { id: 'oreburgh',    name: 'Oreburgh City',   aliases: ['Oreburgh City'],   type: T.town,    x: 40, y: 36 },
            { id: 'eternaforest',name: 'Eterna Forest',   aliases: ['Eterna Forest'],   type: T.dungeon, x: 26, y: 22 },
            { id: 'eterna',      name: 'Eterna City',     aliases: ['Eterna City'],     type: T.town,    x: 40, y: 22 },
            { id: 'r210',        name: 'Route 210',       aliases: ['Route 210'],       type: T.route,   x: 54, y: 22 },
            { id: 'hearthome',   name: 'Hearthome City',  aliases: ['Hearthome City'],  type: T.town,    x: 68, y: 22 },
            { id: 'r209',        name: 'Route 209',       aliases: ['Route 209'],       type: T.route,   x: 68, y: 36 },
            { id: 'veilstone',   name: 'Veilstone City',  aliases: ['Veilstone City'],  type: T.town,    x: 68, y: 50 },
            { id: 'r215',        name: 'Route 215',       aliases: ['Route 215'],       type: T.route,   x: 68, y: 64 },
            { id: 'pastoria',    name: 'Pastoria City',   aliases: ['Pastoria City'],   type: T.town,    x: 68, y: 78 },
            { id: 'greatmarsh',  name: 'Great Marsh',     aliases: ['Great Marsh'],     type: T.dungeon, x: 54, y: 78 },
            { id: 'canalave',    name: 'Canalave City',   aliases: ['Canalave City'],   type: T.town,    x: 82, y: 36 },
            { id: 'r218',        name: 'Route 218',       aliases: ['Route 218'],       type: T.route,   x: 82, y: 50 },
            { id: 'sunyshore',   name: 'Sunyshore City',  aliases: ['Sunyshore City'],  type: T.town,    x: 82, y: 64 },
            { id: 'mtcoronet',   name: 'Mt. Coronet',     aliases: ['Mt Coronet', 'Mount Coronet'], type: T.dungeon, x: 40, y: 50 },
            { id: 'snowpoint',   name: 'Snowpoint City',  aliases: ['Snowpoint City'],  type: T.town,    x: 40, y: 64 },
            { id: 'victoryroad2',name: 'Victory Road',    aliases: ['Victory Road'],    type: T.dungeon, x: 40, y: 78 },
        ],
        paths: [
            ['twinleaf','r201'], ['r201','sandgem'], ['sandgem','r202'], ['r202','jubilife'],
            ['jubilife','floaroma'], ['jubilife','r203'], ['r203','oreburgh'], ['jubilife','eternaforest'],
            ['eternaforest','eterna'], ['eterna','r210'], ['r210','hearthome'], ['hearthome','r209'],
            ['r209','veilstone'], ['veilstone','r215'], ['r215','pastoria'], ['pastoria','greatmarsh'],
            ['veilstone','canalave'], ['canalave','r218'], ['r218','sunyshore'],
            ['eterna','mtcoronet'], ['mtcoronet','snowpoint'], ['snowpoint','victoryroad2'],
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
