// src/hooks/useBattleLogic.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPokemonDetailsByIds } from '../services/pokemonService';
import { calculateDamage } from '../utils/battleUtils';
import { playSound, stopSound } from '../utils/audioUtils';

// *** NUEVO: Importar el tracker de analytics ***
import analyticsTracker from '../utils/analyticsTracker';

export const useBattleLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Estados
    const [player1Team, setPlayer1Team] = useState([]);
    const [player2Team, setPlayer2Team] = useState([]);
    const [activePokemonP1, setActivePokemonP1] = useState(null);
    const [activePokemonP2, setActivePokemonP2] = useState(null);
    const [gameMode, setGameMode] = useState('vsIA');
    const [battleLog, setBattleLog] = useState([]);
    const [isPlayer1Turn, setIsPlayer1Turn] = useState(true);
    const [winner, setWinner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [awaitingSwitch, setAwaitingSwitch] = useState(null);
    const [pokemonP1Attacking, setPokemonP1Attacking] = useState(false);
    const [pokemonP2Attacking, setPokemonP2Attacking] = useState(false);
    const [pokemonP1Damaged, setPokemonP1Damaged] = useState(false);
    const [pokemonP2Damaged, setPokemonP2Damaged] = useState(false);
    const [animationBlocking, setAnimationBlocking] = useState(false);

    // Referencias de audio
    const attackSoundRef = useRef(null);
    const hitSoundRef = useRef(null);
    const battleMusicRef = useRef(null);
    const lowHpSoundRef = useRef(null);
    const victorySoundRef = useRef(null);
    
    // Referencias para acceder a los valores actuales sin dependencias
    const player1TeamRef = useRef(player1Team);
    const player2TeamRef = useRef(player2Team);
    
    // Actualizar las referencias cuando cambien los estados
    useEffect(() => {
        player1TeamRef.current = player1Team;
    }, [player1Team]);
    
    useEffect(() => {
        player2TeamRef.current = player2Team;
    }, [player2Team]);

    const addLog = useCallback((message) => {
        setBattleLog(prev => [...prev, message].slice(-15));
    }, []);

    const checkBattleEndConditions = useCallback((p1Team, p2Team) => {
        const p1HasPokemonLeft = p1Team.some(p => p.currentHp > 0);
        const p2HasPokemonLeft = p2Team.some(p => p.currentHp > 0);
        if (p1Team.length > 0 && !p1HasPokemonLeft) return 'player2';
        if (p2Team.length > 0 && !p2HasPokemonLeft) return 'player1';
        return null;
    }, []);
    
    const manageLowHpSound = useCallback(() => {
        if (activePokemonP1 && activePokemonP1.maxHp && activePokemonP1.currentHp > 0) {
            if (activePokemonP1.currentHp / activePokemonP1.maxHp <= 0.2) {
                if (lowHpSoundRef.current?.paused || lowHpSoundRef.current?.ended) {
                    playSound(lowHpSoundRef, 0.7, true);
                }
            } else {
                stopSound(lowHpSoundRef);
            }
        } else {
            stopSound(lowHpSoundRef);
        }
    }, [activePokemonP1, lowHpSoundRef]);

    // --- FUNCIÓN PARA CAMBIO AUTOMÁTICO CUANDO SOLO QUEDA 1 POKÉMON ---
    const autoSwitchLastPokemon = useCallback(async (isPlayer1) => {
        const team = isPlayer1 ? player1TeamRef.current : player2TeamRef.current;
        const alivePokemon = team.filter(p => p.currentHp > 0);
        
        if (alivePokemon.length === 1) {
            const lastPokemon = alivePokemon[0];
            const setActivePokemon = isPlayer1 ? setActivePokemonP1 : setActivePokemonP2;
            
            setAnimationBlocking(true);
            setAwaitingSwitch(null);
            addLog(`¡Adelante, ${lastPokemon.name.toUpperCase()}! ¡Es tu último Pokémon!`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setActivePokemon(lastPokemon);
            setIsPlayer1Turn(isPlayer1);
            setAnimationBlocking(false);
            
            // *** NUEVO: Track cambio automático al último Pokémon ***
            const playerLabel = isPlayer1 ? 'Jugador 1' : 'Jugador 2';
            analyticsTracker.trackEvent('Cambio Automático', `${playerLabel} cambió a su último Pokémon: ${lastPokemon.name}`);
            
            return true;
        }
        return false;
    }, [addLog]);
    
    // Lógica de Ataque
    const handleAttackAction = useCallback(async (move) => {
        if (animationBlocking || winner || awaitingSwitch) return;

        if (!move) {
            console.error("Se intentó usar un movimiento inválido (undefined).");
            if (!isPlayer1Turn) setIsPlayer1Turn(true);
            return;
        }

        setAnimationBlocking(true);

        const attacker = isPlayer1Turn ? activePokemonP1 : activePokemonP2;
        const defender = isPlayer1Turn ? activePokemonP2 : activePokemonP1;
        
        addLog(`${attacker.name.toUpperCase()} usó ${move.name.toUpperCase()}!`);
        
        // *** NUEVO: Track ataque usado ***
        const attackerLabel = isPlayer1Turn ? 'Jugador 1' : (gameMode === 'vsIA' ? 'IA' : 'Jugador 2');
        analyticsTracker.trackEvent('Ataque en Batalla', 
            `${attackerLabel} - ${attacker.name} usó ${move.name}`
        );
        
        const setAttackerAttacking = isPlayer1Turn ? setPokemonP1Attacking : setPokemonP2Attacking;
        setAttackerAttacking(true);
        playSound(attackSoundRef);
        await new Promise(resolve => setTimeout(resolve, 800));

        const { damage, effectivenessMessage } = calculateDamage(attacker, defender, move);

        setAttackerAttacking(false);
        const setDefenderDamaged = isPlayer1Turn ? setPokemonP2Damaged : setPokemonP1Damaged;
        setDefenderDamaged(true);
        playSound(hitSoundRef);
        await new Promise(resolve => setTimeout(resolve, 500));

        const newHp = Math.max(0, defender.currentHp - damage);

        const setDefenderTeam = isPlayer1Turn ? setPlayer2Team : setPlayer1Team;
        const setActiveDefender = isPlayer1Turn ? setActivePokemonP2 : setActivePokemonP1;
        
        setDefenderTeam(prevTeam => prevTeam.map(p => 
            p.id === defender.id ? { ...p, currentHp: newHp } : p
        ));
        setActiveDefender(prev => ({ ...prev, currentHp: newHp }));
        setDefenderDamaged(false);
        
        addLog(`${defender.name.toUpperCase()} recibió ${damage} de daño.`);
        if (effectivenessMessage) addLog(effectivenessMessage);

        await new Promise(resolve => setTimeout(resolve, 500));

        if (newHp === 0) {
            addLog(`${defender.name.toUpperCase()} se ha debilitado!`);
            
            // *** NUEVO: Track Pokémon derrotado ***
            const defenderLabel = isPlayer1Turn ? (gameMode === 'vsIA' ? 'IA' : 'Jugador 2') : 'Jugador 1';
            analyticsTracker.trackEvent('Pokémon Derrotado', 
                `${defender.name} de ${defenderLabel} fue derrotado por ${attacker.name}`
            );
            
            // Usamos las referencias para acceder a los valores actuales
            const remainingTeam = isPlayer1Turn ? player2TeamRef.current : player1TeamRef.current;
            const alivePokemon = remainingTeam.filter(p => p.currentHp > 0);

            if (alivePokemon.length > 0) {
                // Si solo queda 1 Pokémon, cambiarlo automáticamente
                if (alivePokemon.length === 1) {
                    const switchedSuccessfully = await autoSwitchLastPokemon(!isPlayer1Turn);
                    if (!switchedSuccessfully) {
                        setAwaitingSwitch(isPlayer1Turn ? 'player2' : 'player1');
                    }
                } else {
                    setAwaitingSwitch(isPlayer1Turn ? 'player2' : 'player1');
                }
            } else {
                setWinner(isPlayer1Turn ? 'player1' : 'player2');
            }
        } else {
            setIsPlayer1Turn(prev => !prev);
        }
        
        setAnimationBlocking(false);
    }, [
        animationBlocking, winner, awaitingSwitch, activePokemonP1, activePokemonP2, addLog,
        attackSoundRef, hitSoundRef, isPlayer1Turn, autoSwitchLastPokemon, gameMode
    ]);

    // Lógica de Cambio de Pokémon (MEJORADA)
    const handleSwitchPokemon = useCallback(async (newPokemon, isPlayer1 = true) => {
        if (animationBlocking || winner) return;

        const activePokemon = isPlayer1 ? activePokemonP1 : activePokemonP2;
        const setActivePokemon = isPlayer1 ? setActivePokemonP1 : setActivePokemonP2;

        if (!newPokemon || newPokemon.id === activePokemon?.id || newPokemon.currentHp <= 0) {
            return;
        }
        
        const wasAwaitingSwitch = awaitingSwitch;
        setAnimationBlocking(true);
        setAwaitingSwitch(null);
        
        if (activePokemon) {
            addLog(`${activePokemon.name.toUpperCase()} regresa.`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setActivePokemon(newPokemon);
        addLog(`¡Adelante, ${newPokemon.name.toUpperCase()}!`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // *** NUEVO: Track cambio de Pokémon ***
        const playerLabel = isPlayer1 ? 'Jugador 1' : (gameMode === 'vsIA' ? 'IA' : 'Jugador 2');
        const switchType = wasAwaitingSwitch ? 'forzado' : 'voluntario';
        analyticsTracker.trackEvent('Cambio de Pokémon', 
            `${playerLabel} cambió a ${newPokemon.name} (${switchType})`
        );
        
        // CORRECCIÓN: Manejo mejorado de turnos
        if (!wasAwaitingSwitch) {
            // Cambio voluntario durante el turno
            setIsPlayer1Turn(prev => !prev);
        } else {
            // Cambio forzado después de que un Pokémon se debilite
            if (wasAwaitingSwitch === 'player1') {
                setIsPlayer1Turn(true);
            } else if (wasAwaitingSwitch === 'player2') {
                setIsPlayer1Turn(false);
            }
        }
        
        setAnimationBlocking(false);
    }, [
        animationBlocking, winner, activePokemonP1, activePokemonP2,
        addLog, awaitingSwitch, gameMode
    ]);
    
    // CORRECCIÓN: Función para manejar clicks en círculos de Pokémon
    const handlePokemonCircleClick = useCallback((pokemon, isPlayer1 = true) => {
        // Verificar si es el turno correcto o si está esperando un cambio
        const canSwitch = (isPlayer1 && (isPlayer1Turn || awaitingSwitch === 'player1')) ||
                         (!isPlayer1 && (!isPlayer1Turn || awaitingSwitch === 'player2'));
        
        if (!pokemon || !canSwitch) return;
        
        handleSwitchPokemon(pokemon, isPlayer1);
    }, [isPlayer1Turn, awaitingSwitch, handleSwitchPokemon]);

    // TURNO DE ATAQUE DE LA IA (más rápido)
    useEffect(() => {
        if (winner || isPlayer1Turn || animationBlocking || awaitingSwitch || gameMode !== 'vsIA') return;

        const iaTurnTimeout = setTimeout(() => {
            if (activePokemonP2 && activePokemonP2.moves.length > 0) {
                const chosenMove = activePokemonP2.moves[Math.floor(Math.random() * activePokemonP2.moves.length)];
                handleAttackAction(chosenMove);
            }
        }, 800);

        return () => clearTimeout(iaTurnTimeout);
    }, [isPlayer1Turn, winner, animationBlocking, awaitingSwitch, gameMode, activePokemonP2, handleAttackAction]);

    // CAMBIO FORZADO DE LA IA
    useEffect(() => {
        if (awaitingSwitch === 'player2' && gameMode === 'vsIA' && !winner) {
            const availablePokemon = player2Team.filter(p => p.currentHp > 0);
            if (availablePokemon.length > 0) {
                // Si solo queda 1 Pokémon, usar cambio automático
                if (availablePokemon.length === 1) {
                    autoSwitchLastPokemon(false);
                } else {
                    const nextPokemon = availablePokemon[0];
                    const switchTimeout = setTimeout(() => {
                        handleSwitchPokemon(nextPokemon, false);
                    }, 1500);
                    return () => clearTimeout(switchTimeout);
                }
            }
        }
    }, [awaitingSwitch, gameMode, player2Team, winner, handleSwitchPokemon, autoSwitchLastPokemon]);

    // useEffect de Setup y Fin de Batalla
    useEffect(() => {
        const setupBattle = async () => {
            setLoading(true);
            setBattleLog([]);
            const params = new URLSearchParams(location.search);
            const p1Ids = params.get('p1')?.split(',').map(Number);
            const p2Ids = params.get('p2')?.split(',').map(Number);
            const mode = params.get('mode') || 'vsIA';

            if (!p1Ids || !p2Ids || p1Ids.length === 0 || p2Ids.length === 0) {
                navigate('/');
                return;
            }

            setGameMode(mode);
            try {
                addLog("Cargando Pokémon para la batalla...");
                const [p1Details, p2Details] = await Promise.all([
                    fetchPokemonDetailsByIds(p1Ids),
                    fetchPokemonDetailsByIds(p2Ids)
                ]);

                if (p1Details.length === 0 || p2Details.length === 0) {
                    throw new Error("No se pudieron cargar los datos de uno o ambos equipos.");
                }

                const p1TeamWithHp = p1Details.map(p => ({ ...p, currentHp: p.hp, maxHp: p.hp }));
                const p2TeamWithHp = p2Details.map(p => ({ ...p, currentHp: p.hp, maxHp: p.hp }));
                
                setPlayer1Team(p1TeamWithHp);
                setPlayer2Team(p2TeamWithHp);
                setActivePokemonP1(p1TeamWithHp[0]);
                setActivePokemonP2(p2TeamWithHp[0]);
                
                addLog(`¡La batalla ha comenzado!`);
                addLog(`${p1TeamWithHp[0].name.toUpperCase()} vs ${p2TeamWithHp[0].name.toUpperCase()}`);
                playSound(battleMusicRef, 0.3, true);
                
                // *** NUEVO: Track inicio de batalla con detalles de equipos ***
                const p1Names = p1TeamWithHp.map(p => p.name).join(', ');
                const p2Names = p2TeamWithHp.map(p => p.name).join(', ');
                analyticsTracker.trackEvent('Batalla Iniciada - Detalle', 
                    `Modo: ${mode} | P1: [${p1Names}] vs P2: [${p2Names}]`
                );

            } catch (error) {
                console.error("Error al preparar la batalla:", error);
                addLog("Error al cargar los datos de la batalla. Vuelve a intentarlo.");
                setWinner('draw');
                
                // *** NUEVO: Track error en batalla ***
                analyticsTracker.trackEvent('Error en Batalla', error.message);
            } finally {
                setLoading(false);
            }
        };
        setupBattle();
        
        return () => {
            stopSound(battleMusicRef);
            stopSound(lowHpSoundRef);
            stopSound(victorySoundRef);
        };
    }, [location.search, navigate, addLog]);

    useEffect(() => {
        if (loading || winner) return;
        
        if (activePokemonP1) manageLowHpSound();

        const finalWinner = checkBattleEndConditions(player1Team, player2Team);
        if (finalWinner) {
            setWinner(finalWinner);
            stopSound(battleMusicRef);
            stopSound(lowHpSoundRef);
            
            // *** NUEVO: Track fin de batalla con estadísticas ***
            const winnerLabel = finalWinner === 'player1' ? 'Jugador 1' : (gameMode === 'vsIA' ? 'IA' : 'Jugador 2');
            const p1Remaining = player1Team.filter(p => p.currentHp > 0).length;
            const p2Remaining = player2Team.filter(p => p.currentHp > 0).length;
            
            analyticsTracker.trackEvent('Batalla Finalizada', 
                `Ganador: ${winnerLabel} | Pokémon restantes - P1: ${p1Remaining}, P2: ${p2Remaining}`
            );
            
            if (finalWinner === 'player1') {
                addLog("¡Felicidades! ¡Has ganado la batalla!");
                playSound(victorySoundRef, 0.7);
            } else {
                addLog("¡Oh no! Has perdido la batalla...");
            }
        }
    }, [player1Team, player2Team, activePokemonP1, loading, winner, addLog, manageLowHpSound, battleMusicRef, lowHpSoundRef, victorySoundRef, checkBattleEndConditions, gameMode]);

    return {
        loading, winner, battleLog, gameMode,
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking,
        attackSoundRef, hitSoundRef, battleMusicRef, lowHpSoundRef, victorySoundRef,
        handleAttack: handleAttackAction,
        handleSwitchPokemon,
        handlePokemonCircleClick,
    };
};