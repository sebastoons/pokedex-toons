// src/components/pokemonDetail/PokemonLocations.js
// Idea 9: dónde encontrar a este Pokémon en estado salvaje, Generación I-V.
// (Generación VI en adelante queda fuera por ahora, a definir más adelante.)
import React from 'react';
import './Gen5Theme.css';
import './PokemonLocations.css';

const PokemonLocations = ({ locations, loading }) => {
    return (
        <div className="gen5-section">
            <h3 className="gen5-section-title">🗺️ Ubicaciones Salvajes <span className="gen5-section-range">(Gen I-V)</span></h3>

            {loading ? (
                <div className="gen5-empty-state">Buscando ubicaciones en las Generaciones I-V...</div>
            ) : !locations?.hasData ? (
                <div className="gen5-empty-state">
                    {locations?.error
                        ? 'No se pudo consultar la información de ubicaciones en este momento.'
                        : 'Este Pokémon no aparece en estado salvaje en las Generaciones I-V (es un inicial, evoluciona por otro medio, o solo se obtiene por intercambio/regalo/evento).'}
                </div>
            ) : (
                <div className="locations-gen-list">
                    {locations.byGeneration.map(({ gen, label, versions }) => (
                        <div key={gen} className="locations-gen-block">
                            <div className="locations-gen-heading">
                                <span className="gen5-gen-badge" data-gen={gen}>{label}</span>
                            </div>
                            <div className="locations-versions">
                                {versions.map(v => (
                                    <div key={v.name} className="locations-version-block">
                                        <span className="gen5-version-pill">🎮 {v.display}</span>
                                        <div className="locations-areas">
                                            {v.areas.map(area => (
                                                <span key={area} className="locations-area-tag">{area}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PokemonLocations;
