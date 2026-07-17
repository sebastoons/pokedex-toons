// src/utils/randomBattleUtils.js
// Generación aleatoria de equipos y técnicas para el modo "Batalla Aleatoria"
// y el botón "Equipo Aleatorio" del selector manual.
import { buildMovePool, getPokemonTypes } from '../data/moveDatabase';

// Fisher-Yates: shuffle sin sesgo (evita el patrón roto sort(() => 0.5 - Math.random())).
const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// Elige `size` Pokémon al azar de `pokemonList`, excluyendo los ids indicados
// (p. ej. los ya elegidos por el otro entrenador).
export const pickRandomTeam = (pokemonList, size, excludeIds = []) => {
    const pool = excludeIds.length
        ? pokemonList.filter(p => !excludeIds.includes(p.id))
        : pokemonList;
    return shuffle(pool).slice(0, size);
};

// Elige 4 técnicas al azar del pool completo de movimientos del Pokémon (según sus tipos).
export const pickRandomMoves = (pokemon) => {
    const pool = buildMovePool(getPokemonTypes(pokemon));
    return shuffle(pool).slice(0, 4);
};

// Construye el mapa { [pokemonId]: [4 movimientos aleatorios] } para un equipo completo.
export const buildRandomMovesMap = (team) => {
    const map = {};
    team.forEach(poke => { map[poke.id] = pickRandomMoves(poke); });
    return map;
};
