import React, { useRef, useEffect } from 'react';
import './BattleControls.css';

export const BattleControls = ({
  playerActivePokemon,
  playerTeam,
  battleLog,
  isPlayersTurn,
  awaitingPlayerSwitch,
  animationBlocking,
  onAttack,
  onSwitch,
  battleEnded
}) => {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  const handleAttackClick = (move) => {
    if (!animationBlocking && isPlayersTurn && !battleEnded && !awaitingPlayerSwitch) {
      onAttack(move);
    }
  };

  const handleSwitchClick = (pokemonId) => {
    if (!animationBlocking && isPlayersTurn && !battleEnded) {
      onSwitch(pokemonId, true);
    }
  };

  const areControlsDisabled = animationBlocking || !isPlayersTurn || battleEnded;

  const aliveButNotActivePokemon = playerTeam.filter(
    p => p.currentHp > 0 && p.id !== playerActivePokemon.id
  );

  return (
    <div className="battle-controls-modern">
      <div className="battle-log-modern" ref={logRef}>
        {battleLog.map((msg, index) => (
          <p key={index} className="log-message-modern">{msg}</p>
        ))}
      </div>

      {!battleEnded && (
        <div className="action-buttons-modern">
          {awaitingPlayerSwitch ? (
            <>
              <h2>Elige un nuevo Pokémon:</h2>
              <div className="switch-options-modern">
                {playerTeam.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchClick(p.id)}
                    disabled={p.currentHp <= 0 || p.id === playerActivePokemon.id || areControlsDisabled}
                    className={`switch-button-modern ${p.id === playerActivePokemon.id ? 'active-pokemon-button' : ''} ${p.currentHp <= 0 ? 'fainted-pokemon-button' : ''}`}
                  >
                    {p.name.toUpperCase()} ({p.currentHp}/{p.maxHp} HP)
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="moves-container-modern">
                {playerActivePokemon.moves.map((move, index) => (
                  <button
                    key={index}
                    onClick={() => handleAttackClick(move)}
                    disabled={areControlsDisabled}
                    className={`move-button-modern type-${move.type?.toLowerCase() || 'normal'}`}
                  >
                    <span className="move-icon-modern" /> {move.name.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="switch-container-modern">
                <button
                  onClick={() => awaitingPlayerSwitch(true)}
                  disabled={areControlsDisabled || aliveButNotActivePokemon.length === 0}
                  className="switch-team-button-modern"
                >
                  Cambiar Pokémon
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};