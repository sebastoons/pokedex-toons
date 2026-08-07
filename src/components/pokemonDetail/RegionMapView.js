// src/components/pokemonDetail/RegionMapView.js
// Mapa propio y estilizado de una región (ver src/data/regionMaps.js sobre
// por qué no es el mapa real del juego). Terreno con textura (relieve,
// bosques, costa irregular con agua en dos tonos, algún río) y ubicaciones
// como casillas cuadradas unidas por caminos en ángulo recto, al estilo de
// un mapa de ruta. Solo dos colores de aviso: rojo (alta probabilidad) y
// naranjo (el Pokémon aparece, pero con menor frecuencia); las casillas sin
// datos aquí quedan en azul oscuro neutro (ciudades/mazmorras) o un tono
// arena discreto (rutas), para no confundirlas con el aviso.
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REGION_MAPS, matchAreaToNode } from '../../data/regionMaps';
import './RegionMapView.css';

const chanceLevel = (chance) => (chance >= 50 ? 'high' : 'mid');

const NODE_HALF = { town: 2.7, route: 1.3, dungeon: 2.4 };

// Determinístico (misma entrada = mismo resultado siempre), para que el
// terreno, los codos de los caminos, la costa y el río no cambien entre
// renders ni al reordenar los datos.
const edgeHash = (a, b) => {
    let h = 0;
    const s = a + '|' + b;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
    return (h / 997) * 2 - 1; // -1..1
};

// Camino en ángulo recto, como una carretera de mapa de ruta, en vez de una
// curva: dobla en un punto medio hacia un lado u otro según el hash del par
// de nodos, para que no todos los caminos doblen igual.
const elbowPath = (na, nb) => {
    const bendOnX = edgeHash(na.id, nb.id) > 0;
    const bx = bendOnX ? nb.x : na.x;
    const by = bendOnX ? na.y : nb.y;
    return `M ${na.x} ${na.y} L ${bx} ${by} L ${nb.x} ${nb.y}`;
};

// Manchas de terreno (tierras altas, bosque, pradera) puramente decorativas,
// para dar sensación de relieve en vez de un verde plano.
const TERRAIN_PALETTE = ['#8fc36c', '#79ad57', '#a9cf82', '#c7a765', '#6f9c4a'];
const terrainBlobs = (regionId, count = 9) => {
    const blobs = [];
    for (let i = 0; i < count; i++) {
        const h1 = edgeHash(regionId, `bx${i}`);
        const h2 = edgeHash(regionId, `by${i}`);
        const h3 = edgeHash(regionId, `br${i}`);
        const h4 = edgeHash(regionId, `bh${i}`);
        blobs.push({
            x: 8 + ((h1 + 1) / 2) * 84,
            y: 8 + ((h2 + 1) / 2) * 84,
            rx: 12 + ((h3 + 1) / 2) * 14,
            ry: 8 + ((h4 + 1) / 2) * 10,
            color: TERRAIN_PALETTE[i % TERRAIN_PALETTE.length],
        });
    }
    return blobs;
};

// Franja de mar en un borde del mapa (elegido por hash, distinto por región),
// con costa irregular en vez de una línea recta.
const EDGES = ['top', 'right', 'bottom', 'left'];
const waterZone = (regionId) => {
    const h1 = edgeHash(regionId, 'water-edge');
    const edge = EDGES[Math.floor(((h1 + 1) / 2) * EDGES.length) % EDGES.length];
    const h2 = edgeHash(regionId, 'water-size');
    const size = 16 + ((h2 + 1) / 2) * 14;
    const jitter = Array.from({ length: 6 }, (_, i) => edgeHash(regionId, `coast${i}`));
    return { edge, size, jitter };
};

const coastLinePoints = (edge, size, jitter) => {
    const t = [0, 20, 40, 60, 80, 100];
    return t.map((v, i) => {
        const j = jitter[i] * 5;
        if (edge === 'right') return [100 - size + j, v];
        if (edge === 'left') return [size + j, v];
        if (edge === 'bottom') return [v, 100 - size + j];
        return [v, size + j]; // top
    });
};

const fullWaterPolygon = (edge, size, jitter) => {
    const coast = coastLinePoints(edge, size, jitter);
    if (edge === 'right') return [[100, 0], ...coast, [100, 100]];
    if (edge === 'left') return [[0, 0], ...coast, [0, 100]];
    if (edge === 'bottom') return [[0, 100], ...coast, [100, 100]];
    return [[0, 0], ...coast, [100, 0]]; // top
};

