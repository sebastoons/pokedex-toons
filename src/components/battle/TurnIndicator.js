// src/components/battle/TurnIndicator.js
import React from 'react';
import './TurnIndicator.css';

export const TurnIndicator = ({ isPlayer1Turn, gameMode, winner }) => {
    if (winner) return null;

    let turnText = "";
    let turnClass = "";

    if (gameMode === 'vsIA') {
        if (isPlayer1Turn) {
            turnText = "TURNO DEL JUGADOR";
            turnClass = "player-turn";
        } else {
            turnText = "TURNO DE LA IA";
            turnClass = "ia-turn";
        }
    } else { // modo 1vs1
        if (isPlayer1Turn) {
            turnText = "TURNO DEL JUGADOR 1";
            turnClass = "player1-turn";
        } else {
            turnText = "TURNO DEL JUGADOR 2";
            turnClass = "player2-turn";
        }
    }

    return (
        <div className={`turn-indicator ${turnClass}`}>
            <div className="turn-text">{turnText}</div>
            <div className="turn-arrow">▼</div>
        </div>
    );
};