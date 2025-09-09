import React from 'react';
import './CombatantUI.css';

// Icono Pokéball, puedes cambiar la ruta si tienes sprite especial
const pokeballImg = '/images/pokeball.png';

export const CombatantUI = ({
  pokemon,
  team,
  isOpponent,
  isAttacking,
  isDamaged,
  showPokeballs = true,
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
    <div className={`combatant-ui modern-card ${isOpponent ? 'opponent' : 'player'}`}>
      <div className="pokemon-image-frame">
        <img
          src={getPokemonImageUrl(pokemon)}
          alt={pokemon.name}
          className={`pokemon-combatant-img ${isAttacking ? 'attacking' : ''} ${isDamaged ? 'damaged' : ''}`}
        />
      </div>
      <div className="pokemon-data-panel">
        <span className="combatant-name">{pokemon.name.toUpperCase()}</span>
        <div className="combatant-hp-bar-container">
          <div className="combatant-hp-bar-bg">
            <div className="combatant-hp-bar-fill" style={{ width: `${hpPercentage}%`, background: hpBarColor }} />
          </div>
        </div>
        <span className="combatant-hp-text">{pokemon.currentHp} / {pokemon.maxHp} HP</span>
      </div>
      {showPokeballs && (
        <div className="pokeballs-row">
          {team.slice(0,3).map((p, idx) => (
            <img
              key={p.id}
              src={pokeballImg}
              alt={`Pokeball ${idx+1}`}
              className={`pokeball-icon ${p.id === pokemon.id ? 'active' : ''} ${p.currentHp <= 0 ? 'fainted' : ''}`}
              title={p.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};