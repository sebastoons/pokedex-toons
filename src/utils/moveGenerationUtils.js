// src/utils/moveGenerationUtils.js

// Base de datos de movimientos por tipo
export const MOVES_BY_TYPE = {
    normal: [
        { name: "Placaje", power: 40, damage_class: "physical" },
        { name: "Hiperrayo", power: 90, damage_class: "special" },
        { name: "Ataque Rápido", power: 40, damage_class: "physical" },
        { name: "Golpe Cabeza", power: 70, damage_class: "physical" },
        { name: "Destructor", power: 90, damage_class: "physical" },
        { name: "Ataque Cuerpo", power: 85, damage_class: "physical" }
    ],
    fire: [
        { name: "Ascuas", power: 40, damage_class: "special" },
        { name: "Lanzallamas", power: 90, damage_class: "special" },
        { name: "Rueda Fuego", power: 60, damage_class: "physical" },
        { name: "Llamarada", power: 110, damage_class: "special" },
        { name: "Puño Fuego", power: 75, damage_class: "physical" },
        { name: "Sofoco", power: 120, damage_class: "special" }
    ],
    water: [
        { name: "Pistola Agua", power: 40, damage_class: "special" },
        { name: "Surf", power: 90, damage_class: "special" },
        { name: "Hidrobomba", power: 110, damage_class: "special" },
        { name: "Burbuja", power: 40, damage_class: "special" },
        { name: "Rayo Burbuja", power: 65, damage_class: "special" },
        { name: "Cascada", power: 80, damage_class: "physical" }
    ],
    grass: [
        { name: "Drenadoras", power: 40, damage_class: "special" },
        { name: "Hoja Afilada", power: 55, damage_class: "physical" },
        { name: "Rayo Solar", power: 120, damage_class: "special" },
        { name: "Látigo Cepa", power: 45, damage_class: "physical" },
        { name: "Bomba Germen", power: 80, damage_class: "special" },
        { name: "Tormenta Floral", power: 90, damage_class: "special" }
    ],
    electric: [
        { name: "Impactrueno", power: 40, damage_class: "special" },
        { name: "Rayo", power: 90, damage_class: "special" },
        { name: "Puño Trueno", power: 75, damage_class: "physical" },
        { name: "Trueno", power: 110, damage_class: "special" },
        { name: "Chispa", power: 65, damage_class: "physical" },
        { name: "Rayo Carga", power: 50, damage_class: "special" }
    ],
    ice: [
        { name: "Rayo Hielo", power: 90, damage_class: "special" },
        { name: "Ventisca", power: 110, damage_class: "special" },
        { name: "Puño Hielo", power: 75, damage_class: "physical" },
        { name: "Nieve Polvo", power: 40, damage_class: "special" },
        { name: "Carámbano", power: 60, damage_class: "physical" },
        { name: "Vaho Gélido", power: 55, damage_class: "special" }
    ],
    fighting: [
        { name: "Karate", power: 50, damage_class: "physical" },
        { name: "Patada Baja", power: 65, damage_class: "physical" },
        { name: "Puño Dinámico", power: 100, damage_class: "physical" },
        { name: "Patada Salto", power: 100, damage_class: "physical" },
        { name: "Sumisión", power: 80, damage_class: "physical" },
        { name: "Golpe Cruzado", power: 100, damage_class: "physical" }
    ],
    poison: [
        { name: "Picotazo Veneno", power: 35, damage_class: "physical" },
        { name: "Bomba Lodo", power: 65, damage_class: "special" },
        { name: "Polvo Veneno", power: 0, damage_class: "status" },
        { name: "Ácido", power: 40, damage_class: "special" },
        { name: "Residuos", power: 65, damage_class: "special" },
        { name: "Colmillo Veneno", power: 50, damage_class: "physical" }
    ],
    ground: [
        { name: "Hueso Palo", power: 65, damage_class: "physical" },
        { name: "Terremoto", power: 100, damage_class: "physical" },
        { name: "Excavar", power: 80, damage_class: "physical" },
        { name: "Fisura", power: 0, damage_class: "physical" },
        { name: "Lanza Hueso", power: 90, damage_class: "physical" },
        { name: "Magnitud", power: 70, damage_class: "physical" }
    ],
    flying: [
        { name: "Picotazo", power: 35, damage_class: "physical" },
        { name: "Ataque Ala", power: 60, damage_class: "physical" },
        { name: "Tornado", power: 40, damage_class: "special" },
        { name: "Pico Taladro", power: 80, damage_class: "physical" },
        { name: "Vuelo", power: 90, damage_class: "physical" },
        { name: "Tajo Aéreo", power: 75, damage_class: "special" }
    ],
    psychic: [
        { name: "Confusión", power: 50, damage_class: "special" },
        { name: "Psicorrayo", power: 65, damage_class: "special" },
        { name: "Psíquico", power: 90, damage_class: "special" },
        { name: "Hipnosis", power: 0, damage_class: "status" },
        { name: "Psiconda", power: 80, damage_class: "special" },
        { name: "Premonición", power: 120, damage_class: "special" }
    ],
    bug: [
        { name: "Picadura", power: 35, damage_class: "physical" },
        { name: "Pin Misil", power: 25, damage_class: "physical" },
        { name: "Doble Bofetón", power: 15, damage_class: "physical" },
        { name: "Zumbido", power: 90, damage_class: "special" },
        { name: "Tijera X", power: 80, damage_class: "physical" },
        { name: "Megacuerno", power: 120, damage_class: "physical" }
    ],
    rock: [
        { name: "Lanzarrocas", power: 50, damage_class: "physical" },
        { name: "Avalancha", power: 75, damage_class: "physical" },
        { name: "Poder Pasado", power: 60, damage_class: "special" },
        { name: "Pedrada", power: 25, damage_class: "physical" },
        { name: "Roca Afilada", power: 100, damage_class: "physical" },
        { name: "Romperrocas", power: 40, damage_class: "physical" }
    ],
    ghost: [
        { name: "Lengüetazo", power: 30, damage_class: "physical" },
        { name: "Rayo Confuso", power: 50, damage_class: "special" },
        { name: "Bola Sombra", power: 80, damage_class: "special" },
        { name: "Puño Sombra", power: 60, damage_class: "physical" },
        { name: "Pesadilla", power: 0, damage_class: "status" },
        { name: "Garra Umbría", power: 70, damage_class: "physical" }
    ],
    dragon: [
        { name: "Furia Dragón", power: 40, damage_class: "special" },
        { name: "Pulso Dragón", power: 85, damage_class: "special" },
        { name: "Garra Dragón", power: 80, damage_class: "physical" },
        { name: "Cometa Draco", power: 130, damage_class: "special" },
        { name: "Ascenso Draco", power: 120, damage_class: "physical" },
        { name: "Aliento Dragón", power: 60, damage_class: "special" }
    ],
    steel: [
        { name: "Garra Metal", power: 50, damage_class: "physical" },
        { name: "Bala Bala", power: 25, damage_class: "physical" },
        { name: "Cabezazo", power: 80, damage_class: "physical" },
        { name: "Bomba Imán", power: 60, damage_class: "physical" },
        { name: "Represión Metal", power: 80, damage_class: "special" },
        { name: "Cañón Flash", power: 80, damage_class: "special" }
    ],
    dark: [
        { name: "Mordisco", power: 60, damage_class: "physical" },
        { name: "Triturar", power: 80, damage_class: "physical" },
        { name: "Sorpresa", power: 70, damage_class: "physical" },
        { name: "Pulso Umbrío", power: 80, damage_class: "special" },
        { name: "Golpe Bajo", power: 70, damage_class: "physical" },
        { name: "Juego Sucio", power: 95, damage_class: "physical" }
    ],
    fairy: [
        { name: "Viento Feérico", power: 40, damage_class: "special" },
        { name: "Carantoña", power: 90, damage_class: "physical" },
        { name: "Beso Drenaje", power: 50, damage_class: "special" },
        { name: "Luz Lunar", power: 0, damage_class: "status" },
        { name: "Fuerza Lunar", power: 95, damage_class: "special" },
        { name: "Vozarrón", power: 90, damage_class: "special" }
    ]
};

