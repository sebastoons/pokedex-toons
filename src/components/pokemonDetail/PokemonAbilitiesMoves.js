// src/components/pokemonDetail/PokemonAbilitiesMoves.js
// Idea 5: se listan TODAS las habilidades del Pokémon (no solo la primera),
// marcando explícitamente cuál es la Habilidad Oculta.
import React from 'react';
import './PokemonAbilitiesMoves.css';

const PokemonAbilitiesMoves = ({ abilities, primaryType }) => {
  return (
    <div className="abilities-moves-section">
      <h4>Habilidades</h4>
      {abilities && abilities.length > 0 ? (
        <div className="abilities-list">
          {abilities.map(ability => (
            <div key={ability.name} className="ability-detail-container">
              <div className="ability-badge-row">
                <span className={`ability-badge type-${primaryType || 'normal'} ${ability.isHidden ? 'ability-badge-hidden' : ''}`}>
                  {ability.name}
                </span>
                {ability.isHidden && <span className="ability-hidden-tag">✨ Habilidad Oculta</span>}
              </div>
              <p className="ability-description">{ability.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Este Pokémon no tiene habilidades listadas.</p>
      )}
    </div>
  );
};

export default PokemonAbilitiesMoves;
