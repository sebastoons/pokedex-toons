// src/services/pokemonService.js
import { generacionEspecial } from '../data/generacionEspecial';
// Importamos el generador automático que ya habíamos creado
import { getAutomaticMoves } from '../utils/specialGenerationUtils';

const fallbackMoves = [
    { name: "Placaje", power: 40, type: "normal", damage_class: "physical" },
    { name: "Arañazo", power: 40, type: "normal", damage_class: "physical" },
    { name: "Ataque Rápido", power: 40, type: "normal", damage_class: "physical" },
    { name: "Gruñido", power: 0, type: "normal", damage_class: "status" }
];

const getLocalizedMoveName = (moveDetail) => {
    const nameEntry = moveDetail.names.find(name => name.language.name === 'es');
    return nameEntry ? nameEntry.name : moveDetail.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const fetchPokemonDetails = async (pokemonId) => {
    try {
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
        if (!pokemonRes.ok) {
            throw new Error(`Failed to fetch Pokemon ID ${pokemonId}`);
        }
        const pokemonData = await pokemonRes.json();

        const stats = {};
        pokemonData.stats.forEach(s => {
            stats[s.stat.name] = s.base_stat;
        });

        const pokemonTypes = pokemonData.types.map(t => t.type.name);
        let selectedMoves = [];
        
        if (pokemonData.moves.length > 0) {
            const allMoveUrls = pokemonData.moves.map(move => move.move.url);
            const movesToInspectUrls = allMoveUrls.sort(() => 0.5 - Math.random()).slice(0, 50);
            
            const moveDetailsPromises = movesToInspectUrls.map(url => fetch(url).then(res => res.json()));
            const fetchedMoveDetails = await Promise.all(moveDetailsPromises);

            const damageMoves = fetchedMoveDetails.filter(move => move.power > 0 && move.damage_class?.name !== 'status');
            const statusMoves = fetchedMoveDetails.filter(move => move.damage_class?.name === 'status');
            
            const stabDamageMoves = damageMoves.filter(move => pokemonTypes.includes(move.type.name)).sort((a, b) => b.power - a.power);
            const otherDamageMoves = damageMoves.filter(move => !pokemonTypes.includes(move.type.name)).sort((a, b) => b.power - a.power);

            const addMoveIfUnique = (move) => {
                if (move && !selectedMoves.some(m => m.name === move.name)) {
                    selectedMoves.push(move);
                }
            };
            
            stabDamageMoves.slice(0, 2).forEach(moveDetail => addMoveIfUnique({
                name: getLocalizedMoveName(moveDetail),
                power: moveDetail.power || 0,
                type: moveDetail.type.name,
                damage_class: moveDetail.damage_class.name,
            }));

            statusMoves.slice(0, 1).forEach(moveDetail => addMoveIfUnique({
                name: getLocalizedMoveName(moveDetail),
                power: moveDetail.power || 0,
                type: moveDetail.type.name,
                damage_class: moveDetail.damage_class.name,
            }));

            otherDamageMoves.forEach(moveDetail => {
                if (selectedMoves.length < 4) {
                    addMoveIfUnique({
                        name: getLocalizedMoveName(moveDetail),
                        power: moveDetail.power || 0,
                        type: moveDetail.type.name,
                        damage_class: moveDetail.damage_class.name,
                    });
                }
            });
        }

        while (selectedMoves.length < 4) {
            const fallbackMove = fallbackMoves.find(m => !selectedMoves.some(sm => sm.name === m.name));
            if(fallbackMove) selectedMoves.push(fallbackMove);
            else break; // Evita bucle infinito si todos los fallbacks ya están
        }

        const primarySprite = pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default;

        return {
            id: pokemonData.id,
            name: pokemonData.name,
            hp: Math.floor(stats.hp * 2.5),
            maxHp: Math.floor(stats.hp * 2.5),
            attack: Math.floor(stats.attack * 0.5),
            defense: Math.floor(stats.defense * 0.5),
            types: pokemonData.types,
            moves: selectedMoves.slice(0, 4),
            sprites: {
                front_default: primarySprite,
                back_default: pokemonData.sprites.back_default || primarySprite
            }
        };

    } catch (error) {
        console.error(`Error fetching details for Pokemon ID ${pokemonId}:`, error);
        return {
            id: pokemonId, name: `Pokémon ${pokemonId}`, hp: 100, maxHp: 100,
            attack: 25, defense: 15,
            types: [{ type: { name: 'normal' } }],
            moves: fallbackMoves,
            sprites: { front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png` }
        };
    }
};

export const fetchPokemonDetailsByIds = async (ids) => {
    const teamDetailsPromises = ids.map(id => {
        if (id > 1025) {
            const specialPokemon = generacionEspecial.find(p => p.id === id);
            if (!specialPokemon) return null;

            // --- LÓGICA DE AUTOMATIZACIÓN ---
            // Si el Pokémon especial tiene una lista de movimientos vacía, la generamos.
            let finalMoves = specialPokemon.moves;
            if (!finalMoves || finalMoves.length === 0) {
                finalMoves = getAutomaticMoves(specialPokemon.types);
            }
            // --- FIN DE LA LÓGICA ---

            return Promise.resolve({
                id: specialPokemon.id,
                name: specialPokemon.name,
                hp: Math.floor(specialPokemon.stats.hp * 2.5),
                maxHp: Math.floor(specialPokemon.stats.hp * 2.5),
                attack: Math.floor(specialPokemon.stats.attack * 0.5),
                defense: Math.floor(specialPokemon.stats.defense * 0.5),
                types: specialPokemon.types.map(t => ({ type: { name: t } })),
                moves: finalMoves, // Usamos la lista de movimientos final
                sprites: {
                    front_default: specialPokemon.imageUrl,
                    back_default: specialPokemon.imageUrl // Puedes crear un sprite de espaldas y poner la ruta aquí
                }
            });
        } else {
            return fetchPokemonDetails(id);
        }
    });

    const resolvedTeam = await Promise.all(teamDetailsPromises);
    return resolvedTeam.filter(Boolean);
};