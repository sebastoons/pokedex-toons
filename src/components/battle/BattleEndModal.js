// src/components/battle/BattleEndModal.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BattleEndModal.css';

export const BattleEndModal = ({ winner }) => {
    const navigate = useNavigate();
    const isVictory = winner === 'player1';
    const isDraw = winner === 'draw';

    const title = isVictory ? '¡VICTORIA!' : isDraw ? 'FIN' : '¡DERROTA!';
    const sub   = isVictory ? '¡Eres el Campeón Pokémon!' : isDraw ? 'La batalla terminó.' : '¡Tus Pokémon se debilitaron!';
    const icon  = isVictory ? '🏆' : isDraw ? '🏁' : '💀';
    const stars = isVictory ? ['★','★','★'] : isDraw ? ['★','★','☆'] : ['☆','☆','☆'];

    return (
        <div className={`end-overlay ${isVictory ? 'end-win' : isDraw ? 'end-draw' : 'end-lose'}`}>
            <div className="end-box">
                <div className="end-shine" />
                <div className="end-icon">{icon}</div>
                <h2 className="end-title">{title}</h2>
                <p className="end-sub">{sub}</p>
                <div className="end-stars">
                    {stars.map((s, i) => <span key={i} className="end-star">{s}</span>)}
                </div>
                <div className="end-actions">
                    <button className="end-btn end-btn-home" onClick={() => navigate('/')}>
                        🏠 Inicio
                    </button>
                    <button className="end-btn end-btn-mode" onClick={() => navigate('/battle')}>
                        ⚔ Elegir Modo
                    </button>
                </div>
            </div>
        </div>
    );
};
