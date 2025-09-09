// src/components/PokemonBattleSelector.js
import React, { useState, useMemo } from 'react'; // 'useEffect' y 'useRef' eliminados
import { useLocation, useNavigate, Link } from 'react-router-dom';
// 'ReactGA' eliminado
import { getTypeInfo } from '../utils/typeEffectiveness';
import './PokemonBattleSelector.css';

// (El resto del código es exactamente el mismo que ya tienes)
const ALL_POKEMON_GENERATIONS = [
    { id: 'all', name: 'Todas' }, { id: 1, limit: 151, offset: 0, name: 'Generación 1' },
    { id: 2, limit: 100, offset: 151, name: 'Generación 2' }, { id: 3, limit: 135, offset: 251, name: 'Generación 3' },
    { id: 4, limit: 107, offset: 386, name: 'Generación 4' }, { id: 5, limit: 156, offset: 493, name: 'Generación 5' },
    { id: 6, limit: 72, offset: 649, name: 'Generación 6' }, { id: 7, limit: 88, offset: 721, name: 'Generación 7' },
    { id: 8, limit: 96, offset: 809, name: 'Generación 8' }, { id: 9, limit: 120, offset: 905, name: 'Generación 9' },
    { id: 'special', name: 'Generación Especial' },
];
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
                            <img src={getPokemonImageUrl(pokemon)} alt={pokemon.name} title={pokemon.name} />
                            <button onClick={() => onRemove(pokemon.id)} className="remove-pokemon-button-small">X</button>
                        </>
                    ) : (
                        <div className="empty-team-slot">?</div>
                    )}
                </div>
            );
        })}
    </div>
);

function PokemonBattleSelector({ pokemonList }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { gameMode } = location.state || { gameMode: 'vsIA' };

    const [player1Team, setPlayer1Team] = useState([]);
    const [player2Team, setPlayer2Team] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [teamSize] = useState(3);

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
        if (currentTeam.length >= teamSize) return alert(`¡Ya has seleccionado ${teamSize} Pokémon!`);
        if (currentTeam.some(p => p.id === pokemon.id)) return alert("¡Ya has seleccionado este Pokémon!");
        setCurrentTeam([...currentTeam, pokemon]);
    };

    const handleRemovePokemon = (pokemonId) => {
        setCurrentTeam(currentTeam.filter(p => p.id !== pokemonId));
    };

    const handleConfirmTeam = () => {
        if (currentTeam.length !== teamSize) return alert(`Debes seleccionar ${teamSize} Pokémon.`);
        if (gameMode === 'vsPlayer' && currentPlayer === 1) {
            alert("¡Equipo del Jugador 1 confirmado!\n\nAhora es el turno del Jugador 2 de elegir su equipo.");
            setCurrentPlayer(2);
        } else {
            handleStartBattle();
        }
    };
    
    const handleStartBattle = () => {
        let finalP1Team = player1Team;
        let finalP2Team = player2Team;

        if (gameMode === 'vsIA') {
            finalP1Team = currentTeam;
            const shuffled = [...pokemonList].filter(p => !finalP1Team.some(selected => selected.id === p.id));
            finalP2Team = shuffled.sort(() => 0.5 - Math.random()).slice(0, teamSize);
        }
        
        const p1ids = finalP1Team.map(p => p.id).join(',');
        const p2ids = finalP2Team.map(p => p.id).join(',');

        navigate(`/battle/arena?p1=${p1ids}&p2=${p2ids}&mode=${gameMode}`);
    };
    
    const handleGenerationSelect = (genId) => {
        setSelectedGeneration(genId.toString());
        setIsGenMenuOpen(false);
    };
    const toggleGenMenu = () => setIsGenMenuOpen(!isGenMenuOpen);

    return (
        <div className="battle-selector-container">
            <Link to="/battle" className="pokemon-link-button back-to-pokedex-top">&lt; Cambiar Modo</Link>
            
            <h1>{gameMode === 'vsPlayer' ? `Elige tu equipo, Jugador ${currentPlayer}` : 'Elige tu Equipo'}</h1>
            <p>Selecciona {teamSize} Pokémon para la batalla.</p>
            
            <TeamPreview team={currentTeam} teamSize={teamSize} onRemove={handleRemovePokemon} />

            <button 
                onClick={handleConfirmTeam} 
                className="start-battle-button" 
                disabled={currentTeam.length !== teamSize}
            >
                {gameMode === 'vsPlayer' && currentPlayer === 1 ? 'Confirmar y pasar al Jugador 2' : '¡Comenzar Batalla!'}
            </button>
            
            <div className="battle-controls-container">
                <div className="generation-filter-container">
                    <button onClick={toggleGenMenu} className="generation-button">
                        Generación: {ALL_POKEMON_GENERATIONS.find(gen => gen.id.toString() === selectedGeneration)?.name || 'Seleccionar'}
                    </button>
                    {isGenMenuOpen && (
                        <ul className="generation-dropdown-menu">
                            {ALL_POKEMON_GENERATIONS.map(gen => (
                                <li key={gen.id} onClick={() => handleGenerationSelect(gen.id)} className={selectedGeneration === gen.id.toString() ? 'active' : ''}>
                                    {gen.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            
            <div className="available-pokemon-grid">
                {availablePokemon.map(pokemon => (
                    <div
                        key={pokemon.id}
                        className={`pokemon-grid-item ${currentTeam.some(p => p.id === pokemon.id) ? 'selected-in-slot' : ''}`}
                        onClick={() => handleSelectPokemon(pokemon)}
                    >
                        <img src={getPokemonImageUrl(pokemon)} alt={pokemon.name} className="pokemon-grid-image" />
                        <span className="pokemon-grid-name">#{formatPokemonId(pokemon.id)} {pokemon.name}</span>
                        <div className="pokemon-grid-types-container">
                             {pokemon.types.map((typeName, typeIndex) => {
                                const typeInfo = getTypeInfo(typeName);
                                return <span key={typeIndex} className="pokemon-type-badge pokemon-type-badge-small" style={{ backgroundColor: typeInfo.color }}>{typeInfo.name}</span>;
                             })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PokemonBattleSelector;