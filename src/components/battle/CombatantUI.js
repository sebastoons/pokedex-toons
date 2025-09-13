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

  let hpBarClass = 'high-hp';
  if (hpPercentage < 20) {
    hpBarClass = 'low-hp';
  } else if (hpPercentage < 50) {
    hpBarClass = 'medium-hp';
  }

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
              const isAlive = p.currentHp > 0 && !isActive;
              const isClickable = canSwitch && !isFainted && !isActive;

              let circleClasses = ['pokemon-circle'];
              
              if (isFainted) circleClasses.push('fainted');
              else if (isActive) circleClasses.push('active');
              else if (isAlive) circleClasses.push('alive');
              
              if (isClickable) circleClasses.push('clickable');

              return (
                  <div
                      key={p.id || index}
                      className={circleClasses.join(' ')}
                      onClick={() => isClickable && onPokemonCircleClick && onPokemonCircleClick(p)}
                      title={`${p.name} - HP: ${p.currentHp}/${p.maxHp}`}
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
          className={`pokemon-combatant-sprite ${isOpponent ? 'opponent-sprite' : 'player-sprite'} ${isAttacking ? 'attacking' : ''} ${isDamaged ? 'damaged' : ''}`}
        />
      </div>
    </div>
  );
};