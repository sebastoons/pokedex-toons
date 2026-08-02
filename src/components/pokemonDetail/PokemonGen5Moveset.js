// src/components/pokemonDetail/PokemonGen5Moveset.js
// Idea 3 + parte de la idea 4: moveset real de Generación 5 (Blanco/Negro,
// con fallback a Blanco 2/Negro 2), separado por cómo se aprende — igual a
// como lo muestra la Pokédex dentro del propio juego.
import React, { useState, useMemo } from 'react';
import { getMoveTypeColor } from '../../utils/moveTypeColors';
import './Gen5Theme.css';
import './PokemonGen5Moveset.css';

const TABS = [
    { key: 'levelUp', label: 'Nivel', icon: '📈' },
    { key: 'machine', label: 'MT / MO', icon: '💿' },
    { key: 'tutor', label: 'Tutor', icon: '🧑‍🏫' },
    { key: 'egg', label: 'Crianza', icon: '🥚' },
];

const MoveRow = ({ move, showLevel }) => {
    const color = getMoveTypeColor(move.type);
    const isStatus = move.damageClass === 'status';
    return (
        <div className="gen5-move-row">
            {showLevel && (
                <span className="gen5-move-level">{move.level > 0 ? `Nv.${move.level}` : 'Inicial'}</span>
            )}
            <span className="gen5-move-name">{move.name}</span>
            <span className="gen5-move-type" style={{ background: color }}>{move.type}</span>
            <span className="gen5-move-power">{isStatus ? '—' : (move.power ?? '—')}</span>
            <span className="gen5-move-pp">{move.pp ?? '—'} PP</span>
        </div>
    );
};

const PokemonGen5Moveset = ({ moveset, loading }) => {
    const [activeTab, setActiveTab] = useState('levelUp');

    const counts = useMemo(() => ({
        levelUp: moveset?.levelUp?.length || 0,
        machine: moveset?.machine?.length || 0,
        tutor: moveset?.tutor?.length || 0,
        egg: moveset?.egg?.length || 0,
    }), [moveset]);

    const totalMoves = counts.levelUp + counts.machine + counts.tutor + counts.egg;

    return (
        <div className="gen5-section">
            <h3 className="gen5-section-title">📖 Movimientos <span className="gen5-gen-badge" data-gen="5">GEN V</span></h3>
            <span className="gen5-section-subtitle">Según Pokémon Blanco / Negro (y Blanco 2 / Negro 2 si aplica)</span>

            <div className="gen5-move-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`gen5-move-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                        disabled={loading}
                    >
                        {tab.icon} {tab.label} <span className="gen5-move-tab-count">{counts[tab.key]}</span>
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
                <div className="gen5-move-list">
                    <div className="gen5-move-row gen5-move-row-header">
                        {activeTab === 'levelUp' && <span className="gen5-move-level">Nivel</span>}
                        <span className="gen5-move-name">Movimiento</span>
                        <span className="gen5-move-type">Tipo</span>
                        <span className="gen5-move-power">Poder</span>
                        <span className="gen5-move-pp">PP</span>
                    </div>
                    {moveset[activeTab].map(move => (
                        <MoveRow key={move.url} move={move} showLevel={activeTab === 'levelUp'} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PokemonGen5Moveset;
