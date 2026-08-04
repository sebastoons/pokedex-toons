// src/utils/moveGenerationUtils.js

// Base de datos extensa de movimientos por tipo
const movesByType = {
    normal: [
        { name: "Megapuño", power: 80, accuracy: 85, damage_class: "physical" },
        { name: "Cabezazo", power: 80, accuracy: 70, damage_class: "physical" },
        { name: "Megapatada", power: 100, accuracy: 75, damage_class: "physical" },
        { name: "Hiper Rayo", power: 150, accuracy: 90, damage_class: "special" },
        { name: "Cuchillada", power: 70, accuracy: 100, damage_class: "physical" },
        { name: "Golpe Cuerpo", power: 85, accuracy: 100, damage_class: "physical" },
        { name: "Doble Filo", power: 120, accuracy: 100, damage_class: "physical" }
    ],
    fire: [
        { name: "Ascuas", power: 40, accuracy: 100, damage_class: "special" },
        { name: "Lanzallamas", power: 90, accuracy: 100, damage_class: "special" },
        { name: "Puño Fuego", power: 75, accuracy: 100, damage_class: "physical" },
        { name: "Llamarada", power: 110, accuracy: 85, damage_class: "special" },
        { name: "Rueda Fuego", power: 60, accuracy: 100, damage_class: "physical" },
        { name: "Sofoco", power: 120, accuracy: 90, damage_class: "special" },
        { name: "Colmillo Ígneo", power: 65, accuracy: 95, damage_class: "physical" }
    ],
    water: [
        { name: "Pistola Agua", power: 40, accuracy: 100, damage_class: "special" },
        { name: "Surf", power: 90, accuracy: 100, damage_class: "special" },
        { name: "Hidrobomba", power: 110, accuracy: 80, damage_class: "special" },
        { name: "Cascada", power: 80, accuracy: 100, damage_class: "physical" },
        { name: "Aqua Jet", power: 40, accuracy: 100, damage_class: "physical", priority: 1 },
        { name: "Rayo Burbuja", power: 65, accuracy: 100, damage_class: "special" },
        { name: "Buceo", power: 80, accuracy: 100, damage_class: "physical" }
    ],
    grass: [
        { name: "Planta Feroz", power: 150, accuracy: 90, damage_class: "special" },
        { name: "Rayo Solar", power: 120, accuracy: 100, damage_class: "special" },
        { name: "Gigadrenado", power: 75, accuracy: 100, damage_class: "special" },
        { name: "Bomba Germen", power: 80, accuracy: 100, damage_class: "special" },
        { name: "Tormenta Hojas", power: 130, accuracy: 90, damage_class: "special" },
        { name: "Danza Pétalo", power: 120, accuracy: 100, damage_class: "special" },
        { name: "Energibola", power: 90, accuracy: 100, damage_class: "special" }
    ],
    electric: [
        { name: "Impactrueno", power: 40, accuracy: 100, damage_class: "special" },
        { name: "Rayo", power: 90, accuracy: 100, damage_class: "special" },
        { name: "Trueno", power: 110, accuracy: 70, damage_class: "special" },
        { name: "Puño Trueno", power: 75, accuracy: 100, damage_class: "physical" },
        { name: "Chispa", power: 65, accuracy: 100, damage_class: "physical" },
        { name: "Voltio Cruel", power: 120, accuracy: 100, damage_class: "physical" },
        { name: "Rayo Carga", power: 50, accuracy: 100, damage_class: "special" }
    ],
    psychic: [
        { name: "Confusión", power: 50, accuracy: 100, damage_class: "special" },
        { name: "Psíquico", power: 90, accuracy: 100, damage_class: "special" },
        { name: "Psicorrayo", power: 65, accuracy: 100, damage_class: "special" },
        { name: "Psicocorte", power: 70, accuracy: 100, damage_class: "physical" },
        { name: "Psicocolmillo", power: 85, accuracy: 90, damage_class: "physical" },
        { name: "Fuerza Mental", power: 80, accuracy: 100, damage_class: "special" },
        { name: "Psiconda", power: 100, accuracy: 100, damage_class: "special" }
    ],
    ice: [
        { name: "Rayo Hielo", power: 90, accuracy: 100, damage_class: "special" },
        { name: "Ventisca", power: 110, accuracy: 70, damage_class: "special" },
        { name: "Puño Hielo", power: 75, accuracy: 100, damage_class: "physical" },
        { name: "Colmillo Hielo", power: 65, accuracy: 95, damage_class: "physical" },
        { name: "Granizo", power: 0, accuracy: null, damage_class: "status" },
        { name: "Viento Hielo", power: 55, accuracy: 95, damage_class: "special" },
        { name: "Carámbano", power: 85, accuracy: 90, damage_class: "physical" }
    ],
    fighting: [
        { name: "Karate", power: 50, accuracy: 100, damage_class: "physical" },
        { name: "Patada Baja", power: 65, accuracy: 100, damage_class: "physical" },
        { name: "Puño Certero", power: 150, accuracy: 70, damage_class: "physical" },
        { name: "Machada", power: 100, accuracy: 100, damage_class: "physical" },
        { name: "Patada Salto", power: 100, accuracy: 95, damage_class: "physical" },
        { name: "Golpe Roca", power: 40, accuracy: 100, damage_class: "physical" },
        { name: "Puño Dinámico", power: 100, accuracy: 50, damage_class: "physical" }
    ],
    poison: [
        { name: "Ácido", power: 40, accuracy: 100, damage_class: "special" },
        { name: "Bomba Lodo", power: 90, accuracy: 100, damage_class: "special" },
        { name: "Colmillo Veneno", power: 50, accuracy: 100, damage_class: "physical" },
        { name: "Púas Tóxicas", power: 80, accuracy: 100, damage_class: "physical" },
        { name: "Bomba Ácida", power: 120, accuracy: 85, damage_class: "special" },
        { name: "Residuos", power: 120, accuracy: 85, damage_class: "special" },
        { name: "Rayo Venenoso", power: 80, accuracy: 95, damage_class: "special" }
    ],
    ground: [
        { name: "Terremoto", power: 100, accuracy: 100, damage_class: "physical" },
        { name: "Excavar", power: 80, accuracy: 100, damage_class: "physical" },
        { name: "Hueso Palo", power: 65, accuracy: 85, damage_class: "physical" },
        { name: "Fisura", power: 150, accuracy: 30, damage_class: "physical" },
        { name: "Bofetón Lodo", power: 20, accuracy: 100, damage_class: "special" },
        { name: "Magnitud", power: 70, accuracy: 100, damage_class: "physical" },
        { name: "Fuerza Telúrica", power: 90, accuracy: 100, damage_class: "physical" }
    ],
    flying: [
        { name: "Ataque Ala", power: 60, accuracy: 100, damage_class: "physical" },
        { name: "Pájaro Osado", power: 120, accuracy: 100, damage_class: "physical" },
        { name: "Tornado", power: 40, accuracy: 70, damage_class: "special" },
        { name: "Picoteo", power: 35, accuracy: 100, damage_class: "physical" },
        { name: "Tajo Aéreo", power: 75, accuracy: 95, damage_class: "special" },
        { name: "Huracán", power: 110, accuracy: 70, damage_class: "special" },
        { name: "Acróbata", power: 55, accuracy: 100, damage_class: "physical" }
    ],
    bug: [
        { name: "Picadura", power: 60, accuracy: 100, damage_class: "physical" },
        { name: "Pin Misil", power: 25, accuracy: 95, damage_class: "physical" },
        { name: "Megacuerno", power: 120, accuracy: 85, damage_class: "physical" },
        { name: "Tijera X", power: 80, accuracy: 100, damage_class: "physical" },
        { name: "Zumbido", power: 90, accuracy: 100, damage_class: "special" },
        { name: "Danza Aleteo", power: 0, accuracy: null, damage_class: "status" },
        { name: "Ataque Fury", power: 15, accuracy: 85, damage_class: "physical" }
    ],
    rock: [
        { name: "Lanzarrocas", power: 50, accuracy: 90, damage_class: "physical" },
        { name: "Avalancha", power: 75, accuracy: 90, damage_class: "physical" },
        { name: "Pedrada", power: 100, accuracy: 80, damage_class: "physical" },
        { name: "Tumba Rocas", power: 60, accuracy: 95, damage_class: "physical" },
        { name: "Cabezazo", power: 150, accuracy: 80, damage_class: "physical" },
        { name: "Roca Afilada", power: 100, accuracy: 80, damage_class: "physical" },
        { name: "Poder Pasado", power: 60, accuracy: 100, damage_class: "special" }
    ],
    ghost: [
        { name: "Lengüetazo", power: 30, accuracy: 100, damage_class: "physical" },
        { name: "Bola Sombra", power: 80, accuracy: 100, damage_class: "special" },
        { name: "Puño Sombra", power: 60, accuracy: 100, damage_class: "physical" },
        { name: "Rayo Confuso", power: 0, accuracy: null, damage_class: "status" },
        { name: "Garra Sombría", power: 70, accuracy: 100, damage_class: "physical" },
        { name: "Pesadilla", power: 0, accuracy: null, damage_class: "status" },
        { name: "Golpe Fantasma", power: 90, accuracy: 100, damage_class: "physical" }
    ],
    dragon: [
        { name: "Furia Dragón", power: 40, accuracy: 100, damage_class: "special" },
        { name: "Pulso Dragón", power: 85, accuracy: 100, damage_class: "special" },
        { name: "Garra Dragón", power: 80, accuracy: 100, damage_class: "physical" },
        { name: "Cometa Draco", power: 130, accuracy: 90, damage_class: "special" },
        { name: "Cola Dragón", power: 60, accuracy: 90, damage_class: "physical" },
        { name: "Ascenso Draco", power: 120, accuracy: 100, damage_class: "special" },
        { name: "Aliento Dragón", power: 60, accuracy: 100, damage_class: "special" }
    ],
    steel: [
        { name: "Garra Metal", power: 50, accuracy: 95, damage_class: "physical" },
        { name: "Cabeza Hierro", power: 80, accuracy: 100, damage_class: "physical" },
        { name: "Bomba Imán", power: 60, accuracy: 100, damage_class: "physical" },
        { name: "Cañón Meteoro", power: 120, accuracy: 85, damage_class: "special" },
        { name: "Corte Furia", power: 40, accuracy: 85, damage_class: "physical" },
        { name: "Represalia", power: 50, accuracy: 100, damage_class: "physical" },
        { name: "Cola Férrea", power: 100, accuracy: 75, damage_class: "physical" }
    ],
    dark: [
        { name: "Mordisco", power: 60, accuracy: 100, damage_class: "physical" },
        { name: "Triturar", power: 80, accuracy: 100, damage_class: "physical" },
        { name: "Pulso Umbrío", power: 80, accuracy: 100, damage_class: "special" },
        { name: "Golpe Bajo", power: 70, accuracy: 100, damage_class: "physical" },
        { name: "Juego Sucio", power: 95, accuracy: 100, damage_class: "physical" },
        { name: "Noche Aciaga", power: 80, accuracy: 100, damage_class: "special" },
        { name: "Payback", power: 50, accuracy: 100, damage_class: "physical" }
    ],
    fairy: [
        { name: "Voz Cautivadora", power: 40, accuracy: 100, damage_class: "special" },
        { name: "Fuerza Lunar", power: 95, accuracy: 100, damage_class: "special" },
        { name: "Carantoña", power: 90, accuracy: 90, damage_class: "physical" },
        { name: "Brillo Mágico", power: 80, accuracy: 100, damage_class: "special" },
        { name: "Beso Dulce", power: 50, accuracy: 100, damage_class: "special" },
        { name: "Viento Feérico", power: 90, accuracy: 100, damage_class: "special" },
        { name: "Campo de Niebla", power: 0, accuracy: null, damage_class: "status" }
    ]
};

