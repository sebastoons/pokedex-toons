// src/components/PokemonDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

import { fetchPokemon, getPokemonTypeEffectiveness, fetchPokemonBasicInfo } from '../services/pokeapi';
import { filterMovesByGen5, fetchGen5MovesData, fetchGen1To5Encounters, fetchAbilitiesData } from '../services/pokeGen5';
import { generacionEspecial } from '../data/generacionEspecial';
import { getAutomaticAbility } from '../utils/specialGenerationUtils';

import PokeBallSpinner from './PokeBallSpinner';
import PokemonHeader from './pokemonDetail/PokemonHeader';
import PokemonStats from './pokemonDetail/PokemonStats';
import PokemonPhysical from './pokemonDetail/PokemonPhysical';
import PokemonAbilitiesMoves from './pokemonDetail/PokemonAbilitiesMoves';
import PokemonBreeding from './pokemonDetail/PokemonBreeding';
import PokemonGen5Moveset from './pokemonDetail/PokemonGen5Moveset';
import PokemonEvolutionChain from './pokemonDetail/PokemonEvolutionChain';
import PokemonLocations from './pokemonDetail/PokemonLocations';
import PokemonMedia from './pokemonDetail/PokemonMedia';
import PokemonTypeEffectiveness from './pokemonDetail/PokemonTypeEffectiveness';

const EMPTY_MOVESET = { levelUp: [], machine: [], tutor: [], egg: [] };
const EMPTY_LOCATIONS = { hasData: false, byGeneration: [] };

