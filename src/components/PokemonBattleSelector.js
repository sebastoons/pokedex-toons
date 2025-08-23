// src/components/PokemonBattleSelector.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactGA from 'react-ga4'; // <--- Importa ReactGA
import { getTypeInfo } from '../utils/typeEffectiveness';
import './PokemonBattleSelector.css';

// Función auxiliar para formatear el ID con ceros a la izquierda (ej. 1 -> 001)
const formatPokemonId = (id) => {
    return String(id).padStart(3, '0');
};

// Función para obtener el artwork oficial para la miniatura
const getPokemonOfficialArtworkUrl = (pokemonId) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
};

function PokemonBattleSelector({ pokemonList }) {
    const [selectedPokemonTeam, setSelectedPokemonTeam] = useState([null, null]);
    const [availablePokemon, setAvailablePokemon] = useState([]);
    const navigate = useNavigate();

    // 1. Crear una referencia para el div al que queremos hacer scroll
    const selectionSlotsDisplayRef = useRef(null);

    useEffect(() => {
        setAvailablePokemon(pokemonList);
    }, [pokemonList]);

    // 2. Usar useEffect para manejar el scroll y la habilitación del botón
    useEffect(() => {
        const areBothPokemonSelected = selectedPokemonTeam.every(p => p !== null);
        
        if (areBothPokemonSelected && selectionSlotsDisplayRef.current) {
            selectionSlotsDisplayRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [selectedPokemonTeam]);

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
            const p1Id = selectedPokemonTeam[0].id;
            const p2Id = selectedPokemonTeam[1].id;

            console.log("GA4 Event: 'Comenzar Batalla' button clicked.");
            ReactGA.event({
                category: 'Batalla Pokemon',
                action: 'Comenzar Batalla',
                label: `P1: ${selectedPokemonTeam[0].name} vs P2: ${selectedPokemonTeam[1].name}`,
                value: 1
            });

            navigate(`/battle/arena?p1=${p1Id}&p2=${p2Id}`);
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
            {/* --- CÓDIGO AÑADIDO --- */}
            <div className="battle-selector-top-bar">
                <Link to="/" className="pokemon-link-button back-to-pokedex">
                    &lt; Volver a la Pokédex
                </Link>
            </div>
            {/* --- FIN DEL CÓDIGO AÑADIDO --- */}

            <h1>Selecciona tus Pokémon</h1>

            {/* Slots de Selección Visuales - Añadimos la referencia aquí */}
            <div className="selection-slots-display" ref={selectionSlotsDisplayRef}>
                {selectedPokemonTeam.map((pokemon, index) => (
                    <div className="selected-pokemon-slot" key={index}>
                        <h2>Pokémon {index + 1}</h2>
                        {pokemon ? (
                            <div className="selected-pokemon-card-preview">
                                <img
                                    src={getPokemonOfficialArtworkUrl(pokemon.id)}
                                    alt={pokemon.name}
                                    className="pokemon-preview-image"
                                />
                                <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                                <div className="pokemon-card-types-container">
                                    {pokemon.types.map((typeName, typeIndex) => {
                                        const typeInfo = getTypeInfo(typeName);
                                        return (
                                            <span
                                                key={typeIndex}
                                                className="pokemon-type-badge pokemon-type-badge-small"
                                                style={{ backgroundColor: typeInfo.color }}
                                            >
                                                {typeInfo.name}
                                            </span>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => removePokemonFromSlot(index)}
                                    className="remove-pokemon-button"
                                >
                                    X
                                </button>
                            </div>
                        ) : (
                            <div className="empty-slot">
                                <p>Haz clic en un Pokémon abajo para seleccionarlo.</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Botón ¡Comenzar Batalla! */}
            <button
                onClick={handleStartBattle}
                className="start-battle-button"
                disabled={!selectedPokemonTeam.every(p => p !== null)}
            >
                ¡Comenzar Batalla!
            </button>

            {/* Cuadrícula de Pokémon disponibles */}
            <div className="available-pokemon-grid">
                {availablePokemon.map(pokemon => (
                    <div
                        key={pokemon.id}
                        className={`pokemon-grid-item ${isPokemonSelectedInAnySlot(pokemon.id) ? 'selected-in-slot' : ''}`}
                        onClick={() => {
                            const emptySlotIndex = selectedPokemonTeam.findIndex(p => p === null);

                            if (emptySlotIndex !== -1) {
                                handleSelectPokemon(pokemon, emptySlotIndex);
                            } else if (isPokemonSelectedInAnySlot(pokemon.id)) {
                                const slotIndexToRemove = selectedPokemonTeam.findIndex(p => p && p.id === pokemon.id);
                                if (slotIndexToRemove !== -1) {
                                    removePokemonFromSlot(slotIndexToRemove);
                                }
                            } else {
                                alert("Todos los slots están ocupados. Quita un Pokémon para seleccionar uno nuevo.");
                            }
                        }}
                    >
                        <img
                            src={getPokemonOfficialArtworkUrl(pokemon.id)}
                            alt={pokemon.name}
                            className="pokemon-grid-image"
                        />
                        <span className="pokemon-grid-name">
                            #{formatPokemonId(pokemon.id)} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                        </span>
                        <div className="pokemon-grid-types-container">
                            {pokemon.types.map((typeName, typeIndex) => {
                                const typeInfo = getTypeInfo(typeName);
                                return (
                                    <span
                                        key={typeIndex}
                                        className="pokemon-type-badge pokemon-type-badge-small"
                                        style={{ backgroundColor: typeInfo.color }}
                                    >
                                        {typeInfo.name}
                                    </span>
                                );
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