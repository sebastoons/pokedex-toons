import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link para la navegación
import '../App.css'; // Importa los estilos CSS (ajusta la ruta si es necesario)
// Importa tus URLs de imágenes manuales
import manualPokemonImages from '../data/manualPokemonImages'; // Asegúrate de que esta ruta sea correcta

// Componente PokemonCard: Muestra una tarjeta individual de Pokémon en la lista.
// Recibe un objeto 'pokemon' como prop.
// Este objeto ahora DEBE incluir el 'id' y los 'types' (fetcheados en App.jsx).
function PokemonCard({ pokemon }) {
  // Ya no necesitamos fetchear los detalles completos aquí,
  // App.jsx ya nos proporciona el ID y los Tipos necesarios para la lista.
  // const [pokemonDetails, setPokemonDetails] = useState(null);
  // const [loadingDetails, setLoadingDetails] = useState(true);
  // const [errorDetails, setErrorDetails] = useState(null);

  // Estado para indicar si la imagen manual no pudo cargar.
  const [imageLoadError, setImageLoadError] = useState(false);

  // useEffect hook: Ya no necesitamos fetchear detalles aquí.
  // Mantenemos un useEffect simple si necesitas hacer algo cuando el componente se monta,
  // pero el fetch de detalles se elimina.
  /*
  useEffect(() => {
      // Código opcional si necesitas hacer algo al montar la tarjeta
      // Por ejemplo, podrías loggear el nombre del Pokémon
      console.log(`Rendering card for: ${pokemon.name}`);
  }, [pokemon.id]); // Dependencia en el ID del Pokémon
  */

  // Función para manejar el error de carga de la imagen.
  const handleImageLoadError = (e) => {
      console.warn(`Failed to load manual image for ${pokemon.name} from ${e.target.src}`);
      setImageLoadError(true); // Establece el estado imageLoadError a true.
  };

  // --- Determinar la URL de la Imagen ---
  // **MODIFICADO:** Ahora solo intentamos obtener la URL de tu objeto manual.
  // Si no está ahí, usamos el placeholder.
  const pokemonId = pokemon.id; // Obtenemos el ID directamente de la prop 'pokemon'
  const imageUrl = manualPokemonImages[pokemonId]; // Intenta obtener la URL del objeto manual

  // Si no se encontró una URL manual, la URL final será el placeholder.
  const finalImageUrl = imageUrl || `https://placehold.co/100x100/e0e0e0/333?text=No+Img`;


  // --- Renderizado de la Tarjeta ---
  // No necesitamos renderizado condicional por loadingDetails o errorDetails aquí.
  // Eso lo maneja App.jsx antes de renderizar la lista.

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
                    {type.charAt(0).toUpperCase() + type.slice(1)} {/* Nombre del tipo en mayúscula */}
                </span>
            ))}
        </div>
      </div>
    </Link>
  );
}

export default PokemonCard; // Exporta el componente
