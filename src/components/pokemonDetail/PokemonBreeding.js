// src/components/pokemonDetail/PokemonBreeding.js
// Idea 4: información de cría — grupos huevo, proporción de género y pasos
// para eclosionar (los movimientos de crianza en sí viven en PokemonGen5Moveset).
import React from 'react';
import { translateEggGroup } from '../../data/eggGroups';
import './Gen5Theme.css';
import './PokemonBreeding.css';

const GenderRatio = ({ genderRate }) => {
    if (genderRate === -1) {
        return <span className="breeding-gender-none">⚪ Sin género (no puede criar)</span>;
    }
    const femalePct = Math.round((genderRate / 8) * 100);
    const malePct = 100 - femalePct;
    return (
        <div className="breeding-gender-bar-wrap">
            <div className="breeding-gender-bar">
                <div className="breeding-gender-male" style={{ width: `${malePct}%` }} />
                <div className="breeding-gender-female" style={{ width: `${femalePct}%` }} />
            </div>
            <div className="breeding-gender-labels">
                <span>♂ {malePct}%</span>
                <span>♀ {femalePct}%</span>
            </div>
        </div>
    );
};

const PokemonBreeding = ({ eggGroups, genderRate, hatchCounter }) => {
    const hasEggGroups = eggGroups && eggGroups.length > 0;
    const steps = typeof hatchCounter === 'number' ? (hatchCounter + 1) * 255 : null;

    if (!hasEggGroups && genderRate === undefined && hatchCounter === undefined) return null;

    return (
        <div className="gen5-section">
            <h3 className="gen5-section-title">🥚 Cría</h3>

            <div className="breeding-grid">
                <div className="breeding-item">
                    <span className="breeding-item-label">Grupos Huevo</span>
                    {hasEggGroups ? (
                        <div className="breeding-egg-groups">
                            {eggGroups.map(g => (
                                <span key={g} className="breeding-egg-group-badge">{translateEggGroup(g)}</span>
                            ))}
                        </div>
                    ) : (
                        <span className="breeding-item-value">—</span>
                    )}
                </div>

                {genderRate !== undefined && (
                    <div className="breeding-item">
                        <span className="breeding-item-label">Proporción de Género</span>
                        <GenderRatio genderRate={genderRate} />
                    </div>
                )}

                {steps !== null && (
                    <div className="breeding-item">
                        <span className="breeding-item-label">Pasos para Eclosionar</span>
                        <span className="breeding-item-value">≈ {steps.toLocaleString('es')} pasos</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PokemonBreeding;
