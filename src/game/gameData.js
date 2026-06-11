// src/game/gameData.js
// Datos y reglas del juego "Región Satélite"
import { generacionEspecial } from '../data/generacionEspecial';

export const SAVE_KEY = 'satelite-save-v1';

// ── Especies ────────────────────────────────────────────────────────────────
export const findSpecies = (id) => generacionEspecial.find(p => p.id === id);
export const generacionTotal = generacionEspecial.length;

// Un Pokémon es "forma base" si no aparece como etapa posterior en ninguna línea evolutiva
const laterStageIds = new Set();
generacionEspecial.forEach(p => {
    (p.evolutionLine || []).slice(1).forEach(stage => laterStageIds.add(stage.id));
});
export const baseFormPokemon = generacionEspecial.filter(p => !laterStageIds.has(p.id));

// ── Iniciales ───────────────────────────────────────────────────────────────
export const STARTERS = [1026, 1040, 1032]; // Luzoto (planta), Ralentín (fuego), Aquibebe (agua)

// ── Encuentros por zona (dinámico: nuevos Pokémon aparecen solos) ──────────
export const buildEncounterPool = (zoneTypes) => {
    const pool = baseFormPokemon.filter(p =>
        p.types.some(t => zoneTypes.includes(t)) && !STARTERS.includes(p.id)
    );
    // Fallback para que ninguna zona quede vacía
    return pool.length > 0 ? pool : baseFormPokemon.slice(0, 5);
};

export const randomEncounter = (zoneTypes, levelRange) => {
    const pool = buildEncounterPool(zoneTypes);
    const species = pool[Math.floor(Math.random() * pool.length)];
    const level = levelRange[0] + Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1));
    return createPokemon(species.id, level);
};

// ── Stats por nivel (fórmula GBA simplificada) ──────────────────────────────
export const statsAtLevel = (baseStats, level) => {
    const hp = Math.floor((baseStats.hp * 2 * level) / 100) + level + 10;
    const calc = (b) => Math.floor((b * 2 * level) / 100) + 5;
    return {
        hp,
        attack: calc(baseStats.attack),
        defense: calc(baseStats.defense),
        spAttack: calc(baseStats['special-attack'] ?? baseStats.attack),
        spDefense: calc(baseStats['special-defense'] ?? baseStats.defense),
        speed: calc(baseStats.speed),
    };
};

export const createPokemon = (speciesId, level) => {
    const species = findSpecies(speciesId);
    if (!species) return null;
    const stats = statsAtLevel(species.stats, level);
    return {
        uid: `${speciesId}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        speciesId,
        name: species.name,
        types: species.types,
        imageUrl: species.imageUrl,
        level,
        xp: 0,
        currentHp: stats.hp,
        ...stats,
        maxHp: stats.hp,
    };
};

// ── Experiencia y subida de nivel ───────────────────────────────────────────
export const xpToNext = (level) => level * 20 + 10;
export const xpGain = (wildLevel) => wildLevel * 8 + 15;

// Aplica XP; devuelve { pokemon, leveledUp, evolved, oldName }
export const applyXp = (pokemon, amount) => {
    let p = { ...pokemon, xp: pokemon.xp + amount };
    let leveledUp = false;
    let evolved = false;
    let oldName = p.name;

    while (p.xp >= xpToNext(p.level) && p.level < 100) {
        p.xp -= xpToNext(p.level);
        p.level += 1;
        leveledUp = true;

        const species = findSpecies(p.speciesId);
        const newStats = statsAtLevel(species.stats, p.level);
        const hpGain = newStats.hp - p.maxHp;
        p = { ...p, ...newStats, maxHp: newStats.hp, currentHp: Math.min(newStats.hp, p.currentHp + hpGain) };

        // Evolución
        const line = species.evolutionLine || [];
        const currentId = p.speciesId;
        const idx = line.findIndex(s => s.id === currentId);
        const next = idx >= 0 ? line[idx + 1] : null;
        if (next?.details?.min_level && p.level >= next.details.min_level) {
            const evoSpecies = findSpecies(next.id);
            if (evoSpecies) {
                oldName = p.name;
                const evoStats = statsAtLevel(evoSpecies.stats, p.level);
                const hpRatio = p.currentHp / p.maxHp;
                p = {
                    ...p,
                    speciesId: evoSpecies.id,
                    name: evoSpecies.name,
                    types: evoSpecies.types,
                    imageUrl: evoSpecies.imageUrl,
                    ...evoStats,
                    maxHp: evoStats.hp,
                    currentHp: Math.max(1, Math.floor(evoStats.hp * hpRatio)),
                };
                evolved = true;
            }
        }
    }
    return { pokemon: p, leveledUp, evolved, oldName };
};

// ── Captura ─────────────────────────────────────────────────────────────────
export const tryCapture = (wild) => {
    const hpFactor = (3 * wild.maxHp - 2 * wild.currentHp) / (3 * wild.maxHp); // 0.33–1
    const levelFactor = Math.max(0.35, 1 - wild.level / 60);
    const chance = Math.min(0.95, hpFactor * 0.75 * levelFactor + 0.1);
    return Math.random() < chance;
};

// ── Daño ────────────────────────────────────────────────────────────────────
export const calcDamage = (attacker, defender, move, effectiveness) => {
    if (!move.power) return 0;
    const isSpecial = move.damage_class === 'special';
    const atk = isSpecial ? attacker.spAttack : attacker.attack;
    const def = isSpecial ? defender.spDefense : defender.defense;
    const base = Math.floor(((2 * attacker.level / 5 + 2) * move.power * atk / Math.max(1, def)) / 50) + 2;
    const variance = 0.85 + Math.random() * 0.15;
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    return Math.max(1, Math.floor(base * effectiveness * stab * variance));
};

// ── Entrenadores seleccionables ─────────────────────────────────────────────
export const TRAINERS = [
    { id: 'm1', gender: 'm', name: 'Río',    palette: { hair: '#5a3a1a', cap: '#d03028', shirt: '#d03028', pants: '#3a5a9c' } },
    { id: 'm2', gender: 'm', name: 'Cosmo',  palette: { hair: '#1a1a2e', cap: '#2858c8', shirt: '#2858c8', pants: '#3a3a3a' } },
    { id: 'm3', gender: 'm', name: 'Orión',  palette: { hair: '#c8a030', cap: '#28a048', shirt: '#28a048', pants: '#7a5a3a' } },
    { id: 'f1', gender: 'f', name: 'Luna',   palette: { hair: '#8a4a2a', cap: '#e85890', shirt: '#e85890', pants: '#ffffff' } },
    { id: 'f2', gender: 'f', name: 'Vega',   palette: { hair: '#3a2a5a', cap: '#8848c8', shirt: '#8848c8', pants: '#2a2a3a' } },
    { id: 'f3', gender: 'f', name: 'Estela', palette: { hair: '#e8a030', cap: '#e87828', shirt: '#e87828', pants: '#4a7ac8' } },
];
