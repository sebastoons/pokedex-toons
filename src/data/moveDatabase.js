// src/data/moveDatabase.js
// Base de movimientos por tipo usada en el selector de batalla (manual y aleatorio).
export const MOVES_DATABASE = {
    normal: [
        { name: "Placaje",       power: 40,  accuracy: 100,      type: "normal" },
        { name: "Arañazo",       power: 40,  accuracy: 100,      type: "normal" },
        { name: "Corte",         power: 50,  accuracy: 95,       type: "normal" },
        { name: "Golpe Cuerpo",  power: 85,  accuracy: 100,      type: "normal" },
        { name: "Hiperrayo",     power: 150, accuracy: 90,       type: "normal" },
        { name: "Rapidez",       power: 60,  accuracy: Infinity, type: "normal" },
        { name: "Danza Espada",  power: 0,   accuracy: 100,      type: "normal", damage_class: "status", statChange: { stat: "attack",  stages: 2, target: "self" } },
        { name: "Refuerzo",      power: 0,   accuracy: 100,      type: "normal", damage_class: "status", statChange: { stat: "defense", stages: 1, target: "self" } },
        { name: "Rugido",        power: 0,   accuracy: 100,      type: "normal", damage_class: "status", statChange: { stat: "attack",  stages: -1, target: "foe" } },
        { name: "Cola Látigo",   power: 0,   accuracy: 100,      type: "normal", damage_class: "status", statChange: { stat: "defense", stages: -1, target: "foe" } },
    ],
    fire: [
        { name: "Ascuas",       power: 40,  accuracy: 100, type: "fire" },
        { name: "Lanzallamas",  power: 90,  accuracy: 100, type: "fire" },
        { name: "Llamarada",    power: 110, accuracy: 85,  type: "fire" },
        { name: "Puño Fuego",   power: 75,  accuracy: 100, type: "fire" },
        { name: "Fuego Fatuo",  power: 0,   accuracy: 85,  type: "fire",     damage_class: "status" },
    ],
    water: [
        { name: "Pistola Agua", power: 40,  accuracy: 100, type: "water" },
        { name: "Surf",         power: 90,  accuracy: 100, type: "water" },
        { name: "Hidrobomba",   power: 110, accuracy: 80,  type: "water" },
        { name: "Rayo Burbuja", power: 65,  accuracy: 100, type: "water" },
    ],
    grass: [
        { name: "Látigo Cepa",  power: 45,  accuracy: 100, type: "grass" },
        { name: "Hoja Afilada", power: 55,  accuracy: 95,  type: "grass" },
        { name: "Rayo Solar",   power: 120, accuracy: 100, type: "grass" },
        { name: "Gigadrenado",  power: 75,  accuracy: 100, type: "grass" },
    ],
    electric: [
        { name: "Impactrueno",  power: 40,  accuracy: 100, type: "electric" },
        { name: "Rayo",         power: 90,  accuracy: 100, type: "electric" },
        { name: "Trueno",       power: 110, accuracy: 70,  type: "electric" },
        { name: "Puño Trueno",  power: 75,  accuracy: 100, type: "electric" },
        { name: "Onda Trueno",  power: 0,   accuracy: 90,  type: "electric", damage_class: "status" },
    ],
    ice: [
        { name: "Rayo Hielo",    power: 90,  accuracy: 100, type: "ice" },
        { name: "Ventisca",      power: 110, accuracy: 70,  type: "ice" },
        { name: "Puño Hielo",    power: 75,  accuracy: 100, type: "ice" },
        { name: "Aguanieve",     power: 40,  accuracy: 100, type: "ice" },
        { name: "Colmillo Hielo",power: 65,  accuracy: 95,  type: "ice" },
        { name: "Alud",          power: 75,  accuracy: 90,  type: "ice" },
    ],
    fighting: [
        { name: "Golpe Karate",  power: 50,  accuracy: 100, type: "fighting" },
        { name: "Sumisión",      power: 80,  accuracy: 80,  type: "fighting" },
        { name: "A Bocajarro",   power: 120, accuracy: 100, type: "fighting" },
        { name: "Patada Salto",  power: 100, accuracy: 95,  type: "fighting" },
        { name: "Giro Patada",   power: 60,  accuracy: 85,  type: "fighting" },
        { name: "Paliza",        power: 80,  accuracy: 100, type: "fighting" },
        { name: "Patada Baja",   power: 40,  accuracy: 100, type: "fighting" },
        { name: "Puño Dinámico", power: 100, accuracy: 50,  type: "fighting" },
        { name: "Contraataque",  power: 65,  accuracy: 100, type: "fighting" },
    ],
    poison: [
        { name: "Ácido",         power: 40,  accuracy: 100, type: "poison" },
        { name: "Bomba Lodo",    power: 90,  accuracy: 100, type: "poison" },
        { name: "Puya Nociva",   power: 80,  accuracy: 100, type: "poison" },
        { name: "Colmillo Veneno",power: 65, accuracy: 95,  type: "poison" },
        { name: "Residuo",       power: 45,  accuracy: 100, type: "poison" },
        { name: "Tóxico",        power: 0,   accuracy: 90,  type: "poison",  damage_class: "status" },
    ],
    ground: [
        { name: "Terremoto",     power: 100, accuracy: 100, type: "ground" },
        { name: "Excavar",       power: 80,  accuracy: 100, type: "ground" },
        { name: "Disparo Lodo",  power: 55,  accuracy: 95,  type: "ground" },
        { name: "Tumba Rocas",   power: 60,  accuracy: 95,  type: "ground" },
        { name: "Golpe Sísmico", power: 60,  accuracy: 100, type: "ground" },
        { name: "Fisura",        power: 80,  accuracy: 90,  type: "ground" },
    ],
    flying: [
        { name: "Vuelo",         power: 90,  accuracy: 95,       type: "flying" },
        { name: "Picotazo",      power: 35,  accuracy: 100,      type: "flying" },
        { name: "Golpe Aéreo",   power: 60,  accuracy: Infinity, type: "flying" },
        { name: "Pájaro Osado",  power: 120, accuracy: 100,      type: "flying" },
        { name: "Golpe Pico",    power: 65,  accuracy: 95,       type: "flying" },
        { name: "Torbellino",    power: 40,  accuracy: 85,       type: "flying" },
    ],
    psychic: [
        { name: "Psíquico",      power: 90,  accuracy: 100, type: "psychic" },
        { name: "Confusión",     power: 50,  accuracy: 100, type: "psychic" },
        { name: "Premonición",   power: 120, accuracy: 100, type: "psychic" },
        { name: "Cabezazo Zen",  power: 80,  accuracy: 90,  type: "psychic" },
        { name: "Psicocorte",    power: 70,  accuracy: 100, type: "psychic" },
        { name: "Psicorrayo",    power: 65,  accuracy: 100, type: "psychic" },
        { name: "Somnífero",     power: 0,   accuracy: 55,  type: "psychic", damage_class: "status" },
    ],
    bug: [
        { name: "Picadura",      power: 60,  accuracy: 100, type: "bug" },
        { name: "Zumbido",       power: 90,  accuracy: 100, type: "bug" },
        { name: "Tijera X",      power: 80,  accuracy: 100, type: "bug" },
        { name: "Cuchillada",    power: 70,  accuracy: 100, type: "bug" },
        { name: "Ataque Polvo",  power: 35,  accuracy: 100, type: "bug" },
        { name: "Megacuerno",    power: 120, accuracy: 85,  type: "bug" },
    ],
    rock: [
        { name: "Lanzarrocas",   power: 50,  accuracy: 90,  type: "rock" },
        { name: "Avalancha",     power: 75,  accuracy: 90,  type: "rock" },
        { name: "Roca Afilada",  power: 100, accuracy: 80,  type: "rock" },
        { name: "Cabezazo Roca", power: 80,  accuracy: 85,  type: "rock" },
        { name: "Pedrada",       power: 55,  accuracy: 95,  type: "rock" },
        { name: "Romperrocas",   power: 40,  accuracy: 100, type: "rock" },
    ],
    ghost: [
        { name: "Lengüetazo",    power: 30,  accuracy: 100, type: "ghost" },
        { name: "Bola Sombra",   power: 80,  accuracy: 100, type: "ghost" },
        { name: "Garra Umbría",  power: 70,  accuracy: 100, type: "ghost" },
        { name: "Tinieblas",     power: 50,  accuracy: 100, type: "ghost" },
        { name: "Mal de Ojo",    power: 65,  accuracy: 100, type: "ghost" },
        { name: "Finta Sombra",  power: 40,  accuracy: 100, type: "ghost" },
    ],
    dragon: [
        { name: "Garra Dragón",  power: 80,  accuracy: 100, type: "dragon" },
        { name: "Pulso Dragón",  power: 85,  accuracy: 100, type: "dragon" },
        { name: "Cometa Draco",  power: 130, accuracy: 90,  type: "dragon" },
        { name: "Furia Dragón",  power: 40,  accuracy: 100, type: "dragon" },
        { name: "Cola Dragón",   power: 60,  accuracy: 90,  type: "dragon" },
        { name: "Danza Dragón",  power: 0,   accuracy: 100, type: "dragon", damage_class: "status" },
    ],
    dark: [
        { name: "Mordisco",      power: 60,  accuracy: 100, type: "dark" },
        { name: "Triturar",      power: 80,  accuracy: 100, type: "dark" },
        { name: "Pulso Umbrío",  power: 80,  accuracy: 100, type: "dark" },
        { name: "Golpe Bajo",    power: 65,  accuracy: 100, type: "dark" },
        { name: "Castigo",       power: 60,  accuracy: 100, type: "dark" },
        { name: "Mofa",          power: 55,  accuracy: 100, type: "dark" },
    ],
    steel: [
        { name: "Garra Metal",      power: 50,  accuracy: 95,  type: "steel" },
        { name: "Foco Resplandor",  power: 80,  accuracy: 100, type: "steel" },
        { name: "Cabeza de Hierro", power: 80,  accuracy: 100, type: "steel" },
        { name: "Puño Meteoro",     power: 90,  accuracy: 90,  type: "steel" },
        { name: "Defensa Férrea",   power: 65,  accuracy: 100, type: "steel" },
        { name: "Acero Ala",        power: 70,  accuracy: 90,  type: "steel" },
    ],
    fairy: [
        { name: "Viento Feérico",   power: 40,  accuracy: 100, type: "fairy" },
        { name: "Brillo Mágico",    power: 80,  accuracy: 100, type: "fairy" },
        { name: "Fuerza Lunar",     power: 95,  accuracy: 100, type: "fairy" },
        { name: "Voz Cautivadora",  power: 85,  accuracy: 90,  type: "fairy" },
        { name: "Golpe Encanto",    power: 70,  accuracy: 100, type: "fairy" },
        { name: "Danza Lunar",      power: 0,   accuracy: 100, type: "fairy", damage_class: "status" },
    ],
};

export const getPokemonTypes = (pokemon) => {
    if (pokemon.types && Array.isArray(pokemon.types)) {
        if (typeof pokemon.types[0] === 'string') return pokemon.types;
        if (pokemon.types[0]?.type?.name) return pokemon.types.map(t => t.type.name);
    }
    return ['normal'];
};

export const buildMovePool = (types) => {
    let pool = [];
    types.forEach(t => { pool = [...pool, ...(MOVES_DATABASE[t] || [])]; });
    pool = [...pool, ...MOVES_DATABASE['normal']];
    return pool.filter((m, i, s) => i === s.findIndex(x => x.name === m.name));
};
