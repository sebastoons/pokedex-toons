// src/components/battle/BattleControls.js
import React, { useRef, useEffect } from 'react';
import './BattleControls.css'; // Importa su propio CSS

export const BattleControls = ({
    playerActivePokemon,
    playerTeam,
    battleLog,
    isPlayersTurn,
    awaitingPlayerSwitch,
    animationBlocking,
    onAttack,
    onSwitch,
    battleEnded,
    hideRegularSwitching = false // Nueva prop para ocultar el botón de cambio regular
}) => {
    const logRef = useRef(null);

    // Desplazar el log hacia abajo automáticamente
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
            onSwitch(pokemonId, true); // true = es el jugador
        }
    };

    // Determina si los controles deben estar deshabilitados
    const areControlsDisabled = animationBlocking || !isPlayersTurn || battleEnded;

    const aliveButNotActivePokemon = playerTeam.filter(
        p => p.currentHp > 0 && p.id !== playerActivePokemon.id
    );

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
                        // Cuando está esperando cambio forzado, mostrar mensaje especial
                        <div className="forced-switch-message">
                            <h2>¡Tu Pokémon se ha debilitado!</h2>
                            <p>Haz click en uno de los círculos de arriba para elegir tu siguiente Pokémon.</p>
                        </div>
                    ) : (
                        <>
                            {/* Contenedor de movimientos - siempre visible */}
                            <div className="moves-container">
                                {playerActivePokemon.moves.map((move, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAttackClick(move)}
                                        disabled={areControlsDisabled}
                                        className={`move-button type-${move.type || 'normal'}`}
                                        title={`${move.name} - Tipo: ${move.type || 'Normal'} - Poder: ${move.power || 0}`}
                                    >
                                        <span className="move-name">{move.name.toUpperCase()}</span>
                                        <span className="move-power">({move.power || 0})</span>
                                    </button>
                                ))}
                            </div>
                            
                            {/* Botón de cambio regular - solo si no está oculto */}
                            {!hideRegularSwitching && (
                                <div className="switch-container">
                                    <button
                                        onClick={() => {/* Esta función necesita ser definida correctamente en el componente padre */}}
                                        disabled={areControlsDisabled || aliveButNotActivePokemon.length === 0}
                                        className="switch-team-button"
                                        title="Cambiar Pokémon"
                                    >
                                        Cambiar Pokémon
                                    </button>
                                </div>
                            )}

                            {/* Mensaje informativo sobre el cambio por círculos */}
                            {hideRegularSwitching && !awaitingPlayerSwitch && (
                                <div className="circle-switch-info">
                                    <small>💡 Haz click en los círculos de arriba para cambiar de Pokémon</small>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};