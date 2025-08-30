// src/components/PokemonDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css'; 

import { fetchPokemon, getPokemonTypeEffectiveness, fetchPokemonBasicInfo } from '../services/pokeapi';
import { generacionEspecial } from '../data/generacionEspecial';
// --- 1. IMPORTAMOS NUESTRAS NUEVAS FUNCIONES AUTOMÁTICAS ---
import { getAutomaticAbility, getAutomaticMoves } from '../utils/specialGenerationUtils';

import PokemonHeader from './pokemonDetail/PokemonHeader';
import PokemonStats from './pokemonDetail/PokemonStats';
// ... (el resto de tus importaciones de componentes se quedan igual)
import PokemonPhysical from './pokemonDetail/PokemonPhysical';
import PokemonAbilitiesMoves from './pokemonDetail/PokemonAbilitiesMoves';
import PokemonEvolutionChain from './pokemonDetail/PokemonEvolutionChain';
import PokemonMedia from './pokemonDetail/PokemonMedia';
import PokemonTypeEffectiveness from './pokemonDetail/PokemonTypeEffectiveness';


function PokemonDetail() {
  const { pokemonId } = useParams();
  const navigate = useNavigate();

  const [pokemonData, setPokemonData] = useState(null);
  const [speciesData, setSpeciesData] = useState(null);
  const [detailedAbility, setDetailedAbility] = useState(null);
  const [pokemonMoves, setPokemonMoves] = useState([]);
  const [typeEffectiveness, setTypeEffectiveness] = useState(null);
  const [evolutionLine, setEvolutionLine] = useState([]);
  const [classicSprites, setClassicSprites] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllPokemonDetails = async () => {
      setLoading(true);
      setError(null);
      // ... (reseteo de estados)

      const id = parseInt(pokemonId);
      const isSpecialPokemon = id > 1025;

      if (isSpecialPokemon) {
        const specialPokemon = generacionEspecial.find(p => p.id === id);

        if (!specialPokemon) {
          setError(new Error("Pokémon especial no encontrado."));
          setLoading(false);
          return;
        }

        // --- 2. LLAMAMOS A LAS FUNCIONES AUTOMÁTICAS ---
        const autoAbility = getAutomaticAbility(specialPokemon.types);
        const autoMoves = getAutomaticMoves(specialPokemon.types);
        
        // --- 3. CALCULAMOS LA EFECTIVIDAD DE TIPOS ---
        const effectiveness = await getPokemonTypeEffectiveness(
            specialPokemon.types.map(t => ({ type: { name: t } }))
        );
        setTypeEffectiveness(effectiveness);


        // Formateamos los datos para que coincidan con la estructura que esperan los componentes
        const formattedData = {
          id: specialPokemon.id,
          name: specialPokemon.name,
          types: specialPokemon.types.map(type => ({ type: { name: type } })),
          height: specialPokemon.height,
          weight: specialPokemon.weight,
          sprites: { other: { "official-artwork": { front_default: specialPokemon.imageUrl }}},
          stats: Object.entries(specialPokemon.stats).map(([name, value]) => ({
            stat: { name: name },
            base_stat: value
          })),
          cries: { latest: null, legacy: null }
        };

        setPokemonData(formattedData);
        setSpeciesData({ flavor_text_entries: [{ flavor_text: specialPokemon.description, language: { name: 'es' } }] });
        setDetailedAbility(autoAbility); // Guardamos la habilidad automática
        setPokemonMoves(autoMoves); // Guardamos los movimientos automáticos
        setEvolutionLine(specialPokemon.evolutionLine || []);
        setClassicSprites([]);
        
        setLoading(false);

      } else {
        // --- LÓGICA ORIGINAL PARA POKÉMON DE LA API (sin cambios) ---
        try {
          const pokemonJson = await fetchPokemon(pokemonId);
          setPokemonData(pokemonJson);
          let speciesJson = null;
          if (pokemonJson.species?.url) {
              const speciesResponse = await fetch(pokemonJson.species.url);
              speciesJson = await speciesResponse.json();
              setSpeciesData(speciesJson);
          }
          if (pokemonJson.abilities && pokemonJson.abilities.length > 0) {
              let chosenAbility = pokemonJson.abilities.find(a => !a.is_hidden) || pokemonJson.abilities[0];
              const abilityResponse = await fetch(chosenAbility.ability.url);
              const abilityJson = await abilityResponse.json();
              const spanishName = abilityJson.names.find(n => n.language.name === 'es')?.name || chosenAbility.ability.name;
              const spanishDesc = abilityJson.effect_entries.find(e => e.language.name === 'es')?.effect || 
                                  abilityJson.effect_entries.find(e => e.language.name === 'en')?.effect || 
                                  "Descripción no disponible.";
              setDetailedAbility({ name: spanishName, description: spanishDesc.replace(/[\n\r\f]/g, ' '), isHidden: chosenAbility.is_hidden });
          }
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
          const sprites = [];
          if (pokemonJson.sprites.versions?.["generation-i"]?.["red-blue"]?.front_default) sprites.push({ name: "GB (Rojo/Azul)", url: pokemonJson.sprites.versions["generation-i"]["red-blue"].front_default });
          if (pokemonJson.sprites.versions?.["generation-iii"]?.emerald?.front_default) sprites.push({ name: "GBA (Esmeralda)", url: pokemonJson.sprites.versions["generation-iii"].emerald.front_default });
          if (pokemonJson.sprites.versions?.["generation-iv"]?.["heartgold-soulsilver"]?.front_default) sprites.push({ name: "DS (HG/SS)", url: pokemonJson.sprites.versions["generation-iv"]["heartgold-soulsilver"].front_default });
          setClassicSprites(sprites);
          if (speciesJson?.evolution_chain?.url) {
              const evoChainRes = await fetch(speciesJson.evolution_chain.url);
              const evoChainJson = await evoChainRes.json();
              const processedEvoLine = await processEvolutionChain(evoChainJson.chain);
              setEvolutionLine(processedEvoLine);
          }
          if (pokemonJson.types && pokemonJson.types.length > 0) {
              const effectiveness = await getPokemonTypeEffectiveness(pokemonJson.types);
              setTypeEffectiveness(effectiveness);
          }
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      }
    };
    
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

  // --- RENDERIZADO (sin cambios) ---
  if (loading || !pokemonData?.sprites) return <div className="loading">Cargando Pokedex...</div>;
  if (error) return <div className="error">Error al cargar los datos. Intenta de nuevo más tarde.</div>;
  if (!pokemonData) return null;

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
        sprite={pokemonData?.sprites?.other?.["official-artwork"]?.front_default} 
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