// Movimientos de estado/apoyo comunes
export const STATUS_MOVES = [
    { name: "Gruñido", power: 0, type: "normal", damage_class: "status" },
    { name: "Látigo", power: 0, type: "normal", damage_class: "status" },
    { name: "Danza Espada", power: 0, type: "normal", damage_class: "status" },
    { name: "Endurecimiento", power: 0, type: "normal", damage_class: "status" }
];

/**
 * Genera movimientos basados en los tipos del Pokémon
 * @param {Array} pokemonTypes - Array de tipos del Pokémon (ej: ['grass', 'poison'])
 * @param {Object} stats - Estadísticas del Pokémon para determinar si es más físico o especial
 * @returns {Array} Array de 4 movimientos
 */
export const generateMovesByTypes = (pokemonTypes, stats = null) => {
    const moves = [];
    
    // Asegurar que tenemos los tipos como strings
    const types = pokemonTypes.map(type => 
        typeof type === 'string' ? type : type.type?.name || type.name
    );
    
    // 1. Agregar 2 movimientos del tipo principal (el primero)
    const primaryType = types[0];
    if (MOVES_BY_TYPE[primaryType]) {
        const primaryMoves = [...MOVES_BY_TYPE[primaryType]];
        // Mezclar y tomar los 2 primeros
        primaryMoves.sort(() => 0.5 - Math.random());
        
        // Preferir movimientos con poder si tenemos estadísticas
        if (stats) {
            primaryMoves.sort((a, b) => {
                if (stats.attack > stats['special-attack']) {
                    // Preferir físicos
                    if (a.damage_class === 'physical' && b.damage_class !== 'physical') return -1;
                    if (b.damage_class === 'physical' && a.damage_class !== 'physical') return 1;
                } else {
                    // Preferir especiales
                    if (a.damage_class === 'special' && b.damage_class !== 'special') return -1;
                    if (b.damage_class === 'special' && a.damage_class !== 'special') return 1;
                }
                return b.power - a.power; // Por poder si son del mismo tipo
            });
        }
        
        moves.push(
            { ...primaryMoves[0], type: primaryType },
            { ...primaryMoves[1], type: primaryType }
        );
    }
    
    // 2. Si tiene un segundo tipo, agregar 1 movimiento de ese tipo
    if (types.length > 1 && types[1] !== types[0]) {
        const secondaryType = types[1];
        if (MOVES_BY_TYPE[secondaryType]) {
            const secondaryMoves = [...MOVES_BY_TYPE[secondaryType]];
            secondaryMoves.sort(() => 0.5 - Math.random());
            moves.push({ ...secondaryMoves[0], type: secondaryType });
        }
    }
    
    // 3. Agregar 1 movimiento Normal (siempre)
    const normalMoves = [...MOVES_BY_TYPE.normal];
    normalMoves.sort(() => 0.5 - Math.random());
    moves.push({ ...normalMoves[0], type: 'normal' });
    
    // 4. Si aún faltan movimientos, llenar con movimientos del tipo principal o normal
    while (moves.length < 4) {
        if (MOVES_BY_TYPE[primaryType] && Math.random() > 0.5) {
            const extraMoves = MOVES_BY_TYPE[primaryType].filter(move => 
                !moves.some(m => m.name === move.name)
            );
            if (extraMoves.length > 0) {
                moves.push({ ...extraMoves[0], type: primaryType });
                continue;
            }
        }
        
        // Fallback a movimientos normales
        const extraNormalMoves = MOVES_BY_TYPE.normal.filter(move => 
            !moves.some(m => m.name === move.name)
        );
        if (extraNormalMoves.length > 0) {
            moves.push({ ...extraNormalMoves[0], type: 'normal' });
        } else {
            // Último recurso: movimiento básico
            moves.push({ name: "Placaje", power: 40, type: "normal", damage_class: "physical" });
        }
    }
    
    return moves.slice(0, 4); // Asegurar que solo devolvemos 4 movimientos
};

