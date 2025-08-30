// src/components/pokemonDetail/PokemonLocationDisplay.js
import React from 'react';
import './PokemonLocationDisplay.css';

const getVersionName = (version) => {
  return version
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const PokemonLocationDisplay = ({ locations }) => {
  if (!locations || locations.length === 0) {
    return (
      <div className="locations-section">
        <h3>Ubicaciones</h3>
        <p className="no-locations-message">No se encontraron datos de ubicación para este Pokémon en las primeras 5 generaciones.</p>
      </div>
    );
  }

  const locationsByRegion = locations.reduce((acc, location) => {
    const regionName = location.region;
    if (!acc[regionName]) {
      acc[regionName] = [];
    }
    acc[regionName].push(location);
    return acc;
  }, {});

  return (
    <div className="locations-section">
      <h3>Ubicaciones (Gen 1-5)</h3>
      <div className="regions-grid">
        {Object.keys(locationsByRegion).map(region => (
          <div key={region} className="region-card">
            <h4>Región: {region}</h4>
            <ul>
              {locationsByRegion[region].map((loc, index) => (
                <li key={index}>
                  <strong>{loc.locationName}:</strong>
                  <span> En los juegos {loc.versions.map(getVersionName).join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonLocationDisplay;