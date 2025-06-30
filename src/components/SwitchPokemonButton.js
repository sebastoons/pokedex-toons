// src/components/SwitchPokemonButton.js
import React from 'react';
import './SwitchPokemonButton.css';

const SwitchPokemonButton = ({ 
    playerTeam, 
    onSwitchPokemon, 
    isPlayersTurn, 
    awaitingPlayerSwitch, 
    battleEnded, 
    playerActivePokemonIndex 
}) => {
    const canSwitch = (isPlayersTurn || awaitingPlayerSwitch) && !battleEnded;
    const alivePokemons = playerTeam.filter(p => p.hp > 0);
    const canSwitchPokemon = alivePokemons.length > 1;

    const handleSwitchClick = () => {
        // Buscar el primer Pokémon vivo que no sea el actual
        const nextPokemonIndex = playerTeam.findIndex((pokemon, index) => 
            index !== playerActivePokemonIndex && pokemon.hp > 0
        );

        if (nextPokemonIndex !== -1) {
            onSwitchPokemon(nextPokemonIndex);
        }
    };

    return (
        <button
            onClick={handleSwitchClick}
            disabled={!canSwitch || !canSwitchPokemon}
            className="switch-button"
        >
            Cambiar Pokémon
        </button>
    );
};

export default SwitchPokemonButton;