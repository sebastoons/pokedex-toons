// src/components/PokemonDisplay.js
import React from 'react';
import manualPokemonImages from '../data/manualPokemonImages';  // Ajusta la ruta según tu estructura
import './PokemonDisplay.css';

const PokemonDisplay = ({ pokemon, currentHp, maxHp, isPlayer, isAttacking, isDamaged }) => {
    const displayName = pokemon?.name || (isPlayer ? 'Tu Pokémon' : 'Pokémon Oponente');
    const hpPercentage = Math.max(0, (currentHp / maxHp) * 100);
    
    // Función para obtener la imagen correcta
    const getPokemonImage = () => {
        if (!pokemon?.id) return '/imgmanual/default.png';
        
        // Primero intenta con la imagen manual
        const manualImage = manualPokemonImages[pokemon.id];
        if (manualImage) return manualImage;
        
        // Si no existe en manual, usa la de la API como fallback
        return pokemon.sprites?.other?.['official-artwork']?.front_default || 
               (isPlayer ? pokemon.sprites?.back_default : pokemon.sprites?.front_default) ||
               '/imgmanual/default.png';
    };

    return (
        <div className={`pokemon-display ${isPlayer ? 'player' : 'opponent'} ${isAttacking ? 'attacking' : ''} ${isDamaged ? 'damaged' : ''}`}>
            <h3 className="pokemon-name">
                {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
            </h3>
            
            <div className="pokemon-image-container">
                <img
                    src={getPokemonImage()}
                    alt={displayName}
                    className="pokemon-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/imgmanual/default.png';
                    }}
                />
            </div>
            
            <div className="hp-display">
                <div className="hp-bar-container">
                    <div 
                        className="hp-bar"
                        style={{ 
                            width: `${hpPercentage}%`,
                            backgroundColor: hpPercentage > 50 ? '#4CAF50' : 
                                           hpPercentage > 20 ? '#FFC107' : '#F44336'
                        }}
                    />
                </div>
                <span className="hp-text">{currentHp} / {maxHp}</span>
            </div>
        </div>
    );
};

export default PokemonDisplay;