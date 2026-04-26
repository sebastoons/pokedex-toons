// src/components/PokemonBattleSelector.js
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PokeBallSpinner from './PokeBallSpinner';
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

const TYPE_DISPLAY = {
    normal:   { name: 'Normal',    color: '#A8A878' },
    fire:     { name: 'Fuego',     color: '#F08030' },
    water:    { name: 'Agua',      color: '#6890F0' },
    grass:    { name: 'Planta',    color: '#78C850' },
    electric: { name: 'Eléctrico', color: '#F8D030' },
    ice:      { name: 'Hielo',     color: '#98D8D8' },
    fighting: { name: 'Lucha',     color: '#C03028' },
    poison:   { name: 'Veneno',    color: '#A040A0' },
    ground:   { name: 'Tierra',    color: '#E0C068' },
    flying:   { name: 'Volador',   color: '#A890F0' },
    psychic:  { name: 'Psíquico',  color: '#F85888' },
    bug:      { name: 'Bicho',     color: '#A8B820' },
    rock:     { name: 'Roca',      color: '#B8A038' },
    ghost:    { name: 'Fantasma',  color: '#705898' },
    dragon:   { name: 'Dragón',    color: '#7038F8' },
    dark:     { name: 'Siniestro', color: '#705848' },
    steel:    { name: 'Acero',     color: '#B8B8D0' },
    fairy:    { name: 'Hada',      color: '#EE99AC' },
};

