// src/hooks/useBattleLogic.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPokemonDetailsByIds } from '../services/pokemonService';
import { calculateDamage } from '../utils/battleUtils';
import analyticsTracker from '../utils/analyticsTracker';

const STRUGGLE = { name: 'Forcejeo', power: 50, accuracy: 100, type: 'normal', damage_class: 'physical', currentPP: Infinity, maxPP: Infinity };

const TYPE_TO_STATUS = {
    poison: 'poisoned', bug: 'poisoned',
    electric: 'paralyzed', fire: 'burned',
};

const getStatusEffect = (move) => {
    if (!move) return null;
    const status = TYPE_TO_STATUS[move.type];
    if (!status) return null;
    return { status, chance: move.damage_class === 'status' ? 0.7 : 0.2 };
};

const defaultPP = (move) => {
    if (!move || move.damage_class === 'status' || (move.power ?? 0) === 0) return 20;
    if ((move.power ?? 0) > 100) return 8;
    if ((move.power ?? 0) > 70)  return 12;
    return 16;
};

const addPP = (moves) => (moves || []).map(m => {
    const pp = defaultPP(m);
    return { ...m, maxPP: pp, currentPP: pp };
});

const initPokemon = (p, moves) => ({
    ...p,
    currentHp: p.hp, maxHp: p.hp,
    status: null, attackStage: 0, defenseStage: 0,
    moves: addPP(moves || p.moves),
});

