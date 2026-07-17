// src/components/PokemonBattleSelector.js
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PokeBallSpinner from './PokeBallSpinner';
import { POKEMON_TYPES as TYPE_DISPLAY } from '../utils/pokemonTypes';
import { buildMovePool, getPokemonTypes } from '../data/moveDatabase';
import { pickRandomTeam, buildRandomMovesMap } from '../utils/randomBattleUtils';
import './PokemonBattleSelector.css';

const ALL_POKEMON_GENERATIONS = [
    { id: 'all', name: 'Todas' },
    { id: 1, limit: 151, offset: 0,   name: 'Generación 1' },
    { id: 2, limit: 100, offset: 151, name: 'Generación 2' },
    { id: 3, limit: 135, offset: 251, name: 'Generación 3' },
    { id: 4, limit: 107, offset: 386, name: 'Generación 4' },
    { id: 5, limit: 156, offset: 493, name: 'Generación 5' },
    { id: 6, limit: 72,  offset: 649, name: 'Generación 6' },
    { id: 7, limit: 88,  offset: 721, name: 'Generación 7' },
    { id: 8, limit: 96,  offset: 809, name: 'Generación 8' },
    { id: 9, limit: 120, offset: 905, name: 'Generación 9' },
    { id: 'special', name: 'Especiales' },
];

const LAZY_BATCH = 30;

const formatPokemonId = (id) => String(id).padStart(3, '0');
const getPokemonImageUrl = (p) =>
    p.imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

const TypeBadge = ({ typeName }) => {
    const info = TYPE_DISPLAY[typeName] || { name: typeName, color: '#888' };
    return (
        <span className="pokemon-type-badge pokemon-type-badge-small" style={{ backgroundColor: info.color }}>
            {info.name}
        </span>
    );
};

const TeamPreview = React.memo(({ team, teamSize, onRemove }) => (
    <div className="team-preview-container">
        {Array.from({ length: teamSize }).map((_, i) => {
            const pokemon = team[i];
            return (
                <div key={i} className="team-slot">
                    {pokemon ? (
                        <>
                            <img src={getPokemonImageUrl(pokemon)} alt={pokemon.name} />
                            <button onClick={() => onRemove(pokemon.id)} className="remove-pokemon-button-small" title="Eliminar">×</button>
                        </>
                    ) : (
                        <div className="empty-team-slot">?</div>
                    )}
                </div>
            );
        })}
    </div>
));

const PokemonCard = React.memo(({ pokemon, isSelected, types, onSelect }) => (
    <div
        className={`pokemon-grid-item ${isSelected ? 'selected-in-slot' : ''}`}
        onClick={() => !isSelected && onSelect(pokemon)}
        style={{ opacity: isSelected ? 0.5 : 1, cursor: isSelected ? 'default' : 'pointer' }}
    >
        <img src={getPokemonImageUrl(pokemon)} alt={pokemon.name} className="pokemon-grid-image" loading="lazy" />
        <span className="pokemon-grid-name">#{formatPokemonId(pokemon.id)} {pokemon.name}</span>
        <div className="pokemon-grid-types-container">
            {types.map(t => <TypeBadge key={t} typeName={t} />)}
        </div>
    </div>
));

const groupByType = (moves) => {
    const groups = {};
    moves.forEach(m => {
        if (!groups[m.type]) groups[m.type] = [];
        groups[m.type].push(m);
    });
    return groups;
};

