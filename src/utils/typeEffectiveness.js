// src/utils/typeEffectiveness.js

// Definir las relaciones de efectividad de tipos (simplificado como ejemplo)
// Esto debería ser más completo con todos los tipos y sus interacciones.
const typeRelations = {
    normal: {
        immune: ['ghost'],
        weaknesses: ['fighting'],
        resistances: []
    },
    fire: {
        immune: [],
        weaknesses: ['water', 'ground', 'rock'],
        resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy']
    },
    water: {
        immune: [],
        weaknesses: ['grass', 'electric'],
        resistances: ['fire', 'water', 'ice', 'steel']
    },
    grass: {
        immune: [],
        weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'],
        resistances: ['water', 'electric', 'grass', 'ground']
    },
    electric: {
        immune: [],
        weaknesses: ['ground'],
        resistances: ['electric', 'flying', 'steel']
    },
    ice: {
        immune: [],
        weaknesses: ['fire', 'fighting', 'rock', 'steel'],
        resistances: ['ice']
    },
    fighting: {
        immune: [],
        weaknesses: ['flying', 'psychic', 'fairy'],
        resistances: ['bug', 'rock', 'dark']
    },
    poison: {
        immune: [],
        weaknesses: ['ground', 'psychic'],
        resistances: ['fighting', 'poison', 'grass', 'fairy']
    },
    ground: {
        immune: ['electric'],
        weaknesses: ['water', 'grass', 'ice'],
        resistances: ['poison', 'rock']
    },
    flying: {
        immune: ['ground'], // Ground moves have no effect
        weaknesses: ['electric', 'ice', 'rock'],
        resistances: ['fighting', 'bug', 'grass']
    },
    psychic: {
        immune: [],
        weaknesses: ['bug', 'ghost', 'dark'],
        resistances: ['fighting', 'psychic']
    },
    bug: {
        immune: [],
        weaknesses: ['fire', 'flying', 'rock'],
        resistances: ['fighting', 'ground', 'grass']
    },
    rock: {
        immune: [],
        weaknesses: ['fighting', 'ground', 'steel', 'water', 'grass'],
        resistances: ['normal', 'fire', 'flying', 'poison']
    },
    ghost: {
        immune: ['normal', 'fighting'],
        weaknesses: ['ghost', 'dark'],
        resistances: ['poison', 'bug']
    },
    dragon: {
        immune: [],
        weaknesses: ['ice', 'dragon', 'fairy'],
        resistances: ['fire', 'water', 'electric', 'grass']
    },
    steel: {
        immune: ['poison'],
        weaknesses: ['fire', 'fighting', 'ground'],
        resistances: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy']
    },
    fairy: {
        immune: ['dragon'],
        weaknesses: ['poison', 'steel'],
        resistances: ['fighting', 'bug', 'dark']
    },
    dark: {
        immune: ['psychic'],
        weaknesses: ['fighting', 'bug', 'fairy'],
        resistances: ['ghost', 'dark']
    }
};

/**
 * Calcula el multiplicador de efectividad de un tipo de movimiento contra los tipos de un Pokémon defensor.
 * @param {string} moveType - El tipo del movimiento (e.g., "fire").
 * @param {string[]} defenderTypes - Un array con los tipos del Pokémon defensor (e.g., ["grass", "poison"]).
 * @returns {object} Un objeto con el multiplicador numérico y un mensaje de efectividad.
 */
export const calculateTypeEffectiveness = (moveType, defenderTypes) => {
    let multiplier = 1;

    if (!moveType || !typeRelations[moveType]) {
        return { multiplier: 1, message: 'El tipo del movimiento no es reconocido.', tier: 'normal' };
    }

    defenderTypes.forEach(dType => {
        const relations = typeRelations[dType];
        if (!relations) return; // Tipo defensor no reconocido

        if (relations.immune.includes(moveType)) {
            multiplier *= 0;
        } else if (relations.weaknesses.includes(moveType)) {
            multiplier *= 2;
        } else if (relations.resistances.includes(moveType)) {
            multiplier *= 0.5;
        }
    });

    let tier, message;
    if (multiplier === 0) {
        tier = 'immune'; message = '¡No tiene efecto!';
    } else if (multiplier >= 4) {
        tier = 'quad'; message = '¡Es cuádruple efectivo!';
    } else if (multiplier >= 2) {
        tier = 'super'; message = '¡Es súper efectivo!';
    } else if (multiplier > 1) {
        tier = 'super'; message = 'Es efectivo.';
    } else if (multiplier <= 0.25) {
        tier = 'barely'; message = 'Apenas hace efecto...';
    } else if (multiplier < 1) {
        tier = 'resist'; message = 'No es muy efectivo...';
    } else {
        tier = 'normal'; message = '';
    }

    return { multiplier, message, tier };
};