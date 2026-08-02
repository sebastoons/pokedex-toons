// src/data/eggGroups.js
// Traducción de los grupos huevo de PokeAPI a los nombres usados en los juegos.
export const EGG_GROUP_NAMES = {
    monster: 'Monstruo',
    water1: 'Agua 1',
    water2: 'Agua 2',
    water3: 'Agua 3',
    bug: 'Bicho',
    flying: 'Volador',
    field: 'Campo',
    fairy: 'Hada',
    plant: 'Planta',
    'human-like': 'Humanoide',
    mineral: 'Mineral',
    indeterminate: 'Amorfo',
    ditto: 'Ditto',
    dragon: 'Dragón',
    'no-eggs': 'Sin descubrir',
};

export const translateEggGroup = (slug) =>
    EGG_GROUP_NAMES[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
