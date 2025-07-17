// src/components/PokemonDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css'; 

// Importa las funciones de pokeapi.js
import { fetchPokemon, getPokemonTypeEffectiveness, fetchEvolutionChain, fetchPokemonBasicInfo } from '../services/pokeapi';

function PokemonDetail() {
  const { pokemonId } = useParams();
  const navigate = useNavigate();

  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speciesData, setSpeciesData] = useState(null);
  const [detailedAbility, setDetailedAbility] = useState(null);
  const [pokemonMoves, setPokemonMoves] = useState([]);
  const [typeEffectiveness, setTypeEffectiveness] = useState(null);
  const [evolutionLine, setEvolutionLine] = useState([]);

  // ESTADOS PARA SONIDO Y SPRITES CLÁSICOS
  const [pokemonSoundUrl, setPokemonSoundUrl] = useState(null);
  const [classicSprites, setClassicSprites] = useState([]);
  const audioRef = useRef(null); // Referencia al elemento de audio

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
      case 'unknown': return 'Desconocido';
      case 'shadow': return 'Sombra';
      default: return typeName.charAt(0).toUpperCase() + typeName.slice(1);
    }
  };

  // Función para reproducir el sonido
  const playPokemonCry = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reinicia el audio si ya se está reproduciendo
      audioRef.current.play().catch(e => console.error("Error al reproducir el sonido:", e));
    }
  };

  // --- NUEVA FUNCIÓN: Procesa la cadena de evolución para obtener requisitos ---
  const processEvolutionChain = async (chain) => {
    const evolutions = [];
    const seenIds = new Set(); // Para evitar duplicados en ramificaciones

    const traverseChain = async (currentEvoStage, detailsToReachThisStage = null) => {
        const speciesUrlParts = currentEvoStage.species.url.split('/');
        const id = speciesUrlParts[speciesUrlParts.length - 2];
        
        if (seenIds.has(id)) {
            return; // Ya procesado, evitar bucles o duplicados
        }
        seenIds.add(id);

        try {
            const basicInfo = await fetchPokemonBasicInfo(id);
            evolutions.push({
                id: basicInfo.id,
                name: basicInfo.name,
                sprite: basicInfo.sprite,
                details: detailsToReachThisStage // Requisitos para alcanzar ESTE Pokémon
            });
        } catch (error) {
            console.error(`Error al obtener info básica para ${currentEvoStage.species.name}:`, error);
            // Fallback si la info básica no se puede obtener
            evolutions.push({
                id: id,
                name: currentEvoStage.species.name,
                sprite: 'https://placehold.co/90x90/e0e0e0/333?text=No+Img',
                details: detailsToReachThisStage
            });
        }

        if (currentEvoStage.evolves_to && currentEvoStage.evolves_to.length > 0) {
            for (const nextEvoStage of currentEvoStage.evolves_to) {
                // Los detalles se encuentran en 'evolution_details' del *siguiente* stage
                const details = nextEvoStage.evolution_details && nextEvoStage.evolution_details.length > 0
                                ? nextEvoStage.evolution_details[0] // Tomamos el primer detalle para simplificar
                                : null;
                await traverseChain(nextEvoStage, details);
            }
        }
    };

    await traverseChain(chain);

    // Ordenar por ID para asegurar el orden cronológico de la evolución
    evolutions.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    return evolutions;
  };

  // --- FUNCIÓN CORREGIDA: Formatea el requisito de evolución con traducciones de piedras ---
  const formatEvolutionRequirement = (details) => {
      if (!details) return ''; // Para la forma base (e.g., Bulbasaur), no hay requisito

      const trigger = details.trigger?.name;
      let requirement = '';

      switch (trigger) {
          case 'level-up':
              if (details.min_level) {
                  requirement = `Nv. ${details.min_level}`;
              } else if (details.min_happiness) {
                  requirement = `Felicidad`;
              } else if (details.min_affection) {
                  requirement = `Afecto`;
              } else if (details.min_beauty) {
                  requirement = `Belleza`;
              } else {
                  requirement = 'Por nivel'; // Fallback general
              }
              // Condiciones adicionales para evolución por nivel
              if (details.time_of_day && details.time_of_day !== '') {
                  requirement += ` (${details.time_of_day === 'day' ? 'Día' : 'Noche'})`;
              }
              if (details.known_move) {
                  const moveName = details.known_move.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                  requirement += ` (con ${moveName})`;
              }
              if (details.held_item) {
                  const itemName = details.held_item.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                  requirement += ` (equipando ${itemName})`;
              }
              if (details.party_species) {
                  const speciesName = details.party_species.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                  requirement += ` (con ${speciesName} en equipo)`;
              }
              break;
          case 'trade':
              requirement = 'Intercambio';
              if (details.held_item) {
                  const itemName = details.held_item.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                  requirement += ` (equipando ${itemName})`;
              }
              if (details.trade_species) {
                  const speciesName = details.trade_species.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                  requirement += ` (por ${speciesName})`;
              }
              break;
          case 'use-item':
              if (details.item) {
                  let itemName = details.item.name;
                  // Traducciones de piedras evolutivas comunes
                  switch (itemName) {
                      case 'thunder-stone':
                          itemName = 'Piedra Trueno';
                          break;
                      case 'leaf-stone':
                          itemName = 'Piedra Hoja';
                          break;
                      case 'moon-stone':
                          itemName = 'Piedra Lunar';
                          break;
                      case 'sun-stone':
                          itemName = 'Piedra Solar';
                          break;
                      case 'water-stone':
                          itemName = 'Piedra Agua';
                          break;
                      case 'fire-stone':
                          itemName = 'Piedra Fuego';
                          break;
                      case 'oval-stone':
                          itemName = 'Piedra Oval';
                          break;
                      case 'shiny-stone':
                          itemName = 'Piedra Alba';
                          break;
                      case 'dusk-stone':
                          itemName = 'Piedra Noche';
                          break;
                      case 'dawn-stone':
                          itemName = 'Piedra Día';
                          break;
                      case 'ice-stone':
                          itemName = 'Piedra Hielo';
                          break;
                      // Agrega más piedras si encuentras que aparecen en inglés y necesitas traducirlas
                      default:
                          // Si no es una de las piedras específicas, formatea el nombre normal
                          itemName = itemName.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                          break;
                  }
                  requirement = `Usar ${itemName}`;
              } else {
                  requirement = 'Usar objeto';
              }
              break;
          case 'shed': // Para Nincada a Shedinja/Ninjask
              requirement = 'Vacío en equipo';
              break;
          // Puedes añadir más casos específicos si lo deseas para otros triggers
          default:
              requirement = `Condición especial (${trigger?.replace(/-/g, ' ') || 'desconocida'})`;
      }

      return requirement.trim();
  };

  useEffect(() => {
    const fetchAllPokemonDetails = async () => {
      setLoading(true);
      setError(null);
      setPokemonData(null);
      setSpeciesData(null);
      setDetailedAbility(null);
      setPokemonMoves([]);
      setTypeEffectiveness(null);
      setEvolutionLine([]);
      setPokemonSoundUrl(null);
      setClassicSprites([]);

      try {
        const pokemonJson = await fetchPokemon(pokemonId);
        setPokemonData(pokemonJson);

        // OBTENER SONIDO (PRIORIDAD: VOCALIZADO -> CLÁSICO)
        if (pokemonJson.cries?.latest) {
            setPokemonSoundUrl(pokemonJson.cries.latest);
        } else if (pokemonJson.cries?.legacy) {
            setPokemonSoundUrl(pokemonJson.cries.legacy);
        } else {
            setPokemonSoundUrl('');
            console.warn(`No cry URL found for ${pokemonJson.name}`);
        }

        // OBTENER SPRITES CLÁSICOS
        const fetchedSprites = [];
        const versions = pokemonJson.sprites.versions;

        // Game Boy
        if (versions?.["generation-i"]?.["red-blue"]?.front_default) {
            fetchedSprites.push({
                name: "GB (Rojo/Azul)",
                url: versions["generation-i"]["red-blue"].front_default
            });
        } else if (versions?.["generation-i"]?.yellow?.front_default) {
            fetchedSprites.push({
                name: "GB (Amarillo)",
                url: versions["generation-i"].yellow.front_default
            });
        }

        // Game Boy Advance
        if (versions?.["generation-iii"]?.ruby_sapphire?.front_default) {
            fetchedSprites.push({
                name: "GBA (Rubí/Zafiro)",
                url: versions["generation-iii"].ruby_sapphire.front_default
            });
        } else if (versions?.["generation-iii"]?.emerald?.front_default) {
            fetchedSprites.push({
                name: "GBA (Esmeralda)",
                url: versions["generation-iii"].emerald.front_default
            });
        }

        // Nintendo DS (Gen IV)
        if (versions?.["generation-iv"]?.["diamond-pearl"]?.front_default) {
            fetchedSprites.push({
                name: "DS (Diamante/Perla)",
                url: versions["generation-iv"]["diamond-pearl"].front_default
            });
        } else if (versions?.["generation-iv"]?.["heartgold-soulsilver"]?.front_default) {
            fetchedSprites.push({
                name: "DS (HG/SS)",
                url: versions["generation-iv"]["heartgold-soulsilver"].front_default
            });
        }
        
        setClassicSprites(fetchedSprites);


        let currentSpeciesData = null;
        if (pokemonJson.species?.url) {
            const speciesResponse = await fetch(pokemonJson.species.url);
            if (!speciesResponse.ok) {
                throw new Error(`HTTP error! status: ${speciesResponse.status} fetching species`);
            }
            currentSpeciesData = await speciesResponse.json();
            setSpeciesData(currentSpeciesData);
        } else {
            console.warn("Species URL not found for this Pokémon.");
            setSpeciesData({ flavor_text_entries: [] });
            currentSpeciesData = { evolution_chain: { url: null } };
        }

        // Lógica de Habilidades (sin cambios)
        if (pokemonJson.abilities && pokemonJson.abilities.length > 0) {
            let chosenAbilityInfo = pokemonJson.abilities.find(ab => !ab.is_hidden);
            if (!chosenAbilityInfo) {
                chosenAbilityInfo = pokemonJson.abilities[0];
            }

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
                            description: 'Descripción no disponible.'
                        });
                    } else {
                        const abilityJson = await abilityResponse.json();
                        const spanishNameEntry = abilityJson.names.find(nameEntry => nameEntry.language.name === 'es');
                        const translatedName = spanishNameEntry ? spanishNameEntry.name : chosenAbilityInfo.ability.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        
                        let description = 'Descripción no disponible.';
                        const spanishEffectEntry = abilityJson.effect_entries.find(entry => entry.language.name === 'es');
                        if (spanishEffectEntry) {
                            description = spanishEffectEntry.effect.replace(/[\n\r\f]/g, ' ');
                        } else {
                            const englishEffectEntry = abilityJson.effect_entries.find(entry => entry.language.name === 'en');
                            if (englishEffectEntry) {
                                description = englishEffectEntry.effect.replace(/[\n\r\f]/g, ' ');
                            }
                        }

                        setDetailedAbility({
                            id: abilityJson.id,
                            name: translatedName,
                            isHidden: chosenAbilityInfo.is_hidden,
                            description: description
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
                setDetailedAbility(null);
            }
        } else {
            setDetailedAbility(null);
        }
        
        // Lógica de Movimientos (sin cambios)
        if (pokemonJson.moves && pokemonJson.moves.length > 0) {
            const selectedMovesData = pokemonJson.moves.slice(1, 26);

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
        
        // Lógica de Fortalezas y Debilidades (sin cambios)
        if (pokemonJson.types && pokemonJson.types.length > 0) {
            const effectivenessData = await getPokemonTypeEffectiveness(pokemonJson.types);
            setTypeEffectiveness(effectivenessData);
        } else {
            setTypeEffectiveness(null);
        }
        
        // LÓGICA: Obtener y procesar la línea evolutiva (¡CAMBIO AQUÍ!)
        if (currentSpeciesData?.evolution_chain?.url) {
            try {
                const evolutionChainData = await fetchEvolutionChain(currentSpeciesData.evolution_chain.url);
                // Usamos la nueva función para procesar la cadena
                const processedEvolutionLine = await processEvolutionChain(evolutionChainData.chain);
                setEvolutionLine(processedEvolutionLine);
            } catch (evolutionError) {
                console.error("Error al obtener la cadena de evolución:", evolutionError);
                setEvolutionLine([]);
            }
        } else {
            setEvolutionLine([]);
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
    if (!flavorTextEntries || flavorTextEntries.length === 0) {
      return "Descripción no disponible.";
    }

    const spanishEntry = flavorTextEntries.find(entry => entry.language.name === 'es');

    if (spanishEntry) {
      const cleanedText = spanishEntry.flavor_text.replace(/[\n\r\f]/g, ' ');
      return cleanedText;
    } else {
      const englishEntry = flavorTextEntries.find(entry => entry.language.name === 'en');
      if (englishEntry) {
        const cleanedText = englishEntry.flavor_text.replace(/[\n\r\f]/g, ' ');
        return cleanedText;
      }
      return "Descripción en español no disponible.";
    }
  };

  const renderEffectivenessTypes = (typesArray, typeLabel) => {
    if (!typesArray || typesArray.length === 0) return null;

    return (
      <p>
        <strong>{typeLabel}:</strong>{' '}
        {typesArray.map((effectType, index) => (
          <span key={effectType.type} className={`type-badge type-${effectType.type}`}>
            {translateTypeName(effectType.type)}
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
            {translateTypeName(typeInfo.type.name)}
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

      <h4>Habilidad:</h4>
      {detailedAbility ? (
        <div className="ability-detail-container">
          <span
            key={detailedAbility.id}
            className={`ability-badge type-${firstPokemonType ? firstPokemonType.toLowerCase() : 'normal'}`}
          >
            {detailedAbility.name}
            {detailedAbility.isHidden && " (Habilidad Oculta)"}
          </span>
          <p className="ability-description">{detailedAbility.description}</p>
        </div>
      ) : (
        <p style={{ paddingLeft: '20px', marginBottom: '20px' }}>Este Pokémon no tiene habilidades listadas.</p>
      )}

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

      <h3>Descripcion Pokémon</h3>
      {speciesData && speciesData.flavor_text_entries && speciesData.flavor_text_entries.length > 0 ? (
          <p className="pokedex-entry-text">
              {getSpanishDescription(speciesData.flavor_text_entries)}
          </p>
      ) : (
          <p className="pokedex-entry-text">Cargando descripción o no disponible.</p>
      )}

      {/* --- LÍNEA EVOLUTIVA MEJORADA (¡CAMBIOS AQUÍ!) --- */}
      <h3>Línea Evolutiva</h3>
      {evolutionLine.length > 0 ? (
        <div className="evolution-line-container">
          {evolutionLine.map((evoPokemon, index) => (
            <React.Fragment key={evoPokemon.id}>
              {/* Flecha y requisito si no es el primero */}
              {index > 0 && (
                <div className="evolution-path-details">
                  <span className="evolution-requirement">
                    {evoPokemon.details
                      ? formatEvolutionRequirement(evoPokemon.details)
                      : 'Evolución'}
                  </span>
                  <span className="evolution-arrow">→</span>
                </div>
              )}

              {/* Etapa evolutiva */}
              <div 
                className="evolution-stage"
                onClick={() => navigate(`/pokemon/${evoPokemon.id}`)}
              >
                <img src={evoPokemon.sprite} alt={evoPokemon.name} className="evolution-sprite" />
                <span className="evolution-name">{evoPokemon.name}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      ) : (
        <p>Cargando línea evolutiva o no disponible.</p>
      )}

      {/* --- FIN LÍNEA EVOLUTIVA MEJORADA --- */}

      {/* >>>>> NUEVA SECCIÓN: Medios y Sprites Clásicos <<<<< */}
      <h3>Sonido y Sprites Clásicos</h3>
      <div className="media-section-container">
        {pokemonSoundUrl && (
          <div className="pokemon-cry-section">
            <h4>Sonido del Pokémon:</h4>
            <audio ref={audioRef} src={pokemonSoundUrl} preload="auto"></audio>
            <button onClick={playPokemonCry} className="play-cry-button">
              ▶
            </button>
          </div>
        )}

        {classicSprites.length > 0 && (
          <div className="classic-sprites-gallery">
            <h4>Sprites Clásicos:</h4>
            <div className="sprites-grid">
              {classicSprites.map((sprite, index) => (
                <div key={index} className="sprite-item">
                  <img src={sprite.url} alt={sprite.name} className="classic-sprite-image" />
                  <span className="sprite-name">{sprite.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay sonido ni sprites clásicos */}
        {!pokemonSoundUrl && classicSprites.length === 0 && (
            <p>No se encontró sonido o sprites clásicos para este Pokémon.</p>
        )}
      </div>
      {/* >>>>> FIN NUEVA SECCIÓN <<<<< */}


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

      <button onClick={handleGoBack} className="back-button" style={{ marginTop: '30px' }}>
        ← Volver a la Pokedex
      </button>
    </div>
  );
}

export default PokemonDetail;