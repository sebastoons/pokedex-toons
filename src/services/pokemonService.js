// src/services/pokemonService.js
import { generacionEspecial } from '../data/generacionEspecial';
import { generateMovesByTypes, improvePokemonMoves } from '../utils/moveGenerationUtils';

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
        
        const generatedMoves = generateMovesByTypes(pokemonTypes, stats);
        
        let finalMoves = generatedMoves;
        
        if (pokemonData.moves.length > 0) {
            try {
                const allMoveUrls = pokemonData.moves.map(move => move.move.url);
                const movesToInspectUrls = allMoveUrls.sort(() => 0.5 - Math.random()).slice(0, 20);
                
                const moveDetailsPromises = movesToInspectUrls.map(url => 
                    fetch(url).then(res => res.json()).catch(() => null)
                );
                const fetchedMoveDetails = (await Promise.all(moveDetailsPromises)).filter(Boolean);

                if (fetchedMoveDetails.length > 0) {
                    const apiMoves = fetchedMoveDetails.map(moveDetail => ({
                        name: getLocalizedMoveName(moveDetail),
                        power: moveDetail.power || 0,
                        type: moveDetail.type.name,
                        damage_class: moveDetail.damage_class.name,
                    }));

                    const tempPokemon = {
                        types: pokemonTypes,
                        moves: apiMoves,
                        stats: stats
                    };

                    finalMoves = improvePokemonMoves(tempPokemon);
                }
            } catch (apiError) {
                console.log(`Error fetching API moves for ${pokemonId}, using generated moves:`, apiError);
            }
        }

        while (finalMoves.length < 4) {
            const fallbackMove = fallbackMoves.find(m => !finalMoves.some(fm => fm.name === m.name));
            if (fallbackMove) {
                finalMoves.push(fallbackMove);
            } else {
                break;
            }
        }

        const primarySprite = pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default;

        return {
            id: pokemonData.id,
            name: pokemonData.name,
            hp: Math.floor(stats.hp * 2.5),
            maxHp: Math.floor(stats.hp * 2.5),
            attack: Math.floor(stats.attack * 0.5),
            defense: Math.floor(stats.defense * 0.5),
            stats: stats,
            types: pokemonData.types,
            moves: finalMoves.slice(0, 4),
            sprites: {
                front_default: primarySprite,
                back_default: pokemonData.sprites.back_default || primarySprite
            }
        };

    } catch (error) {
        console.error(`Error fetching details for Pokemon ID ${pokemonId}:`, error);
        
        // **CORRECCIÓN**: Usar una variable 'let' en lugar de reasignar una 'const'.
        let movesForFallback = [...fallbackMoves]; 
        
        const basicTypes = getPokemonBasicTypes(pokemonId);
        if (basicTypes.length > 0) {
            // **CORRECCIÓN**: Asignar a la nueva variable.
            movesForFallback = generateMovesByTypes(basicTypes);
        }
        
        return {
            id: pokemonId, 
            name: `Pokémon ${pokemonId}`, 
            hp: 100, 
            maxHp: 100,
            attack: 25, 
            defense: 15,
            stats: { hp: 40, attack: 50, defense: 30, 'special-attack': 40, 'special-defense': 30, speed: 40 },
            types: basicTypes.map(type => ({ type: { name: type } })),
            moves: movesForFallback,
            sprites: { 
                front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png` 
            }
        };
    }
};

const getPokemonBasicTypes = (pokemonId) => {
    if (pokemonId >= 1 && pokemonId <= 3) return ['grass', 'poison'];
    if (pokemonId >= 4 && pokemonId <= 6) return ['fire'];
    if (pokemonId >= 7 && pokemonId <= 9) return ['water'];
    if (pokemonId >= 25 && pokemonId <= 26) return ['electric'];
    if (pokemonId >= 144 && pokemonId <= 146) return ['ice', 'flying'];
    
    return ['normal'];
};

export const fetchPokemonDetailsByIds = async (ids) => {
    const teamDetailsPromises = ids.map(id => {
        if (id > 1025) {
            const specialPokemon = generacionEspecial.find(p => p.id === id);
            if (!specialPokemon) return null;

            let finalMoves = specialPokemon.moves;
            
            if (!finalMoves || finalMoves.length === 0) {
                finalMoves = generateMovesByTypes(specialPokemon.types, specialPokemon.stats);
            } else {
                const tempPokemon = {
                    types: specialPokemon.types,
                    moves: finalMoves,
                    stats: specialPokemon.stats
                };
                finalMoves = improvePokemonMoves(tempPokemon);
            }

            return Promise.resolve({
                id: specialPokemon.id,
                name: specialPokemon.name,
                hp: Math.floor(specialPokemon.stats.hp * 2.5),
                maxHp: Math.floor(specialPokemon.stats.hp * 2.5),
                attack: Math.floor(specialPokemon.stats.attack * 0.5),
                defense: Math.floor(specialPokemon.stats.defense * 0.5),
                stats: specialPokemon.stats,
                types: specialPokemon.types.map(t => ({ type: { name: t } })),
                moves: finalMoves,
                sprites: {
                    front_default: specialPokemon.imageUrl,
                    back_default: specialPokemon.imageUrl
                }
            });
        } else {
            return fetchPokemonDetails(id);
        }
    });

    const resolvedTeam = await Promise.all(teamDetailsPromises);
    return resolvedTeam.filter(Boolean);
};