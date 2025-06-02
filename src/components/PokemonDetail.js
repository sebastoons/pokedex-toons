import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css'; // Asegúrate de que la ruta sea correcta

function PokemonDetail() {
  const { pokemonId } = useParams();
  const navigate = useNavigate();

  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speciesData, setSpeciesData] = useState(null);
  const [detailedAbilities, setDetailedAbilities] = useState([]);
  const [pokemonMoves, setPokemonMoves] = useState([]); // Estado para los movimientos

  useEffect(() => {
    const fetchPokemonData = async () => {
      setLoading(true);
      setError(null);
      setPokemonData(null);
      setSpeciesData(null);
      setDetailedAbilities([]);
      setPokemonMoves([]); // Limpiar movimientos previos

      try {
        // --- Fetch datos principales del Pokémon ---
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!pokemonResponse.ok) {
          throw new Error(`HTTP error! status: ${pokemonResponse.status}`);
        }
        const pokemonJson = await pokemonResponse.json();
        setPokemonData(pokemonJson);

        // --- Fetch datos de la especie ---
        if (pokemonJson.species?.url) {
          const speciesResponse = await fetch(pokemonJson.species.url);
          if (!speciesResponse.ok) {
            throw new Error(`HTTP error! status: ${speciesResponse.status} fetching species`);
          }
          const speciesJson = await speciesResponse.json();
          setSpeciesData(speciesJson);
        } else {
            console.warn("Species URL not found for this Pokémon.");
            setSpeciesData({ flavor_text_entries: [] });
        }

        // --- Fetch detalles y nombres en español de las habilidades ---
        if (pokemonJson.abilities && pokemonJson.abilities.length > 0) {
          const abilitiesPromises = pokemonJson.abilities.map(async (abilityInfo) => {
            // ... (código de fetch de habilidades como en la respuesta anterior)
            try {
              const abilityResponse = await fetch(abilityInfo.ability.url);
              if (!abilityResponse.ok) {
                console.warn(`No se pudieron obtener detalles para la habilidad: ${abilityInfo.ability.name}. Estado: ${abilityResponse.status}`);
                const fallbackName = abilityInfo.ability.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return { id: abilityInfo.ability.name, name: fallbackName, isHidden: abilityInfo.is_hidden };
              }
              const abilityJson = await abilityResponse.json();
              const spanishNameEntry = abilityJson.names.find(nameEntry => nameEntry.language.name === 'es');
              const translatedName = spanishNameEntry ? spanishNameEntry.name : abilityInfo.ability.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              return { id: abilityJson.id, name: translatedName, isHidden: abilityInfo.is_hidden };
            } catch (abilityFetchError) {
                console.error(`Error al obtener detalle de habilidad para ${abilityInfo.ability.name}:`, abilityFetchError);
                const fallbackName = abilityInfo.ability.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return { id: abilityInfo.ability.name, name: fallbackName, isHidden: abilityInfo.is_hidden };
            }
          });
          const resolvedAbilities = await Promise.all(abilitiesPromises);
          setDetailedAbilities(resolvedAbilities);
        } else {
          setDetailedAbilities([]);
        }

        // --- Fetch detalles y nombres en español de los primeros 4 Movimientos ---
        if (pokemonJson.moves && pokemonJson.moves.length > 0) {
          const selectedMovesData = pokemonJson.moves.slice(10, 14); // Tomar los primeros 4 movimientos

          const movesPromises = selectedMovesData.map(async (moveEntry) => {
            try {
              const moveResponse = await fetch(moveEntry.move.url);
              if (!moveResponse.ok) {
                console.warn(`No se pudieron obtener detalles para el movimiento: ${moveEntry.move.name}. Estado: ${moveResponse.status}`);
                const fallbackName = moveEntry.move.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return {
                  id: moveEntry.move.name,
                  name: fallbackName,
                  type: 'unknown', // Tipo desconocido como fallback
                };
              }
              const moveJson = await moveResponse.json();
              const spanishNameEntry = moveJson.names.find(nameEntry => nameEntry.language.name === 'es');
              
              const translatedName = spanishNameEntry
                ? spanishNameEntry.name
                : moveEntry.move.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

              return {
                id: moveJson.id,
                name: translatedName,
                type: moveJson.type.name.toLowerCase(), // ej. 'fire', 'water', 'normal' (asegurar minúsculas para la clase CSS)
              };
            } catch (moveFetchError) {
                console.error(`Error al obtener detalle de movimiento para ${moveEntry.move.name}:`, moveFetchError);
                const fallbackName = moveEntry.move.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return {
                  id: moveEntry.move.name,
                  name: fallbackName,
                  type: 'unknown',
                };
            }
          });
          const resolvedMoves = await Promise.all(movesPromises);
          setPokemonMoves(resolvedMoves);
        } else {
          setPokemonMoves([]);
        }

      } catch (err) {
        setError(err);
        console.error(`Error al obtener datos del Pokémon ID ${pokemonId}: `, err);
      } finally {
        setLoading(false);
      }
    };

    if (pokemonId) {
        fetchPokemonData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemonId]);

  const handleGoBack = () => {
    navigate('/');
  };

  const getStatName = (statName) => {
    switch (statName) {
      case 'hp': return 'HP';
      case 'attack': return 'Ataque';
      case 'defense': return 'Defensa';
      case 'special-attack': return 'Ataque Esp.';
      case 'special-defense': return 'Defensa Esp.';
      case 'speed': return 'Velocidad';
      default: return statName;
    }
  };

  const getSpanishDescription = (flavorTextEntries) => {
    if (!flavorTextEntries || flavorTextEntries.length === 0) return "Descripción no disponible.";
    const spanishEntry = flavorTextEntries.find(entry => entry.language.name === 'es');
    return spanishEntry ? spanishEntry.flavor_text.replace(/[\n\r\f]/g, ' ') : "Descripción en español no disponible.";
  };

  if (loading) {
    return <div className="loading">Cargando datos del Pokémon ID {pokemonId}...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error al cargar datos del Pokémon ID {pokemonId}: {error.message}
        <button onClick={handleGoBack} style={{ marginTop: '20px', padding: '10px' }}>
          Volver a la Pokedex
        </button>
      </div>
    );
  }
  
  if (!pokemonData) {
    return (
      <div className="error">
        No se encontraron datos para el Pokémon ID {pokemonId}.
        <button onClick={handleGoBack} style={{ marginTop: '20px', padding: '10px' }}>
          Volver a la Pokedex
        </button>
      </div>
    );
  }

  const imageUrl =
    pokemonData.sprites.other?.["official-artwork"]?.front_default ||
    pokemonData.sprites.front_default ||
    `https://placehold.co/250x250/e0e0e0/333?text=No+Img`;

  const firstPokemonType = pokemonData?.types?.[0]?.type.name;

  return (
    <div className="pokemon-detail-view">
      <button onClick={handleGoBack} className="back-button">
        ← Volver a la Pokedex
      </button>

      <h2>{pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)} #{pokemonData.id.toString().padStart(3, '0')}</h2>

      <img src={imageUrl} alt={pokemonData.name} className="pokemon-detail-image"/>

      <h3>Tipos</h3>
      <div className="pokemon-types" style={{ marginBottom: '20px' }}>
        {pokemonData.types.map(typeInfo => (
          <span key={typeInfo.type.name} className={`type-badge type-${typeInfo.type.name.toLowerCase()}`}>
            {typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
          </span>
        ))}
      </div>

      <h3>Estadísticas Base</h3>
      <div className="stats-container">
        {pokemonData.stats.map(statInfo => (
          <div key={statInfo.stat.name} className="stat-item">
            <span className="stat-name">{getStatName(statInfo.stat.name)}:</span>
            <div className="stat-bar-background">
              <div className="stat-bar-fill" style={{ width: `${(statInfo.base_stat / 255) * 100}%` }}>
                <span className="stat-value">{statInfo.base_stat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3>Características</h3>
      <div className="characteristics-container">
        <div className="characteristic-item">
          <span className="characteristic-icon" role="img" aria-label="Altura">📏</span>
          <span className="characteristic-label">Altura:</span>
          <span className="characteristic-value">{(pokemonData.height / 10).toFixed(1)} m</span>
        </div>
        <div className="characteristic-item">
          <span className="characteristic-icon" role="img" aria-label="Peso">⚖️</span>
          <span className="characteristic-label">Peso:</span>
          <span className="characteristic-value">{(pokemonData.weight / 10).toFixed(1)} kg</span>
        </div>
      </div>

      <h4>Habilidades:</h4>
      {detailedAbilities.length > 0 ? (
        <div className="abilities-container">
          {detailedAbilities.map(abilityDetail => (
            <span
              key={abilityDetail.id}
              className={`ability-badge ${firstPokemonType ? `type-${firstPokemonType.toLowerCase()}` : 'type-normal'}`}
            >
              {abilityDetail.name}
              {abilityDetail.isHidden && " (Habilidad Oculta)"}
            </span>
          ))}
        </div>
      ) : (
        <p style={{ paddingLeft: '20px', marginBottom: '20px' }}>Este Pokémon no tiene habilidades listadas.</p>
      )}

      {/* >>>>> SECCIÓN DE MOVIMIENTOS <<<<< */}
      <h4>Movimientos Destacados:</h4>
      {pokemonMoves.length > 0 ? (
        <div className="moves-container"> {/* Puedes reutilizar .abilities-container si el estilo es idéntico o crear .moves-container */}
          {pokemonMoves.map(moveDetail => (
            <span
              key={moveDetail.id}
              className={`type-badge type-${moveDetail.type}`} // Usa el tipo del movimiento para el color. Ej: type-fire, type-water
            >
              {moveDetail.name}
            </span>
          ))}
        </div>
      ) : (
        <p style={{ paddingLeft: '20px', marginBottom: '20px' }}>No se encontraron movimientos destacados para este Pokémon.</p>
      )}
      {/* >>>>> FIN SECCIÓN DE MOVIMIENTOS <<<<< */}

      <h3>Entrada de Pokedex</h3>
      <p>{getSpanishDescription(speciesData?.flavor_text_entries)}</p>

      <h3>Línea Evolutiva</h3>
      <p>Información de evolución no disponible aún.</p>

      <h3>Fortalezas y Debilidades</h3>
      <p>Información de tipos efectiva no disponible aún.</p>

      <button onClick={handleGoBack} className="back-button" style={{ marginTop: '30px' }}>
        ← Volver a la Pokedex
      </button>
    </div>
  );
}

export default PokemonDetail;