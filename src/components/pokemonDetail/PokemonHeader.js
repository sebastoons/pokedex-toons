// src/components/pokemonDetail/PokemonHeader.js
import React from 'react';
import './PokemonHeader.css';

// Función para traducir nombres de tipos
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
      default: return typeName.charAt(0).toUpperCase() + typeName.slice(1);
    }
};

// Función para obtener la descripción en español
const getSpanishDescription = (flavorTextEntries) => {
    if (!flavorTextEntries || flavorTextEntries.length === 0) {
      return "Descripción no disponible.";
    }
    const spanishEntry = flavorTextEntries.find(entry => entry.language.name === 'es');
    if (spanishEntry) {
      return spanishEntry.flavor_text.replace(/[\n\r\f]/g, ' ');
    }
    const englishEntry = flavorTextEntries.find(entry => entry.language.name === 'en');
    if (englishEntry) {
      return englishEntry.flavor_text.replace(/[\n\r\f]/g, ' ');
    }
    return "Descripción en español no disponible.";
};


const PokemonHeader = ({ pokemon, species }) => {
  if (!pokemon) {
    return null;
  }

  // --- CORRECCIÓN AQUÍ ---
  // Hacemos la comprobación de 'sprites' más segura con encadenamiento opcional (?.)
  const imageUrl =
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default ||
    `https://placehold.co/250x250/e0e0e0/333?text=No+Img`;

  return (
    <div className="header-section">
      <h2>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} #{pokemon.id.toString().padStart(3, '0')}</h2>
      
      <img src={imageUrl} alt={pokemon.name} className="pokemon-detail-image"/>

      <h3>Tipos</h3>
      <div className="pokemon-types">
        {/* Añadimos una comprobación aquí también por seguridad */}
        {pokemon.types && pokemon.types.map(typeInfo => (
          <span key={typeInfo.type.name} className={`type-badge type-${typeInfo.type.name.toLowerCase()}`}>
            {translateTypeName(typeInfo.type.name)}
          </span>
        ))}
      </div>

      <h3>Descripción Pokémon</h3>
      <p className="pokedex-entry-text">
          {species ? getSpanishDescription(species.flavor_text_entries) : "Cargando descripción..."}
      </p>
    </div>
  );
};

export default PokemonHeader;