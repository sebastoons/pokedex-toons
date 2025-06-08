// src/services/pokeapi.js

const BASE_URL = 'https://pokeapi.co/api/v2/';

export async function fetchPokemon(nameOrId) {
  try {
    const response = await fetch(`${BASE_URL}pokemon/${nameOrId}`);
    if (!response.ok) {
      // Si la respuesta no es OK, lanza un error con el estado
      throw new Error(`Error al obtener el Pokémon: ${response.statusText} (${response.status})`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Pokémon ${nameOrId}:`, error);
    // Vuelve a lanzar el error para que el componente que llama lo pueda manejar
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
    throw error; // Propagar el error
  }
}

export async function getPokemonTypeEffectiveness(pokemonTypes) {
  const effectiveness = {
    double_damage_from: [], // Debilidades (recibe 2x daño)
    half_damage_from: [],   // Resistencias (recibe 0.5x daño)
    no_damage_from: [],     // Inmunidades (recibe 0x daño)
  };

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
        // Si hay un error en un tipo, no impedimos que se procesen otros tipos
    }
  }

  // Clasifica los tipos según el multiplicador de daño final
  for (const type in damageMultipliers) {
    const multiplier = damageMultipliers[type];
    if (multiplier === 0) {
      effectiveness.no_damage_from.push(type);
    } else if (multiplier < 1) { // Esto cubrirá 0.5x y 0.25x
      effectiveness.half_damage_from.push(type);
    } else if (multiplier > 1) { // Esto cubrirá 2x y 4x
      effectiveness.double_damage_from.push(type);
    }
  }

  return effectiveness;
}