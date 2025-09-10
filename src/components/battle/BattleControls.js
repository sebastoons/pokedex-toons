// src/components/battle/BattleControls.js
import React, { useRef, useEffect } from 'react';
import './BattleControls.css';

export const BattleControls = ({
    playerActivePokemon,
    battleLog,
    isPlayersTurn,
    awaitingPlayerSwitch,
    animationBlocking,
    onAttack,
    battleEnded
    // La prop 'onSwitch' ha sido eliminada de aquí
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
    
    const areControlsDisabled = animationBlocking || !isPlayersTurn || battleEnded;

    return (
        <div className="battle-controls-container">
            <div className="battle-log" ref={logRef}>
                {battleLog.map((msg, index) => (
                    <p key={index} className="log-message">{msg}</p>
                ))}
            </div>

            {!battleEnded && (
                <div className="action-buttons">
                    {awaitingPlayerSwitch ? (
                        <div className="forced-switch-message">
                            <h2>¡Tu Pokémon se ha debilitado!</h2>
                            <p>Haz click en uno de los círculos de arriba para elegir tu siguiente Pokémon.</p>
                        </div>
                    ) : (
                        <div className="moves-container">
                            {playerActivePokemon.moves.map((move, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAttackClick(move)}
                                    disabled={areControlsDisabled}
                                    className={`move-button type-${(move.type || 'normal').toLowerCase()}`}
                                    title={`${move.name} - Tipo: ${move.type || 'Normal'} - Poder: ${move.power || 0}`}
                                >
                                    <span className="move-name">{move.name.toUpperCase()}</span>
                                    <span className="move-power">({move.power || 0})</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};