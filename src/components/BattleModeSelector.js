// src/components/BattleModeSelector.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './BattleModeSelector.css';

const BattleModeSelector = () => {
  const navigate = useNavigate();

  // Esta función nos llevará al selector de Pokémon.
  // Más adelante le pasaremos el modo de juego (vs IA o vs Jugador).
  const handleModeSelection = (mode) => {
    // Por ahora, ambos botones irán al mismo sitio.
    // El 'state' nos permitirá decirle a la siguiente pantalla qué modo elegimos.
    navigate('/battle-selector', { state: { gameMode: mode } });
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
      </div>
      <Link to="/" className="back-to-pokedex-button">
        &lt; Volver a la Pokédex
      </Link>
    </div>
  );
};

export default BattleModeSelector;