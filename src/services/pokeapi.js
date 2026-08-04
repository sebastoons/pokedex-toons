// src/services/pokeapi.js

const BASE_URL = 'https://pokeapi.co/api/v2/';

export async function fetchPokemon(nameOrId) {
  try {
    const response = await fetch(`${BASE_URL}pokemon/${nameOrId}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el Pokémon: ${response.statusText} (${response.status})`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Pokémon ${nameOrId}:`, error);
    throw error;
  }
}

export async function fetchTypeDetails(typeName) {
  try {
    const response = await fetch(`${BASE_URL}type/${typeName}`);
    if (!response.ok) {
      throw new Error(`Error al obtener los detalles del tipo ${typeName}: ${response.statusText} (${response.status})`);
    }
    const data = await response.json();
    return data.damage_relations;
  } catch (error) {
    console.error(`Error fetching type details for ${typeName}:`, error);
    throw error;
  }
}

export async function getPokemonTypeEffectiveness(pokemonTypes) {
  const damageMultipliers = {}; // Objeto para llevar la cuenta de la efectividad acumulada para cada tipo de ataque

  // Todas las relaciones de tipo se piden en paralelo; cada una conserva su
  // propio try/catch para no bloquear al resto si una falla.
  const allTypeRelations = await Promise.all(pokemonTypes.map(async (typeInfo) => {
    const typeName = typeInfo.type.name;
    try {
      return await fetchTypeDetails(typeName);
    } catch (error) {
      console.warn(`No se pudieron obtener las relaciones de daño para el tipo ${typeName}. Continuando con otros tipos.`, error);
      return null;
    }
  }));

  for (const typeRelations of allTypeRelations) {
    if (!typeRelations) continue;
    // Procesa debilidades (double_damage_from)
    for (const weakTo of typeRelations.double_damage_from) {
      const type = weakTo.name;
      damageMultipliers[type] = (damageMultipliers[type] || 1) * 2;
    }
    // Procesa resistencias (half_damage_from)
    for (const resistTo of typeRelations.half_damage_from) {
      const type = resistTo.name;
      damageMultipliers[type] = (damageMultipliers[type] || 1) * 0.5;
    }
    // Procesa inmunidades (no_damage_from)
    for (const immuneTo of typeRelations.no_damage_from) {
      const type = immuneTo.name;
      damageMultipliers[type] = 0; // La inmunidad siempre lo hace 0x, sobrescribiendo cualquier otro multiplicador
    }
  }

  // Clasifica los tipos según el multiplicador de daño final
  const effectiveness = {
    double_damage_from: [], // Débil a (2x o 4x)
    half_damage_from: [],   // Resistente a (0.5x o 0.25x)
    no_damage_from: [],     // Inmune a (0x)
  };

  for (const type in damageMultipliers) {
    const multiplier = damageMultipliers[type];
    if (multiplier === 0) {
      effectiveness.no_damage_from.push({ type: type, multiplier: 0 });
    } else if (multiplier < 1) { // 0.5x o 0.25x
      effectiveness.half_damage_from.push({ type: type, multiplier: multiplier });
    } else if (multiplier > 1) { // 2x o 4x
      effectiveness.double_damage_from.push({ type: type, multiplier: multiplier });
    }
  }

  effectiveness.double_damage_from.sort((a, b) => a.type.localeCompare(b.type));
  effectiveness.half_damage_from.sort((a, b) => a.type.localeCompare(b.type));
  effectiveness.no_damage_from.sort((a, b) => a.type.localeCompare(b.type));

  return effectiveness;
}

// NUEVA FUNCIÓN: Para obtener la cadena de evolución
export async function fetchEvolutionChain(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} fetching evolution chain from ${url}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching evolution chain:", error);
        throw error;
    }
}

// Cachea el resultado por id/nombre — esta función se llama una vez por
// integrante de cada cadena evolutiva mostrada, y las mismas especies se
// repiten constantemente al navegar entre Pokémon emparentados.
const basicInfoCache = new Map();

// NUEVA FUNCIÓN: Para obtener detalles básicos de un Pokémon (nombre y sprite)
export async function fetchPokemonBasicInfo(idOrName) {
    if (basicInfoCache.has(idOrName)) return basicInfoCache.get(idOrName);
    try {
        const url = `${BASE_URL}pokemon/${idOrName}/`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} fetching basic info for ${idOrName}`);
        }
        const data = await response.json();
        // La URL de especie solo se conoce tras resolver esta respuesta,
        // así que este segundo fetch no puede lanzarse en paralelo con el primero.
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        const spanishNameEntry = speciesData.names.find(nameEntry => nameEntry.language.name === 'es');
        // Usa el nombre traducido, o el nombre original capitalizado si no hay traducción
        const translatedName = spanishNameEntry ? spanishNameEntry.name : data.name.charAt(0).toUpperCase() + data.name.slice(1);

        const result = {
            id: data.id,
            name: translatedName,
            // Prioriza official-artwork, si no está usa front_default, si no, un placeholder
            sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default || `https://placehold.co/96x96/e0e0e0/333?text=No+Img`,
        };
        basicInfoCache.set(idOrName, result);
        return result;
    } catch (error) {
        console.error(`Error fetching basic info for ${idOrName}:`, error);
        // Retornar un objeto con información parcial o un placeholder si falla
        return {
            id: idOrName,
            name: idOrName.charAt(0).toUpperCase() + idOrName.slice(1),
            sprite: `https://placehold.co/96x96/e0e0e0/333?text=No+Img`,
        };
    }
}