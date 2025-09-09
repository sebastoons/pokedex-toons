// src/utils/battleUtils.js
import { calculateTypeEffectiveness } from './typeEffectiveness'; // <-- ¡IMPORTAMOS LA FUNCIÓN DE EFECTIVIDAD!

/**
 * Calcula el daño infligido por un ataque de Pokémon, incluyendo la efectividad de tipos.
 * @param {object} attackerPokemon - El objeto Pokémon que ataca.
 * @param {object} defenderPokemon - El objeto Pokémon que defiende.
 * @param {object} move - El objeto del movimiento utilizado.
 * @param {number} level - El nivel de los Pokémon (por simplicidad, asumimos uno fijo).
 * @returns {object} Un objeto con el daño calculado y un mensaje de efectividad.
 */
export const calculateDamage = (attackerPokemon, defenderPokemon, move, level = 50) => {
    // Asegurarse de que el movimiento tenga 'power'
    if (!move || typeof move.power !== 'number' || move.power <= 0) {
        console.warn(`Movimiento inválido o sin poder para el cálculo de daño: ${move?.name}`);
        return { damage: 0, effectivenessMessage: "No causó daño (movimiento inválido)." };
    }

    const attackStat = attackerPokemon.attack;
    const defenseStat = defenderPokemon.defense;

    // Verificar que las estadísticas sean números válidos para evitar NaN
    if (typeof attackStat !== 'number' || typeof defenseStat !== 'number' || defenseStat === 0) {
        console.error(`Estadísticas de ataque/defensa inválidas. Attacker: ${attackerPokemon?.name}, Defender: ${defenderPokemon?.name}`);
        return { damage: 1, effectivenessMessage: "Causó daño mínimo." }; // Daño mínimo si las stats son inválidas
    }

    // STAB (Same-Type Attack Bonus): 1.5x si el movimiento es del mismo tipo que el Pokémon atacante.
    const attackerTypes = attackerPokemon.types.map(t => t.type.name);
    const moveIsSameType = attackerTypes.includes(move.type); // move.type es el nombre del tipo del movimiento
    const stab = moveIsSameType ? 1.5 : 1;

    // Calcular la efectividad de tipo
    const { multiplier: typeMultiplier, message: effectivenessMessage } =
        calculateTypeEffectiveness(move.type, defenderPokemon.types.map(t => t.type.name));

    let damage = Math.floor(
        (((2 * level / 5 + 2) * move.power * attackStat / defenseStat) / 50 + 2) * stab * typeMultiplier
    );

    // Asegurarse de que el daño sea al menos 1, a menos que sea inmune (multiplier === 0)
    damage = Math.max(typeMultiplier === 0 ? 0 : 1, damage);

    return { damage, effectivenessMessage }; // Retornamos un objeto
};