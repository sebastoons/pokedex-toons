// src/utils/moveTypeColors.js
export const getMoveTypeColor = (type) => {
    const typeColors = {
        normal: '#A8A878',
        fighting: '#C03028',
        flying: '#A890F0',
        poison: '#A040A0',
        ground: '#E0C068',
        rock: '#B8A038',
        bug: '#A8B820',
        ghost: '#705898',
        steel: '#B8B8D0',
        fire: '#F08030',
        water: '#6890F0',
        grass: '#78C850',
        electric: '#F8D030',
        psychic: '#F85888',
        ice: '#98D8D8',
        dragon: '#7038F8',
        dark: '#705848',
        fairy: '#EE99AC'
    };
    
    return typeColors[type?.toLowerCase()] || '#68A090'; // Color por defecto si no se encuentra el tipo
};

export const getMoveTypeGradient = (type) => {
    const typeGradients = {
        normal: 'linear-gradient(135deg, #A8A878, #9C9C6E)',
        fighting: 'linear-gradient(135deg, #C03028, #A02820)',
        flying: 'linear-gradient(135deg, #A890F0, #9080E0)',
        poison: 'linear-gradient(135deg, #A040A0, #903090)',
        ground: 'linear-gradient(135deg, #E0C068, #D0B058)',
        rock: 'linear-gradient(135deg, #B8A038, #A89030)',
        bug: 'linear-gradient(135deg, #A8B820, #98A818)',
        ghost: 'linear-gradient(135deg, #705898, #604888)',
        steel: 'linear-gradient(135deg, #B8B8D0, #A8A8C0)',
        fire: 'linear-gradient(135deg, #F08030, #E07028)',
        water: 'linear-gradient(135deg, #6890F0, #5880E0)',
        grass: 'linear-gradient(135deg, #78C850, #68B848)',
        electric: 'linear-gradient(135deg, #F8D030, #E8C028)',
        psychic: 'linear-gradient(135deg, #F85888, #E84878)',
        ice: 'linear-gradient(135deg, #98D8D8, #88C8C8)',
        dragon: 'linear-gradient(135deg, #7038F8, #6030E8)',
        dark: 'linear-gradient(135deg, #705848, #604840)',
        fairy: 'linear-gradient(135deg, #EE99AC, #DE899C)'
    };
    
    return typeGradients[type?.toLowerCase()] || 'linear-gradient(135deg, #68A090, #588080)';
};