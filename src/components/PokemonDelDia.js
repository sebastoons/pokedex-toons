import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import manualPokemonImages from '../data/manualPokemonImages';

function PokemonDelDia({ pokemonList }) {
    const pokemon = useMemo(() => {
        const regular = pokemonList.filter(p => p.id >= 1 && p.id <= 1025 && !p.isSpecial);
        if (!regular.length) return null;
        const dayIndex = Math.floor(Date.now() / 86400000);
        return regular[dayIndex % regular.length];
    }, [pokemonList]);

    if (!pokemon) return null;

    const imgUrl = pokemon.imageUrl || manualPokemonImages[pokemon.id]
        || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    return (
        <Link to={`/pokemon/${pokemon.id}`} className="pokemon-del-dia-link">
            <div className="pokemon-del-dia">
                <span className="del-dia-label">⭐ Pokémon del día</span>
                <img src={imgUrl} alt={pokemon.name} className="del-dia-img" />
                <div className="del-dia-info">
                    <span className="del-dia-name">
                        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </span>
                    <span className="del-dia-number">
                        #{pokemon.id.toString().padStart(3, '0')}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default PokemonDelDia;
