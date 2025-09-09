// src/components/battle/BattleEndModal.js
import React from 'react';
import './BattleEndModal.css'; // Importa su propio CSS

export const BattleEndModal = ({ winner, onRestart, onGoHome }) => {
    let message = "";
    let emoji = "";

    if (winner === 'player1') {
        message = "¡Felicidades! ¡Has ganado la batalla!";
        emoji = "🎉";
    } else if (winner === 'player2') {
        message = "¡Oh no! Has perdido la batalla...";
        emoji = "😭";
    } else {
        message = "La batalla ha terminado."; // En caso de 'draw' o error
        emoji = "🏁";
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <span className="modal-emoji">{emoji}</span>
                <h2>{message}</h2>
                <div className="modal-actions">
                    <button onClick={onRestart} className="modal-button restart-button">
                        Reiniciar Batalla
                    </button>
                    <button onClick={onGoHome} className="modal-button home-button">
                        Volver al Selector
                    </button>
                </div>
            </div>
        </div>
    );
};