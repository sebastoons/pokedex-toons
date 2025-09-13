import React from 'react';
import BattleLogDisplay from '../BattleLogDisplay';
import { getMoveTypeGradient } from '../../utils/moveTypeColors';
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
  controlsActive = true // Nueva prop con valor por defecto
}) => {
  if (!activePokemon) return null;

  // CORREGIDO: Lógica de deshabilitación más clara
  const controlsDisabled = !controlsActive || animationBlocking || battleEnded || awaitingPlayerSwitch || 
    (gameMode === 'vsIA' && !isPlayersTurn);
    
  const movesToDisplay = (activePokemon.moves || []).slice(0, 4);

  // CORREGIDO: Mostrar mensaje especial cuando no es el turno del jugador en modo IA
  const showIAWaitingMessage = gameMode === 'vsIA' && !isPlayersTurn && !battleEnded && !awaitingPlayerSwitch;

  return (
    <div className="battle-interface">
      <div className="battle-log-wrapper">
        <BattleLogDisplay messages={battleLog} />
      </div>
      <div className="controls-wrapper">
        {/* CORREGIDO: Mostrar mensaje de espera en lugar de ocultar controles */}
        {showIAWaitingMessage ? (
          <div className="ia-waiting-message">
            <div className="waiting-text">Turno de la IA...</div>
            <div className="waiting-dots">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
          </div>
        ) : (
          <div className="moves-grid">
            {movesToDisplay.map((move, index) => {
              const moveGradient = getMoveTypeGradient(move.type);
              
              return (
                <button
                  key={index}
                  className="move-button"
                  onClick={() => onAttack(move)}
                  disabled={controlsDisabled}
                  style={{ 
                    background: moveGradient,
                    borderColor: controlsDisabled ? '#666' : 'rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <span className="move-name">{move.name}</span>
                  <span className="move-power">
                    {move.power > 0 ? move.power : move.damage_class === 'status' ? 'EST' : '-'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};