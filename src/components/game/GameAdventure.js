// src/components/game/GameAdventure.js
// Pokémon Satélite — aventura estilo GBA
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldCanvas from './WorldCanvas';
import GameBattle from './GameBattle';
import { MAPS } from '../../game/maps';
import { drawHero } from '../../game/heroSprites';
import {
    TRAINERS, STARTERS, findSpecies, createPokemon, randomEncounter,
    generacionTotal,
} from '../../game/gameData';
import {
    buildRivalTeam, getRivalStarterId, findRivalEncounter,
} from '../../game/npcData';
import { newGameState, saveGame, loadGame, deleteSave } from '../../game/saveSystem';
import './GameAdventure.css';

// ── Vista previa pixel-art del entrenador ─────────────────────────────────────
const TrainerPreview = ({ trainer, size = 6 }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        const ctx = ref.current.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 12 * size, 16 * size);
        ctx.setTransform(size, 0, 0, size, 0, 0);
        drawHero(ctx, trainer.gender, trainer.palette, 'down', 0, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }, [trainer, size]);
    return <canvas ref={ref} width={12 * size} height={16 * size} className="trainer-preview-canvas" />;
};

// ── Pantalla del título ────────────────────────────────────────────────────────
function TitleScreen({ onContinue, onNew, onDelete, hasSave, onExit }) {
    return (
        <div className="ga-container ga-title">
            <div className="ga-title-logo">
                <span className="ga-title-pokemon">POKÉMON</span>
                <span className="ga-title-region">SATÉLITE</span>
            </div>
            <div className="ga-title-sub">Una aventura en la Generación Especial</div>
            <div className="ga-title-buttons">
                {hasSave && (
                    <button className="ga-btn ga-btn-primary" onClick={onContinue}>
                        ▶ CONTINUAR
                    </button>
                )}
                <button className="ga-btn" onClick={onNew}>★ NUEVA PARTIDA</button>
                {hasSave && (
                    <button className="ga-btn ga-btn-danger" onClick={onDelete}>
                        ✕ BORRAR PARTIDA
                    </button>
                )}
                <button className="ga-btn ga-btn-exit" onClick={onExit}>← Salir a la Pokédex</button>
            </div>
        </div>
    );
}

// ── Selección de personaje ────────────────────────────────────────────────────
function CharSelectScreen({ onStart, onBack }) {
    const [selGender,  setSelGender]  = useState('m');
    const [selTrainer, setSelTrainer] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const trainers = TRAINERS.filter(t => t.gender === selGender);

    return (
        <div className="ga-container ga-charselect">
            <h2 className="ga-heading">¿Quién eres?</h2>
            <div className="ga-gender-tabs">
                <button
                    className={`ga-tab ${selGender === 'm' ? 'active' : ''}`}
                    onClick={() => { setSelGender('m'); setSelTrainer(null); }}
                >♂ CHICO</button>
                <button
                    className={`ga-tab ${selGender === 'f' ? 'active' : ''}`}
                    onClick={() => { setSelGender('f'); setSelTrainer(null); }}
                >♀ CHICA</button>
            </div>
            <div className="ga-trainer-grid">
                {trainers.map(t => (
                    <div
                        key={t.id}
                        className={`ga-trainer-card ${selTrainer?.id === t.id ? 'selected' : ''}`}
                        onClick={() => { setSelTrainer(t); if (!playerName) setPlayerName(t.name); }}
                    >
                        <TrainerPreview trainer={t} />
                        <span className="ga-trainer-name">{t.name}</span>
                    </div>
                ))}
            </div>
            <input
                className="ga-name-input"
                type="text"
                maxLength={10}
                placeholder="Tu nombre..."
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
            />
            <div className="ga-title-buttons">
                <button
                    className="ga-btn ga-btn-primary"
                    disabled={!selTrainer}
                    onClick={() => onStart(selTrainer, playerName.trim() || selTrainer?.name)}
                >
                    ¡EMPEZAR AVENTURA!
                </button>
                <button className="ga-btn ga-btn-exit" onClick={onBack}>← Volver</button>
            </div>
        </div>
    );
}

