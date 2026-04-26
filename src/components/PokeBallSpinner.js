import React from 'react';
import './PokeBallSpinner.css';

const PokeBallSpinner = ({ text = 'Cargando...', size = 60 }) => (
    <div className="pokeball-loader">
        <div className="pokeball-spinner" style={{ width: size, height: size, borderRadius: size / 2 }} />
        {text && <p className="pokeball-loader-text">{text}</p>}
    </div>
);

export default PokeBallSpinner;
