import React, { useEffect } from 'react';
import { useBattleLogic } from '../../hooks/useBattleLogic';
import { CombatantUI } from './CombatantUI';
import { BattleControls } from './BattleControls';
import { Link } from 'react-router-dom';
import './PokemonBattleArena.css';

// Puedes agregar aquí otras importaciones originales si las tienes

function PokemonBattleArena() {
  // Hook original: mantengo todos los valores expuestos
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
    handleSwitchPokemon,
  } = useBattleLogic();

  // Mantengo todos tus efectos de audio
  useEffect(() => {
    // Si tienes sonidos personalizados, los puedes agregar aquí
  }, []);

  // Estado de carga robusto original
  if (
    loading ||
    !activePokemonP1 ||
    !activePokemonP2 ||
    player1Team.length === 0 ||
    player2Team.length === 0
  ) {
    return (
      <div className="battle-arena-modern">
        <p>Cargando Pokémon para la batalla...</p>
      </div>
    );
  }

  // Calcula el número de turno como antes
  const turnCount = battleLog.length;

  return (
    <div className="battle-arena-modern">
      {/* Audios, mantén los originales si los usas */}
      <audio ref={attackSoundRef} src="/sounds/attack.mp3" preload="auto"></audio>
      <audio ref={hitSoundRef} src="/sounds/hit.mp3" preload="auto"></audio>
      <audio ref={battleMusicRef} src="/sounds/battle_music.mp3" preload="auto"></audio>
      <audio ref={lowHpSoundRef} src="/sounds/low_hp.mp3" preload="auto"></audio>
      <audio ref={victorySoundRef} src="/sounds/victory.mp3" preload="auto"></audio>

      {/* Contador de turno */}
      {!winner && <h2 className="turn-counter-modern">Turno: {turnCount}</h2>}

      {/* Panel del oponente */}
      <CombatantUI
        pokemon={activePokemonP2}
        team={player2Team}
        isOpponent={true}
        isAttacking={pokemonP2Attacking}
        isDamaged={pokemonP2Damaged}
        showPokeballs={true}
      />

      {/* Panel del jugador */}
      <CombatantUI
        pokemon={activePokemonP1}
        team={player1Team}
        isOpponent={false}
        isAttacking={pokemonP1Attacking}
        isDamaged={pokemonP1Damaged}
        showPokeballs={true}
      />

      {/* Panel de controles y log moderno */}
      <BattleControls
        playerActivePokemon={activePokemonP1}
        playerTeam={player1Team}
        battleLog={battleLog}
        isPlayersTurn={isPlayer1Turn}
        awaitingPlayerSwitch={awaitingSwitch === 'player1'}
        animationBlocking={animationBlocking}
        onAttack={handleAttack}
        onSwitch={handleSwitchPokemon}
        battleEnded={!!winner}
      />

      {/* Mensaje de fin de batalla y botón de volver */}
      {winner && (
        <div className="battle-end-message-modern">
          <h3>¡La batalla ha terminado!</h3>
          <p>
            {winner === 'player1'
              ? '¡Has ganado la batalla!'
              : winner === 'player2'
              ? 'Tu equipo ha sido derrotado...'
              : '¡Empate!'}
          </p>
          <Link className="new-battle-button-modern" to="/">Volver al inicio</Link>
        </div>
      )}

      {/* Mantengo cualquier otro elemento que tuvieras en el archivo original */}
      {/* Si tienes paneles extra, modales, tooltips, etc., los puedes agregar aquí */}
    </div>
  );
}

export default PokemonBattleArena;