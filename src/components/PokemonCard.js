// src/components/PokemonCard.js
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import manualPokemonImages from '../data/manualPokemonImages';
import analyticsTracker from '../utils/analyticsTracker';

const TYPE_NAMES = {
    normal:'Normal', fire:'Fuego', water:'Agua', grass:'Planta', electric:'Eléctrico',
    ice:'Hielo', fighting:'Lucha', poison:'Veneno', ground:'Tierra', flying:'Volador',
    psychic:'Psíquico', bug:'Bicho', rock:'Roca', ghost:'Fantasma', dragon:'Dragón',
    steel:'Acero', dark:'Siniestro', fairy:'Hada', unknown:'Desconocido', shadow:'Sombra',
};

function PokemonCard({ pokemon }) {
    const [imageLoadError, setImageLoadError] = useState(false);

    const handleMouseMove = useCallback((e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(500px) rotateY(${x * 22}deg) rotateX(${-y * 18}deg) scale(1.07)`;
        card.style.boxShadow = `${-x * 12}px ${y * 12}px 24px rgba(0,0,0,0.45)`;
    }, []);

    const handleMouseLeave = useCallback((e) => {
        const card = e.currentTarget;
        card.style.transform = '';
        card.style.boxShadow = '';
    }, []);

    const pokemonId = pokemon.id;
    const imageUrl = manualPokemonImages[pokemonId];
    const finalImageUrl = imageUrl || `https://placehold.co/100x100/e0e0e0/333?text=No+Img`;

    return (
        <Link
            to={`/pokemon/${pokemonId}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={() => analyticsTracker.trackPokemonView(pokemon.id, pokemon.name)}
        >
            <div
                className="pokemon-card"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {imageLoadError || !imageUrl ? (
                    <div className="pokemon-image-placeholder">No Image</div>
                ) : (
                    <img
                        src={finalImageUrl}
                        alt={pokemon.name}
                        className="pokemon-image"
                        onError={() => setImageLoadError(true)}
                    />
                )}
                <p className="pokemon-number">#{pokemonId?.toString().padStart(3, '0') ?? '???'}</p>
                <h3 className="pokemon-name">
                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                </h3>
                <div className="pokemon-types">
                    {pokemon.types?.map(type => (
                        <span key={type} className={`type-${type}`}>
                            {TYPE_NAMES[type] ?? type}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

export default PokemonCard;
