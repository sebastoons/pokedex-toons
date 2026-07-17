// src/components/pokemonDetail/PokemonTypeEffectiveness.js
import React from 'react';
import { getTypeInfo } from '../../utils/pokemonTypes';
import './PokemonTypeEffectiveness.css';

const translateTypeName = (typeName) =>
    getTypeInfo(typeName)?.name ?? (typeName.charAt(0).toUpperCase() + typeName.slice(1));

// Componente interno para renderizar una sección de efectividad
const renderEffectivenessTypes = (typesArray, typeLabel) => {
    if (!typesArray || typesArray.length === 0) return null;

    return (
      <div className="effectiveness-category">
        <strong>{typeLabel}:</strong>
        <div className="effectiveness-badges">
          {typesArray.map((effectType) => (
            <span key={effectType.type} className={`type-badge type-${effectType.type}`}>
              {translateTypeName(effectType.type)}
            </span>
          ))}
        </div>
      </div>
    );
};

const PokemonTypeEffectiveness = ({ effectiveness }) => {
  if (!effectiveness) {
    return (
      <div className="type-effectiveness-section">
        <h3>Fortalezas y Debilidades</h3>
        <p>Cargando información de tipos...</p>
      </div>
    );
  }
  
  const hasAnyEffectiveness = 
    effectiveness.double_damage_from.length > 0 ||
    effectiveness.half_damage_from.length > 0 ||
    effectiveness.no_damage_from.length > 0;

  return (
    <div className="type-effectiveness-section">
      <h3>Fortalezas y Debilidades</h3>
      {hasAnyEffectiveness ? (
        <div className="type-effectiveness-container">
          {renderEffectivenessTypes(effectiveness.double_damage_from, 'Debil contra')}
          {renderEffectivenessTypes(effectiveness.half_damage_from, 'Fuerte Contra')}
          {renderEffectivenessTypes(effectiveness.no_damage_from, 'Inmune a')}
        </div>
      ) : (
        <p>No se encontraron relaciones de daño específicas para este tipo.</p>
      )}
    </div>
  );
};

export default PokemonTypeEffectiveness;