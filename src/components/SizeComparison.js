// src/components/SizeComparison.js
import React from 'react';
// Importamos la imagen de la silueta que guardaste en el paso 1
import humanSilhouette from '../assets/imgindex/humano_silueta.png'; 
// No olvides importar el CSS si es necesario o asegúrate de que App.css se aplique globalmente.

function SizeComparison({ pokemonHeight, pokemonSprite }) {
  // 1. Definir constantes de referencia
  const HUMAN_AVG_HEIGHT_DM = 17; // Altura humana promedio: 1.7m = 17 decímetros
  const CONTAINER_HEIGHT_PX = 200; // La altura en píxeles de nuestro contenedor .size-comparison

  // 2. Calcular la altura del Pokémon en píxeles
  // pokemonHeight viene de la API en decímetros
  let pokemonHeightPx = (pokemonHeight / HUMAN_AVG_HEIGHT_DM) * CONTAINER_HEIGHT_PX;

  // 3. Lógica para que los pokémon muy pequeños sigan siendo visibles
  if (pokemonHeightPx < 20) {
    pokemonHeightPx = 20; // Un tamaño mínimo de 20px
  }
  // Lógica para que los pokémon gigantes no se salgan del contenedor
  if (pokemonHeightPx > CONTAINER_HEIGHT_PX) {
    pokemonHeightPx = CONTAINER_HEIGHT_PX;
  }

  // Si no tenemos un sprite, no mostramos nada.
  if (!pokemonSprite) {
    return null;
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
        {/* Silueta humana de referencia */}
        <img
          src={humanSilhouette}
          className="human-silhouette"
          alt="Silueta Humana"
        />
      </div>
      <p className="comparison-note">
        Tamaño Pokémon VS Humano (1.70m)
      </p>
    </div>
  );
}

export default SizeComparison;