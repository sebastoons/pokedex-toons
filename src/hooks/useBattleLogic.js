// src/hooks/useBattleLogic.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPokemonDetailsByIds } from '../services/pokemonService';
import { calculateDamage } from '../utils/battleUtils';
import analyticsTracker from '../utils/analyticsTracker';

// Función auxiliar simple para evitar errores si audioUtils no existe
const playSound = (ref) => { if(ref && ref.current) console.log("Sonido placeholder"); };
const stopSound = (ref) => { if(ref && ref.current) console.log("Stop placeholder"); };

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

    // Referencias para acceder a los valores actuales sin dependencias
    const player1TeamRef = useRef(player1Team);
    const player2TeamRef = useRef(player2Team);
    
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
            
            analyticsTracker.trackEvent('Cambio Automático', `Jugador ${isPlayer1 ? '1' : '2'} cambió a su último Pokémon: ${lastPokemon.name}`);
            
            return true;
        }
        return false;
    }, [addLog]);
    
    // Lógica de Ataque
    const handleAttackAction = useCallback(async (move) => {
        if (animationBlocking || winner || awaitingSwitch) return;

        if (!move) {
            console.error("Se intentó usar un movimiento inválido.");
            if (!isPlayer1Turn) setIsPlayer1Turn(true);
            return;
        }

        setAnimationBlocking(true);

        const attacker = isPlayer1Turn ? activePokemonP1 : activePokemonP2;
        const defender = isPlayer1Turn ? activePokemonP2 : activePokemonP1;
        
        addLog(`${attacker.name.toUpperCase()} usó ${move.name.toUpperCase()}!`);
        
        const attackerLabel = isPlayer1Turn ? 'Jugador 1' : (gameMode === 'vsIA' ? 'IA' : 'Jugador 2');
        analyticsTracker.trackEvent('Ataque en Batalla', `${attackerLabel} - ${attacker.name} usó ${move.name}`);
        
        const setAttackerAttacking = isPlayer1Turn ? setPokemonP1Attacking : setPokemonP2Attacking;
        setAttackerAttacking(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const { damage, effectivenessMessage } = calculateDamage(attacker, defender, move);

        setAttackerAttacking(false);
        const setDefenderDamaged = isPlayer1Turn ? setPokemonP2Damaged : setPokemonP1Damaged;
        setDefenderDamaged(true);
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
            
            const defenderLabel = isPlayer1Turn ? (gameMode === 'vsIA' ? 'IA' : 'Jugador 2') : 'Jugador 1';
            analyticsTracker.trackEvent('Pokémon Derrotado', `${defender.name} de ${defenderLabel} fue derrotado por ${attacker.name}`);
            
            const remainingTeam = isPlayer1Turn ? player2TeamRef.current : player1TeamRef.current;
            const alivePokemon = remainingTeam.filter(p => p.currentHp > 0);

            if (alivePokemon.length > 0) {
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
        isPlayer1Turn, autoSwitchLastPokemon, gameMode
    ]);

    // Lógica de Cambio de Pokémon
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
        
        const playerLabel = isPlayer1 ? 'Jugador 1' : (gameMode === 'vsIA' ? 'IA' : 'Jugador 2');
        const switchType = wasAwaitingSwitch ? 'forzado' : 'voluntario';
        analyticsTracker.trackEvent('Cambio de Pokémon', `${playerLabel} cambió a ${newPokemon.name} (${switchType})`);
        
        if (!wasAwaitingSwitch) {
            setIsPlayer1Turn(prev => !prev);
        } else {
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
    
    const handlePokemonCircleClick = useCallback((pokemon, isPlayer1 = true) => {
        const canSwitch = (isPlayer1 && (isPlayer1Turn || awaitingSwitch === 'player1')) ||
                          (!isPlayer1 && (!isPlayer1Turn || awaitingSwitch === 'player2'));
        
        if (!pokemon || !canSwitch) return;
        
        handleSwitchPokemon(pokemon, isPlayer1);
    }, [isPlayer1Turn, awaitingSwitch, handleSwitchPokemon]);

    // TURNO DE ATAQUE DE LA IA
    useEffect(() => {
        if (winner || isPlayer1Turn || animationBlocking || awaitingSwitch || gameMode !== 'vsIA') return;

        const iaTurnTimeout = setTimeout(() => {
            if (activePokemonP2 && activePokemonP2.moves && activePokemonP2.moves.length > 0) {
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

            // RECUPERAR MOVIMIENTOS PERSONALIZADOS DEL STATE
            const customMovesP1 = location.state?.customMovesP1 || {};

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

                // INYECTAR MOVIMIENTOS PERSONALIZADOS
                const p1TeamWithHp = p1Details.map(p => ({ 
                    ...p, 
                    currentHp: p.hp, 
                    maxHp: p.hp,
                    // Si hay movimientos personalizados para este ID, úsalos; si no, usa los por defecto
                    moves: customMovesP1[p.id] || p.moves 
                }));
                
                const p2TeamWithHp = p2Details.map(p => ({ 
                    ...p, 
                    currentHp: p.hp, 
                    maxHp: p.hp 
                }));
                
                setPlayer1Team(p1TeamWithHp);
                setPlayer2Team(p2TeamWithHp);
                setActivePokemonP1(p1TeamWithHp[0]);
                setActivePokemonP2(p2TeamWithHp[0]);
                
                addLog(`¡La batalla ha comenzado!`);
                addLog(`${p1TeamWithHp[0].name.toUpperCase()} vs ${p2TeamWithHp[0].name.toUpperCase()}`);
                
                const p1Names = p1TeamWithHp.map(p => p.name).join(', ');
                const p2Names = p2TeamWithHp.map(p => p.name).join(', ');
                analyticsTracker.trackEvent('Batalla Iniciada - Detalle', `Modo: ${mode} | P1: [${p1Names}] vs P2: [${p2Names}]`);

            } catch (error) {
                console.error("Error al preparar la batalla:", error);
                addLog("Error al cargar los datos de la batalla. Vuelve a intentarlo.");
                setWinner('draw');
                analyticsTracker.trackEvent('Error en Batalla', error.message);
            } finally {
                setLoading(false);
            }
        };
        setupBattle();
    }, [location.search, navigate, addLog, location.state]);

    useEffect(() => {
        if (loading || winner) return;
        
        const finalWinner = checkBattleEndConditions(player1Team, player2Team);
        if (finalWinner) {
            setWinner(finalWinner);
            
            const winnerLabel = finalWinner === 'player1' ? 'Jugador 1' : (gameMode === 'vsIA' ? 'IA' : 'Jugador 2');
            const p1Remaining = player1Team.filter(p => p.currentHp > 0).length;
            const p2Remaining = player2Team.filter(p => p.currentHp > 0).length;
            
            analyticsTracker.trackEvent('Batalla Finalizada', `Ganador: ${winnerLabel} | Pokémon restantes - P1: ${p1Remaining}, P2: ${p2Remaining}`);
            
            if (finalWinner === 'player1') {
                addLog("¡Felicidades! ¡Has ganado la batalla!");
            } else {
                addLog("¡Oh no! Has perdido la batalla...");
            }
        }
    }, [player1Team, player2Team, activePokemonP1, loading, winner, addLog, checkBattleEndConditions, gameMode]);

    return {
        loading, winner, battleLog, gameMode,
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking,
        handleAttack: handleAttackAction,
        handleSwitchPokemon,
        handlePokemonCircleClick,
    };
};