/**
 * Obtiene un movimiento aleatorio de un tipo específico
 * @param {string} type - Tipo de movimiento deseado
 * @returns {Object} Movimiento con el tipo incluido
 */
export const getRandomMoveByType = (type) => {
    if (!MOVES_BY_TYPE[type]) {
        return { name: "Placaje", power: 40, type: "normal", damage_class: "physical" };
    }
    
    const moves = MOVES_BY_TYPE[type];
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return { ...randomMove, type };
};

/**
 * Mejora los movimientos existentes de un Pokémon si no están optimizados por tipo
 * @param {Object} pokemon - Objeto Pokémon con tipos y movimientos existentes
 * @returns {Array} Array de movimientos mejorados
 */
export const improvePokemonMoves = (pokemon) => {
    // Si el Pokémon ya tiene 4 movimientos que siguen el patrón de tipos, no hacer nada
    const types = pokemon.types.map(t => typeof t === 'string' ? t : t.type?.name || t.name);
    const primaryType = types[0];
    const secondaryType = types[1];
    
    const currentMoves = pokemon.moves || [];
    const primaryTypeMoves = currentMoves.filter(m => m.type === primaryType).length;
    const secondaryTypeMoves = secondaryType ? currentMoves.filter(m => m.type === secondaryType).length : 0;
    const normalMoves = currentMoves.filter(m => m.type === 'normal').length;
    
    // Si ya tiene la distribución correcta, mantener los movimientos actuales
    if (primaryTypeMoves >= 2 && normalMoves >= 1 && (!secondaryType || secondaryTypeMoves >= 1)) {
        return currentMoves.slice(0, 4);
    }
    
    // Si no, generar nuevos movimientos
    return generateMovesByTypes(types, pokemon.stats);
};