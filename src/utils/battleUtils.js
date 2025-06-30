// src/utils/battleUtils.js

/**
 * Calcula el daño infligido por un ataque de Pokémon.
 * @param {object} attackerPokemon - El objeto Pokémon que ataca.
 * @param {object} defenderPokemon - El objeto Pokémon que defiende.
 * @param {object} move - El objeto del movimiento utilizado.
 * @param {number} level - El nivel de los Pokémon (por simplicidad, asumimos uno fijo).
 * @returns {number} El valor del daño calculado.
 */
export const calculateDamage = (attackerPokemon, defenderPokemon, move, level = 50) => {
    // Asegurarse de que el movimiento tenga 'power'
    if (!move || typeof move.power !== 'number' || move.power <= 0) {
        // Si el movimiento no tiene poder o es inválido, puede hacer 0 daño o un daño mínimo.
        // Para evitar divisiones por cero o cálculos extraños.
        console.warn(`Movimiento inválido o sin poder para el cálculo de daño: ${move?.name}`);
        return 0; // O un daño mínimo como 1, dependiendo de la lógica deseada.
    }

    const attackStat = attackerPokemon.attack;
    const defenseStat = defenderPokemon.defense;

    // Verificar que las estadísticas sean números válidos para evitar NaN
    if (typeof attackStat !== 'number' || typeof defenseStat !== 'number' || defenseStat === 0) {
        console.error(`Estadísticas de ataque/defensa inválidas. Attacker: ${attackerPokemon?.name}, Defender: ${defenderPokemon?.name}`);
        return 1; // Daño mínimo si las stats son inválidas
    }

    // STAB (Same-Type Attack Bonus): 1.5x si el movimiento es del mismo tipo que el Pokémon atacante.
    const attackerTypes = attackerPokemon.types.map(t => t.type.name);
    const moveIsSameType = attackerTypes.includes(move.type); // move.type es el nombre del tipo del movimiento
    const stab = moveIsSameType ? 1.5 : 1;

    // Nota: calculateTypeEffectiveness ya está importado en useBattleLogic,
    // por lo que no es necesario importarlo aquí de nuevo, pero sí usarlo.
    // Para este archivo `battleUtils.js`, no necesitamos la efectividad de tipo,
    // ya que la aplicamos en `useBattleLogic` directamente.
    // Esta función solo calcula el daño base y STAB.

    let damage = Math.floor(
        (((2 * level / 5 + 2) * move.power * attackStat / defenseStat) / 50 + 2) * stab
    );

    // Asegurarse de que el daño sea al menos 1
    damage = Math.max(1, damage);

    return damage;
};