// src/components/game/GameBattle.js
// Batalla estilo GBA: salvaje o entrenador.
// Props:
//   wild        — Pokémon salvaje (modo wild)
//   team        — equipo del jugador
//   bag         — { pokeballs, potions }
//   mode        — 'wild' | 'trainer'
//   trainerName — nombre del entrenador rival (modo trainer)
//   trainerTeam — array de Pokémon del entrenador (modo trainer)
//   onEnd       — callback({ result, team, bag, wild })
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { generateMovesByTypes } from '../../utils/moveGenerationUtils';
import { calculateTypeEffectiveness } from '../../utils/typeEffectiveness';
import { calcDamage, tryCapture, applyXp, xpGain, xpToNext } from '../../game/gameData';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Barra de HP ───────────────────────────────────────────────────────────────
const HpBar = ({ current, max }) => {
    const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
    const hue = Math.round((pct / 100) * 120);
    return (
        <div className="gb-hp-bg">
            <div
                className="gb-hp-fill"
                style={{ width: `${pct}%`, background: `hsl(${hue},85%,45%)` }}
            />
        </div>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function GameBattle({
    wild,
    team,
    bag,
    mode = 'wild',
    trainerName = '',
    trainerTeam = [],
    onEnd,
}) {
    const isTrainer = mode === 'trainer';

    // Estado del jugador
    const [playerIdx,  setPlayerIdx]  = useState(() => team.findIndex(p => p.currentHp > 0));
    const [teamState,  setTeamState]  = useState(team);
    const [bagState,   setBagState]   = useState(bag);

    // Estado del enemigo
    // En modo entrenador el "wild" es el primer Pokémon del trainerTeam
    const [enemyTeam,  setEnemyTeam]  = useState(isTrainer ? trainerTeam : (wild ? [wild] : []));
    const [enemyIdx,   setEnemyIdx]   = useState(0);

    const [message,  setMessage]  = useState(
        isTrainer
            ? `¡${trainerName} quiere combatir!`
            : `¡Un ${wild?.name ?? '???'} salvaje apareció!`
    );
    const [submenu,  setSubmenu]  = useState(null); // null | 'moves'
    const [busy,     setBusy]     = useState(false);
    const [shake,    setShake]    = useState(null); // 'enemy' | 'player'

    const endedRef = useRef(false);
    const active   = teamState[playerIdx];
    const enemy    = enemyTeam[enemyIdx];

    const playerMoves = useMemo(
        () => generateMovesByTypes(active?.types ?? ['normal']),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [active?.uid]
    );
    const enemyMoves = useMemo(
        () => generateMovesByTypes(enemy?.types ?? ['normal']),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [enemy?.uid]
    );

    // Teclado numérico para batallas
    useEffect(() => {
        const handleKey = (e) => {
            if (busy) return;
            switch (e.code) {
                case 'Numpad1': if (submenu === 'moves' && playerMoves[0]) handleMove(playerMoves[0]); break;
                case 'Numpad2': if (submenu === 'moves' && playerMoves[1]) handleMove(playerMoves[1]); break;
                case 'Numpad3': if (submenu === 'moves' && playerMoves[2]) handleMove(playerMoves[2]); break;
                case 'Numpad4': if (submenu === 'moves' && playerMoves[3]) handleMove(playerMoves[3]); break;
                case 'Numpad5': if (!submenu && !isTrainer) handleBall(); break;
                case 'Numpad6': if (!submenu) handlePotion(); break;
                case 'Numpad0': if (!submenu && !isTrainer) handleRun(); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }); // re-subscribe each render so handlers close over latest state

    const finish = useCallback((result, extra = {}) => {
        if (endedRef.current) return;
        endedRef.current = true;
        onEnd({
            result,
            team:  extra.team  ?? teamState,
            bag:   extra.bag   ?? bagState,
            wild:  extra.wild  ?? (isTrainer ? null : enemy),
        });
    }, [onEnd, teamState, bagState, enemy, isTrainer]);

    // ── Ataque del enemigo ────────────────────────────────────────────────────
    const enemyAttack = async (currentTeam, idx) => {
        if (!enemy) return false;
        const move = enemyMoves[Math.floor(Math.random() * Math.max(1, enemyMoves.length))];
        if (!move) return false;
        const target = currentTeam[idx];
        const { multiplier } = calculateTypeEffectiveness(move.type, target?.types ?? ['normal']);
        const dmg = calcDamage(enemy, target, move, multiplier);

        const label = isTrainer ? `¡${enemy.name} de ${trainerName}` : `¡${enemy.name} salvaje`;
        setMessage(`${label} usó ${move.name}!`);
        await sleep(900);
        setShake('player');
        setTimeout(() => setShake(null), 450);

        const newHp = Math.max(0, (target?.currentHp ?? 0) - dmg);
        const newTeam = currentTeam.map((p, i) => i === idx ? { ...p, currentHp: newHp } : p);
        setTeamState(newTeam);

        if (multiplier > 1)               { setMessage('¡Es muy eficaz!');     await sleep(700); }
        if (multiplier < 1 && multiplier > 0) { setMessage('No es muy eficaz...'); await sleep(700); }

        if (newHp <= 0) {
            setMessage(`¡${target.name} se debilitó!`);
            await sleep(1000);
            const nextIdx = newTeam.findIndex(p => p.currentHp > 0);
            if (nextIdx === -1) {
                setMessage('¡No te quedan Pokémon! Todo se vuelve negro...');
                await sleep(1400);
                finish('blackout', { team: newTeam });
                return true;
            }
            setPlayerIdx(nextIdx);
            setMessage(`¡Adelante, ${newTeam[nextIdx].name}!`);
            await sleep(900);
        }
        return false;
    };

    // ── Derrota del Pokémon enemigo (en modo entrenador: siguiente) ───────────
    const handleEnemyFainted = async (currentTeamState, currentPlayerIdx, gainedFromEnemy) => {
        const gainedXp = gainedFromEnemy ?? xpGain(enemy?.level ?? 5);
        setMessage(`¡${enemy?.name} se debilitó!`);
        await sleep(1000);

        if (!isTrainer) {
            // XP en modo salvaje
            const playerPoke = currentTeamState[currentPlayerIdx];
            const { pokemon: upgraded, leveledUp, evolved, oldName } = applyXp(playerPoke, gainedXp);
            const newTeam = currentTeamState.map((p, i) => i === currentPlayerIdx ? upgraded : p);
            setTeamState(newTeam);
            setMessage(`${playerPoke.name} ganó ${gainedXp} EXP.`);
            await sleep(1000);
            if (leveledUp) { setMessage(`¡${evolved ? oldName : upgraded.name} subió al Nv. ${upgraded.level}!`); await sleep(1000); }
            if (evolved)   { setMessage(`¡${oldName} evolucionó a ${upgraded.name}!`); await sleep(1400); }
            finish('win', { team: newTeam });
            return;
        }

        // Modo entrenador: cicla al siguiente Pokémon
        const nextEnemyIdx = enemyTeam.findIndex((p, i) => i > enemyIdx && p.currentHp > 0);
        if (nextEnemyIdx === -1) {
            // Todos los Pokémon del entrenador derrotados → victoria
            setMessage(`¡Derrotaste a ${trainerName}!`);
            await sleep(1400);
            finish('trainerwin', { team: currentTeamState });
            return;
        }
        const next = enemyTeam[nextEnemyIdx];
        setMessage(`¡${trainerName} sacó a ${next.name}!`);
        setEnemyIdx(nextEnemyIdx);
        await sleep(1200);
        setBusy(false);
    };

    // ── Usar movimiento ───────────────────────────────────────────────────────
    const handleMove = async (move) => {
        if (busy || !active || !enemy) return;
        setBusy(true);
        setSubmenu(null);

        const { multiplier } = calculateTypeEffectiveness(move.type, enemy.types ?? ['normal']);
        const dmg = calcDamage(active, enemy, move, multiplier);
        const playerFirst = (active.speed ?? 0) >= (enemy.speed ?? 0);

        const doPlayerHit = async () => {
            setMessage(`¡${active.name} usó ${move.name}!`);
            await sleep(900);
            setShake('enemy');
            setTimeout(() => setShake(null), 450);
            const newHp = Math.max(0, (enemy.currentHp ?? 0) - dmg);
            const updatedEnemy = { ...enemy, currentHp: newHp };
            setEnemyTeam(prev => prev.map((p, i) => i === enemyIdx ? updatedEnemy : p));

            if (multiplier > 1)                   { setMessage('¡Es muy eficaz!');                    await sleep(700); }
            if (multiplier === 0)                  { setMessage('No afecta al Pokémon enemigo...');    await sleep(700); }
            else if (multiplier < 1)               { setMessage('No es muy eficaz...');                await sleep(700); }

            if (newHp <= 0) {
                await handleEnemyFainted(teamState, playerIdx, null);
                return true;
            }
            return false;
        };

        if (playerFirst) {
            const ended = await doPlayerHit();
            if (!ended) {
                const over = await enemyAttack(teamState, playerIdx);
                if (!over) setBusy(false);
            }
        } else {
            const over = await enemyAttack(teamState, playerIdx);
            if (!over) {
                const ended = await doPlayerHit();
                if (!ended) setBusy(false);
            }
        }
    };

    // ── Lanzar Pokébola (solo modo salvaje) ───────────────────────────────────
    const handleBall = async () => {
        if (busy || isTrainer) return;
        if (bagState.pokeballs <= 0) { setMessage('¡No te quedan Pokébolas!'); return; }
        setBusy(true);
        const newBag = { ...bagState, pokeballs: bagState.pokeballs - 1 };
        setBagState(newBag);
        setMessage(`¡Lanzaste una Pokébola! (quedan ${newBag.pokeballs})`);
        await sleep(1100);
        setMessage('...');
        await sleep(700);
        if (tryCapture(enemy)) {
            setMessage(`¡Genial! ¡${enemy.name} fue capturado!`);
            await sleep(1400);
            finish('caught', { bag: newBag, wild: enemy });
        } else {
            setMessage(`¡Oh no! ¡${enemy.name} se escapó de la Pokébola!`);
            await sleep(1000);
            const over = await enemyAttack(teamState, playerIdx);
            if (!over) setBusy(false);
        }
    };

    // ── Usar Poción ───────────────────────────────────────────────────────────
    const handlePotion = async () => {
        if (busy) return;
        if (bagState.potions <= 0) { setMessage('¡No te quedan Pociones!'); return; }
        if (!active) return;
        if (active.currentHp >= active.maxHp) {
            setMessage(`${active.name} ya tiene la salud al máximo.`);
            return;
        }
        setBusy(true);
        const newBag = { ...bagState, potions: bagState.potions - 1 };
        setBagState(newBag);
        const healed = Math.min(active.maxHp, active.currentHp + 30);
        const newTeam = teamState.map((p, i) => i === playerIdx ? { ...p, currentHp: healed } : p);
        setTeamState(newTeam);
        setMessage(`¡${active.name} recuperó salud!`);
        await sleep(900);
        const over = await enemyAttack(newTeam, playerIdx);
        if (!over) setBusy(false);
    };

    // ── Huir (solo modo salvaje) ──────────────────────────────────────────────
    const handleRun = async () => {
        if (busy || isTrainer) return;
        setBusy(true);
        if (Math.random() < 0.85) {
            setMessage('¡Escapaste sin problemas!');
            await sleep(900);
            finish('fled');
        } else {
            setMessage('¡No pudiste escapar!');
            await sleep(800);
            const over = await enemyAttack(teamState, playerIdx);
            if (!over) setBusy(false);
        }
    };

    if (!active || !enemy) return null;

    return (
        <div className="game-battle">
            {/* ── Pokémon enemigo ── */}
            <div className="gb-row gb-row-enemy">
                <div className="gb-info-box">
                    {isTrainer && (
                        <div className="gb-trainer-label">
                            {trainerName}
                            <span className="gb-enemy-count"> ({enemyIdx + 1}/{enemyTeam.length})</span>
                        </div>
                    )}
                    <div className="gb-info-name">
                        {enemy.name.toUpperCase()} <span className="gb-level">Nv.{enemy.level}</span>
                    </div>
                    <HpBar current={enemy.currentHp} max={enemy.maxHp} />
                </div>
                <img
                    src={enemy.imageUrl}
                    alt={enemy.name}
                    className={`gb-sprite gb-sprite-enemy${shake === 'enemy' ? ' gb-shake' : ''}`}
                />
            </div>

            {/* ── Pokémon del jugador ── */}
            <div className="gb-row gb-row-player">
                <img
                    src={active.imageUrl}
                    alt={active.name}
                    className={`gb-sprite gb-sprite-player${shake === 'player' ? ' gb-shake-player' : ''}`}
                />
                <div className="gb-info-box">
                    <div className="gb-info-name">
                        {active.name.toUpperCase()} <span className="gb-level">Nv.{active.level}</span>
                    </div>
                    <HpBar current={active.currentHp} max={active.maxHp} />
                    <div className="gb-hp-text">{active.currentHp}/{active.maxHp}</div>
                    <div className="gb-xp-bg">
                        <div
                            className="gb-xp-fill"
                            style={{ width: `${Math.min(100, (active.xp / Math.max(1, xpToNext(active.level))) * 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Mensaje + acciones ── */}
            <div className="gb-bottom">
                <div className="gb-message">{message}</div>
                {!busy && (
                    submenu === 'moves' ? (
                        <div className="gb-actions gb-moves">
                            {playerMoves.map((m, i) => (
                                <button
                                    key={i}
                                    className="gb-btn gb-move-btn"
                                    onClick={() => handleMove(m)}
                                    title={`Numpad ${i + 1}`}
                                >
                                    {m.name}
                                    <span className="gb-move-meta">
                                        {m.damage_class === 'status' ? 'APOYO' : `PWR ${m.power}`}
                                    </span>
                                </button>
                            ))}
                            <button className="gb-btn gb-back" onClick={() => setSubmenu(null)}>← Volver</button>
                        </div>
                    ) : (
                        <div className="gb-actions">
                            <button className="gb-btn" onClick={() => setSubmenu('moves')}>
                                LUCHAR
                            </button>
                            {!isTrainer ? (
                                <button className="gb-btn" onClick={handleBall} title="Numpad 5">
                                    POKÉBOLA ×{bagState.pokeballs}
                                </button>
                            ) : (
                                <button className="gb-btn gb-btn-bag" onClick={handlePotion} title="Numpad 6">
                                    BOLSA (Poc. ×{bagState.potions})
                                </button>
                            )}
                            <button className="gb-btn" onClick={handlePotion} title="Numpad 6">
                                POCIÓN ×{bagState.potions}
                            </button>
                            {!isTrainer ? (
                                <button className="gb-btn" onClick={handleRun} title="Numpad 0">
                                    HUIR
                                </button>
                            ) : (
                                <button className="gb-btn gb-btn-disabled" disabled>
                                    ENTRENADOR
                                </button>
                            )}
                        </div>
                    )
                )}
                {!busy && isTrainer && (
                    <div className="gb-trainer-hint">
                        [No puedes huir de un combate entre entrenadores]
                    </div>
                )}
            </div>
        </div>
    );
}