function PokemonDetail() {
  const { pokemonId } = useParams();
  const navigate = useNavigate();

  const [pokemonData, setPokemonData] = useState(null);
  const [speciesData, setSpeciesData] = useState(null);
  const [abilities, setAbilities] = useState([]);
  const [breedingInfo, setBreedingInfo] = useState(null);
  const [gen5Moveset, setGen5Moveset] = useState(EMPTY_MOVESET);
  const [gen5MovesLoading, setGen5MovesLoading] = useState(false);
  const [locations, setLocations] = useState(EMPTY_LOCATIONS);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [typeEffectiveness, setTypeEffectiveness] = useState(null);
  const [evolutionLine, setEvolutionLine] = useState([]);
  const [classicSprites, setClassicSprites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let ignore = false;

    const fetchAllPokemonDetails = async () => {
      setLoading(true);
      setError(null);

      const id = parseInt(pokemonId);
      const isSpecialPokemon = id > 1025;

      if (isSpecialPokemon) {
        const specialPokemon = generacionEspecial.find(p => p.id === id);

        if (!specialPokemon) {
          if (!ignore) { setError(new Error("Pokémon especial no encontrado.")); setLoading(false); }
          return;
        }

        const autoAbility = getAutomaticAbility(specialPokemon.types);

        const effectiveness = await getPokemonTypeEffectiveness(
            specialPokemon.types.map(t => ({ type: { name: t } }))
        );
        if (ignore) return;
        setTypeEffectiveness(effectiveness);

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
        setAbilities([{ name: autoAbility.name, description: autoAbility.description, isHidden: false }]);
        // Datos exclusivos de juegos reales (cría, moveset Gen5, ubicaciones):
        // este Pokémon no proviene de ningún juego, así que quedan vacíos.
        setBreedingInfo(null);
        setGen5Moveset(EMPTY_MOVESET);
        setLocations(EMPTY_LOCATIONS);
        setEvolutionLine(specialPokemon.evolutionLine || []);
        setClassicSprites([]);

        if (!ignore) setLoading(false);

      } else {
        try {
          const pokemonJson = await fetchPokemon(pokemonId);
          if (ignore) return;
          setPokemonData(pokemonJson);

          const abilityRefs = pokemonJson.abilities || [];
          const movesBuckets = filterMovesByGen5(pokemonJson.moves || []);

          setGen5MovesLoading(true);
          setLocationsLoading(true);

          // Todo lo que no depende de otro resultado se pide en paralelo:
          // especie, TODAS las habilidades (idea 5), moveset Gen 5 (idea 3),
          // ubicaciones Gen I-V (idea 9) y efectividad de tipos.
          const [speciesJson, resolvedAbilities, resolvedMoveset, resolvedLocations, effectiveness] = await Promise.all([
            pokemonJson.species?.url
              ? fetch(pokemonJson.species.url).then(r => r.json())
              : Promise.resolve(null),

            fetchAbilitiesData(abilityRefs),

            fetchGen5MovesData(movesBuckets),
            fetchGen1To5Encounters(pokemonJson.id),

            (pokemonJson.types && pokemonJson.types.length > 0)
              ? getPokemonTypeEffectiveness(pokemonJson.types)
              : Promise.resolve(null),
          ]);

          if (ignore) return;

          setSpeciesData(speciesJson);
          setAbilities(resolvedAbilities); // fetchAbilitiesData ya deja la Oculta al final
          setGen5Moveset(resolvedMoveset);
          setGen5MovesLoading(false);
          setLocations(resolvedLocations);
          setLocationsLoading(false);
          setTypeEffectiveness(effectiveness);

          if (speciesJson) {
            setBreedingInfo({
              eggGroups: (speciesJson.egg_groups || []).map(g => g.name),
              genderRate: speciesJson.gender_rate,
              hatchCounter: speciesJson.hatch_counter,
            });
          } else {
            setBreedingInfo(null);
          }

          const sprites = [];
          if (pokemonJson.sprites.versions?.["generation-i"]?.["red-blue"]?.front_default) sprites.push({ name: "GB (Rojo/Azul)", url: pokemonJson.sprites.versions["generation-i"]["red-blue"].front_default });
          if (pokemonJson.sprites.versions?.["generation-iii"]?.emerald?.front_default) sprites.push({ name: "GBA (Esmeralda)", url: pokemonJson.sprites.versions["generation-iii"].emerald.front_default });
          if (pokemonJson.sprites.versions?.["generation-iv"]?.["heartgold-soulsilver"]?.front_default) sprites.push({ name: "DS (HG/SS)", url: pokemonJson.sprites.versions["generation-iv"]["heartgold-soulsilver"].front_default });
          if (pokemonJson.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_default) sprites.push({ name: "DS (Blanco/Negro, animado)", url: pokemonJson.sprites.versions["generation-v"]["black-white"].animated.front_default });
          setClassicSprites(sprites);

          if (speciesJson?.evolution_chain?.url) {
            // Aislado en su propio try/catch: si esto falla, solo se pierde
            // la línea evolutiva, no toda la ficha ya cargada (stats,
            // habilidades, moveset, ubicaciones, etc.).
            try {
              const evoChainRes = await fetch(speciesJson.evolution_chain.url);
              if (!evoChainRes.ok) throw new Error(`HTTP ${evoChainRes.status}`);
              const evoChainJson = await evoChainRes.json();
              const processedEvoLine = await processEvolutionChain(evoChainJson.chain);
              if (ignore) return;
              setEvolutionLine(processedEvoLine);
            } catch (evoErr) {
              console.error('Error cargando la línea evolutiva:', evoErr);
              if (!ignore) setEvolutionLine([]);
            }
          }
        } catch (err) {
          if (!ignore) setError(err);
        } finally {
          if (!ignore) {
            setLoading(false);
            setGen5MovesLoading(false);
            setLocationsLoading(false);
          }
        }
      }
    };

    const processEvolutionChain = async (chain) => {
        const evolutions = [];
        const seenIds = new Set();
        const traverseChain = async (currentEvoStage, detailsToReachThisStage = null, depth = 0) => {
            const speciesUrlParts = currentEvoStage.species.url.split('/');
            const id = speciesUrlParts[speciesUrlParts.length - 2];
            if (seenIds.has(id)) return;
            seenIds.add(id);
            try {
                const basicInfo = await fetchPokemonBasicInfo(id);
                evolutions.push({ ...basicInfo, details: detailsToReachThisStage, depth });
            } catch (error) {
                evolutions.push({ id, name: currentEvoStage.species.name, sprite: '', details: detailsToReachThisStage, depth });
            }
            await Promise.all(currentEvoStage.evolves_to.map(nextEvoStage =>
                traverseChain(nextEvoStage, nextEvoStage.evolution_details[0], depth + 1)
            ));
        };
        await traverseChain(chain);
        // Se ordena por profundidad en la cadena (etapa evolutiva real), NO por
        // número de Pokédex: los "bebés" (Pichu, Igglybuff...) se agregaron en
        // generaciones posteriores y tienen un ID nacional mayor que su propia
        // evolución, así que ordenar por ID los dejaba fuera de lugar.
        evolutions.sort((a, b) => (a.depth - b.depth) || (parseInt(a.id) - parseInt(b.id)));
        return evolutions;
    };

    fetchAllPokemonDetails();
    return () => { ignore = true; };
  }, [pokemonId]);

  if (loading || !pokemonData?.sprites) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <PokeBallSpinner text="Cargando Pokédex..." size={64} />
    </div>
  );
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
        abilities={abilities}
        primaryType={pokemonData.types[0]?.type.name}
      />
      <PokemonBreeding
        eggGroups={breedingInfo?.eggGroups}
        genderRate={breedingInfo?.genderRate}
        hatchCounter={breedingInfo?.hatchCounter}
      />
      <PokemonGen5Moveset moveset={gen5Moveset} loading={gen5MovesLoading} />
      <PokemonEvolutionChain evolutionLine={evolutionLine} />
      <PokemonLocations locations={locations} loading={locationsLoading} pokemonId={pokemonId} evolutionLine={evolutionLine} />
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
