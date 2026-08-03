// src/components/pokemonDetail/PokemonLocations.js
// Idea 9: dónde encontrar a este Pokémon en estado salvaje, Generación I-V.
// (Generación VI en adelante queda fuera por ahora, a definir más adelante.)
// Filtrado por región (para no saturar todo hacia abajo) y con el color de
// cada zona según la probabilidad real de encuentro, tal como marcaba la
// Pokédex clásica al buscar un Pokémon ya capturado. Para Kanto y Teselia
// además se muestra un mapa propio (ver src/data/regionMaps.js); el resto
// de regiones por ahora solo tiene la vista de lista.
import React, { useState, useEffect, useMemo } from 'react';
import { hasRegionMap } from '../../data/regionMaps';
import RegionMapView from './RegionMapView';
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
    const [activeVersion, setActiveVersion] = useState(null);

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

    const regionHasMap = currentRegion ? hasRegionMap(currentRegion.id) : false;

    // Al cambiar de región, vuelve a elegir la primera versión disponible.
    useEffect(() => {
        if (currentRegion && !currentRegion.versions.some(v => v.name === activeVersion)) {
            setActiveVersion(currentRegion.versions[0]?.name || null);
        }
    }, [currentRegion, activeVersion]);

    const currentVersion = useMemo(
        () => currentRegion?.versions.find(v => v.name === activeVersion) || currentRegion?.versions[0] || null,
        [currentRegion, activeVersion]
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

                    {regionHasMap && currentRegion && (
                        <>
                            {currentRegion.versions.length > 1 && (
                                <div className="locations-version-tabs">
                                    {currentRegion.versions.map(v => (
                                        <button
                                            key={v.name}
                                            className={`gen5-version-pill locations-version-tab ${currentVersion?.name === v.name ? 'active' : ''}`}
                                            onClick={() => setActiveVersion(v.name)}
                                        >
                                            {v.display}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {currentVersion && (
                                <>
                                    <RegionMapView regionId={currentRegion.id} areas={currentVersion.areas} />
                                    <div className="locations-areas locations-areas-below-map">
                                        {currentVersion.areas.map(({ area, chance }) => (
                                            <AreaTag key={area} area={area} chance={chance} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {!regionHasMap && currentRegion && (
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

                    {!regionHasMap && (
                        <>
                            <p className="locations-map-pending">
                                El mapa ilustrado todavía no está disponible para {currentRegion?.label}; por ahora se muestra en lista.
                            </p>
                            <div className="locations-legend">
                                <span className="locations-legend-item"><i className="locations-dot locations-area-high" /> Alta (≥50%)</span>
                                <span className="locations-legend-item"><i className="locations-dot locations-area-mid" /> Media (15-49%)</span>
                                <span className="locations-legend-item"><i className="locations-dot locations-area-low" /> Baja (&lt;15%)</span>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default PokemonLocations;
