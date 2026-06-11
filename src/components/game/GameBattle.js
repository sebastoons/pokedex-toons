// src/components/game/GameBattle.js
// Batalla salvaje estilo GBA: luchar / pokébola / poción / huir
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { generateMovesByTypes } from '../../utils/moveGenerationUtils';
import { calculateTypeEffectiveness } from '../../utils/typeEffectiveness';
import { calcDamage, tryCapture, applyXp, xpGain, xpToNext } from '../../game/gameData';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const HpBar = ({ current, max }) => {
    const pct = Math.max(0, (current / max) * 100);
    const hue = Math.round((pct / 100) * 120);
    return (
        <div className="gb-hp-bg">
            <div className="gb-hp-fill" style={{ width: `${pct}%`, background: `hsl(${hue},85%,45%)` }} />
        </div>
    );
};

export default function GameBattle({ wild, team, bag, onEnd }) {
    // onEnd({ result: 'win'|'caught'|'fled'|'blackout', team, bag, wild })
    const [playerIdx, setPlayerIdx] = useState(() => team.findIndex(p => p.currentHp > 0));
    const [teamState, setTeamState] = useState(team);
    const [wildState, setWildState] = useState(wild);
    const [bagState, setBagState] = useState(bag);
    const [message, setMessage] = useState(`¡Un ${wild.name} salvaje apareció!`);
    const [submenu, setSubmenu] = useState(null); // null | 'moves'
    const [busy, setBusy] = useState(false);
    const [shake, setShake] = useState(null); // 'wild' | 'player'

    const endedRef = useRef(false);
    const active = teamState[playerIdx];

    const playerMoves = useMemo(() => generateMovesByTypes(active?.types || ['normal']), [active?.uid]); // eslint-disable-line react-hooks/exhaustive-deps
    const wildMoves = useMemo(() => generateMovesByTypes(wildState.types), [wildState.speciesId]); // eslint-disable-line react-hooks/exhaustive-deps

    const finish = useCallback((result, extra = {}) => {
        if (endedRef.current) return;
        endedRef.current = true;
        onEnd({ result, team: extra.team ?? teamState, bag: extra.bag ?? bagState, wild: extra.wild ?? wildState });
    }, [onEnd, teamState, bagState, wildState]);

    const wildAttack = async (currentTeam, idx) => {
        const move = wildMoves[Math.floor(Math.random() * wildMoves.length)];
        const target = currentTeam[idx];
        const { multiplier } = calculateTypeEffectiveness(move.type, target.types);
        const dmg = calcDamage(wildState, target, move, multiplier);
        setMessage(`¡${wildState.name} salvaje usó ${move.name}!`);
        await sleep(900);
        setShake('player');
        setTimeout(() => setShake(null), 450);
        const newHp = Math.max(0, target.currentHp - dmg);
        const newTeam = currentTeam.map((p, i) => i === idx ? { ...p, currentHp: newHp } : p);
        setTeamState(newTeam);
        if (multiplier > 1) { setMessage('¡Es muy eficaz!'); await sleep(700); }
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

    const handleMove = async (move) => {
        if (busy) return;
        setBusy(true);
        setSubmenu(null);

        const { multiplier } = calculateTypeEffectiveness(move.type, wildState.types);
        const dmg = calcDamage(active, wildState, move, multiplier);
        const playerFirst = active.speed >= wildState.speed;

        const doPlayerHit = async () => {
            setMessage(`¡${active.name} usó ${move.name}!`);
            await sleep(900);
            setShake('wild');
            setTimeout(() => setShake(null), 450);
            const newHp = Math.max(0, wildState.currentHp - dmg);
            const newWild = { ...wildState, currentHp: newHp };
            setWildState(newWild);
            if (multiplier > 1) { setMessage('¡Es muy eficaz!'); await sleep(700); }
            if (multiplier === 0) { setMessage('No afecta al Pokémon enemigo...'); await sleep(700); }
            else if (multiplier < 1) { setMessage('No es muy eficaz...'); await sleep(700); }

            if (newHp <= 0) {
                setMessage(`¡El ${wildState.name} salvaje se debilitó!`);
                await sleep(1000);
                // XP
                const gained = xpGain(wildState.level);
                const { pokemon: upgraded, leveledUp, evolved, oldName } = applyXp(active, gained);
                let newTeam = teamState.map((p, i) => i === playerIdx ? upgraded : p);
                setTeamState(newTeam);
                setMessage(`${active.name} ganó ${gained} EXP.`);
                await sleep(1000);
                if (leveledUp) { setMessage(`¡${evolved ? oldName : upgraded.name} subió al Nv. ${upgraded.level}!`); await sleep(1000); }
                if (evolved) { setMessage(`¡${oldName} evolucionó a ${upgraded.name}!`); await sleep(1400); }
                finish('win', { team: newTeam });
                return true;
            }
            return false;
        };

        if (playerFirst) {
            const ended = await doPlayerHit();
            if (!ended) {
                const over = await wildAttack(teamState, playerIdx);
                if (!over) setBusy(false);
            }
        } else {
            const over = await wildAttack(teamState, playerIdx);
            if (!over) {
                const ended = await doPlayerHit();
                if (!ended) setBusy(false);
            }
        }
    };

    const handleBall = async () => {
        if (busy) return;
        if (bagState.pokeballs <= 0) { setMessage('¡No te quedan Pokébolas!'); return; }
        setBusy(true);
        const newBag = { ...bagState, pokeballs: bagState.pokeballs - 1 };
        setBagState(newBag);
        setMessage(`¡Lanzaste una Pokébola! (quedan ${newBag.pokeballs})`);
        await sleep(1100);
        setMessage('...');
        await sleep(700);
        if (tryCapture(wildState)) {
            setMessage(`¡Genial! ¡${wildState.name} fue capturado!`);
            await sleep(1400);
            finish('caught', { bag: newBag });
        } else {
            setMessage(`¡Oh no! ¡${wildState.name} se escapó de la Pokébola!`);
            await sleep(1000);
            const over = await wildAttack(teamState, playerIdx);
            if (!over) setBusy(false);
        }
    };

    const handlePotion = async () => {
        if (busy) return;
        if (bagState.potions <= 0) { setMessage('¡No te quedan Pociones!'); return; }
        if (active.currentHp >= active.maxHp) { setMessage(`${active.name} ya tiene la salud al máximo.`); return; }
        setBusy(true);
        const newBag = { ...bagState, potions: bagState.potions - 1 };
        setBagState(newBag);
        const healed = Math.min(active.maxHp, active.currentHp + 30);
        const newTeam = teamState.map((p, i) => i === playerIdx ? { ...p, currentHp: healed } : p);
        setTeamState(newTeam);
        setMessage(`¡${active.name} recuperó salud!`);
        await sleep(900);
        const over = await wildAttack(newTeam, playerIdx);
        if (!over) setBusy(false);
    };

    const handleRun = async () => {
        if (busy) return;
        setBusy(true);
        if (Math.random() < 0.85) {
            setMessage('¡Escapaste sin problemas!');
            await sleep(900);
            finish('fled');
        } else {
            setMessage('¡No pudiste escapar!');
            await sleep(800);
            const over = await wildAttack(teamState, playerIdx);
            if (!over) setBusy(false);
        }
    };

    if (!active) return null;

    return (
        <div className="game-battle">
            {/* Enemigo */}
            <div className="gb-row gb-row-enemy">
                <div className="gb-info-box">
                    <div className="gb-info-name">{wildState.name.toUpperCase()} <span className="gb-level">Nv.{wildState.level}</span></div>
                    <HpBar current={wildState.currentHp} max={wildState.maxHp} />
                </div>
                <img
                    src={wildState.imageUrl}
                    alt={wildState.name}
                    className={`gb-sprite gb-sprite-enemy ${shake === 'wild' ? 'gb-shake' : ''}`}
                />
            </div>

            {/* Jugador */}
            <div className="gb-row gb-row-player">
                <img
                    src={active.imageUrl}
                    alt={active.name}
                    className={`gb-sprite gb-sprite-player ${shake === 'player' ? 'gb-shake' : ''}`}
                />
                <div className="gb-info-box">
                    <div className="gb-info-name">{active.name.toUpperCase()} <span className="gb-level">Nv.{active.level}</span></div>
                    <HpBar current={active.currentHp} max={active.maxHp} />
                    <div className="gb-hp-text">{active.currentHp}/{active.maxHp}</div>
                    <div className="gb-xp-bg"><div className="gb-xp-fill" style={{ width: `${Math.min(100, (active.xp / xpToNext(active.level)) * 100)}%` }} /></div>
                </div>
            </div>

            {/* Mensaje + acciones */}
            <div className="gb-bottom">
                <div className="gb-message">{message}</div>
                {!busy && (
                    submenu === 'moves' ? (
                        <div className="gb-actions gb-moves">
                            {playerMoves.map((m, i) => (
                                <button key={i} className="gb-btn gb-move-btn" onClick={() => handleMove(m)}>
                                    {m.name}
                                    <span className="gb-move-meta">{m.damage_class === 'status' ? 'APOYO' : `PWR ${m.power}`}</span>
                                </button>
                            ))}
                            <button className="gb-btn gb-back" onClick={() => setSubmenu(null)}>← Volver</button>
                        </div>
                    ) : (
                        <div className="gb-actions">
                            <button className="gb-btn" onClick={() => setSubmenu('moves')}>LUCHAR</button>
                            <button className="gb-btn" onClick={handleBall}>POKÉBOLA ×{bagState.pokeballs}</button>
                            <button className="gb-btn" onClick={handlePotion}>POCIÓN ×{bagState.potions}</button>
                            <button className="gb-btn" onClick={handleRun}>HUIR</button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
