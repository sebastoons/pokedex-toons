// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Importa tus componentes existentes
import PokemonCard from './components/PokemonCard';
import PokemonDetail from './components/PokemonDetail';
import PokemonBattleSelector from './components/PokemonBattleSelector';
import PokemonBattleArena from './components/PokemonBattleArena';
import MachineList from './components/MachineList';

// Mueve la definición de 'generations' FUERA del componente App
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
    const location = useLocation();

    const [pokemonList, setPokemonList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedGeneration, setSelectedGeneration] = useState('1');
    const [isGenMenuOpen, setIsGenMenuOpen] = useState(false);

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }, [location]);


    useEffect(() => {
        const fetchPokemonWithDetails = async () => {
            try {
                const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0');
                if (!listResponse.ok) {
                    throw new Error(`HTTP error! status: ${listResponse.status}`);
                }
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
                            if (!detailResponse.ok) {
                                console.warn(`Could not fetch details for ${pokemon.name}: ${detailResponse.status}`);
                                return { name: pokemon.name, url: pokemon.url, id: null, types: [] };
                            }
                            const detailData = await detailResponse.json();
                            return {
                                name: detailData.name,
                                url: pokemon.url,
                                id: detailData.id,
                                types: detailData.types.map(typeInfo => typeInfo.type.name)
                            };
                        } catch (detailErr) {
                            console.warn(`Error processing details for ${pokemon.name}: `, detailErr);
                            return { name: pokemon.name, url: pokemon.url, id: null, types: [] };
                        }
                    });

                    const resolvedChunk = await Promise.all(chunkPromises);
                    pokemonWithDetails.push(...resolvedChunk.filter(pokemon => pokemon.id !== null));

                    if (i + chunkSize < results.length) {
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                    }
                }

                setPokemonList(pokemonWithDetails);

            } catch (err) {
                setError(err);
                console.error("Error fetching initial list or details: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPokemonWithDetails();

    }, []);

    const filteredPokemon = useMemo(() => {
        let currentList = [...pokemonList];

        if (selectedGeneration) {
            const gen = ALL_POKEMON_GENERATIONS.find(g => g.id.toString() === selectedGeneration);
            if (gen) {
                currentList = currentList.filter(pokemon =>
                    pokemon.id > gen.offset && pokemon.id <= gen.offset + gen.limit
                );
            }
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentList = currentList.filter(pokemon => {
                const pokemonIdString = pokemon.id ? pokemon.id.toString() : '';
                return pokemon.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    pokemonIdString.includes(lowerCaseSearchTerm);
            });
        }

        if (selectedType) {
            currentList = currentList.filter(pokemon => {
                return pokemon.types && pokemon.types.includes(selectedType);
            });
        }

        return currentList;
    }, [pokemonList, searchTerm, selectedType, selectedGeneration]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    const handleGenerationSelect = (genId) => {
        setSelectedGeneration(genId.toString());
        setIsGenMenuOpen(false);
    };

    const toggleGenMenu = () => {
        setIsGenMenuOpen(!isGenMenuOpen);
    };

    if (loading) {
        return (
            <div className="pokedex-container">
                <div className="loading">Cargando Pokedex Pokémon...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pokedex-container">
                <div className="error">Error al cargar la lista de la Pokedex: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="pokedex-container">
            <header>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img
                        src="/logo.png"
                        alt="Mi Pokedex Logo"
                        className="pokedex-logo"
                    />
                    <span style={{ textAlign: 'right', display: 'block', marginLeft: '150px', marginTop: '5px',fontWeight: 'bold',fontSize: '0.9em',fontFamily: 'monospace', color: '#ebebebff' }}>By Toons ♥ </span>
                </Link>
            </header>

            <Routes>
                {/* Ruta principal (Home) */}
                <Route path="/" element={
                    <>
                        <div className="welcome-message">
                            <h2>Busca tu Pokémon</h2>
                            <p>¡Encuentra a tu Pokémon favorito por nombre, ID o tipo!</p>
                        </div>
                        <div className="controls-container">
                            {/* Búsqueda */}
                            <div>
                                <label htmlFor="search-input">Nombre o ID:</label>
                                <input
                                    id="search-input"
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            {/* Filtro por Tipo */}
                            <div>
                                <label htmlFor="type-filter">Tipo:</label>
                                <select id="type-filter" value={selectedType} onChange={handleTypeChange}>
                                    <option value="">Todos</option>
                                    {ALL_POKEMON_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.display}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Filtro por Generación */}
                            <div className="generation-filter-container">
                                <button onClick={toggleGenMenu} className="generation-button">
                                    Generación: {ALL_POKEMON_GENERATIONS.find(gen => gen.id.toString() === selectedGeneration)?.name || 'Seleccionar'}
                                </button>
                                {isGenMenuOpen && (
                                    <ul className="generation-dropdown-menu">
                                        {ALL_POKEMON_GENERATIONS.map(gen => (
                                            <li
                                                key={gen.id}
                                                onClick={() => handleGenerationSelect(gen.id)}
                                                className={selectedGeneration === gen.id.toString() ? 'active' : ''}
                                            >
                                                {gen.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {/* BOTÓN PARA EL SIMULADOR DE BATALLA */}
                            <Link to="/battle" className="battle-button">
                                Ir a Batalla
                            </Link>
                            
                            {/* <<<--- CAMBIO 1: AÑADIDO EL BOTÓN DE MT/MO ---<<< */}
                            <Link to="/moves" className="battle-button">
                                MT/MO
                            </Link>
                        </div>

                        <div className="pokemon-list">
                            {filteredPokemon.length > 0 ? (
                                filteredPokemon.map(pokemon => (
                                    <PokemonCard key={pokemon.name} pokemon={pokemon} />
                                ))
                            ) : (
                                <div className="no-results">No se encontraron Pokémon con los filtros aplicados.</div>
                            )}
                        </div>
                    </>
                } />

                {/* Ruta para el detalle del Pokémon */}
                <Route path="/pokemon/:pokemonId" element={<PokemonDetail />} />

                {/* RUTAS PARA EL SIMULADOR DE BATALLA */}
                <Route
                    path="/battle"
                    element={<PokemonBattleSelector pokemonList={pokemonList} />}
                />
                <Route
                    path="/battle/arena"
                    element={<PokemonBattleArena pokemonList={pokemonList} />}
                />

                {/* <<<--- CAMBIO 2: AÑADIDA LA NUEVA RUTA ---<<< */}
                <Route path="/moves" element={<MachineList />} />

                {/* Ruta comodín para cualquier otra URL (manejo de 404) */}
                <Route path="*" element={<div className="error">Página no encontrada</div>} />
            </Routes>
        </div>
    );
}

export default App;