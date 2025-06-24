// src/components/PokemonBattleArena.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { calculateTypeEffectiveness, getTypeInfo } from '../utils/typeEffectiveness'; 
import './PokemonBattleArena.css'; 

// --- Función auxiliar para obtener estadísticas, movimientos detallados y official artwork de la PokeAPI ---
const fetchPokemonDetails = async (pokemonId) => {
    try {
        // 1. Obtener datos base del Pokémon
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
        const pokemonData = await pokemonRes.json();

        // Extraer estadísticas base (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed)
        const stats = {};
        pokemonData.stats.forEach(s => {
            stats[s.stat.name] = s.base_stat;
        });

        // Extraer tipos
        const types = pokemonData.types.map(t => t.type.name);

        // --- LÓGICA DE SELECCIÓN DE MOVIMIENTOS GENÉRICA Y MEJORADA ---

        let selectedMoves = [];
        
        // Movimientos básicos de relleno para asegurar 4 opciones
        const fallbackMoves = [
            { name: "Placaje", power: 40, type: "normal" },
            { name: "Arañazo", power: 40, type: "normal" },
            { name: "Ataque Rápido", power: 40, type: "normal" },
            { name: "Gruñido", power: 0, type: "normal" } // Un movimiento de estado de baja prioridad
        ];

        // Obtener todos los movimientos que el Pokémon puede aprender en la primera generación
        const allPossibleMoveUrls = pokemonData.moves
            .filter(move => move.version_group_details.some(vgd => vgd.version_group.name === 'red-blue'))
            .map(move => move.move.url);

        // Limitar el número de llamadas a la API de movimientos para evitar sobrecargar
        // y solo obtener los detalles de los movimientos relevantes.
        // Elegiremos hasta 30 movimientos aleatorios de su lista general para inspeccionar.
        const movesToInspectUrls = allPossibleMoveUrls.sort(() => 0.5 - Math.random()).slice(0, 30);
        
        const moveDetailsPromises = movesToInspectUrls.map(url => fetch(url).then(res => res.json()));
        const fetchedMoveDetails = await Promise.all(moveDetailsPromises);

        // Filtrar solo movimientos de daño y con poder > 0
        const damageMoves = fetchedMoveDetails.filter(moveDetail => moveDetail.power && moveDetail.power > 0);

        // Separar movimientos por tipo para priorizar STAB
        const stabMoves = damageMoves.filter(move => types.includes(move.type.name));
        const otherTypeMoves = damageMoves.filter(move => !types.includes(move.type.name));

        // Ordenar movimientos por poder descendente
        stabMoves.sort((a, b) => b.power - a.power);
        otherTypeMoves.sort((a, b) => b.power - a.power);

        // --- 1. Añadir 2 movimientos STAB de alto poder ---
        for (let i = 0; i < 2 && stabMoves.length > 0; i++) {
            const moveDetail = stabMoves.shift(); // Tomar el de mayor poder y quitarlo de la lista
            const nameEntry = moveDetail.names.find(name => name.language.name === 'es');
            const moveData = {
                name: nameEntry ? nameEntry.name : moveDetail.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                power: moveDetail.power,
                type: moveDetail.type.name,
            };
            if (!selectedMoves.some(m => m.name === moveData.name)) { // Evitar duplicados si por alguna razón la API los devuelve
                selectedMoves.push(moveData);
            }
        }

        // --- 2. Añadir un ataque común (Placaje/Arañazo) si no se ha añadido ya ---
        const commonMoveNames = ["Placaje", "Arañazo", "Tackle", "Scratch"]; // Nombres en español e inglés
        const hasCommonMove = selectedMoves.some(m => commonMoveNames.includes(m.name));

        if (!hasCommonMove && selectedMoves.length < 4) {
             const foundCommonMove = fallbackMoves.find(move => commonMoveNames.includes(move.name));
             if (foundCommonMove) {
                 selectedMoves.push(foundCommonMove);
             }
        }


        // --- 3. Rellenar con los ataques restantes (STAB o de otros tipos) de alto poder al azar ---
        // Combinar los movimientos STAB restantes y los de otros tipos, y mezclarlos
        const remainingMoves = [...stabMoves, ...otherTypeMoves].sort(() => 0.5 - Math.random());

        for (const moveDetail of remainingMoves) {
            if (selectedMoves.length >= 4) break;
            const nameEntry = moveDetail.names.find(name => name.language.name === 'es');
            const moveData = {
                name: nameEntry ? nameEntry.name : moveDetail.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                power: moveDetail.power,
                type: moveDetail.type.name,
            };
            if (!selectedMoves.some(m => m.name === moveData.name)) {
                selectedMoves.push(moveData);
            }
        }

        // --- 4. Rellenar con movimientos de fallback si aún no hay 4 ---
        for (const fMove of fallbackMoves) {
            if (selectedMoves.length >= 4) break;
            if (!selectedMoves.some(m => m.name === fMove.name)) {
                selectedMoves.push(fMove);
            }
        }
        
        selectedMoves = selectedMoves.slice(0, 4); // Asegurar que siempre sean 4


        // Valores base para HP, Ataque y Defensa para un inicio de batalla simplificado
        // Estos multiplicadores ajustan la dificultad y duración de las batallas
        const hpMultiplier = 2.5; // Ajusta esto para dar más HP
        const attackDefenseMultiplier = 0.5; // Ajusta esto para dar menos impacto a las stats base

        return {
            id: pokemonData.id,
            name: pokemonData.name,
            hp: Math.floor(stats.hp * hpMultiplier) || 100, // Usar HP base, o 100 por defecto
            maxHp: Math.floor(stats.hp * hpMultiplier) || 100, // Guardar HP máximo para la barra
            attack: Math.floor(stats.attack * attackDefenseMultiplier) || 25, // Usar ataque base, o 25 por defecto
            defense: Math.floor(stats.defense * attackDefenseMultiplier) || 15, // Usar defensa base, o 15 por defecto
            types: types,
            moves: selectedMoves, // ¡Ahora con movimientos más inteligentes!
            sprites: {
                // Usamos el official-artwork para ambos, jugador y oponente
                official_artwork: pokemonData.sprites.other['official-artwork'].front_default,
                // Mantenemos los otros sprites por si acaso se necesitan para otra cosa
                front_default: pokemonData.sprites.front_default,
                back_default: pokemonData.sprites.back_default,
            }
        };

    } catch (error) {
        console.error(`Error fetching details for Pokemon ID ${pokemonId}:`, error);
        // Fallback a datos genéricos si la API falla
        return {
            id: pokemonId,
            name: `Pokémon ${pokemonId} desconocido`, // Traducido
            hp: 100,
            maxHp: 100,
            attack: 25,
            defense: 15,
            types: ['normal'],
            // Movimientos de fallback que siempre estarán disponibles
            moves: [
                { name: "Placaje", power: 40, type: "normal" }, // Traducido
                { name: "Arañazo", power: 40, type: "normal" },
                { name: "Ataque Rápido", power: 40, type: "normal" },
                { name: "Gruñido", power: 0, type: "normal" }
            ], 
            sprites: {
                official_artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
                front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
                back_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`,
            }
        };
    }
};


function PokemonBattleArena({ pokemonList }) { // pokemonList ya no será la fuente principal de datos detallados
    const [searchParams] = useSearchParams();
    const pokemonId1 = parseInt(searchParams.get('p1'));
    const pokemonId2 = parseInt(searchParams.get('p2'));

    // Estados para los equipos y HP
    const [playerTeam, setPlayerTeam] = useState([]); 
    const [opponentTeam, setOpponentTeam] = useState([]); 

    // Índices del Pokémon activo en cada equipo
    const [playerActivePokemonIndex, setPlayerActivePokemonIndex] = useState(0); 
    const [opponentActivePokemonIndex] = useState(0); // La IA solo tendrá 1 por ahora

    // HP actual de cada Pokémon en el equipo (se mantiene separado del objeto del Pokémon)
    const [playerTeamHp, setPlayerTeamHp] = useState([]); 
    const [opponentTeamHp, setOpponentTeamHp] = useState([]); 

    // Estados de la batalla
    const [battleLog, setBattleLog] = useState([]); // Mensajes del log de batalla
    const [isPlayersTurn, setIsPlayersTurn] = useState(true); // Control de turnos
    const [battleEnded, setBattleEnded] = useState(false); // Indica si la batalla ha terminado
    const [turnCount, setTurnCount] = useState(1); // NUEVO ESTADO: Contador de turnos

    const navigate = useNavigate();

    // --- NUEVOS ESTADOS PARA LAS ANIMACIONES ---
    const [playerAttacking, setPlayerAttacking] = useState(false);
    const [opponentAttacking, setOpponentAttacking] = useState(false);
    const [playerDamaged, setPlayerDamaged] = useState(false);
    const [opponentDamaged, setOpponentDamaged] = useState(false);

    // --- NUEVOS REF PARA LOS ELEMENTOS DE AUDIO ---
    const attackSoundRef = useRef(null);
    const hitSoundRef = useRef(null);
    const battleMusicRef = useRef(null); // Para la música de fondo
    const lowHpSoundRef = useRef(null); // Nuevo: Sonido de HP bajo
    const victorySoundRef = useRef(null); // Nuevo: Sonido de victoria
    const defeatSoundRef = useRef(null); // Nuevo: Sonido de derrota


    // --- Carga inicial de Pokémon y sus estadísticas de batalla (MODIFICADA para música) ---
    useEffect(() => {
        const loadBattlePokemon = async () => {
            // Si faltan IDs, redirigir a la selección de batalla
            if (!pokemonId1 || !pokemonId2) {
                navigate('/battle'); 
                return;
            }

            // Obtener detalles de los Pokémon del jugador de la PokeAPI
            const p1Details = await fetchPokemonDetails(pokemonId1);
            const p2Details = await fetchPokemonDetails(pokemonId2);
            
            const selectedPlayerTeam = [p1Details, p2Details];
            setPlayerTeam(selectedPlayerTeam);

            // Elegir un ID de oponente al azar que no sea ninguno de los seleccionados por el jugador
            const selectedIds = [pokemonId1, pokemonId2];
            const allAvailablePokemonIds = Array.from({length: 151}, (_, i) => i + 1); // Asumiendo que trabajas con los primeros 151
            const opponentId = allAvailablePokemonIds.filter(id => !selectedIds.includes(id))
                                                    .sort(() => 0.5 - Math.random())[0];
            
            // Obtener detalles del Pokémon oponente
            const opponentDetails = await fetchPokemonDetails(opponentId);
            const initialOpponentTeam = [opponentDetails]; // La IA solo tiene 1 Pokémon por ahora
            setOpponentTeam(initialOpponentTeam);

            // Inicializar HP para ambos equipos
            setPlayerTeamHp(selectedPlayerTeam.map(p => p.hp));
            setOpponentTeamHp(initialOpponentTeam.map(p => p.hp));

            // Inicializar log de batalla
            setBattleLog(["¡La batalla ha comenzado!"]);
            const starterMessage = `${p1Details.name.charAt(0).toUpperCase() + p1Details.name.slice(1)} vs ${opponentDetails.name.charAt(0).toUpperCase() + opponentDetails.name.slice(1)}. ¡A luchar!`;
            setBattleLog(prev => [...prev, starterMessage]);
            setTurnCount(1); // Resetear contador de turnos al iniciar una nueva batalla
            setIsPlayersTurn(true); // Asegurarse de que el jugador empiece
            setBattleEnded(false); // Asegurarse de que la batalla no esté marcada como terminada

            // Iniciar música de batalla (al cargar la página)
            // IMPORTANTE: Los navegadores modernos pueden bloquear la reproducción automática de audio
            // si no hay una interacción del usuario primero. Puede que la música solo empiece
            // después de que el usuario haga click en un botón de ataque o en la pantalla.
            if (battleMusicRef.current) {
                battleMusicRef.current.volume = 0.3; // Ajustar volumen si es muy alto
                battleMusicRef.current.loop = true; // Que se repita
                battleMusicRef.current.play().catch(e => console.error("Error al reproducir música:", e));
            }
            // Asegurarse de que el sonido de HP bajo esté pausado al inicio
            if (lowHpSoundRef.current) {
                lowHpSoundRef.current.pause();
                lowHpSoundRef.current.currentTime = 0;
            }
        };

        loadBattlePokemon();

        // Detener música cuando el componente se desmonte o la batalla termine
        return () => {
            if (battleMusicRef.current) {
                battleMusicRef.current.pause();
                battleMusicRef.current.currentTime = 0; // Resetear la posición del audio
            }
            // Asegurarse de que el sonido de HP bajo esté pausado al inicio
            if (lowHpSoundRef.current) { // Detener sonido de HP bajo también
                lowHpSoundRef.current.pause();
                lowHpSoundRef.current.currentTime = 0;
            }
        };
    }, [pokemonId1, pokemonId2, navigate]); // Dependencias para re-ejecutar si los IDs cambian


    // Comprobamos si la batalla ha terminado cada vez que el HP de los equipos cambia (MODIFICADA para detener música)
    useEffect(() => {
        if (playerTeam.length > 0 && opponentTeam.length > 0) {
            const allPlayerFainted = playerTeamHp.every(hp => hp <= 0);
            const allOpponentFainted = opponentTeamHp.every(hp => hp <= 0);

            if (allPlayerFainted && !battleEnded) {
                setBattleLog(prev => [...prev, "¡Tu equipo ha sido debilitado! Has perdido la batalla."]);
                setBattleEnded(true);
                if (battleMusicRef.current) { battleMusicRef.current.pause(); } // Detener música al perder
            } else if (allOpponentFainted && !battleEnded) {
                setBattleLog(prev => [...prev, "¡El equipo rival ha sido debilitado! ¡Has ganado la batalla!"]);
                setBattleEnded(true);
                if (battleMusicRef.current) { battleMusicRef.current.pause(); } // Detener música al ganar
            }
        }
    }, [playerTeamHp, opponentTeamHp, playerTeam.length, opponentTeam.length, battleEnded]);


    // Obtener los Pokémon activos en la batalla para facilitar el acceso
    const playerActivePokemon = playerTeam[playerActivePokemonIndex];
    const opponentActivePokemon = opponentTeam[opponentActivePokemonIndex];

    // --- Lógica del ataque del jugador (MODIFICADA para sonidos) ---
    const handleAttack = useCallback((moveIndex) => {
        // No permitir atacar si la batalla ha terminado, si no hay Pokémon activos o no es el turno del jugador
        if (battleEnded || !playerActivePokemon || !opponentActivePokemon || !isPlayersTurn) return;

        setPlayerAttacking(true); // Activar animación de ataque del jugador
        if (attackSoundRef.current) { // Reproducir sonido de ataque
            attackSoundRef.current.currentTime = 0; // Reiniciar por si se reproduce muy rápido
            attackSoundRef.current.play().catch(e => console.error("Error al reproducir sonido de ataque:", e));
        }

        // Añadir un pequeño retraso para que la animación de ataque se complete
        setTimeout(() => {
            setPlayerAttacking(false); // Desactivar animación de ataque

            let logMessages = [];
            const chosenMove = playerActivePokemon.moves[moveIndex];
            
            // Parámetros para la fórmula de daño
            const level = 50; // Nivel fijo para simplificar
            const attackStat = playerActivePokemon.attack;
            const defenseStat = opponentActivePokemon.defense;

            // Calcular STAB (Same-Type Attack Bonus)
            const playerPokemonTypes = playerActivePokemon.types;
            const moveIsSameType = playerPokemonTypes.includes(chosenMove.type);
            const stab = moveIsSameType ? 1.5 : 1;

            // Calcular efectividad de tipos (usando la función de utilidad)
            const opponentPokemonTypes = opponentActivePokemon.types;
            const typeEffectiveness = calculateTypeEffectiveness(chosenMove.type, opponentPokemonTypes);

            // Fórmula de daño de Pokémon simplificada
            let damage = Math.floor(
                (((2 * level / 5 + 2) * chosenMove.power * attackStat / defenseStat) / 50 + 2)
                * stab 
                * typeEffectiveness
            );
            damage = Math.max(1, damage); // Asegurar un mínimo de 1 de daño

            // Actualizar HP del oponente
            const newOpponentHp = opponentTeamHp[opponentActivePokemonIndex] - damage;

            setOpponentDamaged(true); // Activar animación de daño al oponente
            if (hitSoundRef.current) { // Reproducir sonido de golpe
                hitSoundRef.current.currentTime = 0;
                hitSoundRef.current.play().catch(e => console.error("Error al reproducir sonido de golpe:", e));
            }

            // Retraso para que la animación de daño se muestre
            setTimeout(() => {
                setOpponentDamaged(false); // Desactivar animación de daño

                // Añadir mensajes al log
                logMessages.push(`${playerActivePokemon.name.charAt(0).toUpperCase() + playerActivePokemon.name.slice(1)} usó ${chosenMove.name} e hizo ${damage} de daño.`);
                
                // Mensajes de efectividad de tipos
                if (typeEffectiveness === 2) {
                    logMessages.push("¡Es súper efectivo!");
                } else if (typeEffectiveness === 4) { // Para doble tipo que sea x2 * x2
                    logMessages.push("¡Es cuádruple efectivo!"); 
                } else if (typeEffectiveness === 0.5) {
                    logMessages.push("No es muy efectivo...");
                } else if (typeEffectiveness === 0.25) { // Para doble tipo que sea x0.5 * x0.5
                    logMessages.push("Apenas hace efecto...");
                } else if (typeEffectiveness === 0) {
                    logMessages.push("No tiene efecto.");
                }

                // Actualizar el estado del HP del equipo oponente
                setOpponentTeamHp(prevHp => {
                    const updatedHp = [...prevHp];
                    updatedHp[opponentActivePokemonIndex] = newOpponentHp;
                    return updatedHp;
                });

                // Si el oponente ha sido debilitado
                if (newOpponentHp <= 0) {
                    logMessages.push(`${opponentActivePokemon.name.charAt(0).toUpperCase() + opponentActivePokemon.name.slice(1)} ha sido debilitado.`);
                    // Aquí se podría añadir lógica para que la IA cambie de Pokémon si tuviera más
                }

                setBattleLog(prev => [...prev, ...logMessages]); // Actualizar log
                setIsPlayersTurn(false); // Pasar el turno a la IA
                // El contador de turnos se incrementa DESPUÉS de que la IA haya actuado, para contar un "round" completo.
            }, 300); // Duración de la animación de daño (0.3s)

        }, 400); // Duración de la animación de ataque (0.4s)
    }, [battleEnded, playerActivePokemon, opponentActivePokemon, isPlayersTurn, opponentTeamHp, opponentActivePokemonIndex]);


    // --- Lógica de la IA del oponente (MODIFICADA para sonidos) ---
    useEffect(() => {
        // Se ejecuta si no es el turno del jugador, la batalla no ha terminado y ambos Pokémon están activos
        if (!isPlayersTurn && !battleEnded && opponentActivePokemon && playerActivePokemon) {
            const opponentTurn = () => {
                setOpponentAttacking(true); // Activar animación de ataque del oponente
                if (attackSoundRef.current) { // Reproducir sonido de ataque
                    attackSoundRef.current.currentTime = 0;
                    attackSoundRef.current.play().catch(e => console.error("Error al reproducir sonido de ataque:", e));
                }

                // Retraso para la animación de ataque de la IA
                setTimeout(() => {
                    setOpponentAttacking(false); // Desactivar animación de ataque

                    let logMessages = [];
                    // La IA elige un movimiento aleatorio de sus disponibles
                    const chosenMove = opponentActivePokemon.moves[Math.floor(Math.random() * opponentActivePokemon.moves.length)];

                    // Parámetros para la fórmula de daño de la IA
                    const level = 50; 
                    const attackStat = opponentActivePokemon.attack;
                    const defenseStat = playerActivePokemon.defense;

                    const opponentPokemonTypes = opponentActivePokemon.types;
                    const moveIsSameType = opponentPokemonTypes.includes(chosenMove.type);
                    const stab = moveIsSameType ? 1.5 : 1;

                    const playerPokemonTypes = playerActivePokemon.types;
                    const typeEffectiveness = calculateTypeEffectiveness(chosenMove.type, playerPokemonTypes);

                    let damage = Math.floor(
                        (((2 * level / 5 + 2) * chosenMove.power * attackStat / defenseStat) / 50 + 2)
                        * stab 
                        * typeEffectiveness
                    );
                    damage = Math.max(1, damage); // Asegurar un mínimo de 1 de daño

                    const newPlayerHp = playerTeamHp[playerActivePokemonIndex] - damage;

                    setPlayerDamaged(true); // Activar animación de daño al jugador
                    if (hitSoundRef.current) { // Reproducir sonido de golpe
                        hitSoundRef.current.currentTime = 0;
                        hitSoundRef.current.play().catch(e => console.error("Error al reproducir sonido de golpe:", e));
                    }

                    // Retraso para que la animación de daño se muestre
                    setTimeout(() => {
                        setPlayerDamaged(false); // Desactivar animación de daño

                        // Añadir mensajes al log
                        logMessages.push(`${opponentActivePokemon.name.charAt(0).toUpperCase() + opponentActivePokemon.name.slice(1)} usó ${chosenMove.name} e hizo ${damage} de daño.`);
                        
                        // Mensajes de efectividad de tipos
                        if (typeEffectiveness === 2) {
                            logMessages.push("¡Es súper efectivo!");
                        } else if (typeEffectiveness === 4) {
                            logMessages.push("¡Es cuádruple efectivo!");
                        } else if (typeEffectiveness === 0.5) {
                            logMessages.push("No es muy efectivo...");
                        } else if (typeEffectiveness === 0.25) {
                            logMessages.push("Apenas hace efecto...");
                        } else if (typeEffectiveness === 0) {
                            logMessages.push("No tiene efecto.");
                        }

                        // Actualizar el estado del HP del equipo del jugador
                        setPlayerTeamHp(prevHp => {
                            const updatedHpTeam = [...prevHp];
                            updatedHpTeam[playerActivePokemonIndex] = newPlayerHp;
                            return updatedHpTeam;
                        });

                        // Si el jugador ha sido debilitado, buscar el siguiente Pokémon disponible
                        if (newPlayerHp <= 0) {
                            logMessages.push(`${playerActivePokemon.name.charAt(0).toUpperCase() + playerActivePokemon.name.slice(1)} ha sido debilitado.`);
                            
                            const nextPlayerPokemonIndex = playerTeamHp.findIndex((hp, idx) => hp > 0 && idx !== playerActivePokemonIndex);
                            if (nextPlayerPokemonIndex !== -1) {
                                setBattleLog(prev => [...prev, ...logMessages, `¡${playerActivePokemon.name.charAt(0).toUpperCase() + playerActivePokemon.name.slice(1)} se retiró! ¡Envía al siguiente Pokémon!`]);
                                setPlayerActivePokemonIndex(nextPlayerPokemonIndex); // Cambiar al siguiente Pokémon
                            }
                        }
                        setBattleLog(prev => [...prev, ...logMessages]); // Actualizar log
                        setIsPlayersTurn(true); // Pasar el turno de nuevo al jugador
                        setTurnCount(prev => prev + 1); // Incrementa el contador de turnos (un round completo ha pasado)
                    }, 300); // Duración de la animación de daño (0.3s)

                }, 400); // Duración de la animación de ataque (0.4s)
            };

            // El temporizador principal para el turno de la IA, ahora incluye los sub-timers
            const mainTurnTimer = setTimeout(opponentTurn, 1500); // Retraso para simular el turno de la IA
            return () => clearTimeout(mainTurnTimer); // Limpiar el temporizador si el componente se desmonta
        }
    }, [isPlayersTurn, battleEnded, opponentActivePokemon, playerActivePokemon, playerTeamHp, playerActivePokemonIndex]);


    // --- Lógica de cambio de Pokémon del jugador ---
    const handleChangePokemon = useCallback((newIndex) => {
        // No permitir cambio si la batalla ha terminado, no es el turno del jugador o se intenta cambiar por el mismo
        if (battleEnded || !isPlayersTurn || newIndex === playerActivePokemonIndex) return;

        // No permitir cambio a un Pokémon debilitado
        if (playerTeamHp[newIndex] <= 0) {
            setBattleLog(prev => [...prev, `¡${playerTeam[newIndex].name.charAt(0).toUpperCase() + playerTeam[newIndex].name.slice(1)} ya está debilitado y no puede luchar!`]);
            return;
        }

        // Mensaje de cambio y actualización del Pokémon activo
        setBattleLog(prev => [...prev, `${playerActivePokemon.name.charAt(0).toUpperCase() + playerActivePokemon.name.slice(1)} regresa. ¡Adelante, ${playerTeam[newIndex].name.charAt(0).toUpperCase() + playerTeam[newIndex].name.slice(1)}!`]);
        
        // Retraso para que el mensaje aparezca antes de que cambie el Pokémon
        setTimeout(() => {
            setPlayerActivePokemonIndex(newIndex);
            setIsPlayersTurn(false); // Pasar el turno a la IA después del cambio
            setTurnCount(prev => prev + 1); // El cambio consume el turno del jugador
        }, 500); // Pequeño retraso para la fluidez del log
    }, [battleEnded, isPlayersTurn, playerActivePokemonIndex, playerActivePokemon, playerTeamHp, playerTeam]);


    // Mostrar mensaje de carga mientras los Pokémon no estén listos
    if (!playerActivePokemon || !opponentActivePokemon || playerTeam.length < 2 || opponentTeam.length === 0 || playerTeamHp.length < 2 || opponentTeamHp.length === 0) {
        return (
            <div className="battle-arena-container">
                <div className="loading-battle">Cargando Pokémon para la batalla...</div>
                <Link to="/battle" className="back-to-selector pokemon-link-button">Volver a la selección</Link>
                {/* Asegurarse de que los elementos de audio estén presentes en el DOM
                    incluso durante la carga para que los refs se puedan inicializar.
                    Los navegadores modernos pueden requerir una interacción de usuario
                    para que el audio se reproduzca automáticamente. */}
                <audio ref={attackSoundRef} src="/sounds/attack.mp3" preload="auto" hidden></audio>
                <audio ref={hitSoundRef} src="/sounds/hit.mp3" preload="auto" hidden></audio>
                <audio ref={battleMusicRef} src="/sounds/battle_music.mp3" preload="auto" loop hidden></audio>
            </div>
        );
    }

    // Calcula el porcentaje de HP para las barras de vida
    const playerHpPercent = (playerTeamHp[playerActivePokemonIndex] / playerActivePokemon.maxHp) * 100;
    const opponentHpPercent = (opponentTeamHp[opponentActivePokemonIndex] / opponentActivePokemon.maxHp) * 100;


    return (
        <div className="battle-arena-container">
            <h1>¡Batalla Pokémon!</h1>

            {/* Elementos de audio ocultos y referenciados */}
            <audio ref={attackSoundRef} src="/sounds/attack.mp3" preload="auto" hidden></audio>
            <audio ref={hitSoundRef} src="/sounds/hit.mp3" preload="auto" hidden></audio>
            <audio ref={battleMusicRef} src="/sounds/battle_music.mp3" preload="auto" loop hidden></audio>


            {/* NUEVO ELEMENTO: Indicador de Turno */}
            <div className="turn-indicator">
                <span>Turno: {turnCount}</span>
                <span className={`turn-player ${isPlayersTurn ? 'active' : ''}`}>
                    {isPlayersTurn ? "Tu Turno" : "Turno del Rival"}
                </span>
            </div>

            {/* Contenedor para las Pokebolas de equipo del jugador (arriba) */}
            <div className="pokeball-team-container player-team top-position">
                <div className="pokeball-grid">
                    {playerTeam.map((pokemon, idx) => {
                        const isFainted = playerTeamHp[idx] <= 0;
                        const isActive = playerActivePokemonIndex === idx;

                        return (
                            <div
                                key={pokemon.id}
                                className={`pokeball-slot ${isFainted ? 'fainted' : ''} ${isActive ? 'active' : ''}`}
                            >
                                <img
                                    src="/pokeball-icon.png" // Icono de Pokebola
                                    alt="Pokeball"
                                    className="pokeball-icon"
                                />
                                <span className="pokemon-name-pokeball">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
                                {isFainted && <span className="fainted-overlay">Debilitado</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Contenedor para las Pokebolas de equipo del oponente (arriba) */}
            <div className="pokeball-team-container opponent-team top-position">
                <div className="pokeball-grid">
                    {opponentTeam.map((pokemon, idx) => {
                        const isFainted = opponentTeamHp[idx] <= 0;
                        const isActive = opponentActivePokemonIndex === idx; 

                        return (
                            <div
                                key={pokemon.id}
                                className={`pokeball-slot ${isFainted ? 'fainted' : ''} ${isActive ? 'active' : ''}`}
                            >
                                <img
                                    src="/pokeball-icon.png" // Icono de Pokebola
                                    alt="Pokeball"
                                    className="pokeball-icon"
                                />
                                <span className="pokemon-name-pokeball">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
                                {isFainted && <span className="fainted-overlay">Debilitado</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Display de los Pokémon que están combatiendo */}
            <div className="battle-display">
                <div className="battle-pokemon pokemon-1">
                    <h3>{playerActivePokemon.name.charAt(0).toUpperCase() + playerActivePokemon.name.slice(1)}</h3>
                    {/* Usamos el official_artwork para el jugador */}
                    <img
                        src={playerActivePokemon.sprites.official_artwork}
                        alt={playerActivePokemon.name}
                        // Añadir clases condicionales para las animaciones
                        className={`active-pokemon-image player ${playerAttacking ? 'attacking' : ''} ${playerDamaged ? 'damaged' : ''}`}
                    />
                    <div className="hp-bar-container">
                        <div className="hp-bar" style={{ width: `${Math.max(0, playerHpPercent)}%`, backgroundColor: playerHpPercent > 50 ? 'lightgreen' : playerHpPercent > 20 ? 'orange' : 'red' }}></div>
                    </div>
                    <p>HP: {Math.max(0, playerTeamHp[playerActivePokemonIndex])} / {playerActivePokemon.maxHp}</p>
                </div>

                <div className="battle-vs">VS</div>

                <div className="battle-pokemon pokemon-2">
                    <h3>{opponentActivePokemon.name.charAt(0).toUpperCase() + opponentActivePokemon.name.slice(1)}</h3>
                    {/* Usamos el official_artwork para el oponente */}
                    <img
                        src={opponentActivePokemon.sprites.official_artwork}
                        alt={opponentActivePokemon.name}
                        // Añadir clases condicionales para las animaciones
                        className={`active-pokemon-image opponent ${opponentAttacking ? 'attacking' : ''} ${opponentDamaged ? 'damaged' : ''}`}
                    />
                    <div className="hp-bar-container">
                        <div className="hp-bar" style={{ width: `${Math.max(0, opponentHpPercent)}%`, backgroundColor: opponentHpPercent > 50 ? 'lightgreen' : opponentHpPercent > 20 ? 'orange' : 'red' }}></div>
                    </div>
                    <p>HP: {Math.max(0, opponentTeamHp[opponentActivePokemonIndex])} / {opponentActivePokemon.maxHp}</p>
                </div>
            </div>

            {/* Log de la batalla */}
            <div className="battle-log">
                {battleLog.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>

            {/* Controles de la batalla */}
            <div className="battle-controls">
                {/* Mostrar los botones de ataque y cambio de Pokémon solo si es el turno del jugador y la batalla no ha terminado */}
                {!battleEnded && isPlayersTurn && (
                    <>
                        {/* Botones de ataque dinámicos según los movimientos del Pokémon */}
                        {playerActivePokemon.moves.map((move, index) => {
                            const typeInfo = getTypeInfo(move.type); // Obtener info del tipo para el color del botón
                            return (
                                <button 
                                    key={index} 
                                    onClick={() => handleAttack(index)} 
                                    disabled={battleEnded || !isPlayersTurn} // Deshabilitar si la batalla terminó o no es el turno
                                    className="move-button" // Clase base para estilos CSS
                                    style={{ backgroundColor: typeInfo.color }} // Color de fondo según el tipo
                                >
                                    {move.name} ({move.power} PWR)
                                </button>
                            );
                        })}
                        
                        {/* Botones para cambiar de Pokémon (solo si no es el activo y no está debilitado) */}
                        {playerTeam.map((pokemon, idx) => {
                            const isFainted = playerTeamHp[idx] <= 0;
                            const isActive = playerActivePokemonIndex === idx;

                            if (!isActive && !isFainted) { // Solo mostrar si no es el activo y no está debilitado
                                return (
                                    <button
                                        key={pokemon.id}
                                        onClick={() => handleChangePokemon(idx)}
                                        disabled={battleEnded || !isPlayersTurn} // Deshabilitar si la batalla terminó o no es el turno
                                        className="change-pokemon-button"
                                    >
                                        Cambiar a {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                                    </button>
                                );
                            }
                            return null; // No renderizar nada si el Pokémon está activo o debilitado
                        })}
                    </>
                )}
                {/* Botón para volver a la selección una vez que la batalla ha terminado */}
                {battleEnded && (
                    <button onClick={() => navigate('/battle')} className="restart-button pokemon-link-button">
                        Volver a la Selección
                    </button>
                )}
                {/* Overlay de espera durante el turno del oponente */}
                {!isPlayersTurn && !battleEnded && (
                    <div className="turn-wait-overlay">Esperando el turno del Rival...</div>
                )}
            </div>
        </div>
    );
}

export default PokemonBattleArena;