// src/components/battle/CombatantUI.js
import React from 'react';
import './CombatantUI.css';

export const CombatantUI = ({
  pokemon,
  team,
  isOpponent,
  isAttacking,
  isDamaged,
  onPokemonCircleClick,
  canSwitch,
}) => {
  if (!pokemon) return null;

  const hpPercentage = Math.max(0, (pokemon.currentHp / pokemon.maxHp) * 100);
  let hpBarColor = '#43ea7a'; // Verde
  if (hpPercentage < 20) hpBarColor = '#fe3261'; // Rojo
  else if (hpPercentage < 50) hpBarColor = '#feca57'; // Amarillo
  
  const getPokemonImageUrl = (p) => {
    if (isOpponent) {
      return p.sprites?.front_default || p.imageUrl;
    } else {
      return p.sprites?.back_default || p.imageUrl;
    }
  };

  return (
    <div className={`combatant-ui ${isOpponent ? 'opponent' : 'player'}`}>
      {/* --- SECCIÓN DE INFORMACIÓN (ARRIBA) --- */}
      <div className="pokemon-data-panel">
        <div className="panel-header">
            <span className="combatant-name">{pokemon.name.toUpperCase()}</span>
            <span className="combatant-level">Nv. 50</span>
        </div>
        <div className="combatant-hp-bar-container">
          <div className="hp-label">HP</div>
          <div className="combatant-hp-bar-bg">
            <div className="combatant-hp-bar-fill" style={{ width: `${hpPercentage}%`, background: hpBarColor }} />
          </div>
        </div>
        <span className="combatant-hp-text">{pokemon.currentHp} / {pokemon.maxHp}</span>
        
        {/* Círculos del Equipo */}
        <div className="pokemon-team-circles">
          {team.map((p, index) => {
              const isFainted = p.currentHp <= 0;
              const isActive = p.id === pokemon.id;
              const isClickable = !isOpponent && canSwitch && !isFainted && !isActive;

              return (
                  <div
                      key={p.id || index}
                      className={`pokemon-circle ${isFainted ? 'fainted' : ''} ${isActive ? 'active' : ''} ${isClickable ? 'clickable' : ''}`}
                      onClick={() => isClickable && onPokemonCircleClick(p)}
                      title={p.name}
                  >
                      <img src={p.sprites?.front_default || p.imageUrl} alt={p.name} />
                  </div>
              );
          })}
        </div>
      </div>

      {/* --- IMAGEN DEL POKÉMON (ABAJO) --- */}
      <div className="pokemon-image-frame">
        <img
          src={getPokemonImageUrl(pokemon)}
          alt={pokemon.name}
          className={`pokemon-combatant-sprite ${isAttacking ? 'attacking' : ''} ${isDamaged ? 'damaged' : ''}`}
        />
      </div>
    </div>
  );
};