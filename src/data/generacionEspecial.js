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
      hp: 45,
      attack: 50,
      defense: 45,
      'special-attack': 55,
      'special-defense': 50,
      speed: 50,
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
    evolutionLine: [{id: 1026, name: "Luzoto", sprite: "/img-special/1026.png"},
                    {id: 1027,  name: "Florynth", sprite: "/img-special/1027.png",details:{trigger:{name:'level-up'}, // Método: 'level-up', 'use-item', 'trade'
                                                                                                   min_level: 18 }}, //item: { name: 'thunder-stone' } // Nombre del objeto en inglés
                    { id: 1028,  name: "Terravox", sprite: "/img-special/1028.png",details:{trigger:{name:'level-up'}, min_level: 32 }}
    ]
  },
  {
    id: 1027,
    name: "Florynth",
    types: ["grass"],
    imageUrl: "/img-special/1027.png",
    stats: { hp: 65, attack: 70, defense: 65, 'special-attack': 75, 'special-defense': 70, speed: 65 },
    height: 6,
    weight: 48,
    description: "Florynth danza con el viento y canta con las flores. Su aura azul tiene propiedades curativas, y se cree que puede comunicarse con los árboles más antiguos del bosque. Su presencia transforma campos áridos en jardines vivos.",
    evolutionDetails: {level: 16, to: "Florynth", method: "level-up"},
    evolutionLine: [{id: 1026, name: "Luzoto", sprite: "/img-special/1026.png"},
                    {id: 1027, name: "Florynth", sprite: "/img-special/1027.png",details:{trigger:{name:'level-up'}, min_level: 18 }},
                    {id: 1028, name: "Terravox", sprite: "/img-special/1028.png",details:{trigger:{name:'level-up'}, min_level: 32 }}
    ],
  },
  {
    id: 1028,
    name: "Terravox",
    types: ["grass","dark"],
    imageUrl: "/img-special/1028.png",
    stats: { hp: 95, attack: 105, defense: 95, 'special-attack': 95, 'special-defense': 90, speed: 85 },
    height: 12,
    weight: 285,
    description: "Terravox es el guardián ancestral de los bosques. Aunque su aspecto es intimidante, sus flores sonrientes revelan su dualidad: fuerza y ternura. Sus raíces pueden romper el suelo para crear nuevos caminos, y su rugido se escucha a kilómetros.",
    evolutionLine: [{id: 1026, name: "Luzoto", sprite: "/img-special/1026.png"},
                    {id: 1027, name: "Florynth", sprite: "/img-special/1027.png",details:{trigger:{name:'level-up'}, min_level: 18 }},
                    {id: 1028, name: "Terravox", sprite: "/img-special/1028.png",details:{trigger:{name:'level-up'}, min_level: 32 }}
    ],
  },
  {
    id: 1029,
    name: "Cindrusk",
    types: ["fire","rock"],
    imageUrl: "/img-special/1029.png",
    stats: { hp: 45, attack: 55, defense: 50, 'special-attack': 35, 'special-defense': 40, speed: 30 },
    height: 4,
    weight: 92,
    description: "Cindrusk se forma en minas abandonadas donde el carbón aún conserva calor residual. Sus ojos brillan con energía latente, y sus venas incandescentes indican que está listo para encenderse en cualquier momento. Es curioso y resistente, ideal para entrenadores que buscan un compañero tenaz.",
    evolutionLine: [{id: 1029, name: "Cindrusk", sprite: "/img-special/1029.png"},
                    {id: 1030, name: "Coalimp",sprite: "/img-special/1030.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1031, name: "Grillmaged", sprite: "/img-special/1031.png",details:{trigger:{name:'level-up'}, min_level: 34 }}
    ],
  },
  {
    id: 1030,
    name: "Coalimp",
    types: ["fire","rock"],
    imageUrl: "/img-special/1030.png",
    stats: { hp: 65, attack: 75, defense: 70, 'special-attack': 50, 'special-defense': 55, speed: 45 },
    height: 8,
    weight: 185,
    description: "Terravox es el guardián ancestral de los bosques. Aunque su aspecto es intimidante, sus flores sonrientes revelan su dualidad: fuerza y ternura. Sus raíces pueden romper el suelo para crear nuevos caminos, y su rugido se escucha a kilómetros.",
    evolutionLine: [{id: 1029, name: "Cindrusk", sprite: "/img-special/1029.png"},
                    {id: 1030, name: "Coalimp", sprite: "/img-special/1030.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1031, name: "Grillmaged", sprite: "/img-special/1031.png",details:{trigger:{name:'level-up'}, min_level: 34 }}
    ],
  },
  {
    id: 1031,
    name: "Grillmaged",
    types: ["fire","dragon"],
    imageUrl: "/img-special/1031.png",
    stats: { hp: 90, attack: 110, defense: 95, 'special-attack': 70, 'special-defense': 80, speed: 60 },
    height: 13,
    weight: 720,
    description: "Grillmaged es la forma final, una criatura que ha fusionado el calor del carbón con la estructura metálica de una parrilla viva. Sus ojos brillan como brasas, y su interior puede alcanzar temperaturas capaces de fundir rocas. Es temido por su rugido humeante y respetado por su poder.",
    evolutionLine: [{id: 1029, name: "Cindrusk", sprite: "/img-special/1029.png"},
                    {id: 1030,name: "Coalimp",sprite: "/img-special/1030.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1031, name: "Grillmaged", sprite: "/img-special/1031.png",details:{trigger:{name:'level-up'}, min_level: 34 }}
    ],
  },
  {
    id: 1032,
    name: "Aquibebe",
    types: ["water"],
    imageUrl: "/img-special/1032.png",
    stats: { hp: 40, attack: 30, defense: 35, 'special-attack': 50, 'special-defense': 45, speed: 60 },
    height: 3,
    weight: 12,
    description: "Aquibebe es un Pokémon alegre que vive en fuentes cristalinas. Su cuerpo es un vaso encantado que contiene agua pura con propiedades curativas. Se le ve saltando entre charcos y burbujeando cuando está feliz.",
    evolutionLine: [{id: 1032, name: "Aquibebe", sprite: "/img-special/1032.png"},
                    {id: 1030,name: "Botterror",sprite: "/img-special/1033.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1034, name: "Grillmaged", sprite: "/img-special/1034.png",details:{trigger:{name:'level-up'}, min_level: 32 }}
    ],
  },
  {
    id: 1033,
    name: "Botterror",
    types: ["water"],
    imageUrl: "/img-special/1033.png",
    stats: { hp: 65, attack: 70, defense: 60, 'special-attack': 55, 'special-defense': 60, speed: 65 },
    height: 7,
    weight: 65,
    description: "Botterror es la evolución de Aquibebe, endurecido por los desafíos del mundo exterior. Su cuerpo de botella presurizada le permite lanzar chorros de agua a alta velocidad. Su actitud firme lo convierte en un defensor nato de los ríos.",
    evolutionLine: [{id: 1032, name: "Aquibebe", sprite: "/img-special/1032.png"},
                    {id: 1033,name: "Botterror",sprite: "/img-special/1033.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1034, name: "Grillmaged", sprite: "/img-special/1034.png",details:{trigger:{name:'level-up'}, min_level: 32 }}
    ],
  },
  {
    id: 1034,
    name: "Juggerflow",
    types: ["water"],
    imageUrl: "/img-special/1034.png",
    stats: { hp: 95, attack: 100, defense: 90, 'special-attack': 70, 'special-defense': 85, speed: 55 },
    height: 14,
    weight: 480,
    description: "Juggerflow es la forma final, un Pokémon bidón que contiene una reserva de agua tan poderosa que puede inundar campos enteros. Su cuerpo plástico rígido lo hace resistente a impactos, y su mirada desafiante intimida incluso a los más valientes.",
    evolutionLine: [{id: 1032, name: "Aquibebe", sprite: "/img-special/1032.png"},
                    {id: 1033,name: "Botterror",sprite: "/img-special/1033.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1034, name: "Grillmaged", sprite: "/img-special/1034.png",details:{trigger:{name:'level-up'}, min_level: 32 }}
    ],
  },
  {
    id: 1035,
    name: "Frigupin",
    types: ["ice"],
    imageUrl: "/img-special/1035.png",
    stats: { hp: 45, attack: 35, defense: 40, 'special-attack': 55, 'special-defense': 50, speed: 60 },
    height: 4,
    weight: 23,
    description: "Frigupin es un Pokémon helado que se forma en climas fríos y festivos. Su cuerpo de paleta congelada lo mantiene fresco incluso en verano. Siempre sonriente, se derrite lentamente si se emociona demasiado.",
    evolutionLine: [{id: 1035, name: "Frigupin", sprite: "/img-special/1035.png"},
                    {id: 1036,name: "Glaztorm",sprite: "/img-special/1036.png",details:{trigger:{name:'level-up'}, min_level: 20 }}
    ],
  },
  {
    id: 1036,
    name: "Glaztorm",
    types: ["ice"],
    imageUrl: "/img-special/1036.png",
    stats: { hp: 65, attack: 80, defense: 60, 'special-attack': 65, 'special-defense': 60, speed: 70 },
    height: 7,
    weight: 68,
    description: "Glaztorm es la evolución de Frigupin, endurecido por el frío y la furia. Su cobertura de glaseado le da una defensa extra, y sus burbujas rosadas indican que está cargado de energía. Aunque parece dulce, su temperamento es explosivo.",
    evolutionLine: [{id: 1035, name: "Frigupin", sprite: "/img-special/1035.png"},
                    {id: 1036,name: "Glaztorm",sprite: "/img-special/1036.png",details:{trigger:{name:'level-up'}, min_level: 20 }}
    ],
  },
  {
    id: 1037,
    name: "Tamboll",
    types: ["normal"],
    imageUrl: "/img-special/1037.png",
    stats: { hp: 45, attack: 70, defense: 55, 'special-attack': 40, 'special-defense': 35, speed: 45 },
    height: 8,
    weight: 103,
    description: "Tamboll tiene un ritmo contagioso que anima a cualquier grupo. Cuando empieza a golpear sus baquetas, Pokémon cercanos se sincronizan con su energía. Se le encuentra en festivales y celebraciones rurales.",
    evolutionLine: [{id: 1037, name: "Tamboll", sprite: "/img-special/1037.png"}
    ],
  },
  {
    id: 1038,
    name: "Mosskreep",
    types: ["grass","psychic"],
    imageUrl: "/img-special/1038.png",
    stats: { hp: 55, attack: 45, defense: 60, 'special-attack': 70, 'special-defense': 65, speed: 50 },
    height: 9,
    weight: 145,
    description: "Mosskreep habita en bosques densos y silenciosos. Su cuerpo cubierto de musgo le permite camuflarse entre los árboles, mientras que sus poderes psíquicos le permiten comunicarse con la flora cercana. Se dice que puede alterar el estado emocional de quienes lo miran fijamente.",
    evolutionLine: [{id: 1038, name: "Mosskreep", sprite: "/img-special/1038.png"},
                    {id: 1039,name: "Creebell",sprite: "/img-special/1039.png",details:{trigger:{name:'level-up'}, min_level: 25 }}
    ],
  },
  {
    id: 1039,
    name: "Creebell",
    types: ["grass","psychic"],
    imageUrl: "/img-special/1039.png",
    stats: { hp: 90, attack: 65, defense: 85, 'special-attack': 105, 'special-defense': 90, speed: 70 },
    height: 15,
    weight: 480,
    description: "Voltagon es la manifestación de la conciencia vegetal. Su cuerpo emite pulsos mentales que pueden alterar el clima local. Se le considera un guardián de los bosques antiguos, y su presencia puede provocar visiones en quienes se acercan demasiado.",
    evolutionLine: [{id: 1038, name: "Mosskreep", sprite: "/img-special/1038.png"},
                    {id: 1039,name: "Creebell",sprite: "/img-special/1039.png",details:{trigger:{name:'level-up'}, min_level: 25 }}
    ],
  },
  // --- FIN DEL ESPACIO PARA COPIAR Y PEGAR ---
];