import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPokemonDetails } from '../services/pokemonService';
import { calculateTypeEffectiveness } from '../utils/typeEffectiveness';
import { calculateDamage } from '../utils/battleUtils';

const playSound = (ref, volume = 0.5, loop = false) => {
    if (ref.current) {
        ref.current.currentTime = 0;
        ref.current.volume = volume;
        ref.current.loop = loop;
        ref.current.play().catch(e => console.error("Error al reproducir sonido:", e));
    }
};

const stopSound = (ref) => {
    if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
    }
};

export const useBattleLogic = (pokemonId1, pokemonId2) => {
    const navigate = useNavigate();

    // Estados
    const [playerTeam, setPlayerTeam] = useState([]);
    const [opponentTeam, setOpponentTeam] = useState([]);
    const [playerActivePokemonIndex, setPlayerActivePokemonIndex] = useState(0);
    const [opponentActivePokemonIndex, setOpponentActivePokemonIndex] = useState(0);
    const [battleLog, setBattleLog] = useState([]);
    const [isPlayersTurn, setIsPlayersTurn] = useState(true);
    const [battleEnded, setBattleEnded] = useState(false);
    const [turnCount, setTurnCount] = useState(1);
    const [awaitingPlayerSwitch, setAwaitingPlayerSwitch] = useState(false);
    const [awaitingOpponentSwitch, setAwaitingOpponentSwitch] = useState(false);
    const [animationBlocking, setAnimationBlocking] = useState(false);
    const [playerAttacking, setPlayerAttacking] = useState(false);
    const [opponentAttacking, setOpponentAttacking] = useState(false);
    const [playerDamaged, setPlayerDamaged] = useState(false);
    const [opponentDamaged, setOpponentDamaged] = useState(false);

    // Referencias de audio
    const attackSoundRef = useRef(null);
    const hitSoundRef = useRef(null);
    const battleMusicRef = useRef(null);
    const lowHpSoundRef = useRef(null);
    const victorySoundRef = useRef(null);

    // Pokémon activos
    const playerActivePokemon = playerTeam[playerActivePokemonIndex] || null;
    const opponentActivePokemon = opponentTeam[opponentActivePokemonIndex] || null;

    // Funciones auxiliares
    const getRandomPokemonId = useCallback((excludeIds, totalPokemon = 1017) => {
        let randomId;
        do {
            randomId = Math.floor(Math.random() * totalPokemon) + 1;
        } while (excludeIds.includes(randomId));
        return randomId;
    }, []);

    // Definición de funciones principales (useCallback)
    const handleOpponentSwitch = useCallback(async () => {
        if (battleEnded || animationBlocking) return;

        const availableOpponentPokemon = opponentTeam.filter((p, idx) =>
            p.hp > 0 && idx !== opponentActivePokemonIndex
        );

        if (availableOpponentPokemon.length > 0) {
            setAnimationBlocking(true);
            const nextPokemonToSwitch = availableOpponentPokemon[0];
            const nextPokemonIndex = opponentTeam.findIndex(p => p.id === nextPokemonToSwitch.id);

            const prevOpponentPokemonName = opponentActivePokemon?.name?.toUpperCase();
            const newOpponentPokemonName = nextPokemonToSwitch?.name?.toUpperCase();

            setBattleLog(prev => [...prev, `${prevOpponentPokemonName || 'El Pokémon oponente'} ha regresado!`]);
            await new Promise(resolve => setTimeout(resolve, 500));

            setOpponentActivePokemonIndex(nextPokemonIndex);
            setAwaitingOpponentSwitch(false);

            setBattleLog(prev => [...prev, `¡${newOpponentPokemonName || 'Un nuevo Pokémon oponente'} sale a luchar!`]);
            await new Promise(resolve => setTimeout(resolve, 500));

            setAnimationBlocking(false);

            if (!battleEnded) {
                setIsPlayersTurn(true);
                setTurnCount(prev => prev + 1);
            }
        } else {
            setBattleLog(prev => [...prev, "El oponente no tiene más Pokémon disponibles para cambiar."]);
            setBattleEnded(true);
            setAnimationBlocking(false);
            stopSound(battleMusicRef);
            stopSound(lowHpSoundRef);
            playSound(victorySoundRef, 0.7);
        }
    }, [
        battleEnded, animationBlocking, opponentTeam, opponentActivePokemonIndex, opponentActivePokemon,
        setBattleLog, setOpponentActivePokemonIndex, setAwaitingOpponentSwitch,
        setIsPlayersTurn, setTurnCount, setAnimationBlocking,
        battleMusicRef, lowHpSoundRef, victorySoundRef // Incluir refs de sonido si se usan en el useCallback
    ]);

    const handleSwitchPokemon = useCallback(async (newPokemonIndex, isForced = false) => {
        if (battleEnded || (!isForced && animationBlocking)) return;

        if (newPokemonIndex === playerActivePokemonIndex ||
            newPokemonIndex < 0 ||
            newPokemonIndex >= playerTeam.length) {
            if (!isForced) {
                setBattleLog(prev => [...prev, "No puedes cambiar a ese Pokémon o el índice es inválido."]);
            }
            return;
        }

        if (playerTeam[newPokemonIndex]?.hp <= 0) {
            if (!isForced) {
                setBattleLog(prev => [...prev, `${playerTeam[newPokemonIndex]?.name?.toUpperCase()} está debilitado y no puede luchar.`]);
            }
            return;
        }

        setAnimationBlocking(true);

        const prevPokemonName = playerActivePokemon?.name?.toUpperCase();
        const newPokemonName = playerTeam[newPokemonIndex]?.name?.toUpperCase();

        if (prevPokemonName) {
            setBattleLog(prev => [...prev, `${prevPokemonName} ha regresado!`]);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setPlayerActivePokemonIndex(newPokemonIndex);
        setAwaitingPlayerSwitch(false);
        stopSound(lowHpSoundRef);

        setBattleLog(prev => [...prev, `¡Adelante, ${newPokemonName || 'un nuevo Pokémon'}!`]);
        await new Promise(resolve => setTimeout(resolve, 500));

        setAnimationBlocking(false);

        if (!battleEnded) {
            setIsPlayersTurn(false);
            setTurnCount(prev => prev + 1);
        }
    }, [
        battleEnded, animationBlocking, playerActivePokemonIndex, playerTeam, playerActivePokemon, lowHpSoundRef,
        setBattleLog, setPlayerActivePokemonIndex, setAwaitingPlayerSwitch, setAnimationBlocking,
        setIsPlayersTurn, setTurnCount
    ]);

    const handleAttack = useCallback(async (moveIndex) => {
        if (battleEnded || !isPlayersTurn || awaitingPlayerSwitch || awaitingOpponentSwitch || animationBlocking) return;

        if (!playerActivePokemon || !opponentActivePokemon) {
            setBattleLog(prev => [...prev, "Error: Pokémon activo no encontrado para el ataque."]);
            return;
        }

        const chosenMove = playerActivePokemon.moves?.[moveIndex];
        if (!chosenMove) {
            setBattleLog(prev => [...prev, "Error: Movimiento inválido o no encontrado."]);
            return;
        }

        setAnimationBlocking(true);
        setBattleLog(prev => [...prev, `${playerActivePokemon.name?.toUpperCase()} usó ${chosenMove.name?.toUpperCase()}!`]);

        setPlayerAttacking(true);
        playSound(attackSoundRef);
        await new Promise(resolve => setTimeout(resolve, 800));

        const damageDealt = calculateDamage(playerActivePokemon, opponentActivePokemon, chosenMove);

        setOpponentTeam(prevTeam => prevTeam.map((p, idx) => {
            if (idx === opponentActivePokemonIndex) {
                const newHp = Math.max(0, p.hp - damageDealt);
                return { ...p, hp: newHp };
            }
            return p;
        }));

        setPlayerAttacking(false);
        setOpponentDamaged(true);
        playSound(hitSoundRef);
        await new Promise(resolve => setTimeout(resolve, 500));

        setOpponentDamaged(false);
        setAnimationBlocking(false);

        const logMessages = [`${playerActivePokemon.name?.toUpperCase()} hizo ${damageDealt} de daño a ${opponentActivePokemon.name?.toUpperCase()}.`];

        const typeEffectiveness = calculateTypeEffectiveness(chosenMove.type, opponentActivePokemon.types.map(t => t.type.name));
        if (typeEffectiveness === 2) { logMessages.push("¡Es súper efectivo!"); }
        else if (typeEffectiveness === 4) { logMessages.push("¡Es cuádruple efectivo!"); }
        else if (typeEffectiveness === 0.5) { logMessages.push("No es muy efectivo..."); }
        else if (typeEffectiveness === 0.25) { logMessages.push("Apenas hace efecto..."); }
        else if (typeEffectiveness === 0) { logMessages.push("No tiene efecto."); }

        setBattleLog(prev => [...prev, ...logMessages]);

        await new Promise(resolve => setTimeout(resolve, 500));

        if (!battleEnded && !awaitingOpponentSwitch && playerActivePokemon.hp > 0 && opponentActivePokemon.hp > 0) {
            setIsPlayersTurn(false);
            setTurnCount(prev => prev + 1);
        }
    }, [
        battleEnded, isPlayersTurn, awaitingPlayerSwitch, awaitingOpponentSwitch, animationBlocking,
        playerActivePokemon, opponentActivePokemon, opponentActivePokemonIndex,
        setBattleLog, setPlayerAttacking, attackSoundRef, setOpponentTeam,
        setOpponentDamaged, hitSoundRef, setAnimationBlocking, setIsPlayersTurn, setTurnCount
    ]);

    const handleOpponentTurn = useCallback(async () => {
        if (battleEnded || isPlayersTurn || awaitingPlayerSwitch || animationBlocking) return;

        if (!playerActivePokemon || !opponentActivePokemon) {
            setBattleLog(prev => [...prev, "Error: Pokémon activo no encontrado para el turno de la IA."]);
            setIsPlayersTurn(true);
            return;
        }

        setAnimationBlocking(true);

        let chosenOpponentMove = null;
        if (opponentActivePokemon.moves && opponentActivePokemon.moves.length > 0) {
            chosenOpponentMove = opponentActivePokemon.moves[Math.floor(Math.random() * opponentActivePokemon.moves.length)];
        }

        if (!chosenOpponentMove) {
            setBattleLog(prev => [...prev, `${opponentActivePokemon.name?.toUpperCase()} no tiene movimientos válidos. Salta su turno.`]);
            setAnimationBlocking(false);
            setIsPlayersTurn(true);
            setTurnCount(prev => prev + 1);
            return;
        }

        setBattleLog(prev => [...prev, `${opponentActivePokemon.name?.toUpperCase()} usó ${chosenOpponentMove.name?.toUpperCase()}!`]);

        setOpponentAttacking(true);
        playSound(attackSoundRef);
        await new Promise(resolve => setTimeout(resolve, 800));

        const damageDealt = calculateDamage(opponentActivePokemon, playerActivePokemon, chosenOpponentMove);

        setPlayerTeam(prevTeam => prevTeam.map((p, idx) => {
            if (idx === playerActivePokemonIndex) {
                const newHp = Math.max(0, p.hp - damageDealt);
                return { ...p, hp: newHp };
            }
            return p;
        }));

        setOpponentAttacking(false);
        setPlayerDamaged(true);
        playSound(hitSoundRef);
        await new Promise(resolve => setTimeout(resolve, 500));

        setPlayerDamaged(false);
        setAnimationBlocking(false);

        const logMessages = [`${opponentActivePokemon.name?.toUpperCase()} hizo ${damageDealt} de daño a ${playerActivePokemon.name?.toUpperCase()}.`];

        const typeEffectiveness = calculateTypeEffectiveness(chosenOpponentMove.type, playerActivePokemon.types.map(t => t.type.name));
        if (typeEffectiveness === 2) { logMessages.push("¡Es súper efectivo!"); }
        else if (typeEffectiveness === 4) { logMessages.push("¡Es cuádruple efectivo!"); }
        else if (typeEffectiveness === 0.5) { logMessages.push("No es muy efectivo..."); }
        else if (typeEffectiveness === 0.25) { logMessages.push("Apenas hace efecto..."); }
        else if (typeEffectiveness === 0) { logMessages.push("No tiene efecto."); }

        setBattleLog(prev => [...prev, ...logMessages]);

        await new Promise(resolve => setTimeout(resolve, 500));

        if (!battleEnded && !awaitingPlayerSwitch && playerActivePokemon.hp > 0 && opponentActivePokemon.hp > 0) {
            setIsPlayersTurn(true);
            setTurnCount(prev => prev + 1);
        }
    }, [
        battleEnded, isPlayersTurn, awaitingPlayerSwitch, animationBlocking,
        playerActivePokemon, opponentActivePokemon, playerActivePokemonIndex,
        setBattleLog, setOpponentAttacking, attackSoundRef, setPlayerTeam,
        setPlayerDamaged, hitSoundRef, setAnimationBlocking, setIsPlayersTurn, setTurnCount
    ]);

    // Efectos
    useEffect(() => {
        const loadBattlePokemon = async () => {
            if (!pokemonId1 || !pokemonId2) {
                navigate('/battle'); // Redirige a la página principal si no hay IDs válidos
                return;
            }

            try {
                setBattleLog(["Cargando Pokémon..."]);
                const p1Details = await fetchPokemonDetails(pokemonId1);
                const p2Details = await fetchPokemonDetails(pokemonId2);

                if (!p1Details || !p2Details) {
                    throw new Error("No se pudieron cargar los Pokémon del jugador.");
                }

                const selectedPlayerTeam = [
                    { ...p1Details, maxHp: p1Details.hp },
                    { ...p2Details, maxHp: p2Details.hp }
                ];
                setPlayerTeam(selectedPlayerTeam);
                setPlayerActivePokemonIndex(0);

                const usedIds = [pokemonId1, pokemonId2];
                const opponentId1 = getRandomPokemonId(usedIds);
                usedIds.push(opponentId1);
                const opponentId2 = getRandomPokemonId(usedIds);

                const opp1Details = await fetchPokemonDetails(opponentId1);
                const opp2Details = await fetchPokemonDetails(opponentId2);

                if (!opp1Details || !opp2Details) {
                    throw new Error("No se pudieron cargar los Pokémon del oponente.");
                }

                const initialOpponentTeam = [
                    { ...opp1Details, maxHp: opp1Details.hp },
                    { ...opp2Details, maxHp: opp2Details.hp }
                ];
                setOpponentTeam(initialOpponentTeam);
                setOpponentActivePokemonIndex(0);

                setBattleLog(prev => [...prev, `¡La batalla ha comenzado! ${p1Details.name?.toUpperCase()} vs ${opp1Details.name?.toUpperCase()}. ¡A luchar!`]);
                setTurnCount(1);
                setIsPlayersTurn(true);
                setBattleEnded(false);
                setAwaitingPlayerSwitch(false);
                setAwaitingOpponentSwitch(false);
                setAnimationBlocking(false);

                playSound(battleMusicRef, 0.3, true);

            } catch (error) {
                console.error("Error loading Pokémon data:", error);
                setBattleLog(prev => [...prev, `Error cargando Pokémon: ${error.message}. Intenta de nuevo.`]);
                setBattleEnded(true);
            }
        };

        loadBattlePokemon();

        return () => {
            stopSound(battleMusicRef);
            stopSound(lowHpSoundRef);
            stopSound(victorySoundRef);
        };
    }, [
        pokemonId1, pokemonId2, navigate, getRandomPokemonId,
        setPlayerTeam, setPlayerActivePokemonIndex, setOpponentTeam, setOpponentActivePokemonIndex,
        setBattleLog, setTurnCount, setIsPlayersTurn, setBattleEnded,
        setAwaitingPlayerSwitch, setAwaitingOpponentSwitch, setAnimationBlocking, battleMusicRef
    ]);

    useEffect(() => {
        if (playerTeam.length === 0 || opponentTeam.length === 0 || battleEnded) return;

        const checkFaintedPokemons = () => {
            const currentAlivePlayerPokemons = playerTeam.filter(p => p.hp > 0);
            const currentAliveOpponentPokemons = opponentTeam.filter(p => p.hp > 0);

            // 1. CONDICIONES DE FIN DE BATALLA
            if (currentAlivePlayerPokemons.length === 0) {
                if (!battleEnded) { // Asegurarse de que no se ejecute múltiples veces
                    setBattleLog(prev => [...prev, "¡Tu equipo ha sido debilitado! Has perdido la batalla."]);
                    setBattleEnded(true);
                    setAwaitingPlayerSwitch(false);
                    setAwaitingOpponentSwitch(false);
                    stopSound(battleMusicRef);
                    stopSound(lowHpSoundRef);
                }
                return;
            }

            if (currentAliveOpponentPokemons.length === 0) {
                if (!battleEnded) { // Asegurarse de que no se ejecute múltiples veces
                    setBattleLog(prev => [...prev, "¡El equipo rival ha sido debilitado! ¡Has ganado la batalla!"]);
                    setBattleEnded(true);
                    setAwaitingPlayerSwitch(false);
                    setAwaitingOpponentSwitch(false);
                    stopSound(battleMusicRef);
                    stopSound(lowHpSoundRef);
                    playSound(victorySoundRef, 0.7);
                }
                return;
            }

            // Si la batalla ya terminó por la lógica anterior, no continuar
            if (battleEnded) return;

            // 2. CAMBIO FORZADO DEL JUGADOR
            if (playerActivePokemon && playerActivePokemon.hp <= 0 && !awaitingPlayerSwitch) {
                stopSound(lowHpSoundRef);
                if (currentAlivePlayerPokemons.length > 0) {
                    setBattleLog(prev => [...prev, `${playerActivePokemon.name?.toUpperCase()} ha sido debilitado. ¡Cambiando automáticamente!`]);
                    setAwaitingPlayerSwitch(true);
                    setIsPlayersTurn(true); // Se fuerza el turno del jugador para el cambio
                    const nextAliveIndex = playerTeam.findIndex((p, idx) => p.hp > 0 && idx !== playerActivePokemonIndex);
                    if (nextAliveIndex >= 0) {
                        setTimeout(() => {
                            handleSwitchPokemon(nextAliveIndex, true); // Pasar true para indicar que es un cambio forzado
                        }, 1000);
                    }
                }
                return;
            }

            // 3. CAMBIO FORZADO DEL OPONENTE
            if (opponentActivePokemon && opponentActivePokemon.hp <= 0 && !awaitingOpponentSwitch) {
                if (currentAliveOpponentPokemons.length > 0) {
                    setBattleLog(prev => [...prev, `${opponentActivePokemon.name?.toUpperCase()} ha sido debilitado. ¡El oponente está cambiando!`]);
                    setAwaitingOpponentSwitch(true);
                    setIsPlayersTurn(false); // Mantener el turno del oponente hasta que cambie
                    // No necesitas encontrar el índice aquí, handleOpponentSwitch ya lo hace.
                    setTimeout(() => {
                        handleOpponentSwitch();
                    }, 1000);
                }
                return;
            }

            // 4. CONTROL DEL SONIDO DE BAJA HP
            if (playerActivePokemon && playerActivePokemon.maxHp && playerActivePokemon.hp > 0) {
                if (playerActivePokemon.hp / playerActivePokemon.maxHp <= 0.2) {
                    // Solo reproducir si no está sonando o está pausado
                    if (lowHpSoundRef.current?.paused || lowHpSoundRef.current?.ended) {
                        playSound(lowHpSoundRef, 0.7, true);
                    }
                } else {
                    stopSound(lowHpSoundRef);
                }
            } else {
                stopSound(lowHpSoundRef);
            }
        };

        const timeoutId = setTimeout(() => {
            checkFaintedPokemons();
        }, 600); // Pequeño retardo para permitir que los estados se actualicen

        return () => clearTimeout(timeoutId);
    }, [
        playerTeam, opponentTeam, battleEnded, awaitingPlayerSwitch, awaitingOpponentSwitch,
        playerActivePokemon, opponentActivePokemon, playerActivePokemonIndex, opponentActivePokemonIndex, // <-- ADDED
        handleOpponentSwitch, handleSwitchPokemon, // Estas funciones son estables por useCallback
        setBattleLog, setBattleEnded, setAwaitingPlayerSwitch, setAwaitingOpponentSwitch, setIsPlayersTurn, // Setters
        battleMusicRef, lowHpSoundRef, victorySoundRef // Refs de sonido
    ]);


    useEffect(() => {
        if (battleEnded || animationBlocking) return;

        // Si el jugador está esperando un cambio forzado, no ejecutar lógica de turnos
        if (awaitingPlayerSwitch && playerActivePokemon?.hp <= 0) {
            return;
        }

        // Si el oponente está esperando un cambio forzado, no ejecutar lógica de turnos
        if (awaitingOpponentSwitch && opponentActivePokemon?.hp <= 0) {
            return;
        }


        if (!isPlayersTurn) {
            // Retraso para que el usuario pueda ver el log y la animación de ataque
            const timeoutId = setTimeout(() => {
                handleOpponentTurn();
            }, 1500);
            return () => clearTimeout(timeoutId);
        }
    }, [
        isPlayersTurn, battleEnded, animationBlocking, awaitingPlayerSwitch, awaitingOpponentSwitch,
        playerActivePokemon, opponentActivePokemon, // Son referencias a objetos, si cambian, se re-ejecuta.
        handleOpponentTurn, // Esta función es estable por useCallback
        handleOpponentSwitch, // Si esta función cambia, el efecto se re-ejecuta.
        playerActivePokemonIndex, opponentActivePokemonIndex // <-- ADDED
    ]);


    return {
        playerTeam,
        opponentTeam,
        playerActivePokemonIndex,
        opponentActivePokemonIndex,
        playerActivePokemon,
        R_opponentActivePokemon: opponentActivePokemon, // Renombrado para evitar conflicto con el import de React
        battleLog,
        isPlayersTurn,
        battleEnded,
        turnCount,
        playerAttacking,
        opponentAttacking,
        playerDamaged,
        opponentDamaged,
        awaitingPlayerSwitch,
        awaitingOpponentSwitch,
        attackSoundRef,
        hitSoundRef,
        battleMusicRef,
        lowHpSoundRef,
        victorySoundRef,
        handleAttack,
        handleSwitchPokemon,
    };
};