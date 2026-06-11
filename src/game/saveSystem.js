// src/game/saveSystem.js
import { SAVE_KEY } from './gameData';

export const newGameState = (trainer, playerName) => ({
    version: 1,
    trainer,                 // { id, gender, name, palette }
    playerName: playerName || trainer.name,
    map: 'pueblo',
    x: 9, y: 9, dir: 'down',
    team: [],                // Pokémon del equipo (máx 6)
    box: [],                 // capturados extra
    bag: { pokeballs: 10, potions: 5 },
    collectedItems: [],      // claves "mapa:x,y" de objetos recogidos
    pokedexSeen: [],
    pokedexCaught: [],
    hasStarter: false,
    playSeconds: 0,
    savedAt: null,
});

export const saveGame = (state) => {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
        return true;
    } catch { return false; }
};

export const loadGame = () => {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return data?.version === 1 ? data : null;
    } catch { return null; }
};

export const deleteSave = () => {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* noop */ }
};
