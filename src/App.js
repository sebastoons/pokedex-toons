// src/App.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Link, } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Componentes
import PokemonCard from './components/PokemonCard';
import PokemonDetail from './components/PokemonDetail';
import PokemonBattleSelector from './components/PokemonBattleSelector';
import PokemonBattleArena from './components/PokemonBattleArena';
import MachineList from './components/MachineList';
import WelcomeModal from './components/WelcomeModal';
import UpdateModal from './components/UpdateModal';

import { generacionEspecial } from './data/generacionEspecial';

// Constantes
const ALL_POKEMON_GENERATIONS = [
    { id: 1, limit: 151, offset: 0, name: 'Generación 1' },
    { id: 2, limit: 100, offset: 151, name: 'Generación 2' },
    { id: 3, limit: 135, offset: 251, name: 'Generación 3' },
    { id: 4, limit: 107, offset: 386, name: 'Generación 4' },
    { id: 5, limit: 156, offset: 493, name: 'Generación 5' },
    { id: 6, limit: 72, offset: 649, name: 'Generación 6' },
    { id: 7, limit: 88, offset: 721, name: 'Generación 7' },
    { id: 8, limit: 96, offset: 809, name: 'Generación 8' },
    { id: 9, limit: 120, offset: 905, name: 'Generación 9' },
    { id: 'special', name: 'Generación Especial' },
];
const ALL_POKEMON_TYPES = [
    { value: 'normal', display: 'Normal', color: '#A8A77A' },
    { value: 'fire', display: 'Fuego', color: '#EE8130' },
    { value: 'water', display: 'Agua', color: '#6390F0' },
    { value: 'electric', display: 'Eléctrico', color: '#F7D02C' },
    { value: 'grass', display: 'Planta', color: '#7AC74C' },
    { value: 'ice', display: 'Hielo', color: '#96D9D6' },
    { value: 'fighting', display: 'Lucha', color: '#C22E28' },
    { value: 'poison', display: 'Veneno', color: '#A33EA1' },
    { value: 'ground', display: 'Tierra', color: '#E2BF65' },
    { value: 'flying', display: 'Volador', color: '#A98FF3' },
    { value: 'psychic', display: 'Psíquico', color: '#F95587' },
    { value: 'bug', display: 'Bicho', color: '#A6B91A' },
    { value: 'rock', display: 'Roca', color: '#B6A136' },
    { value: 'ghost', display: 'Fantasma', color: '#735797' },
    { value: 'dragon', display: 'Dragón', color: '#6F35FC' },
    { value: 'dark', display: 'Siniestro', color: '#705746' },
    { value: 'steel', display: 'Acero', color: '#B7B7CE' },
    { value: 'fairy', display: 'Hada', color: '#D685AD' },
];

const GA_MEASUREMENT_ID = "G-KPGB8SXW4B"; 
ReactGA.initialize(GA_MEASUREMENT_ID);

