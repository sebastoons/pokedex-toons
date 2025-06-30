// src/components/MovesList.js
import React from 'react';
import './MovesList.css';

const MovesList = ({ moves, handleAttack, isPlayersTurn, battleEnded }) => {
    const canAttack = isPlayersTurn && !battleEnded;

    return (
        <div className="moves-container">
            {moves.map((move, index) => (
                <button
                    key={index}
                    onClick={() => handleAttack(index)}
                    disabled={!canAttack}
                    className={`move-button type-${move.type || 'normal'}`}
                >
                    {move.name || 'Movimiento desconocido'} (P:{move.power || 0})
                </button>
            ))}
        </div>
    );
};

export default MovesList;