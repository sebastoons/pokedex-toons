// src/hooks/useBattleLogic.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPokemonDetailsByIds } from '../services/pokemonService';
import { calculateDamage } from '../utils/battleUtils';
import { playSound, stopSound } from '../utils/audioUtils';

export const useBattleLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- ESTADOS PRINCIPALES DE LA BATALLA ---
    const [player1Team, setPlayer1Team] = useState([]);
    const [player2Team, setPlayer2Team] = useState([]);
    const [activePokemonP1, setActivePokemonP1] = useState(null);
    const [activePokemonP2, setActivePokemonP2] = useState(null);
    const [gameMode, setGameMode] = useState('vsIA'); // 'vsIA' o 'vsPlayer'
    const [battleLog, setBattleLog] = useState([]);
    const [isPlayer1Turn, setIsPlayer1Turn] = useState(true);
    const [winner, setWinner] = useState(null); // null, 'player1', 'player2', 'draw'
    const [loading, setLoading] = useState(true);
    const [awaitingSwitch, setAwaitingSwitch] = useState(null); // 'player1', 'player2', or null
    
    // Estados para animaciones
    const [pokemonP1Attacking, setPokemonP1Attacking] = useState(false);
    const [pokemonP2Attacking, setPokemonP2Attacking] = useState(false);
    const [pokemonP1Damaged, setPokemonP1Damaged] = useState(false);
    const [pokemonP2Damaged, setPokemonP2Damaged] = useState(false);
    const [animationBlocking, setAnimationBlocking] = useState(false); // Bloquea acciones durante animaciones

    // --- REFERENCIAS DE AUDIO ---
    const attackSoundRef = useRef(null);
    const hitSoundRef = useRef(null);
    const battleMusicRef = useRef(null);
    const lowHpSoundRef = useRef(null);
    const victorySoundRef = useRef(null);

    // --- FUNCIONES AUXILIARES DE LÓGICA DE BATALLA ---

    // Añade un mensaje al log (limitado a 10 entradas para evitar sobrecarga)
    const addLog = useCallback((message) => {
        setBattleLog(prev => [message, ...prev].slice(0, 10));
    }, []);

    // Comprueba las condiciones de fin de batalla
    const checkBattleEndConditions = useCallback((p1Team, p2Team) => {
        const p1HasPokemonLeft = p1Team.some(p => p.currentHp > 0);
        const p2HasPokemonLeft = p2Team.some(p => p.currentHp > 0);

        if (!p1HasPokemonLeft) return 'player2'; // P1 sin Pokémon, P2 gana
        if (!p2HasPokemonLeft) return 'player1'; // P2 sin Pokémon, P1 gana
        return null; // La batalla continúa
    }, []);

    // Gestiona el sonido de baja HP para el Pokémon activo del jugador 1
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


    // --- EFECTO: INICIALIZACIÓN DE LA BATALLA ---
    useEffect(() => {
        const setupBattle = async () => {
            setLoading(true);
            const params = new URLSearchParams(location.search);
            const p1Ids = params.get('p1')?.split(',').map(Number);
            const p2Ids = params.get('p2')?.split(',').map(Number);
            const mode = params.get('mode') || 'vsIA';

            if (!p1Ids || !p2Ids || p1Ids.length === 0 || p2Ids.length === 0) {
                navigate('/'); // Redirige si no hay IDs válidos
                return;
            }

            setGameMode(mode);
            try {
                addLog("Cargando Pokémon para la batalla...");
                const [p1Details, p2Details] = await Promise.all([
                    fetchPokemonDetailsByIds(p1Ids),
                    fetchPokemonDetailsByIds(p2Ids)
                ]);

                // Añadir currentHp y maxHp a los Pokémon
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
                addLog("Error al cargar los datos de la batalla.");
                setWinner('draw'); // En caso de error, declarar empate o manejar de otra forma
            } finally {
                setLoading(false);
                setAnimationBlocking(false);
                setIsPlayer1Turn(true); // Siempre empieza el jugador 1
            }
        };
        setupBattle();
        
        // Función de limpieza para detener la música al salir del componente
        return () => {
            stopSound(battleMusicRef);
            stopSound(lowHpSoundRef);
            stopSound(victorySoundRef);
        };
    }, [location.search, navigate, addLog, battleMusicRef, lowHpSoundRef, victorySoundRef]);


    // --- FUNCIÓN PRINCIPAL DE ATAQUE (para Jugador 1 y Jugador 2/IA) ---
    const handleAttackAction = useCallback(async (move, isP1Attacker = true) => {
        if (animationBlocking || winner || awaitingSwitch) return false;

        setAnimationBlocking(true); // Bloquear acciones durante la animación

        const attacker = isP1Attacker ? activePokemonP1 : activePokemonP2;
        const defender = isP1Attacker ? activePokemonP2 : activePokemonP1;
        const setDefenderTeam = isP1Attacker ? setPlayer2Team : setPlayer1Team;
        const setActiveDefender = isP1Attacker ? setActivePokemonP2 : setActivePokemonP1;
        const setAttackerAttacking = isP1Attacker ? setPokemonP1Attacking : setPokemonP2Attacking;
        const setDefenderDamaged = isP1Attacker ? setPokemonP2Damaged : setPokemonP1Damaged;

        if (!attacker || !defender) {
            addLog("Error: Pokémon activo no encontrado para el ataque.");
            setAnimationBlocking(false);
            return false;
        }
        if (!move) {
            addLog("Error: Movimiento inválido o no encontrado.");
            setAnimationBlocking(false);
            return false;
        }

        addLog(`${attacker.name.toUpperCase()} usó ${move.name.toUpperCase()}!`);
        setAttackerAttacking(true); // Inicia animación de ataque
        playSound(attackSoundRef);
        await new Promise(resolve => setTimeout(resolve, 800)); // Esperar animación de ataque

        const { damage, effectivenessMessage } = calculateDamage(attacker, defender, move);

        setAttackerAttacking(false); // Termina animación de ataque
        setDefenderDamaged(true); // Inicia animación de daño
        playSound(hitSoundRef);
        await new Promise(resolve => setTimeout(resolve, 500)); // Esperar animación de daño

        const newHp = Math.max(0, defender.currentHp - damage);
        setActiveDefender(prev => prev ? { ...prev, currentHp: newHp } : null); // Actualizar HP del Pokémon activo
        setDefenderTeam(prevTeam => prevTeam.map(p => 
            p.id === defender.id ? { ...p, currentHp: newHp } : p
        )); // Actualizar HP en el equipo

        setDefenderDamaged(false); // Termina animación de daño
        addLog(`${defender.name.toUpperCase()} recibió ${damage} de daño.`);
        if (effectivenessMessage) {
            addLog(effectivenessMessage);
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa

        setAnimationBlocking(false); // Desbloquear acciones

        if (newHp === 0) {
            addLog(`${defender.name.toUpperCase()} se ha debilitado!`);
            const remainingPokemon = (isP1Attacker ? player2Team : player1Team).filter(p => p.id !== defender.id && p.currentHp > 0);
            if (remainingPokemon.length > 0) {
                setAwaitingSwitch(isP1Attacker ? 'player2' : 'player1'); // Forzar cambio de Pokémon
            } else {
                setWinner(isP1Attacker ? 'player1' : 'player2');
                stopSound(battleMusicRef);
                playSound(victorySoundRef, 0.7);
            }
            return true; // Se ha debilitado un Pokémon
        } else {
            if (!winner) { // Si la batalla no ha terminado
                setIsPlayer1Turn(prev => !prev); // Cambiar turno
            }
            return false; // No se ha debilitado un Pokémon
        }
    }, [
        animationBlocking, winner, awaitingSwitch, activePokemonP1, activePokemonP2, addLog,
        player1Team, player2Team, attackSoundRef, hitSoundRef, battleMusicRef, victorySoundRef,
        setPlayer1Team, setPlayer2Team, setActivePokemonP1, setActivePokemonP2, 
        setPokemonP1Attacking, setPokemonP2Attacking, setPokemonP1Damaged, setPokemonP2Damaged,
        setAnimationBlocking, setIsPlayer1Turn, setAwaitingSwitch, setWinner
    ]);
    // --- FUNCIÓN DE CAMBIO DE POKÉMON ---
    const handleSwitchPokemon = useCallback(async (newPokemonId, isPlayer1 = true) => {
        if (animationBlocking || winner) return false;

        const currentTeam = isPlayer1 ? player1Team : player2Team;
        const currentActive = isPlayer1 ? activePokemonP1 : activePokemonP2;
        const setActive = isPlayer1 ? setActivePokemonP1 : setActivePokemonP2;

        const newPokemon = currentTeam.find(p => p.id === newPokemonId);

        if (!newPokemon || newPokemon.currentHp <= 0) {
            addLog("No puedes cambiar a un Pokémon debilitado o inválido.");
            return false;
        }
        if (newPokemon.id === currentActive?.id) {
            addLog("Este Pokémon ya está en combate.");
            return false;
        }

        setAnimationBlocking(true);
        addLog(`${currentActive?.name.toUpperCase()} regresa.`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setActive(newPokemon); // Establecer el nuevo Pokémon activo
        setAwaitingSwitch(null); // Borrar el estado de espera de cambio
        addLog(`¡Adelante, ${newPokemon.name.toUpperCase()}!`);
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnimationBlocking(false);

        stopSound(lowHpSoundRef); // Detener sonido de HP bajo si estaba activo

        if (!winner) {
            setIsPlayer1Turn(prev => !prev); // El cambio consume el turno
        }
        return true;
    }, [
        animationBlocking, winner, player1Team, player2Team, activePokemonP1, activePokemonP2,
        addLog, lowHpSoundRef, setIsPlayer1Turn, setAwaitingSwitch, setActivePokemonP1, setActivePokemonP2
    ]);


    // --- EFECTO: LÓGICA DE LA IA (Turno del Jugador 2 en modo vsIA) ---
    useEffect(() => {
        if (loading || winner || animationBlocking) return;

        // Si es el turno del Jugador 2 y estamos en modo vsIA
        if (!isPlayer1Turn && gameMode === 'vsIA') {
            const opponentActive = activePokemonP2;
            const playerActive = activePokemonP1;

            if (!opponentActive || !playerActive) return;

            // La IA necesita cambiar de Pokémon si el suyo está debilitado
            if (opponentActive.currentHp <= 0 || awaitingSwitch === 'player2') {
                const availablePokemon = player2Team.filter(p => p.currentHp > 0 && p.id !== opponentActive.id);
                if (availablePokemon.length > 0) {
                    const chosenPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
                    addLog(`El oponente está cambiando a ${chosenPokemon.name.toUpperCase()}...`);
                    // Pequeño retraso para que el mensaje se lea
                    setTimeout(() => {
                        handleSwitchPokemon(chosenPokemon.id, false); // false = es el Jugador 2 (IA)
                    }, 1500);
                } else {
                    // Si no hay Pokémon disponibles, la batalla debería haber terminado
                    // Esto es una medida de seguridad, checkBattleEndConditions ya debería haberlo capturado
                    setWinner('player1');
                }
                return;
            }

            // Si la IA no necesita cambiar, entonces ataca
            if (!awaitingSwitch) {
                // Elegir un movimiento aleatorio
                const chosenMove = opponentActive.moves[Math.floor(Math.random() * opponentActive.moves.length)];
                if (chosenMove) {
                    // Pequeño retraso para simular "pensamiento" de la IA
                    const timeoutId = setTimeout(() => {
                        handleAttackAction(chosenMove, false); // false = es el Jugador 2 (IA)
                    }, 2000);
                    return () => clearTimeout(timeoutId);
                }
            }
        }
    }, [
        loading, winner, animationBlocking, isPlayer1Turn, gameMode,
        activePokemonP1, activePokemonP2, player2Team, awaitingSwitch,
        addLog, handleSwitchPokemon, handleAttackAction
    ]);

    // --- EFECTO: Gestionar sonido de HP bajo y condiciones de fin de batalla ---
    useEffect(() => {
        if (loading || winner || animationBlocking) return;
        
        // Ejecutar si hay un Pokémon activo del jugador
        if (activePokemonP1 && activePokemonP1.currentHp !== undefined) {
            manageLowHpSound();
        }

        // Comprobar fin de batalla
        const finalWinner = checkBattleEndConditions(player1Team, player2Team);
        if (finalWinner && !winner) { // Solo si hay un ganador y no se ha establecido ya
            setWinner(finalWinner);
            if (finalWinner === 'player1') {
                addLog("¡Felicidades! ¡Has ganado la batalla!");
                stopSound(battleMusicRef);
                playSound(victorySoundRef, 0.7);
            } else if (finalWinner === 'player2') {
                addLog("¡Oh no! Has perdido la batalla...");
                stopSound(battleMusicRef);
            }
            stopSound(lowHpSoundRef); // Asegurarse de parar el sonido de low HP
        }

    }, [
        loading, winner, animationBlocking, activePokemonP1, player1Team, player2Team,
        addLog, checkBattleEndConditions, manageLowHpSound, battleMusicRef, victorySoundRef, lowHpSoundRef
    ]);


    // --- VALORES EXPUESTOS POR EL HOOK ---
    return {
        // Datos de la batalla
        loading, winner, battleLog, gameMode,
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,

        // Estados de animación
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking, // Útil para deshabilitar controles durante animaciones/turnos de la IA

        // Referencias de audio
        attackSoundRef, hitSoundRef, battleMusicRef, lowHpSoundRef, victorySoundRef,

        // Funciones de acción
        handleAttack: handleAttackAction, // Renombrado para claridad
        handleSwitchPokemon,
        // navigate, // Si necesitas navegar desde fuera del hook
    };
};