// src/components/PokemonDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css'; 

// Importa las funciones de la API
import { fetchPokemon, getPokemonTypeEffectiveness, fetchPokemonBasicInfo } from '../services/pokeapi';

// --- 1. IMPORTAMOS TODOS NUESTROS NUEVOS COMPONENTES HIJOS ---
import PokemonHeader from './pokemonDetail/PokemonHeader';
import PokemonStats from './pokemonDetail/PokemonStats';
import PokemonPhysical from './pokemonDetail/PokemonPhysical';
import PokemonAbilitiesMoves from './pokemonDetail/PokemonAbilitiesMoves';
//import PokemonLocationDisplay from './PokemonLocationDisplay';
import PokemonEvolutionChain from './pokemonDetail/PokemonEvolutionChain';
import PokemonMedia from './pokemonDetail/PokemonMedia';
import PokemonTypeEffectiveness from './pokemonDetail/PokemonTypeEffectiveness';


function PokemonDetail() {
  const { pokemonId } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS: El componente padre maneja todos los datos ---
  const [pokemonData, setPokemonData] = useState(null);
  const [speciesData, setSpeciesData] = useState(null);
  const [detailedAbility, setDetailedAbility] = useState(null);
  const [pokemonMoves, setPokemonMoves] = useState([]);
  const [typeEffectiveness, setTypeEffectiveness] = useState(null);
  const [evolutionLine, setEvolutionLine] = useState([]);
  //const [locations, setLocations] = useState([]);
  const [classicSprites, setClassicSprites] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- LÓGICA DE BÚSQUEDA DE DATOS (useEffect) ---
  useEffect(() => {
    const fetchAllPokemonDetails = async () => {
      setLoading(true);
      setError(null);
      // Reseteamos todos los estados
      setPokemonData(null);
      setSpeciesData(null);
      setDetailedAbility(null);
      setPokemonMoves([]);
      setTypeEffectiveness(null);
      setEvolutionLine([]);
      //setLocations([]);
      setClassicSprites([]);

      try {
        // Fetch principal del Pokémon
        const pokemonJson = await fetchPokemon(pokemonId);
        setPokemonData(pokemonJson);

        // Fetch de la especie (para descripción y evoluciones)
        let speciesJson = null;
        if (pokemonJson.species?.url) {
            const speciesResponse = await fetch(pokemonJson.species.url);
            speciesJson = await speciesResponse.json();
            setSpeciesData(speciesJson);
        }

        // --- Procesamiento de datos (las funciones que movimos antes) ---

        // Procesar Habilidad
        if (pokemonJson.abilities && pokemonJson.abilities.length > 0) {
            let chosenAbility = pokemonJson.abilities.find(a => !a.is_hidden) || pokemonJson.abilities[0];
            const abilityResponse = await fetch(chosenAbility.ability.url);
            const abilityJson = await abilityResponse.json();
            const spanishName = abilityJson.names.find(n => n.language.name === 'es')?.name || chosenAbility.ability.name;
            const spanishDesc = abilityJson.effect_entries.find(e => e.language.name === 'es')?.effect || 
                                abilityJson.effect_entries.find(e => e.language.name === 'en')?.effect || 
                                "Descripción no disponible.";
            setDetailedAbility({
                name: spanishName,
                description: spanishDesc.replace(/[\n\r\f]/g, ' '),
                isHidden: chosenAbility.is_hidden
            });
        }

        // Procesar Movimientos
        if (pokemonJson.moves && pokemonJson.moves.length > 0) {
            const movesToFetch = pokemonJson.moves.slice(0, 25);
            const movePromises = movesToFetch.map(async moveEntry => {
                const moveRes = await fetch(moveEntry.move.url);
                const moveJson = await moveRes.json();
                const spanishName = moveJson.names.find(n => n.language.name === 'es')?.name || moveEntry.move.name;
                return { id: moveJson.id, name: spanishName, type: moveJson.type.name };
            });
            setPokemonMoves(await Promise.all(movePromises));
        }

        // Procesar Sprites Clásicos
        const sprites = [];
        if (pokemonJson.sprites.versions?.["generation-i"]?.["red-blue"]?.front_default) sprites.push({ name: "GB (Rojo/Azul)", url: pokemonJson.sprites.versions["generation-i"]["red-blue"].front_default });
        if (pokemonJson.sprites.versions?.["generation-iii"]?.emerald?.front_default) sprites.push({ name: "GBA (Esmeralda)", url: pokemonJson.sprites.versions["generation-iii"].emerald.front_default });
        if (pokemonJson.sprites.versions?.["generation-iv"]?.["heartgold-soulsilver"]?.front_default) sprites.push({ name: "DS (HG/SS)", url: pokemonJson.sprites.versions["generation-iv"]["heartgold-soulsilver"].front_default });
        setClassicSprites(sprites);

        // Procesar Línea Evolutiva
        if (speciesJson?.evolution_chain?.url) {
            const evoChainRes = await fetch(speciesJson.evolution_chain.url);
            const evoChainJson = await evoChainRes.json();
            const processedEvoLine = await processEvolutionChain(evoChainJson.chain);
            setEvolutionLine(processedEvoLine);
        }
        
        // Procesar Efectividad de Tipos
        if (pokemonJson.types && pokemonJson.types.length > 0) {
            const effectiveness = await getPokemonTypeEffectiveness(pokemonJson.types);
            setTypeEffectiveness(effectiveness);
        }

      } catch (err) {
        console.error("Error completo al buscar detalles:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Función auxiliar para procesar la cadena de evolución (se queda aquí porque depende de una llamada a la API)
    const processEvolutionChain = async (chain) => {
        const evolutions = [];
        const seenIds = new Set();
        const traverseChain = async (currentEvoStage, detailsToReachThisStage = null) => {
            const speciesUrlParts = currentEvoStage.species.url.split('/');
            const id = speciesUrlParts[speciesUrlParts.length - 2];
            if (seenIds.has(id)) return;
            seenIds.add(id);
            try {
                const basicInfo = await fetchPokemonBasicInfo(id);
                evolutions.push({ ...basicInfo, details: detailsToReachThisStage });
            } catch (error) {
                // Fallback
                evolutions.push({ id, name: currentEvoStage.species.name, sprite: '', details: detailsToReachThisStage });
            }
            for (const nextEvoStage of currentEvoStage.evolves_to) {
                await traverseChain(nextEvoStage, nextEvoStage.evolution_details[0]);
            }
        };
        await traverseChain(chain);
        evolutions.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        return evolutions;
    };

    fetchAllPokemonDetails();
  }, [pokemonId]);


  // --- RENDERIZADO: Simple y limpio, solo mostramos los componentes hijos ---

  if (loading) {
    return <div className="loading">Cargando datos del Pokémon...</div>;
  }

  if (error) {
    return <div className="error">Error al cargar los datos. Intenta de nuevo más tarde.</div>;
  }

  if (!pokemonData) {
    return null; // O un mensaje de "No encontrado"
  }

  return (
    <div className="pokemon-detail-view">
      <button onClick={() => navigate('/')} className="back-button">
        ← Volver a la Pokedex
      </button>

      <PokemonHeader pokemon={pokemonData} species={speciesData} />
      
      <PokemonStats stats={pokemonData.stats} />
      
      <PokemonPhysical 
        height={pokemonData.height} 
        weight={pokemonData.weight} 
        sprite={pokemonData.sprites.other?.["official-artwork"]?.front_default} 
      />
      
      <PokemonAbilitiesMoves 
        ability={detailedAbility} 
        moves={pokemonMoves}
        primaryType={pokemonData.types[0]?.type.name}
      />

      <PokemonEvolutionChain evolutionLine={evolutionLine} />

      <PokemonMedia
        soundUrl={pokemonData.cries?.latest || pokemonData.cries?.legacy}
        classicSprites={classicSprites}
      />

      <PokemonTypeEffectiveness effectiveness={typeEffectiveness} />

      <button onClick={() => navigate('/')} className="back-button" style={{ marginTop: '30px' }}>
        ← Volver a la Pokedex
      </button>
    </div>
  );
}

export default PokemonDetail;