// src/services/pokeGen5.js
// Datos "estilo PokeMMo": todo filtrado a Generación I-V (Black/White como
// referencia principal, con fallback a versiones anteriores por movimiento).
import { GEN5_VERSION_GROUPS, REGIONS, VERSION_INFO, humanizeSlug } from '../data/gen5Versions';
import { translateAbilityName } from '../data/abilityNames';
import { getAbilityDescription } from '../data/abilityDescriptions';

const BASE_URL = 'https://pokeapi.co/api/v2/';

// ── Habilidades (idea 5) ─────────────────────────────────────────────────
// La cobertura en español del endpoint /ability/ de PokeAPI es irregular
// tanto para el NOMBRE como para la DESCRIPCIÓN, así que ambos usan como
// fuente principal los diccionarios propios (abilityNames/abilityDescriptions).
// Solo si una habilidad no está en el diccionario (ej. de Gen VI en adelante)
// se recurre a la API como respaldo.
export const fetchAbilitiesData = async (abilityRefs = []) => {
    const resolved = await Promise.all(abilityRefs.map(async (a) => {
        const slug = a.ability.name;
        const translatedName = translateAbilityName(slug);
        const knownDescription = getAbilityDescription(slug);
        if (knownDescription) {
            return { name: translatedName, description: knownDescription, isHidden: a.is_hidden };
        }
        try {
            const res = await fetch(a.ability.url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const apiName = data.names?.find(n => n.language.name === 'es')?.name || translatedName;
            const esDesc = data.effect_entries?.find(e => e.language.name === 'es')?.short_effect
                || data.effect_entries?.find(e => e.language.name === 'es')?.effect
                || data.effect_entries?.find(e => e.language.name === 'en')?.short_effect
                || data.effect_entries?.find(e => e.language.name === 'en')?.effect
                || 'Descripción no disponible.';
            return { name: apiName, description: esDesc.replace(/[\n\r]+/g, ' ').split('\f').join(' '), isHidden: a.is_hidden };
        } catch {
            return { name: translatedName, description: 'Descripción no disponible.', isHidden: a.is_hidden };
        }
    }));
    // Normales primero, la Oculta al final para que resalte.
    return resolved.sort((a, b) => (a.isHidden ? 1 : 0) - (b.isHidden ? 1 : 0));
};

// ── Movimientos (idea 3 y 4: nivel / MT-MO / tutor / crianza, Gen 5) ────────
// Recorre pokemonJson.moves (ya viene con la ficha del Pokémon, sin fetch extra)
// y clasifica cada movimiento en 4 categorías según cómo se aprende en Gen 5,
// prefiriendo Blanco2/Negro2 y sin descartar métodos que solo existan en
// Blanco/Negro (se recorren TODOS los version_groups, no solo el primero
// con datos, para no perder cobertura si un movimiento cambia de método).
export const filterMovesByGen5 = (moves = [], versionGroups = GEN5_VERSION_GROUPS) => {
    const buckets = { levelUp: [], machine: [], tutor: [], egg: [] };
    const seen = { levelUp: new Set(), machine: new Set(), tutor: new Set(), egg: new Set() };
    const methodToBucket = { 'level-up': 'levelUp', machine: 'machine', tutor: 'tutor', egg: 'egg' };

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

// Para un movimiento aprendido por MT/MO, resuelve si es Máquina Técnica (MT)
// o Máquina Oculta/de Campo (MO) y su número, en Gen 5.
const resolveMachineLabel = async (moveData, versionGroups) => {
    if (!moveData.machines?.length) return null;
    for (const vg of versionGroups) {
        const match = moveData.machines.find(m => m.version_group.name === vg);
        if (!match) continue;
        try {
            const res = await fetch(match.machine.url);
            if (!res.ok) continue;
            const data = await res.json();
            const itemName = data.item?.name || '';
            const isHM = itemName.startsWith('hm');
            const digits = itemName.replace(/^[a-z]+/, '');
            if (!digits) continue;
            const num = digits.padStart(2, '0');
            return { kind: isHM ? 'MO' : 'MT', number: num, label: `${isHM ? 'MO' : 'MT'} ${num}` };
        } catch {
            // sigue intentando con el siguiente version_group
        }
    }
    return null;
};

// Trae los detalles completos (nombre en español, tipo, poder, pp, precisión,
// descripción y, para MT/MO, el número de máquina) de todos los movimientos
// filtrados, sin repetir peticiones para un mismo movimiento que aparezca en
// más de una categoría (ej. nivel y MT a la vez).
export const fetchGen5MovesData = async (movesBuckets, versionGroups = GEN5_VERSION_GROUPS) => {
    const uniqueRefs = new Map();
    Object.values(movesBuckets).flat().forEach(m => { if (!uniqueRefs.has(m.url)) uniqueRefs.set(m.url, m); });

    const entries = await Promise.all([...uniqueRefs.values()].map(async (ref) => {
        try {
            const res = await fetch(ref.url);
            if (!res.ok) throw new Error(res.status);
            const data = await res.json();
            const esName = data.names?.find(n => n.language.name === 'es')?.name || humanizeSlug(data.name);
            const esDesc = data.flavor_text_entries?.find(f => f.language.name === 'es'
                    && versionGroups.includes(f.version_group.name))?.flavor_text
                || data.flavor_text_entries?.find(f => f.language.name === 'es')?.flavor_text
                || data.effect_entries?.find(e => e.language.name === 'es')?.short_effect
                || 'Sin descripción disponible.';

            const machineLabel = await resolveMachineLabel(data, versionGroups);

            return [ref.url, {
                name: esName,
                type: data.type?.name || 'normal',
                power: data.power,
                pp: data.pp,
                accuracy: data.accuracy,
                damageClass: data.damage_class?.name || 'physical',
                description: esDesc.replace(/[\n\r]+/g, ' ').split('\f').join(' ').trim(),
                machineLabel: machineLabel?.label || null,
            }];
        } catch {
            return [ref.url, {
                name: humanizeSlug(ref.name), type: 'normal', power: null, pp: null, accuracy: null,
                damageClass: null, description: 'Sin descripción disponible.', machineLabel: null,
            }];
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

// ── Ubicaciones salvajes (idea 9, Gen I-V, filtradas por región) ───────────
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

        // versionName -> Map(areaName -> % de probabilidad más alto visto)
        const chanceByVersion = {};
        data.forEach(locationEntry => {
            const areaName = humanizeSlug(locationEntry.location_area.name.replace(/-area$/, ''));
            locationEntry.version_details.forEach(vd => {
                const versionName = vd.version.name;
                if (!VERSION_INFO[versionName]) return;
                if (!vd.encounter_details?.length) return;
                const chance = vd.max_chance ?? Math.max(0, ...vd.encounter_details.map(e => e.chance || 0));
                if (!chanceByVersion[versionName]) chanceByVersion[versionName] = new Map();
                const prev = chanceByVersion[versionName].get(areaName) || 0;
                chanceByVersion[versionName].set(areaName, Math.max(prev, chance));
            });
        });

        const byRegion = REGIONS.map(region => {
            const versions = region.versions
                .filter(v => chanceByVersion[v]?.size > 0)
                .map(v => ({
                    name: v,
                    display: VERSION_INFO[v].display,
                    areas: Array.from(chanceByVersion[v].entries())
                        .map(([area, chance]) => ({ area, chance }))
                        .sort((a, b) => b.chance - a.chance),
                }));
            return versions.length ? { id: region.id, label: region.label, versions } : null;
        }).filter(Boolean);

        return { hasData: byRegion.length > 0, byRegion, error: false };
    } catch (error) {
        console.error(`Error obteniendo ubicaciones para el Pokémon ${pokemonId}:`, error);
        return { hasData: false, byRegion: [], error: true };
    }
};
