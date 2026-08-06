// src/data/gen5Versions.js
// Catálogo de juegos de Generación 1 a 5 — usado para filtrar movesets,
// ubicaciones y cualquier otro dato "versionado" de PokeAPI a solo esas eras
// (el enfoque de PokeMMo hoy en día). Gen 6 en adelante queda deliberadamente
// fuera por ahora; para agregarla más adelante solo hay que sumar entradas aquí.

// Version groups en orden de prioridad: si un Pokémon tiene datos en más de
// uno, se prefiere el primero de la lista (más reciente / más relevante).
export const GEN5_VERSION_GROUPS = ['black-2-white-2', 'black-white'];

// Todas las "version" (juegos individuales) de Gen 1-5, agrupadas por generación.
// Solo se usa internamente para construir VERSION_INFO (no se exporta: nada
// más en la app necesita el agrupado por generación, solo por versión/región).
const GENERATIONS_1_TO_5 = [
    {
        gen: 1,
        label: 'Generación I',
        versions: [
            { name: 'red', display: 'Rojo' },
            { name: 'blue', display: 'Azul' },
            { name: 'yellow', display: 'Amarillo' },
        ],
    },
    {
        gen: 2,
        label: 'Generación II',
        versions: [
            { name: 'gold', display: 'Oro' },
            { name: 'silver', display: 'Plata' },
            { name: 'crystal', display: 'Cristal' },
        ],
    },
    {
        gen: 3,
        label: 'Generación III',
        versions: [
            { name: 'ruby', display: 'Rubí' },
            { name: 'sapphire', display: 'Zafiro' },
            { name: 'emerald', display: 'Esmeralda' },
            { name: 'firered', display: 'Rojo Fuego' },
            { name: 'leafgreen', display: 'Verde Hoja' },
        ],
    },
    {
        gen: 4,
        label: 'Generación IV',
        versions: [
            { name: 'diamond', display: 'Diamante' },
            { name: 'pearl', display: 'Perla' },
            { name: 'platinum', display: 'Platino' },
            { name: 'heartgold', display: 'Oro HeartGold' },
            { name: 'soulsilver', display: 'Plata SoulSilver' },
        ],
    },
    {
        gen: 5,
        label: 'Generación V',
        versions: [
            { name: 'black', display: 'Negro' },
            { name: 'white', display: 'Blanco' },
            { name: 'black-2', display: 'Negro 2' },
            { name: 'white-2', display: 'Blanco 2' },
        ],
    },
];

// Mapa plano version.name -> { display, gen } para lookups rápidos.
export const VERSION_INFO = GENERATIONS_1_TO_5.reduce((acc, { gen, versions }) => {
    versions.forEach(v => { acc[v.name] = { display: v.display, gen }; });
    return acc;
}, {});

// Regiones jugables (Kanto, Johto, Hoenn, Sinnoh, Teselia) — se usan para
// filtrar las ubicaciones salvajes por región en vez de mostrar todo junto.
// Kanto: solo Rojo Fuego/Verde Hoja (remakes de Gen III, estilo PokeMMo);
// Teselia: solo Negro/Blanco (PokeMMo no contempla Negro 2/Blanco 2).
export const REGIONS = [
    { id: 'kanto',   label: 'Kanto',   versions: ['firered', 'leafgreen'] },
    { id: 'johto',   label: 'Johto',   versions: ['gold', 'silver', 'crystal', 'heartgold', 'soulsilver'] },
    { id: 'hoenn',   label: 'Hoenn',   versions: ['ruby', 'sapphire', 'emerald'] },
    { id: 'sinnoh',  label: 'Sinnoh',  versions: ['diamond', 'pearl', 'platinum'] },
    { id: 'teselia', label: 'Teselia', versions: ['black', 'white'] },
];

export const humanizeSlug = (slug = '') =>
    slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
