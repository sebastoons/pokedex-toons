// src/utils/pokemonTypes.js

export const POKEMON_TYPES = {
    normal: { name: 'Normal', color: '#A8A77A' },
    fire: { name: 'Fuego', color: '#EE8130' },
    water: { name: 'Agua', color: '#6390F0' },
    grass: { name: 'Planta', color: '#7AC74C' },
    electric: { name: 'Eléctrico', color: '#F7D02C' },
    ice: { name: 'Hielo', color: '#96D9D6' },
    fighting: { name: 'Lucha', color: '#C22E28' },
    poison: { name: 'Veneno', color: '#A33EA1' },
    ground: { name: 'Tierra', color: '#E2BF65' },
    flying: { name: 'Volador', color: '#A98FF3' },
    psychic: { name: 'Psíquico', color: '#F95587' },
    bug: { name: 'Bicho', color: '#A6B91A' },
    rock: { name: 'Roca', color: '#B6A136' },
    ghost: { name: 'Fantasma', color: '#735797' },
    dragon: { name: 'Dragón', color: '#6F35FC' },
    steel: { name: 'Acero', color: '#B7B7CE' },
    dark: { name: 'Oscuro', color: '#705746' },
    fairy: { name: 'Hada', color: '#D685AD' },
};

// Función para obtener la información del tipo
export const getTypeInfo = (type) => {
    return POKEMON_TYPES[type.toLowerCase()] || { name: type, color: '#68A090' }; // Default color si no se encuentra
};