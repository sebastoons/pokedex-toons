// src/components/BattleLogDisplay.js
import React from 'react';
import './BattleLogDisplay.css';

const BattleLogDisplay = ({ logMessages }) => (
    <div className="battle-log">
        {logMessages.map((message, index) => (
            <p key={index}>{message}</p>
        ))}
    </div>
);

export default BattleLogDisplay;