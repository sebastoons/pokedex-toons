// src/components/PokemonDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css'; // Asegúrate de que la ruta sea correcta

import { fetchPokemon, getPokemonTypeEffectiveness } from '../services/pokeapi';

function PokemonDetail() {
  const { pokemonId } = useParams();
  const navigate = useNavigate();

  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speciesData, setSpeciesData] = useState(null);
  // MODIFICADO: Ahora detailedAbility será un solo objeto, no un array
  const [detailedAbility, setDetailedAbility] = useState(null); //
  const [pokemonMoves, setPokemonMoves] = useState([]);
  const [typeEffectiveness, setTypeEffectiveness] = useState(null); // Estado para las fortalezas/debilidades

  useEffect(() => {
    const fetchAllPokemonDetails = async () => {
      setLoading(true);
      setError(null);
      setPokemonData(null);
      setSpeciesData(null);
      setDetailedAbility(null); // Reiniciar la habilidad detallada
      setPokemonMoves([]);
      setTypeEffectiveness(null);

      try {
        const pokemonJson = await fetchPokemon(pokemonId);
        setPokemonData(pokemonJson);

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

        // --- MODIFICADO: Fetch UN solo detalle de habilidad ---
        if (pokemonJson.abilities && pokemonJson.abilities.length > 0) {
          // Intentar encontrar una habilidad no oculta primero
          let chosenAbilityInfo = pokemonJson.abilities.find(ab => !ab.is_hidden);
          // Si no hay no ocultas, toma la primera que haya (podría ser oculta)
          if (chosenAbilityInfo) {
            try {
              const abilityResponse = await fetch(chosenAbilityInfo.ability.url);
              if (!abilityResponse.ok) {
                console.warn(`No se pudieron obtener detalles para la habilidad: ${chosenAbilityInfo.ability.name}. Estado: ${abilityResponse.status}`);
                const fallbackName = chosenAbilityInfo.ability.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                setDetailedAbility({
                  id: chosenAbilityInfo.ability.name,
                  name: fallbackName,
                  isHidden: chosenAbilityInfo.is_hidden,
                  description: 'Descripción no disponible.' // Mensaje genérico si falla la carga completa
                });
              } else {
                const abilityJson = await abilityResponse.json();
                const spanishNameEntry = abilityJson.names.find(nameEntry => nameEntry.language.name === 'es');
                const translatedName = spanishNameEntry ? spanishNameEntry.name : chosenAbilityInfo.ability.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                
                // --- MODIFICADO: Lógica simplificada para la descripción ---
                let description = 'Descripción no disponible.'; // Default

                // Intenta obtener de effect_entries en español
                const spanishEffectEntry = abilityJson.effect_entries.find(entry => entry.language.name === 'es');
                if (spanishEffectEntry) {
                    description = spanishEffectEntry.effect.replace(/[\n\r\f]/g, ' '); // Limpiar saltos de línea
                } else {
                    // Si no hay en español, busca en inglés
                    const englishEffectEntry = abilityJson.effect_entries.find(entry => entry.language.name === 'en');
                    if (englishEffectEntry) {
                        description = englishEffectEntry.effect.replace(/[\n\r\f]/g, ' ');
                    }
                }
                // --- FIN MODIFICACIÓN ---

                setDetailedAbility({
                  id: abilityJson.id,
                  name: translatedName,
                  isHidden: chosenAbilityInfo.is_hidden,
                  description: description // Guardar la descripción
                });
              }
            } catch (abilityFetchError) {
                console.error(`Error al obtener detalle de habilidad para ${chosenAbilityInfo.ability.name}:`, abilityFetchError);
                const fallbackName = chosenAbilityInfo.ability.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                setDetailedAbility({
                  id: chosenAbilityInfo.ability.name,
                  name: fallbackName,
                  isHidden: chosenAbilityInfo.is_hidden,
                  description: 'Error al cargar la descripción.'
                });
            }
          } else {
            setDetailedAbility(null); // No hay habilidades
          }
        } else {
          setDetailedAbility(null);
        }

        if (pokemonJson.moves && pokemonJson.moves.length > 0) {
          const selectedMovesData = pokemonJson.moves.slice(1, 16);

          const movesPromises = selectedMovesData.map(async (moveEntry) => {
            try {
              const moveResponse = await fetch(moveEntry.move.url);
              if (!moveResponse.ok) {
                console.warn(`No se pudieron obtener detalles para el movimiento: ${moveEntry.move.name}. Estado: ${moveResponse.status}`);
                const fallbackName = moveEntry.move.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return {
                  id: moveEntry.move.name,
                  name: fallbackName,
                  type: 'unknown',
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
                type: moveJson.type.name.toLowerCase(),
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

        // --- Fetch Fortalezas y Debilidades ---
        if (pokemonJson.types && pokemonJson.types.length > 0) {
          const effectivenessData = await getPokemonTypeEffectiveness(pokemonJson.types);
          setTypeEffectiveness(effectivenessData);
        } else {
          setTypeEffectiveness(null);
        }

      } catch (err) {
        setError(err);
        console.error(`Error al obtener datos del Pokémon ID ${pokemonId}: `, err);
      } finally {
        setLoading(false);
      }
    };

    if (pokemonId) {
        fetchAllPokemonDetails();
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

  // Función auxiliar para renderizar los tipos de efectividad con su multiplicador
  const renderEffectivenessTypes = (typesArray, typeLabel) => {
    if (!typesArray || typesArray.length === 0) return null;

    return (
      <p>
        <strong>{typeLabel}:</strong>{' '}
        {typesArray.map((effectType, index) => (
          <span key={effectType.type} className={`type-badge type-${effectType.type}`}>
            {effectType.type.charAt(0).toUpperCase() + effectType.type.slice(1)}
            {/* Solo muestra el multiplicador si es diferente de 1, 0, 0.5 o 2 */}
            {(effectType.multiplier !== 1 && effectType.multiplier !== 0 && effectType.multiplier !== 0.5 && effectType.multiplier !== 2) && ` (${effectType.multiplier}x)`}
          </span>
        ))}
      </p>
    );
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

  // Obtenemos el primer tipo del Pokémon para el color del badge de habilidad
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

      {/* MODIFICADO: Sección de Habilidades */}
      <h4>Habilidad:</h4>
      {detailedAbility ? (
        <div className="ability-detail-container"> {/* Contenedor específico para una habilidad */}
          <span
            key={detailedAbility.id}
            // Usa el color del primer tipo del Pokémon para la habilidad
            className={`ability-badge type-${firstPokemonType ? firstPokemonType.toLowerCase() : 'normal'}`}
          >
            {detailedAbility.name}
            {detailedAbility.isHidden && " (Habilidad Oculta)"}
          </span>
          <p className="ability-description">{detailedAbility.description}</p> {/* Descripción de la habilidad */}
        </div>
      ) : (
        <p style={{ paddingLeft: '20px', marginBottom: '20px' }}>Este Pokémon no tiene habilidades listadas.</p>
      )}
      {/* FIN MODIFICADO: Sección de Habilidades */}

      {/* >>>>> SECCIÓN DE MOVIMIENTOS <<<<< */}
      <h4>Movimientos:</h4>
      {pokemonMoves.length > 0 ? (
        <div className="moves-container">
          {pokemonMoves.map(moveDetail => (
            <span
              key={moveDetail.id}
              className={`type-badge type-${moveDetail.type}`}
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

      <h3>Evoluciones</h3>
      <p>Información de evolución no disponible aún.</p>

      {/* >>>>> SECCIÓN DE FORTALEZAS Y DEBILIDADES <<<<< */}
      <h3>Fortalezas y Debilidades</h3>
      {typeEffectiveness ? (
        <div className="type-effectiveness-container">
          {renderEffectivenessTypes(typeEffectiveness.double_damage_from, 'Débil contra')}
          {renderEffectivenessTypes(typeEffectiveness.half_damage_from, 'Fuerte Contra')}
          {renderEffectivenessTypes(typeEffectiveness.no_damage_from, 'Inmune a')}

          {typeEffectiveness.double_damage_from.length === 0 &&
           typeEffectiveness.half_damage_from.length === 0 &&
           typeEffectiveness.no_damage_from.length === 0 && (
            <p>No se encontraron relaciones de daño específicas.</p>
          )}
        </div>
      ) : (
        <p>Cargando información de tipos efectivos...</p>
      )}
      {/* >>>>> FIN SECCIÓN DE FORTALEZAS Y DEBILIDADES <<<<< */}

      <button onClick={handleGoBack} className="back-button" style={{ marginTop: '30px' }}>
        ← Volver a la Pokedex
      </button>
    </div>
  );
}

export default PokemonDetail;