// ── Selección de inicial ──────────────────────────────────────────────────────
function StarterScreen({ onChoose }) {
    return (
        <div className="ga-container ga-starter">
            <h2 className="ga-heading">PROF. COSMO</h2>
            <p className="ga-starter-text">
                «¡Bienvenido! Elige a tu compañero para explorar la región Satélite»
            </p>
            <div className="ga-starter-grid">
                {STARTERS.map(id => {
                    const s = findSpecies(id);
                    if (!s) return null;
                    return (
                        <div key={id} className="ga-starter-card" onClick={() => onChoose(id)}>
                            <img src={s.imageUrl} alt={s.name} />
                            <span className="ga-starter-name">{s.name}</span>
                            <span className="ga-starter-type">{s.types.join(' / ')}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Menú ──────────────────────────────────────────────────────────────────────
function MenuScreen({ game, onSaveAndPlay, onPlay, onTitle }) {
    const total = generacionTotal;
    const HpBar = ({ current, max }) => {
        const pct = Math.max(0, (current / Math.max(1, max)) * 100);
        const color = pct > 50 ? '#3eb84a' : pct > 20 ? '#e8c030' : '#e04838';
        return (
            <div className="gb-hp-bg">
                <div className="gb-hp-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        );
    };
    return (
        <div className="ga-container ga-menu">
            <h2 className="ga-heading">MENÚ</h2>

            <div className="ga-menu-section">
                <h3>EQUIPO</h3>
                {game.team.length === 0 && <p className="ga-dim">Aún no tienes Pokémon.</p>}
                {game.team.map(p => (
                    <div key={p.uid} className="ga-team-row">
                        <img src={p.imageUrl} alt={p.name} />
                        <div className="ga-team-info">
                            <span>{p.name} <small>Nv.{p.level}</small></span>
                            <HpBar current={p.currentHp} max={p.maxHp} />
                            <small>{p.currentHp}/{p.maxHp} PS</small>
                        </div>
                    </div>
                ))}
            </div>

            <div className="ga-menu-section">
                <h3>MOCHILA</h3>
                <p>Pokébolas ×{game.bag.pokeballs} &nbsp;·&nbsp; Pociones ×{game.bag.potions}</p>
            </div>

            <div className="ga-menu-section">
                <h3>POKÉDEX SATÉLITE</h3>
                <p>Vistos: {game.pokedexSeen.length} · Capturados: {game.pokedexCaught.length} / {total}</p>
                {game.box.length > 0 && <p className="ga-dim">En caja: {game.box.length}</p>}
            </div>

            <div className="ga-menu-section">
                <h3>CONTROLES</h3>
                <p className="ga-dim" style={{ fontSize: '0.78em', lineHeight: 1.7 }}>
                    WASD / ↑←↓→ — Mover · Espacio/Enter — Diálogo<br />
                    Num1-4 — Movimiento en batalla · Num5 — Pokébola<br />
                    Num6 — Poción · Num0 — Huir
                </p>
            </div>

            <div className="ga-title-buttons">
                <button className="ga-btn ga-btn-primary" onClick={onSaveAndPlay}>
                    💾 GUARDAR Y SEGUIR
                </button>
                <button className="ga-btn" onClick={onPlay}>← Seguir jugando</button>
                <button className="ga-btn ga-btn-exit" onClick={onTitle}>Salir al título</button>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function GameAdventure() {
    const navigate = useNavigate();

    const [screen, setScreen] = useState('title');
    // title | charselect | world | starter | battle | menu

    const [game,   setGame]   = useState(null);
    const [dialog, setDialog] = useState(null);
    const [battle, setBattle] = useState(null);
    // battle: { wild?, mode, trainerName?, trainerTeam? }

    const hasSave = !!loadGame();

    const gameRef = useRef(game);
    gameRef.current = game;

    const persist = useCallback((state) => {
        setGame(state);
        saveGame(state);
    }, []);

    const syncPosition = useCallback(() => {
        const g = gameRef.current;
        if (g) setGame({ ...g });
        return gameRef.current;
    }, []);

    // ── Dismiss dialog con Espacio / Enter ────────────────────────────────────
    useEffect(() => {
        if (screen !== 'world') return;
        const handler = (e) => {
            if ((e.key === ' ' || e.key === 'Enter') && dialog) {
                e.preventDefault();
                setDialog(null);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [screen, dialog]);

    // ── Acciones del mundo ────────────────────────────────────────────────────
    const handleAction = useCallback((action, fromMap) => {
        const g = gameRef.current;
        if (!g) return;
        switch (action.type) {
            case 'warp': {
                const mapDef = MAPS[action.to];
                if (!mapDef) { console.warn('Mapa desconocido:', action.to); return; }
                const next = { ...g, map: action.to, x: action.x, y: action.y };
                persist(next);
                break;
            }
            case 'heal': {
                const healed = g.team.map(p => ({ ...p, currentHp: p.maxHp }));
                persist({ ...g, team: healed });
                setDialog('¡Tus Pokémon están como nuevos! ¡Vuelve cuando quieras!');
                break;
            }
            case 'lab': {
                if (!g.hasStarter) setScreen('starter');
                else setDialog('PROF. COSMO: «¡Cuida bien a tu Pokémon! La región Satélite está llena de especies por descubrir».');
                break;
            }
            case 'mart': {
                setDialog('TIENDA COSMOS: «¡Bienvenido! Tenemos todo lo que necesitas para tu aventura».');
                break;
            }
            case 'gym': {
                setDialog('GIMNASIO DE CIUDAD ESTRELLA — Líder Asteón especialista en Pokémon de tipo Roca. ¡Demuestra tu valía!');
                break;
            }
            case 'item': {
                const isBall = action.key.length % 2 === 0;
                const bag = { ...g.bag };
                let text;
                if (isBall) { bag.pokeballs += 3; text = '¡Encontraste 3 POKÉBOLAS!'; }
                else { bag.potions += 2; text = '¡Encontraste 2 POCIONES!'; }
                persist({ ...g, bag, collectedItems: [...g.collectedItems, action.key] });
                setDialog(text);
                break;
            }
            case 'msg':
                setDialog(action.text);
                break;
            default:
                break;
        }
    }, [persist]);

    // ── Encuentro salvaje ─────────────────────────────────────────────────────
    const handleEncounter = useCallback((mapDef) => {
        const g = gameRef.current;
        if (!g || !g.team.some(p => p.currentHp > 0)) return;
        const wild = randomEncounter(mapDef.zoneTypes, mapDef.levelRange);
        if (!wild) return;
        const seen = g.pokedexSeen.includes(wild.speciesId)
            ? g.pokedexSeen : [...g.pokedexSeen, wild.speciesId];
        setGame(prev => prev ? { ...prev, pokedexSeen: seen } : prev);
        setBattle({ wild, mode: 'wild' });
        setScreen('battle');
    }, []);

    // ── Encuentro con entrenador NPC ──────────────────────────────────────────
    const handleTrainerEncounter = useCallback((trainer) => {
        const g = gameRef.current;
        if (!g || !g.team.some(p => p.currentHp > 0)) return;

        // Construir el equipo del entrenador desde teamIds/teamLevels
        const trainerTeam = (trainer.teamIds ?? []).map((id, i) =>
            createPokemon(id, trainer.teamLevels?.[i] ?? 5)
        ).filter(Boolean);

        if (trainerTeam.length === 0) return;

        setDialog(trainer.dialog ?? `¡${trainer.name} quiere combatir!`);
        // Breve delay para mostrar el diálogo antes de empezar
        setTimeout(() => {
            setDialog(null);
            setBattle({
                mode: 'trainer',
                trainerName: trainer.name,
                trainerTeam,
                trainerId: trainer.id,
                defeatDialog: trainer.defeatDialog,
            });
            setScreen('battle');
        }, 2000);
    }, []);

    // ── Encuentro con el Rival ────────────────────────────────────────────────
    const handleRivalEncounter = useCallback((rivalDef) => {
        const g = gameRef.current;
        if (!g || !g.team.some(p => p.currentHp > 0)) return;

        const rivalStarterId = g.rivalStarterId ?? getRivalStarterId(g.starterSpeciesId ?? STARTERS[0]);
        const rivalTeam = buildRivalTeam(rivalStarterId, rivalDef.encounterKey);

        if (rivalTeam.length === 0) return;

        setDialog(rivalDef.dialog);
        setTimeout(() => {
            setDialog(null);
            setBattle({
                mode: 'trainer',
                trainerName: rivalDef.name,
                trainerTeam: rivalTeam,
                trainerId: rivalDef.id,
                defeatDialog: rivalDef.defeatDialog,
            });
            setScreen('battle');
        }, 2200);
    }, []);

    // ── Posición movida ───────────────────────────────────────────────────────
    const handleMoved = useCallback(({ map, x, y, dir }) => {
        const g = gameRef.current;
        if (g) gameRef.current = { ...g, map, x, y, dir };

        // Comprobar rival
        const g2 = gameRef.current;
        if (!g2) return;
        const defeatedRivals = g2.defeatedTrainers ?? [];
        const rivalDef = findRivalEncounter(map, x, y, defeatedRivals);
        if (rivalDef) {
            handleRivalEncounter(rivalDef);
        }
    }, [handleRivalEncounter]);

    // ── Fin de batalla ────────────────────────────────────────────────────────
    const handleBattleEnd = useCallback(({ result, team, bag, wild }) => {
        const g = gameRef.current;
        if (!g) return;
        let next = { ...g, team, bag };

        if (result === 'caught' && wild) {
            const caught = next.pokedexCaught.includes(wild.speciesId)
                ? next.pokedexCaught : [...next.pokedexCaught, wild.speciesId];
            const captured = { ...wild, currentHp: Math.max(1, wild.currentHp) };
            if (next.team.length < 6) {
                next = { ...next, team: [...next.team, captured], pokedexCaught: caught };
            } else {
                next = { ...next, box: [...next.box, captured], pokedexCaught: caught };
            }
            const inTeam = next.team.some(p => p.uid === captured.uid);
            setDialog(inTeam
                ? `¡${wild.name} se unió a tu equipo!`
                : `¡${wild.name} fue enviado a la caja!`
            );
        }

        if (result === 'trainerwin' || result === 'win') {
            if (battle?.trainerId) {
                const defeated = [...(next.defeatedTrainers ?? []), battle.trainerId];
                next = { ...next, defeatedTrainers: defeated };
                if (battle.defeatDialog) setDialog(battle.defeatDialog);
            }
        }

        if (result === 'blackout') {
            const spawn = MAPS.pueblo.spawn;
            next = {
                ...next,
                team: next.team.map(p => ({ ...p, currentHp: p.maxHp })),
                map: 'pueblo', x: spawn.x, y: spawn.y, dir: spawn.dir,
            };
            setDialog('Corriste de vuelta a Pueblo Órbita y tus Pokémon descansaron...');
        }

        setBattle(null);
        persist(next);
        setScreen('world');
    }, [persist, battle]);

    // ── Elegir inicial ────────────────────────────────────────────────────────
    const chooseStarter = useCallback((speciesId) => {
        const g = gameRef.current;
        if (!g) return;
        const starter = createPokemon(speciesId, 5);
        const rivalId = getRivalStarterId(speciesId);
        const next = {
            ...g,
            team: [starter],
            hasStarter: true,
            starterSpeciesId: speciesId,
            rivalStarterId: rivalId,
            defeatedTrainers: g.defeatedTrainers ?? [],
            pokedexSeen: [...new Set([...g.pokedexSeen, speciesId])],
            pokedexCaught: [...new Set([...g.pokedexCaught, speciesId])],
        };
        persist(next);
        setScreen('world');
        setDialog(`PROF. COSMO: «¡Excelente elección! Cuida mucho a ${starter.name}. ¡Tu aventura por la región Satélite comienza ahora!»`);
    }, [persist]);

    // ── Pantalla: TITLE ───────────────────────────────────────────────────────
    if (screen === 'title') {
        return (
            <TitleScreen
                hasSave={hasSave}
                onContinue={() => {
                    const saved = loadGame();
                    if (saved) {
                        const withDefaults = {
                            defeatedTrainers: [],
                            ...saved,
                        };
                        setGame(withDefaults);
                        setScreen('world');
                    }
                }}
                onNew={() => setScreen('charselect')}
                onDelete={() => {
                    if (window.confirm('¿Borrar la partida guardada? Esta acción no se puede deshacer.')) {
                        deleteSave();
                        setGame(null);
                        setScreen('title');
                    }
                }}
                onExit={() => navigate('/')}
            />
        );
    }

    // ── Pantalla: CHARSELECT ──────────────────────────────────────────────────
    if (screen === 'charselect') {
        return (
            <CharSelectScreen
                onStart={(trainer, name) => {
                    const fresh = {
                        ...newGameState(trainer, name),
                        defeatedTrainers: [],
                        starterSpeciesId: null,
                        rivalStarterId: null,
                    };
                    persist(fresh);
                    setScreen('world');
                    setDialog(`¡Bienvenido a la región Satélite, ${fresh.playerName}! Visita el LABORATORIO (techo azul) para recibir tu primer Pokémon.`);
                }}
                onBack={() => setScreen('title')}
            />
        );
    }

    // ── Pantalla: STARTER ─────────────────────────────────────────────────────
    if (screen === 'starter') {
        return <StarterScreen onChoose={chooseStarter} />;
    }

    // ── Pantalla: BATTLE ──────────────────────────────────────────────────────
    if (screen === 'battle' && battle && game) {
        return (
            <div className="ga-container">
                <div className="gba-shell">
                    <div className="gba-screen-bezel">
                        <GameBattle
                            wild={battle.mode === 'wild' ? battle.wild : null}
                            team={game.team}
                            bag={game.bag}
                            mode={battle.mode}
                            trainerName={battle.trainerName ?? ''}
                            trainerTeam={battle.trainerTeam ?? []}
                            onEnd={handleBattleEnd}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ── Pantalla: MENU ────────────────────────────────────────────────────────
    if (screen === 'menu' && game) {
        return (
            <MenuScreen
                game={game}
                onSaveAndPlay={() => {
                    saveGame(gameRef.current);
                    setDialog('¡Partida guardada!');
                    setScreen('world');
                }}
                onPlay={() => setScreen('world')}
                onTitle={() => { saveGame(gameRef.current); setScreen('title'); }}
            />
        );
    }

    // ── Pantalla: WORLD ───────────────────────────────────────────────────────
    if (!game) { setScreen('title'); return null; }

    return (
        <div className="ga-container ga-world">
            <div className="gba-shell">
                {/* Pantalla */}
                <div className="gba-screen-bezel">
                    <WorldCanvas
                        gameState={game}
                        onAction={handleAction}
                        onEncounter={handleEncounter}
                        onMoved={handleMoved}
                        onTrainerEncounter={handleTrainerEncounter}
                        paused={!!dialog}
                    />
                </div>

                {/* Controles GBA CSS */}
                <div className="gba-controls">
                    {/* D-pad (izquierda) */}
                    <div className="gba-dpad-wrap">
                        <div className="dpad-grid">
                            <button className="dpad-btn up"    onPointerDown={() => {}} onPointerUp={() => {}}>▲</button>
                            <button className="dpad-btn left"  onPointerDown={() => {}} onPointerUp={() => {}}>◀</button>
                            <button className="dpad-btn right" onPointerDown={() => {}} onPointerUp={() => {}}>▶</button>
                            <button className="dpad-btn down"  onPointerDown={() => {}} onPointerUp={() => {}}>▼</button>
                        </div>
                    </div>

                    {/* Centro: botón menú + indicador */}
                    <div className="gba-center-btns">
                        <button className="gba-small-btn" onClick={() => { syncPosition(); setScreen('menu'); }}>
                            SELECT
                        </button>
                        <button className="gba-small-btn" onClick={() => { syncPosition(); setScreen('menu'); }}>
                            START
                        </button>
                    </div>

                    {/* Botones A/B (derecha) */}
                    <div className="gba-ab-btns">
                        <button className="gba-b-btn" onClick={() => setDialog(null)}>B</button>
                        <button className="gba-a-btn" onClick={() => setDialog(null)}>A</button>
                    </div>
                </div>
            </div>

            {/* Botón menú flotante */}
            <button
                className="ga-menu-btn"
                onClick={() => { syncPosition(); setScreen('menu'); }}
            >
                ☰ MENÚ
            </button>

            {/* Diálogo */}
            {dialog && (
                <div className="ga-dialog" onClick={() => setDialog(null)}>
                    <p>{dialog}</p>
                    <span className="ga-dialog-hint">▼ toca para continuar</span>
                </div>
            )}
        </div>
    );
}
