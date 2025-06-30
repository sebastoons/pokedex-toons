// src/hooks/useBattleLogic.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPokemonDetails } from '../services/pokemonService';
import { calculateTypeEffectiveness } from '../utils/typeEffectiveness';
import { calculateDamage } from '../utils/battleUtils';

// Funciones auxiliares para sonidos
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

    // Estados para los equipos y HP
    const [playerTeam, setPlayerTeam] = useState([]);
    const [opponentTeam, setOpponentTeam] = useState([]);
    const [playerActivePokemonIndex, setPlayerActivePokemonIndex] = useState(0);
    const [opponentActivePokemonIndex, setOpponentActivePokemonIndex] = useState(0);

    // Estados de la batalla
    const [battleLog, setBattleLog] = useState([]);
    const [isPlayersTurn, setIsPlayersTurn] = useState(true);
    const [battleEnded, setBattleEnded] = useState(false);
    const [turnCount, setTurnCount] = useState(1);
    const [awaitingPlayerSwitch, setAwaitingPlayerSwitch] = useState(false);
    const [awaitingOpponentSwitch, setAwaitingOpponentSwitch] = useState(false);
    const [animationBlocking, setAnimationBlocking] = useState(false);

    // Estados para animaciones
    const [playerAttacking, setPlayerAttacking] = useState(false);
    const [opponentAttacking, setOpponentAttacking] = useState(false);
    const [playerDamaged, setPlayerDamaged] = useState(false);
    const [opponentDamaged, setOpponentDamaged] = useState(false);

    // Referencias para audio
    const attackSoundRef = useRef(null);
    const hitSoundRef = useRef(null);
    const battleMusicRef = useRef(null);
    const lowHpSoundRef = useRef(null);
    const victorySoundRef = useRef(null);

    // Obtener los Pokémon activos
    const playerActivePokemon = playerTeam[playerActivePokemonIndex] || null;
    const opponentActivePokemon = opponentTeam[opponentActivePokemonIndex] || null;

    // Función auxiliar para obtener un ID de Pokémon aleatorio
    const getRandomPokemonId = useCallback((excludeIds, totalPokemon = 1017) => {
        let randomId;
        do {
            randomId = Math.floor(Math.random() * totalPokemon) + 1;
        } while (excludeIds.includes(randomId));
        return randomId;
    }, []);

    // --- EFECTO DE CARGA INICIAL DE LA BATALLA ---
    useEffect(() => {
        const loadBattlePokemon = async () => {
            if (!pokemonId1 || !pokemonId2) {
                navigate('/battle');
                return;
            }

            try {
                setBattleLog(["Iniciando Batalla..."]);
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
    }, [pokemonId1, pokemonId2, navigate, getRandomPokemonId]);

    // --- EFECTO PARA MONITOREAR EL HP DE LOS POKÉMON ---
    useEffect(() => {
        if (playerTeam.length === 0 || opponentTeam.length === 0) return;

        const checkFaintedPokemons = () => {
            const currentAlivePlayerPokemons = playerTeam.filter(p => p.hp > 0);
            const currentAliveOpponentPokemons = opponentTeam.filter(p => p.hp > 0);

            // Verificar si el equipo del jugador fue debilitado
             if (currentAlivePlayerPokemons.length === 0 && !battleEnded) {
                setBattleLog(prev => [...prev, "¡Tu equipo ha sido debilitado! Has perdido la batalla."]);
                setBattleEnded(true);
                setAwaitingPlayerSwitch(false);
                setAwaitingOpponentSwitch(false);
                stopSound(battleMusicRef);
                stopSound(lowHpSoundRef);
                return;
            }

            // Verificar si el equipo del oponente fue debilitado
            if (currentAliveOpponentPokemons.length === 0 && !battleEnded) {
                setBattleLog(prev => [...prev, "¡El equipo rival ha sido debilitado! ¡Has ganado la batalla!"]);
                setBattleEnded(true);
                setAwaitingPlayerSwitch(false);
                setAwaitingOpponentSwitch(false);
                stopSound(battleMusicRef);
                stopSound(lowHpSoundRef);
                playSound(victorySoundRef, 0.7);
                return;
            }

            // Comprobar si el Pokémon activo del jugador se debilitó
           if (playerActivePokemon && playerActivePokemon.hp <= 0 && !awaitingPlayerSwitch && !battleEnded) {
                stopSound(lowHpSoundRef);

                if (currentAlivePlayerPokemons.length > 0) {
                    setBattleLog(prev => [...prev, `${playerActivePokemon.name?.toUpperCase()} ha sido debilitado. ¡Cambiando automáticamente!`]);
                    setAwaitingPlayerSwitch(true);
                    setIsPlayersTurn(true);

                    // Cambio automático al siguiente Pokémon vivo
                    const nextAliveIndex = playerTeam.findIndex((p, idx) => p.hp > 0 && idx !== playerActivePokemonIndex);
                    if (nextAliveIndex >= 0) {
                        setTimeout(() => {
                            handleSwitchPokemon(nextAliveIndex, true);
                        }, 1000);
                    }
                }
                return;
            }

            // Comprobar si el Pokémon activo del oponente se debilitó
            if (opponentActivePokemon && opponentActivePokemon.hp <= 0 && !awaitingOpponentSwitch && !battleEnded) {
                if (currentAliveOpponentPokemons.length > 0) {
                    setBattleLog(prev => [...prev, `${opponentActivePokemon.name?.toUpperCase()} ha sido debilitado. ¡El oponente está cambiando!`]);
                    setAwaitingOpponentSwitch(true);
                    setIsPlayersTurn(false);

                    // Cambio automático al siguiente Pokémon vivo del oponente
                    const nextAliveIndex = opponentTeam.findIndex((p, idx) => p.hp > 0 && idx !== opponentActivePokemonIndex);
                    if (nextAliveIndex >= 0) {
                        setTimeout(() => {
                            handleOpponentSwitch(nextAliveIndex, true);
                        }, 1000);
                    }
                }
                return;
            }

            // Control del sonido de baja HP
            if (playerActivePokemon && playerActivePokemon.maxHp && !battleEnded && playerActivePokemon.hp > 0) {
                if (playerActivePokemon.hp / playerActivePokemon.maxHp <= 0.2) {
                    playSound(lowHpSoundRef, 0.7, true);
                } else {
                    stopSound(lowHpSoundRef);
                }
            } else {
                stopSound(lowHpSoundRef);
            }
        };

        const timeoutId = setTimeout(() => {
            checkFaintedPokemons();
        }, 600);

        return () => clearTimeout(timeoutId);
    }, [playerTeam, opponentTeam, battleEnded, awaitingPlayerSwitch, awaitingOpponentSwitch, 
        playerActivePokemon, opponentActivePokemon, victorySoundRef, lowHpSoundRef, battleMusicRef, playerActivePokemonIndex,
        opponentActivePokemonIndex]);

    // --- LÓGICA PARA EL ATAQUE DEL JUGADOR ---
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
    }, [battleEnded, isPlayersTurn, awaitingPlayerSwitch, awaitingOpponentSwitch, animationBlocking,
        playerActivePokemon, opponentActivePokemon, opponentActivePokemonIndex]);

    // --- LÓGICA PARA EL TURNO DEL OPONENTE ---
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
    }, [battleEnded, isPlayersTurn, awaitingPlayerSwitch, animationBlocking,
        playerActivePokemon, opponentActivePokemon, playerActivePokemonIndex]);

    // --- LÓGICA PARA EL CAMBIO DE POKÉMON DEL JUGADOR ---
    const handleSwitchPokemon = useCallback(async (newPokemonIndex, isForced = false) => {
        if (battleEnded || (!isForced && animationBlocking)) return;

        if (newPokemonIndex === playerActivePokemonIndex || newPokemonIndex < 0 || newPokemonIndex >= playerTeam.length) {
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
            setBattleLog(prevLog => [...prevLog, `${prevPokemonName} ha regresado!`]);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setPlayerActivePokemonIndex(newPokemonIndex);
        setAwaitingPlayerSwitch(false);
        stopSound(lowHpSoundRef);

        setBattleLog(prevLog => [...prevLog, `¡Adelante, ${newPokemonName || 'un nuevo Pokémon'}!`]);
        await new Promise(resolve => setTimeout(resolve, 500));

        setAnimationBlocking(false);

        if (!battleEnded) {
            setIsPlayersTurn(false);
            setTurnCount(prev => prev + 1);
        }
    }, [battleEnded, animationBlocking, playerActivePokemonIndex, playerTeam, playerActivePokemon]);

    // --- LÓGICA PARA EL CAMBIO DE POKÉMON DE LA IA ---
    // --- NUEVA FUNCIÓN PARA CAMBIO AUTOMÁTICO DEL OPONENTE ---
    const handleOpponentSwitch = useCallback(async (nextPokemonIndex = null, isForced = false) => {
        if (battleEnded || (!isForced && animationBlocking)) return;

        const availableOpponentPokemon = opponentTeam.filter((p, idx) => p.hp > 0 && idx !== opponentActivePokemonIndex);

        if (availableOpponentPokemon.length > 0) {
            setAnimationBlocking(true);
            
            // Si no se especifica un índice, elegir el primero disponible
            const nextPokemonToSwitch = nextPokemonIndex !== null ? 
                opponentTeam[nextPokemonIndex] : availableOpponentPokemon[0];
            
            const actualNextIndex = nextPokemonIndex !== null ? 
                nextPokemonIndex : opponentTeam.findIndex(p => p.id === nextPokemonToSwitch.id);

            const prevOpponentPokemonName = opponentActivePokemon?.name?.toUpperCase();
            const newOpponentPokemonName = nextPokemonToSwitch?.name?.toUpperCase();

            setBattleLog(prevLog => [...prevLog, `${prevOpponentPokemonName || 'El Pokémon oponente'} ha regresado!`]);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setOpponentActivePokemonIndex(actualNextIndex);
            setAwaitingOpponentSwitch(false);

            setBattleLog(prevLog => [...prevLog, `¡${newOpponentPokemonName || 'Un nuevo Pokémon oponente'} sale a luchar!`]);
            await new Promise(resolve => setTimeout(resolve, 500));

            setAnimationBlocking(false);

            if (!battleEnded) {
                setIsPlayersTurn(true);
                setTurnCount(prev => prev + 1);
            }
        } else {
            setBattleLog(prevLog => [...prevLog, "El oponente no tiene más Pokémon disponibles para cambiar."]);
            setBattleEnded(true);
            setAnimationBlocking(false);
            stopSound(battleMusicRef);
            stopSound(lowHpSoundRef);
            playSound(victorySoundRef, 0.7);
        }
    }, [battleEnded, animationBlocking, opponentTeam, opponentActivePokemonIndex, opponentActivePokemon]);

    // --- EFECTO PARA GESTIONAR EL FLUJO DE TURNOS ---
    useEffect(() => {
        if (battleEnded || animationBlocking) return;

        if (isPlayersTurn) {
            if (playerActivePokemon?.hp <= 0) {
                if (!awaitingPlayerSwitch && playerTeam.filter(p => p.hp > 0).length > 0) {
                    setAwaitingPlayerSwitch(true);
                    setIsPlayersTurn(true);
                }
                return;
            }
            return;
        }

        if (!isPlayersTurn) {
            if (opponentActivePokemon?.hp <= 0) {
                if (!awaitingOpponentSwitch && opponentTeam.filter(p => p.hp > 0).length > 0) {
                    setBattleLog(prev => [...prev, `${opponentActivePokemon.name?.toUpperCase()} se ha debilitado. ¡El oponente debe cambiar!`]);
                    setAwaitingOpponentSwitch(true);
                    setIsPlayersTurn(false);
                }
                return;
            }

            if (awaitingOpponentSwitch) {
                const timeoutId = setTimeout(() => {
                    handleOpponentSwitch();
                }, 1500);
                return () => clearTimeout(timeoutId);
            } else {
                const timeoutId = setTimeout(() => {
                    handleOpponentTurn();
                }, 1500);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [isPlayersTurn, battleEnded, animationBlocking, awaitingPlayerSwitch, awaitingOpponentSwitch,
        playerActivePokemon, opponentActivePokemon, playerTeam, opponentTeam, handleOpponentTurn, handleOpponentSwitch,handleOpponentSwitch,
        handleSwitchPokemon, setAwaitingPlayerSwitch, setAwaitingOpponentSwitch, setBattleLog, setIsPlayersTurn]);

    return {
        playerTeam,
        opponentTeam,
        playerActivePokemonIndex,
        opponentActivePokemonIndex,
        playerActivePokemon,
        opponentActivePokemon,
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