// Franja angosta de agua poco profunda, pegada a la costa, para dar
// profundidad en dos tonos de azul en vez de un bloque plano.
const shallowStripPolygon = (edge, size, jitter) => {
    const inner = coastLinePoints(edge, Math.max(2, size - 5), jitter);
    const outer = coastLinePoints(edge, size, jitter);
    return [...inner, ...outer.slice().reverse()];
};

const polygonPath = (points) => 'M ' + points.map(p => p.join(' ')).join(' L ') + ' Z';

// Un río fino, ondulado, que nace tierra adentro y desemboca en la costa —
// puramente decorativo, sin datos reales detrás.
const riverPath = (regionId, water) => {
    const startX = 20 + ((edgeHash(regionId, 'river-sx') + 1) / 2) * 60;
    const startY = 20 + ((edgeHash(regionId, 'river-sy') + 1) / 2) * 60;
    const coast = coastLinePoints(water.edge, water.size, water.jitter);
    const endIdx = Math.floor(((edgeHash(regionId, 'river-end') + 1) / 2) * coast.length) % coast.length;
    const end = coast[endIdx];
    const midX = (startX + end[0]) / 2 + edgeHash(regionId, 'river-mx') * 8;
    const midY = (startY + end[1]) / 2 + edgeHash(regionId, 'river-my') * 8;
    return `M ${startX} ${startY} Q ${midX} ${midY} ${end[0]} ${end[1]}`;
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

    const terrain = useMemo(() => (map ? terrainBlobs(regionId) : []), [regionId, map]);
    const water = useMemo(() => (map ? waterZone(regionId) : null), [regionId, map]);
    const river = useMemo(() => (map && water ? riverPath(regionId, water) : null), [regionId, map, water]);

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
                        <clipPath id={`region-map-clip-${regionId}`}>
                            <rect x="0" y="0" width="100" height="100" rx="4" />
                        </clipPath>
                    </defs>

                    <g clipPath={`url(#region-map-clip-${regionId})`}>
                        <rect x="0" y="0" width="100" height="100" fill={`url(#region-map-glow-${regionId})`} className="region-map-bg" />

                        {/* Manchas de relieve/vegetación, decorativas, sin datos reales detrás */}
                        {terrain.map((b, i) => (
                            <ellipse key={i} cx={b.x} cy={b.y} rx={b.rx} ry={b.ry} fill={b.color} className="region-map-terrain-blob" />
                        ))}

                        {river && <path d={river} className="region-map-river" />}

                        {water && (
                            <>
                                <path d={polygonPath(fullWaterPolygon(water.edge, water.size, water.jitter))} className="region-map-water-deep" />
                                <path d={polygonPath(shallowStripPolygon(water.edge, water.size, water.jitter))} className="region-map-water-shallow" />
                            </>
                        )}

                        {/* Caminos en ángulo recto: borde + relleno, se dibujan progresivamente
                            al entrar y llevan un flujo de guiones en bucle. */}
                        {map.paths.map(([a, b], i) => {
                            const na = nodeById[a], nb = nodeById[b];
                            if (!na || !nb) return null;
                            const d = elbowPath(na, nb);
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
                            const half = NODE_HALF[node.type];
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
                                            cx={node.x} cy={node.y} r={half}
                                            className={`region-map-ping region-map-node-${hl.level}`}
                                            initial={{ scale: 1, opacity: 0.55 }}
                                            animate={{ scale: 2.4, opacity: 0 }}
                                            transition={{ duration: 1.8, repeat: Infinity, delay: ring * 0.9, ease: 'easeOut' }}
                                            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                                        />
                                    ))}

                                    <rect
                                        x={node.x - half} y={node.y - half} width={half * 2} height={half * 2} rx={half * 0.35}
                                        className={`region-map-node region-map-node-${node.type} ${hl ? `region-map-node-${hl.level}` : ''}`}
                                    />

                                    {node.type !== 'route' && (
                                        <g transform={`translate(${node.x} ${node.y}) scale(${half / 2.4})`}>
                                            {node.type === 'town' ? <TownIcon /> : <DungeonIcon />}
                                        </g>
                                    )}

                                    <AnimatePresence>
                                        {showLabel && (
                                            <motion.text
                                                x={node.x} y={node.y - half - 1.6}
                                                className="region-map-label"
                                                textAnchor="middle"
                                                initial={{ opacity: 0, y: node.y - half - 0.6 }}
                                                animate={{ opacity: 1, y: node.y - half - 1.6 }}
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
                    </g>
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
