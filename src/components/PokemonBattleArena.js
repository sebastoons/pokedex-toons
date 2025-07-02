// src/components/PokemonBattleArena.js
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useBattleLogic } from '../hooks/useBattleLogic';
import './PokemonBattleArena.css';

import PokemonDisplay from './PokemonDisplay';
import MovesList from './MovesList';
import BattleLogDisplay from './BattleLogDisplay';
import SwitchPokemonButton from './SwitchPokemonButton';

function PokemonBattleArena() {
    const [searchParams] = useSearchParams();
    const pokemonId1 = parseInt(searchParams.get('p1'));
    const pokemonId2 = parseInt(searchParams.get('p2'));

    const {
        playerTeam, // Necesario para el componente SwitchPokemonButton
        opponentTeam, // Agregado para la verificación inicial de carga
        playerActivePokemonIndex,
        battleLog,
        isPlayersTurn,
        battleEnded,
        turnCount,
        playerAttacking,
        opponentAttacking,
        playerDamaged,
        opponentDamaged,
        attackSoundRef,
        hitSoundRef,
        battleMusicRef,
        lowHpSoundRef,
        victorySoundRef,
        playerActivePokemon,
        opponentActivePokemon,
        handleAttack,
        handleSwitchPokemon,
        awaitingPlayerSwitch,
        awaitingOpponentSwitch,
    } = useBattleLogic(pokemonId1, pokemonId2);

    // Estado de carga más robusto
    // Verificamos no solo que los Pokémon activos existan, sino que también los equipos no estén vacíos.
    // Esto asegura que `playerActivePokemon` y `opponentActivePokemon` no sean null o undefined
    // y que los equipos (playerTeam, opponentTeam) hayan sido inicializados en useBattleLogic.
    if (!playerActivePokemon || !opponentActivePokemon || playerTeam.length === 0 || opponentTeam.length === 0) {
        return (
            <div className="battle-loading-screen">
                <p>Cargando Pokémon para la batalla...</p>
                {/* Puedes añadir un spinner o una imagen de carga aquí */}
            </div>
        );
    }

    return (
        <div className="battle-arena">
            {/* Elementos de audio */}
            <audio ref={attackSoundRef} src="/sounds/attack.mp3" preload="auto"></audio>
            <audio ref={hitSoundRef} src="/sounds/hit.mp3" preload="auto"></audio>
            <audio ref={battleMusicRef} src="/sounds/battle_music.mp3" preload="auto"></audio>
            <audio ref={lowHpSoundRef} src="/sounds/low_hp.mp3" preload="auto"></audio>
            <audio ref={victorySoundRef} src="/sounds/victory.mp3" preload="auto"></audio>

            {/* Contador de turno */}
            {!battleEnded && <h2 className="turn-counter">Turno: {turnCount}</h2>}

            {/* Contenedor principal de Pokémon */}
            <div className="pokemon-main-container">
                {/* Pokémon del jugador (izquierda en desktop, abajo en móvil) */}
                <div className="player-pokemon-wrapper">
                    <PokemonDisplay
                        pokemon={playerActivePokemon}
                        currentHp={playerActivePokemon.hp}
                        maxHp={playerActivePokemon.maxHp}
                        isPlayer={true}
                        isAttacking={playerAttacking}
                        isDamaged={opponentDamaged}
                        name={playerActivePokemon.name || 'Tu Pokémon'}
                    />
                </div>

                {/* Pokémon oponente (derecha en desktop, arriba en móvil) */}
                <div className="opponent-pokemon-wrapper">
                    <PokemonDisplay
                        pokemon={opponentActivePokemon}
                        currentHp={opponentActivePokemon.hp}
                        maxHp={opponentActivePokemon.maxHp}
                        isPlayer={false}
                        isAttacking={opponentAttacking}
                        isDamaged={playerDamaged}
                        name={opponentActivePokemon.name || 'Pokémon Oponente'}
                    />
                </div>
            </div>

            {/* Log de batalla */}
            <div className="battle-log-container">
                <BattleLogDisplay logMessages={battleLog} />
            </div>

            {/* Panel de acciones */}
            <div className="actions-panel">
                {/* Movimientos */}
                <div className="moves-container">
                    {/* Añadir verificación de `playerActivePokemon.moves` antes de pasarlo */}
                    <MovesList
                        moves={playerActivePokemon.moves || []} // Asegurarse de que 'moves' sea siempre un array
                        handleAttack={handleAttack}
                        isPlayersTurn={isPlayersTurn && !battleEnded && !awaitingOpponentSwitch && !awaitingPlayerSwitch}
                        battleEnded={battleEnded}
                    />
                </div>

                {/* Botón de cambio */}
                <div className="switch-button-container">
                    <SwitchPokemonButton
                        playerTeam={playerTeam}
                        onSwitchPokemon={handleSwitchPokemon}
                        isPlayersTurn={isPlayersTurn}
                        awaitingPlayerSwitch={awaitingPlayerSwitch}
                        battleEnded={battleEnded}
                        playerActivePokemonIndex={playerActivePokemonIndex}
                    />
                </div>
            </div>

            {/* Mensaje de fin de batalla */}
            {battleEnded && (
                <div className="battle-end-message">
                    <h3>¡Batalla Terminada!</h3>
                    <p>{battleLog.length > 0 ? battleLog[battleLog.length - 1] : "La batalla ha terminado."}</p>
                    <Link to="/battle" className="new-battle-button">Nueva Batalla</Link>
                </div>
            )}
        </div>
    );
}

export default PokemonBattleArena;