const MOVES_DATABASE = {
    normal: [
        { name: "Placaje",      power: 40,  accuracy: 100,      type: "normal" },
        { name: "Arañazo",      power: 40,  accuracy: 100,      type: "normal" },
        { name: "Corte",        power: 50,  accuracy: 95,       type: "normal" },
        { name: "Golpe Cuerpo", power: 85,  accuracy: 100,      type: "normal" },
        { name: "Hiperrayo",    power: 150, accuracy: 90,       type: "normal" },
        { name: "Rapidez",      power: 60,  accuracy: Infinity, type: "normal" },
    ],
    fire: [
        { name: "Ascuas",       power: 40,  accuracy: 100, type: "fire" },
        { name: "Lanzallamas",  power: 90,  accuracy: 100, type: "fire" },
        { name: "Llamarada",    power: 110, accuracy: 85,  type: "fire" },
        { name: "Puño Fuego",   power: 75,  accuracy: 100, type: "fire" },
    ],
    water: [
        { name: "Pistola Agua", power: 40,  accuracy: 100, type: "water" },
        { name: "Surf",         power: 90,  accuracy: 100, type: "water" },
        { name: "Hidrobomba",   power: 110, accuracy: 80,  type: "water" },
        { name: "Rayo Burbuja", power: 65,  accuracy: 100, type: "water" },
    ],
    grass: [
        { name: "Látigo Cepa",  power: 45,  accuracy: 100, type: "grass" },
        { name: "Hoja Afilada", power: 55,  accuracy: 95,  type: "grass" },
        { name: "Rayo Solar",   power: 120, accuracy: 100, type: "grass" },
        { name: "Gigadrenado",  power: 75,  accuracy: 100, type: "grass" },
    ],
    electric: [
        { name: "Impactrueno",  power: 40,  accuracy: 100, type: "electric" },
        { name: "Rayo",         power: 90,  accuracy: 100, type: "electric" },
        { name: "Trueno",       power: 110, accuracy: 70,  type: "electric" },
        { name: "Puño Trueno",  power: 75,  accuracy: 100, type: "electric" },
    ],
    ice: [
        { name: "Rayo Hielo",   power: 90,  accuracy: 100, type: "ice" },
        { name: "Ventisca",     power: 110, accuracy: 70,  type: "ice" },
        { name: "Puño Hielo",   power: 75,  accuracy: 100, type: "ice" },
    ],
    fighting: [
        { name: "Golpe Karate", power: 50,  accuracy: 100, type: "fighting" },
        { name: "Sumisión",     power: 80,  accuracy: 80,  type: "fighting" },
        { name: "A Bocajarro",  power: 120, accuracy: 100, type: "fighting" },
    ],
    poison: [
        { name: "Ácido",        power: 40,  accuracy: 100, type: "poison" },
        { name: "Bomba Lodo",   power: 90,  accuracy: 100, type: "poison" },
        { name: "Puya Nociva",  power: 80,  accuracy: 100, type: "poison" },
    ],
    ground: [
        { name: "Terremoto",    power: 100, accuracy: 100, type: "ground" },
        { name: "Excavar",      power: 80,  accuracy: 100, type: "ground" },
        { name: "Disparo Lodo", power: 55,  accuracy: 95,  type: "ground" },
    ],
    flying: [
        { name: "Vuelo",        power: 90,  accuracy: 95,       type: "flying" },
        { name: "Picotazo",     power: 35,  accuracy: 100,      type: "flying" },
        { name: "Golpe Aéreo",  power: 60,  accuracy: Infinity, type: "flying" },
    ],
    psychic: [
        { name: "Psíquico",     power: 90,  accuracy: 100, type: "psychic" },
        { name: "Confusión",    power: 50,  accuracy: 100, type: "psychic" },
        { name: "Premonición",  power: 120, accuracy: 100, type: "psychic" },
        { name: "Cabezazo Zen", power: 80,  accuracy: 90,  type: "psychic" },
    ],
    bug: [
        { name: "Picadura",     power: 60,  accuracy: 100, type: "bug" },
        { name: "Zumbido",      power: 90,  accuracy: 100, type: "bug" },
        { name: "Tijera X",     power: 80,  accuracy: 100, type: "bug" },
    ],
    rock: [
        { name: "Lanzarrocas",  power: 50,  accuracy: 90,  type: "rock" },
        { name: "Avalancha",    power: 75,  accuracy: 90,  type: "rock" },
        { name: "Roca Afilada", power: 100, accuracy: 80,  type: "rock" },
    ],
    ghost: [
        { name: "Lengüetazo",   power: 30,  accuracy: 100, type: "ghost" },
        { name: "Bola Sombra",  power: 80,  accuracy: 100, type: "ghost" },
        { name: "Garra Umbría", power: 70,  accuracy: 100, type: "ghost" },
    ],
    dragon: [
        { name: "Garra Dragón", power: 80,  accuracy: 100, type: "dragon" },
        { name: "Pulso Dragón", power: 85,  accuracy: 100, type: "dragon" },
        { name: "Cometa Draco", power: 130, accuracy: 90,  type: "dragon" },
    ],
    dark: [
        { name: "Mordisco",     power: 60,  accuracy: 100, type: "dark" },
        { name: "Triturar",     power: 80,  accuracy: 100, type: "dark" },
        { name: "Pulso Umbrío", power: 80,  accuracy: 100, type: "dark" },
    ],
    steel: [
        { name: "Garra Metal",       power: 50, accuracy: 95,  type: "steel" },
        { name: "Foco Resplandor",   power: 80, accuracy: 100, type: "steel" },
        { name: "Cabeza de Hierro",  power: 80, accuracy: 100, type: "steel" },
        { name: "Puño Meteoro",      power: 90, accuracy: 90,  type: "steel" },
    ],
    fairy: [
        { name: "Viento Feérico",    power: 40, accuracy: 100, type: "fairy" },
        { name: "Brillo Mágico",     power: 80, accuracy: 100, type: "fairy" },
        { name: "Fuerza Lunar",      power: 95, accuracy: 100, type: "fairy" },
    ],
};

const LAZY_BATCH = 30;

const formatPokemonId = (id) => String(id).padStart(3, '0');
const getPokemonImageUrl = (p) =>
    p.imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

const getPokemonTypes = (pokemon) => {
    if (pokemon.types && Array.isArray(pokemon.types)) {
        if (typeof pokemon.types[0] === 'string') return pokemon.types;
        if (pokemon.types[0]?.type?.name) return pokemon.types.map(t => t.type.name);
    }
    return ['normal'];
};

const TypeBadge = ({ typeName }) => {
    const info = TYPE_DISPLAY[typeName] || { name: typeName, color: '#888' };
    return (
        <span className="pokemon-type-badge pokemon-type-badge-small" style={{ backgroundColor: info.color }}>
            {info.name}
        </span>
    );
};

