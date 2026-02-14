// src/components/PokemonBattleSelector.js
import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getTypeInfo } from '../utils/typeEffectiveness';
import './PokemonBattleSelector.css';

const ALL_POKEMON_GENERATIONS = [
    { id: 'all', name: 'Todas' }, 
    { id: 1, limit: 151, offset: 0, name: 'Generación 1' },
    { id: 2, limit: 100, offset: 151, name: 'Generación 2' }, 
    { id: 3, limit: 135, offset: 251, name: 'Generación 3' },
    { id: 4, limit: 107, offset: 386, name: 'Generación 4' }, 
    { id: 5, limit: 156, offset: 493, name: 'Generación 5' },
    { id: 6, limit: 72, offset: 649, name: 'Generación 6' }, 
    { id: 7, limit: 88, offset: 721, name: 'Generación 7' },
    { id: 8, limit: 96, offset: 809, name: 'Generación 8' }, 
    { id: 9, limit: 120, offset: 905, name: 'Generación 9' },
    { id: 'special', name: 'Generación Especial' },
];

const MOVES_DATABASE = {
    normal: [
        { name: "Placaje", power: 40, accuracy: 100, type: "normal" },
        { name: "Arañazo", power: 40, accuracy: 100, type: "normal" },
        { name: "Corte", power: 50, accuracy: 95, type: "normal" },
        { name: "Golpe Cuerpo", power: 85, accuracy: 100, type: "normal" },
        { name: "Hiperrayo", power: 150, accuracy: 90, type: "normal" },
        { name: "Rapidez", power: 60, accuracy: Infinity, type: "normal" }
    ],
    fire: [
        { name: "Ascuas", power: 40, accuracy: 100, type: "fuego" },
        { name: "Lanzallamas", power: 90, accuracy: 100, type: "fuego" },
        { name: "Llamarada", power: 110, accuracy: 85, type: "fuego" },
        { name: "Puño Fuego", power: 75, accuracy: 100, type: "fuego" }
    ],
    water: [
        { name: "Pistola Agua", power: 40, accuracy: 100, type: "agua" },
        { name: "Surf", power: 90, accuracy: 100, type: "agua" },
        { name: "Hidrobomba", power: 110, accuracy: 80, type: "agua" },
        { name: "Rayo Burbuja", power: 65, accuracy: 100, type: "agua" }
    ],
    grass: [
        { name: "Látigo Cepa", power: 45, accuracy: 100, type: "planta" },
        { name: "Hoja Afilada", power: 55, accuracy: 95, type: "planta" },
        { name: "Rayo Solar", power: 120, accuracy: 100, type: "planta" },
        { name: "Gigadrenado", power: 75, accuracy: 100, type: "planta" }
    ],
    electric: [
        { name: "Impactrueno", power: 40, accuracy: 100, type: "eléctrico" },
        { name: "Rayo", power: 90, accuracy: 100, type: "eléctrico" },
        { name: "Trueno", power: 110, accuracy: 70, type: "eléctrico" },
        { name: "Puño Trueno", power: 75, accuracy: 100, type: "eléctrico" }
    ],
    ice: [
        { name: "Rayo Hielo", power: 90, accuracy: 100, type: "hielo" },
        { name: "Ventisca", power: 110, accuracy: 70, type: "hielo" },
        { name: "Puño Hielo", power: 75, accuracy: 100, type: "hielo" }
    ],
    fighting: [
        { name: "Golpe Karate", power: 50, accuracy: 100, type: "lucha" },
        { name: "Sumisión", power: 80, accuracy: 80, type: "lucha" },
        { name: "A Bocajarro", power: 120, accuracy: 100, type: "lucha" }
    ],
    poison: [
        { name: "Ácido", power: 40, accuracy: 100, type: "veneno" },
        { name: "Bomba Lodo", power: 90, accuracy: 100, type: "veneno" },
        { name: "Puya Nociva", power: 80, accuracy: 100, type: "veneno" }
    ],
    ground: [
        { name: "Terremoto", power: 100, accuracy: 100, type: "tierra" },
        { name: "Excavar", power: 80, accuracy: 100, type: "tierra" },
        { name: "Disparo Lodo", power: 55, accuracy: 95, type: "tierra" }
    ],
    flying: [
        { name: "Vuelo", power: 90, accuracy: 95, type: "volador" },
        { name: "Picotazo", power: 35, accuracy: 100, type: "volador" },
        { name: "Golpe Aéreo", power: 60, accuracy: Infinity, type: "volador" }
    ],
    psychic: [
        { name: "Psíquico", power: 90, accuracy: 100, type: "psíquico" },
        { name: "Confusión", power: 50, accuracy: 100, type: "psíquico" },
        { name: "Premonición", power: 120, accuracy: 100, type: "psíquico" },
        { name: "Cabezazo Zen", power: 80, accuracy: 90, type: "psíquico" }
    ],
    bug: [
        { name: "Picadura", power: 60, accuracy: 100, type: "bicho" },
        { name: "Zumbido", power: 90, accuracy: 100, type: "bicho" },
        { name: "Tijera X", power: 80, accuracy: 100, type: "bicho" }
    ],
    rock: [
        { name: "Lanzarrocas", power: 50, accuracy: 90, type: "roca" },
        { name: "Avalancha", power: 75, accuracy: 90, type: "roca" },
        { name: "Roca Afilada", power: 100, accuracy: 80, type: "roca" }
    ],
    ghost: [
        { name: "Lengüetazo", power: 30, accuracy: 100, type: "fantasma" },
        { name: "Bola Sombra", power: 80, accuracy: 100, type: "fantasma" },
        { name: "Garra Umbría", power: 70, accuracy: 100, type: "fantasma" }
    ],
    dragon: [
        { name: "Garra Dragón", power: 80, accuracy: 100, type: "dragón" },
        { name: "Pulso Dragón", power: 85, accuracy: 100, type: "dragón" },
        { name: "Cometa Draco", power: 130, accuracy: 90, type: "dragón" }
    ],
    dark: [
        { name: "Mordisco", power: 60, accuracy: 100, type: "siniestro" },
        { name: "Triturar", power: 80, accuracy: 100, type: "siniestro" },
        { name: "Pulso Umbrío", power: 80, accuracy: 100, type: "siniestro" }
    ],
    steel: [
        { name: "Garra Metal", power: 50, accuracy: 95, type: "acero" },
        { name: "Foco Resplandor", power: 80, accuracy: 100, type: "acero" },
        { name: "Cabeza de Hierro", power: 80, accuracy: 100, type: "acero" },
        { name: "Puño Meteoro", power: 90, accuracy: 90, type: "acero" }
    ],
    fairy: [
        { name: "Viento Feérico", power: 40, accuracy: 100, type: "hada" },
        { name: "Brillo Mágico", power: 80, accuracy: 100, type: "hada" },
        { name: "Fuerza Lunar", power: 95, accuracy: 100, type: "hada" }
    ]
};

