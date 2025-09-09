// src/components/battle/PokemonBattleArena.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleLogic } from '../../hooks/useBattleLogic';

// Importa los componentes hijos desde la MISMA CARPETA (./)
import { CombatantUI } from './CombatantUI';
import { BattleControls } from './BattleControls';
import { BattleEndModal } from './BattleEndModal';

// Importa los archivos CSS desde la MISMA CARPETA (./)
import './PokemonBattleArena.css';
import './CombatantUI.css';
import './BattleControls.css';
import './BattleEndModal.css';

const PokemonBattleArena = () => {
    const navigate = useNavigate();

    // Desestructuramos todos los valores y funciones del hook useBattleLogic (incluyendo las nuevas)
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
        handleSwitchPokemon,
        handlePokemonCircleClick, // NUEVA FUNCIÓN para clicks en círculos
    } = useBattleLogic();

    // Renderizado condicional mientras cargan los Pokémon
    if (loading || !activePokemonP1 || !activePokemonP2) {
        return (
            <div className="battle-arena-container">
                <div className="loading-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                    color: 'white'
                }}>
                    <p style={{ 
                        fontSize: '1.2rem', 
                        textAlign: 'center',
                        marginBottom: '20px' 
                    }}>
                        Cargando batalla...
                    </p>
                    <div className="loading-log" style={{
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        {battleLog.map((msg, index) => (
                            <p key={index} style={{ 
                                color: '#ccc', 
                                fontSize: '0.9rem',
                                margin: '5px 0',
                                textAlign: 'center' 
                            }}>
                                {msg}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Determinar si el jugador puede cambiar Pokémon (para los círculos)
    const canPlayerSwitchPokemon = (
        isPlayer1Turn && // Es el turno del jugador
        !animationBlocking && // No hay animaciones bloqueando
        !winner && // La batalla no ha terminado
        player1Team.filter(p => p.currentHp > 0 && p.id !== activePokemonP1.id).length > 0 // Hay Pokémon vivos para cambiar
    ) || awaitingSwitch === 'player1'; // O está forzado a cambiar

    // Una vez que los Pokémon han cargado, renderizamos la arena completa
    return (
        <div className="battle-arena-container">
            {/* Audio elements */}
            <audio ref={attackSoundRef} src="/sounds/attack.mp3" preload="auto" />
            <audio ref={hitSoundRef} src="/sounds/hit.mp3" preload="auto" />
            <audio ref={battleMusicRef} src="/sounds/battle-music.mp3" preload="auto" />
            <audio ref={lowHpSoundRef} src="/sounds/low-hp.mp3" preload="auto" />
            <audio ref={victorySoundRef} src="/sounds/victory.mp3" preload="auto" />

            <div className="battle-elements">
                <div className="battle-top-section">
                    {/* UI del Oponente (Jugador 2) */}
                    <CombatantUI
                        pokemon={activePokemonP2}
                        team={player2Team}
                        isOpponent={true}
                        isAttacking={pokemonP2Attacking}
                        isDamaged={pokemonP1Attacking && pokemonP2Damaged}
                        // Los oponentes no pueden hacer click en círculos
                        onPokemonCircleClick={null}
                        canSwitchPokemon={false}
                        awaitingSwitch={awaitingSwitch === 'player2'}
                    />
                </div>

                <div className="battle-field">
                    <div className="field-grass-player"></div>
                    <div className="field-grass-opponent"></div>
                </div>

                <div className="battle-bottom-section">
                    {/* UI del Jugador (Jugador 1) - CON FUNCIONALIDADES DE CÍRCULOS */}
                    <CombatantUI
                        pokemon={activePokemonP1}
                        team={player1Team}
                        isOpponent={false}
                        isAttacking={pokemonP1Attacking}
                        isDamaged={pokemonP2Attacking && pokemonP1Damaged}
                        // NUEVAS PROPS PARA CÍRCULOS CLICKEABLES
                        onPokemonCircleClick={handlePokemonCircleClick}
                        canSwitchPokemon={canPlayerSwitchPokemon}
                        awaitingSwitch={awaitingSwitch === 'player1'}
                    />

                    {/* Controles de Batalla - CON SISTEMA DE CÍRCULOS ACTIVADO */}
                    <BattleControls
                        playerActivePokemon={activePokemonP1}
                        playerTeam={player1Team}
                        battleLog={battleLog}
                        isPlayersTurn={isPlayer1Turn}
                        awaitingPlayerSwitch={awaitingSwitch === 'player1'}
                        animationBlocking={animationBlocking || awaitingSwitch === 'player2' || (gameMode === 'vsIA' && !isPlayer1Turn)}
                        onAttack={handleAttack}
                        onSwitch={handleSwitchPokemon} // Mantenemos como fallback aunque no se use
                        battleEnded={!!winner}
                        // NUEVA PROP: Ocultar el botón de cambio regular porque usamos círculos
                        hideRegularSwitching={true}
                    />
                </div>
            </div>

            {/* Modal de fin de batalla */}
            {winner && (
                <BattleEndModal
                    winner={winner}
                    onRestart={() => window.location.reload()}
                    onGoHome={() => navigate('/')}
                />
            )}
        </div>
    );
};

export default PokemonBattleArena;