import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleLogic } from '../../hooks/useBattleLogic';
import { CombatantUI } from './CombatantUI';
import { BattleControls } from './BattleControls';
import { BattleEndModal } from './BattleEndModal';
import { TurnIndicator } from './TurnIndicator';

import './PokemonBattleArena.css';
import './CombatantUI.css';
import './BattleControls.css';
import './BattleEndModal.css';
import './TurnIndicator.css';

const PokemonBattleArena = () => {
    const navigate = useNavigate();

    const {
        loading, winner, battleLog, gameMode,
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking,
        attackSoundRef, hitSoundRef, battleMusicRef, lowHpSoundRef, victorySoundRef,
        handleAttack,
        handlePokemonCircleClick,
        handleSwitchPokemon,
    } = useBattleLogic();

    if (loading || !activePokemonP1 || !activePokemonP2) {
        return (
            <div className="battle-arena-container">
                <div className="loading-container">
                    <p>Cargando batalla...</p>
                </div>
            </div>
        );
    }

    // Lógica de controles más estable
    const activePokemonForControls = isPlayer1Turn ? activePokemonP1 : activePokemonP2;
    
    // Los controles siempre se muestran para mantener el layout estable
    const controlsVisible = true;
    const controlsActive = gameMode === 'vsIA' ? isPlayer1Turn : true;

    // Lógica de cambio de Pokémon
    const canPlayer1Switch = !animationBlocking && !winner && 
        (isPlayer1Turn || awaitingSwitch === 'player1') &&
        player1Team.filter(p => p.currentHp > 0).length > 1;

    const canPlayer2Switch = !animationBlocking && !winner && 
        ((gameMode === '1vs1' && !isPlayer1Turn) || awaitingSwitch === 'player2') &&
        player2Team.filter(p => p.currentHp > 0).length > 1;

    // Funciones de click para cada jugador
    const handlePlayer1CircleClick = (pokemon) => {
        console.log('Player 1 trying to switch to:', pokemon.name, 'canSwitch:', canPlayer1Switch);
        if (canPlayer1Switch) {
            handleSwitchPokemon(pokemon, true);
        }
    };

    const handlePlayer2CircleClick = (pokemon) => {
        console.log('Player 2 trying to switch to:', pokemon.name, 'canSwitch:', canPlayer2Switch);
        if (canPlayer2Switch) {
            handleSwitchPokemon(pokemon, false);
        }
    };

    return (
        <div className="battle-arena-container">
            <audio ref={attackSoundRef} src="/sounds/attack.mp3" preload="auto" />
            <audio ref={hitSoundRef} src="/sounds/hit.mp3" preload="auto" />
            <audio ref={battleMusicRef} src="/sounds/battle-music.mp3" preload="auto" />
            <audio ref={lowHpSoundRef} src="/sounds/low-hp.mp3" preload="auto" />
            <audio ref={victorySoundRef} src="/sounds/victory.mp3" preload="auto" />

            <div className="battle-elements">
                <div className="battle-content">
                    {/* Indicador de turno */}
                    <div className="turn-indicator-container">
                        <TurnIndicator 
                            isPlayer1Turn={isPlayer1Turn}
                            gameMode={gameMode}
                            winner={winner}
                        />
                    </div>

                    {/* Contenido principal de la batalla */}
                    <div className="battle-main-content">
                        {/* Contenedor de combatientes */}
                        <div className="combatants-container">
                            <CombatantUI
                                pokemon={activePokemonP2}
                                team={player2Team}
                                isOpponent={true}
                                isAttacking={pokemonP2Attacking}
                                isDamaged={pokemonP1Damaged}
                                onPokemonCircleClick={handlePlayer2CircleClick}
                                canSwitch={canPlayer2Switch}
                            />

                            <CombatantUI
                                pokemon={activePokemonP1}
                                team={player1Team}
                                isOpponent={false}
                                isAttacking={pokemonP1Attacking}
                                isDamaged={pokemonP2Damaged}
                                onPokemonCircleClick={handlePlayer1CircleClick}
                                canSwitch={canPlayer1Switch}
                            />
                        </div>

                        {/* Controles siempre visibles para mantener layout estable */}
                        <BattleControls
                            activePokemon={activePokemonForControls}
                            battleLog={battleLog}
                            isPlayersTurn={isPlayer1Turn}
                            awaitingPlayerSwitch={awaitingSwitch === 'player1' || awaitingSwitch === 'player2'}
                            animationBlocking={animationBlocking}
                            onAttack={handleAttack}
                            battleEnded={!!winner}
                            gameMode={gameMode}
                            controlsActive={controlsActive}
                        />
                    </div>
                </div>
            </div>

            {winner && (
                <BattleEndModal
                    winner={winner}
                    onRestart={() => navigate('/')}
                    onGoHome={() => navigate('/')}
                />
            )}
        </div>
    );
};

export default PokemonBattleArena;