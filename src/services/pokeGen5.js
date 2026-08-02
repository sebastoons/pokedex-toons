// src/services/pokeGen5.js
// Datos "estilo PokeMMo": todo filtrado a Generación I-V (Black/White como
// referencia principal, con fallback a versiones anteriores por movimiento).
import { GEN5_VERSION_GROUPS, GENERATIONS_1_TO_5, isGen1To5Version, humanizeSlug } from '../data/gen5Versions';

const BASE_URL = 'https://pokeapi.co/api/v2/';

// ── Movimientos (idea 3 y 4: nivel / MT-MO / tutor / crianza, Gen 5) ────────
// Recorre pokemonJson.moves (ya viene con la ficha del Pokémon, sin fetch extra)
// y clasifica cada movimiento en 4 categorías según cómo se aprende en Gen 5,
// prefiriendo Blanco2/Negro2 y cayendo a Blanco/Negro si ese movimiento
// puntual no tiene datos en la versión más nueva.
export const filterMovesByGen5 = (moves = [], versionGroups = GEN5_VERSION_GROUPS) => {
    const buckets = { levelUp: [], machine: [], tutor: [], egg: [] };
    const seen = { levelUp: new Set(), machine: new Set(), tutor: new Set(), egg: new Set() };
    const methodToBucket = { 'level-up': 'levelUp', machine: 'machine', tutor: 'tutor', egg: 'egg' };

    // Recorre los version_groups en orden de prioridad (sin cortar en el primero
    // con datos): así, si un movimiento se aprende por MT en Blanco/Negro pero
    // esa MT no existía en Blanco2/Negro2, igual queda registrado. El `seen`
    // por categoría evita duplicar el mismo movimiento si aparece en ambos
    // juegos con el mismo método (gana el de mayor prioridad, procesado primero).
    moves.forEach(moveEntry => {
        versionGroups.forEach(vg => {
            const matches = moveEntry.version_group_details.filter(d => d.version_group.name === vg);
            matches.forEach(detail => {
                const bucketKey = methodToBucket[detail.move_learn_method.name];
                if (!bucketKey || seen[bucketKey].has(moveEntry.move.name)) return;
                seen[bucketKey].add(moveEntry.move.name);
                buckets[bucketKey].push({
                    name: moveEntry.move.name,
                    url: moveEntry.move.url,
                    level: detail.level_learned_at,
                });
            });
        });
    });

    buckets.levelUp.sort((a, b) => a.level - b.level);
    return buckets;
};

// Trae los detalles completos (nombre en español, tipo, poder, pp, precisión)
// de todos los movimientos filtrados, sin repetir peticiones para un mismo
// movimiento que aparezca en más de una categoría (ej. nivel y MT a la vez).
export const fetchGen5MovesData = async (movesBuckets) => {
    const uniqueRefs = new Map();
    Object.values(movesBuckets).flat().forEach(m => { if (!uniqueRefs.has(m.url)) uniqueRefs.set(m.url, m); });

    const entries = await Promise.all([...uniqueRefs.values()].map(async (ref) => {
        try {
            const res = await fetch(ref.url);
            if (!res.ok) throw new Error(res.status);
            const data = await res.json();
            const esName = data.names?.find(n => n.language.name === 'es')?.name;
            return [ref.url, {
                name: esName || humanizeSlug(data.name),
                type: data.type?.name || 'normal',
                power: data.power,
                pp: data.pp,
                accuracy: data.accuracy,
                damageClass: data.damage_class?.name || 'physical',
            }];
        } catch {
            return [ref.url, { name: humanizeSlug(ref.name), type: 'normal', power: null, pp: null, accuracy: null, damageClass: null }];
        }
    }));
    const detailByUrl = new Map(entries);
    const enrich = (bucket) => bucket.map(m => ({ ...m, ...detailByUrl.get(m.url) }));

    return {
        levelUp: enrich(movesBuckets.levelUp),
        machine: enrich(movesBuckets.machine),
        tutor: enrich(movesBuckets.tutor),
        egg: enrich(movesBuckets.egg),
    };
};

// ── Ubicaciones salvajes (idea 9, Gen I-V) ──────────────────────────────────
// Cobertura: el endpoint de encuentros de PokeAPI viene de la base "veekun",
// históricamente más completa justo para estas generaciones clásicas — pero
// no todos los Pokémon aparecen en estado salvaje (iniciales, legendarios,
// evoluciones exclusivas), así que la función siempre devuelve una forma
// consistente con hasData:false cuando no hay nada que mostrar.
export const fetchGen1To5Encounters = async (pokemonId) => {
    try {
        const res = await fetch(`${BASE_URL}pokemon/${pokemonId}/encounters`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const areasByVersion = {};
        data.forEach(locationEntry => {
            const areaName = humanizeSlug(locationEntry.location_area.name.replace(/-area$/, ''));
            locationEntry.version_details.forEach(vd => {
                const versionName = vd.version.name;
                if (!isGen1To5Version(versionName)) return;
                if (!vd.encounter_details?.length) return;
                if (!areasByVersion[versionName]) areasByVersion[versionName] = new Set();
                areasByVersion[versionName].add(areaName);
            });
        });

        const byGeneration = GENERATIONS_1_TO_5.map(({ gen, label, versions }) => {
            const versionsWithData = versions
                .filter(v => areasByVersion[v.name]?.size > 0)
                .map(v => ({ name: v.name, display: v.display, areas: Array.from(areasByVersion[v.name]).sort() }));
            return versionsWithData.length ? { gen, label, versions: versionsWithData } : null;
        }).filter(Boolean);

        return { hasData: byGeneration.length > 0, byGeneration, error: false };
    } catch (error) {
        console.error(`Error obteniendo ubicaciones para el Pokémon ${pokemonId}:`, error);
        return { hasData: false, byGeneration: [], error: true };
    }
};
