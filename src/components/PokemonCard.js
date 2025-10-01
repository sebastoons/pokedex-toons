// src/components/PokemonCard.js

import React, { useState } from 'react'; 
import { Link } from 'react-router-dom';
import '../App.css';
import manualPokemonImages from '../data/manualPokemonImages';
// *** NUEVO: Importar el tracker ***
import analyticsTracker from '../utils/analyticsTracker';

function PokemonCard({ pokemon }) {
  
  const [imageLoadError, setImageLoadError] = useState(false);

  const translateTypeName = (typeName) => {
    switch (typeName.toLowerCase()) {
      case 'normal': return 'Normal';
      case 'fire': return 'Fuego';
      case 'water': return 'Agua';
      case 'grass': return 'Planta';
      case 'electric': return 'Eléctrico';
      case 'ice': return 'Hielo';
      case 'fighting': return 'Lucha';
      case 'poison': return 'Veneno';
      case 'ground': return 'Tierra';
      case 'flying': return 'Volador';
      case 'psychic': return 'Psíquico';
      case 'bug': return 'Bicho';
      case 'rock': return 'Roca';
      case 'ghost': return 'Fantasma';
      case 'dragon': return 'Dragón';
      case 'steel': return 'Acero';
      case 'dark': return 'Siniestro';
      case 'fairy': return 'Hada';
      case 'unknown': return 'Desconocido';
      case 'shadow': return 'Sombra';
      default: return typeName.charAt(0).toUpperCase() + typeName.slice(1);
    }
  };

  const handleImageLoadError = (e) => {
      console.warn(`Failed to load manual image for ${pokemon.name} from ${e.target.src}`);
      setImageLoadError(true);
  };

  // *** NUEVO: Función para trackear cuando se hace clic en el Pokémon ***
  const handleCardClick = () => {
    analyticsTracker.trackPokemonView(pokemon.id, pokemon.name);
  };

  const pokemonId = pokemon.id;
  const imageUrl = manualPokemonImages[pokemonId];
  const finalImageUrl = imageUrl || `https://placehold.co/100x100/e0e0e0/333?text=No+Img`;

  return (
    <Link 
      to={`/pokemon/${pokemonId}`} 
      style={{ textDecoration: 'none', color: 'inherit' }}
      onClick={handleCardClick}
    >
      <div className="pokemon-card">
        {imageLoadError || !imageUrl ? (
            <div className="pokemon-image-placeholder">No Image</div>
        ) : (
             <img
               src={finalImageUrl}
               alt={pokemon.name}
               className="pokemon-image"
               onError={handleImageLoadError}
             />
        )}

        <p className="pokemon-number">#{pokemonId ? pokemonId.toString().padStart(3, '0') : '???'}</p>
        <h3 className="pokemon-name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>

        <div className="pokemon-types">
            {pokemon.types && pokemon.types.map(type => (
                <span key={type} className={`type-${type}`}>
                    {translateTypeName(type)}
                </span>
            ))}
        </div>
      </div>
    </Link>
  );
}

export default PokemonCard;