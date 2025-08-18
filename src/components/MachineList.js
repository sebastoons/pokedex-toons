// src/components/MachineList.js

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmhmList } from '../data/tmhmData.js';
import '../App.css'; 

// Lista de tipos para el filtro dropdown
const ALL_POKEMON_TYPES = [
    { value: 'normal', display: 'Normal' }, { value: 'fire', display: 'Fuego' },
    { value: 'water', display: 'Agua' }, { value: 'electric', display: 'Eléctrico' },
    { value: 'grass', display: 'Planta' }, { value: 'ice', display: 'Hielo' },
    { value: 'fighting', display: 'Lucha' }, { value: 'poison', display: 'Veneno' },
    { value: 'ground', display: 'Tierra' }, { value: 'flying', display: 'Volador' },
    { value: 'psychic', display: 'Psíquico' }, { value: 'bug', display: 'Bicho' },
    { value: 'rock', display: 'Roca' }, { value: 'ghost', display: 'Fantasma' },
    { value: 'dragon', display: 'Dragón' }, { value: 'dark', display: 'Siniestro' },
    { value: 'steel', display: 'Acero' }, { value: 'fairy', display: 'Hada' },
];

const translateTypeName = (typeName) => {
    const type = ALL_POKEMON_TYPES.find(t => t.value === typeName.toLowerCase());
    return type ? type.display : typeName;
};

function MachineList() {
    const navigate = useNavigate();

    // 1. AÑADIMOS ESTADOS PARA LOS FILTROS
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');

    // 2. USAMOS useMemo PARA CALCULAR LA LISTA FILTRADA EFICIENTEMENTE
    const filteredList = useMemo(() => {
        let list = tmhmList;

        // Filtrar por tipo seleccionado
        if (selectedType) {
            list = list.filter(machine => machine.type === selectedType);
        }

        // Filtrar por término de búsqueda (nombre o número)
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            list = list.filter(machine =>
                machine.machineName.toLowerCase().includes(lowerCaseSearchTerm) ||
                machine.moveName.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        return list;
    }, [searchTerm, selectedType]); // Se vuelve a calcular solo si cambia el término de búsqueda o el tipo

    return (
        <div className="move-list-view">
            <button onClick={() => navigate('/')} className="back-button">
                ← Volver a la Pokedex
            </button>
            
            <h2>LISTA DE MT / MO</h2>

            {/* 3. AÑADIMOS LOS CONTROLES DE FILTRO */}
            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Buscar por MT/MO o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="type-select"
                >
                    <option value="">Todos</option>
                    {ALL_POKEMON_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.display}
                        </option>
                    ))}
                </select>
            </div>

            {/* 4. CAMBIAMOS LA LISTA DE TARJETAS POR UNA TABLA */}
            <div className="table-container">
                <table className="move-table">
                    <thead>
                        <tr>
                            <th>MT/MO</th>
                            <th>NOMBRE</th>
                            <th>TIPO</th>
                            <th>PODER</th>
                            <th>PRECISION</th>
                            <th>PP</th>
                            <th className="description-col">DETALLE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.map((machine, index) => (
                            <tr key={index}>
                                <td>{machine.machineName}</td>
                                <td>{machine.moveName}</td>
                                <td>
                                    <span className={`type-badge type-${machine.type}`}>
                                        {translateTypeName(machine.type)}
                                    </span>
                                </td>
                                <td>{machine.power !== null ? machine.power : '-'}</td>
                                <td>{machine.accuracy !== null ? machine.accuracy : '-'}</td>
                                <td>{machine.pp !== null ? machine.pp : '-'}</td>
                                <td className="description-col">{machine.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MachineList;