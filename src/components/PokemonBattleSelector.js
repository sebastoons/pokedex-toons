// src/components/PokemonBattleSelector.js
import React, { useState, useEffect, useRef } from 'react'; // Importamos useRef
import { Link, useNavigate } from 'react-router-dom';
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
        
        // Habilitar/Deshabilitar el botón "Comenzar Batalla"
        // Asumo que tu botón tiene la clase 'start-battle-button' y no la id 'goToBattleButton'
        // Si tu botón de comenzar batalla es el que está en el Link, no se puede deshabilitar directamente.
        // Lo correcto sería un <button> y luego el navigate en el handler.
        // Si tienes el <button> descomenta la siguiente línea:
        // const startButton = document.querySelector('.start-battle-button');
        // if (startButton) {
        //     startButton.disabled = !areBothPokemonSelected;
        // }

        // Si ambos Pokémon están seleccionados y tenemos una referencia al div, hacemos scroll
        if (areBothPokemonSelected && selectionSlotsDisplayRef.current) {
            selectionSlotsDisplayRef.current.scrollIntoView({
                behavior: 'smooth', // Desplazamiento suave
                block: 'start'      // Alinea el inicio del elemento con el inicio del viewport
            });
        }
    }, [selectedPokemonTeam]); // Este efecto se ejecuta cada vez que 'selectedPokemonTeam' cambia

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
            <h1>Selecciona tus Pokémon</h1>

            {/* Slots de Selección Visuales - Añadimos la referencia aquí */}
            <div className="selection-slots-display" ref={selectionSlotsDisplayRef}> {/* AÑADIDO ref={selectionSlotsDisplayRef} */}
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
            {/* Si estás usando un Link, no puedes 'disabled'. La lógica de `handleStartBattle` ya valida */}
            <button
                onClick={handleStartBattle}
                className="start-battle-button" // Cambié el className a 'start-battle-button'
                disabled={!selectedPokemonTeam.every(p => p !== null)} // Habilita/Deshabilita directamente aquí
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
                            // Encontrar el primer slot vacío o el slot del mismo Pokémon para reemplazarlo
                            const emptySlotIndex = selectedPokemonTeam.findIndex(p => p === null);

                            if (emptySlotIndex !== -1) {
                                handleSelectPokemon(pokemon, emptySlotIndex);
                            } else if (isPokemonSelectedInAnySlot(pokemon.id)) {
                                // Si ya está seleccionado, permitir deseleccionar haciendo clic de nuevo
                                // Esto mejora la UX
                                const slotIndexToRemove = selectedPokemonTeam.findIndex(p => p && p.id === pokemon.id);
                                if (slotIndexToRemove !== -1) {
                                    removePokemonFromSlot(slotIndexToRemove);
                                }
                            } else {
                                // Ambos slots ocupados y el Pokémon no está en ninguno de ellos
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