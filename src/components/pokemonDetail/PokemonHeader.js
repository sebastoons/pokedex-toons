// src/components/pokemonDetail/PokemonHeader.js
import React from 'react';
import { POKEMON_TYPES } from '../../utils/pokemonTypes';
import './PokemonHeader.css';

const getSpanishDescription = (entries) => {
    if (!entries?.length) return 'Descripción no disponible.';
    return (
        entries.find(e => e.language.name === 'es') ||
        entries.find(e => e.language.name === 'en')
    )?.flavor_text.replace(/[\n\r\f]/g, ' ') ?? 'Descripción no disponible.';
};

const PokemonHeader = ({ pokemon, species }) => {
    if (!pokemon) return null;

    const primaryType = pokemon.types?.[0]?.type?.name ?? 'normal';
    const secondaryType = pokemon.types?.[1]?.type?.name;
    const color1 = POKEMON_TYPES[primaryType]?.color ?? '#888';
    const color2 = POKEMON_TYPES[secondaryType]?.color ?? color1;

    const imageUrl =
        pokemon.sprites?.other?.['official-artwork']?.front_default ||
        pokemon.sprites?.front_default ||
        `https://placehold.co/300x300/e0e0e0/333?text=${pokemon.name}`;

    const description = getSpanishDescription(species?.flavor_text_entries);

    return (
        <div className="header-section">
            {/* Hero */}
            <div
                className="pokemon-hero"
                style={{ background: `radial-gradient(ellipse at 60% 30%, ${color1}55 0%, ${color2}22 55%, transparent 100%), linear-gradient(160deg, ${color1}33 0%, ${color2}11 100%)` }}
            >
                <div className="hero-id-watermark">
                    #{pokemon.id.toString().padStart(3, '0')}
                </div>

                <div className="hero-info">
                    <h2 className="hero-name">
                        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </h2>
                    <span className="hero-number">#{pokemon.id.toString().padStart(3, '0')}</span>
                    <div className="hero-types">
                        {pokemon.types?.map(t => (
                            <span
                                key={t.type.name}
                                className={`type-badge-hero type-${t.type.name}`}
                                style={{ background: POKEMON_TYPES[t.type.name]?.color }}
                            >
                                {POKEMON_TYPES[t.type.name]?.name ?? t.type.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="hero-image-wrap">
                    <div
                        className="hero-image-glow"
                        style={{ background: `radial-gradient(circle, ${color1}70 0%, transparent 70%)` }}
                    />
                    <img
                        src={imageUrl}
                        alt={pokemon.name}
                        className="hero-pokemon-image"
                    />
                </div>
            </div>

            {/* Descripción */}
            <div className="pokedex-entry-card">
                <div className="pokedex-entry-icon" style={{ background: color1 }}>📖</div>
                <p className="pokedex-entry-text">{description}</p>
            </div>
        </div>
    );
};

export default PokemonHeader;