function App() {
    const [pokemonList, setPokemonList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedGeneration, setSelectedGeneration] = useState('1');
    const [isGenMenuOpen, setIsGenMenuOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [showUpdate, setShowUpdate] = useState(false);
    const LATEST_UPDATE_VERSION = "1.2.2";
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (audioRef.current) {
            audioRef.current.muted = newMutedState;
        }
    };
    const handleWelcomeClose = () => {
        setShowWelcome(false);
        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch(e => console.log("Audio play failed"));
        }
        const lastSeenVersion = localStorage.getItem('lastUpdateSeen');
        if (lastSeenVersion !== LATEST_UPDATE_VERSION) {
            setShowUpdate(true);
        }
    };
    const handleUpdateClose = () => {
        setShowUpdate(false);
        localStorage.setItem('lastUpdateSeen', LATEST_UPDATE_VERSION);
    };

    useEffect(() => {
        const fetchPokemonWithDetails = async () => {
            try {
                const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0');
                if (!listResponse.ok) throw new Error(`HTTP error! status: ${listResponse.status}`);
                const listData = await listResponse.json();
                const results = listData.results;
                const pokemonWithDetails = [];
                const chunkSize = 30;
                const delayMs = 100;

                for (let i = 0; i < results.length; i += chunkSize) {
                    const chunk = results.slice(i, i + chunkSize);
                    const chunkPromises = chunk.map(async (pokemon) => {
                        try {
                            const detailResponse = await fetch(pokemon.url);
                            if (!detailResponse.ok) return null;
                            const detailData = await detailResponse.json();
                            return {
                                name: detailData.name,
                                url: pokemon.url,
                                id: detailData.id,
                                types: detailData.types.map(typeInfo => typeInfo.type.name)
                            };
                        } catch (detailErr) { return null; }
                    });
                    const resolvedChunk = await Promise.all(chunkPromises);
                    pokemonWithDetails.push(...resolvedChunk.filter(Boolean));
                    if (i + chunkSize < results.length) {
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                    }
                }

                // --- CORRECCIÓN: COMBINAMOS LAS LISTAS ANTES DE GUARDARLAS ---
                const specialPokemonFormatted = generacionEspecial.map(p => ({
                  id: p.id,
                  name: p.name.toLowerCase(),
                  types: p.types,
                  isSpecial: true
                }));
                
                // Guardamos la lista combinada de la API y la tuya en una sola vez
                setPokemonList([...pokemonWithDetails, ...specialPokemonFormatted]);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPokemonWithDetails();
    }, []);

    const filteredPokemon = useMemo(() => {
        let currentList = [...pokemonList];

        if (selectedGeneration) {
            if (selectedGeneration === 'special') {
                currentList = currentList.filter(pokemon => pokemon.isSpecial);
            } else {
                const gen = ALL_POKEMON_GENERATIONS.find(g => g.id.toString() === selectedGeneration);
                if (gen) {
                    currentList = currentList.filter(pokemon =>
                        !pokemon.isSpecial && pokemon.id > gen.offset && pokemon.id <= gen.offset + gen.limit
                    );
                }
            }
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentList = currentList.filter(pokemon => 
                pokemon.name.toLowerCase().includes(lowerCaseSearchTerm) || 
                (pokemon.id && pokemon.id.toString().includes(lowerCaseSearchTerm))
            );
        }

        if (selectedType) {
            currentList = currentList.filter(pokemon => pokemon.types && pokemon.types.includes(selectedType));
        }

        return currentList;
    }, [pokemonList, searchTerm, selectedType, selectedGeneration]);

    const handleSearchChange = (event) => setSearchTerm(event.target.value);
    const handleTypeChange = (event) => setSelectedType(event.target.value);
    const handleGenerationSelect = (genId) => {
        setSelectedGeneration(genId.toString());
        setIsGenMenuOpen(false);
    };
    const toggleGenMenu = () => setIsGenMenuOpen(!isGenMenuOpen);

    if (loading) return <div className="pokedex-container"><div className="loading">Cargando Pokedex...</div></div>;
    if (error) return <div className="pokedex-container"><div className="error">Error: {error.message}</div></div>;

    return (
      <div className="pokedex-container">
          <audio ref={audioRef} src="/sounds/app_load.mp3" preload="auto" />
          <button onClick={toggleMute} className="mute-button-main">{isMuted ? '🔊' : '🔇'}</button>
          {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
          {showUpdate && <UpdateModal onClose={handleUpdateClose} />}
          
          <header>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img src="/logo.png" alt="Mi Pokedex Logo" className="pokedex-logo" />
                  <span style={{ textAlign: 'right', display: 'block', marginLeft: '150px', marginTop: '5px',fontWeight: 'bold',fontSize: '0.9em',fontFamily: 'monospace', color: '#ebebebff' }}>By Toons ♥ </span>
              </Link>
          </header>

          <Routes>
              <Route path="/" element={
                  <>
                      <div className="welcome-message">
                          <h2>Busca tu Pokémon</h2>
                          <p>¡Encuentra a tu Pokémon favorito por nombre, ID o tipo!</p>
                      </div>
                      <div className="controls-container">
                          <div>
                              <label htmlFor="search-input">Nombre o ID:</label>
                              <input id="search-input" type="text" placeholder="Buscar..." value={searchTerm} onChange={handleSearchChange} />
                          </div>
                          <div>
                              <label htmlFor="type-filter">Tipo:</label>
                              <select id="type-filter" value={selectedType} onChange={handleTypeChange}>
                                  <option value="">Todos</option>
                                  {ALL_POKEMON_TYPES.map(type => <option key={type.value} value={type.value}>{type.display}</option>)}
                              </select>
                          </div>
                          <div className="generation-filter-container">
                              <button onClick={toggleGenMenu} className="generation-button">
                                  Generación: {ALL_POKEMON_GENERATIONS.find(gen => gen.id.toString() === selectedGeneration)?.name || 'Seleccionar'}
                              </button>
                              {isGenMenuOpen && (
                                  <ul className="generation-dropdown-menu">
                                      {ALL_POKEMON_GENERATIONS.map(gen => (
                                          <li key={gen.id} onClick={() => handleGenerationSelect(gen.id)} className={selectedGeneration === gen.id.toString() ? 'active' : ''}>
                                              {gen.name}
                                          </li>
                                      ))}
                                  </ul>
                              )}
                          </div>
                          <Link to="/battle" className="battle-button">Ir a Batalla</Link>
                          <Link to="/moves" className="battle-button">MT/MO</Link>
                      </div>

                      <div className="pokemon-list">
                          {filteredPokemon.length > 0 ? (
                              filteredPokemon.map(pokemon => <PokemonCard key={pokemon.id} pokemon={pokemon} />)
                          ) : (
                              <div className="no-results">No se encontraron Pokémon.</div>
                          )}
                      </div>
                  </>
              } />
              <Route path="/pokemon/:pokemonId" element={<PokemonDetail />} />
              <Route path="/battle" element={<PokemonBattleSelector pokemonList={pokemonList} />} />
              <Route path="/battle/arena" element={<PokemonBattleArena pokemonList={pokemonList} />} />
              <Route path="/moves" element={<MachineList />} />
              <Route path="*" element={<div className="error">Página no encontrada</div>} />
          </Routes>
          <div className="app-version">v{LATEST_UPDATE_VERSION}</div>
      </div>
    );
}

export default App;