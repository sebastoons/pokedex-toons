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

  for (const typeInfo of pokemonTypes) {
    const typeName = typeInfo.type.name;
    try {
        const typeRelations = await fetchTypeDetails(typeName);

        if (typeRelations) {
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
    } catch (error) {
        console.warn(`No se pudieron obtener las relaciones de daño para el tipo ${typeName}. Continuando con otros tipos.`, error);
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

// NUEVA FUNCIÓN: Para obtener detalles básicos de un Pokémon (nombre y sprite)
export async function fetchPokemonBasicInfo(idOrName) {
    try {
        const url = `${BASE_URL}pokemon/${idOrName}/`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} fetching basic info for ${idOrName}`);
        }
        const data = await response.json();
        // Intentar obtener el nombre en español si está disponible (desde la especie)
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        const spanishNameEntry = speciesData.names.find(nameEntry => nameEntry.language.name === 'es');
        // Usa el nombre traducido, o el nombre original capitalizado si no hay traducción
        const translatedName = spanishNameEntry ? spanishNameEntry.name : data.name.charAt(0).toUpperCase() + data.name.slice(1);

        return {
            id: data.id,
            name: translatedName,
            // Prioriza official-artwork, si no está usa front_default, si no, un placeholder
            sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default || `https://placehold.co/96x96/e0e0e0/333?text=No+Img`,
        };
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
