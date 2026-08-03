// src/components/pokemonDetail/PokemonBreeding.js
// Idea 4: información de cría — grupos huevo, proporción de género y pasos
// para eclosionar (los movimientos de crianza en sí viven en PokemonGen5Moveset).
// Cada dato trae una explicación breve de qué significa en la práctica.
import React from 'react';
import { translateEggGroup } from '../../data/eggGroups';
import './Gen5Theme.css';
import './PokemonBreeding.css';

const GenderCard = ({ genderRate }) => {
    if (genderRate === -1) {
        return (
            <div className="breeding-card">
                <span className="breeding-card-label">Género</span>
                <span className="breeding-card-value">Sin género</span>
                <p className="breeding-card-caption">No tiene macho ni hembra: solo puede criar junto a Ditto.</p>
            </div>
        );
    }
    if (genderRate === 0) {
        return (
            <div className="breeding-card">
                <span className="breeding-card-label">Género</span>
                <span className="breeding-card-value">♂ Siempre macho</span>
                <p className="breeding-card-caption">Necesita una hembra de otra especie del mismo grupo huevo, o un Ditto.</p>
            </div>
        );
    }
    if (genderRate === 8) {
        return (
            <div className="breeding-card">
                <span className="breeding-card-label">Género</span>
                <span className="breeding-card-value">♀ Siempre hembra</span>
                <p className="breeding-card-caption">Necesita un macho de otra especie del mismo grupo huevo, o un Ditto.</p>
            </div>
        );
    }

    const femalePct = Math.round((genderRate / 8) * 100);
    const malePct = 100 - femalePct;
    return (
        <div className="breeding-card">
            <span className="breeding-card-label">Género</span>
            <div className="breeding-gender-bar">
                <div className="breeding-gender-male" style={{ width: `${malePct}%` }} />
                <div className="breeding-gender-female" style={{ width: `${femalePct}%` }} />
            </div>
            <div className="breeding-gender-labels">
                <span>♂ {malePct}%</span>
                <span>♀ {femalePct}%</span>
            </div>
            <p className="breeding-card-caption">Para criar necesitas un macho y una hembra (o un Ditto).</p>
        </div>
    );
};

const PokemonBreeding = ({ eggGroups, genderRate, hatchCounter }) => {
    const hasEggGroups = eggGroups && eggGroups.length > 0;
    const hasCycles = typeof hatchCounter === 'number';
    const steps = hasCycles ? (hatchCounter + 1) * 255 : null;

    if (!hasEggGroups && genderRate === undefined && !hasCycles) return null;

    return (
        <div className="gen5-section">
            <h3 className="gen5-section-title">Cría</h3>

            <div className="breeding-grid">
                {hasEggGroups && (
                    <div className="breeding-card">
                        <span className="breeding-card-label">Grupos Huevo</span>
                        <div className="breeding-egg-groups">
                            {eggGroups.map(g => (
                                <span key={g} className="breeding-egg-group-badge">{translateEggGroup(g)}</span>
                            ))}
                        </div>
                        <p className="breeding-card-caption">
                            Se puede criar con cualquier otro Pokémon que comparta uno de estos grupos.
                        </p>
                    </div>
                )}

                {genderRate !== undefined && <GenderCard genderRate={genderRate} />}

                {hasCycles && (
                    <div className="breeding-card">
                        <span className="breeding-card-label">Huevo</span>
                        <span className="breeding-card-value">{hatchCounter + 1} ciclos</span>
                        <p className="breeding-card-caption">
                            Aproximadamente {steps.toLocaleString('es')} pasos caminando para que eclosione.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PokemonBreeding;
