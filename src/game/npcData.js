// src/game/npcData.js
// Datos de Rival y PNJs especiales — Pokémon Satélite

import { createPokemon } from './gameData';

// ── Rival "Aster" ─────────────────────────────────────────────────────────────
// Aster elige el iniciador con ventaja de tipo sobre el del jugador:
//   Jugador elige planta (1026 Luzoto)   → Aster toma fuego (1040 Ralentín)
//   Jugador elige fuego  (1040 Ralentín)  → Aster toma agua  (1032 Aquibebe)
//   Jugador elige agua   (1032 Aquibebe)  → Aster toma planta (1026 Luzoto)
export const getRivalStarterId = (playerStarterId) => {
    const map = { 1026: 1040, 1040: 1032, 1032: 1026 };
    return map[playerStarterId] ?? 1040;
};

// Equipos del rival por zona (IDs de especie + niveles)
// Se construyen en tiempo de ejecución con createPokemon para obtener stats
export const buildRivalTeam = (rivalStarterId, encounterKey) => {
    const configs = {
        ruta1: [
            { id: rivalStarterId, level: 8 },
        ],
        ciudadcometa: [
            { id: rivalStarterId, level: 15 },
            { id: 1104,           level: 14 },
        ],
        ciudadestrella: [
            { id: rivalStarterId, level: 24 },
            { id: 1104,           level: 22 },
            { id: 1115,           level: 23 },
        ],
    };
    const cfg = configs[encounterKey] ?? configs.ruta1;
    return cfg.map(({ id, level }) => createPokemon(id, level)).filter(Boolean);
};

// Encuentros del rival definidos por mapa y coordenadas de activación
// { mapKey, triggerX, triggerY, encounterKey, dialog, defeatDialog }
export const RIVAL_ENCOUNTERS = [
    {
        id: 'rival-ruta1',
        mapKey: 'ruta1',
        triggerX: 10, triggerY: 11,       // coordenada donde aparece Aster
        encounterKey: 'ruta1',
        name: 'Rival Aster',
        dialog: '¡Espera! ¡Soy yo, Aster! ¡He entrenado mucho desde el laboratorio! ¡Vamos a ver quién es más fuerte!',
        defeatDialog: '¡No puede ser! ¡Tú siempre me superas! ¡Pero la próxima vez será diferente!',
    },
    {
        id: 'rival-ciudadcometa',
        mapKey: 'ciudad',
        triggerX: 12, triggerY: 5,
        encounterKey: 'ciudadcometa',
        name: 'Rival Aster',
        dialog: '¡Te encontré de nuevo! Mi equipo ha crecido. ¡Esta vez sí te gano!',
        defeatDialog: '¡Otra vez no! Sigues siendo el mejor... por ahora.',
    },
    {
        id: 'rival-ciudadestrella',
        mapKey: 'ciudadestrella',
        triggerX: 10, triggerY: 15,
        encounterKey: 'ciudadestrella',
        name: 'Rival Aster',
        dialog: '¡Ciudad Estrella! El último gran enfrentamiento antes del gimnasio. ¡No te daré ventaja!',
        defeatDialog: '¡Increíble! Mereces ganar el gimnasio. ¡Pero no te confíes!',
    },
];

// Busca si hay un encuentro de rival en la posición dada del mapa
export const findRivalEncounter = (mapKey, x, y, defeatedRivals = []) => {
    return RIVAL_ENCOUNTERS.find(
        r => r.mapKey === mapKey && r.triggerX === x && r.triggerY === y
             && !defeatedRivals.includes(r.id)
    ) ?? null;
};
