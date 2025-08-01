// src/components/PokemonCard.js

import React, { useState } from 'react'; 
import { Link } from 'react-router-dom'; // Importa Link para la navegación
import '../App.css'; // Importa los estilos CSS (ajusta la ruta si es necesario)
// Importa tus URLs de imágenes manuales
import manualPokemonImages from '../data/manualPokemonImages'; // Asegúrate de que esta ruta sea correcta

// Componente PokemonCard: Muestra una tarjeta individual de Pokémon en la lista.
// Recibe un objeto 'pokemon' como prop.
// Este objeto ahora DEBE incluir el 'id' y los 'types' (fetcheados en App.jsx).
function PokemonCard({ pokemon }) {
  
  // Estado para indicar si la imagen manual no pudo cargar.
  const [imageLoadError, setImageLoadError] = useState(false);

  // NUEVA FUNCIÓN: Para traducir nombres de tipos (duplicada de PokemonDetail, pero necesaria aquí)
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
      case 'dark': return 'Siniestro'; // <--- ¡CAMBIO AQUÍ! Añadido 'return'
      case 'fairy': return 'Hada';
      case 'unknown': return 'Desconocido';
      case 'shadow': return 'Sombra';
      default: return typeName.charAt(0).toUpperCase() + typeName.slice(1);
    }
  };

  // Función para manejar el error de carga de la imagen.
  const handleImageLoadError = (e) => {
      console.warn(`Failed to load manual image for ${pokemon.name} from ${e.target.src}`);
      setImageLoadError(true); // Establece el estado imageLoadError a true.
  };

  const pokemonId = pokemon.id; // Obtenemos el ID directamente de la prop 'pokemon'
  const imageUrl = manualPokemonImages[pokemonId]; // Intenta obtener la URL del objeto manual

  // Si no se encontró una URL manual, la URL final será el placeholder.
  const finalImageUrl = imageUrl || `https://placehold.co/100x100/e0e0e0/333?text=No+Img`;

  return (
    // Envuelve la tarjeta con el componente Link para hacerla clicable.
    <Link to={`/pokemon/${pokemonId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="pokemon-card">
        {/* Renderizado condicional para la imagen. */}
        {/* Muestra el placeholder si imageLoadError es true O si no hay URL manual */}
        {imageLoadError || !imageUrl ? ( // Muestra placeholder si falló la carga O si no hay URL manual
            // Muestra el div placeholder
            <div className="pokemon-image-placeholder">No Image</div>
        ) : (
             // Tag <img> para mostrar la imagen manual.
             <img
               src={finalImageUrl} // Usa la URL manual encontrada
               alt={pokemon.name} // Texto alternativo (usamos el nombre de la prop)
               className="pokemon-image" // Clase para estilos CSS.
               onError={handleImageLoadError} // Llama a handleImageLoadError si la imagen manual no carga.
             />
        )}


        {/* Muestra el número del Pokémon (formateado con ceros iniciales). */}
        <p className="pokemon-number">#{pokemonId ? pokemonId.toString().padStart(3, '0') : '???'}</p> {/* Maneja si el ID es null */}
        {/* Muestra el nombre del Pokémon (primera letra en mayúscula). */}
        <h3 className="pokemon-name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>

        {/* Muestra los tipos del Pokémon. */}
        {/* Usamos los tipos de la prop 'pokemon' */}
        <div className="pokemon-types">
            {pokemon.types && pokemon.types.map(type => ( // Verifica que pokemon.types exista
                // Mapea los tipos a spans con clases para estilos de color.
                <span key={type} className={`type-${type}`}>
                    {translateTypeName(type)} {/* ¡MODIFICADO AQUÍ PARA USAR translateTypeName! */}
                </span>
            ))}
        </div>
      </div>
    </Link>
  );
}

export default PokemonCard; // Exporta el componente