export const useBattleLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
    const [bag, setBag] = useState({ potions: 3, fullRestore: 1 });
    const [floatingMsg, setFloatingMsg] = useState(null);
    const [lastAttack, setLastAttack] = useState(null);

    const player1TeamRef = useRef(player1Team);
    const player2TeamRef = useRef(player2Team);
    const floatingMsgTimerRef = useRef(null);

    useEffect(() => { player1TeamRef.current = player1Team; }, [player1Team]);
    useEffect(() => { player2TeamRef.current = player2Team; }, [player2Team]);

    const addLog = useCallback((message) => {
        setBattleLog(prev => [...prev, message].slice(-15));
    }, []);

    const showFloatingMessage = useCallback((text, type) => {
        if (floatingMsgTimerRef.current) clearTimeout(floatingMsgTimerRef.current);
        setFloatingMsg({ text, type });
        floatingMsgTimerRef.current = setTimeout(() => setFloatingMsg(null), 2200);
    }, []);

    const checkBattleEndConditions = useCallback((p1Team, p2Team) => {
        if (p1Team.length > 0 && !p1Team.some(p => p.currentHp > 0)) return 'player2';
        if (p2Team.length > 0 && !p2Team.some(p => p.currentHp > 0)) return 'player1';
        return null;
    }, []);

    const autoSwitchLastPokemon = useCallback(async (isPlayer1) => {
        const team = isPlayer1 ? player1TeamRef.current : player2TeamRef.current;
        const alivePokemon = team.filter(p => p.currentHp > 0);
        if (alivePokemon.length === 1) {
            const last = alivePokemon[0];
            setAnimationBlocking(true);
            setAwaitingSwitch(null);
            addLog(`¡Adelante, ${last.name.toUpperCase()}! ¡Es tu último Pokémon!`);
            await new Promise(r => setTimeout(r, 1000));
            (isPlayer1 ? setActivePokemonP1 : setActivePokemonP2)(last);
            setIsPlayer1Turn(isPlayer1);
            setAnimationBlocking(false);
            return true;
        }
        return false;
    }, [addLog]);

    const handleAttackAction = useCallback(async (move) => {
        if (animationBlocking || winner || awaitingSwitch) return;
        if (!move) { if (!isPlayer1Turn) setIsPlayer1Turn(true); return; }

        setAnimationBlocking(true);

        const attacker = isPlayer1Turn ? activePokemonP1 : activePokemonP2;
        const defender = isPlayer1Turn ? activePokemonP2 : activePokemonP1;

        // Parálisis
        if (attacker.status === 'paralyzed' && Math.random() < 0.25) {
            addLog(`¡${attacker.name.toUpperCase()} está paralizado y no puede moverse!`);
            await new Promise(r => setTimeout(r, 900));
            setIsPlayer1Turn(prev => !prev);
            setAnimationBlocking(false);
            return;
        }

        // PP check → Forcejeo si todos en 0
        const moveInTeam = attacker.moves?.find(m => m.name === move.name);
        const usedMove = (moveInTeam && (moveInTeam.currentPP ?? 1) <= 0) ? STRUGGLE : move;

        // Deducir PP
        if (usedMove !== STRUGGLE && moveInTeam) {
            const updatedMoves = attacker.moves.map(m =>
                m.name === usedMove.name ? { ...m, currentPP: Math.max(0, (m.currentPP ?? 1) - 1) } : m
            );
            const setAtk = isPlayer1Turn ? setPlayer1Team : setPlayer2Team;
            const setActiveAtk = isPlayer1Turn ? setActivePokemonP1 : setActivePokemonP2;
            setAtk(prev => prev.map(p => p.id === attacker.id ? { ...p, moves: updatedMoves } : p));
            setActiveAtk(prev => ({ ...prev, moves: updatedMoves }));
        }

        addLog(`${attacker.name.toUpperCase()} usó ${usedMove.name.toUpperCase()}!`);
        analyticsTracker.trackEvent('Ataque', `${attacker.name} → ${usedMove.name}`);

        // Stat change moves
        if (usedMove.statChange) {
            const { stat, stages, target } = usedMove.statChange;
            const statKey = stat === 'attack' ? 'attackStage' : 'defenseStage';
            const tgtIsP1 = target === 'self' ? isPlayer1Turn : !isPlayer1Turn;
            const tgtPoke = target === 'self' ? attacker : defender;
            const newStage = Math.max(-6, Math.min(6, (tgtPoke[statKey] ?? 0) + stages));
            const setTgt = tgtIsP1 ? setPlayer1Team : setPlayer2Team;
            const setActiveTgt = tgtIsP1 ? setActivePokemonP1 : setActivePokemonP2;
            setTgt(prev => prev.map(p => p.id === tgtPoke.id ? { ...p, [statKey]: newStage } : p));
            setActiveTgt(prev => ({ ...prev, [statKey]: newStage }));
            const dir = stages > 0 ? 'subió' : 'bajó';
            const statLabel = stat === 'attack' ? 'ATAQUE' : 'DEFENSA';
            addLog(`¡El ${statLabel} de ${tgtPoke.name.toUpperCase()} ${dir}!`);
            setLastAttack({ side: isPlayer1Turn ? 'p1' : 'p2', moveType: usedMove.type });
            await new Promise(r => setTimeout(r, 800));
            setIsPlayer1Turn(prev => !prev);
            setAnimationBlocking(false);
            return;
        }

        // Animación de ataque
        (isPlayer1Turn ? setPokemonP1Attacking : setPokemonP2Attacking)(true);
        setLastAttack({ side: isPlayer1Turn ? 'p1' : 'p2', moveType: usedMove.type, ts: Date.now() });
        await new Promise(r => setTimeout(r, 800));

        const { damage, effectivenessMessage, isCritical } = calculateDamage(attacker, defender, usedMove);

        (isPlayer1Turn ? setPokemonP1Attacking : setPokemonP2Attacking)(false);
        (isPlayer1Turn ? setPokemonP2Damaged : setPokemonP1Damaged)(true);
        await new Promise(r => setTimeout(r, 500));

        if (isCritical && damage > 0) addLog('¡Golpe crítico!');

        const newHp = Math.max(0, defender.currentHp - damage);

        // Estado al defensor
        let newDefStatus = defender.status;
        const statusEffect = getStatusEffect(usedMove);
        if (statusEffect && !defender.status && newHp > 0 && Math.random() < statusEffect.chance) {
            newDefStatus = statusEffect.status;
            const snames = { poisoned: 'envenenado', paralyzed: 'paralizado', burned: 'quemado' };
            addLog(`¡${defender.name.toUpperCase()} quedó ${snames[newDefStatus]}!`);
        }

        const setDefTeam = isPlayer1Turn ? setPlayer2Team : setPlayer1Team;
        const setActiveDef = isPlayer1Turn ? setActivePokemonP2 : setActivePokemonP1;
        setDefTeam(prev => prev.map(p => p.id === defender.id ? { ...p, currentHp: newHp, status: newDefStatus } : p));
        setActiveDef(prev => ({ ...prev, currentHp: newHp, status: newDefStatus }));
        (isPlayer1Turn ? setPokemonP2Damaged : setPokemonP1Damaged)(false);

        addLog(`${defender.name.toUpperCase()} recibió ${damage} de daño.`);

        if (effectivenessMessage) {
            addLog(effectivenessMessage);
            if (effectivenessMessage.includes('súper') || effectivenessMessage.includes('cuádruple'))
                showFloatingMessage(effectivenessMessage, 'super');
            else if (effectivenessMessage.includes('efecto'))
                showFloatingMessage(effectivenessMessage, 'noeffect');
            else if (effectivenessMessage.includes('efectiv'))
                showFloatingMessage(effectivenessMessage, 'resistant');
        }

        await new Promise(r => setTimeout(r, 500));

        if (newHp === 0) {
            addLog(`${defender.name.toUpperCase()} se ha debilitado!`);
            analyticsTracker.trackEvent('Pokémon Derrotado', `${defender.name} por ${attacker.name}`);
            const remaining = (isPlayer1Turn ? player2TeamRef.current : player1TeamRef.current).filter(p => p.currentHp > 0);
            if (remaining.length > 0) {
                if (remaining.length === 1) {
                    const ok = await autoSwitchLastPokemon(!isPlayer1Turn);
                    if (!ok) setAwaitingSwitch(isPlayer1Turn ? 'player2' : 'player1');
                } else {
                    setAwaitingSwitch(isPlayer1Turn ? 'player2' : 'player1');
                }
            } else {
                setWinner(isPlayer1Turn ? 'player1' : 'player2');
            }
        } else {
            let atkHp = attacker.currentHp;
            if (attacker.status === 'poisoned' || attacker.status === 'burned') {
                const dmg = Math.max(1, Math.floor(attacker.maxHp * 0.1));
                atkHp = Math.max(0, attacker.currentHp - dmg);
                const setAtkTeam = isPlayer1Turn ? setPlayer1Team : setPlayer2Team;
                const setActiveAtk = isPlayer1Turn ? setActivePokemonP1 : setActivePokemonP2;
                setAtkTeam(prev => prev.map(p => p.id === attacker.id ? { ...p, currentHp: atkHp } : p));
                setActiveAtk(prev => ({ ...prev, currentHp: atkHp }));
                const sname = attacker.status === 'poisoned' ? 'veneno' : 'quemadura';
                addLog(`${attacker.name.toUpperCase()} sufrió ${dmg} PS por ${sname}!`);
                await new Promise(r => setTimeout(r, 400));
            }
            if (atkHp === 0) {
                addLog(`${attacker.name.toUpperCase()} se ha debilitado!`);
                const atkTeam = (isPlayer1Turn ? player1TeamRef.current : player2TeamRef.current);
                const remaining = atkTeam.filter(p => p.id !== attacker.id && p.currentHp > 0);
                if (remaining.length === 0) setWinner(isPlayer1Turn ? 'player2' : 'player1');
                else if (remaining.length === 1) await autoSwitchLastPokemon(isPlayer1Turn);
                else setAwaitingSwitch(isPlayer1Turn ? 'player1' : 'player2');
            } else {
                setIsPlayer1Turn(prev => !prev);
            }
        }

        setAnimationBlocking(false);
    }, [
        animationBlocking, winner, awaitingSwitch, activePokemonP1, activePokemonP2,
        addLog, isPlayer1Turn, autoSwitchLastPokemon, gameMode, showFloatingMessage,
    ]);

    const handleSwitchPokemon = useCallback(async (newPokemon, isPlayer1 = true) => {
        if (animationBlocking || winner) return;
        const activePokemon = isPlayer1 ? activePokemonP1 : activePokemonP2;
        if (!newPokemon || newPokemon.id === activePokemon?.id || newPokemon.currentHp <= 0) return;
        const wasAwaiting = awaitingSwitch;
        setAnimationBlocking(true);
        setAwaitingSwitch(null);
        if (activePokemon) { addLog(`${activePokemon.name.toUpperCase()} regresa.`); await new Promise(r => setTimeout(r, 500)); }
        (isPlayer1 ? setActivePokemonP1 : setActivePokemonP2)(newPokemon);
        addLog(`¡Adelante, ${newPokemon.name.toUpperCase()}!`);
        await new Promise(r => setTimeout(r, 500));
        analyticsTracker.trackEvent('Cambio', `${isPlayer1 ? 'P1' : 'P2'} → ${newPokemon.name}`);
        if (!wasAwaiting) setIsPlayer1Turn(prev => !prev);
        else setIsPlayer1Turn(wasAwaiting === 'player1');
        setAnimationBlocking(false);
    }, [animationBlocking, winner, activePokemonP1, activePokemonP2, addLog, awaitingSwitch]);

    const handlePokemonCircleClick = useCallback((pokemon, isPlayer1 = true) => {
        const can = (isPlayer1 && (isPlayer1Turn || awaitingSwitch === 'player1')) ||
                    (!isPlayer1 && (!isPlayer1Turn || awaitingSwitch === 'player2'));
        if (!pokemon || !can) return;
        handleSwitchPokemon(pokemon, isPlayer1);
    }, [isPlayer1Turn, awaitingSwitch, handleSwitchPokemon]);

    const handleUseItem = useCallback(async (itemType) => {
        if (animationBlocking || winner || awaitingSwitch || !isPlayer1Turn) return;
        setAnimationBlocking(true);
        if (itemType === 'potions') {
            if (bag.potions <= 0) { addLog('¡No tienes más Pociones!'); setAnimationBlocking(false); return; }
            const heal = Math.floor(activePokemonP1.maxHp * 0.33);
            const newHp = Math.min(activePokemonP1.maxHp, activePokemonP1.currentHp + heal);
            if (newHp === activePokemonP1.currentHp) { addLog(`${activePokemonP1.name.toUpperCase()} ya tiene PS al máximo.`); setAnimationBlocking(false); return; }
            setPlayer1Team(prev => prev.map(p => p.id === activePokemonP1.id ? { ...p, currentHp: newHp } : p));
            setActivePokemonP1(prev => ({ ...prev, currentHp: newHp }));
            addLog(`¡Poción usada! ${activePokemonP1.name.toUpperCase()} recuperó ${heal} PS.`);
            setBag(prev => ({ ...prev, potions: prev.potions - 1 }));
        } else if (itemType === 'fullRestore') {
            if (bag.fullRestore <= 0) { addLog('¡No tienes más Curas Totales!'); setAnimationBlocking(false); return; }
            if (!activePokemonP1.status) { addLog(`${activePokemonP1.name.toUpperCase()} no tiene estado alterado.`); setAnimationBlocking(false); return; }
            setPlayer1Team(prev => prev.map(p => p.id === activePokemonP1.id ? { ...p, status: null } : p));
            setActivePokemonP1(prev => ({ ...prev, status: null }));
            addLog(`¡Cura Total! ${activePokemonP1.name.toUpperCase()} curado.`);
            setBag(prev => ({ ...prev, fullRestore: prev.fullRestore - 1 }));
        }
        await new Promise(r => setTimeout(r, 500));
        setIsPlayer1Turn(false);
        setAnimationBlocking(false);
    }, [animationBlocking, winner, awaitingSwitch, isPlayer1Turn, activePokemonP1, bag, addLog]);

    // Turno IA
    useEffect(() => {
        if (winner || isPlayer1Turn || animationBlocking || awaitingSwitch || gameMode !== 'vsIA') return;
        const t = setTimeout(() => {
            if (!activePokemonP2?.moves) return;
            const avail = activePokemonP2.moves.filter(m => (m.currentPP ?? 1) > 0);
            const pool = avail.length > 0 ? avail : [STRUGGLE];
            handleAttackAction(pool[Math.floor(Math.random() * pool.length)]);
        }, 800);
        return () => clearTimeout(t);
    }, [isPlayer1Turn, winner, animationBlocking, awaitingSwitch, gameMode, activePokemonP2, handleAttackAction]);

    // Cambio forzado IA
    useEffect(() => {
        if (awaitingSwitch !== 'player2' || gameMode !== 'vsIA' || winner) return;
        const avail = player2Team.filter(p => p.currentHp > 0);
        if (avail.length === 0) return;
        if (avail.length === 1) { autoSwitchLastPokemon(false); return; }
        const t = setTimeout(() => handleSwitchPokemon(avail[0], false), 1500);
        return () => clearTimeout(t);
    }, [awaitingSwitch, gameMode, player2Team, winner, handleSwitchPokemon, autoSwitchLastPokemon]);

    // Setup batalla
    useEffect(() => {
        const setup = async () => {
            setLoading(true);
            setBattleLog([]);
            const params = new URLSearchParams(location.search);
            const p1Ids = params.get('p1')?.split(',').map(Number);
            const p2Ids = params.get('p2')?.split(',').map(Number);
            const mode = params.get('mode') || 'vsIA';
            const customMovesP1 = location.state?.customMovesP1 || {};
            if (!p1Ids || !p2Ids || !p1Ids.length || !p2Ids.length) { navigate('/'); return; }
            setGameMode(mode);
            try {
                addLog('Cargando Pokémon...');
                const [p1d, p2d] = await Promise.all([fetchPokemonDetailsByIds(p1Ids), fetchPokemonDetailsByIds(p2Ids)]);
                if (!p1d.length || !p2d.length) throw new Error('No se cargaron los equipos.');
                const p1 = p1d.map(p => initPokemon(p, customMovesP1[p.id]));
                const p2 = p2d.map(p => initPokemon(p, null));
                setPlayer1Team(p1); setPlayer2Team(p2);
                setActivePokemonP1(p1[0]); setActivePokemonP2(p2[0]);
                setBag({ potions: 3, fullRestore: 1 });
                addLog('¡La batalla ha comenzado!');
                addLog(`${p1[0].name.toUpperCase()} vs ${p2[0].name.toUpperCase()}`);
                analyticsTracker.trackEvent('Batalla Iniciada', `Modo: ${mode}`);
            } catch (e) {
                addLog('Error al cargar la batalla.');
                setWinner('draw');
            } finally {
                setLoading(false);
            }
        };
        setup();
    }, [location.search, navigate, addLog, location.state]);

    // Fin de batalla
    useEffect(() => {
        if (loading || winner) return;
        const w = checkBattleEndConditions(player1Team, player2Team);
        if (w) {
            setWinner(w);
            addLog(w === 'player1' ? '¡Felicidades! ¡Has ganado!' : '¡Has perdido la batalla...');
            analyticsTracker.trackEvent('Batalla Finalizada', `Ganador: ${w}`);
        }
    }, [player1Team, player2Team, loading, winner, addLog, checkBattleEndConditions]);

    return {
        loading, winner, battleLog, gameMode,
        player1Team, player2Team,
        activePokemonP1, activePokemonP2,
        isPlayer1Turn, awaitingSwitch,
        pokemonP1Attacking, pokemonP2Attacking,
        pokemonP1Damaged, pokemonP2Damaged,
        animationBlocking, bag, floatingMsg, lastAttack,
        handleAttack: handleAttackAction,
        handleSwitchPokemon,
        handlePokemonCircleClick,
        handleUseItem,
    };
};
