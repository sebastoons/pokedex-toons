// src/components/pokemonDetail/PokemonPhysical.js
import React from 'react';
import SizeComparison from '../SizeComparison'; // Importamos el componente de comparación
import './PokemonPhysical.css';

const PokemonPhysical = ({ height, weight, sprite }) => {
  if (!height || !weight) {
    return null; // No mostrar nada si no tenemos los datos
  }

  return (
    <div className="physical-section">
      <h3>Caracteristicas</h3>
      <div className="characteristics-container">
        <div className="characteristic-item">
          <span className="characteristic-icon" role="img" aria-label="Altura">📏</span>
          <span className="characteristic-label">Altura:</span>
          <span className="characteristic-value">{(height / 10).toFixed(1)} m</span>
        </div>
        <div className="characteristic-item">
          <span className="characteristic-icon" role="img" aria-label="Peso">⚖️</span>
          <span className="characteristic-label">Peso:</span>
          <span className="characteristic-value">{(weight / 10).toFixed(1)} kg</span>
        </div>
      </div>

      {/* Usamos el componente de comparación de tamaño que ya existía */}
      <SizeComparison 
        pokemonHeight={height}
        pokemonSprite={sprite}
      />
    </div>
  );
};

export default PokemonPhysical;