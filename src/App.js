// src/App.js
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ReactGA from 'react-ga4';

// Componentes cargados inmediatamente
import PokeBallSpinner from './components/PokeBallSpinner';
import PokemonCard from './components/PokemonCard';
import PokemonDelDia from './components/PokemonDelDia';
import WelcomeModal from './components/WelcomeModal';
import UpdateModal from './components/UpdateModal';
import PokedexMenu from './components/PokedexMenu';
import { generacionEspecial } from './data/generacionEspecial';
import manualPokemonImages from './data/manualPokemonImages';

// Analytics Tracker
import analyticsTracker from './utils/analyticsTracker';

// Componentes lazy (solo se cargan al navegar a su ruta)
const PokemonDetail         = lazy(() => import('./components/PokemonDetail'));
const PokemonBattleSelector = lazy(() => import('./components/PokemonBattleSelector'));
const PokemonBattleArena    = lazy(() => import('./components/battle/PokemonBattleArena'));
const BattleModeSelector    = lazy(() => import('./components/BattleModeSelector'));
const AnalyticsDashboard    = lazy(() => import('./components/AnalyticsDashboard'));

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

const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
    exit:    { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

function App() {
    const location = useLocation();
    const [pokemonList, setPokemonList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedGeneration, setSelectedGeneration] = useState('1');
    const [isGenMenuOpen, setIsGenMenuOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showPokedexMenu, setShowPokedexMenu] = useState(true);
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
            const fetchOne = async (pokemon) => {
                try {
                    const idFromUrl = parseInt(pokemon.url.split('/')[6]);
                    const res = await fetch(pokemon.url);
                    const data = res.ok ? await res.json() : { id: idFromUrl, name: pokemon.name, types: [{ type: { name: 'normal' } }] };
                    return {
                        name: data.name,
                        url: pokemon.url,
                        id: data.id,
                        types: data.types.map(t => t.type.name),
                        imageUrl: manualPokemonImages[data.id] || null,
                    };
                } catch { return null; }
            };

            try {
                const listRes = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0');
                if (!listRes.ok) throw new Error(`HTTP error: ${listRes.status}`);
                const { results } = await listRes.json();

                // Gen 1: fetch all 151 in parallel → render immediately
                const gen1Raw = await Promise.all(results.slice(0, 151).map(fetchOne));
                const gen1 = gen1Raw.filter(Boolean);
                setPokemonList([...gen1]);
                setLoading(false);

                // Rest: fetch in batches of 50 in background
                const rest = results.slice(151);
                const all = [...gen1];
                const CHUNK = 50;
                for (let i = 0; i < rest.length; i += CHUNK) {
                    const chunk = await Promise.all(rest.slice(i, i + CHUNK).map(fetchOne));
                    all.push(...chunk.filter(Boolean));
                    setPokemonList([...all]);
                    if (i + CHUNK < rest.length) await new Promise(r => setTimeout(r, 80));
                }

                const special = generacionEspecial.map(p => ({
                    id: p.id, name: p.name.toLowerCase(), types: p.types, imageUrl: p.imageUrl, isSpecial: true,
                }));
                setPokemonList([...all, ...special]);

            } catch (err) {
                setError(err);
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

    if (loading && pokemonList.length === 0) return (
        <div className="pokedex-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <PokeBallSpinner text="Cargando Pokédex..." size={72} />
        </div>
    );
    if (error) return <div className="pokedex-container"><div className="error">Error: {error.message}</div></div>;

    return (
      <div className="pokedex-container">
          {showPokedexMenu && <PokedexMenu onClose={() => setShowPokedexMenu(false)} />}
          {showWelcome && !showPokedexMenu && <WelcomeModal onClose={handleWelcomeClose} />}
          {showUpdate && <UpdateModal onClose={handleUpdateClose} />}

          <header>
              <div
                  style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                  onClick={() => setShowPokedexMenu(true)}
              >
                  <img src="/logo.svg" alt="Mi Pokedex Logo" className="pokedex-logo" />
                  <span style={{ textAlign: 'right', display: 'block', marginLeft: '150px', marginTop: '5px',fontWeight: 'bold',fontSize: '0.9em',fontFamily: 'monospace', color: '#ebebebff' }}>By Toons ♥ </span>
              </div>
          </header>

          <AnimatePresence mode="wait">
          <Suspense fallback={<div style={{display:'flex',justifyContent:'center',paddingTop:'40px'}}><PokeBallSpinner text="Cargando..." size={56} /></div>}>
          <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  <>
                      <div className="welcome-message">
                          <h2>Busca tu Pokémon</h2>
                          <p>¡Encuentra a tu Pokémon favorito por nombre, ID o tipo!</p>
                      </div>
                      {pokemonList.length > 0 && <PokemonDelDia pokemonList={pokemonList} />}
                      <div className="controls-container">
                          <div><label htmlFor="search-input">Nombre o ID:</label><input id="search-input" type="text" placeholder="Buscar..." value={searchTerm} onChange={handleSearchChange} /></div>
                          <div><label htmlFor="type-filter">Tipo:</label><select id="type-filter" value={selectedType} onChange={handleTypeChange}><option value="">Todos</option>{ALL_POKEMON_TYPES.map(type => <option key={type.value} value={type.value}>{type.display}</option>)}</select></div>
                          <div className="generation-filter-container">
                              <button onClick={toggleGenMenu} className="generation-button">Generación: {ALL_POKEMON_GENERATIONS.find(gen => gen.id.toString() === selectedGeneration)?.name || 'Seleccionar'}</button>
                              {isGenMenuOpen && (<ul className="generation-dropdown-menu">{ALL_POKEMON_GENERATIONS.map(gen => (<li key={gen.id} onClick={() => handleGenerationSelect(gen.id)} className={selectedGeneration === gen.id.toString() ? 'active' : ''}>{gen.name}</li>))}</ul>)}
                          </div>
                          <Link to="/battle" className="battle-button">Ir a Batalla</Link>
                      </div>
                      <div className="pokemon-list">{filteredPokemon.length > 0 ? (filteredPokemon.map(pokemon => <PokemonCard key={pokemon.id} pokemon={pokemon} />)) : (<div className="no-results">No se encontraron Pokémon.</div>)}</div>
                  </>
                  </motion.div>
              } />
              <Route path="/pokemon/:pokemonId" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><PokemonDetail /></motion.div>} />
              <Route path="/battle" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><BattleModeSelector /></motion.div>} />
              <Route path="/battle-selector" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><PokemonBattleSelector pokemonList={pokemonList} /></motion.div>} />
              <Route path="/battle/arena" element={<PokemonBattleArena pokemonList={pokemonList} />} />
              <Route path="/analytics" element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><AnalyticsDashboard /></motion.div>} />
              <Route path="*" element={<div className="error">Página no encontrada</div>} />
          </Routes>
          </Suspense>
          </AnimatePresence>

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