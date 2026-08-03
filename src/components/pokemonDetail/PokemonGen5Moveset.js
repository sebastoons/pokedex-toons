// src/components/pokemonDetail/PokemonGen5Moveset.js
// Idea 3 + parte de la idea 4: moveset real de Generación 5 (Blanco/Negro,
// con fallback a Blanco 2/Negro 2), separado por cómo se aprende — igual a
// como lo muestra la Pokédex dentro del propio juego. Poder, precisión y PP
// solo se muestran en el cartel flotante (mantener presionado en móvil,
// pasar el mouse en PC) para no saturar la tabla.
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { getMoveTypeColor } from '../../utils/moveTypeColors';
import './Gen5Theme.css';
import './PokemonGen5Moveset.css';

const TABS = [
    { key: 'levelUp', label: 'Nivel' },
    { key: 'machine', label: 'MT / MO' },
    { key: 'tutor', label: 'Tutor' },
    { key: 'egg', label: 'Crianza' },
];

const LONG_PRESS_MS = 380;

// Nota: cerrar al soltar el mouse se maneja en el CONTENEDOR (gen5-move-list),
// no en cada fila — el cartel flotante cubre la fila que lo abrió, así que un
// onMouseLeave por fila dispararía un parpadeo (se tapa a sí misma → cierra →
// vuelve a quedar "hovered" → abre →...).
const MoveRow = ({ move, firstCol, isOpen, onOpen }) => {
    const pressTimer = useRef(null);

    const handleTouchStart = useCallback(() => {
        pressTimer.current = setTimeout(onOpen, LONG_PRESS_MS);
    }, [onOpen]);
    const handleTouchEnd = useCallback(() => {
        clearTimeout(pressTimer.current);
    }, []);

    useEffect(() => () => clearTimeout(pressTimer.current), []);

    const color = getMoveTypeColor(move.type);

    return (
        <div
            className={`gen5-move-row ${isOpen ? 'gen5-move-row-active' : ''}`}
            onMouseEnter={onOpen}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            {firstCol === 'level' && (
                <span className="gen5-move-level">{move.level > 0 ? `Nv.${move.level}` : 'Inicial'}</span>
            )}
            {firstCol === 'machine' && (
                <span className="gen5-move-level gen5-move-machine-tag">{move.machineLabel || '—'}</span>
            )}
            <span className="gen5-move-name">{move.name}</span>
            <span className="gen5-move-type" style={{ background: color }}>{move.type}</span>
        </div>
    );
};

const MoveTooltip = ({ move, onClose }) => {
    if (!move) return null;
    const isStatus = move.damageClass === 'status';
    return (
        <div className="gen5-move-tooltip-overlay" onClick={onClose}>
            <div className="gen5-move-tooltip" onClick={(e) => e.stopPropagation()}>
                <div className="gen5-move-tooltip-head">
                    <strong className="gen5-move-tooltip-name">{move.name}</strong>
                    <button className="gen5-move-tooltip-close" onClick={onClose} aria-label="Cerrar">×</button>
                </div>
                <p className="gen5-move-tooltip-desc">{move.description || 'Sin descripción disponible.'}</p>
                <div className="gen5-move-tooltip-stats">
                    <span>PODER<b>{isStatus ? '—' : (move.power ?? '—')}</b></span>
                    <span>PRECISIÓN<b>{move.accuracy != null ? `${move.accuracy}%` : '—'}</b></span>
                    <span>PP<b>{move.pp ?? '—'}</b></span>
                </div>
            </div>
        </div>
    );
};

const PokemonGen5Moveset = ({ moveset, loading }) => {
    const [activeTab, setActiveTab] = useState('levelUp');
    const [openMoveUrl, setOpenMoveUrl] = useState(null);

    useEffect(() => { setOpenMoveUrl(null); }, [activeTab]);

    const counts = useMemo(() => ({
        levelUp: moveset?.levelUp?.length || 0,
        machine: moveset?.machine?.length || 0,
        tutor: moveset?.tutor?.length || 0,
        egg: moveset?.egg?.length || 0,
    }), [moveset]);

    const totalMoves = counts.levelUp + counts.machine + counts.tutor + counts.egg;
    const firstCol = activeTab === 'levelUp' ? 'level' : activeTab === 'machine' ? 'machine' : null;
    const firstColHeader = activeTab === 'levelUp' ? 'Nivel' : activeTab === 'machine' ? 'MT/MO' : null;
    const openMove = openMoveUrl ? moveset[activeTab]?.find(m => m.url === openMoveUrl) : null;

    return (
        <div className="gen5-section gen5-section-relative">
            <h3 className="gen5-section-title">Movimientos <span className="gen5-gen-badge">GEN V</span></h3>
            <span className="gen5-section-subtitle">Según Pokémon Blanco / Negro (y Blanco 2 / Negro 2 si aplica)</span>

            <div className="gen5-move-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`gen5-move-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                        disabled={loading}
                    >
                        {tab.label} <span className="gen5-move-tab-count">{counts[tab.key]}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="gen5-empty-state">Cargando movimientos de Generación V...</div>
            ) : totalMoves === 0 ? (
                <div className="gen5-empty-state">
                    No se encontraron datos de movimientos para Generación V. Es posible que este Pokémon
                    no haya estado disponible en Blanco/Negro/Blanco 2/Negro 2.
                </div>
            ) : counts[activeTab] === 0 ? (
                <div className="gen5-empty-state">Sin movimientos en esta categoría para Generación V.</div>
            ) : (
                <>
                    <span className="gen5-move-hint">Mantén presionado (o pasa el mouse) sobre un movimiento para ver poder, precisión, PP y su descripción.</span>
                    <div className="gen5-move-list" onMouseLeave={() => setOpenMoveUrl(null)}>
                        <div className="gen5-move-row gen5-move-row-header">
                            {firstColHeader && <span className="gen5-move-level">{firstColHeader}</span>}
                            <span className="gen5-move-name">Movimiento</span>
                            <span className="gen5-move-type">Tipo</span>
                        </div>
                        {moveset[activeTab].map(move => (
                            <MoveRow
                                key={move.url}
                                move={move}
                                firstCol={firstCol}
                                isOpen={openMoveUrl === move.url}
                                onOpen={() => setOpenMoveUrl(move.url)}
                            />
                        ))}
                        {/* Se anida aquí (no como hermano de gen5-move-list) para que
                            cubrirse a sí misma no cuente como "salir" de la lista y
                            dispare el onMouseLeave que la cerraría; gracias a
                            position:absolute igual cubre toda la sección (gen5-section). */}
                        <MoveTooltip move={openMove} onClose={() => setOpenMoveUrl(null)} />
                    </div>
                </>
            )}
        </div>
    );
};

export default PokemonGen5Moveset;