// Movimientos normales como fallback
const normalFallbackMoves = [
    { name: "Placaje", power: 40, accuracy: 100, damage_class: "physical" },
    { name: "Arañazo", power: 40, accuracy: 100, damage_class: "physical" },
    { name: "Ataque Rápido", power: 40, accuracy: 100, damage_class: "physical", priority: 1 },
    { name: "Golpe Cuerpo", power: 85, accuracy: 100, damage_class: "physical" }
];

// Agrega `candidate` a `moves` solo si su nombre no está ya presente
const pushUniqueMove = (moves, candidate) => {
    if (candidate && !moves.some(m => m.name === candidate.name)) {
        moves.push(candidate);
        return true;
    }
    return false;
};

// Función para generar movimientos según los tipos del Pokémon
export const generateMovesByTypes = (pokemonTypes, stats = null) => {
    const types = Array.isArray(pokemonTypes) ? pokemonTypes : [pokemonTypes];
    const moves = [];

    if (types.length === 0) {
        return normalFallbackMoves.slice(0, 4);
    }

    // Tipo principal (primeros 2 movimientos)
    const primaryType = types[0];
    const primaryMoves = movesByType[primaryType] || normalFallbackMoves;

    for (let i = 0; i < primaryMoves.length && moves.length < 2; i++) {
        pushUniqueMove(moves, { ...primaryMoves[i], type: primaryType, pp: 15 });
    }

    // Tipo secundario (1 movimiento), o un tercer movimiento del tipo principal
    if (types.length > 1) {
        const secondaryType = types[1];
        const secondaryMoves = movesByType[secondaryType] || normalFallbackMoves;
        for (let i = 0; i < secondaryMoves.length && moves.length < 3; i++) {
            if (pushUniqueMove(moves, { ...secondaryMoves[i], type: secondaryType, pp: 10 })) break;
        }
    } else {
        for (let i = 2; i < primaryMoves.length && moves.length < 3; i++) {
            if (pushUniqueMove(moves, { ...primaryMoves[i], type: primaryType, pp: 10 })) break;
        }
    }

    // Movimiento normal (último slot), evitando duplicar uno ya elegido
    const normalMoves = movesByType.normal;
    if (normalMoves.length > 0) {
        const startIdx = Math.floor(Math.random() * normalMoves.length);
        for (let i = 0; i < normalMoves.length && moves.length < 4; i++) {
            const candidate = normalMoves[(startIdx + i) % normalMoves.length];
            if (pushUniqueMove(moves, { ...candidate, type: 'normal', pp: 20 })) break;
        }
    }

    // Completar con movimientos normales si faltan (sin duplicar)
    let fallbackIdx = 0;
    while (moves.length < 4 && fallbackIdx < normalFallbackMoves.length * 2) {
        const fallback = normalFallbackMoves[fallbackIdx % normalFallbackMoves.length];
        pushUniqueMove(moves, { ...fallback, type: 'normal', pp: 15 });
        fallbackIdx++;
    }

    return moves.slice(0, 4);
};

// Función mejorada para Pokémon con movimientos existentes
export const improvePokemonMoves = (pokemon) => {
    if (!pokemon || !pokemon.types) {
        return normalFallbackMoves.slice(0, 4);
    }

    const types = pokemon.types.map(t => typeof t === 'string' ? t : t.type?.name || t.name);
    
    // Generar movimientos basados en tipos
    const generatedMoves = generateMovesByTypes(types, pokemon.stats);
    
    // Si el Pokémon ya tiene movimientos, mezclarlos con los generados
    // (sin duplicar por nombre, ej. "Placaje" podía venir en ambos grupos)
    if (pokemon.moves && pokemon.moves.length > 0) {
        const existingMoves = pokemon.moves.slice(0, 2); // Mantener algunos existentes
        const combined = [...existingMoves];
        for (const move of generatedMoves) {
            if (combined.length >= 4) break;
            if (!combined.some(m => m.name === move.name)) combined.push(move);
        }
        return combined.slice(0, 4);
    }

    return generatedMoves;
};