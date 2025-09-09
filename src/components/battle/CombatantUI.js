// src/components/battle/CombatantUI.js
import React from 'react';
import './CombatantUI.css'; // Importa su propio CSS

export const CombatantUI = ({ pokemon, team, isOpponent, isAttacking, isDamaged }) => {
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
                <div className="team-status">
                    {team.map((p, index) => (
                        <div key={p.id || index} className={`team-pokemon-icon ${p.currentHp <= 0 ? 'fainted' : ''} ${p.id === pokemon.id ? 'active' : ''}`}>
                            <img src={p.sprites?.front_default || p.imageUrl} alt={p.name} />
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