const getMovesForType = (type) => {
    return MOVES_DATABASE[type] || [];
};

const formatPokemonId = (id) => String(id).padStart(3, '0');
const getPokemonImageUrl = (pokemon) => pokemon.imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

const TeamPreview = ({ team, teamSize, onRemove }) => (
    <div className="team-preview-container">
        {Array.from({ length: teamSize }).map((_, index) => {
            const pokemon = team[index];
            return (
                <div key={index} className="team-slot">
                    {pokemon ? (
                        <>
                            <img 
                                src={getPokemonImageUrl(pokemon)} 
                                alt={pokemon.name} 
                                title={`${pokemon.name} - Click para eliminar`}
                            />
                            <button 
                                onClick={() => onRemove(pokemon.id)} 
                                className="remove-pokemon-button-small"
                                title="Eliminar Pokémon"
                            >
                                ×
                            </button>
                        </>
                    ) : (
                        <div className="empty-team-slot">?</div>
                    )}
                </div>
            );
        })}
    </div>
);

const getPokemonTypes = (pokemon) => {
    if (pokemon.types && Array.isArray(pokemon.types)) {
        if (typeof pokemon.types[0] === 'string') {
            return pokemon.types; 
        } else if (pokemon.types[0]?.type?.name) {
            return pokemon.types.map(t => t.type.name); 
        }
    }
    return ['normal'];
};

