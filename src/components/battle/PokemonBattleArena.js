// src/components/battle/PokemonBattleArena.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleLogic } from '../../hooks/useBattleLogic';
import { CombatantUI } from './CombatantUI';
import { BattleControls } from './BattleControls';
import { BattleEndModal } from './BattleEndModal';

// Importa los CSS necesarios
import './PokemonBattleArena.css';
import './CombatantUI.css';
import './BattleControls.css';
import './BattleEndModal.css'; 

// Importamos la imagen de fondo desde la carpeta 'assets'
import battleBg from '../../assets/images/battle-backgrounds.jpg'; 

const PokemonBattleArena = () => {
    const navigate = useNavigate();

    const {
        loading, winner, battleLog,
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking,
        attackSoundRef, hitSoundRef, battleMusicRef, lowHpSoundRef, victorySoundRef,
        handleAttack,
        handlePokemonCircleClick,
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

    const canPlayerSwitch = isPlayer1Turn && !animationBlocking && !winner;

    return (
        <div className="battle-arena-container" style={{ backgroundImage: `url(${battleBg})` }}>
            <audio ref={attackSoundRef} src="/sounds/attack.mp3" preload="auto" />
            <audio ref={hitSoundRef} src="/sounds/hit.mp3" preload="auto" />
            <audio ref={battleMusicRef} src="/sounds/battle-music.mp3" preload="auto" />
            <audio ref={lowHpSoundRef} src="/sounds/low-hp.mp3" preload="auto" />
            <audio ref={victorySoundRef} src="/sounds/victory.mp3" preload="auto" />

            <div className="battle-elements">
                <div className="combatants-container">
                    {/* Panel del Oponente */}
                    <CombatantUI
                        pokemon={activePokemonP2}
                        team={player2Team}
                        isOpponent={true}
                        isAttacking={pokemonP2Attacking}
                        isDamaged={pokemonP1Damaged}
                    />

                    {/* Panel del Jugador */}
                    <CombatantUI
                        pokemon={activePokemonP1}
                        team={player1Team}
                        isOpponent={false}
                        isAttacking={pokemonP1Attacking}
                        isDamaged={pokemonP2Damaged}
                        onPokemonCircleClick={handlePokemonCircleClick}
                        canSwitch={canPlayerSwitch}
                    />
                </div>

                {/* Controles y Log de Batalla */}
                <BattleControls
                    playerActivePokemon={activePokemonP1}
                    battleLog={battleLog}
                    isPlayersTurn={isPlayer1Turn}
                    awaitingPlayerSwitch={awaitingSwitch === 'player1'}
                    animationBlocking={animationBlocking}
                    onAttack={handleAttack}
                    battleEnded={!!winner}
                />
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