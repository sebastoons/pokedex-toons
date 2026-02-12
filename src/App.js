// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Componentes
import PokemonCard from './components/PokemonCard';
import PokemonDetail from './components/PokemonDetail';
import PokemonBattleSelector from './components/PokemonBattleSelector';
import PokemonBattleArena from './components/battle/PokemonBattleArena';
import WelcomeModal from './components/WelcomeModal';
import UpdateModal from './components/UpdateModal';
import BattleModeSelector from './components/BattleModeSelector';
import AnalyticsDashboard from './components/AnalyticsDashboard';

import { generacionEspecial } from './data/generacionEspecial';
import manualPokemonImages from './data/manualPokemonImages';

// Analytics Tracker
import analyticsTracker from './utils/analyticsTracker';

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
    const LATEST_UPDATE_VERSION = "1.2.4";

    useEffect(() => {
        analyticsTracker.trackPageVisit();
    }, []);

    const handleWelcomeClose = () => {
        setShowWelcome(false);
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
                const delayMs = 50; // Reducido para cargar más rápido

                for (let i = 0; i < results.length; i += chunkSize) {
                    const chunk = results.slice(i, i + chunkSize);
                    const chunkPromises = chunk.map(async (pokemon) => {
                        try {
                            // Optimización: Usamos datos básicos si falla el detalle
                            const idFromUrl = pokemon.url.split('/')[6];
                            const detailResponse = await fetch(pokemon.url);
                            
                            let detailData;
                            if (detailResponse.ok) {
                                detailData = await detailResponse.json();
                            } else {
                                detailData = { id: idFromUrl, name: pokemon.name, types: [{type: {name: 'normal'}}] };
                            }

                            return {
                                name: detailData.name,
                                url: pokemon.url,
                                id: detailData.id,
                                types: detailData.types.map(typeInfo => typeInfo.type.name),
                                imageUrl: manualPokemonImages[detailData.id] || null
                            };
                        } catch (detailErr) { return null; }
                    });
                    const resolvedChunk = await Promise.all(chunkPromises);
                    pokemonWithDetails.push(...resolvedChunk.filter(Boolean));
                    
                    // Solo cargamos el primer chunk obligatoriamente, el resto en background
                    if (i === 0) setPokemonList([...pokemonWithDetails]); 
                    
                    if (i + chunkSize < results.length) {
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                    }
                }

                const specialPokemonFormatted = generacionEspecial.map(p => ({
                  id: p.id,
                  name: p.name.toLowerCase(),
                  types: p.types,
                  imageUrl: p.imageUrl,
                  isSpecial: true
                }));
                
                // Actualización final con todos
                setPokemonList(prev => {
                    // Evitar duplicados si el render es rápido
                    const combined = [...pokemonWithDetails, ...specialPokemonFormatted];
                    return combined;
                });

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

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (value.length > 2) {
            analyticsTracker.trackSearch(value);
        }
    };

    const handleTypeChange = (event) => {
        const value = event.target.value;
        setSelectedType(value);
        if (value) {
            const typeInfo = ALL_POKEMON_TYPES.find(t => t.value === value);
            if (typeInfo) {
                analyticsTracker.trackTypeFilter(typeInfo.display);
            }
        }
    };

    const handleGenerationSelect = (genId) => {
        setSelectedGeneration(genId.toString());
        setIsGenMenuOpen(false);
        const gen = ALL_POKEMON_GENERATIONS.find(g => g.id.toString() === genId.toString());
        if (gen) {
            analyticsTracker.trackGenerationSelection(genId, gen.name);
        }
    };

    const toggleGenMenu = () => setIsGenMenuOpen(!isGenMenuOpen);

    if (loading && pokemonList.length === 0) return <div className="pokedex-container"><div className="loading">Cargando Pokedex Toons...</div></div>;
    if (error) return <div className="pokedex-container"><div className="error">Error: {error.message}</div></div>;

    return (
      <div className="pokedex-container">
          {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
          {showUpdate && <UpdateModal onClose={handleUpdateClose} />}
          
          <header>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img src="/logo.svg" alt="Mi Pokedex Logo" className="pokedex-logo" />
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
                          <div><label htmlFor="search-input">Nombre o ID:</label><input id="search-input" type="text" placeholder="Buscar..." value={searchTerm} onChange={handleSearchChange} /></div>
                          <div><label htmlFor="type-filter">Tipo:</label><select id="type-filter" value={selectedType} onChange={handleTypeChange}><option value="">Todos</option>{ALL_POKEMON_TYPES.map(type => <option key={type.value} value={type.value}>{type.display}</option>)}</select></div>
                          <div className="generation-filter-container">
                              <button onClick={toggleGenMenu} className="generation-button">Generación: {ALL_POKEMON_GENERATIONS.find(gen => gen.id.toString() === selectedGeneration)?.name || 'Seleccionar'}</button>
                              {isGenMenuOpen && (<ul className="generation-dropdown-menu">{ALL_POKEMON_GENERATIONS.map(gen => (<li key={gen.id} onClick={() => handleGenerationSelect(gen.id)} className={selectedGeneration === gen.id.toString() ? 'active' : ''}>{gen.name}</li>))}</ul>)}
                          </div>
                          <Link to="/battle" className="battle-button">Ir a Batalla</Link>
                          {/* Botón MT/MO Eliminado */}
                      </div>
                      <div className="pokemon-list">{filteredPokemon.length > 0 ? (filteredPokemon.map(pokemon => <PokemonCard key={pokemon.id} pokemon={pokemon} />)) : (<div className="no-results">No se encontraron Pokémon.</div>)}</div>
                  </>
              } />
              <Route path="/pokemon/:pokemonId" element={<PokemonDetail />} />
              <Route path="/battle" element={<BattleModeSelector />} />
              <Route path="/battle-selector" element={<PokemonBattleSelector pokemonList={pokemonList} />} />
              <Route path="/battle/arena" element={<PokemonBattleArena pokemonList={pokemonList} />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="*" element={<div className="error">Página no encontrada</div>} />
          </Routes>

          <div style={{ 
            position: 'absolute',
            bottom: '10px', 
            right: '10px', 
            fontSize: '13px',
            color: '#afafaf',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            zIndex: 100,
            fontFamily: 'monospace'
          }}>
            <span style={{ userSelect: 'none' }}>
              v{LATEST_UPDATE_VERSION.substring(0, LATEST_UPDATE_VERSION.lastIndexOf('.'))}
            </span>
            <Link
                to="/analytics"
                style={{
                    color: '#afafaf',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    cursor: 'pointer',
                    display: 'inline-block'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.color = '#afafaf';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.color = '#afafaf';
                }}
                title="Dashboard de Analytics"
          >
                .{LATEST_UPDATE_VERSION.substring(LATEST_UPDATE_VERSION.lastIndexOf('.') + 1)}
            </Link>
         </div>
      </div>
    );
}

export default App;