// src/components/game/GameAdventure.js
// Pokémon Satélite — aventura estilo GBA dentro de la Pokédex
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldCanvas from './WorldCanvas';
import GameBattle from './GameBattle';
import { MAPS } from '../../game/maps';
import { drawHero } from '../../game/heroSprites';
import {
    TRAINERS, STARTERS, findSpecies, createPokemon, randomEncounter, generacionTotal,
} from '../../game/gameData';
import { newGameState, saveGame, loadGame, deleteSave } from '../../game/saveSystem';
import './GameAdventure.css';

// Vista previa pixel-art de un entrenador
const TrainerPreview = ({ trainer, size = 6 }) => {
    const ref = useRef(null);
    useEffect(() => {
        const ctx = ref.current.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 12 * size, 16 * size);
        ctx.setTransform(size, 0, 0, size, 0, 0);
        drawHero(ctx, trainer.gender, trainer.palette, 'down', 0, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }, [trainer, size]);
    return <canvas ref={ref} width={12 * size} height={16 * size} className="trainer-preview-canvas" />;
};

export default function GameAdventure() {
    const navigate = useNavigate();
    const [screen, setScreen] = useState('title'); // title | charselect | world | starter | battle | menu
    const [game, setGame] = useState(null);
    const [dialog, setDialog] = useState(null);
    const [battle, setBattle] = useState(null); // { wild }
    const [selGender, setSelGender] = useState('m');
    const [selTrainer, setSelTrainer] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const hasSave = !!loadGame();

    const gameRef = useRef(game);
    gameRef.current = game;

    const persist = useCallback((state) => { setGame(state); saveGame(state); }, []);

    // ── Acciones del mundo ──────────────────────────────────────────────────
    const handleAction = useCallback((action, fromMap) => {
        const g = gameRef.current;
        switch (action.type) {
            case 'warp': {
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

    const handleEncounter = useCallback((mapDef) => {
        const g = gameRef.current;
        if (!g.team.some(p => p.currentHp > 0)) return; // sin equipo no hay batalla
        const wild = randomEncounter(mapDef.zoneTypes, mapDef.levelRange);
        if (!wild) return;
        const seen = g.pokedexSeen.includes(wild.speciesId) ? g.pokedexSeen : [...g.pokedexSeen, wild.speciesId];
        setGame({ ...g, pokedexSeen: seen });
        setBattle({ wild });
        setScreen('battle');
    }, []);

    const handleMoved = useCallback(({ map, x, y, dir }) => {
        const g = gameRef.current;
        if (g) gameRef.current = { ...g, map, x, y, dir };
        // sin setState: la posición vive en el ref y se persiste en eventos clave
    }, []);

    const syncPosition = () => {
        // vuelca la posición del ref al estado (al abrir menú / batalla / guardar)
        const g = gameRef.current;
        setGame(g);
        return g;
    };

    // ── Fin de batalla ──────────────────────────────────────────────────────
    const handleBattleEnd = useCallback(({ result, team, bag, wild }) => {
        const g = gameRef.current;
        let next = { ...g, team, bag };

        if (result === 'caught') {
            const caught = next.pokedexCaught.includes(wild.speciesId)
                ? next.pokedexCaught : [...next.pokedexCaught, wild.speciesId];
            const captured = { ...wild, currentHp: Math.max(1, wild.currentHp) };
            if (next.team.length < 6) next = { ...next, team: [...next.team, captured], pokedexCaught: caught };
            else next = { ...next, box: [...next.box, captured], pokedexCaught: caught };
            setDialog(next.team.length <= 6 && next.team.some(p => p.uid === captured.uid)
                ? `¡${wild.name} se unió a tu equipo!`
                : `¡${wild.name} fue enviado a la caja!`);
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
    }, [persist]);

    // ── Elegir inicial ──────────────────────────────────────────────────────
    const chooseStarter = (speciesId) => {
        const g = gameRef.current;
        const starter = createPokemon(speciesId, 5);
        const next = {
            ...g,
            team: [starter],
            hasStarter: true,
            pokedexSeen: [...new Set([...g.pokedexSeen, speciesId])],
            pokedexCaught: [...new Set([...g.pokedexCaught, speciesId])],
        };
        persist(next);
        setScreen('world');
        setDialog(`PROF. COSMO: «¡Excelente elección! Cuida mucho a ${starter.name}. ¡Tu aventura por la región Satélite comienza ahora!»`);
    };

    // ── Pantallas ───────────────────────────────────────────────────────────
    if (screen === 'title') {
        return (
            <div className="ga-container ga-title">
                <div className="ga-title-logo">
                    <span className="ga-title-pokemon">POKÉMON</span>
                    <span className="ga-title-region">SATÉLITE</span>
                </div>
                <div className="ga-title-sub">Una aventura en la Generación Especial</div>
                <div className="ga-title-buttons">
                    {hasSave && (
                        <button className="ga-btn ga-btn-primary" onClick={() => { setGame(loadGame()); setScreen('world'); }}>
                            ▶ CONTINUAR
                        </button>
                    )}
                    <button className="ga-btn" onClick={() => setScreen('charselect')}>
                        ★ NUEVA PARTIDA
                    </button>
                    {hasSave && (
                        <button className="ga-btn ga-btn-danger" onClick={() => {
                            if (window.confirm('¿Borrar la partida guardada? Esta acción no se puede deshacer.')) {
                                deleteSave(); setGame(null); setScreen('title');
                            }
                        }}>
                            ✕ BORRAR PARTIDA
                        </button>
                    )}
                    <button className="ga-btn ga-btn-exit" onClick={() => navigate('/')}>← Salir a la Pokédex</button>
                </div>
            </div>
        );
    }

    if (screen === 'charselect') {
        const trainers = TRAINERS.filter(t => t.gender === selGender);
        return (
            <div className="ga-container ga-charselect">
                <h2 className="ga-heading">¿Quién eres?</h2>
                <div className="ga-gender-tabs">
                    <button className={`ga-tab ${selGender === 'm' ? 'active' : ''}`} onClick={() => { setSelGender('m'); setSelTrainer(null); }}>♂ CHICO</button>
                    <button className={`ga-tab ${selGender === 'f' ? 'active' : ''}`} onClick={() => { setSelGender('f'); setSelTrainer(null); }}>♀ CHICA</button>
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
                        onClick={() => {
                            const fresh = newGameState(selTrainer, playerName.trim() || selTrainer.name);
                            persist(fresh);
                            setScreen('world');
                            setDialog(`¡Bienvenido a la región Satélite, ${fresh.playerName}! Visita el LABORATORIO (techo azul) para recibir tu primer Pokémon.`);
                        }}
                    >
                        ¡EMPEZAR AVENTURA!
                    </button>
                    <button className="ga-btn ga-btn-exit" onClick={() => setScreen('title')}>← Volver</button>
                </div>
            </div>
        );
    }

    if (screen === 'starter') {
        return (
            <div className="ga-container ga-starter">
                <h2 className="ga-heading">PROF. COSMO</h2>
                <p className="ga-starter-text">«¡Bienvenido! Elige a tu compañero para explorar la región Satélite»</p>
                <div className="ga-starter-grid">
                    {STARTERS.map(id => {
                        const s = findSpecies(id);
                        if (!s) return null;
                        return (
                            <div key={id} className="ga-starter-card" onClick={() => chooseStarter(id)}>
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

    if (screen === 'battle' && battle && game) {
        return (
            <div className="ga-container">
                <GameBattle wild={battle.wild} team={game.team} bag={game.bag} onEnd={handleBattleEnd} />
            </div>
        );
    }

    if (screen === 'menu' && game) {
        const total = generacionTotal;
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
                                <div className="gb-hp-bg"><div className="gb-hp-fill" style={{ width: `${(p.currentHp / p.maxHp) * 100}%`, background: p.currentHp / p.maxHp > 0.5 ? '#3eb84a' : p.currentHp / p.maxHp > 0.2 ? '#e8c030' : '#e04838' }} /></div>
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
                <div className="ga-title-buttons">
                    <button className="ga-btn ga-btn-primary" onClick={() => { saveGame(gameRef.current); setDialog('¡Partida guardada!'); setScreen('world'); }}>💾 GUARDAR</button>
                    <button className="ga-btn" onClick={() => setScreen('world')}>← Seguir jugando</button>
                    <button className="ga-btn ga-btn-exit" onClick={() => { saveGame(gameRef.current); setScreen('title'); }}>Salir al título</button>
                </div>
            </div>
        );
    }

    // world
    if (!game) { setScreen('title'); return null; }
    return (
        <div className="ga-container ga-world">
            <WorldCanvas
                gameState={game}
                onAction={handleAction}
                onEncounter={handleEncounter}
                onMoved={handleMoved}
                paused={!!dialog}
            />
            <button className="ga-menu-btn" onClick={() => { syncPosition(); setScreen('menu'); }}>☰ MENÚ</button>
            {dialog && (
                <div className="ga-dialog" onClick={() => setDialog(null)}>
                    <p>{dialog}</p>
                    <span className="ga-dialog-hint">▼ toca para continuar</span>
                </div>
            )}
        </div>
    );
}
