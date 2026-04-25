// src/components/battle/PokemonBattleArena.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleLogic } from '../../hooks/useBattleLogic';
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

const THEMES = [
    { id: 'default',    label: 'Pokébola',   color: '#e74c3c' },
    { id: 'great-ball', label: 'Súper Bola',  color: '#3498db' },
    { id: 'ultra-ball', label: 'Ultra Bola',  color: '#f1c40f' },
];

const FLOATING_MSG_CLASSES = {
    super:    'float-super',
    noeffect: 'float-noeffect',
    resistant: 'float-resistant',
};

const PokemonBattleArena = () => {
    const navigate = useNavigate();
    const [showBag, setShowBag] = useState(false);
    const [theme, setTheme] = useState('default');

    const {
        loading, winner, battleLog, gameMode,
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking, bag, floatingMsg,
        handleAttack,
        handlePokemonCircleClick,
        handleSwitchPokemon,
        handleUseItem,
    } = useBattleLogic();

    React.useEffect(() => {
        if (!loading && activePokemonP1 && activePokemonP2) {
            analyticsTracker.trackBattleStart(gameMode);
        }
    }, [loading, activePokemonP1, activePokemonP2, gameMode]);

    React.useEffect(() => {
        if (winner) {
            analyticsTracker.trackEvent('Batalla Completada', `Ganador: ${winner}`);
        }
    }, [winner]);

    if (loading || !activePokemonP1 || !activePokemonP2) {
        return (
            <div className="battle-arena-container">
                <div className="loading-container">
                    <p>Cargando batalla...</p>
                </div>
            </div>
        );
    }

    const activePokemonForControls = isPlayer1Turn ? activePokemonP1 : activePokemonP2;
    const showControls = gameMode === 'vsIA' ? isPlayer1Turn : true;
    const canPlayer1Switch = (isPlayer1Turn || awaitingSwitch === 'player1') && !animationBlocking && !winner;
    const canPlayer2Switch = (!isPlayer1Turn || awaitingSwitch === 'player2') && !animationBlocking && !winner;

    const handlePlayer1Click = (pokemon) => {
        if (gameMode === 'vsIA') handleSwitchPokemon(pokemon, true);
        else handlePokemonCircleClick(pokemon, true);
    };

    const handlePlayer2Click = (pokemon) => {
        if (gameMode === 'vsPlayer') handlePokemonCircleClick(pokemon, false);
    };

    const handleRestart = () => {
        analyticsTracker.trackEvent('Batalla', 'Usuario reinició desde modal de fin');
        navigate('/');
    };

    const handleGoHome = () => {
        analyticsTracker.trackEvent('Batalla', 'Usuario volvió a inicio desde modal de fin');
        navigate('/');
    };

    const defenderTypes = isPlayer1Turn ? activePokemonP2?.types : activePokemonP1?.types;

    const floatClass = floatingMsg ? (FLOATING_MSG_CLASSES[floatingMsg.type] || 'float-neutral') : '';

    return (
        <div className="battle-arena-container" data-theme={theme}>

            {/* Selector de tema */}
            <div className="theme-selector">
                {THEMES.map(t => (
                    <button
                        key={t.id}
                        className={`theme-btn ${theme === t.id ? 'active' : ''}`}
                        style={{ '--theme-color': t.color }}
                        onClick={() => setTheme(t.id)}
                        title={t.label}
                    />
                ))}
            </div>

            <div className="battle-elements">
                <div className="combatants-container">
                    <CombatantUI
                        pokemon={activePokemonP2}
                        team={player2Team}
                        isOpponent={true}
                        isAttacking={pokemonP2Attacking}
                        isDamaged={pokemonP1Damaged}
                        onPokemonCircleClick={handlePlayer2Click}
                        canSwitch={canPlayer2Switch && gameMode === 'vsPlayer'}
                    />
                    <CombatantUI
                        pokemon={activePokemonP1}
                        team={player1Team}
                        isOpponent={false}
                        isAttacking={pokemonP1Attacking}
                        isDamaged={pokemonP2Damaged}
                        onPokemonCircleClick={handlePlayer1Click}
                        canSwitch={canPlayer1Switch}
                    />
                </div>

                {/* Mensaje flotante de efectividad */}
                <AnimatePresence>
                    {floatingMsg && (
                        <motion.div
                            className={`floating-effectiveness ${floatClass}`}
                            key={floatingMsg.text + Date.now()}
                            initial={{ opacity: 0, y: 10, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -16, scale: 0.9 }}
                            transition={{ duration: 0.25 }}
                        >
                            {floatingMsg.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {showControls && (
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
                )}
            </div>

            {/* Mochila */}
            {showBag && (
                <BagModal
                    bag={bag}
                    activePokemon={activePokemonP1}
                    onUseItem={handleUseItem}
                    onClose={() => setShowBag(false)}
                />
            )}

            {winner && (
                <BattleEndModal
                    winner={winner}
                    onRestart={handleRestart}
                    onGoHome={handleGoHome}
                />
            )}
        </div>
    );
};

export default PokemonBattleArena;
