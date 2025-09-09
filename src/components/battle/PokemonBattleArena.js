// src/components/battle/PokemonBattleArena.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate aquí para el modal final
import { useBattleLogic } from '../../hooks/useBattleLogic';

// Importa los componentes hijos desde la MISMA CARPETA (./)
import  {CombatantUI}  from './CombatantUI';
import  {BattleControls}  from './BattleControls';
import  {BattleEndModal}  from './BattleEndModal';

// Importa los archivos CSS desde la MISMA CARPETA (./)
import './PokemonBattleArena.css';
import './CombatantUI.css';
import './BattleControls.css';
import './BattleEndModal.css';

const PokemonBattleArena = () => {
    const navigate = useNavigate(); // Para la navegación del modal final

    // Desestructuramos todos los valores y funciones del hook useBattleLogic
    const {
        loading, winner, battleLog, gameMode,
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking,
        attackSoundRef, hitSoundRef, battleMusicRef, lowHpSoundRef, victorySoundRef,
        handleAttack, // Ahora se llama handleAttack en el hook
        handleSwitchPokemon,
    } = useBattleLogic(); // Ya no pasamos IDs aquí, el hook los obtiene de la URL

    // Renderizado condicional mientras cargan los Pokémon
    if (loading || !activePokemonP1 || !activePokemonP2) {
        return (
            <div className="battle-arena-container">
                <p>Cargando batalla...</p>
                {battleLog.map((msg, index) => (
                    <p key={index} className="log-message-loading">{msg}</p> // Clase específica para el log de carga
                ))}
            </div>
        );
    }

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
                        isDamaged={pokemonP1Attacking && pokemonP2Damaged} // Se daña si P1 ataca y la animación de daño de P2 está activa
                    />
                </div>

                <div className="battle-field">
                    <div className="field-grass-player"></div>
                    <div className="field-grass-opponent"></div>
                </div>

                <div className="battle-bottom-section">
                    {/* UI del Jugador (Jugador 1) */}
                    <CombatantUI
                        pokemon={activePokemonP1}
                        team={player1Team}
                        isOpponent={false}
                        isAttacking={pokemonP1Attacking}
                        isDamaged={pokemonP2Attacking && pokemonP1Damaged} // Se daña si P2 ataca y la animación de daño de P1 está activa
                    />

                    {/* Controles de Batalla */}
                    <BattleControls
                        playerActivePokemon={activePokemonP1}
                        playerTeam={player1Team}
                        battleLog={battleLog}
                        isPlayersTurn={isPlayer1Turn} // Es el turno del Jugador 1
                        awaitingPlayerSwitch={awaitingSwitch === 'player1'} // Solo P1 espera cambio
                        animationBlocking={animationBlocking || awaitingSwitch === 'player2' || (gameMode === 'vsIA' && !isPlayer1Turn)} // Bloquea si animaciones, IA cambiando o IA es quien juega
                        onAttack={handleAttack}
                        onSwitch={handleSwitchPokemon}
                        battleEnded={!!winner} // Convertir winner a booleano
                    />
                </div>
            </div>

            {/* Modal de fin de batalla */}
            {winner && (
                <BattleEndModal
                    winner={winner}
                    onRestart={() => window.location.reload()} // Recarga la página para reiniciar
                    onGoHome={() => navigate('/')} // Vuelve a la página de inicio
                />
            )}
        </div>
    );
};

export default PokemonBattleArena;