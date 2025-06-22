// src/components/PokemonBattleSelector.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Función auxiliar para formatear el ID con ceros a la izquierda (ej. 1 -> 001)
const formatPokemonId = (id) => {
    return String(id).padStart(3, '0');
};

function PokemonBattleSelector({ pokemonList }) {
    const [selectedPokemonTeam, setSelectedPokemonTeam] = useState([null, null, null]); // Estado para 3 Pokémon
    const navigate = useNavigate();

    // Función para manejar la selección de un Pokémon en un slot específico
    const handleSelectPokemon = (pokemonId, slotIndex) => {
        const pokemon = pokemonList.find(p => p.id === parseInt(pokemonId));
        const newTeam = [...selectedPokemonTeam];
        newTeam[slotIndex] = pokemon;
        setSelectedPokemonTeam(newTeam);
    };

    // Filtra la lista de Pokémon para que no se puedan seleccionar repetidos
    const getAvailablePokemon = (currentSlotIndex) => {
        return pokemonList.filter(p =>
            // Permite seleccionar el Pokémon que ya está en el slot actual
            // pero filtra los que ya están en otros slots
            !selectedPokemonTeam.some((selectedP, index) =>
                selectedP && selectedP.id === p.id && index !== currentSlotIndex
            )
        );
    };

    const handleStartBattle = () => {
        // Asegúrate de que los 3 slots estén llenos
        if (selectedPokemonTeam.every(p => p !== null)) {
            // Pasa los IDs de los 3 Pokémon como parámetros de URL
            const p1Id = selectedPokemonTeam[0].id;
            const p2Id = selectedPokemonTeam[1].id;
            const p3Id = selectedPokemonTeam[2].id; // Nuevo ID
            navigate(`/battle/arena?p1=${p1Id}&p2=${p2Id}&p3=${p3Id}`);
        } else {
            alert('Por favor, selecciona 3 Pokémon para la batalla.');
        }
    };

    return (
        <div className="battle-selector-container">
            <h1>Selecciona tus Pokémon</h1>
            <div className="pokemon-selection-grid">
                {selectedPokemonTeam.map((pokemon, index) => (
                    <div className="selection-slot" key={index}>
                        <h2>Pokémon {index + 1}</h2>
                        <select
                            onChange={(e) => handleSelectPokemon(e.target.value, index)}
                            value={pokemon?.id || ''}
                        >
                            <option value="">Selecciona un Pokémon</option>
                            {getAvailablePokemon(index).map(p => (
                                <option key={p.id} value={p.id}>
                                    #{p.id} {p.name}
                                </option>
                            ))}
                        </select>
                        {pokemon && (
                            <div className="selected-pokemon-card">
                                {/* Muestra la miniatura del Pokémon, usando la función formatPokemonId */}
                                <img
                                    src={`/pokemon-thumbnails/${formatPokemonId(pokemon.id)}.png`} // <-- CAMBIO APLICADO AQUÍ
                                    alt={pokemon.name}
                                    className="pokemon-thumbnail"
                                />
                                <h3>{pokemon.name}</h3>
                                <p>Tipo: {pokemon.types.join(', ')}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleStartBattle}
                className="start-battle-button"
                disabled={!selectedPokemonTeam.every(p => p !== null)} // Habilita cuando los 3 están seleccionados
            >
                ¡Comenzar Batalla!
            </button>

            {/* Botón "Volver a la Pokédex" con estilo de enlace de Pokémon */}
            <Link to="/" className="pokemon-link-button">
                Volver a la Pokédex
            </Link>
        </div>
    );
}

export default PokemonBattleSelector;