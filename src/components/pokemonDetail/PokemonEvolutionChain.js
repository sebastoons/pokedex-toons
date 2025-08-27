// src/components/pokemonDetail/PokemonEvolutionChain.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PokemonEvolutionChain.css';

// La función para formatear los requisitos de evolución ahora vivirá aquí.
// La tomamos de tu PokemonDetail.js original.
const formatEvolutionRequirement = (details) => {
    if (!details) return '';

    const trigger = details.trigger?.name;
    let requirement = '';

    switch (trigger) {
        case 'level-up':
            if (details.min_level) {
                requirement = `Nv. ${details.min_level}`;
            } else if (details.min_happiness) {
                requirement = `Felicidad`;
            } else if (details.min_affection) {
                requirement = `Afecto`;
            } else if (details.min_beauty) {
                requirement = `Belleza`;
            } else {
                requirement = 'Por nivel';
            }
            if (details.time_of_day && details.time_of_day !== '') {
                requirement += ` (${details.time_of_day === 'day' ? 'Día' : 'Noche'})`;
            }
            if (details.known_move) {
                const moveName = details.known_move.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                requirement += ` (con ${moveName})`;
            }
            break;
        case 'trade':
            requirement = 'Intercambio';
            if (details.held_item) {
                const itemName = details.held_item.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                requirement += ` (equipando ${itemName})`;
            }
            break;
        case 'use-item':
            if (details.item) {
                let itemName = details.item.name;
                const stoneTranslations = {
                    'thunder-stone': 'Piedra Trueno', 'leaf-stone': 'Piedra Hoja',
                    'moon-stone': 'Piedra Lunar', 'sun-stone': 'Piedra Solar',
                    'water-stone': 'Piedra Agua', 'fire-stone': 'Piedra Fuego',
                    'oval-stone': 'Piedra Oval', 'shiny-stone': 'Piedra Alba',
                    'dusk-stone': 'Piedra Noche', 'dawn-stone': 'Piedra Día',
                    'ice-stone': 'Piedra Hielo'
                };
                itemName = stoneTranslations[itemName] || itemName.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                requirement = `Usar ${itemName}`;
            } else {
                requirement = 'Usar objeto';
            }
            break;
        case 'shed':
            requirement = 'Vacío en equipo';
            break;
        default:
            requirement = `Condición especial`;
    }
    return requirement.trim();
};


const PokemonEvolutionChain = ({ evolutionLine }) => {
  const navigate = useNavigate();

  if (!evolutionLine || evolutionLine.length <= 1) { // No mostramos nada si no hay evoluciones
    return (
        <div className="evolution-section">
            <h3>Linea Evolutiva</h3>
            <p>Este Pokémon no tiene línea evolutiva.</p>
        </div>
    );
  }

  return (
    <div className="evolution-section">
      <h3>Linea Evolutiva</h3>
      <div className="evolution-line-container">
        {evolutionLine.map((evoPokemon, index) => (
          <React.Fragment key={evoPokemon.id}>
            {index > 0 && (
              <div className="evolution-path-details">
                <span className="evolution-requirement">
                  {evoPokemon.details ? formatEvolutionRequirement(evoPokemon.details) : 'Evolución'}
                </span>
                <span className="evolution-arrow">→</span>
              </div>
            )}
            <div 
              className="evolution-stage"
              onClick={() => navigate(`/pokemon/${evoPokemon.id}`)}
              title={`Ver detalles de ${evoPokemon.name}`}
            >
              <img src={evoPokemon.sprite} alt={evoPokemon.name} className="evolution-sprite" />
              <span className="evolution-name">{evoPokemon.name}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PokemonEvolutionChain;