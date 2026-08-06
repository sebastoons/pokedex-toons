// src/components/pokemonDetail/RegionMapView.js
// Mapa propio y estilizado de una región (ver src/data/regionMaps.js sobre
// por qué no es el mapa real del juego). Dibuja ciudades/rutas/mazmorras
// como nodos conectados por caminos curvos tipo "sendero de tablero"
// (Framer Motion para el trazado y las transiciones), y resalta con un
// pulso tipo radar los que coinciden con una ubicación real donde aparece
// el Pokémon en la versión elegida. Solo dos colores de aviso: rojo (alta
// probabilidad) y naranjo (el Pokémon aparece, pero con menor frecuencia).
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REGION_MAPS, matchAreaToNode } from '../../data/regionMaps';
import './RegionMapView.css';

const chanceLevel = (chance) => (chance >= 50 ? 'high' : 'mid');

const NODE_RADIUS = { town: 2.8, route: 1.1, dungeon: 2.4 };

// Desplazamiento determinístico (mismo par de nodos = misma curva siempre),
// para que los caminos se vean como senderos serpenteantes y no líneas rectas.
const edgeHash = (a, b) => {
    let h = 0;
    const s = a + '|' + b;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
    return (h / 997) * 2 - 1; // -1..1
};

const curvePath = (na, nb) => {
    const mx = (na.x + nb.x) / 2;
    const my = (na.y + nb.y) / 2;
    const dx = nb.x - na.x, dy = nb.y - na.y;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len, py = dx / len; // perpendicular unitario
    const offset = edgeHash(na.id, nb.id) * Math.min(len * 0.28, 7);
    const cx = mx + px * offset;
    const cy = my + py * offset;
    return `M ${na.x} ${na.y} Q ${cx} ${cy} ${nb.x} ${nb.y}`;
};

// Decoración de fondo (árboles/montañas) puramente ambiental, no ligada a
// datos reales — genera posiciones deterministas separadas de los nodos
// para dar textura de "terreno" en vez de una tarjeta verde lisa.
const decorFor = (regionId, count) => {
    const items = [];
    for (let i = 0; i < count; i++) {
        const h1 = edgeHash(regionId, `dx${i}`);
        const h2 = edgeHash(regionId, `dy${i}`);
        const h3 = edgeHash(regionId, `dt${i}`);
        items.push({
            x: 5 + ((h1 + 1) / 2) * 90,
            y: 5 + ((h2 + 1) / 2) * 90,
            tree: h3 > 0,
        });
    }
    return items;
};

// Iconos propios, dibujados a mano en un espacio local ~±2 unidades
// (se posicionan con un <g transform="translate(x,y)">).
const TownIcon = () => (
    <>
        <path d="M -1.7 0.6 L 0 -1.8 L 1.7 0.6 Z" className="region-map-icon-fill" />
        <rect x="-1.2" y="0.4" width="2.4" height="1.5" className="region-map-icon-fill" />
        <rect x="-0.35" y="0.9" width="0.7" height="1" className="region-map-icon-cut" />
    </>
);

const DungeonIcon = () => (
    <path
        d="M -1.4 1.7 L -1.4 -0.2 Q -1.4 -1.7 0 -1.7 Q 1.4 -1.7 1.4 -0.2 L 1.4 1.7 Z"
        className="region-map-icon-fill"
    />
);

const TreeDecor = () => (
    <>
        <circle cx="0" cy="-0.4" r="1.1" className="region-map-decor-tree" />
        <rect x="-0.25" y="0.5" width="0.5" height="0.9" className="region-map-decor-trunk" />
    </>
);

