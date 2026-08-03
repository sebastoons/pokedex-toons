// src/components/pokemonDetail/RegionMapView.js
// Mapa propio y estilizado de una región (ver src/data/regionMaps.js sobre
// por qué no es el mapa real del juego). Dibuja ciudades/rutas/mazmorras
// como nodos conectados por caminos, y resalta con color los que coinciden
// con una ubicación real donde aparece el Pokémon en la versión elegida.
import React, { useMemo, useState } from 'react';
import { REGION_MAPS, matchAreaToNode } from '../../data/regionMaps';
import './RegionMapView.css';

const chanceLevel = (chance) => {
    if (chance >= 50) return 'high';
    if (chance >= 15) return 'mid';
    return 'low';
};

const NODE_RADIUS = { town: 2.6, route: 1.3, dungeon: 2 };

const RegionMapView = ({ regionId, areas }) => {
    const [hovered, setHovered] = useState(null);
    const map = REGION_MAPS[regionId];

    const highlightByNodeId = useMemo(() => {
        const result = {};
        (areas || []).forEach(({ area, chance }) => {
            const node = matchAreaToNode(regionId, area);
            if (node) result[node.id] = { chance, level: chanceLevel(chance) };
        });
        return result;
    }, [regionId, areas]);

    if (!map) return null;
    const nodeById = Object.fromEntries(map.nodes.map(n => [n.id, n]));

    return (
        <div className="region-map-wrap">
            <svg className="region-map-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <rect x="0" y="0" width="100" height="100" rx="4" className="region-map-bg" />

                {map.paths.map(([a, b], i) => {
                    const na = nodeById[a], nb = nodeById[b];
                    if (!na || !nb) return null;
                    return (
                        <line
                            key={i}
                            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                            className="region-map-path"
                        />
                    );
                })}

                {map.nodes.map(node => {
                    const hl = highlightByNodeId[node.id];
                    const r = NODE_RADIUS[node.type] + (hl ? 0.6 : 0);
                    const isHovered = hovered === node.id;
                    return (
                        <g
                            key={node.id}
                            className="region-map-node-group"
                            onMouseEnter={() => setHovered(node.id)}
                            onMouseLeave={() => setHovered(null)}
                            onTouchStart={() => setHovered(node.id)}
                        >
                            {node.type === 'dungeon' ? (
                                <rect
                                    x={node.x - r} y={node.y - r} width={r * 2} height={r * 2}
                                    transform={`rotate(45 ${node.x} ${node.y})`}
                                    className={`region-map-node region-map-node-${node.type} ${hl ? `region-map-node-${hl.level}` : ''}`}
                                />
                            ) : (
                                <circle
                                    cx={node.x} cy={node.y} r={r}
                                    className={`region-map-node region-map-node-${node.type} ${hl ? `region-map-node-${hl.level}` : ''}`}
                                />
                            )}
                            {(hl || isHovered) && (
                                <text x={node.x} y={node.y - r - 1.4} className="region-map-label" textAnchor="middle">
                                    {node.name}{hl ? ` ${hl.chance}%` : ''}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            <div className="region-map-legend">
                <span><i className="region-map-dot region-map-node-high" /> Alta (≥50%)</span>
                <span><i className="region-map-dot region-map-node-mid" /> Media (15-49%)</span>
                <span><i className="region-map-dot region-map-node-low" /> Baja (&lt;15%)</span>
                <span><i className="region-map-dot region-map-node-none" /> Sin datos aquí</span>
            </div>
            <span className="region-map-disclaimer">
                Mapa ilustrativo propio (no es el mapa oficial del juego). Toca o pasa el mouse sobre un punto para ver su nombre.
            </span>
        </div>
    );
};

export default RegionMapView;
