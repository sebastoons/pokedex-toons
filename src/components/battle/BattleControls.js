import React from 'react';
import BattleLogDisplay from '../BattleLogDisplay';
import { getMoveTypeGradient } from '../../utils/moveTypeColors';
import { calculateTypeEffectiveness } from '../../utils/typeEffectiveness';
import './BattleControls.css';

const getEffectivenessIcon = (moveType, defenderTypes) => {
    if (!defenderTypes || defenderTypes.length === 0) return null;
    const typeNames = defenderTypes.map(t => t.type?.name || t);
    const { multiplier } = calculateTypeEffectiveness(moveType, typeNames);
    if (multiplier === 0) return { icon: '✗', cls: 'eff-immune' };
    if (multiplier >= 2) return { icon: '↑↑', cls: 'eff-super' };
    if (multiplier < 1) return { icon: '↓', cls: 'eff-resist' };
    return null;
};

export const BattleControls = ({
    activePokemon,
    defenderTypes,
    battleLog,
    isPlayersTurn,
    awaitingPlayerSwitch,
    animationBlocking,
    onAttack,
    onOpenBag,
    bag,
    battleEnded,
    gameMode,
    controlsActive = true
}) => {
    if (!activePokemon) return null;

    const controlsDisabled = !controlsActive || animationBlocking || battleEnded || awaitingPlayerSwitch ||
        (gameMode === 'vsIA' && !isPlayersTurn);

    const movesToDisplay = (activePokemon.moves || []).slice(0, 4);
    const showIAWaitingMessage = gameMode === 'vsIA' && !isPlayersTurn && !battleEnded && !awaitingPlayerSwitch;

    return (
        <div className="battle-interface">
            <div className="battle-log-wrapper">
                <BattleLogDisplay messages={battleLog} />
            </div>
            <div className="controls-wrapper">
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
                    <>
                        <div className="moves-grid">
                            {movesToDisplay.map((move, index) => {
                                const moveGradient = getMoveTypeGradient(move.type);
                                const effIcon = getEffectivenessIcon(move.type, defenderTypes);

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
                                        <div className="move-footer">
                                            <span className="move-power">
                                                {move.power > 0 ? move.power : move.damage_class === 'status' ? 'apoyo' : '-'}
                                            </span>
                                            {effIcon && (
                                                <span className={`move-eff-icon ${effIcon.cls}`}>
                                                    {effIcon.icon}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {onOpenBag && !battleEnded && (
                            <button
                                className="bag-button"
                                onClick={onOpenBag}
                                disabled={controlsDisabled}
                                title="Abrir Mochila"
                            >
                                🎒 Mochila
                                {bag && (bag.potions > 0 || bag.antidote > 0) && (
                                    <span className="bag-count">{(bag.potions || 0) + (bag.antidote || 0)}</span>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
