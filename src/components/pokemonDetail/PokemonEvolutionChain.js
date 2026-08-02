// src/components/pokemonDetail/PokemonEvolutionChain.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PokemonEvolutionChain.css';

const humanize = (slug) => slug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const STONE_TRANSLATIONS = {
    'thunder-stone': 'Piedra Trueno', 'leaf-stone': 'Piedra Hoja',
    'moon-stone': 'Piedra Lunar', 'sun-stone': 'Piedra Solar',
    'water-stone': 'Piedra Agua', 'fire-stone': 'Piedra Fuego',
    'oval-stone': 'Piedra Oval', 'shiny-stone': 'Piedra Alba',
    'dusk-stone': 'Piedra Noche', 'dawn-stone': 'Piedra Día',
    'ice-stone': 'Piedra Hielo',
};

const translateItem = (itemName) => STONE_TRANSLATIONS[itemName] || humanize(itemName);

// Idea 7: método de evolución explícito (piedra, intercambio, felicidad,
// objeto sostenido...), con un ícono por tipo de disparador para que se
// distinga de un vistazo, tal como en la Pokédex de los juegos.
const formatEvolutionRequirement = (details) => {
    if (!details) return { icon: '❓', text: '' };

    const trigger = details.trigger?.name;
    let text = '';
    let icon = '⭐';

    switch (trigger) {
        case 'level-up':
            icon = '📈';
            if (details.min_level) {
                text = `Nv. ${details.min_level}`;
            } else if (details.min_happiness) {
                text = 'Felicidad';
                icon = '💗';
            } else if (details.min_affection) {
                text = 'Afecto';
                icon = '💗';
            } else if (details.min_beauty) {
                text = 'Belleza';
                icon = '💗';
            } else {
                text = 'Por nivel';
            }
            if (details.held_item) {
                text += ` (con ${translateItem(details.held_item.name)})`;
                icon = '🎒';
            }
            if (details.time_of_day) {
                text += ` (${details.time_of_day === 'day' ? 'Día' : 'Noche'})`;
            }
            if (details.known_move) {
                text += ` (con ${humanize(details.known_move.name)})`;
            }
            if (details.location) {
                text += ` en ${humanize(details.location.name)}`;
                icon = '📍';
            }
            break;
        case 'trade':
            icon = '🔄';
            text = 'Intercambio';
            if (details.held_item) {
                text += ` (equipando ${translateItem(details.held_item.name)})`;
            }
            break;
        case 'use-item':
            icon = '💎';
            text = details.item ? `Usar ${translateItem(details.item.name)}` : 'Usar objeto';
            break;
        case 'shed':
            icon = '🌀';
            text = 'Vacío en equipo';
            break;
        default:
            icon = '❓';
            text = 'Condición especial';
    }
    return { icon, text: text.trim() };
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
        {evolutionLine.map((evoPokemon, index) => {
          const req = index > 0 && evoPokemon.details ? formatEvolutionRequirement(evoPokemon.details) : null;
          return (
          <React.Fragment key={evoPokemon.id}>
            {index > 0 && (
              <div className="evolution-path-details">
                <span className="evolution-requirement">
                  <span className="evolution-requirement-icon">{req?.icon ?? '⭐'}</span>
                  {req?.text || 'Evolución'}
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
          );
        })}
      </div>
    </div>
  );
};

export default PokemonEvolutionChain;