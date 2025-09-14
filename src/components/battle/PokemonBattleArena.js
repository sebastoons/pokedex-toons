import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleLogic } from '../../hooks/useBattleLogic';
import { CombatantUI } from './CombatantUI';
import { BattleControls } from './BattleControls';
import { BattleEndModal } from './BattleEndModal';

import './PokemonBattleArena.css';
import './CombatantUI.css';
import './BattleControls.css';
import './BattleEndModal.css'; 

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
        attackSoundRef, hitSoundRef, battleMusicRef, lowHpSoundRef, victorySoundRef, defeatSoundRef,
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

    // Determina qué Pokémon está activo para mostrar sus controles
    const activePokemonForControls = isPlayer1Turn ? activePokemonP1 : activePokemonP2;

    // Determina si los controles deben estar visibles y activos
    const showControls = gameMode === 'vsIA' ? isPlayer1Turn : true;

    // Define qué jugador puede cambiar de pokémon
    const canPlayer1Switch = (isPlayer1Turn || awaitingSwitch === 'player1') && !animationBlocking && !winner;
    const canPlayer2Switch = (!isPlayer1Turn || awaitingSwitch === 'player2') && !animationBlocking && !winner;

    // Función helper para manejar clicks del Jugador 1
    const handlePlayer1Click = (pokemon) => {
        if (gameMode === 'vsIA') {
            // En modo vsIA, usar función directa
            handleSwitchPokemon(pokemon, true);
        } else {
            // En modo vsPlayer, usar función con validación de turnos
            handlePokemonCircleClick(pokemon, true);
        }
    };

    // Función helper para manejar clicks del Jugador 2
    const handlePlayer2Click = (pokemon) => {
        if (gameMode === 'vsPlayer') {
            // Solo en modo vsPlayer el Jugador 2 puede cambiar
            handlePokemonCircleClick(pokemon, false);
        }
        // En modo vsIA, el Jugador 2 es IA y no hace nada
    };

    return (
        <div className="battle-arena-container">
            {/* Referencias de audio ampliadas */}
            <audio ref={attackSoundRef} src="/sounds/attack.mp3" preload="auto" />
            <audio ref={hitSoundRef} src="/sounds/hit.mp3" preload="auto" />
            <audio ref={battleMusicRef} src="/sounds/battle-music.mp3" preload="auto" />
            <audio ref={lowHpSoundRef} src="/sounds/low-hp.mp3" preload="auto" />
            <audio ref={victorySoundRef} src="/sounds/victory.mp3" preload="auto" />
            <audio ref={defeatSoundRef} src="/sounds/defeat.mp3" preload="auto" />

            <div className="battle-elements">
                <div className="combatants-container">
                    {/* Panel del Oponente (Jugador 2) */}
                    <CombatantUI
                        pokemon={activePokemonP2}
                        team={player2Team}
                        isOpponent={true}
                        isAttacking={pokemonP2Attacking}
                        isDamaged={pokemonP1Damaged}
                        onPokemonCircleClick={handlePlayer2Click}
                        canSwitch={canPlayer2Switch && gameMode === 'vsPlayer'}
                    />

                    {/* Panel del Jugador 1 */}
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

                {/* Controles y Log de Batalla */}
                {showControls && (
                    <BattleControls
                        activePokemon={activePokemonForControls}
                        battleLog={battleLog}
                        isPlayersTurn={isPlayer1Turn}
                        awaitingPlayerSwitch={awaitingSwitch === 'player1' || awaitingSwitch === 'player2'}
                        animationBlocking={animationBlocking}
                        onAttack={handleAttack}
                        battleEnded={!!winner}
                        gameMode={gameMode}
                    />
                )}
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