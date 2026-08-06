// src/components/pokemonDetail/PokemonLocations.js
// Idea 9: dónde encontrar a este Pokémon en estado salvaje, Generación I-V.
// (Generación VI en adelante queda fuera por ahora, a definir más adelante.)
// Las 5 regiones jugables (Kanto, Johto, Hoenn, Sinnoh, Teselia) tienen mapa
// propio ilustrado (ver src/data/regionMaps.js) con el color de cada zona
// según la probabilidad real de encuentro — ya no hay vista de lista.
// Si el Pokémon no aparece salvaje en ninguna versión, se explica en español
// cómo se consigue realmente (evolución, inicial, regalo/intercambio/evento).
import React, { useState, useEffect, useMemo } from 'react';
import RegionMapView from './RegionMapView';
import './Gen5Theme.css';
import './PokemonLocations.css';

// Solo dos niveles de aviso (rojo/naranjo), igual que en el mapa.
const chanceLevel = (chance) => (chance >= 50 ? 'high' : 'mid');
const CHANCE_LABEL = { high: 'Alta probabilidad', mid: 'Aparece con menor frecuencia' };

const AreaTag = ({ area, chance }) => {
    const level = chanceLevel(chance);
    return (
        <span className={`locations-area-tag locations-area-${level}`} title={CHANCE_LABEL[level]}>
            {area} <b>{chance}%</b>
        </span>
    );
};

// IDs de los Pokémon iniciales de Gen I-V (Kanto a Teselia): no se encuentran
// salvajes, se entregan de regalo al comenzar la aventura.
const STARTER_IDS = new Set([
    1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501,
]);

const EVO_TRIGGER_TEXT = {
    'level-up': 'evolucionando por nivel',
    'trade': 'evolucionando por intercambio',
    'use-item': 'evolucionando con un objeto especial',
    'shed': 'evolucionando con un espacio libre en el equipo',
};

// Cuando no hay datos de aparición salvaje, se explica cómo se consigue en
// realidad usando lo que ya sabemos de su propia línea evolutiva (idea 9,
// pedido explícito del usuario de no dejar el espacio vacío ni en inglés).
const describeHowToObtain = (pokemonId, evolutionLine) => {
    const id = parseInt(pokemonId, 10);
    const self = (evolutionLine || []).find(p => parseInt(p.id, 10) === id);

    if (self && self.depth > 0) {
        const pre = evolutionLine.find(p => p.depth === self.depth - 1);
        const method = EVO_TRIGGER_TEXT[self.details?.trigger?.name] || 'evolucionando';
        return pre
            ? `No aparece salvaje: se obtiene ${method} desde ${pre.name}.`
            : `No aparece salvaje: se obtiene ${method} desde su preevolución.`;
    }

    if (STARTER_IDS.has(id)) {
        return 'Es uno de los Pokémon iniciales: se obtiene de regalo al comenzar la aventura, no en estado salvaje.';
    }

    return 'No se encuentra en estado salvaje en las Generaciones I-V: probablemente se obtiene por regalo, intercambio o evento especial dentro del juego.';
};

const PokemonLocations = ({ locations, loading, pokemonId, evolutionLine }) => {
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
                        : describeHowToObtain(pokemonId, evolutionLine)}
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
                </>
            )}
        </div>
    );
};

export default PokemonLocations;
