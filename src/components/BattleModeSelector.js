// src/components/BattleModeSelector.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pickRandomTeam, buildRandomMovesMap } from '../utils/randomBattleUtils';
import './BattleModeSelector.css';

const TEAM_SIZE = 3;
const MIN_POOL_SIZE = TEAM_SIZE * 2;

const BattleModeSelector = ({ pokemonList = [] }) => {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  const handleModeSelection = (mode) => {
    navigate('/battle-selector', { state: { gameMode: mode } });
  };

  // Batalla contra la IA con equipos y técnicas 100% al azar, sin pasar por
  // las pantallas de selección manual.
  const handleRandomBattle = () => {
    if (starting) return;
    if (pokemonList.length < MIN_POOL_SIZE) {
      alert('Todavía se están cargando los Pokémon. Intenta de nuevo en unos segundos.');
      return;
    }
    setStarting(true);
    const p1Team = pickRandomTeam(pokemonList, TEAM_SIZE);
    const p2Team = pickRandomTeam(pokemonList, TEAM_SIZE, p1Team.map(p => p.id));
    const customMovesP1 = buildRandomMovesMap(p1Team);
    const customMovesP2 = buildRandomMovesMap(p2Team);

    navigate(
      `/battle/arena?p1=${p1Team.map(p => p.id).join(',')}&p2=${p2Team.map(p => p.id).join(',')}&mode=vsIA`,
      { state: { customMovesP1, customMovesP2 } }
    );
  };

  return (
    <div className="battle-mode-container">
      <h1 className="battle-mode-title">Elige un Modo de Batalla</h1>
      <div className="battle-mode-options">
        <div className="mode-card" onClick={() => handleModeSelection('vsIA')}>
          <h2>Jugador vs IA</h2>
          <p>Enfréntate a un entrenador controlado por la máquina. ¡Elige tus Pokémon y prepárate para un desafío!</p>
        </div>
        <div className="mode-card" onClick={() => handleModeSelection('vsPlayer')}>
          <h2>Jugador vs Jugador</h2>
          <p>¡Desafía a un amigo! Cada entrenador elegirá su equipo en turnos para una batalla épica en el mismo dispositivo.</p>
        </div>
        <div
          className="mode-card mode-card-random"
          onClick={handleRandomBattle}
          style={{ opacity: starting ? 0.6 : 1, pointerEvents: starting ? 'none' : 'auto' }}
        >
          <h2>🎲 Batalla Aleatoria</h2>
          <p>¡Sin selección! Ambos equipos y sus técnicas se eligen al azar contra la IA. ¡A luchar de inmediato!</p>
        </div>
      </div>
      <Link to="/" className="back-to-pokedex-button">
        &lt; Volver a la Pokédex
      </Link>
    </div>
  );
};

export default BattleModeSelector;
