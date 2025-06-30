// src/services/pokemonService.js

// Movimientos básicos de relleno con sus tipos y categorías de daño
const fallbackMoves = [
    { name: "Placaje", power: 40, type: "normal", damage_class: { name: "physical" }, flavor_text_entries: [{ language: { name: 'es' }, flavor_text: 'Un ataque físico básico.' }] },
    { name: "Arañazo", power: 40, type: "normal", damage_class: { name: "physical" }, flavor_text_entries: [{ language: { name: 'es' }, flavor_text: 'Un ataque de garras.' }] },
    { name: "Ataque Rápido", power: 40, type: "normal", damage_class: { name: "physical" }, flavor_text_entries: [{ language: { name: 'es' }, flavor_text: 'Golpea primero.' }] },
    { name: "Gruñido", power: 0, type: "normal", damage_class: { name: "status" }, flavor_text_entries: [{ language: { name: 'es' }, flavor_text: 'Reduce el Ataque del objetivo.' }] }
];

// Función auxiliar para obtener el nombre en español si está disponible, sino formatea el nombre en inglés
const getLocalizedMoveName = (moveDetail) => {
    const nameEntry = moveDetail.names.find(name => name.language.name === 'es');
    // Asegurarse de que el nombre se formatee correctamente incluso si no hay guiones
    return nameEntry ? nameEntry.name : moveDetail.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Función principal para obtener detalles de un Pokémon incluyendo movimientos inteligentes
export const fetchPokemonDetails = async (pokemonId) => {
    try {
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
        if (!pokemonRes.ok) { // Añadir esta verificación para capturar errores de red/API
            throw new Error(`Failed to fetch Pokemon ID ${pokemonId}: ${pokemonRes.statusText}`);
        }
        const pokemonData = await pokemonRes.json();

        const stats = {};
        pokemonData.stats.forEach(s => {
            stats[s.stat.name] = s.base_stat;
        });

        // Asegurarse de que `types` es un array de strings de nombres de tipo
        const pokemonTypes = pokemonData.types.map(t => t.type.name); 

        let selectedMoves = [];

        const allPossibleMoveUrls = pokemonData.moves.map(move => move.move.url);
        // Limitar la cantidad de movimientos a inspeccionar para eficiencia, máximo 50
        const movesToInspectUrls = allPossibleMoveUrls.sort(() => 0.5 - Math.random()).slice(0, Math.min(allPossibleMoveUrls.length, 50)); 
        
        const moveDetailsPromises = movesToInspectUrls.map(url => fetch(url).then(res => res.json()));
        const fetchedMoveDetails = await Promise.all(moveDetailsPromises);

        // Filtrar movimientos por categoría de daño y si tienen poder
        const damageMoves = fetchedMoveDetails.filter(moveDetail => 
            moveDetail.power !== null && moveDetail.power > 0 && moveDetail.damage_class && moveDetail.damage_class.name !== 'status'
        );
        const statusMoves = fetchedMoveDetails.filter(moveDetail => 
            moveDetail.damage_class && moveDetail.damage_class.name === 'status'
        );

        // Clasificar movimientos de daño por STAB
        const stabDamageMoves = damageMoves.filter(move => pokemonTypes.includes(move.type.name));
        const normalDamageMoves = damageMoves.filter(move => move.type.name === 'normal');
        // Asegúrate de que move.type.name no esté ya incluido en pokemonTypes (evita duplicados si es tipo normal STAB)
        const otherDamageMoves = damageMoves.filter(move => 
            !pokemonTypes.includes(move.type.name) && move.type.name !== 'normal'
        );

        stabDamageMoves.sort((a, b) => b.power - a.power);
        normalDamageMoves.sort((a, b) => b.power - a.power);
        otherDamageMoves.sort((a, b) => b.power - a.power);
        statusMoves.sort(() => 0.5 - Math.random()); // Los movimientos de estado no tienen un 'poder' para ordenar

        const addMoveIfUnique = (moveDetail) => {
            // Asegúrate de que moveDetail, moveDetail.type y moveDetail.damage_class existen antes de acceder a .name
            if (!moveDetail || !moveDetail.type || !moveDetail.damage_class) {
                console.warn("Skipping invalid moveDetail:", moveDetail);
                return false;
            }
            const moveData = {
                name: getLocalizedMoveName(moveDetail),
                power: moveDetail.power || 0, // Asegura que power es un número, 0 si es null/undefined
                type: moveDetail.type.name,
                damage_class: moveDetail.damage_class.name,
            };
            if (!selectedMoves.some(m => m.name === moveData.name)) {
                selectedMoves.push(moveData);
                return true;
            }
            return false;
        };

        // ESTRATEGIA DE SELECCIÓN DE MOVIMIENTOS
        // Priorizar 2 movimientos STAB de daño
        let stabMovesAdded = 0;
        for (const moveDetail of stabDamageMoves) {
            if (stabMovesAdded >= 2 || selectedMoves.length >= 4) break;
            if (addMoveIfUnique(moveDetail)) {
                stabMovesAdded++;
            }
        }

        // Añadir 1 movimiento de daño normal (si hay espacio y aún no se ha añadido un STAB normal)
        let normalMoveAdded = false;
        for (const moveDetail of normalDamageMoves) {
            if (selectedMoves.length >= 4) break;
            if (addMoveIfUnique(moveDetail)) {
                normalMoveAdded = true;
                break;
            }
        }
        // Fallback para movimiento normal si no se encontró uno o no se pudo añadir
        if (!normalMoveAdded && selectedMoves.length < 4) {
            const fallbackNormal = fallbackMoves.find(m => m.type === 'normal' && m.damage_class.name !== 'status');
            if (fallbackNormal) { // No es necesario addMoveIfUnique aquí si ya verificamos si se agregó antes.
                addMoveIfUnique(fallbackNormal);
            }
        }

        // Añadir 1 movimiento de estado
        let statusMoveAdded = false;
        for (const moveDetail of statusMoves) {
            if (selectedMoves.length >= 4) break;
            if (addMoveIfUnique(moveDetail)) {
                statusMoveAdded = true;
                break;
            }
        }
        // Fallback para movimiento de estado si no se encontró uno o no se pudo añadir
        if (!statusMoveAdded && selectedMoves.length < 4) {
            const fallbackStatus = fallbackMoves.find(m => m.name === 'Gruñido' || m.damage_class.name === 'status');
            if (fallbackStatus) { // No es necesario addMoveIfUnique aquí si ya verificamos si se agregó antes.
                addMoveIfUnique(fallbackStatus);
            }
        }

        // Rellenar con otros movimientos de daño si aún no hay 4
        const combinedRemainingDamageMoves = [...otherDamageMoves].sort((a,b) => b.power - a.power);
        for (const moveDetail of combinedRemainingDamageMoves) {
            if (selectedMoves.length >= 4) break;
            addMoveIfUnique(moveDetail);
        }

        // Asegurarse de tener al menos 4 movimientos usando fallbacks si es necesario
        for (const fMove of fallbackMoves) {
            if (selectedMoves.length >= 4) break;
            addMoveIfUnique(fMove);
        }

        // Asegurarse de que solo hay 4 movimientos
        selectedMoves = selectedMoves.slice(0, 4);

        console.log(`Movimientos seleccionados para ${pokemonData.name}:`, selectedMoves);

        // Valores base para HP, Ataque y Defensa para un inicio de batalla simplificado
        const hpMultiplier = 2.5;
        const attackDefenseMultiplier = 0.5;

        // Determinar el sprite principal (official_artwork > front_default > back_default)
        const primarySprite = pokemonData.sprites.other?.['official-artwork']?.front_default ||
                             pokemonData.sprites.front_default ||
                             pokemonData.sprites.back_default ||
                             `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`; // Fallback genérico

        return {
            id: pokemonData.id,
            name: pokemonData.name,
            hp: Math.floor(stats.hp * hpMultiplier) || 100,
            maxHp: Math.floor(stats.hp * hpMultiplier) || 100, // Asegurar que maxHp se establece
            attack: Math.floor(stats.attack * attackDefenseMultiplier) || 25,
            defense: Math.floor(stats.defense * attackDefenseMultiplier) || 15,
            types: pokemonData.types, // Mantener el formato original del API para `types` para `calculateTypeEffectiveness`
            moves: selectedMoves,
            sprite: primarySprite, // Usar un solo sprite principal
            // Puedes mantener los otros sprites si son útiles para otras partes de la UI
            sprites: { // Mantener la estructura original por si la necesitas en otro lado
                official_artwork: pokemonData.sprites.other?.['official-artwork']?.front_default,
                front_default: pokemonData.sprites.front_default,
                back_default: pokemonData.sprites.back_default,
            }
        };

    } catch (error) {
        console.error(`Error fetching details for Pokemon ID ${pokemonId}:`, error);
        // Si hay un error, devuelve un Pokémon con datos de respaldo para evitar crasheos
        return {
            id: pokemonId,
            name: `Pokémon ${pokemonId} desconocido`,
            hp: 100,
            maxHp: 100, // Asegurar que maxHp se establece en el fallback
            attack: 25,
            defense: 15,
            // Importante: `types` debe ser un array de objetos con `type.name` para `calculateTypeEffectiveness`
            // o ajusta `calculateTypeEffectiveness` para recibir solo el nombre del tipo.
            // Por simplicidad, aquí lo dejo como el formato de la API { type: { name: "normal" } }
            types: [{ slot: 1, type: { name: 'normal', url: 'https://pokeapi.co/api/v2/type/1/' } }],
            moves: [
                { name: "Placaje", power: 40, type: "normal", damage_class: "physical" },
                { name: "Arañazo", power: 40, type: "normal", damage_class: "physical" },
                { name: "Ataque Rápido", power: 40, type: "normal", damage_class: "physical" },
                { name: "Gruñido", power: 0, type: "normal", damage_class: "status" }
            ], 
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png` || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
            sprites: { // Propiedad de sprites de respaldo para mantener consistencia
                official_artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
                front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
                back_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`,
            }
        };
    }
};