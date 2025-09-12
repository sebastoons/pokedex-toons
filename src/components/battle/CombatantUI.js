import React from 'react';
import './CombatantUI.css';
import manualPokemonImages from '../../data/manualPokemonImages';

export const CombatantUI = ({
  pokemon,
  team,
  isOpponent,
  isAttacking,
  isDamaged,
  onPokemonCircleClick,
  canSwitch,
}) => {
  if (!pokemon) {
    return null;
  }

  const hpPercentage = Math.max(0, (pokemon.currentHp / pokemon.maxHp) * 100);

  // --- INICIO DE LA MODIFICACIÓN ---

  // 1. Determinamos la clase CSS para la barra de vida en lugar de un color directo.
  let hpBarClass = 'high-hp'; // Clase por defecto (verde)
  if (hpPercentage < 20) {
    hpBarClass = 'low-hp'; // Clase para vida baja (rojo)
  } else if (hpPercentage < 50) {
    hpBarClass = 'medium-hp'; // Clase para vida media (amarillo)
  }

  // --- FIN DE LA MODIFICACIÓN ---

  const manualImage = manualPokemonImages[pokemon.id];
  const fallbackImage = isOpponent 
    ? pokemon.sprites?.front_default 
    : pokemon.sprites?.back_default;
  const imageUrl = manualImage || fallbackImage || pokemon.imageUrl;

  return (
    <div className={`combatant-ui ${isOpponent ? 'opponent' : 'player'}`}>
      <div className="pokemon-data-panel">
        <div className="panel-header">
            <span className="combatant-name">{pokemon.name.toUpperCase()}</span>
            <span className="combatant-level">Nv. 50</span>
        </div>
        <div className="combatant-hp-bar-container">
          <div className="hp-label">HP</div>
          <div className="combatant-hp-bar-bg">
            {/* 2. Aplicamos la nueva clase y quitamos el estilo 'background' en línea */}
            <div 
              className={`combatant-hp-bar-fill ${hpBarClass}`} 
              style={{ width: `${hpPercentage}%` }} 
            />
          </div>
        </div>
        <span className="combatant-hp-text">{pokemon.currentHp} / {pokemon.maxHp}</span>
        
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

      <div className="pokemon-image-frame">
        <img
          src={imageUrl}
          alt={pokemon.name}
          className={`pokemon-sprite ${isOpponent ? 'opponent-sprite' : 'player-sprite'} ${isAttacking ? 'attacking' : ''} ${isDamaged ? 'damaged' : ''}`}
        />
      </div>
    </div>
  );
};