// src/components/UpdateModal.js
import React from 'react';
import './UpdateModal.css'; // Usaremos estilos similares al de bienvenida pero en su propio archivo

const UpdateModal = ({ onClose }) => {
  // Aquí puedes definir las notas de la actualización.
  // En el futuro, esto podría venir de un archivo de configuración o una API.
  const updateDetails = {
    version: "1.2.4",
    date: "17 de Septiembre 2025",
    changes: [
      "Se añaden nuevos pokémon en generación especial.",
      "Mejora visual en pokemon battle arena y se añaden funciones.",
      "Mejora visual en la selección de pokemon para la batalla.",
      "Se añade la seccion, modo de batalla.",
      "Se corrigen errores y visualizaciones."
    ]
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content update-modal">
        <img src="/logo.svg" alt="Pokedex Logo" className="update-logo" />
        <h2>¡Novedades en la Pokédex!</h2>
        <div className="update-info">
          <h4>Versión {updateDetails.version} - {updateDetails.date}</h4>
          <ul>
            {updateDetails.changes.map((change, index) => (
              <li key={index}>{change}</li>
            ))}
          </ul>
        </div>
        <button onClick={onClose}>¡Entendido!</button>
      </div>
    </div>
  );
};

export default UpdateModal;