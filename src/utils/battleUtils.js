// src/utils/battleUtils.js
import { calculateTypeEffectiveness } from './typeEffectiveness';

/**
 * Calcula el daño infligido por un ataque de Pokémon, incluyendo la efectividad de tipos.
 * @param {object} attackerPokemon - El objeto Pokémon que ataca.
 * @param {object} defenderPokemon - El objeto Pokémon que defiende.
 * @param {object} move - El objeto del movimiento utilizado.
 * @param {number} level - El nivel de los Pokémon (por simplicidad, asumimos uno fijo).
 * @returns {object} Un objeto con el daño calculado y un mensaje de efectividad.
 */
export const calculateDamage = (attackerPokemon, defenderPokemon, move, level = 50) => {
    // *** SOLUCIÓN DEFINITIVA Y A PRUEBA DE ERRORES ***
    // 1. Nos aseguramos de que el objeto 'move' no sea nulo.
    if (!move) {
        console.error("Cálculo de daño abortado: el objeto 'move' es nulo.");
        return { damage: 0, effectivenessMessage: "Movimiento inválido." };
    }

    // 2. Si el movimiento no tiene una propiedad 'type', le asignamos 'normal' por defecto.
    const moveType = move.type || 'normal';
    // *** FIN DE LA SOLUCIÓN ***

    if (typeof move.power !== 'number' || move.power <= 0) {
        console.warn(`Movimiento sin poder para el cálculo de daño: ${move.name}`);
        return { damage: 0, effectivenessMessage: "" };
    }

    const attackStat = attackerPokemon.attack;
    const defenseStat = defenderPokemon.defense;

    if (typeof attackStat !== 'number' || typeof defenseStat !== 'number' || defenseStat === 0) {
        console.error(`Estadísticas de ataque/defensa inválidas. Attacker: ${attackerPokemon?.name}, Defender: ${defenderPokemon?.name}`);
        return { damage: 1, effectivenessMessage: "" };
    }

    // STAB (Same-Type Attack Bonus)
    const attackerTypes = attackerPokemon.types.map(t => t.type.name);
    // Usamos nuestra variable segura 'moveType'
    const moveIsSameType = attackerTypes.includes(moveType);
    const stab = moveIsSameType ? 1.5 : 1;

    // Calcular la efectividad de tipo (usando nuestra variable segura 'moveType')
    const { multiplier: typeMultiplier, message: effectivenessMessage } =
        calculateTypeEffectiveness(moveType, defenderPokemon.types.map(t => t.type.name));

    let damage = Math.floor(
        ((((2 * level) / 5 + 2) * move.power * (attackStat / defenseStat)) / 50 + 2) * stab * typeMultiplier
    );

    damage = Math.max(typeMultiplier === 0 ? 0 : 1, damage);

    return { damage, effectivenessMessage };
};