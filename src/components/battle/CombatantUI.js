// src/components/battle/CombatantUI.js
import React from 'react';
import './CombatantUI.css'; // Importa su propio CSS

export const CombatantUI = ({ 
    pokemon, 
    team, 
    isOpponent, 
    isAttacking, 
    isDamaged, 
    onPokemonCircleClick, // Nueva prop para manejar clicks en los círculos
    canSwitchPokemon = false, // Nueva prop para determinar si se puede cambiar
    awaitingSwitch = false // Nueva prop para saber si está esperando cambio
}) => {
    if (!pokemon) return null; // No renderizar si no hay Pokémon activo

    const hpPercentage = (pokemon.currentHp / pokemon.maxHp) * 100;
    let hpBarColor = '#00ff00'; // Verde
    if (hpPercentage < 20) hpBarColor = '#ff0000'; // Rojo
    else if (hpPercentage < 50) hpBarColor = '#ffa500'; // Naranja

    const getPokemonImageUrl = (p) => {
        // Usa el sprite trasero para el jugador, frontal para el oponente
        if (isOpponent) {
            return p.sprites?.front_default || p.imageUrl;
        } else {
            return p.sprites?.back_default || p.imageUrl;
        }
    };

    const handleCircleClick = (clickedPokemon) => {
        // Solo permitir click si:
        // 1. Es el jugador (no oponente)
        // 2. Se puede cambiar Pokémon
        // 3. El Pokémon clickeado no es el activo
        // 4. El Pokémon clickeado no está debilitado
        if (!isOpponent && canSwitchPokemon && clickedPokemon.id !== pokemon.id && clickedPokemon.currentHp > 0) {
            if (onPokemonCircleClick) {
                onPokemonCircleClick(clickedPokemon.id);
            }
        }
    };

    return (
        <div className={`combatant-ui-container ${isOpponent ? 'opponent' : 'player'}`}>
            <div className="pokemon-info">
                <div className="pokemon-name-hp">
                    <span className="pokemon-name">{pokemon.name.toUpperCase()}</span>
                    <div className="hp-bar-container">
                        <div className="hp-bar-background">
                            <div className="hp-bar-fill" style={{ width: `${hpPercentage}%`, backgroundColor: hpBarColor }}></div>
                        </div>
                    </div>
                    <span className="hp-text">{pokemon.currentHp}/{pokemon.maxHp} HP</span>
                </div>
                
                {/* Indicador de cambio de Pokémon para el jugador */}
                {!isOpponent && awaitingSwitch && (
                    <div className="switch-instruction">
                        <span>¡Elige un Pokémon!</span>
                    </div>
                )}
                
                <div className="team-status">
                    {team.map((p, index) => (
                        <div 
                            key={p.id || index} 
                            className={`team-pokemon-icon 
                                ${p.currentHp <= 0 ? 'fainted' : ''} 
                                ${p.id === pokemon.id ? 'active' : ''} 
                                ${!isOpponent && canSwitchPokemon && p.id !== pokemon.id && p.currentHp > 0 ? 'clickable' : ''}
                                ${!isOpponent && awaitingSwitch && p.id !== pokemon.id && p.currentHp > 0 ? 'pulsing' : ''}
                            `}
                            onClick={() => handleCircleClick(p)}
                            title={!isOpponent && canSwitchPokemon && p.id !== pokemon.id && p.currentHp > 0 ? 
                                `Cambiar a ${p.name}` : p.name}
                        >
                            <img src={p.sprites?.front_default || p.imageUrl} alt={p.name} />
                            {/* Indicador visual de HP en el círculo */}
                            <div className="circle-hp-indicator" style={{
                                background: `conic-gradient(
                                    ${p.currentHp / p.maxHp > 0.5 ? '#4CAF50' : 
                                      p.currentHp / p.maxHp > 0.2 ? '#FFC107' : '#F44336'} 
                                    ${(p.currentHp / p.maxHp) * 360}deg, 
                                    rgba(255,255,255,0.3) 0deg
                                )`
                            }}></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="pokemon-sprite-container">
                <img
                    src={getPokemonImageUrl(pokemon)}
                    alt={pokemon.name}
                    className={`pokemon-sprite ${isAttacking ? 'attacking' : ''} ${isDamaged ? 'damaged' : ''}`}
                />
            </div>
        </div>
    );
};