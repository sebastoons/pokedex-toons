// src/components/PokemonBattleSelector.js
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PokeBallSpinner from './PokeBallSpinner';
import { POKEMON_TYPES as TYPE_DISPLAY } from '../utils/pokemonTypes';
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

const MOVES_DATABASE = {
    normal: [
        { name: "Placaje",       power: 40,  accuracy: 100,      type: "normal" },
        { name: "Arañazo",       power: 40,  accuracy: 100,      type: "normal" },
        { name: "Corte",         power: 50,  accuracy: 95,       type: "normal" },
        { name: "Golpe Cuerpo",  power: 85,  accuracy: 100,      type: "normal" },
        { name: "Hiperrayo",     power: 150, accuracy: 90,       type: "normal" },
        { name: "Rapidez",       power: 60,  accuracy: Infinity, type: "normal" },
        { name: "Danza Espada",  power: 0,   accuracy: 100,      type: "normal", damage_class: "status", statChange: { stat: "attack",  stages: 2, target: "self" } },
        { name: "Refuerzo",      power: 0,   accuracy: 100,      type: "normal", damage_class: "status", statChange: { stat: "defense", stages: 1, target: "self" } },
        { name: "Rugido",        power: 0,   accuracy: 100,      type: "normal", damage_class: "status", statChange: { stat: "attack",  stages: -1, target: "foe" } },
        { name: "Cola Látigo",   power: 0,   accuracy: 100,      type: "normal", damage_class: "status", statChange: { stat: "defense", stages: -1, target: "foe" } },
    ],
    fire: [
        { name: "Ascuas",       power: 40,  accuracy: 100, type: "fire" },
        { name: "Lanzallamas",  power: 90,  accuracy: 100, type: "fire" },
        { name: "Llamarada",    power: 110, accuracy: 85,  type: "fire" },
        { name: "Puño Fuego",   power: 75,  accuracy: 100, type: "fire" },
        { name: "Fuego Fatuo",  power: 0,   accuracy: 85,  type: "fire",     damage_class: "status" },
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
        { name: "Onda Trueno",  power: 0,   accuracy: 90,  type: "electric", damage_class: "status" },
    ],
    ice: [
        { name: "Rayo Hielo",    power: 90,  accuracy: 100, type: "ice" },
        { name: "Ventisca",      power: 110, accuracy: 70,  type: "ice" },
        { name: "Puño Hielo",    power: 75,  accuracy: 100, type: "ice" },
        { name: "Aguanieve",     power: 40,  accuracy: 100, type: "ice" },
        { name: "Colmillo Hielo",power: 65,  accuracy: 95,  type: "ice" },
        { name: "Alud",          power: 75,  accuracy: 90,  type: "ice" },
    ],
    fighting: [
        { name: "Golpe Karate",  power: 50,  accuracy: 100, type: "fighting" },
        { name: "Sumisión",      power: 80,  accuracy: 80,  type: "fighting" },
        { name: "A Bocajarro",   power: 120, accuracy: 100, type: "fighting" },
        { name: "Patada Salto",  power: 100, accuracy: 95,  type: "fighting" },
        { name: "Giro Patada",   power: 60,  accuracy: 85,  type: "fighting" },
        { name: "Paliza",        power: 80,  accuracy: 100, type: "fighting" },
        { name: "Patada Baja",   power: 40,  accuracy: 100, type: "fighting" },
        { name: "Puño Dinámico", power: 100, accuracy: 50,  type: "fighting" },
        { name: "Contraataque",  power: 65,  accuracy: 100, type: "fighting" },
    ],
    poison: [
        { name: "Ácido",         power: 40,  accuracy: 100, type: "poison" },
        { name: "Bomba Lodo",    power: 90,  accuracy: 100, type: "poison" },
        { name: "Puya Nociva",   power: 80,  accuracy: 100, type: "poison" },
        { name: "Colmillo Veneno",power: 65, accuracy: 95,  type: "poison" },
        { name: "Residuo",       power: 45,  accuracy: 100, type: "poison" },
        { name: "Tóxico",        power: 0,   accuracy: 90,  type: "poison",  damage_class: "status" },
    ],
    ground: [
        { name: "Terremoto",     power: 100, accuracy: 100, type: "ground" },
        { name: "Excavar",       power: 80,  accuracy: 100, type: "ground" },
        { name: "Disparo Lodo",  power: 55,  accuracy: 95,  type: "ground" },
        { name: "Tumba Rocas",   power: 60,  accuracy: 95,  type: "ground" },
        { name: "Golpe Sísmico", power: 60,  accuracy: 100, type: "ground" },
        { name: "Fisura",        power: 80,  accuracy: 90,  type: "ground" },
    ],
    flying: [
        { name: "Vuelo",         power: 90,  accuracy: 95,       type: "flying" },
        { name: "Picotazo",      power: 35,  accuracy: 100,      type: "flying" },
        { name: "Golpe Aéreo",   power: 60,  accuracy: Infinity, type: "flying" },
        { name: "Pájaro Osado",  power: 120, accuracy: 100,      type: "flying" },
        { name: "Golpe Pico",    power: 65,  accuracy: 95,       type: "flying" },
        { name: "Torbellino",    power: 40,  accuracy: 85,       type: "flying" },
    ],
    psychic: [
        { name: "Psíquico",      power: 90,  accuracy: 100, type: "psychic" },
        { name: "Confusión",     power: 50,  accuracy: 100, type: "psychic" },
        { name: "Premonición",   power: 120, accuracy: 100, type: "psychic" },
        { name: "Cabezazo Zen",  power: 80,  accuracy: 90,  type: "psychic" },
        { name: "Psicocorte",    power: 70,  accuracy: 100, type: "psychic" },
        { name: "Psicorrayo",    power: 65,  accuracy: 100, type: "psychic" },
        { name: "Somnífero",     power: 0,   accuracy: 55,  type: "psychic", damage_class: "status" },
    ],
    bug: [
        { name: "Picadura",      power: 60,  accuracy: 100, type: "bug" },
        { name: "Zumbido",       power: 90,  accuracy: 100, type: "bug" },
        { name: "Tijera X",      power: 80,  accuracy: 100, type: "bug" },
        { name: "Cuchillada",    power: 70,  accuracy: 100, type: "bug" },
        { name: "Ataque Polvo",  power: 35,  accuracy: 100, type: "bug" },
        { name: "Megacuerno",    power: 120, accuracy: 85,  type: "bug" },
    ],
    rock: [
        { name: "Lanzarrocas",   power: 50,  accuracy: 90,  type: "rock" },
        { name: "Avalancha",     power: 75,  accuracy: 90,  type: "rock" },
        { name: "Roca Afilada",  power: 100, accuracy: 80,  type: "rock" },
        { name: "Cabezazo Roca", power: 80,  accuracy: 85,  type: "rock" },
        { name: "Pedrada",       power: 55,  accuracy: 95,  type: "rock" },
        { name: "Romperrocas",   power: 40,  accuracy: 100, type: "rock" },
    ],
    ghost: [
        { name: "Lengüetazo",    power: 30,  accuracy: 100, type: "ghost" },
        { name: "Bola Sombra",   power: 80,  accuracy: 100, type: "ghost" },
        { name: "Garra Umbría",  power: 70,  accuracy: 100, type: "ghost" },
        { name: "Tinieblas",     power: 50,  accuracy: 100, type: "ghost" },
        { name: "Mal de Ojo",    power: 65,  accuracy: 100, type: "ghost" },
        { name: "Finta Sombra",  power: 40,  accuracy: 100, type: "ghost" },
    ],
    dragon: [
        { name: "Garra Dragón",  power: 80,  accuracy: 100, type: "dragon" },
        { name: "Pulso Dragón",  power: 85,  accuracy: 100, type: "dragon" },
        { name: "Cometa Draco",  power: 130, accuracy: 90,  type: "dragon" },
        { name: "Furia Dragón",  power: 40,  accuracy: 100, type: "dragon" },
        { name: "Cola Dragón",   power: 60,  accuracy: 90,  type: "dragon" },
        { name: "Danza Dragón",  power: 0,   accuracy: 100, type: "dragon", damage_class: "status" },
    ],
    dark: [
        { name: "Mordisco",      power: 60,  accuracy: 100, type: "dark" },
        { name: "Triturar",      power: 80,  accuracy: 100, type: "dark" },
        { name: "Pulso Umbrío",  power: 80,  accuracy: 100, type: "dark" },
        { name: "Golpe Bajo",    power: 65,  accuracy: 100, type: "dark" },
        { name: "Castigo",       power: 60,  accuracy: 100, type: "dark" },
        { name: "Mofa",          power: 55,  accuracy: 100, type: "dark" },
    ],
    steel: [
        { name: "Garra Metal",      power: 50,  accuracy: 95,  type: "steel" },
        { name: "Foco Resplandor",  power: 80,  accuracy: 100, type: "steel" },
        { name: "Cabeza de Hierro", power: 80,  accuracy: 100, type: "steel" },
        { name: "Puño Meteoro",     power: 90,  accuracy: 90,  type: "steel" },
        { name: "Defensa Férrea",   power: 65,  accuracy: 100, type: "steel" },
        { name: "Acero Ala",        power: 70,  accuracy: 90,  type: "steel" },
    ],
    fairy: [
        { name: "Viento Feérico",   power: 40,  accuracy: 100, type: "fairy" },
        { name: "Brillo Mágico",    power: 80,  accuracy: 100, type: "fairy" },
        { name: "Fuerza Lunar",     power: 95,  accuracy: 100, type: "fairy" },
        { name: "Voz Cautivadora",  power: 85,  accuracy: 90,  type: "fairy" },
        { name: "Golpe Encanto",    power: 70,  accuracy: 100, type: "fairy" },
        { name: "Danza Lunar",      power: 0,   accuracy: 100, type: "fairy", damage_class: "status" },
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
                        onSelect={(m) => onSelectMove(idx, m)}
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

    const handleMoveSelect = (pokemonId, slotIndex, move) => {
        (currentPlayer === 1 ? setSelectedMovesP1 : setSelectedMovesP2)(prev => {
            const curr = [...(prev[pokemonId] || [])];
            curr[slotIndex] = move;
            return { ...prev, [pokemonId]: curr };
        });
    };

    const handleStartBattle = () => {
        let finalP2Team = player2Team;
        let finalMovesP2 = selectedMovesP2;
        if (!isVsPlayer) {
            finalP2Team = [...pokemonList]
                .filter(p => !player1Team.some(s => s.id === p.id))
                .sort(() => 0.5 - Math.random())
                .slice(0, teamSize);
            finalMovesP2 = {};
        }
        navigate(
            `/battle/arena?p1=${player1Team.map(p => p.id).join(',')}&p2=${finalP2Team.map(p => p.id).join(',')}&mode=${gameMode}`,
            { state: { customMovesP1: selectedMovesP1, customMovesP2: finalMovesP2 } }
        );
    };

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
                            onSelectMove={(idx, m) => handleMoveSelect(poke.id, idx, m)}
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
            <button
                ref={continueRef}
                onClick={() => currentTeam.length === teamSize ? setIsConfiguringMoves(true) : alert(`Debes seleccionar ${teamSize} Pokémon.`)}
                className="start-battle-button"
                disabled={currentTeam.length !== teamSize}
            >
                Continuar a Configuración
            </button>
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
