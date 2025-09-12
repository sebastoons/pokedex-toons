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

import battleBg from '../../assets/images/battle-backgrounds.jpg'; 

const PokemonBattleArena = () => {
    const navigate = useNavigate();

    const {
        loading, winner, battleLog, gameMode, // <- gameMode importado
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking,
        attackSoundRef, hitSoundRef, battleMusicRef, lowHpSoundRef, victorySoundRef,
        handleAttack,
        handlePokemonCircleClick,
        handleSwitchPokemon, // <- handleSwitchPokemon importado
    } = useBattleLogic();

    if (loading || !activePokemonP1 || !activePokemonP2) {
        return (
            <div className="battle-arena-container" style={{ backgroundImage: `url(${battleBg})` }}>
                <div className="loading-container">
                    <p>Cargando batalla...</p>
                </div>
            </div>
        );
    }

    // --- INICIO DE LA MODIFICACIÓN ---

    // 1. Determina qué Pokémon está activo para mostrar sus controles
    const activePokemonForControls = isPlayer1Turn ? activePokemonP1 : activePokemonP2;

    // 2. Determina si los controles deben estar visibles y activos
    const showControls = gameMode === 'vsIA' ? isPlayer1Turn : true;

    // 3. Define qué jugador puede cambiar de pokémon
    const canPlayer1Switch = isPlayer1Turn && !animationBlocking && !winner;
    const canPlayer2Switch = !isPlayer1Turn && gameMode === '1vs1' && !animationBlocking && !winner;
    
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="battle-arena-container" style={{ backgroundImage: `url(${battleBg})` }}>
            <audio ref={attackSoundRef} src="/sounds/attack.mp3" preload="auto" />
            <audio ref={hitSoundRef} src="/sounds/hit.mp3" preload="auto" />
            <audio ref={battleMusicRef} src="/sounds/battle-music.mp3" preload="auto" />
            <audio ref={lowHpSoundRef} src="/sounds/low-hp.mp3" preload="auto" />
            <audio ref={victorySoundRef} src="/sounds/victory.mp3" preload="auto" />

            <div className="battle-elements">
                <div className="combatants-container">
                    {/* Panel del Oponente (Jugador 2) */}
                    <CombatantUI
                        pokemon={activePokemonP2}
                        team={player2Team}
                        isOpponent={true}
                        isAttacking={pokemonP2Attacking}
                        isDamaged={pokemonP1Damaged}
                        // Permitimos el click para cambiar si es su turno en modo 1vs1
                        onPokemonCircleClick={(pokemon) => handleSwitchPokemon(pokemon, false)}
                        canSwitch={canPlayer2Switch}
                    />

                    {/* Panel del Jugador 1 */}
                    <CombatantUI
                        pokemon={activePokemonP1}
                        team={player1Team}
                        isOpponent={false}
                        isAttacking={pokemonP1Attacking}
                        isDamaged={pokemonP2Damaged}
                        onPokemonCircleClick={handlePokemonCircleClick}
                        canSwitch={canPlayer1Switch}
                    />
                </div>

                {/* Controles y Log de Batalla */}
                {showControls && (
                    <BattleControls
                        activePokemon={activePokemonForControls} // Prop renombrada
                        battleLog={battleLog}
                        isPlayersTurn={isPlayer1Turn}
                        awaitingPlayerSwitch={awaitingSwitch === 'player1' || awaitingSwitch === 'player2'}
                        animationBlocking={animationBlocking}
                        onAttack={handleAttack}
                        battleEnded={!!winner}
                        gameMode={gameMode} // Pasamos el modo de juego
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