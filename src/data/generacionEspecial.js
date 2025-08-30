// src/data/generacionEspecial.js

export const generacionEspecial = [
  {
    // --- DATOS BÁSICOS (OBLIGATORIOS) ---
    id: 1026, // ¡Muy importante! Debe ser único y seguir el orden.
    name: "Luzoto", // El nombre de tu Pokémon
    types: ["grass"], // Los tipos. Puedes poner uno o dos. Usa los nombres en inglés de los tipos existentes o los nuevos que crearemos.

    // --- IMAGEN ---
    // La ruta a la imagen que guardaste en la carpeta public/img-special/
    imageUrl: "/img-special/1026.png",

    // --- ESTADÍSTICAS BASE (del 1 al 255) ---
    stats: {
      hp: 52,
      attack: 54,
      defense: 53,
      'special-attack': 55,
      'special-defense': 54,
      speed: 51,
    },

    // --- CARACTERÍSTICAS FÍSICAS ---
    // La altura se mide en decímetros (10 = 1 metro)
    height: 3, // Esto significa 0.5 metros
    // El peso se mide en hectogramos (10 = 1 kilogramo)
    weight: 21, // Esto significa 5.0 kg

    // --- DESCRIPCIÓN ---
    // ¡Escribe aquí la historia de tu Pokémon!
    description: "Luzoto emerge en los claros del bosque donde la luz toca la tierra por primera vez. Su hoja actúa como una antena de energía solar, y su cuerpo vibra con una frecuencia que calma a otras criaturas.",

    // --- EVOLUCIÓN (OPCIONAL) ---
    // Si sí tiene, añade un objeto por cada etapa.
    evolutionLine: [
        {
            id: 1026,
            name: "Luzoto",
            sprite: "/img-special/1026.png" // La imagen pequeña o thumbnail
        },
        {
            id: 1027,
            name: "Florynth",
            sprite: "/img-special/1027.png" // La imagen pequeña o thumbnail
        },
        {
           id: 1028,
           name: "Terravox",
           sprite: "/img-special/1028.png"
         }
    ]
  },

  // --- ¡COPIA Y PEGA DESDE AQUÍ PARA AÑADIR OTRO POKÉMON! ---
  {
    id: 1027,
    name: "Florynth",
    types: ["grass"],
    imageUrl: "/img-special/1027.png",
    stats: { hp: 100, attack: 100, defense: 100, 'special-attack': 100, 'special-defense': 100, speed: 100 },
    height: 6,
    weight: 48,
    description: "Florynth danza con el viento y canta con las flores. Su aura azul tiene propiedades curativas, y se cree que puede comunicarse con los árboles más antiguos del bosque. Su presencia transforma campos áridos en jardines vivos.",
    ability: { name: "Desconocida", description: "Información no disponible." },
    moves: [],
    evolutionLine: [
        {
            id: 1026,
            name: "Luzoto",
            sprite: "/img-special/1026.png" // La imagen pequeña o thumbnail
        },
        {
            id: 1027,
            name: "Florynth",
            sprite: "/img-special/1027.png" // La imagen pequeña o thumbnail
        },
        {
           id: 1028,
           name: "Terravox",
           sprite: "/img-special/1028.png"
        }
    ],
  },
  {
    id: 1028,
    name: "Terravox",
    types: ["grass","dark"],
    imageUrl: "/img-special/1028.png",
    stats: { hp: 100, attack: 100, defense: 100, 'special-attack': 100, 'special-defense': 100, speed: 100 },
    height: 12,
    weight: 285,
    description: "Terravox es el guardián ancestral de los bosques. Aunque su aspecto es intimidante, sus flores sonrientes revelan su dualidad: fuerza y ternura. Sus raíces pueden romper el suelo para crear nuevos caminos, y su rugido se escucha a kilómetros.",
    ability: { name: "Desconocida", description: "Información no disponible." },
    moves: [],
    evolutionLine: [
        {
            id: 1026,
            name: "Luzoto",
            sprite: "/img-special/1026.png" // La imagen pequeña o thumbnail
        },
        {
            id: 1027,
            name: "Florynth",
            sprite: "/img-special/1027.png" // La imagen pequeña o thumbnail
        },
        {
           id: 1028,
           name: "Terravox",
           sprite: "/img-special/1028.png"
        }
    ],
  },
  {
    id: 1029,
    name: "Cindrusk",
    types: ["fire","rock"],
    imageUrl: "/img-special/1029.png",
    stats: { hp: 100, attack: 100, defense: 100, 'special-attack': 100, 'special-defense': 100, speed: 100 },
    height: 4,
    weight: 92,
    description: "Cindrusk se forma en minas abandonadas donde el carbón aún conserva calor residual. Sus ojos brillan con energía latente, y sus venas incandescentes indican que está listo para encenderse en cualquier momento. Es curioso y resistente, ideal para entrenadores que buscan un compañero tenaz.",
    ability: { name: "Desconocida", description: "Información no disponible." },
    moves: [],
    evolutionLine: [
        {
            id: 1026,
            name: "Cindrusk",
            sprite: "/img-special/1029.png" // La imagen pequeña o thumbnail
        },
        {
            id: 1027,
            name: "Coalimp",
            sprite: "/img-special/1030.png" // La imagen pequeña o thumbnail
        },
        {
           id: 1028,
           name: "Grillmaged",
           sprite: "/img-special/1031.png"
        }
    ],
  },
  {
    id: 1030,
    name: "Coalimp",
    types: ["fire","rock"],
    imageUrl: "/img-special/1030.png",
    stats: { hp: 100, attack: 100, defense: 100, 'special-attack': 100, 'special-defense': 100, speed: 100 },
    height: 8,
    weight: 185,
    description: "Terravox es el guardián ancestral de los bosques. Aunque su aspecto es intimidante, sus flores sonrientes revelan su dualidad: fuerza y ternura. Sus raíces pueden romper el suelo para crear nuevos caminos, y su rugido se escucha a kilómetros.",
    ability: { name: "Desconocida", description: "Información no disponible." },
    moves: [],
    evolutionLine: [
        {
            id: 1029,
            name: "Cindrusk",
            sprite: "/img-special/1029.png" // La imagen pequeña o thumbnail
        },
        {
            id: 1030,
            name: "Coalimp",
            sprite: "/img-special/1030.png" // La imagen pequeña o thumbnail
        },
        {
           id: 1031,
           name: "Grillmaged",
           sprite: "/img-special/1031.png"
        }
    ],
  },
  {
    id: 1031,
    name: "Grillmaged",
    types: ["fire","dragon"],
    imageUrl: "/img-special/1031.png",
    stats: { hp: 100, attack: 100, defense: 100, 'special-attack': 100, 'special-defense': 100, speed: 100 },
    height: 13,
    weight: 720,
    description: "Grillmaged es la forma final, una criatura que ha fusionado el calor del carbón con la estructura metálica de una parrilla viva. Sus ojos brillan como brasas, y su interior puede alcanzar temperaturas capaces de fundir rocas. Es temido por su rugido humeante y respetado por su poder.",
    ability: { name: "Desconocida", description: "Información no disponible." },
    moves: [],
    evolutionLine: [
        {
            id: 1029,
            name: "Cindrusk",
            sprite: "/img-special/1029.png" // La imagen pequeña o thumbnail
        },
        {
            id: 1030,
            name: "Coalimp",
            sprite: "/img-special/1030.png" // La imagen pequeña o thumbnail
        },
        {
           id: 1031,
           name: "Grillmaged",
           sprite: "/img-special/1031.png"
        }
    ],
  },
  // --- FIN DEL ESPACIO PARA COPIAR Y PEGAR ---
];