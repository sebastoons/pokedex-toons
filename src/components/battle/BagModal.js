import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BagModal.css';

const ITEMS = [
    {
        id: 'potions',
        name: 'Poción',
        description: 'Restaura 33% de PS',
        icon: '💊',
        checkDisabled: (bag, pokemon) => bag.potions <= 0 || pokemon?.currentHp >= pokemon?.maxHp,
        disabledReason: (bag, pokemon) => {
            if (bag.potions <= 0) return 'Sin existencias';
            if (pokemon?.currentHp >= pokemon?.maxHp) return 'PS al máximo';
            return '';
        }
    },
    {
        id: 'antidote',
        name: 'Antídoto',
        description: 'Cura el veneno',
        icon: '🧪',
        checkDisabled: (bag, pokemon) => bag.antidote <= 0 || pokemon?.status !== 'poisoned',
        disabledReason: (bag, pokemon) => {
            if (bag.antidote <= 0) return 'Sin existencias';
            if (pokemon?.status !== 'poisoned') return 'No envenenado';
            return '';
        }
    },
];

export const BagModal = ({ bag, activePokemon, onUseItem, onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="bag-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bag-modal"
                    initial={{ scale: 0.8, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.8, y: 30, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bag-header">
                        <span className="bag-title">🎒 MOCHILA</span>
                        <button className="bag-close" onClick={onClose}>✕</button>
                    </div>

                    {activePokemon && (
                        <div className="bag-pokemon-info">
                            Usando en: <strong>{activePokemon.name.toUpperCase()}</strong>
                            <span className="bag-pokemon-hp"> ({activePokemon.currentHp}/{activePokemon.maxHp} PS)</span>
                        </div>
                    )}

                    <div className="bag-items-list">
                        {ITEMS.map(item => {
                            const count = bag[item.id] || 0;
                            const isDisabled = item.checkDisabled(bag, activePokemon);
                            const reason = item.disabledReason(bag, activePokemon);

                            return (
                                <button
                                    key={item.id}
                                    className={`bag-item-btn ${isDisabled ? 'disabled' : ''}`}
                                    onClick={() => { if (!isDisabled) { onUseItem(item.id); onClose(); } }}
                                    disabled={isDisabled}
                                >
                                    <span className="bag-item-icon">{item.icon}</span>
                                    <div className="bag-item-info">
                                        <span className="bag-item-name">{item.name}</span>
                                        <span className="bag-item-desc">{item.description}</span>
                                    </div>
                                    <div className="bag-item-right">
                                        <span className={`bag-item-count ${count === 0 ? 'empty' : ''}`}>
                                            x{count}
                                        </span>
                                        {isDisabled && reason && (
                                            <span className="bag-item-reason">{reason}</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="bag-footer">
                        <span className="bag-turn-note">⚠ Usar objeto consume tu turno</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
