// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import PokemonCard from './components/PokemonCard';
import { Routes, Route, Link } from 'react-router-dom';
import PokemonDetail from './components/PokemonDetail';

// Mueve la definición de 'generations' FUERA del componente App
// De esta manera, es una constante que solo se define una vez
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

// MODIFICADO: Lista de tipos también fuera del componente si es constante
const ALL_POKEMON_TYPES = [
    { value: 'normal', display: 'Normal' },
    { value: 'fire', display: 'Fuego' },
    { value: 'water', display: 'Agua' },
    { value: 'electric', display: 'Eléctrico' },
    { value: 'grass', display: 'Planta' },
    { value: 'ice', display: 'Hielo' },
    { value: 'fighting', display: 'Lucha' },
    { value: 'poison', display: 'Veneno' },
    { value: 'ground', display: 'Tierra' },
    { value: 'flying', display: 'Volador' },
    { value: 'psychic', display: 'Psíquico' },
    { value: 'bug', display: 'Bicho' },
    { value: 'rock', display: 'Roca' },
    { value: 'ghost', display: 'Fantasma' },
    { value: 'dragon', display: 'Dragón' },
    { value: 'dark', display: 'Siniestro' },
    { value: 'steel', display: 'Acero' },
    { value: 'fairy', display: 'Hada' },
];

function App() {
    const [pokemonList, setPokemonList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedGeneration, setSelectedGeneration] = useState('1');
    const [isGenMenuOpen, setIsGenMenuOpen] = useState(false);

    // Ahora, usa la constante global
    const generations = ALL_POKEMON_GENERATIONS;
    const pokemonTypes = ALL_POKEMON_TYPES;


    useEffect(() => {
        const fetchPokemonWithDetails = async () => {
            try {
                const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=905&offset=0');
                if (!listResponse.ok) {
                    throw new Error(`HTTP error! status: ${listResponse.status}`);
                }
                const listData = await listResponse.json();
                const results = listData.results;

                const pokemonWithDetails = await Promise.all(
                    results.map(async (pokemon) => {
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
                    })
                );

                const validPokemon = pokemonWithDetails.filter(pokemon => pokemon.id !== null);
                setPokemonList(validPokemon);

            } catch (err) {
                setError(err);
                console.error("Error fetching initial list or details: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPokemonWithDetails();

    }, []);


    // useMemo memoriza el resultado de la función y solo la re-ejecuta si las dependencias cambian.
    const filteredPokemon = useMemo(() => {
        let currentList = [...pokemonList];

        // 1. Filtrar por Generación
        if (selectedGeneration) {
            // Asegúrate de usar ALL_POKEMON_GENERATIONS aquí si `generations` se mueve fuera del componente
            const gen = ALL_POKEMON_GENERATIONS.find(g => g.id.toString() === selectedGeneration); // <--- CAMBIO AQUÍ
            if (gen) {
                currentList = currentList.filter(pokemon =>
                    pokemon.id > gen.offset && pokemon.id <= gen.offset + gen.limit
                );
            }
        }

        // 2. Filtrar por Búsqueda (Nombre o ID)
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentList = currentList.filter(pokemon => {
                const pokemonIdString = pokemon.id ? pokemon.id.toString() : '';
                return pokemon.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    pokemonIdString.includes(lowerCaseSearchTerm);
            });
        }

        // 3. Filtrar por Tipo
        if (selectedType) {
            currentList = currentList.filter(pokemon => {
                return pokemon.types && pokemon.types.includes(selectedType);
            });
        }

        return currentList;
    }, [pokemonList, searchTerm, selectedType, selectedGeneration]); // <--- 'generations' ya NO es una dependencia porque ALL_POKEMON_GENERATIONS es constante


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
                <div className="loading">Cargando lista inicial de Pokémon...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pokedex-container">
                <div className="error">Error al cargar la lista inicial: {error.message}</div>
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
                </Link>
            </header>

            <Routes>
                <Route path="/" element={
                    <div className="welcome-message">
                        <h2>Busca tu Pokémon</h2>
                        <p>¡Encuentra a tu Pokémon favorito por nombre, ID o tipo!</p>
                    </div>
                } />
                <Route path="/pokemon/:pokemonId" element={null} />
                <Route path="*" element={null} />
            </Routes>

            <Routes>
                <Route path="/" element={
                    <div className="controls-container">
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
                        <div>
                            <label htmlFor="type-filter">Tipo:</label>
                            <select id="type-filter" value={selectedType} onChange={handleTypeChange}>
                                <option value="">Todos</option>
                                {ALL_POKEMON_TYPES.map(type => ( // <--- CAMBIO AQUÍ también, usando ALL_POKEMON_TYPES
                                    <option key={type.value} value={type.value}>{type.display}</option>
                                ))}
                            </select>
                        </div>

                        <div className="generation-filter-container">
                            <button onClick={toggleGenMenu} className="generation-button">
                                Generación: {ALL_POKEMON_GENERATIONS.find(gen => gen.id.toString() === selectedGeneration)?.name || 'Seleccionar'} {/* <--- CAMBIO AQUÍ */}
                            </button>

                            {isGenMenuOpen && (
                                <ul className="generation-dropdown-menu">
                                    {ALL_POKEMON_GENERATIONS.map(gen => ( // <--- CAMBIO AQUÍ
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
                    </div>
                } />
                <Route path="/pokemon/:pokemonId" element={null} />
                <Route path="*" element={null} />
            </Routes>


            <Routes>
                <Route path="/" element={
                    <div className="pokemon-list">
                        {filteredPokemon.length > 0 ? (
                            filteredPokemon.map(pokemon => (
                                <PokemonCard key={pokemon.name} pokemon={pokemon} />
                            ))
                        ) : (
                            <div className="no-results">No se encontraron Pokémon con los filtros aplicados.</div>
                        )}
                    </div>
                } />

                <Route path="/pokemon/:pokemonId" element={<PokemonDetail />} />

                <Route path="*" element={<div className="error">Pokémon no encontrado o página inexistente</div>} />

            </Routes>
        </div>
    );
}

export default App;