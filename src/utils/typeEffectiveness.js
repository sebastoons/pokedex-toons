// src/utils/typeEffectiveness.js

// Definición de los tipos de Pokémon y sus colores asociados
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
    dark: { name: 'Siniestro', color: '#705746' },
    fairy: { name: 'Hada', color: '#D685AD' },
};

// Tabla de efectividad de tipos (Ataque vs Defensa)
// key: tipo atacante
// value: objeto con 'superEffective' (x2), 'notEffective' (x0.5), 'noEffect' (x0)
const TYPE_EFFECTIVENESS = {
    normal: {
        notEffective: ['rock', 'steel'],
        noEffect: ['ghost'],
    },
    fire: {
        superEffective: ['grass', 'ice', 'bug', 'steel'],
        notEffective: ['fire', 'water', 'dragon', 'rock'],
    },
    water: {
        superEffective: ['fire', 'ground', 'rock'],
        notEffective: ['water', 'grass', 'dragon'],
    },
    grass: {
        superEffective: ['water', 'ground', 'rock'],
        notEffective: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
    },
    electric: {
        superEffective: ['water', 'flying'],
        notEffective: ['electric', 'grass', 'dragon'],
        noEffect: ['ground'],
    },
    ice: {
        superEffective: ['grass', 'ground', 'flying', 'dragon'],
        notEffective: ['fire', 'water', 'ice', 'steel'],
    },
    fighting: {
        superEffective: ['normal', 'ice', 'rock', 'dark', 'steel'],
        notEffective: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
        noEffect: ['ghost'],
    },
    poison: {
        superEffective: ['grass', 'fairy'],
        notEffective: ['poison', 'ground', 'rock', 'ghost'],
        noEffect: ['steel'],
    },
    ground: {
        superEffective: ['fire', 'electric', 'poison', 'rock', 'steel'],
        notEffective: ['grass', 'bug'],
        noEffect: ['flying'],
    },
    flying: {
        superEffective: ['grass', 'fighting', 'bug'],
        notEffective: ['electric', 'rock', 'steel'],
    },
    psychic: {
        superEffective: ['fighting', 'poison'],
        notEffective: ['psychic', 'steel'],
        noEffect: ['dark'],
    },
    bug: {
        superEffective: ['grass', 'psychic', 'dark'],
        notEffective: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
    },
    rock: {
        superEffective: ['fire', 'ice', 'flying', 'bug'],
        notEffective: ['fighting', 'ground', 'steel'],
    },
    ghost: {
        superEffective: ['psychic', 'ghost'],
        notEffective: ['dark'],
        noEffect: ['normal'],
    },
    dragon: {
        superEffective: ['dragon'],
        notEffective: ['steel'],
        noEffect: ['fairy'],
    },
    steel: {
        superEffective: ['ice', 'rock', 'fairy'],
        notEffective: ['fire', 'water', 'electric', 'steel'],
    },
    dark: {
        superEffective: ['psychic', 'ghost'],
        notEffective: ['fighting', 'dark', 'fairy'],
    },
    fairy: {
        superEffective: ['fighting', 'dragon', 'dark'],
        notEffective: ['fire', 'poison', 'steel'],
    },
};

/**
 * Calcula el multiplicador de daño basado en la efectividad de tipos.
 * @param {string} attackingType - El tipo del movimiento atacante (ej. 'fire').
 * @param {string[]} defendingTypes - Un array de los tipos del Pokémon defensor (ej. ['grass', 'poison']).
 * @returns {number} El multiplicador de daño (0, 0.25, 0.5, 1, 2, 4).
 */
export const calculateTypeEffectiveness = (attackingType, defendingTypes) => {
    let multiplier = 1;
    const effectivenessData = TYPE_EFFECTIVENESS[attackingType];

    if (!effectivenessData) {
        console.warn(`Tipo de ataque desconocido: ${attackingType}`);
        return 1; // Si el tipo no está definido, asumimos daño normal
    }

    defendingTypes.forEach(defendingType => {
        if (effectivenessData.noEffect && effectivenessData.noEffect.includes(defendingType)) {
            multiplier *= 0;
        } else if (effectivenessData.superEffective && effectivenessData.superEffective.includes(defendingType)) {
            multiplier *= 2;
        } else if (effectivenessData.notEffective && effectivenessData.notEffective.includes(defendingType)) {
            multiplier *= 0.5;
        }
    });

    return multiplier;
};

/**
 * Obtiene la información (nombre y color) de un tipo de Pokémon.
 * @param {string} typeName - El nombre del tipo en minúsculas (ej. 'fire').
 * @returns {object} Un objeto con 'name' y 'color', o un objeto por defecto si no se encuentra.
 */
export const getTypeInfo = (typeName) => {
    return POKEMON_TYPES[typeName] || { name: typeName.charAt(0).toUpperCase() + typeName.slice(1), color: '#68A090' }; // Default para tipos no encontrados
};