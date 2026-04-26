// src/components/battle/BattleControls.js
import React from 'react';
import BattleLogDisplay from '../BattleLogDisplay';
import { getMoveTypeGradient } from '../../utils/moveTypeColors';
import { calculateTypeEffectiveness } from '../../utils/typeEffectiveness';
import './BattleControls.css';

const STRUGGLE = { name: 'Forcejeo', power: 50, accuracy: 100, type: 'normal', damage_class: 'physical' };

const getEffectivenessIcon = (moveType, defenderTypes) => {
    if (!defenderTypes || defenderTypes.length === 0) return null;
    const typeNames = defenderTypes.map(t => t.type?.name || t);
    const { multiplier } = calculateTypeEffectiveness(moveType, typeNames);
    if (multiplier === 0) return { icon: '✗', cls: 'eff-immune' };
    if (multiplier >= 2) return { icon: '↑↑', cls: 'eff-super' };
    if (multiplier < 1) return { icon: '↓', cls: 'eff-resist' };
    return null;
};

export const BattleControls = React.memo(function BattleControls({
    activePokemon, defenderTypes, battleLog, isPlayersTurn,
    awaitingPlayerSwitch, animationBlocking, onAttack, onOpenBag,
    bag, battleEnded, gameMode, controlsActive = true
}) {
    if (!activePokemon) return null;

    const controlsDisabled = !controlsActive || animationBlocking || battleEnded || awaitingPlayerSwitch ||
        (gameMode === 'vsIA' && !isPlayersTurn);

    const movesToDisplay = (activePokemon.moves || []).slice(0, 4);
    const showIAWaiting = gameMode === 'vsIA' && !isPlayersTurn && !battleEnded && !awaitingPlayerSwitch;
    const allPPEmpty = movesToDisplay.length > 0 && movesToDisplay.every(m => (m.currentPP ?? 1) <= 0);

    return (
        <div className="battle-interface">
            <div className="battle-log-wrapper">
                <BattleLogDisplay messages={battleLog} />
            </div>
            <div className="controls-wrapper">
                {!battleEnded && (
                    <div className={`turn-indicator ${isPlayersTurn ? 'turn-player' : 'turn-ia'}`}>
                        {isPlayersTurn ? '⚡ TU TURNO' : gameMode === 'vsIA' ? '🤖 TURNO IA' : '⚔ TURNO RIVAL'}
                    </div>
                )}
                {showIAWaiting ? (
                    <div className="ia-waiting-message">
                        <div className="waiting-text">Turno de la IA...</div>
                        <div className="waiting-dots"><span>●</span><span>●</span><span>●</span></div>
                    </div>
                ) : (
                    <>
                        <div className="moves-grid">
                            {allPPEmpty ? (
                                <button
                                    className="move-button struggle-btn"
                                    style={{ background: 'linear-gradient(135deg,#555,#333)', gridColumn: '1/-1' }}
                                    onClick={() => onAttack(STRUGGLE)}
                                    disabled={controlsDisabled}
                                >
                                    <span className="move-name">FORCEJEO</span>
                                    <div className="move-footer">
                                        <span className="move-power">50</span>
                                        <span className="move-pp pp-empty">Sin PP</span>
                                    </div>
                                </button>
                            ) : (
                                movesToDisplay.map((move, i) => {
                                    const gradient = getMoveTypeGradient(move.type);
                                    const effIcon = getEffectivenessIcon(move.type, defenderTypes);
                                    const pp     = move.currentPP ?? move.maxPP ?? '—';
                                    const maxPP  = move.maxPP ?? '—';
                                    const ratio  = move.maxPP ? (move.currentPP ?? move.maxPP) / move.maxPP : 1;
                                    const ppCls  = ratio <= 0 ? 'pp-empty' : ratio <= 0.25 ? 'pp-low' : '';
                                    const isStatus = move.damage_class === 'status' || (move.power ?? 0) === 0;
                                    const isStatChange = !!move.statChange;
                                    return (
                                        <button
                                            key={i}
                                            className="move-button"
                                            onClick={() => onAttack(move)}
                                            disabled={controlsDisabled || (move.currentPP ?? 1) <= 0}
                                            style={{ background: gradient, borderColor: controlsDisabled ? '#666' : 'rgba(255,255,255,0.3)' }}
                                        >
                                            <span className="move-name">{move.name}</span>
                                            <div className="move-footer">
                                                <span className="move-power">
                                                    {isStatChange ? 'STAT' : isStatus ? 'APOYO' : move.power}
                                                </span>
                                                <span className={`move-pp ${ppCls}`}>{pp}/{maxPP}</span>
                                                {effIcon && <span className={`move-eff-icon ${effIcon.cls}`}>{effIcon.icon}</span>}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        {onOpenBag && !battleEnded && (
                            <button className="bag-button" onClick={onOpenBag} disabled={controlsDisabled} title="Mochila">
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
});