const TeamPreview = ({ team, teamSize, onRemove }) => (
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
);

const buildMovePool = (types) => {
    let pool = [];
    types.forEach(t => { pool = [...pool, ...(MOVES_DATABASE[t] || [])]; });
    pool = [...pool, ...MOVES_DATABASE['normal']];
    return pool.filter((m, i, s) => i === s.findIndex(x => x.name === m.name));
};

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
                    {move && <span className="move-slot-power">PWR {move.power === Infinity ? '∞' : move.power}</span>}
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
                                            PWR {m.power === Infinity ? '∞' : m.power}
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

function PokemonBattleSelector({ pokemonList }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { gameMode } = location.state || { gameMode: 'vsIA' };

    const [player1Team, setPlayer1Team] = useState([]);
    const [player2Team] = useState([]);
    const [currentPlayer] = useState(1);
    const [teamSize] = useState(3);
    const [isConfiguringMoves, setIsConfiguringMoves] = useState(false);
    const [selectedMovesP1, setSelectedMovesP1] = useState({});

    const [selectedGeneration, setSelectedGeneration] = useState('1');
    const [isGenMenuOpen, setIsGenMenuOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(LAZY_BATCH);
    const sentinelRef = useRef(null);

    const [apiMovePool, setApiMovePool] = useState({});
    const [loadingApiMoves, setLoadingApiMoves] = useState(false);

    const currentTeam = currentPlayer === 1 ? player1Team : player2Team;
    const setCurrentTeam = currentPlayer === 1 ? setPlayer1Team : () => {};

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

    const handleSelectPokemon = (pokemon) => {
        if (currentTeam.length >= teamSize) { alert(`¡Ya has seleccionado ${teamSize} Pokémon!`); return; }
        if (currentTeam.some(p => p.id === pokemon.id)) { alert("¡Ya has seleccionado este Pokémon!"); return; }
        const pool = buildMovePool(getPokemonTypes(pokemon));
        if (currentPlayer === 1) setSelectedMovesP1(prev => ({ ...prev, [pokemon.id]: pool.slice(0, 4) }));
        setCurrentTeam([...currentTeam, pokemon]);
    };

    const handleRemovePokemon = (pokemonId) => {
        setCurrentTeam(currentTeam.filter(p => p.id !== pokemonId));
        if (currentPlayer === 1) {
            const m = { ...selectedMovesP1 };
            delete m[pokemonId];
            setSelectedMovesP1(m);
        }
    };

    useEffect(() => {
        if (!isConfiguringMoves || player1Team.length === 0) return;
        const ctrl = new AbortController();
        const { signal } = ctrl;

        const fetchApiMoves = async () => {
            setLoadingApiMoves(true);
            const pools = {};

            await Promise.all(player1Team.map(async (poke) => {
                try {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${poke.id}`, { signal });
                    const data = await res.json();

                    const moveUrls = data.moves
                        .filter(m => m.version_group_details.some(d =>
                            ['level-up', 'machine', 'tutor'].includes(d.move_learn_method.name)
                        ))
                        .map(m => m.move.url)
                        .slice(0, 24);

                    const details = await Promise.all(moveUrls.map(async url => {
                        try {
                            const r = await fetch(url, { signal });
                            const d = await r.json();
                            if (!d.power) return null;
                            const esName = d.names?.find(n => n.language.name === 'es')?.name;
                            return {
                                name: esName || d.name,
                                power: d.power,
                                accuracy: d.accuracy || 100,
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
    }, [isConfiguringMoves]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleMoveSelect = (pokemonId, slotIndex, move) => {
        setSelectedMovesP1(prev => {
            const current = [...(prev[pokemonId] || [])];
            current[slotIndex] = move;
            return { ...prev, [pokemonId]: current };
        });
    };

    const handleStartBattle = () => {
        let finalP2Team = player2Team;
        if (gameMode === 'vsIA') {
            finalP2Team = [...pokemonList]
                .filter(p => !player1Team.some(s => s.id === p.id))
                .sort(() => 0.5 - Math.random())
                .slice(0, teamSize);
        }
        navigate(`/battle/arena?p1=${player1Team.map(p=>p.id).join(',')}&p2=${finalP2Team.map(p=>p.id).join(',')}&mode=${gameMode}`, {
            state: { customMovesP1: selectedMovesP1 },
        });
    };

    if (isConfiguringMoves) {
        return (
            <div className="battle-selector-container">
                <h1 style={{ color: 'white', textShadow: '2px 2px 4px black' }}>Configura las Técnicas</h1>

                {loadingApiMoves && (
                    <div style={{ marginBottom: '10px' }}>
                        <PokeBallSpinner text="Cargando técnicas..." size={40} />
                    </div>
                )}

                <div className="team-config-grid">
                    {player1Team.map(poke => {
                        const types = getPokemonTypes(poke);
                        const staticPool = buildMovePool(types);
                        const apiPool = apiMovePool[poke.id] || [];
                        const pool = [...staticPool, ...apiPool].filter(
                            (m, i, s) => i === s.findIndex(x => x.name === m.name)
                        );
                        const mainColor = TYPE_DISPLAY[types[0]]?.color || '#888';
                        const moves = selectedMovesP1[poke.id] || [];

                        return (
                            <div key={poke.id} className="poke-config-card" style={{ borderColor: mainColor }}>
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
                                    {[0,1,2,3].map(idx => (
                                        <MovePicker
                                            key={idx}
                                            move={moves[idx] || null}
                                            slotIndex={idx}
                                            pool={pool}
                                            onSelect={(m) => handleMoveSelect(poke.id, idx, m)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="config-actions">
                    <button onClick={() => setIsConfiguringMoves(false)} className="back-btn">Volver</button>
                    <button onClick={handleStartBattle} className="start-battle-button">¡LUCHAR!</button>
                </div>
            </div>
        );
    }

    const currentGenName = ALL_POKEMON_GENERATIONS.find(g => g.id.toString() === selectedGeneration)?.name || 'Seleccionar';

    return (
        <div className="battle-selector-container">
            <Link to="/battle" className="back-to-pokedex-top">&lt; Cambiar Modo</Link>
            <h1>Elige tu Equipo (3 Pokémon)</h1>
            <TeamPreview team={currentTeam} teamSize={teamSize} onRemove={handleRemovePokemon} />
            <button onClick={() => currentTeam.length === teamSize ? setIsConfiguringMoves(true) : alert(`Debes seleccionar ${teamSize} Pokémon.`)} className="start-battle-button" disabled={currentTeam.length !== teamSize}>
                Continuar a Configuración
            </button>
            <div className="battle-controls-container">
                <div className="generation-filter-container">
                    <button onClick={() => setIsGenMenuOpen(o => !o)} className="generation-button">{currentGenName}</button>
                    {isGenMenuOpen && (
                        <ul className="generation-dropdown-menu">
                            {ALL_POKEMON_GENERATIONS.map(gen => (
                                <li key={gen.id} onClick={() => { setSelectedGeneration(gen.id.toString()); setIsGenMenuOpen(false); }} className={selectedGeneration === gen.id.toString() ? 'active' : ''}>
                                    {gen.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="available-pokemon-grid">
                {visiblePokemon.map(pokemon => {
                    const types = getPokemonTypes(pokemon);
                    const isSelected = currentTeam.some(p => p.id === pokemon.id);
                    return (
                        <div key={pokemon.id} className={`pokemon-grid-item ${isSelected ? 'selected-in-slot' : ''}`} onClick={() => !isSelected && handleSelectPokemon(pokemon)} style={{ opacity: isSelected ? 0.5 : 1, cursor: isSelected ? 'default' : 'pointer' }}>
                            <img src={getPokemonImageUrl(pokemon)} alt={pokemon.name} className="pokemon-grid-image" loading="lazy" />
                            <span className="pokemon-grid-name">#{formatPokemonId(pokemon.id)} {pokemon.name}</span>
                            <div className="pokemon-grid-types-container">
                                {types.map(t => <TypeBadge key={t} typeName={t} />)}
                            </div>
                        </div>
                    );
                })}
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
