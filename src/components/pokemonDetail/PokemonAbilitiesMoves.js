// src/components/pokemonDetail/PokemonAbilitiesMoves.js
import React from 'react';
import './PokemonAbilitiesMoves.css';

const PokemonAbilitiesMoves = ({ ability, moves, primaryType }) => {
  return (
    <div className="abilities-moves-section">
      <h4>Habilidad</h4>
      {ability ? (
        <div className="ability-detail-container">
          <span
            className={`ability-badge type-${primaryType || 'normal'}`}
          >
            {ability.name}
            {ability.isHidden && " (Habilidad Oculta)"}
          </span>
          <p className="ability-description">{ability.description}</p>
        </div>
      ) : (
        <p>Este Pokémon no tiene habilidades listadas.</p>
      )}

      <h4>Movimientos</h4>
      {moves && moves.length > 0 ? (
        <div className="moves-container">
          {moves.map(move => (
            <span
              key={move.id}
              className={`type-badge type-${move.type}`} 
            >
              {move.name}
            </span>
          ))}
        </div>
      ) : (
        <p>No se encontraron movimientos para este Pokémon.</p>
      )}
    </div>
  );
};

export default PokemonAbilitiesMoves;