function PokemonBattleSelector({ pokemonList }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { gameMode } = location.state || { gameMode: 'vsIA' };

    const [player1Team, setPlayer1Team] = useState([]);
    const [player2Team, setPlayer2Team] = useState([]);
    // CORRECCIÓN: Eliminado setCurrentPlayer porque no se usaba
    const [currentPlayer] = useState(1);
    const [teamSize] = useState(3);
    const [isConfiguringMoves, setIsConfiguringMoves] = useState(false);
    const [selectedMovesP1, setSelectedMovesP1] = useState({});
    
    const [selectedGeneration, setSelectedGeneration] = useState('all');
    const [isGenMenuOpen, setIsGenMenuOpen] = useState(false);
    
    const currentTeam = currentPlayer === 1 ? player1Team : player2Team;
    const setCurrentTeam = currentPlayer === 1 ? setPlayer1Team : setPlayer2Team;

    const availablePokemon = useMemo(() => {
        if (selectedGeneration === 'all') return pokemonList;
        if (selectedGeneration === 'special') return pokemonList.filter(p => p.isSpecial);
        const gen = ALL_POKEMON_GENERATIONS.find(g => g.id.toString() === selectedGeneration);
        if (gen) {
            return pokemonList.filter(p => !p.isSpecial && p.id > gen.offset && p.id <= gen.offset + gen.limit);
        }
        return pokemonList;
    }, [pokemonList, selectedGeneration]);

    const handleSelectPokemon = (pokemon) => {
        if (currentTeam.length >= teamSize) {
            alert(`¡Ya has seleccionado ${teamSize} Pokémon!`);
            return;
        }
        if (currentTeam.some(p => p.id === pokemon.id)) {
            alert("¡Ya has seleccionado este Pokémon!");
            return;
        }
        
        const pTypes = getPokemonTypes(pokemon);
        const typeMoves = getMovesForType(pTypes[0]);
        const normalMoves = MOVES_DATABASE['normal'];
        const defaultMoves = [...typeMoves.slice(0, 3), ...normalMoves.slice(0,1)].slice(0, 4);
        
        if (currentPlayer === 1) {
            setSelectedMovesP1(prev => ({
                ...prev,
                [pokemon.id]: defaultMoves
            }));
        }

        setCurrentTeam([...currentTeam, pokemon]);
    };

    const handleRemovePokemon = (pokemonId) => {
        setCurrentTeam(currentTeam.filter(p => p.id !== pokemonId));
        if (currentPlayer === 1) {
            const newMoves = {...selectedMovesP1};
            delete newMoves[pokemonId];
            setSelectedMovesP1(newMoves);
        }
    };

    const handleContinueToConfig = () => {
        if (currentTeam.length !== teamSize) {
            alert(`Debes seleccionar ${teamSize} Pokémon.`);
            return;
        }
        setIsConfiguringMoves(true);
    };

    const handleMoveChange = (pokemonId, moveIndex, moveName, fullMovePool) => {
        const selectedMove = fullMovePool.find(m => m.name === moveName);
        
        if (selectedMove) {
            setSelectedMovesP1(prev => {
                const currentMoves = [...(prev[pokemonId] || [])];
                currentMoves[moveIndex] = selectedMove;
                return { ...prev, [pokemonId]: currentMoves };
            });
        }
    };

    const handleStartBattle = () => {
        let finalP1Team = player1Team;
        let finalP2Team = player2Team;

        if (gameMode === 'vsIA') {
            finalP1Team = player1Team; 
            const shuffled = [...pokemonList].filter(p => !finalP1Team.some(selected => selected.id === p.id));
            finalP2Team = shuffled.sort(() => 0.5 - Math.random()).slice(0, teamSize);
        }
        
        const p1ids = finalP1Team.map(p => p.id).join(',');
        const p2ids = finalP2Team.map(p => p.id).join(',');

        navigate(`/battle/arena?p1=${p1ids}&p2=${p2ids}&mode=${gameMode}`, {
            state: {
                customMovesP1: selectedMovesP1
            }
        });
    };
    
    const handleGenerationSelect = (genId) => {
        setSelectedGeneration(genId.toString());
        setIsGenMenuOpen(false);
    };

    const toggleGenMenu = () => setIsGenMenuOpen(!isGenMenuOpen);

    if (isConfiguringMoves) {
        return (
            <div className="battle-selector-container">
                <h1 style={{color: 'white', textShadow: '2px 2px 4px black'}}>Configura las Técnicas</h1>
                <div className="team-config-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
                    {player1Team.map(poke => {
                        const types = getPokemonTypes(poke);
                        let pool = [];
                        types.forEach(t => {
                            pool = [...pool, ...getMovesForType(t)];
                        });
                        pool = [...pool, ...MOVES_DATABASE['normal']];
                        
                        const availableMoves = pool.filter((move, index, self) =>
                            index === self.findIndex((m) => m.name === move.name)
                        );

                        const mainType = types[0];

                        return (
                            <div key={poke.id} style={{
                                background: 'rgba(0,0,0,0.8)', 
                                padding: '15px', 
                                borderRadius: '15px', 
                                border: `3px solid var(--type-${mainType})`,
                                width: '300px'
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                    <img src={getPokemonImageUrl(poke)} alt={poke.name} style={{width: '60px', height: '60px'}} />
                                    <div style={{marginLeft: '10px'}}>
                                        <h3 style={{margin: 0, color: 'white', textTransform: 'capitalize'}}>{poke.name}</h3>
                                        <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                                            {types.map(t => (
                                                <span key={t} className={`type-badge type-${t}`} style={{fontSize: '0.8em', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', color: '#fff', textShadow: '1px 1px 2px black'}}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {selectedMovesP1[poke.id] && selectedMovesP1[poke.id].map((move, idx) => (
                                    <div key={idx} style={{marginBottom: '8px'}}>
                                        <label style={{color: '#aaa', fontSize: '12px'}}>Técnica {idx + 1}</label>
                                        <select 
                                            style={{width: '100%', padding: '5px', borderRadius: '5px', background: '#333', color: 'white', border: '1px solid #555', textTransform: 'uppercase'}}
                                            value={move?.name || ''}
                                            onChange={(e) => handleMoveChange(poke.id, idx, e.target.value, availableMoves)}
                                        >
                                            {availableMoves.map((m, i) => (
                                                <option key={i} value={m.name}>
                                                    {m.name} ({m.type}) - Poder: {m.power}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
                <div style={{marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center'}}>
                    <button onClick={() => setIsConfiguringMoves(false)} className="back-btn" style={{padding: '8px 20px', fontSize: '1em', cursor: 'pointer', textTransform: 'uppercase', fontFamily: 'Press Start 2P', background: 'linear-gradient(135deg, #3a47c2, #5b68dd)', fontWeight: 'bold', borderRadius: '30px', marginTop: '20px', marginBottom: '20px', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'}}>Volver</button>
                    <button onClick={handleStartBattle} className="start-battle-button" style={{padding: '10px 20px', fontSize: '1.2em', cursor: 'pointer'}}>¡LUCHAR!</button>
                </div>
            </div>
        );
    }

    return (
        <div className="battle-selector-container">
            <Link to="/battle" className="back-to-pokedex-top">
                &lt; Cambiar Modo
            </Link>
            
            <h1>Elige tu Equipo (3 Pokémon)</h1>
            
            <TeamPreview 
                team={currentTeam} 
                teamSize={teamSize} 
                onRemove={handleRemovePokemon} 
            />

            <button 
                onClick={handleContinueToConfig} 
                className="start-battle-button" 
                disabled={currentTeam.length !== teamSize}
            >
                Continuar a Configuración
            </button>
            
            <div className="battle-controls-container">
                <div className="generation-filter-container">
                    <button onClick={toggleGenMenu} className="generation-button">
                        Generación: {ALL_POKEMON_GENERATIONS.find(gen => gen.id.toString() === selectedGeneration)?.name || 'Seleccionar'}
                    </button>
                    {isGenMenuOpen && (
                        <ul className="generation-dropdown-menu">
                            {ALL_POKEMON_GENERATIONS.map(gen => (
                                <li 
                                    key={gen.id} 
                                    onClick={() => handleGenerationSelect(gen.id)} 
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
                {availablePokemon.map(pokemon => {
                    const pokemonTypes = getPokemonTypes(pokemon);
                    const isSelected = currentTeam.some(p => p.id === pokemon.id);
                    
                    return (
                        <div
                            key={pokemon.id}
                            className={`pokemon-grid-item ${isSelected ? 'selected-in-slot' : ''}`}
                            onClick={() => !isSelected && handleSelectPokemon(pokemon)}
                            style={{ opacity: isSelected ? 0.5 : 1, cursor: isSelected ? 'default' : 'pointer' }}
                        >
                            <img 
                                src={getPokemonImageUrl(pokemon)} 
                                alt={pokemon.name} 
                                className="pokemon-grid-image" 
                            />
                            <span className="pokemon-grid-name">
                                #{formatPokemonId(pokemon.id)} {pokemon.name}
                            </span>
                            <div className="pokemon-grid-types-container">
                                {pokemonTypes.map((typeName, typeIndex) => {
                                    const typeInfo = getTypeInfo(typeName);
                                    return (
                                        <span 
                                            key={typeIndex} 
                                            className="pokemon-type-badge pokemon-type-badge-small" 
                                            style={{ backgroundColor: typeInfo.color }}
                                        >
                                            {typeInfo.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PokemonBattleSelector;