const MovePicker = ({ move, slotIndex, pool, onSelect }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const typeColor = move ? (TYPE_DISPLAY[move.type]?.color || '#555') : '#444';
    const typeName  = move ? (TYPE_DISPLAY[move.type]?.name  || move.type) : '—';

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const grouped = useMemo(() => groupByType(pool), [pool]);

    return (
        <div className="move-picker-wrapper" ref={ref}>
            <div
                className="move-picker-slot"
                style={{ borderColor: typeColor, background: `${typeColor}22` }}
                onClick={() => setOpen(o => !o)}
            >
                <span className="move-slot-number">T{slotIndex + 1}</span>
                <span className="move-slot-type-dot" style={{ background: typeColor }} />
                <span className="move-slot-name">{move ? move.name.toUpperCase() : 'SIN TÉCNICA'}</span>
                <div className="move-slot-meta">
                    <span className="move-slot-type-label" style={{ background: typeColor }}>{typeName}</span>
                    {move && <span className="move-slot-power">{move.damage_class === 'status' ? 'APOYO' : `PWR ${move.power === Infinity ? '∞' : move.power}`}</span>}
                </div>
                <span className="move-slot-arrow">{open ? '▲' : '▼'}</span>
            </div>

            {open && (
                <div className="move-picker-dropdown">
                    {Object.entries(grouped).map(([type, moves]) => {
                        const color = TYPE_DISPLAY[type]?.color || '#888';
                        const label = TYPE_DISPLAY[type]?.name || type;
                        return (
                            <div key={type} className="move-group">
                                <div className="move-group-header" style={{ background: color }}>
                                    {label}
                                </div>
                                {moves.map(m => (
                                    <div
                                        key={m.name}
                                        className={`move-option ${move?.name === m.name ? 'selected' : ''}`}
                                        style={{ borderLeft: `4px solid ${color}` }}
                                        onClick={() => { onSelect(m); setOpen(false); }}
                                    >
                                        <span className="move-option-name">{m.name}</span>
                                        <span className="move-option-power" style={{ color }}>
                                            {m.damage_class === 'status' ? 'APOYO' : `PWR ${m.power === Infinity ? '∞' : m.power}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Tarjeta de configuración de técnicas de un Pokémon; memoiza su pool de
// movimientos por poke.id/apiPool para no recalcularlo en cada render del padre.
const PokeConfigCard = React.memo(function PokeConfigCard({ poke, moves, apiPool, onSelectMove }) {
    // onSelectMove es la referencia estable handleMoveSelect(pokemonId, slotIndex, move);
    // aquí solo se le antepone el pokemonId con una currificación memoizada.
    const handleSelect = useCallback((idx, m) => onSelectMove(poke.id, idx, m), [onSelectMove, poke.id]);
    const types = useMemo(() => getPokemonTypes(poke), [poke]);
    const pool = useMemo(() => {
        const staticPool = buildMovePool(types);
        return [...staticPool, ...(apiPool || [])].filter(
            (m, i, s) => i === s.findIndex(x => x.name === m.name)
        );
    }, [types, apiPool]);
    const mainColor = TYPE_DISPLAY[types[0]]?.color || '#888';

    return (
        <div className="poke-config-card" style={{ borderColor: mainColor }}>
            <div className="poke-config-header">
                <img src={getPokemonImageUrl(poke)} alt={poke.name} className="poke-config-sprite" />
                <div>
                    <h3 className="poke-config-name">{poke.name}</h3>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                        {types.map(t => <TypeBadge key={t} typeName={t} />)}
                    </div>
                </div>
            </div>

            <div className="poke-config-moves">
                {[0, 1, 2, 3].map(idx => (
                    <MovePicker
                        key={idx}
                        move={moves[idx] || null}
                        slotIndex={idx}
                        pool={pool}
                        onSelect={(m) => handleSelect(idx, m)}
                    />
                ))}
            </div>
        </div>
    );
});

function PokemonBattleSelector({ pokemonList }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { gameMode } = location.state || { gameMode: 'vsIA' };
    const isVsPlayer = gameMode === 'vsPlayer';

    const [player1Team, setPlayer1Team] = useState([]);
    const [player2Team, setPlayer2Team] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [teamSize] = useState(3);
    const [isConfiguringMoves, setIsConfiguringMoves] = useState(false);
    const [showPlayerTransition, setShowPlayerTransition] = useState(false);
    const [selectedMovesP1, setSelectedMovesP1] = useState({});
    const [selectedMovesP2, setSelectedMovesP2] = useState({});

    const [selectedGeneration, setSelectedGeneration] = useState('1');
    const [isGenMenuOpen, setIsGenMenuOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(LAZY_BATCH);
    const sentinelRef = useRef(null);
    const continueRef = useRef(null);

    const [apiMovePool, setApiMovePool] = useState({});
    const [loadingApiMoves, setLoadingApiMoves] = useState(false);

    const currentTeam = currentPlayer === 1 ? player1Team : player2Team;

    const availablePokemon = useMemo(() => {
        if (selectedGeneration === 'all') return pokemonList;
        if (selectedGeneration === 'special') return pokemonList.filter(p => p.isSpecial);
        const gen = ALL_POKEMON_GENERATIONS.find(g => g.id.toString() === selectedGeneration);
        if (gen?.offset !== undefined) {
            return pokemonList.filter(p => !p.isSpecial && p.id > gen.offset && p.id <= gen.offset + gen.limit);
        }
        return pokemonList;
    }, [pokemonList, selectedGeneration]);

    const visiblePokemon = useMemo(() => availablePokemon.slice(0, visibleCount), [availablePokemon, visibleCount]);

    const loadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + LAZY_BATCH, availablePokemon.length));
    }, [availablePokemon.length]);

    useEffect(() => { setVisibleCount(LAZY_BATCH); }, [selectedGeneration]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) loadMore(); },
            { rootMargin: '200px' }
        );
        obs.observe(sentinel);
        return () => obs.disconnect();
    }, [loadMore]);

    const handleSelectPokemon = useCallback((pokemon) => {
        const setTeam = currentPlayer === 1 ? setPlayer1Team : setPlayer2Team;
        const setMoves = currentPlayer === 1 ? setSelectedMovesP1 : setSelectedMovesP2;
        setTeam(prev => {
            if (prev.length >= teamSize) { alert(`¡Ya has seleccionado ${teamSize} Pokémon!`); return prev; }
            if (prev.some(p => p.id === pokemon.id)) { alert("¡Ya has seleccionado este Pokémon!"); return prev; }
            const pool = buildMovePool(getPokemonTypes(pokemon));
            setMoves(m => ({ ...m, [pokemon.id]: pool.slice(0, 4) }));
            const next = [...prev, pokemon];
            if (next.length === teamSize)
                setTimeout(() => continueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
            return next;
        });
    }, [currentPlayer, teamSize]);

    const handleRemovePokemon = useCallback((pokemonId) => {
        (currentPlayer === 1 ? setPlayer1Team : setPlayer2Team)(prev => prev.filter(p => p.id !== pokemonId));
        (currentPlayer === 1 ? setSelectedMovesP1 : setSelectedMovesP2)(m => { const n = { ...m }; delete n[pokemonId]; return n; });
    }, [currentPlayer]);

    // Fetch API moves for the current player's team whenever move config opens
    useEffect(() => {
        if (!isConfiguringMoves) return;
        const team = currentPlayer === 1 ? player1Team : player2Team;
        if (team.length === 0) return;
        const ctrl = new AbortController();
        const { signal } = ctrl;

        const fetchApiMoves = async () => {
            setLoadingApiMoves(true);
            setApiMovePool({});
            const pools = {};

            await Promise.all(team.map(async (poke) => {
                try {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${poke.id}`, { signal });
                    if (!res.ok) throw new Error(res.status);
                    const data = await res.json();

                    const moveUrls = data.moves
                        .filter(m => m.version_group_details.some(d =>
                            ['level-up', 'machine', 'tutor'].includes(d.move_learn_method.name)
                        ))
                        .map(m => m.move.url)
                        .slice(0, 36);

                    const details = await Promise.all(moveUrls.map(async url => {
                        try {
                            const r = await fetch(url, { signal });
                            if (!r.ok) return null;
                            const d = await r.json();
                            if (d.power == null && d.damage_class?.name !== 'status') return null;
                            const esName = d.names?.find(n => n.language.name === 'es')?.name;
                            return {
                                name: esName || d.name,
                                power: d.power ?? 0,
                                accuracy: d.accuracy ?? 100,
                                type: d.type.name,
                                damage_class: d.damage_class?.name || 'physical',
                            };
                        } catch { return null; }
                    }));

                    pools[poke.id] = details.filter(Boolean);
                } catch { pools[poke.id] = []; }
            }));

            if (!signal.aborted) {
                setApiMovePool(pools);
                setLoadingApiMoves(false);
            }
        };

        fetchApiMoves();
        return () => ctrl.abort();
    }, [isConfiguringMoves, currentPlayer]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleMoveSelect = useCallback((pokemonId, slotIndex, move) => {
        (currentPlayer === 1 ? setSelectedMovesP1 : setSelectedMovesP2)(prev => {
            const curr = [...(prev[pokemonId] || [])];
            curr[slotIndex] = move;
            return { ...prev, [pokemonId]: curr };
        });
    }, [currentPlayer]);

    const handleStartBattle = () => {
        let finalP2Team = player2Team;
        let finalMovesP2 = selectedMovesP2;
        if (!isVsPlayer) {
            finalP2Team = pickRandomTeam(pokemonList, teamSize, player1Team.map(p => p.id));
            finalMovesP2 = buildRandomMovesMap(finalP2Team);
        }
        navigate(
            `/battle/arena?p1=${player1Team.map(p => p.id).join(',')}&p2=${finalP2Team.map(p => p.id).join(',')}&mode=${gameMode}`,
            { state: { customMovesP1: selectedMovesP1, customMovesP2: finalMovesP2 } }
        );
    };

    // Rellena el equipo del jugador actual con Pokémon y técnicas al azar
    // (excluye lo ya elegido por el otro entrenador en modo vsPlayer).
    const handleRandomTeam = useCallback(() => {
        const otherTeam = currentPlayer === 1 ? player2Team : player1Team;
        const randomTeam = pickRandomTeam(pokemonList, teamSize, otherTeam.map(p => p.id));
        const randomMoves = buildRandomMovesMap(randomTeam);
        (currentPlayer === 1 ? setPlayer1Team : setPlayer2Team)(randomTeam);
        (currentPlayer === 1 ? setSelectedMovesP1 : setSelectedMovesP2)(randomMoves);
        setIsGenMenuOpen(false);
    }, [currentPlayer, player1Team, player2Team, pokemonList, teamSize]);

    // ── Pantalla de transición entre J1 y J2 ─────────────────────────────────
    if (showPlayerTransition) {
        return (
            <div className="battle-selector-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    padding: '48px 40px',
                    textAlign: 'center',
                    maxWidth: '420px',
                    width: '100%',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎮</div>
                    <h2 style={{ color: '#ffcb05', fontFamily: "'Press Start 2P', monospace", fontSize: '0.85em', marginBottom: '16px' }}>
                        ¡Turno del Jugador 2!
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace', fontSize: '0.95em', lineHeight: 1.6, marginBottom: '32px' }}>
                        Pasa el dispositivo al Jugador 2.<br />
                        El Jugador 1 ya configuró su equipo.
                    </p>
                    <button
                        className="start-battle-button"
                        onClick={() => {
                            setShowPlayerTransition(false);
                            setCurrentPlayer(2);
                            setIsConfiguringMoves(false);
                            setVisibleCount(LAZY_BATCH);
                        }}
                    >
                        ¡Listo, Jugador 2! →
                    </button>
                </div>
            </div>
        );
    }

    // ── Pantalla de configuración de técnicas ─────────────────────────────────
    if (isConfiguringMoves) {
        const team = currentPlayer === 1 ? player1Team : player2Team;
        const selectedMoves = currentPlayer === 1 ? selectedMovesP1 : selectedMovesP2;

        return (
            <div className="battle-selector-container">
                <h1 style={{ color: 'white', textShadow: '2px 2px 4px black' }}>
                    {isVsPlayer ? `Jugador ${currentPlayer} — ` : ''}Configura las Técnicas
                </h1>

                {loadingApiMoves && (
                    <div style={{ marginBottom: '10px' }}>
                        <PokeBallSpinner text="Cargando técnicas..." size={40} />
                    </div>
                )}

                <div className="team-config-grid">
                    {team.map(poke => (
                        <PokeConfigCard
                            key={poke.id}
                            poke={poke}
                            moves={selectedMoves[poke.id] || []}
                            apiPool={apiMovePool[poke.id]}
                            onSelectMove={handleMoveSelect}
                        />
                    ))}
                </div>

                <div className="config-actions">
                    <button onClick={() => setIsConfiguringMoves(false)} className="back-btn">Volver</button>
                    {isVsPlayer && currentPlayer === 1 ? (
                        <button onClick={() => setShowPlayerTransition(true)} className="start-battle-button">
                            Continuar → J2
                        </button>
                    ) : (
                        <button onClick={handleStartBattle} className="start-battle-button">¡LUCHAR!</button>
                    )}
                </div>
            </div>
        );
    }

    // ── Pantalla de selección de Pokémon ──────────────────────────────────────
    const currentGenName = ALL_POKEMON_GENERATIONS.find(g => g.id.toString() === selectedGeneration)?.name || 'Seleccionar';

    return (
        <div className="battle-selector-container">
            <Link to="/battle" className="back-to-pokedex-top">&lt; Cambiar Modo</Link>
            <h1>
                {isVsPlayer ? `Jugador ${currentPlayer} — ` : ''}Elige tu Equipo (3 Pokémon)
            </h1>
            <TeamPreview team={currentTeam} teamSize={teamSize} onRemove={handleRemovePokemon} />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    ref={continueRef}
                    onClick={() => currentTeam.length === teamSize ? setIsConfiguringMoves(true) : alert(`Debes seleccionar ${teamSize} Pokémon.`)}
                    className="start-battle-button"
                    disabled={currentTeam.length !== teamSize}
                >
                    Continuar a Configuración
                </button>
                <button
                    onClick={handleRandomTeam}
                    className="start-battle-button"
                    style={{ background: 'linear-gradient(160deg, #8848c8, #5a2ea0)' }}
                    title="Elige 3 Pokémon y sus técnicas al azar"
                >
                    🎲 Equipo Aleatorio
                </button>
            </div>
            <div className="battle-controls-container">
                <div className="generation-filter-container">
                    <button onClick={() => setIsGenMenuOpen(o => !o)} className="generation-button">{currentGenName}</button>
                    {isGenMenuOpen && (
                        <ul className="generation-dropdown-menu">
                            {ALL_POKEMON_GENERATIONS.map(gen => (
                                <li
                                    key={gen.id}
                                    onClick={() => { setSelectedGeneration(gen.id.toString()); setIsGenMenuOpen(false); }}
                                    className={selectedGeneration === gen.id.toString() ? 'active' : ''}
                                >
                                    {gen.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="available-pokemon-grid">
                {visiblePokemon.map(pokemon => (
                    <PokemonCard
                        key={pokemon.id}
                        pokemon={pokemon}
                        isSelected={currentTeam.some(p => p.id === pokemon.id)}
                        types={getPokemonTypes(pokemon)}
                        onSelect={handleSelectPokemon}
                    />
                ))}
            </div>
            {visibleCount < availablePokemon.length && (
                <div ref={sentinelRef} style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8em' }}>Cargando más...</span>
                </div>
            )}
        </div>
    );
}

export default PokemonBattleSelector;