const MountainDecor = () => (
    <path d="M -1.4 0.9 L -0.3 -1 L 0.3 -0.2 L 0.9 -1.1 L 1.6 0.9 Z" className="region-map-decor-mountain" />
);

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

    const decor = useMemo(() => (map ? decorFor(regionId, 16) : []), [regionId, map]);

    if (!map) return null;
    const nodeById = Object.fromEntries(map.nodes.map(n => [n.id, n]));
    const highlightedCount = Object.keys(highlightByNodeId).length;

    return (
        <div className="region-map-wrap">
            <AnimatePresence mode="wait">
                <motion.svg
                    key={`${regionId}-${areas?.length || 0}-${Object.keys(highlightByNodeId).join(',')}`}
                    className="region-map-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                >
                    <defs>
                        <radialGradient id={`region-map-glow-${regionId}`} cx="42%" cy="38%" r="75%">
                            <stop offset="0%" stopColor="#a9d98a" />
                            <stop offset="55%" stopColor="#8ec66c" />
                            <stop offset="100%" stopColor="#6fae53" />
                        </radialGradient>
                    </defs>

                    <rect x="0" y="0" width="100" height="100" rx="4" fill={`url(#region-map-glow-${regionId})`} className="region-map-bg" />

                    {/* Textura ambiental (árboles/montañas), decorativa, sin datos reales detrás */}
                    {decor.map((d, i) => (
                        <g key={i} transform={`translate(${d.x} ${d.y})`} className="region-map-decor" opacity={0.55}>
                            {d.tree ? <TreeDecor /> : <MountainDecor />}
                        </g>
                    ))}

                    {/* Caminos tipo "sendero de tablero": borde + relleno, se dibujan
                        progresivamente al entrar y llevan un flujo de guiones en bucle. */}
                    {map.paths.map(([a, b], i) => {
                        const na = nodeById[a], nb = nodeById[b];
                        if (!na || !nb) return null;
                        const d = curvePath(na, nb);
                        return (
                            <g key={`${a}-${b}`}>
                                <motion.path
                                    d={d}
                                    className="region-map-path-outline"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.45, delay: i * 0.006, ease: 'easeInOut' }}
                                />
                                <motion.path
                                    d={d}
                                    className="region-map-path"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.45, delay: i * 0.006, ease: 'easeInOut' }}
                                />
                                <path d={d} className="region-map-path-flow" style={{ animationDelay: `${(i % 8) * -0.4}s` }} />
                            </g>
                        );
                    })}

                    {map.nodes.map((node, i) => {
                        const hl = highlightByNodeId[node.id];
                        const baseR = NODE_RADIUS[node.type];
                        const isHovered = hovered === node.id;
                        const showLabel = Boolean(hl) || isHovered;

                        return (
                            <motion.g
                                key={node.id}
                                className="region-map-node-group"
                                onMouseEnter={() => setHovered(node.id)}
                                onMouseLeave={() => setHovered(null)}
                                onTouchStart={() => setHovered(node.id)}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.005, type: 'spring', stiffness: 340, damping: 20 }}
                                whileHover={{ scale: 1.35 }}
                                whileTap={{ scale: 0.9 }}
                                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                            >
                                {/* Pulso tipo radar para ubicaciones donde el Pokémon realmente aparece */}
                                {hl && [0, 1].map(ring => (
                                    <motion.circle
                                        key={ring}
                                        cx={node.x} cy={node.y} r={baseR}
                                        className={`region-map-ping region-map-node-${hl.level}`}
                                        initial={{ scale: 1, opacity: 0.55 }}
                                        animate={{ scale: 2.4, opacity: 0 }}
                                        transition={{ duration: 1.8, repeat: Infinity, delay: ring * 0.9, ease: 'easeOut' }}
                                        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                                    />
                                ))}

                                <circle
                                    cx={node.x} cy={node.y} r={baseR}
                                    className={`region-map-node region-map-node-${node.type} ${hl ? `region-map-node-${hl.level}` : ''}`}
                                />

                                {node.type !== 'route' && (
                                    <g transform={`translate(${node.x} ${node.y}) scale(${baseR / 2.4})`}>
                                        {node.type === 'town' ? <TownIcon /> : <DungeonIcon />}
                                    </g>
                                )}

                                <AnimatePresence>
                                    {showLabel && (
                                        <motion.text
                                            x={node.x} y={node.y - baseR - 1.6}
                                            className="region-map-label"
                                            textAnchor="middle"
                                            initial={{ opacity: 0, y: node.y - baseR - 0.6 }}
                                            animate={{ opacity: 1, y: node.y - baseR - 1.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {node.name}{hl ? ` ${hl.chance}%` : ''}
                                        </motion.text>
                                    )}
                                </AnimatePresence>
                            </motion.g>
                        );
                    })}
                </motion.svg>
            </AnimatePresence>

            <div className="region-map-legend">
                <span><i className="region-map-dot region-map-node-high" /> Alta probabilidad (≥50%)</span>
                <span><i className="region-map-dot region-map-node-mid" /> Aparece (&lt;50%)</span>
            </div>
            <span className="region-map-disclaimer">
                {highlightedCount > 0
                    ? `${highlightedCount} ${highlightedCount === 1 ? 'zona señalada' : 'zonas señaladas'} con radar. `
                    : ''}
                Mapa ilustrativo propio (no es el mapa oficial del juego). Toca o pasa el mouse sobre un punto para ver su nombre.
            </span>
        </div>
    );
};

export default RegionMapView;
