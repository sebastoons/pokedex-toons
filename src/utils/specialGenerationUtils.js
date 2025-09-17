// src/utils/specialGenerationUtils.js

// Listas de habilidades y movimientos por tipo (en español)
const typeData = {
  fairy: {
    abilities: [
      { name: "Inmunidad", description: "Su sistema inmunitario evita el envenenamiento" }
    ],
    moves: [
      { id: "Charm", name: "Encanto", type: "fairy" },
      { id: "Moonlight", name: "Luz lunar", type: "fairy" },
      { id: "Sweet Kiss", name: "Beso dulce", type: "fairy" }
    ]
  },
  dragon: {
    abilities: [
      { name: "Fuerza mental", description: "Gracias a su profunda concentración, no se amedrenta ante los ataques de otros Pokémon ni sufre los efectos de intimidación." }
    ],
    moves: [
      { id: "Dragon-Rage", name: "Furia dragón", type: "dragon" },
      { id: "Outrage", name: "Rayo", type: "dragon" },
      { id: "Draco-Meteor", name: "Cometa draco", type: "dragon" },
      { id: "Dragon-Rush", name: "Carga dragón", type: "dragon" }
    ]
  },
  dark: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "dark" },
      { id: "thunderbolt", name: "Rayo", type: "dark" },
      { id: "volt-switch", name: "Voltiocambio", type: "dark" },
      { id: "wild-charge", name: "Voltio Cruel", type: "dark" }
    ]
  },
  rock: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "rock" },
      { id: "thunderbolt", name: "Rayo", type: "rock" },
      { id: "volt-switch", name: "Voltiocambio", type: "rock" },
      { id: "wild-charge", name: "Voltio Cruel", type: "rock" }
    ]
  },
  ghost: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "ghost" },
      { id: "thunderbolt", name: "Rayo", type: "ghost" },
      { id: "volt-switch", name: "Voltiocambio", type: "ghost" },
      { id: "wild-charge", name: "Voltio Cruel", type: "elecghostric" }
    ]
  },
  psychic: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "psychic" },
      { id: "thunderbolt", name: "Rayo", type: "psychic" },
      { id: "volt-switch", name: "Voltiocambio", type: "psychic" },
      { id: "wild-charge", name: "Voltio Cruel", type: "psychic" }
    ]
  },
  bug: {
    abilities: [
      { name: "Ojo compuesto", description: "Aumenta la precisión de sus movimientos." },
      { name: "Robustez", description: "El Pokémon no puede debilitarse de un solo golpe cuando tiene los PS al máximo. También evita los movimientos fulminantes." }
    ],
    moves: [
      { id: "Leech-Life", name: "Chupavidas", type: "bug" },
      { id: "Megahorn", name: "Megacuerno", type: "bug" },
      { id: "Bug-Bite", name: "Picadura", type: "bug" },
      { id: "Bug-Buzz", name: "Zumbido", type: "bug" }
    ]
  },
  poison: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "poison" },
      { id: "thunderbolt", name: "Rayo", type: "poison" },
      { id: "volt-switch", name: "Voltiocambio", type: "poison" },
      { id: "wild-charge", name: "Voltio Cruel", type: "poison" }
    ]
  },
  ground: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "ground" },
      { id: "thunderbolt", name: "Rayo", type: "ground" },
      { id: "volt-switch", name: "Voltiocambio", type: "ground" },
      { id: "wild-charge", name: "Voltio Cruel", type: "ground" }
    ]
  },
  flying: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "flying" },
      { id: "thunderbolt", name: "Rayo", type: "flying" },
      { id: "volt-switch", name: "Voltiocambio", type: "flying" },
      { id: "wild-charge", name: "Voltio Cruel", type: "flying" }
    ]
  },
  steel: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "steel" },
      { id: "thunderbolt", name: "Rayo", type: "steel" },
      { id: "volt-switch", name: "Voltiocambio", type: "steel" },
      { id: "wild-charge", name: "Voltio Cruel", type: "steel" }
    ]
  },
  ice: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "ice" },
      { id: "thunderbolt", name: "Rayo", type: "ice" },
      { id: "volt-switch", name: "Voltiocambio", type: "ice" },
      { id: "wild-charge", name: "Voltio Cruel", type: "ice" },
    ]
  },
  fighting: {
    abilities: [
      { name: "Pararrayos", description: "Atrae y anula los movimientos de tipo Eléctrico, aumentando el Ataque Especial." },
      { name: "Electricidad Estática", description: "Puede paralizar al contacto." },
      { name: "Electromotor", description: "Aumenta la Velocidad si es golpeado por un movimiento de tipo Eléctrico." },
      { name: "Absorbe electricidad", description: "Si lo alcanza un movimiento de tipo eléctrico, recupera PS en vez de sufrir daño." }
    ],
    moves: [
      { id: "thunder-shock", name: "Impactrueno", type: "fighting" },
      { id: "thunderbolt", name: "Rayo", type: "fighting" },
      { id: "volt-switch", name: "Voltiocambio", type: "fighting" },
      { id: "wild-charge", name: "Voltio Cruel", type: "fighting" },
      { id: "Volt-Tackle", name: "Placaje eléctrico", type: "fighting" },
      { id: "Shock-Wave", name: "Onda voltio", type: "fighting" },
      { id: "Zap-Cannon", name: "Electrocañón", type: "fighting" },
      { id: "Thunder Punch", name: "Puño trueno", type: "fighting" }
    ]
  },
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
      { id: "Zap-Cannon", name: "Electrocañón", type: "electric" },
      { id: "Thunder Punch", name: "Puño trueno", type: "electric" }
    ]
  },
  grass: {
    abilities: [
        { name: "Espesura", description: "Potencia los movimientos de tipo Planta cuando el Pokémon tiene pocos PS." },
        { name: "Clorofila", description: "Duplica la Velocidad del Pokémon si hace sol." },
        { name: "Defensa Hoja", description: "Evita problemas de estado si hace sol." }
    ],
    moves: [
        { id: "Frenzy Plant", name: "Planta Feroz", type: "grass" },
        { id: "razor-leaf", name: "Hoja Afilada", type: "grass" },
        { id: "solar-beam", name: "Rayo Solar", type: "grass" },
        { id: "giga-drain", name: "Gigadrenado", type: "grass" },
        { id: "petal-dance", name: "Danza Pétalo", type: "grass" },
        { id: "Seed-Bomb", name: "Bomba Germen", type: "grass" },
        { id: "Leaf-Blade", name: "Hoja Aguda", type: "grass" },
        { id: "Energy-Ball", name: "Energibola", type: "grass" }
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