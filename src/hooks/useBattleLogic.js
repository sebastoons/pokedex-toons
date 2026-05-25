// src/hooks/useBattleLogic.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPokemonDetailsByIds } from '../services/pokemonService';
import { calculateDamage, checkAccuracy } from '../utils/battleUtils';
import { calculateTypeEffectiveness } from '../utils/typeEffectiveness';
import analyticsTracker from '../utils/analyticsTracker';

const STRUGGLE = { name: 'Forcejeo', power: 50, accuracy: 100, type: 'normal', damage_class: 'physical', priority: 0, currentPP: Infinity, maxPP: Infinity };

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
    status: null, attackStage: 0, defenseStage: 0, speedStage: 0,
    moves: addPP(moves || p.moves),
});

const pickIAMove = (pokemon, defender) => {
    const avail = (pokemon.moves || []).filter(m => (m.currentPP ?? 1) > 0);
    const pool = avail.length > 0 ? avail : [STRUGGLE];
    if (!defender || pool.length === 1) return pool[0];

    const defTypes = (defender.types || []).map(t => t.type?.name ?? t);
    const scored = pool.map(move => {
        const power = move.power || 0;
        if (power === 0) return { move, score: Math.random() * 8 };
        const { multiplier } = calculateTypeEffectiveness(move.type || 'normal', defTypes);
        return { move, score: power * multiplier + Math.random() * 15 };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].move;
};

const speedOf = (pokemon) => {
    const base = pokemon.speed ?? pokemon.stats?.speed ?? 50;
    const stage = pokemon.speedStage ?? 0;
    const s = Math.max(-6, Math.min(6, stage));
    return base * (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
};

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
    const activePokemonP1Ref = useRef(activePokemonP1);
    const activePokemonP2Ref = useRef(activePokemonP2);
    const floatingMsgTimerRef = useRef(null);
    const gameModeRef = useRef(gameMode);

    useEffect(() => { player1TeamRef.current = player1Team; }, [player1Team]);
    useEffect(() => { player2TeamRef.current = player2Team; }, [player2Team]);
    useEffect(() => { activePokemonP1Ref.current = activePokemonP1; }, [activePokemonP1]);
    useEffect(() => { activePokemonP2Ref.current = activePokemonP2; }, [activePokemonP2]);
    useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);

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
            setIsPlayer1Turn(gameModeRef.current === 'vsIA' ? true : isPlayer1);
            setAnimationBlocking(false);
            return true;
        }
        return false;
    }, [addLog]);

    // Executes one attacker's move against defender. Returns updated defender HP and whether it fainted.
    const executeOneAttack = useCallback(async ({
        attacker, defender,
        setAtkTeam, setActivePokemon_atk,
        setDefTeam, setActivePokemon_def,
        setPokemonAtkAnim, setPokemonDefDamaged,
        attackSide,
        move,
        winnerIfAtkWins,
    }) => {
        // Paralysis check
        if (attacker.status === 'paralyzed' && Math.random() < 0.25) {
            addLog(`¡${attacker.name.toUpperCase()} está paralizado y no puede moverse!`);
            await new Promise(r => setTimeout(r, 900));
            return { defenderFainted: false, attackerFainted: false, newDefHp: defender.currentHp, newAtkHp: attacker.currentHp };
        }

        // PP deduction
        const moveInTeam = attacker.moves?.find(m => m.name === move.name);
        const usedMove = (moveInTeam && (moveInTeam.currentPP ?? 1) <= 0) ? STRUGGLE : move;

        if (usedMove !== STRUGGLE && moveInTeam) {
            const updatedMoves = attacker.moves.map(m =>
                m.name === usedMove.name ? { ...m, currentPP: Math.max(0, (m.currentPP ?? 1) - 1) } : m
            );
            setAtkTeam(prev => prev.map(p => p.id === attacker.id ? { ...p, moves: updatedMoves } : p));
            setActivePokemon_atk(prev => ({ ...prev, moves: updatedMoves }));
        }

        addLog(`${attacker.name.toUpperCase()} usó ${usedMove.name.toUpperCase()}!`);
        analyticsTracker.trackEvent('Ataque', `${attacker.name} → ${usedMove.name}`);

        // Stat change moves
        if (usedMove.statChange) {
            const { stat, stages, target } = usedMove.statChange;
            const statKey = stat === 'attack' ? 'attackStage' : 'defenseStage';
            const tgtIsAtk = target === 'self';
            const tgtPoke = tgtIsAtk ? attacker : defender;
            const newStage = Math.max(-6, Math.min(6, (tgtPoke[statKey] ?? 0) + stages));
            const setTgt = tgtIsAtk ? setAtkTeam : setDefTeam;
            const setActiveTgt = tgtIsAtk ? setActivePokemon_atk : setActivePokemon_def;
            setTgt(prev => prev.map(p => p.id === tgtPoke.id ? { ...p, [statKey]: newStage } : p));
            setActiveTgt(prev => ({ ...prev, [statKey]: newStage }));
            const dir = stages > 0 ? 'subió' : 'bajó';
            const statLabel = stat === 'attack' ? 'ATAQUE' : 'DEFENSA';
            addLog(`¡El ${statLabel} de ${tgtPoke.name.toUpperCase()} ${dir}!`);
            setLastAttack({ side: attackSide, moveType: usedMove.type });
            await new Promise(r => setTimeout(r, 800));
            return { defenderFainted: false, attackerFainted: false, newDefHp: defender.currentHp, newAtkHp: attacker.currentHp };
        }

        // Accuracy check
        if (!checkAccuracy(usedMove)) {
            setPokemonAtkAnim(true);
            setTimeout(() => setLastAttack({ side: attackSide, moveType: usedMove.type, ts: Date.now() }), 300);
            await new Promise(r => setTimeout(r, 600));
            setPokemonAtkAnim(false);
            addLog(`¡${attacker.name.toUpperCase()} falló el ataque!`);
            await new Promise(r => setTimeout(r, 400));
            return { defenderFainted: false, attackerFainted: false, newDefHp: defender.currentHp, newAtkHp: attacker.currentHp };
        }

        // Attack animation
        setPokemonAtkAnim(true);
        setTimeout(() => setLastAttack({ side: attackSide, moveType: usedMove.type, ts: Date.now() }), 300);
        await new Promise(r => setTimeout(r, 800));

        const { damage, effectivenessMessage, isCritical } = calculateDamage(attacker, defender, usedMove);

        setPokemonAtkAnim(false);
        setPokemonDefDamaged(true);
        await new Promise(r => setTimeout(r, 500));

        if (isCritical && damage > 0) addLog('¡Golpe crítico!');

        const newDefHp = Math.max(0, defender.currentHp - damage);

        // Status on defender
        let newDefStatus = defender.status;
        const statusEffect = getStatusEffect(usedMove);
        if (statusEffect && !defender.status && newDefHp > 0 && Math.random() < statusEffect.chance) {
            newDefStatus = statusEffect.status;
            const snames = { poisoned: 'envenenado', paralyzed: 'paralizado', burned: 'quemado' };
            addLog(`¡${defender.name.toUpperCase()} quedó ${snames[newDefStatus]}!`);
        }

        setDefTeam(prev => prev.map(p => p.id === defender.id ? { ...p, currentHp: newDefHp, status: newDefStatus } : p));
        setActivePokemon_def(prev => ({ ...prev, currentHp: newDefHp, status: newDefStatus }));
        setPokemonDefDamaged(false);

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

        await new Promise(r => setTimeout(r, 400));

        // End-of-turn status damage on ATTACKER
        let newAtkHp = attacker.currentHp;
        if (attacker.status === 'poisoned' || attacker.status === 'burned') {
            const dmg = Math.max(1, Math.floor(attacker.maxHp * 0.1));
            newAtkHp = Math.max(0, attacker.currentHp - dmg);
            setAtkTeam(prev => prev.map(p => p.id === attacker.id ? { ...p, currentHp: newAtkHp } : p));
            setActivePokemon_atk(prev => ({ ...prev, currentHp: newAtkHp }));
            const sname = attacker.status === 'poisoned' ? 'veneno' : 'quemadura';
            addLog(`${attacker.name.toUpperCase()} sufrió ${Math.max(1, Math.floor(attacker.maxHp * 0.1))} PS por ${sname}!`);
            await new Promise(r => setTimeout(r, 400));
        }

        return {
            defenderFainted: newDefHp === 0,
            attackerFainted: newAtkHp === 0,
            newDefHp,
            newAtkHp,
        };
    }, [addLog, showFloatingMessage]);

    // Runs only the IA's half of the round (after player switch or item use)
    const executeIASingleAttack = useCallback(async () => {
        const ia = activePokemonP2Ref.current;
        const player = activePokemonP1Ref.current;
        if (!ia || !player) return;
        setAnimationBlocking(true);
        const iaMove = pickIAMove(ia, player);
        const result = await executeOneAttack({
            attacker: ia, defender: player,
            setAtkTeam: setPlayer2Team, setActivePokemon_atk: setActivePokemonP2,
            setDefTeam: setPlayer1Team, setActivePokemon_def: setActivePokemonP1,
            setPokemonAtkAnim: setPokemonP2Attacking, setPokemonDefDamaged: setPokemonP1Damaged,
            attackSide: 'p2', move: iaMove,
        });
        if (result.defenderFainted) {
            const freshPlayer = activePokemonP1Ref.current;
            addLog(`${freshPlayer.name.toUpperCase()} se ha debilitado!`);
            analyticsTracker.trackEvent('Pokémon Derrotado', freshPlayer.name);
            const remaining = player1TeamRef.current.filter(p => p.currentHp > 0);
            if (remaining.length === 0) { setWinner('player2'); setAnimationBlocking(false); return; }
            if (remaining.length === 1) await autoSwitchLastPokemon(true);
            else setAwaitingSwitch('player1');
        } else if (result.attackerFainted) {
            const freshIA = activePokemonP2Ref.current;
            addLog(`${freshIA.name.toUpperCase()} se ha debilitado!`);
            analyticsTracker.trackEvent('Pokémon Derrotado', freshIA.name);
            const remaining = player2TeamRef.current.filter(p => p.currentHp > 0);
            if (remaining.length === 0) { setWinner('player1'); setAnimationBlocking(false); return; }
            if (remaining.length === 1) await autoSwitchLastPokemon(false);
            else setAwaitingSwitch('player2');
        }
        setIsPlayer1Turn(true);
        setAnimationBlocking(false);
    }, [executeOneAttack, addLog, autoSwitchLastPokemon]);

    // vsPlayer: alternating turns (same as before)
    const handleAttackVsPlayer = useCallback(async (move) => {
        setAnimationBlocking(true);
        const isP1 = isPlayer1Turn;
        const attacker = isP1 ? activePokemonP1 : activePokemonP2;
        const defender = isP1 ? activePokemonP2 : activePokemonP1;

        const { defenderFainted, attackerFainted } = await executeOneAttack({
            attacker, defender,
            setAtkTeam: isP1 ? setPlayer1Team : setPlayer2Team,
            setActivePokemon_atk: isP1 ? setActivePokemonP1 : setActivePokemonP2,
            setDefTeam: isP1 ? setPlayer2Team : setPlayer1Team,
            setActivePokemon_def: isP1 ? setActivePokemonP2 : setActivePokemonP1,
            setPokemonAtkAnim: isP1 ? setPokemonP1Attacking : setPokemonP2Attacking,
            setPokemonDefDamaged: isP1 ? setPokemonP2Damaged : setPokemonP1Damaged,
            attackSide: isP1 ? 'p1' : 'p2',
            move,
            winnerIfAtkWins: isP1 ? 'player1' : 'player2',
        });

        if (defenderFainted) {
            const defenderTeam = isP1 ? player2TeamRef.current : player1TeamRef.current;
            addLog(`${defender.name.toUpperCase()} se ha debilitado!`);
            analyticsTracker.trackEvent('Pokémon Derrotado', `${defender.name}`);
            const remaining = defenderTeam.filter(p => p.currentHp > 0);
            if (remaining.length === 0) {
                setWinner(isP1 ? 'player1' : 'player2');
            } else if (remaining.length === 1) {
                await autoSwitchLastPokemon(!isP1);
            } else {
                setAwaitingSwitch(isP1 ? 'player2' : 'player1');
            }
        } else if (attackerFainted) {
            const atkTeam = isP1 ? player1TeamRef.current : player2TeamRef.current;
            addLog(`${attacker.name.toUpperCase()} se ha debilitado!`);
            const remaining = atkTeam.filter(p => p.id !== attacker.id && p.currentHp > 0);
            if (remaining.length === 0) setWinner(isP1 ? 'player2' : 'player1');
            else if (remaining.length === 1) await autoSwitchLastPokemon(isP1);
            else setAwaitingSwitch(isP1 ? 'player1' : 'player2');
        } else {
            setIsPlayer1Turn(prev => !prev);
        }

        setAnimationBlocking(false);
    }, [isPlayer1Turn, activePokemonP1, activePokemonP2, executeOneAttack, addLog, autoSwitchLastPokemon]);

    // vsIA: full round — player picks, IA picks, speed determines order, both attack
    const handleAttackVsIA = useCallback(async (playerMove) => {
        setAnimationBlocking(true);

        const p1 = activePokemonP1Ref.current;
        const p2 = activePokemonP2Ref.current;

        const iaMove = pickIAMove(p2, p1);

        // Determine order: priority first, then speed (ties go to p1)
        const p1Priority = playerMove.priority ?? 0;
        const p2Priority = iaMove.priority ?? 0;
        const p1Speed = speedOf(p1);
        const p2Speed = speedOf(p2);

        const p1GoesFirst = p1Priority > p2Priority || (p1Priority === p2Priority && p1Speed >= p2Speed);

        const firstAtk  = p1GoesFirst ? p1  : p2;
        const secondAtk = p1GoesFirst ? p2  : p1;
        const firstMove  = p1GoesFirst ? playerMove : iaMove;
        const secondMove = p1GoesFirst ? iaMove : playerMove;
        const firstIsP1  = p1GoesFirst;

        // --- First attacker ---
        const firstResult = await executeOneAttack({
            attacker: firstAtk,
            defender: secondAtk,
            setAtkTeam: firstIsP1 ? setPlayer1Team : setPlayer2Team,
            setActivePokemon_atk: firstIsP1 ? setActivePokemonP1 : setActivePokemonP2,
            setDefTeam: firstIsP1 ? setPlayer2Team : setPlayer1Team,
            setActivePokemon_def: firstIsP1 ? setActivePokemonP2 : setActivePokemonP1,
            setPokemonAtkAnim: firstIsP1 ? setPokemonP1Attacking : setPokemonP2Attacking,
            setPokemonDefDamaged: firstIsP1 ? setPokemonP2Damaged : setPokemonP1Damaged,
            attackSide: firstIsP1 ? 'p1' : 'p2',
            move: firstMove,
        });

        if (firstResult.defenderFainted) {
            const defTeam = firstIsP1 ? player2TeamRef.current : player1TeamRef.current;
            addLog(`${secondAtk.name.toUpperCase()} se ha debilitado!`);
            analyticsTracker.trackEvent('Pokémon Derrotado', secondAtk.name);
            const remaining = defTeam.filter(p => p.currentHp > 0);
            if (remaining.length === 0) {
                setWinner(firstIsP1 ? 'player1' : 'player2');
            } else if (remaining.length === 1) {
                await autoSwitchLastPokemon(!firstIsP1);
            } else {
                setAwaitingSwitch(firstIsP1 ? 'player2' : 'player1');
            }
            setAnimationBlocking(false);
            return;
        }

        if (firstResult.attackerFainted) {
            const atkTeam = firstIsP1 ? player1TeamRef.current : player2TeamRef.current;
            addLog(`${firstAtk.name.toUpperCase()} se ha debilitado!`);
            const remaining = atkTeam.filter(p => p.id !== firstAtk.id && p.currentHp > 0);
            if (remaining.length === 0) setWinner(firstIsP1 ? 'player2' : 'player1');
            else if (remaining.length === 1) await autoSwitchLastPokemon(firstIsP1);
            else setAwaitingSwitch(firstIsP1 ? 'player1' : 'player2');
            setAnimationBlocking(false);
            return;
        }

        // --- Second attacker (uses refreshed refs) ---
        const secondIsP1 = !firstIsP1;
        const updatedSecond = secondIsP1 ? activePokemonP1Ref.current : activePokemonP2Ref.current;
        const updatedFirst  = secondIsP1 ? activePokemonP2Ref.current : activePokemonP1Ref.current;

        const secondResult = await executeOneAttack({
            attacker: updatedSecond,
            defender: updatedFirst,
            setAtkTeam: secondIsP1 ? setPlayer1Team : setPlayer2Team,
            setActivePokemon_atk: secondIsP1 ? setActivePokemonP1 : setActivePokemonP2,
            setDefTeam: secondIsP1 ? setPlayer2Team : setPlayer1Team,
            setActivePokemon_def: secondIsP1 ? setActivePokemonP2 : setActivePokemonP1,
            setPokemonAtkAnim: secondIsP1 ? setPokemonP1Attacking : setPokemonP2Attacking,
            setPokemonDefDamaged: secondIsP1 ? setPokemonP2Damaged : setPokemonP1Damaged,
            attackSide: secondIsP1 ? 'p1' : 'p2',
            move: secondMove,
        });

        if (secondResult.defenderFainted) {
            const defTeam = secondIsP1 ? player2TeamRef.current : player1TeamRef.current;
            addLog(`${updatedFirst.name.toUpperCase()} se ha debilitado!`);
            analyticsTracker.trackEvent('Pokémon Derrotado', updatedFirst.name);
            const remaining = defTeam.filter(p => p.currentHp > 0);
            if (remaining.length === 0) {
                setWinner(secondIsP1 ? 'player1' : 'player2');
            } else if (remaining.length === 1) {
                await autoSwitchLastPokemon(!secondIsP1);
            } else {
                setAwaitingSwitch(secondIsP1 ? 'player2' : 'player1');
            }
        } else if (secondResult.attackerFainted) {
            const atkTeam = secondIsP1 ? player1TeamRef.current : player2TeamRef.current;
            addLog(`${updatedSecond.name.toUpperCase()} se ha debilitado!`);
            const remaining = atkTeam.filter(p => p.id !== updatedSecond.id && p.currentHp > 0);
            if (remaining.length === 0) setWinner(secondIsP1 ? 'player2' : 'player1');
            else if (remaining.length === 1) await autoSwitchLastPokemon(secondIsP1);
            else setAwaitingSwitch(secondIsP1 ? 'player1' : 'player2');
        }
        // Always player's turn after full round in vsIA
        setIsPlayer1Turn(true);
        setAnimationBlocking(false);
    }, [executeOneAttack, addLog, autoSwitchLastPokemon]);

    const handleAttackAction = useCallback(async (move) => {
        if (animationBlocking || winner || awaitingSwitch) return;
        setAnimationBlocking(true);
        if (gameModeRef.current === 'vsIA') {
            setAnimationBlocking(false); // handleAttackVsIA sets it internally
            await handleAttackVsIA(move);
        } else {
            setAnimationBlocking(false);
            await handleAttackVsPlayer(move);
        }
    }, [animationBlocking, winner, awaitingSwitch, handleAttackVsIA, handleAttackVsPlayer]);

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
        if (gameModeRef.current === 'vsIA') {
            if (!wasAwaiting) {
                // Voluntary player switch: IA earns a free attack
                setAnimationBlocking(false);
                await executeIASingleAttack();
            } else {
                // Forced switch after faint: player's turn
                setIsPlayer1Turn(true);
                setAnimationBlocking(false);
            }
        } else {
            if (!wasAwaiting) setIsPlayer1Turn(prev => !prev);
            else setIsPlayer1Turn(wasAwaiting === 'player1');
            setAnimationBlocking(false);
        }
    }, [animationBlocking, winner, activePokemonP1, activePokemonP2, addLog, awaitingSwitch, executeIASingleAttack]);

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
        // In vsIA, using an item costs the player's turn — IA attacks once
        if (gameModeRef.current === 'vsIA') {
            setAnimationBlocking(false);
            await executeIASingleAttack();
        } else {
            setIsPlayer1Turn(false);
            setAnimationBlocking(false);
        }
    }, [animationBlocking, winner, awaitingSwitch, isPlayer1Turn, activePokemonP1, bag, addLog, executeIASingleAttack]);

    // Forzar cambio IA
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
