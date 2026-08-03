// src/components/pokemonDetail/PokemonGen5Moveset.js
// Idea 3 + parte de la idea 4: moveset real de Generación 5 (Blanco/Negro,
// con fallback a Blanco 2/Negro 2), separado por cómo se aprende — igual a
// como lo muestra la Pokédex dentro del propio juego. Cada movimiento tiene
// una descripción disponible al pasar el mouse (PC) o mantener presionado
// (móvil/tablet).
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

const MoveRow = ({ move, firstCol, isOpen, onOpen, onClose }) => {
    const pressTimer = useRef(null);

    const handleTouchStart = useCallback(() => {
        pressTimer.current = setTimeout(onOpen, LONG_PRESS_MS);
    }, [onOpen]);
    const handleTouchEnd = useCallback(() => {
        clearTimeout(pressTimer.current);
    }, []);

    useEffect(() => () => clearTimeout(pressTimer.current), []);

    const color = getMoveTypeColor(move.type);
    const isStatus = move.damageClass === 'status';

    return (
        <div
            className="gen5-move-row"
            onMouseEnter={onOpen}
            onMouseLeave={onClose}
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
            <span className="gen5-move-power">{isStatus ? '—' : (move.power ?? '—')}</span>
            <span className="gen5-move-acc">{move.accuracy != null ? `${move.accuracy}%` : '—'}</span>
            <span className="gen5-move-pp">{move.pp ?? '—'}</span>

            {isOpen && (
                <div className="gen5-move-tooltip" onClick={(e) => e.stopPropagation()}>
                    <strong className="gen5-move-tooltip-name">{move.name}</strong>
                    <p className="gen5-move-tooltip-desc">{move.description || 'Sin descripción disponible.'}</p>
                    <div className="gen5-move-tooltip-stats">
                        <span>PODER {isStatus ? '—' : (move.power ?? '—')}</span>
                        <span>PRECISIÓN {move.accuracy != null ? `${move.accuracy}%` : '—'}</span>
                        <span>PP {move.pp ?? '—'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const PokemonGen5Moveset = ({ moveset, loading }) => {
    const [activeTab, setActiveTab] = useState('levelUp');
    const [openMoveUrl, setOpenMoveUrl] = useState(null);
    const listRef = useRef(null);

    // Cierra el tooltip si se toca/hace clic fuera de la lista (necesario
    // para el modo "mantener presionado" en móvil, que si no se queda abierto).
    useEffect(() => {
        if (!openMoveUrl) return;
        const handleOutside = (e) => {
            if (listRef.current && !listRef.current.contains(e.target)) setOpenMoveUrl(null);
        };
        document.addEventListener('pointerdown', handleOutside);
        return () => document.removeEventListener('pointerdown', handleOutside);
    }, [openMoveUrl]);

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

    return (
        <div className="gen5-section">
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
                    <span className="gen5-move-hint">Mantén presionado (o pasa el mouse) sobre un movimiento para ver su descripción.</span>
                    <div className="gen5-move-list" ref={listRef}>
                        <div className="gen5-move-row gen5-move-row-header">
                            {firstColHeader && <span className="gen5-move-level">{firstColHeader}</span>}
                            <span className="gen5-move-name">Movimiento</span>
                            <span className="gen5-move-type">Tipo</span>
                            <span className="gen5-move-power">Pod.</span>
                            <span className="gen5-move-acc">Prec.</span>
                            <span className="gen5-move-pp">PP</span>
                        </div>
                        {moveset[activeTab].map(move => (
                            <MoveRow
                                key={move.url}
                                move={move}
                                firstCol={firstCol}
                                isOpen={openMoveUrl === move.url}
                                onOpen={() => setOpenMoveUrl(move.url)}
                                onClose={() => setOpenMoveUrl(null)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PokemonGen5Moveset;
