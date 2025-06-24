// src/components/PokemonBattleSelector.js
import React, { useState, useEffect } from 'react'; // Importamos useEffect
import { Link, useNavigate } from 'react-router-dom';
import { getTypeInfo } from '../utils/typeEffectiveness';
import './PokemonBattleSelector.css'; 

// Función auxiliar para formatear el ID con ceros a la izquierda (ej. 1 -> 001)
const formatPokemonId = (id) => {
    return String(id).padStart(3, '0');
};

// --- Nuevo: Función para obtener el artwork oficial para la miniatura si pokemonList no lo tiene ---
// Si pokemonList ya tiene pokemon.sprites.other['official-artwork'].front_default, puedes eliminar esta función
// y usar directamente esa propiedad en PokemonBattleSelector.
const getPokemonOfficialArtworkUrl = (pokemonId) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
};

function PokemonBattleSelector({ pokemonList }) { // pokemonList debería ser una lista simple de {id, name, types}
    const [selectedPokemonTeam, setSelectedPokemonTeam] = useState([null, null]);
    const [availablePokemon, setAvailablePokemon] = useState([]); // Nuevo estado para los Pokémon disponibles en la cuadrícula
    const navigate = useNavigate();

    // Cuando pokemonList cambie (ej. al cargarse), actualizamos los disponibles
    useEffect(() => {
        // Asumiendo que pokemonList ya viene con al menos id, name y types
        // Si no, necesitarías cargar más detalles aquí o en App.js
        setAvailablePokemon(pokemonList);
    }, [pokemonList]);


    const handleSelectPokemon = (pokemon, slotIndex) => { // Ahora recibimos el objeto pokemon completo
        const newTeam = [...selectedPokemonTeam];
        
        // Evitar seleccionar el mismo Pokémon en dos slots
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

            {/* Slots de Selección Visuales */}
            <div className="selection-slots-display">
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
                            // Encontrar el primer slot vacío o el slot del mismo Pokémon para reemplazarlo
                            const emptySlotIndex = selectedPokemonTeam.findIndex(p => p === null);
                            const alreadySelectedSlotIndex = selectedPokemonTeam.findIndex(p => p && p.id === pokemon.id);

                            if (emptySlotIndex !== -1) {
                                handleSelectPokemon(pokemon, emptySlotIndex);
                            } else if (alreadySelectedSlotIndex !== -1) {
                                // Si ya está seleccionado, pero no hay slots vacíos, no hacer nada
                                // Opcional: permitir deseleccionar haciendo clic de nuevo
                                alert("Todos los slots están ocupados. Quita un Pokémon para seleccionar uno nuevo.");
                            } else {
                                // Ambos slots ocupados y el Pokémon no está en ninguno de ellos
                                alert("Selecciona un slot vacío o deselecciona un Pokémon primero.");
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