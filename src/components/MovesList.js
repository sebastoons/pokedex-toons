import React from 'react';

// Función para obtener color por tipo
function getTypeColor(type) {
  switch(type) {
    case 'planta': return '#4CAF50';
    case 'veneno': return '#9C27B0';
    case 'agua': return '#2196F3';
    case 'fuego': return '#FF5722';
    case 'eléctrico': return '#FFEB3B';
    case 'volador': return '#81D4FA';
    case 'bicho': return '#8BC34A';
    case 'psíquico': return '#F06292';
    case 'roca': return '#795548';
    case 'tierra': return '#A1887F';
    case 'hielo': return '#00BCD4';
    case 'dragón': return '#3F51B5';
    case 'fantasma': return '#6A1B9A';
    case 'acero': return '#B0BEC5';
    case 'siniestro': return '#263238';
    case 'hada': return '#F8BBD0';
    case 'lucha': return '#E57373';
    case 'normal': 
    default: return '#BDBDBD';
  }
}

// Filtra y ordena los movimientos: 2 del tipo principal, 1 del secundario (si tiene), 1 normal
function selectMoves(moves, types) {
  const mainType = types[0];
  const secondaryType = types[1];
  const mainMoves = moves.filter(m => m.type === mainType).slice(0, 2);
  const secondaryMoves = secondaryType ? moves.filter(m => m.type === secondaryType).slice(0, 1) : [];
  const normalMove = moves.find(m => m.type === 'normal');
  let selected = [...mainMoves, ...secondaryMoves];
  if (normalMove && !selected.some(m => m.name === normalMove.name)) selected.push(normalMove);
  // Si faltan movimientos, usa los primeros que haya (hasta completar 4)
  while(selected.length < 4 && moves[selected.length]) selected.push(moves[selected.length]);
  return selected.slice(0, 4);
}

function MovesList({ moves, onAttack, disabled, types }) {
  const shownMoves = selectMoves(moves, types);

  return (
    <div className="moves-list">
      {shownMoves.map(move => (
        <button
          key={move.name}
          style={{
            backgroundColor: getTypeColor(move.type),
            color: '#fff',
            margin: '0 5px',
            minWidth: '100px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          onClick={() => !disabled && onAttack(move)}
          disabled={disabled}
        >
          {move.name}
        </button>
      ))}
    </div>
  );
}

export default MovesList;