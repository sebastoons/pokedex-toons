// src/components/pokemonDetail/PokemonStats.js
import React from 'react';
import './PokemonStats.css'; // Crearemos este archivo a continuación

// Función para traducir los nombres de las estadísticas
const getStatName = (statName) => {
  switch (statName) {
    case 'hp': return 'HP';
    case 'attack': return 'Ataque';
    case 'defense': return 'Defensa';
    case 'special-attack': return 'Ataque Esp';
    case 'special-defense': return 'Defensa Esp';
    case 'speed': return 'Velocidad';
    default: return statName;
  }
};

const PokemonStats = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return null; // No renderizar nada si no hay estadísticas
  }

  return (
    <div className="stats-section">
      <h3>Estadisticas Base</h3>
      <div className="stats-container">
        {stats.map(statInfo => (
          <div key={statInfo.stat.name} className="stat-item">
            <span className="stat-name">{getStatName(statInfo.stat.name)}:</span>
            <div className="stat-bar-background">
              <div 
                className="stat-bar-fill" 
                style={{ width: `${(statInfo.base_stat / 255) * 100}%` }}
              >
                <span className="stat-value">{statInfo.base_stat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonStats;