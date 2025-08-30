// src/components/PokemonBattleSelector.js
import React, { useState, useEffect, useRef, useMemo } from 'react'; // <-- Añadimos useMemo
import { Link, useNavigate } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { getTypeInfo } from '../utils/typeEffectiveness';
import './PokemonBattleSelector.css';

// --- 1. COPIAMOS LA LISTA DE GENERACIONES DE App.js ---
const ALL_POKEMON_GENERATIONS = [
    { id: 'all', name: 'Todas las Gen' }, // Opción para ver todos
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

// Funciones auxiliares (sin cambios)
const formatPokemonId = (id) => String(id).padStart(3, '0');
const getPokemonOfficialArtworkUrl = (pokemonId) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

function PokemonBattleSelector({ pokemonList }) {
    const [selectedPokemonTeam, setSelectedPokemonTeam] = useState([null, null]);
    const navigate = useNavigate();
    const selectionSlotsDisplayRef = useRef(null);

    // --- 2. AÑADIMOS NUEVOS ESTADOS PARA EL FILTRO ---
    const [selectedGeneration, setSelectedGeneration] = useState('all');
    const [isGenMenuOpen, setIsGenMenuOpen] = useState(false);

    useEffect(() => {
        const areBothPokemonSelected = selectedPokemonTeam.every(p => p !== null);
        if (areBothPokemonSelected && selectionSlotsDisplayRef.current) {
            selectionSlotsDisplayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedPokemonTeam]);

    // --- 3. USAMOS useMemo PARA FILTRAR LA LISTA DE POKÉMON ---
    const availablePokemon = useMemo(() => {
        if (selectedGeneration === 'all') {
            return pokemonList; // Si es 'all', devolvemos la lista completa
        }
        const gen = ALL_POKEMON_GENERATIONS.find(g => g.id.toString() === selectedGeneration);
        if (gen) {
            return pokemonList.filter(pokemon => 
                pokemon.id > gen.offset && pokemon.id <= gen.offset + gen.limit
            );
        }
        return pokemonList;
    }, [pokemonList, selectedGeneration]);
    
    // --- 4. AÑADIMOS LAS FUNCIONES PARA MANEJAR EL FILTRO ---
    const handleGenerationSelect = (genId) => {
      setSelectedGeneration(genId.toString());
      setIsGenMenuOpen(false);
    };

    const toggleGenMenu = () => {
      setIsGenMenuOpen(!isGenMenuOpen);
    };

    // (El resto de las funciones como handleSelectPokemon, handleStartBattle, etc. no cambian)
    const handleSelectPokemon = (pokemon, slotIndex) => {
        const newTeam = [...selectedPokemonTeam];
        if (newTeam.some((p, idx) => p && p.id === pokemon.id && idx !== slotIndex)) {
            alert("¡Ya has seleccionado este Pokémon para otro slot!");
            return;
        }
        newTeam[slotIndex] = pokemon;
        setSelectedPokemonTeam(newTeam);
    };

    const handleStartBattle = () => {
        if (selectedPokemonTeam.every(p => p !== null)) {
            const [p1, p2] = selectedPokemonTeam;
            ReactGA.event({
                category: 'Batalla Pokemon',
                action: 'Comenzar Batalla',
                label: `P1: ${p1.name} vs P2: ${p2.name}`,
            });
            navigate(`/battle/arena?p1=${p1.id}&p2=${p2.id}`);
        } else {
            alert('Por favor, selecciona 2 Pokémon para la batalla.');
        }
    };

    const removePokemonFromSlot = (slotIndex) => {
        const newTeam = [...selectedPokemonTeam];
        newTeam[slotIndex] = null;
        setSelectedPokemonTeam(newTeam);
    };

    const isPokemonSelectedInAnySlot = (pokemonId) => {
        return selectedPokemonTeam.some(p => p && p.id === pokemonId);
    };

    return (
        <div className="battle-selector-container">
            <Link to="/" className="pokemon-link-button back-to-pokedex-top">
                &lt; Volver a la Pokédex
            </Link>

            <h1>Selecciona tus Pokémon</h1>

            <div className="selection-slots-display" ref={selectionSlotsDisplayRef}>
                {selectedPokemonTeam.map((pokemon, index) => (
                    <div className="selected-pokemon-slot" key={index}>
                        <h2>Pokémon {index + 1}</h2>
                        {pokemon ? (
                            <div className="selected-pokemon-card-preview">
                                <img src={getPokemonOfficialArtworkUrl(pokemon.id)} alt={pokemon.name} className="pokemon-preview-image" />
                                <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                                <div className="pokemon-card-types-container">
                                    {pokemon.types.map((typeName, typeIndex) => {
                                        const typeInfo = getTypeInfo(typeName);
                                        return <span key={typeIndex} className="pokemon-type-badge pokemon-type-badge-small" style={{ backgroundColor: typeInfo.color }}>{typeInfo.name}</span>;
                                    })}
                                </div>
                                <button onClick={() => removePokemonFromSlot(index)} className="remove-pokemon-button">X</button>
                            </div>
                        ) : (
                            <div className="empty-slot"><p>Selecciona un Pokémon.</p></div>
                        )}
                    </div>
                ))}
            </div>

            <button onClick={handleStartBattle} className="start-battle-button" disabled={!selectedPokemonTeam.every(p => p !== null)}>
                ¡Comenzar Batalla!
            </button>

            {/* --- 5. AÑADIMOS EL FILTRO A LA PANTALLA --- */}
            <div className="battle-controls-container">
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
            </div>
            
            <div className="available-pokemon-grid">
                {availablePokemon.map(pokemon => (
                    <div
                        key={pokemon.id}
                        className={`pokemon-grid-item ${isPokemonSelectedInAnySlot(pokemon.id) ? 'selected-in-slot' : ''}`}
                        onClick={() => {
                            const emptySlotIndex = selectedPokemonTeam.findIndex(p => p === null);
                            if (emptySlotIndex !== -1) {
                                handleSelectPokemon(pokemon, emptySlotIndex);
                            } else {
                                alert("Todos los slots están ocupados.");
                            }
                        }}
                    >
                        <img src={getPokemonOfficialArtworkUrl(pokemon.id)} alt={pokemon.name} className="pokemon-grid-image" />
                        <span className="pokemon-grid-name">#{formatPokemonId(pokemon.id)} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
                        <div className="pokemon-grid-types-container">
                            {pokemon.types.map((typeName, typeIndex) => {
                                const typeInfo = getTypeInfo(typeName);
                                return <span key={typeIndex} className="pokemon-type-badge pokemon-type-badge-small" style={{ backgroundColor: typeInfo.color }}>{typeInfo.name}</span>;
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <Link to="/" className="pokemon-link-button back-to-pokedex">
                Volver a la Pokédex
            </Link>
        </div>
    );
}

export default PokemonBattleSelector;