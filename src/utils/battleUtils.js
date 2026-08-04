// src/utils/battleUtils.js
import { calculateTypeEffectiveness } from './typeEffectiveness';

// Movimiento de respaldo cuando un Pokémon se queda sin PP en todos sus
// movimientos. Única fuente — antes existían dos copias (BattleControls.js
// y useBattleLogic.js) que podían desincronizarse.
export const STRUGGLE = { name: 'Forcejeo', power: 50, accuracy: 100, type: 'normal', damage_class: 'physical', priority: 0, currentPP: Infinity, maxPP: Infinity };

export const checkAccuracy = (move) => {
    const acc = move.accuracy;
    if (acc === null || acc === undefined) return true;
    return Math.random() < acc / 100;
};

export const stageMultiplier = (stage) => {
    const s = Math.max(-6, Math.min(6, stage ?? 0));
    return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
};

export const calculateDamage = (attackerPokemon, defenderPokemon, move, level = 50) => {
    if (!move) return { damage: 0, effectivenessMessage: 'Movimiento inválido.', effectivenessTier: 'normal', isCritical: false };
    const moveType = move.type || 'normal';

    if (typeof move.power !== 'number' || move.power <= 0) {
        return { damage: 0, effectivenessMessage: '', effectivenessTier: 'normal', isCritical: false };
    }

    const rawAtk = attackerPokemon.attack;
    const rawDef = defenderPokemon.defense;
    if (typeof rawAtk !== 'number' || typeof rawDef !== 'number' || rawDef === 0) {
        return { damage: 1, effectivenessMessage: '', effectivenessTier: 'normal', isCritical: false };
    }

    const isCritical = Math.random() < 0.0625;
    const critMult = isCritical ? 1.5 : 1;

    const attackStat  = rawAtk * stageMultiplier(attackerPokemon.attackStage);
    const defenseStat = rawDef * stageMultiplier(defenderPokemon.defenseStage);

    const attackerTypes = attackerPokemon.types.map(t => t.type?.name ?? t);
    const stab = attackerTypes.includes(moveType) ? 1.5 : 1;

    const defenderTypes = defenderPokemon.types.map(t => t.type?.name ?? t);
    const { multiplier: typeMultiplier, message: effectivenessMessage, tier: effectivenessTier } =
        calculateTypeEffectiveness(moveType, defenderTypes);

    let damage = Math.floor(
        ((((2 * level) / 5 + 2) * move.power * (attackStat / defenseStat)) / 50 + 2)
        * stab * typeMultiplier * critMult
    );
    damage = Math.max(typeMultiplier === 0 ? 0 : 1, damage);

    return { damage, effectivenessMessage, effectivenessTier, isCritical };
};
