// src/components/SizeComparison.js
import React from 'react';
import humanSilhouette from '../assets/imgindex/humano_silueta.png'; 

function SizeComparison({ pokemonHeight, pokemonSprite }) {
  const HUMAN_AVG_HEIGHT_DM = 17; // Altura humana promedio: 1.7m = 17 decímetros
  const CONTAINER_HEIGHT_PX = 200; // La altura en píxeles de nuestro contenedor
  const MIN_POKEMON_SIZE_PX = 20; // Tamaño mínimo para Pokémon muy pequeños

  // Si no tenemos un sprite, no mostramos nada.
  if (!pokemonSprite) {
    return null;
  }

  let pokemonHeightPx;
  let humanHeightPx;

  // NUEVA LÓGICA: Comparación proporcional realista
  if (pokemonHeight <= HUMAN_AVG_HEIGHT_DM) {
    // Caso 1: Pokémon más pequeño o igual que humano (≤ 1.70m)
    // El humano mantiene su tamaño completo (CONTAINER_HEIGHT_PX)
    humanHeightPx = CONTAINER_HEIGHT_PX;
    pokemonHeightPx = (pokemonHeight / HUMAN_AVG_HEIGHT_DM) * CONTAINER_HEIGHT_PX;
    
    // Asegurar tamaño mínimo visible
    if (pokemonHeightPx < MIN_POKEMON_SIZE_PX) {
      pokemonHeightPx = MIN_POKEMON_SIZE_PX;
    }
  } else {
    // Caso 2: Pokémon más grande que humano (> 1.70m)
    // El Pokémon ocupa el contenedor completo y el humano se reduce proporcionalmente
    pokemonHeightPx = CONTAINER_HEIGHT_PX;
    humanHeightPx = (HUMAN_AVG_HEIGHT_DM / pokemonHeight) * CONTAINER_HEIGHT_PX;
    
    // Asegurar que el humano no sea demasiado pequeño
    if (humanHeightPx < 30) {
      humanHeightPx = 30; // Tamaño mínimo para que sea visible
    }
  }

  return (
    <div className="size-comparison-container">
      <div className="size-comparison">
        {/* Imagen del Pokémon con estilo dinámico */}
        <img
          src={pokemonSprite}
          alt="Silueta del Pokémon"
          className="pokemon-comparison-image"
          style={{ height: `${pokemonHeightPx}px` }}
        />
        {/* Silueta humana de referencia con tamaño dinámico */}
        <img
          src={humanSilhouette}
          className="human-silhouette"
          alt="Silueta Humana"
          style={{ height: `${humanHeightPx}px` }}
        />
      </div>
      <p className="comparison-note">
        Tamaño Pokémon VS Humano (1.70m)
      </p>
    </div>
  );
}

export default SizeComparison;