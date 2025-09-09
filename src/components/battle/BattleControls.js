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
    battleEnded
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
                        <>
                            <h2>Elige un nuevo Pokémon:</h2>
                            <div className="switch-options">
                                {playerTeam.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleSwitchClick(p.id)}
                                        disabled={p.currentHp <= 0 || p.id === playerActivePokemon.id || areControlsDisabled}
                                        className={`switch-button ${p.id === playerActivePokemon.id ? 'active-pokemon-button' : ''} ${p.currentHp <= 0 ? 'fainted-pokemon-button' : ''}`}
                                    >
                                        {p.name.toUpperCase()} ({p.currentHp}/{p.maxHp} HP)
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="moves-container">
                                {playerActivePokemon.moves.map((move, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAttackClick(move)}
                                        disabled={areControlsDisabled}
                                        className="move-button"
                                    >
                                        {move.name.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <div className="switch-container">
                                <button
                                    onClick={() => awaitingPlayerSwitch(true)} // Activa la UI para cambiar
                                    disabled={areControlsDisabled || aliveButNotActivePokemon.length === 0}
                                    className="switch-team-button"
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