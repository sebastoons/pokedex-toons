import React from 'react';
import BattleLogDisplay from '../BattleLogDisplay';
import './BattleControls.css';

export const BattleControls = ({
  activePokemon, 
  battleLog,
  isPlayersTurn,
  awaitingPlayerSwitch,
  animationBlocking,
  onAttack,
  battleEnded,
  gameMode,
}) => {
  if (!activePokemon) return null;

  const controlsDisabled = animationBlocking || battleEnded || awaitingPlayerSwitch || 
    (gameMode === 'vsIA' && !isPlayersTurn);
    
  // --- INICIO DE LA CORRECCIÓN ---
  // Si 'activePokemon.moves' aún no existe, usamos un array vacío ([]) como respaldo.
  // Esto previene el error ".map is not a function".
  const movesToDisplay = (activePokemon.moves || []).slice(0, 4);
  // --- FIN DE LA CORRECCIÓN ---

  return (
    <div className="battle-interface">
      <div className="battle-log-wrapper">
        <BattleLogDisplay messages={battleLog} />
      </div>
      <div className="controls-wrapper">
        <div className="moves-grid">
          {/* Usamos la nueva variable segura 'movesToDisplay' */}
          {movesToDisplay.map((move, index) => (
            <button
              key={index}
              className="move-button"
              onClick={() => onAttack(move)}
              disabled={controlsDisabled}
            >
              <span className="move-name">{move.name}</span>
              <span className="move-pp">{move.pp}/{move.pp}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};