// src/components/PokemonBattleArena.js
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

// --- SIMPLIFICACIÓN: Estadísticas y movimientos básicos para la batalla ---
const getBattleStats = (pokemon) => {
    // Volvemos a 100 HP y ajustamos ataque/poder para un balance intermedio.
    const baseHp = 100;
    const baseAttack = 25; // Reducimos el ataque base para que el daño sea menor
    const baseDefense = 15;

    return {
        hp: baseHp,
        maxHp: baseHp, // Para la barra de vida
        attack: baseAttack,
        defense: baseDefense,
        moves: [{ name: "Tackle", power: 20 }] // Ajustamos el poder del movimiento
    };
};
// --- FIN SIMPLIFICACIÓN ---


function PokemonBattleArena({ pokemonList }) {
    const [searchParams] = useSearchParams();
    const pokemonId1 = parseInt(searchParams.get('p1'));
    const pokemonId2 = parseInt(searchParams.get('p2'));
    const pokemonId3 = parseInt(searchParams.get('p3'));

    const [playerTeam, setPlayerTeam] = useState([]); // El equipo de 3 Pokémon del jugador
    const [opponentTeam, setOpponentTeam] = useState([]); // El equipo de 1 (o más) Pokémon del oponente

    const [playerActivePokemonIndex, setPlayerActivePokemonIndex] = useState(0); // Índice del Pokémon activo del jugador en playerTeam
    const [opponentActivePokemonIndex, setOpponentActivePokemonIndex] = useState(0); // Índice del Pokémon activo del oponente en opponentTeam

    const [playerTeamHp, setPlayerTeamHp] = useState([]); // Array de HP actuales para el equipo del jugador
    const [opponentTeamHp, setOpponentTeamHp] = useState([]); // Array de HP actuales para el equipo del oponente

    const [battleLog, setBattleLog] = useState([]);
    const [isPlayersTurn, setIsPlayersTurn] = useState(true);
    const [battleEnded, setBattleEnded] = useState(false);
    const navigate = useNavigate();

    // --- Carga inicial de Pokémon y sus estadísticas de batalla ---
    useEffect(() => {
        if (pokemonList.length > 0 && pokemonId1 && pokemonId2 && pokemonId3) {
            const p1 = pokemonList.find(p => p.id === pokemonId1);
            const p2 = pokemonList.find(p => p.id === pokemonId2);
            const p3 = pokemonList.find(p => p.id === pokemonId3);

            if (p1 && p2 && p3) {
                const selectedPlayerTeam = [
                    { ...p1, ...getBattleStats(p1) },
                    { ...p2, ...getBattleStats(p2) },
                    { ...p3, ...getBattleStats(p3) }
                ];
                setPlayerTeam(selectedPlayerTeam);

                // --- Lógica para que la IA elija un Pokémon distinto al del jugador ---
                const selectedPokemonIds = [pokemonId1, pokemonId2, pokemonId3];
                const availableOpponents = pokemonList.filter(
                    p => !selectedPokemonIds.includes(p.id)
                );

                let chosenOpponent;
                if (availableOpponents.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableOpponents.length);
                    chosenOpponent = availableOpponents[randomIndex];
                } else {
                    // Si no hay Pokémon disponibles que no estén en tu equipo,
                    // usa uno de la lista principal (ej. el primero) o maneja el error
                    console.warn("No hay suficientes Pokémon para el oponente fuera de la selección del jugador. Usando un Pokémon predeterminado.");
                    chosenOpponent = pokemonList.find(p => !selectedPokemonIds.includes(p.id)) || pokemonList[0];
                }

                const initialOpponentTeam = [{ ...chosenOpponent, ...getBattleStats(chosenOpponent) }];
                setOpponentTeam(initialOpponentTeam);

                // Inicializar HP para ambos equipos
                setPlayerTeamHp(selectedPlayerTeam.map(p => p.hp));
                setOpponentTeamHp(initialOpponentTeam.map(p => p.hp));

                setBattleLog(["¡La batalla ha comenzado!"]);
                const starterMessage = `${selectedPlayerTeam[0].name} vs ${initialOpponentTeam[0].name}. ¡A luchar!`;
                setBattleLog(prev => [...prev, starterMessage]);
            }
        }
    }, [pokemonList, pokemonId1, pokemonId2, pokemonId3]);

    // Comprobamos si la batalla ha terminado
    useEffect(() => {
        if (playerTeam.length > 0 && opponentTeam.length > 0) {
            const allPlayerFainted = playerTeamHp.every(hp => hp <= 0);
            const allOpponentFainted = opponentTeamHp.every(hp => hp <= 0);

            if (allPlayerFainted && !battleEnded) {
                setBattleLog(prev => [...prev, "¡Tu equipo ha sido debilitado! Has perdido la batalla."]);
                setBattleEnded(true);
            } else if (allOpponentFainted && !battleEnded) {
                setBattleLog(prev => [...prev, "¡El equipo rival ha sido debilitado! ¡Has ganado la batalla!"]);
                setBattleEnded(true);
            }
        }
    }, [playerTeamHp, opponentTeamHp, playerTeam.length, opponentTeam.length, battleEnded]);


    // Obtener los Pokémon activos en la batalla
    const playerActivePokemon = playerTeam[playerActivePokemonIndex];
    const opponentActivePokemon = opponentTeam[opponentActivePokemonIndex];

    // --- Lógica del ataque ---
    const handleAttack = useCallback(() => {
        if (battleEnded || !playerActivePokemon || !opponentActivePokemon || !isPlayersTurn) return;

        let logMessages = [];
        const movePower = playerActivePokemon.moves[0].power;
        let damage = Math.floor((movePower * playerActivePokemon.attack) / opponentActivePokemon.defense);

        const variability = Math.floor(damage * 0.1 * (Math.random() * 2 - 1));
        damage = Math.max(5, damage + variability); // Asegurar un mínimo de 5 de daño

        const newOpponentHp = opponentTeamHp[opponentActivePokemonIndex] - damage;

        logMessages.push(`${playerActivePokemon.name} usó ${playerActivePokemon.moves[0].name} e hizo ${damage} de daño.`);
        setOpponentTeamHp(prevHp => {
            const updatedHp = [...prevHp];
            updatedHp[opponentActivePokemonIndex] = newOpponentHp;
            return updatedHp;
        });

        if (newOpponentHp <= 0) {
            logMessages.push(`${opponentActivePokemon.name} ha sido debilitado.`);
            // Aquí puedes añadir lógica para que la IA cambie de Pokémon si tiene más
        }

        setBattleLog(prev => [...prev, ...logMessages]);
        setIsPlayersTurn(false);
    }, [battleEnded, playerActivePokemon, opponentActivePokemon, isPlayersTurn, opponentTeamHp, opponentActivePokemonIndex]);


    // --- Lógica de la IA del oponente ---
    useEffect(() => {
        if (!isPlayersTurn && !battleEnded && opponentActivePokemon && playerActivePokemon) {
            const opponentTurn = () => {
                let logMessages = [];
                const movePower = opponentActivePokemon.moves[0].power;
                let damage = Math.floor((movePower * opponentActivePokemon.attack) / playerActivePokemon.defense);
                const variability = Math.floor(damage * 0.1 * (Math.random() * 2 - 1));
                damage = Math.max(5, damage + variability);

                const newPlayerHp = playerTeamHp[playerActivePokemonIndex] - damage;

                logMessages.push(`${opponentActivePokemon.name} usó ${opponentActivePokemon.moves[0].name} e hizo ${damage} de daño.`);
                
                setPlayerTeamHp(prevHp => {
                    const updatedHpTeam = [...prevHp];
                    updatedHpTeam[playerActivePokemonIndex] = newPlayerHp;
                    return updatedHpTeam;
                });

                if (newPlayerHp <= 0) {
                    logMessages.push(`${playerActivePokemon.name} ha sido debilitado.`);
                    
                    // Buscar el siguiente Pokémon no debilitado del jugador
                    const nextPlayerPokemonIndex = playerTeamHp.findIndex((hp, idx) => hp > 0 && idx !== playerActivePokemonIndex);
                    if (nextPlayerPokemonIndex !== -1) {
                        setBattleLog(prev => [...prev, ...logMessages, `¡${playerActivePokemon.name} se retiró! ¡Envía al siguiente Pokémon!`]);
                        setPlayerActivePokemonIndex(nextPlayerPokemonIndex);
                    }
                    // La lógica de `useEffect` para `battleEnded` manejará el final si no hay más Pokémon
                }
                setBattleLog(prev => [...prev, ...logMessages]);
                setIsPlayersTurn(true);
            };

            const timer = setTimeout(opponentTurn, 1500);
            return () => clearTimeout(timer);
        }
    }, [isPlayersTurn, battleEnded, opponentActivePokemon, playerActivePokemon, playerTeamHp, playerActivePokemonIndex]);


    // --- Lógica de cambio de Pokémon del jugador ---
    const handleChangePokemon = useCallback((newIndex) => {
        if (battleEnded || !isPlayersTurn || newIndex === playerActivePokemonIndex) return;

        if (playerTeamHp[newIndex] <= 0) {
            setBattleLog(prev => [...prev, `¡${playerTeam[newIndex].name} ya está debilitado y no puede luchar!`]);
            return;
        }

        setBattleLog(prev => [...prev, `${playerActivePokemon.name} regresa. ¡Adelante, ${playerTeam[newIndex].name}!`]);
        setPlayerActivePokemonIndex(newIndex);
        setIsPlayersTurn(false);
    }, [battleEnded, isPlayersTurn, playerActivePokemonIndex, playerActivePokemon, playerTeamHp, playerTeam]);


    // Mostrar mensaje de carga mientras los Pokémon no estén listos
    if (!playerActivePokemon || !opponentActivePokemon || playerTeam.length === 0 || opponentTeam.length === 0 || playerTeamHp.length === 0 || opponentTeamHp.length === 0) {
        return (
            <div className="battle-arena-container">
                <div className="loading-battle">Cargando Pokémon para la batalla...</div>
                <Link to="/battle" className="back-to-selector pokemon-link-button">Volver a la selección</Link>
            </div>
        );
    }

    // Calcula el porcentaje de HP para las barras de vida
    const playerHpPercent = (playerTeamHp[playerActivePokemonIndex] / playerActivePokemon.maxHp) * 100;
    const opponentHpPercent = (opponentTeamHp[opponentActivePokemonIndex] / opponentActivePokemon.maxHp) * 100;


    return (
        <div className="battle-arena-container">
            <h1>¡Batalla Pokémon!</h1>

            {/* Contenedor para las Pokebolas de equipo del jugador (arriba) */}
            <div className="pokeball-team-container player-team top-position">
                <div className="pokeball-grid">
                    {playerTeam.map((pokemon, idx) => {
                        const isFainted = playerTeamHp[idx] <= 0;
                        const isActive = playerActivePokemonIndex === idx;

                        return (
                            <div
                                key={pokemon.id}
                                className={`pokeball-slot ${isFainted ? 'fainted' : ''} ${isActive ? 'active' : ''}`}
                            >
                                <img
                                    src="/pokeball-icon.png"
                                    alt="Pokeball"
                                    className="pokeball-icon"
                                />
                                <span className="pokemon-name-pokeball">{pokemon.name}</span>
                                {isFainted && <span className="fainted-overlay">Debilitado</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Contenedor para las Pokebolas de equipo del oponente (arriba) */}
            <div className="pokeball-team-container opponent-team top-position">
                <div className="pokeball-grid">
                    {opponentTeam.map((pokemon, idx) => {
                        const isFainted = opponentTeamHp[idx] <= 0;
                        const isActive = opponentActivePokemonIndex === idx;
                        return (
                            <div
                                key={pokemon.id}
                                className={`pokeball-slot ${isFainted ? 'fainted' : ''} ${isActive ? 'active' : ''}`}
                            >
                                <img
                                    src="/pokeball-icon.png"
                                    alt="Pokeball"
                                    className="pokeball-icon"
                                />
                                <span className="pokemon-name-pokeball">{pokemon.name}</span>
                                {isFainted && <span className="fainted-overlay">Debilitado</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Display de los Pokémon que están combatiendo */}
            <div className="battle-display">
                <div className="battle-pokemon pokemon-1">
                    <h3>{playerActivePokemon.name}</h3>
                    <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${playerActivePokemon.id}.png`}
                        alt={playerActivePokemon.name}
                        className="active-pokemon-image player"
                    />
                    <div className="hp-bar-container">
                        <div className="hp-bar" style={{ width: `${Math.max(0, playerHpPercent)}%`, backgroundColor: playerHpPercent > 50 ? 'lightgreen' : playerHpPercent > 20 ? 'orange' : 'red' }}></div>
                    </div>
                    <p>HP: {Math.max(0, playerTeamHp[playerActivePokemonIndex])} / {playerActivePokemon.maxHp}</p>
                </div>

                <div className="battle-vs">VS</div>

                <div className="battle-pokemon pokemon-2">
                    <h3>{opponentActivePokemon.name}</h3>
                    <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${opponentActivePokemon.id}.png`}
                        alt={opponentActivePokemon.name}
                        className="active-pokemon-image opponent"
                    />
                    <div className="hp-bar-container">
                        <div className="hp-bar" style={{ width: `${Math.max(0, opponentHpPercent)}%`, backgroundColor: opponentHpPercent > 50 ? 'lightgreen' : opponentHpPercent > 20 ? 'orange' : 'red' }}></div>
                    </div>
                    <p>HP: {Math.max(0, opponentTeamHp[opponentActivePokemonIndex])} / {opponentActivePokemon.maxHp}</p>
                </div>
            </div>

            {/* Log de la batalla (ahora debajo del display de Pokémon) */}
            <div className="battle-log">
                {battleLog.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>

            {/* Controles de la batalla */}
            <div className="battle-controls">
                {!battleEnded && isPlayersTurn && (
                    <>
                        <button onClick={handleAttack} disabled={battleEnded}>
                            Atacar ({playerActivePokemon?.moves[0].name})
                        </button>
                        {/* Botones para cambiar de Pokémon */}
                        {playerTeam.map((pokemon, idx) => {
                            const isFainted = playerTeamHp[idx] <= 0;
                            const isActive = playerActivePokemonIndex === idx;

                            if (!isActive && !isFainted) {
                                return (
                                    <button
                                        key={pokemon.id}
                                        onClick={() => handleChangePokemon(idx)}
                                        disabled={battleEnded || !isPlayersTurn}
                                    >
                                        Cambiar a {pokemon.name}
                                    </button>
                                );
                            }
                            return null;
                        })}
                    </>
                )}
                {battleEnded && (
                    <button onClick={() => navigate('/battle')} className="restart-button pokemon-link-button">
                        Volver a la Selección
                    </button>
                )}
            </div>
        </div>
    );
}

export default PokemonBattleArena;