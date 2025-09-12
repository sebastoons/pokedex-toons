import React, { useEffect, useRef } from 'react';
import './BattleLogDisplay.css';

const BattleLogDisplay = ({ messages }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    // Hace scroll hacia el último mensaje automáticamente
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- INICIO DE LA CORRECCIÓN ---
  //
  // Si 'messages' es undefined, lo tratamos como un array vacío [].
  // Esto previene el crash de la aplicación.
  const safeMessages = messages || [];
  //
  // --- FIN DE LA CORRECCIÓN ---

  return (
    <div className="battle-log-display">
      {/* Usamos el nuevo array seguro 'safeMessages' para el mapeo */}
      {safeMessages.map((message, index) => (
        <div key={index} className="log-message">
          {message}
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default BattleLogDisplay;