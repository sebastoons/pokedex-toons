// src/components/pokemonDetail/PokemonLocations.js
// Idea 9: dónde encontrar a este Pokémon en estado salvaje, Generación I-V.
// (Generación VI en adelante queda fuera por ahora, a definir más adelante.)
// Filtrado por región (para no saturar todo hacia abajo) y con el color de
// cada zona según la probabilidad real de encuentro, tal como marcaba la
// Pokédex clásica al buscar un Pokémon ya capturado.
import React, { useState, useEffect, useMemo } from 'react';
import './Gen5Theme.css';
import './PokemonLocations.css';

// Umbrales de probabilidad de encuentro (según el % que reporta el propio juego).
const chanceLevel = (chance) => {
    if (chance >= 50) return 'high';
    if (chance >= 15) return 'mid';
    return 'low';
};

const CHANCE_LABEL = { high: 'Alta probabilidad', mid: 'Probabilidad media', low: 'Baja probabilidad' };

const AreaTag = ({ area, chance }) => {
    const level = chanceLevel(chance);
    return (
        <span className={`locations-area-tag locations-area-${level}`} title={CHANCE_LABEL[level]}>
            {area} <b>{chance}%</b>
        </span>
    );
};

const PokemonLocations = ({ locations, loading }) => {
    const [activeRegion, setActiveRegion] = useState(null);

    const regions = useMemo(() => locations?.byRegion || [], [locations]);

    // Selecciona automáticamente la primera región con datos cuando cambian.
    useEffect(() => {
        if (regions.length > 0 && !regions.some(r => r.id === activeRegion)) {
            setActiveRegion(regions[0].id);
        }
    }, [regions, activeRegion]);

    const currentRegion = useMemo(
        () => regions.find(r => r.id === activeRegion) || regions[0] || null,
        [regions, activeRegion]
    );

    return (
        <div className="gen5-section">
            <h3 className="gen5-section-title">Ubicaciones Salvajes <span className="gen5-section-range">(Gen I-V)</span></h3>

            {loading ? (
                <div className="gen5-empty-state">Buscando ubicaciones en las Generaciones I-V...</div>
            ) : !locations?.hasData ? (
                <div className="gen5-empty-state">
                    {locations?.error
                        ? 'No se pudo consultar la información de ubicaciones en este momento.'
                        : 'Este Pokémon no aparece en estado salvaje en las Generaciones I-V (es un inicial, evoluciona por otro medio, o solo se obtiene por intercambio/regalo/evento).'}
                </div>
            ) : (
                <>
                    <div className="locations-region-tabs">
                        {regions.map(r => (
                            <button
                                key={r.id}
                                className={`locations-region-tab ${currentRegion?.id === r.id ? 'active' : ''}`}
                                onClick={() => setActiveRegion(r.id)}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {currentRegion && (
                        <div className="locations-versions">
                            {currentRegion.versions.map(v => (
                                <div key={v.name} className="locations-version-block">
                                    <span className="gen5-version-pill">{v.display}</span>
                                    <div className="locations-areas">
                                        {v.areas.map(({ area, chance }) => (
                                            <AreaTag key={area} area={area} chance={chance} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="locations-legend">
                        <span className="locations-legend-item"><i className="locations-dot locations-area-high" /> Alta (≥50%)</span>
                        <span className="locations-legend-item"><i className="locations-dot locations-area-mid" /> Media (15-49%)</span>
                        <span className="locations-legend-item"><i className="locations-dot locations-area-low" /> Baja (&lt;15%)</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default PokemonLocations;
