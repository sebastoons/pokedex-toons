// src/components/battle/PokemonBattleArena.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleLogic } from '../../hooks/useBattleLogic';
import PokeBallSpinner from '../PokeBallSpinner';
import { CombatantUI } from './CombatantUI';
import { BattleControls } from './BattleControls';
import { BattleEndModal } from './BattleEndModal';
import { BagModal } from './BagModal';
import analyticsTracker from '../../utils/analyticsTracker';

import './PokemonBattleArena.css';
import './CombatantUI.css';
import './BattleControls.css';
import './BattleEndModal.css';
import './BagModal.css';

const FLOATING_MSG_CLASSES = {
    super: 'float-super', noeffect: 'float-noeffect', resistant: 'float-resistant',
};

const TYPE_PARTICLE_COLORS = {
    fire: '#FF6B35', water: '#4FC3F7', electric: '#FFD54F', grass: '#69F0AE',
    ice: '#80DEEA', fighting: '#EF5350', poison: '#CE93D8', ground: '#FFA726',
    flying: '#B39DDB', psychic: '#F48FB1', bug: '#C5E1A5', rock: '#BCAAA4',
    ghost: '#7E57C2', dragon: '#5C6BC0', dark: '#78909C', steel: '#B0BEC5',
    fairy: '#F8BBD0', normal: '#E0E0E0',
};

const PokemonBattleArena = () => {
    const [showBag, setShowBag] = useState(false);
    const [particles, setParticles] = useState([]);
    const particleIdRef = useRef(0);

    const {
        loading, winner, battleLog, gameMode,
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking, bag, floatingMsg, lastAttack,
        handleAttack, handlePokemonCircleClick, handleSwitchPokemon, handleUseItem,
    } = useBattleLogic();

    // Partículas de ataque
    const spawnParticles = useCallback((side, moveType) => {
        const color = TYPE_PARTICLE_COLORS[moveType] || '#fff';
        const baseX = side === 'p1' ? 75 : 25;
        const baseY = 40;
        const count = 12;
        const newParticles = Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const dist = 35 + Math.random() * 30;
            return {
                id: ++particleIdRef.current,
                x: baseX, y: baseY,
                dx: Math.cos(angle) * dist,
                dy: Math.sin(angle) * dist * 0.55,
                color,
                size: 5 + Math.random() * 7,
            };
        });
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
        }, 700);
    }, []);

    useEffect(() => {
        if (lastAttack) spawnParticles(lastAttack.side, lastAttack.moveType);
    }, [lastAttack, spawnParticles]);

    useEffect(() => {
        if (!loading && activePokemonP1 && activePokemonP2)
            analyticsTracker.trackBattleStart(gameMode);
    }, [loading, activePokemonP1, activePokemonP2, gameMode]);

    useEffect(() => {
        if (winner) analyticsTracker.trackEvent('Batalla Completada', `Ganador: ${winner}`);
    }, [winner]);

    if (loading || !activePokemonP1 || !activePokemonP2) {
        return (
            <div className="battle-arena-container">
                <div className="loading-container">
                    <PokeBallSpinner text="Preparando batalla..." size={64} />
                </div>
            </div>
        );
    }

    const activePokemonForControls = isPlayer1Turn ? activePokemonP1 : activePokemonP2;
    const canPlayer1Switch = (isPlayer1Turn || awaitingSwitch === 'player1') && !animationBlocking && !winner;
    const canPlayer2Switch = (!isPlayer1Turn || awaitingSwitch === 'player2') && !animationBlocking && !winner;
    const defenderTypes = isPlayer1Turn ? activePokemonP2?.types : activePokemonP1?.types;
    const floatClass = floatingMsg ? (FLOATING_MSG_CLASSES[floatingMsg.type] || 'float-neutral') : '';

    const handlePlayer1Click = (pokemon) => {
        if (gameMode === 'vsIA') handleSwitchPokemon(pokemon, true);
        else handlePokemonCircleClick(pokemon, true);
    };
    const handlePlayer2Click = (pokemon) => {
        if (gameMode === 'vsPlayer') handlePokemonCircleClick(pokemon, false);
    };

    const arenaType = (activePokemonP2?.types?.[0]?.type?.name ?? activePokemonP2?.types?.[0]) || 'normal';

    return (
        <div className="battle-arena-container" data-type={arenaType}>
            <div className="battle-elements">
                <div className="combatants-container">
                    <CombatantUI
                        pokemon={activePokemonP2} team={player2Team} isOpponent={true}
                        isAttacking={pokemonP2Attacking} isDamaged={pokemonP1Damaged}
                        onPokemonCircleClick={handlePlayer2Click}
                        canSwitch={canPlayer2Switch && gameMode === 'vsPlayer'}
                    />
                    <CombatantUI
                        pokemon={activePokemonP1} team={player1Team} isOpponent={false}
                        isAttacking={pokemonP1Attacking} isDamaged={pokemonP2Damaged}
                        onPokemonCircleClick={handlePlayer1Click}
                        canSwitch={canPlayer1Switch}
                    />

                    {/* Partículas */}
                    {particles.map(p => (
                        <div
                            key={p.id}
                            className="battle-particle"
                            style={{
                                left: `${p.x}%`, top: `${p.y}%`,
                                width: p.size, height: p.size,
                                backgroundColor: p.color,
                                boxShadow: `0 0 6px ${p.color}`,
                                '--pdx': `${p.dx}px`, '--pdy': `${p.dy}px`,
                            }}
                        />
                    ))}

                    <AnimatePresence>
                        {floatingMsg && (
                            <motion.div
                                className={`floating-effectiveness ${floatClass}`}
                                key={floatingMsg.text + floatingMsg.type}
                                style={{ x: '-50%' }}
                                initial={{ opacity: 0, y: 12, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -14, scale: 0.9 }}
                                transition={{ duration: 0.22 }}
                            >
                                {floatingMsg.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <BattleControls
                    activePokemon={activePokemonForControls}
                    defenderTypes={defenderTypes}
                    battleLog={battleLog}
                    isPlayersTurn={isPlayer1Turn}
                    awaitingPlayerSwitch={awaitingSwitch === 'player1' || awaitingSwitch === 'player2'}
                    animationBlocking={animationBlocking}
                    onAttack={handleAttack}
                    onOpenBag={() => setShowBag(true)}
                    bag={bag}
                    battleEnded={!!winner}
                    gameMode={gameMode}
                />
            </div>

            {showBag && (
                <BagModal
                    bag={bag} activePokemon={activePokemonP1}
                    onUseItem={handleUseItem} onClose={() => setShowBag(false)}
                />
            )}

            {winner && <BattleEndModal winner={winner} />}
        </div>
    );
};

export default PokemonBattleArena;
