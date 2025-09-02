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
                    {id: 1033,name: "Botterror",sprite: "/img-special/1033.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
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
  {
    id: 1040,
    name: "Ralentín",
    types: ["fire"],
    imageUrl: "/img-special/1040.png",
    stats: { hp: 45, attack: 40, defense: 50, 'special-attack': 60, 'special-defense': 55, speed: 45 },
    height: 5,
    weight: 62,
    description: "Ralentín es un Pokémon hogareño que emite calor suave y reconfortante. Su cuerpo metálico brilla cuando está feliz, y suele acompañar a entrenadores en regiones frías. Aunque pequeño, puede elevar la temperatura de una habitación en segundos..",
    evolutionLine: [{id: 1040, name: "Ralentín", sprite: "/img-special/1040.png"},
                    {id: 1041,name: "Termobraze",sprite: "/img-special/1041.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1042,name: "Furnaztor",sprite: "/img-special/1042.png",details:{trigger:{name:'level-up'}, min_level: 36 }}
    ],
  },
  {
    id: 1041,
    name: "Termobraze",
    types: ["fire"],
    imageUrl: "/img-special/1041.png",
    stats: { hp: 65, attack: 70, defense: 75, 'special-attack': 80, 'special-defense': 70, speed: 55 },
    height: 9,
    weight: 184,
    description: "Termobraze ha desarrollado un sistema interno de calor más potente. Sus perillas frontales controlan la intensidad de sus ataques, y su sonrisa cálida puede engañar a rivales desprevenidos. Es común verlo en fábricas abandonadas, absorbiendo energía térmica.",
    evolutionLine: [{id: 1040, name: "Ralentín", sprite: "/img-special/1040.png"},
                    {id: 1041,name: "Termobraze",sprite: "/img-special/1041.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1042,name: "Furnaztor",sprite: "/img-special/1042.png",details:{trigger:{name:'level-up'}, min_level: 36 }}
    ],
  },
  {
    id: 1042,
    name: "Furnaztor",
    types: ["fire","dark"],
    imageUrl: "/img-special/1042.png",
    stats: { hp: 90, attack: 110, defense: 85, 'special-attack': 95, 'special-defense': 80, speed: 70 },
    height: 15,
    weight: 520,
    description: "Furnaztor es la forma final, una estufa viviente alimentada por gas comprimido. Sus ojos rojos y boca ardiente reflejan su temperamento explosivo. Puede generar llamaradas capaces de fundir acero, y su presencia suele provocar apagones en zonas urbanas.",
    evolutionLine: [{id: 1040, name: "Ralentín", sprite: "/img-special/1040.png"},
                    {id: 1041,name: "Termobraze",sprite: "/img-special/1041.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1042,name: "Furnaztor",sprite: "/img-special/1042.png",details:{trigger:{name:'level-up'}, min_level: 36 }}
    ],
  },
  {
    id: 1043,
    name: "Cachupin",
    types: ["normal"],
    imageUrl: "/img-special/1043.png",
    stats: { hp: 60, attack: 55, defense: 50, 'special-attack': 40, 'special-defense': 45, speed: 50 },
    height: 6,
    weight: 84,
    description: "Cachupin es un Pokémon leal que aparece cerca de personas heridas o tristes. Las curitas que lleva no solo decoran su cuerpo, sino que también tienen propiedades curativas. Se le considera un símbolo de consuelo en hospitales Pokémon y escuelas.",
    evolutionLine: [{id: 1043, name: "Cachupin", sprite: "/img-special/1043.png"}
    ],
  },
  {
    id: 1044,
    name: "Turpad",
    types: ["poison"],
    imageUrl: "/img-special/1044.png",
    stats: { hp: 40, attack: 45, defense: 45, 'special-attack': 65, 'special-defense': 55, speed: 40 },
    height: 4,
    weight: 80,
    description: "Turpad emite un hedor nauseabundo allá donde va. A menudo aparece en alcantarillas, buscando restos de alimentos en descomposición. Su cuerpo está compuesto por materia orgánica altamente tóxica, y su sonrisa encantadora es solo una distracción para sus ataques corrosivos.",
    evolutionLine: [{id: 1044, name: "Turpad", sprite: "/img-special/1044.png"},
                    {id: 1045,name: "Menox",sprite: "/img-special/1045.png",details:{trigger:{name:'level-up'}, min_level: 20 }}
    ],
  },
  {
    id: 1045,
    name: "Menox",
    types: ["poison","fighting"],
    imageUrl: "/img-special/1045.png",
    stats: { hp: 70, attack: 90, defense: 70, 'special-attack': 55, 'special-defense': 70, speed: 70 },
    height: 9,
    weight: 247,
    description: "Menox adquirió extremidades potentes al fortalecer la materia tóxica de su cuerpo. Cuando se enfurece, retará a cualquier combatiente que esté en los alrededores. Su aura venenosa puede debilitar al rival antes de que el primer golpe conecte.",
    evolutionLine: [{id: 1044, name: "Turpad", sprite: "/img-special/1044.png"},
                    {id: 1045,name: "Menox",sprite: "/img-special/1045.png",details:{trigger:{name:'level-up'}, min_level: 20 }}
    ],
  },
  {
    id: 1046,
    name: "Octiblu",
    types: ["water"],
    imageUrl: "/img-special/1046.png",
    stats: { hp: 55, attack: 45, defense: 50, 'special-attack': 65, 'special-defense': 55, speed: 50 },
    height: 5,
    weight: 72,
    description: "Octiblu es un Pokémon juguetón que habita en aguas poco profundas. Su cuerpo emite una suave luz azul que calma a quienes lo rodean. Es conocido por formar burbujas con propiedades relajantes, y suele acompañar a entrenadores jóvenes por su naturaleza amigable.",
    evolutionLine: [{id: 1046, name: "Octiblu", sprite: "/img-special/1046.png"},
                    {id: 1047,name: "Krakenox",sprite: "/img-special/1047.png",details:{trigger:{name:'level-up'}, min_level: 20 }}
    ],
  },
  {
    id: 1047,
    name: "Krakenox",
    types: ["water","poison"],
    imageUrl: "/img-special/1047.png",
    stats: { hp: 80, attack: 70, defense: 75, 'special-attack': 100, 'special-defense': 85, speed: 70 },
    height: 13,
    weight: 380,
    description: "Krakenox emerge de las profundidades cuando detecta actividad mental intensa. Sus tentáculos están recubiertos de ventosas que amplifican sus poderes psíquicos. Aunque su mirada es intimidante, solo ataca si se siente amenazado. Se dice que puede manipular corrientes marinas con su mente.",
    evolutionLine: [{id: 1046, name: "Octiblu", sprite: "/img-special/1046.png"},
                    {id: 1047,name: "Krakenox",sprite: "/img-special/1047.png",details:{trigger:{name:'level-up'}, min_level: 20 }}
    ],
  },
  {
    id: 1048,
    name: "Lumibolt",
    types: ["electric"],
    imageUrl: "/img-special/1048.png",
    stats: { hp: 50, attack: 65, defense: 50, 'special-attack': 70, 'special-defense': 50, speed: 75 },
    height: 6,
    weight: 98,
    description: "Lumibolt es un Pokémon que transforma energía eléctrica en fuerza física. Su cuerpo de vidrio vibra cuando está cargado, y sus brazos de cable pueden extenderse para atacar a distancia. Se le encuentra cerca de generadores y torres de alta tensión, donde absorbe energía para mantenerse activo.",
    evolutionLine: [{id: 1048, name: "Lumibolt", sprite: "/img-special/1048.png"}
    ],
  },
  {
    id: 1049,
    name: "Flambibi",
    types: ["fire"],
    imageUrl: "/img-special/1049.png",
    stats: { hp: 45, attack: 40, defense: 35, 'special-attack': 60, 'special-defense': 55, speed: 65 },
    height: 4,
    weight: 32,
    description: "Flambibi es una chispa viviente que aparece en zonas cálidas durante el atardecer. Su cuerpo flameante no quema al tacto, y su sonrisa constante lo convierte en un compañero ideal para entrenadores novatos. Se alimenta de emociones alegres.",
    evolutionLine: [{id: 1049, name: "Flambibi", sprite: "/img-special/1049.png"},
                    {id: 1050,name: "Pyrogeist",sprite: "/img-special/1050.png",details:{trigger:{name:'level-up'}, min_level: 16 }},
                    {id: 1051,name: "Magmaraid",sprite: "/img-special/1051.png",details:{trigger:{name:'level-up'}, min_level: 36 }}
    ],
  },
  {
    id: 1050,
    name: "Pyrogeist",
    types: ["fire"],
    imageUrl: "/img-special/1050.png",
    stats: { hp: 65, attack: 70, defense: 60, 'special-attack': 85, 'special-defense': 70, speed: 80 },
    height: 9,
    weight: 125,
    description: "Pyrogeist es la forma evolucionada de Flambibi, una entidad ígnea que toma forma humanoide. Sus llamas cambian de color según su estado emocional, y puede atravesar objetos sólidos dejando marcas de quemadura. Se le asocia con leyendas de espíritus guardianes del fuego.",
    evolutionLine: [{id: 1049, name: "Flambibi", sprite: "/img-special/1049.png"},
                    {id: 1050,name: "Pyrogeist",sprite: "/img-special/1050.png",details:{trigger:{name:'level-up'}, min_level: 18 }},
                    {id: 1051,name: "Magmaraid",sprite: "/img-special/1051.png",details:{trigger:{name:'use-item'}, item: 'fire-stone' }}
    ],
  },
  {
    id: 1051,
    name: "Magmaraid",
    types: ["fire","rock"],
    imageUrl: "/img-special/1051.png",
    stats: { hp: 95, attack: 110, defense: 100, 'special-attack': 90, 'special-defense': 85, speed: 70 },
    height: 16,
    weight: 850,
    description: "Furnaztor es la forma final, una estufa viviente alimentada por gas comprimido. Sus ojos rojos y boca ardiente reflejan su temperamento explosivo. Puede generar llamaradas capaces de fundir acero, y su presencia suele provocar apagones en zonas urbanas.",
    evolutionLine: [{id: 1049, name: "Flambibi", sprite: "/img-special/1049.png"},
                    {id: 1050,name: "Pyrogeist",sprite: "/img-special/1050.png",details:{trigger:{name:'level-up'}, min_level: 18 }},
                    {id: 1051,name: "Magmaraid",sprite: "/img-special/1051.png",details:{trigger:{name:'item-up'}, item: 'fire-stone' }}
    ],
  },
  {
    id: 1052,
    name: "Fluffelle",
    types: ["fairy"],
    imageUrl: "/img-special/1052.png",
    stats: { hp: 75, attack: 50, defense: 60, 'special-attack': 85, 'special-defense': 80, speed: 70 },
    height: 7,
    weight: 108,
    description: "Fluffelle es un Pokémon que detecta el estado emocional de quienes lo rodean. Sus cintas flotantes emiten pulsos que calman la ansiedad y fortalecen lazos afectivos. Se le encuentra en parques tranquilos y jardines floridos, donde su presencia mejora el ánimo de todos los seres vivos.",
    evolutionLine: [{id: 1052, name: "Fluffelle", sprite: "/img-special/1052.png"}
    ],
  },
  // --- FIN DEL ESPACIO PARA COPIAR Y PEGAR ---
];