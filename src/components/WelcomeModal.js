// src/components/WelcomeModal.js
import React from 'react';
import './WelcomeModal.css';

// El modal ahora solo necesita la función para cerrarse
const WelcomeModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <img src="/pokeball-icon.png" alt="Pokeball" style={{ width: '80px' }} />
        <h2>¡Bienvenido a la</h2><h2>Pokédex Toons!</h2>
        <p>¡Hola, Entrenador! Explora el mundo de los Pokémon, conoce sus estadísticas y prepárate para la batalla.</p>
        <button onClick={onClose}>Comenzar Aventura</button>
      </div>
    </div>
  );
};

export default WelcomeModal;




