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
  // Ahora devolveremos un array de objetos para cada categoría
  const effectiveness = {
    double_damage_from: [], // Débil a (2x o 4x)
    half_damage_from: [],   // Resistente a (0.5x o 0.25x)
    no_damage_from: [],     // Inmune a (0x)
    // normal_damage_from: [], // Si quisieras mostrar también los de daño normal (1x)
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
    // Si el multiplicador es 1, no lo añadimos a ninguna de estas listas
  }

  // Opcional: ordenar los arrays por nombre de tipo para consistencia
  effectiveness.double_damage_from.sort((a, b) => a.type.localeCompare(b.type));
  effectiveness.half_damage_from.sort((a, b) => a.type.localeCompare(b.type));
  effectiveness.no_damage_from.sort((a, b) => a.type.localeCompare(b.type));


  return effectiveness;
}
