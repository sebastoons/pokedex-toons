import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPokemonDetailsByIds } from '../services/pokemonService';
import { calculateDamage } from '../utils/battleUtils';
import { playSound, stopSound } from '../utils/audioUtils';

export const useBattleLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- ESTADOS ---
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

    // --- REFERENCIAS DE AUDIO ---
    const attackSoundRef = useRef(null);
    const hitSoundRef = useRef(null);
    const battleMusicRef = useRef(null);
    const lowHpSoundRef = useRef(null);
    const victorySoundRef = useRef(null);

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
    
    // --- Lógica de Ataque ---
    const handleAttackAction = useCallback(async (move) => {
        if (animationBlocking || winner || awaitingSwitch) return;

        if (!move) {
            console.error("Se intentó usar un movimiento inválido (undefined).");
            // CORREGIDO: No cambiar el turno aquí, solo retornar
            return;
        }

        setAnimationBlocking(true);

        const attacker = isPlayer1Turn ? activePokemonP1 : activePokemonP2;
        const defender = isPlayer1Turn ? activePokemonP2 : activePokemonP1;
        
        addLog(`${attacker.name.toUpperCase()} usó ${move.name.toUpperCase()}!`);
        
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
            
            // CORREGIDO: Verificar equipos actualizados
            const updatedP1Team = isPlayer1Turn ? player1Team.map(p => p.id === defender.id ? {...p, currentHp: newHp} : p) : player1Team;
            const updatedP2Team = isPlayer1Turn ? player2Team : player2Team.map(p => p.id === defender.id ? {...p, currentHp: newHp} : p);
            
            const p1HasPokemonLeft = updatedP1Team.some(p => p.currentHp > 0);
            const p2HasPokemonLeft = updatedP2Team.some(p => p.currentHp > 0);

            if (isPlayer1Turn && p2HasPokemonLeft) {
                // Player 2 necesita cambio forzado
                setAwaitingSwitch('player2');
            } else if (!isPlayer1Turn && p1HasPokemonLeft) {
                // Player 1 necesita cambio forzado
                setAwaitingSwitch('player1');
            } else {
                // No hay más Pokémon, alguien gana
                setWinner(isPlayer1Turn ? 'player1' : 'player2');
            }
        } else {
            setIsPlayer1Turn(prev => !prev);
        }
        
        setAnimationBlocking(false);
    }, [
        animationBlocking, winner, awaitingSwitch, activePokemonP1, activePokemonP2, addLog,
        player1Team, player2Team, attackSoundRef, hitSoundRef, isPlayer1Turn
    ]);

    // --- Lógica de Cambio (CORREGIDA) ---
    const handleSwitchPokemon = useCallback(async (newPokemon, isPlayer1 = true) => {
        if (animationBlocking || winner) return;

        const currentTeam = isPlayer1 ? player1Team : player2Team;
        const activePokemon = isPlayer1 ? activePokemonP1 : activePokemonP2;
        const setActivePokemon = isPlayer1 ? setActivePokemonP1 : setActivePokemonP2;

        if (!newPokemon || newPokemon.id === activePokemon?.id || newPokemon.currentHp <= 0) {
            console.log('Cambio inválido:', {
                newPokemon: newPokemon?.name,
                sameAsCurrent: newPokemon?.id === activePokemon?.id,
                isFainted: newPokemon?.currentHp <= 0
            });
            return;
        }

        // CORREGIDO: Verificación de permisos de cambio más flexible
        const canSwitch = isPlayer1 
            ? (isPlayer1Turn || awaitingSwitch === 'player1')
            : (gameMode === '1vs1' && (!isPlayer1Turn || awaitingSwitch === 'player2')) || (gameMode === 'vsIA' && awaitingSwitch === 'player2');

        console.log('Switch attempt:', {
            player: isPlayer1 ? 'P1' : 'P2',
            canSwitch,
            isPlayer1Turn,
            awaitingSwitch,
            gameMode
        });

        if (!canSwitch) return;
        
        const wasAwaitingSwitch = awaitingSwitch;
        setAnimationBlocking(true);
        setAwaitingSwitch(null);
        
        if (activePokemon) {
            addLog(`${activePokemon.name.toUpperCase()} regresa.`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setActivePokemon(newPokemon);
        addLog(`¡Adelante, ${newPokemon.name.toUpperCase()}!`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // CORREGIDO: Lógica de turnos mejorada
        if (!wasAwaitingSwitch) {
            // Cambio voluntario - cambiar turno
            setIsPlayer1Turn(prev => !prev);
        } else {
            // Cambio forzado - el turno va al jugador que NO hizo el cambio
            if (wasAwaitingSwitch === 'player1') {
                setIsPlayer1Turn(false); // Turno para player2
            } else if (wasAwaitingSwitch === 'player2') {
                setIsPlayer1Turn(true); // Turno para player1
            }
        }
        
        setAnimationBlocking(false);
    }, [
        animationBlocking, winner, player1Team, player2Team, 
        activePokemonP1, activePokemonP2, addLog, awaitingSwitch, 
        isPlayer1Turn, gameMode
    ]);
    
    const handlePokemonCircleClick = (pokemon) => {
        console.log('Circle click for P1:', pokemon?.name);
        if (!pokemon || (!isPlayer1Turn && awaitingSwitch !== 'player1')) return;
        handleSwitchPokemon(pokemon, true);
    };

    // --- Lógica de la IA mejorada ---

    // 1. TURNO DE ATAQUE DE LA IA
    useEffect(() => {
        if (winner || isPlayer1Turn || animationBlocking || awaitingSwitch || gameMode !== 'vsIA') return;

        const iaTurnTimeout = setTimeout(() => {
            if (activePokemonP2 && activePokemonP2.moves && activePokemonP2.moves.length > 0) {
                const availableMoves = activePokemonP2.moves.filter(move => move && move.name);
                if (availableMoves.length > 0) {
                    const chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                    handleAttackAction(chosenMove);
                }
            }
        }, 800);

        return () => clearTimeout(iaTurnTimeout);
    }, [isPlayer1Turn, winner, animationBlocking, awaitingSwitch, gameMode, activePokemonP2, handleAttackAction]);

    // 2. CAMBIO FORZADO DE LA IA (CORREGIDO)
    useEffect(() => {
        if (awaitingSwitch === 'player2' && gameMode === 'vsIA' && !winner) {
            const availablePokemon = player2Team.filter(p => p.currentHp > 0 && p.id !== activePokemonP2?.id);
            console.log('IA needs to switch. Available Pokemon:', availablePokemon.map(p => p.name));
            
            if (availablePokemon.length > 0) {
                const nextPokemon = availablePokemon[0];
                
                const switchTimeout = setTimeout(() => {
                    console.log('IA switching to:', nextPokemon.name);
                    handleSwitchPokemon(nextPokemon, false);
                }, 1500);

                return () => clearTimeout(switchTimeout);
            }
        }
    }, [awaitingSwitch, gameMode, player2Team, winner, activePokemonP2, handleSwitchPokemon]);

    // --- useEffect de Setup y Fin de Batalla ---
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

            } catch (error) {
                console.error("Error al preparar la batalla:", error);
                addLog("Error al cargar los datos de la batalla. Vuelve a intentarlo.");
                setWinner('draw');
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
            if (finalWinner === 'player1') {
                addLog("¡Felicidades! ¡Has ganado la batalla!");
                playSound(victorySoundRef, 0.7);
            } else {
                addLog("¡Oh no! Has perdido la batalla...");
            }
        }
    }, [player1Team, player2Team, activePokemonP1, loading, winner, addLog, manageLowHpSound, battleMusicRef, lowHpSoundRef, victorySoundRef, checkBattleEndConditions]);

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