// src/components/PokedexMenu.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PokedexMenu.css';

const MENU_ITEMS = [
    { id: 'pokedex', label: 'Pokédex', icon: '📖', path: '/',       desc: 'Explorar Pokémon' },
    { id: 'battle',  label: 'Batalla', icon: '⚔️',  path: '/battle', desc: 'Modo combate' },
];

export default function PokedexMenu({ onClose }) {
    const navigate = useNavigate();
    const [opening, setOpening] = useState(false);
    const [selectedPath, setSelectedPath] = useState(null);
    const closeTimerRef = useRef(null);

    useEffect(() => () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    }, []);

    const handleSelect = (path) => {
        if (opening) return;
        setSelectedPath(path);
        setOpening(true);
        closeTimerRef.current = setTimeout(() => {
            onClose();
            navigate(path);
        }, 900);
    };

    return (
        <div className={`pdx-overlay ${opening ? 'pdx-opening' : ''}`}>
            {/* Top half of the Pokédex */}
            <div className="pdx-top">
                <div className="pdx-screen-bezel">
                    <div className="pdx-camera-row">
                        <div className="pdx-camera-dot" />
                        <div className="pdx-led red" />
                        <div className="pdx-led yellow" />
                        <div className="pdx-led green" />
                    </div>
                    <div className="pdx-main-screen">
                        <div className="pdx-screen-inner">
                            <div className="pdx-brand">
                                <span className="pdx-brand-text">POKÉDEX</span>
                                <span className="pdx-brand-model">DX–2000</span>
                            </div>
                            <div className="pdx-menu-list">
                                {MENU_ITEMS.map(item => (
                                    <button
                                        key={item.id}
                                        className={`pdx-menu-item ${selectedPath === item.path ? 'pdx-selected' : ''}`}
                                        onClick={() => handleSelect(item.path)}
                                    >
                                        <span className="pdx-item-icon">{item.icon}</span>
                                        <span className="pdx-item-label">{item.label}</span>
                                        <span className="pdx-item-desc">{item.desc}</span>
                                        <span className="pdx-item-arrow">▶</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hinge line */}
            <div className="pdx-hinge">
                <div className="pdx-hinge-inner" />
            </div>

            {/* Bottom half of the Pokédex */}
            <div className="pdx-bottom">
                <div className="pdx-bottom-inner">
                    <div className="pdx-dpad-area">
                        <div className="pdx-dpad">
                            <div className="pdx-dpad-v" />
                            <div className="pdx-dpad-h" />
                            <div className="pdx-dpad-center" />
                        </div>
                    </div>
                    <div className="pdx-buttons-area">
                        <div className="pdx-small-screen">
                            <div className="pdx-small-screen-inner">
                                <span>SELECCIONA</span>
                            </div>
                        </div>
                        <div className="pdx-action-btns">
                            <div className="pdx-btn red" />
                            <div className="pdx-btn blue" />
                        </div>
                    </div>
                    <div className="pdx-speaker">
                        {[...Array(5)].map((_, i) => <div key={i} className="pdx-speaker-hole" />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
