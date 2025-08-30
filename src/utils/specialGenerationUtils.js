// src/utils/specialGenerationUtils.js

// Listas de habilidades y movimientos por tipo (en español)
const typeData = {
  electric: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." },
      { name: "Electromotor", description: "Aumenta la Velocidad si es golpeado por un movimiento de tipo Eléctrico." },
      { name: "Absorbe electricidad", description: "Si lo alcanza un movimiento de tipo eléctrico, recupera PS en vez de sufrir daño." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "electric" },
      { id: "thunderbolt", name: "Rayo", type: "electric" },
      { id: "volt-switch", name: "Voltiocambio", type: "electric" },
      { id: "wild-charge", name: "Voltio Cruel", type: "electric" },
      { id: "Volt-Tackle", name: "Placaje eléctrico", type: "electric" },
      { id: "Shock-Wave", name: "Onda voltio", type: "electric" },
      { id: "Zap-Cannon", name: "Electrocañón", type: "electric" }
    ]
  },
  grass: {
    abilities: [
        { name: "Espesura", description: "Potencia los movimientos de tipo Planta cuando el Pokémon tiene pocos PS." },
        { name: "Clorofila", description: "Duplica la Velocidad del Pokémon si hace sol." },
        { name: "Defensa Hoja", description: "Evita problemas de estado si hace sol." }
    ],
    moves: [
        { id: "vine-whip", name: "Látigo Cepa", type: "grass" },
        { id: "razor-leaf", name: "Hoja Afilada", type: "grass" },
        { id: "solar-beam", name: "Rayo Solar", type: "grass" },
        { id: "giga-drain", name: "Gigadrenado", type: "grass" }
    ]
  },
  fire: {
    abilities: [
        { name: "Mar Llamas", description: "Potencia los movimientos de tipo Fuego cuando el Pokémon tiene pocos PS." },
        { name: "Absorbe Fuego", description: "Anula el daño de movimientos de tipo Fuego y potencia los propios." },
        { name: "Cuerpo Llama", description: "Puede quemar al contacto." }
    ],
    moves: [
        { id: "ember", name: "Ascuas", type: "fire" },
        { id: "flamethrower", name: "Lanzallamas", type: "fire" },
        { id: "fire-blast", name: "Llamarada", type: "fire" },
        { id: "flare-blitz", name: "Envite Ígneo", type: "fire" }
    ]
  },
  water: {
      abilities: [
        { name: "Torrente", description: "Potencia los movimientos de tipo Agua cuando el Pokémon tiene pocos PS." },
        { name: "Absorbe Agua", description: "Recupera PS al ser golpeado por un movimiento de tipo Agua." },
        { name: "Nado Rápido", description: "Duplica la Velocidad si está lloviendo." }
      ],
      moves: [
        { id: "water-gun", name: "Pistola Agua", type: "water" },
        { id: "hydro-pump", name: "Hidrobomba", type: "water" },
        { id: "surf", name: "Surf", type: "water" },
        { id: "scald", name: "Escaldar", type: "water" }
      ]
  },
  // (Puedes añadir más tipos aquí si lo necesitas)
  normal: {
      abilities: [{ name: "Intrépido", description: "Permite golpear a Pokémon de tipo Fantasma con movimientos de tipo Normal y Lucha." }],
      moves: [
        { id: "tackle", name: "Placaje", type: "normal" },
        { id: "quick-attack", name: "Ataque Rápido", type: "normal" },
        { id: "hyper-beam", name: "Hiperrayo", type: "normal" },
        { id: "double-edge", name: "Doble Filo", type: "normal" }
      ]
  }
};

// Función para obtener una habilidad aleatoria basada en el primer tipo del Pokémon
export const getAutomaticAbility = (types) => {
  const primaryType = types[0];
  if (typeData[primaryType] && typeData[primaryType].abilities.length > 0) {
    const abilities = typeData[primaryType].abilities;
    return abilities[Math.floor(Math.random() * abilities.length)];
  }
  // Habilidad por defecto si el tipo no está en nuestra lista
  return { name: "Habilidad Única", description: "Este Pokémon posee una habilidad nunca antes vista." };
};

// Función para obtener una lista de movimientos basada en los tipos del Pokémon
export const getAutomaticMoves = (types) => {
  let moves = [];
  
  types.forEach(type => {
    if (typeData[type] && typeData[type].moves) {
      moves.push(...typeData[type].moves);
    }
  });

  // Si no se encontraron movimientos para los tipos, añadimos algunos de tipo normal
  if (moves.length === 0 && typeData.normal.moves) {
      moves.push(...typeData.normal.moves);
  }

  // Mezclamos y seleccionamos hasta 4 movimientos para que no sean siempre los mismos
  const shuffled = moves.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};