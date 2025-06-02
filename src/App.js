import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import PokemonCard from './components/PokemonCard';
import { Routes, Route, Link } from 'react-router-dom';
import PokemonDetail from './components/PokemonDetail';
import manualPokemonImages from './data/manualPokemonImages'; // Asegúrate de que esta ruta sea correcta


function App() {
  // Estado para guardar la lista de Pokémon con información enriquecida (incluyendo tipos e ID)
  const [pokemonList, setPokemonList] = useState([]);
  // Estado para indicar si los datos se están cargando
  const [loading, setLoading] = useState(true);
  // Estado para guardar cualquier error que ocurra durante el fetch
  const [error, setError] = useState(null);

  // --- Estados para Búsqueda y Filtrado ---
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda
  // Estado para el tipo seleccionado (cadena vacía = todos). Ahora usará el valor en inglés.
  const [selectedType, setSelectedType] = useState('');
  // Estado para la generación seleccionada. Inicializado a '1' (Generación 1).
  const [selectedGeneration, setSelectedGeneration] = useState('1');
  // Estado para controlar la visibilidad del menú desplegable de generaciones.
  const [isGenMenuOpen, setIsGenMenuOpen] = useState(false);


  // Datos de generaciones para el filtro
  const generations = [
      { id: 1, limit: 151, offset: 0, name: 'Generación 1' },
      { id: 2, limit: 100, offset: 151, name: 'Generación 2' },
      { id: 3, limit: 135, offset: 251, name: 'Generación 3' },
      { id: 4, limit: 107, offset: 386, name: 'Generación 4' },
      { id: 5, limit: 156, offset: 493, name: 'Generación 5' },
      { id: 6, limit: 72, offset: 649, name: 'Generación 6' }, // Añadida Gen 6
      { id: 7, limit: 88, offset: 721, name: 'Generación 7' }, // Añadida Gen 7
      { id: 8, limit: 96, offset: 809, name: 'Generación 8' }, // Añadida Gen 8
      { id: 9, limit: 120, offset: 905, name: 'Generación 9' }, // Añadida Gen 9
      // Añade más generaciones si las fetcheas
  ];

  // MODIFICADO: Lista de tipos para el filtro con valor en inglés y texto a mostrar en español
  const pokemonTypes = [
      { value: 'normal', display: 'Normal' },
      { value: 'fire', display: 'Fuego' },
      { value: 'water', display: 'Agua' },
      { value: 'electric', display: 'Eléctrico' },
      { value: 'grass', display: 'Planta' },
      { value: 'ice', display: 'Hielo' },
      { value: 'fighting', display: 'Lucha' },
      { value: 'poison', display: 'Veneno' },
      { value: 'ground', display: 'Tierra' },
      { value: 'flying', display: 'Volador' },
      { value: 'psychic', display: 'Psíquico' },
      { value: 'bug', display: 'Bicho' },
      { value: 'rock', display: 'Roca' },
      { value: 'ghost', display: 'Fantasma' },
      { value: 'dragon', display: 'Dragón' },
      { value: 'dark', display: 'Siniestro' },
      { value: 'steel', display: 'Acero' },
      { value: 'fairy', display: 'Hada' },
  ];


  // useEffect hook para fetch la lista inicial de Pokémon y sus tipos/ID
  useEffect(() => {
    const fetchPokemonWithDetails = async () => {
      try {
        // Fetcheamos un número mayor de Pokémon para poder filtrar a través de generaciones
        // Ajusta el límite según cuántos Pokémon quieras cargar inicialmente.
        // Un límite de 1302 debería cubrir todas las generaciones hasta la 9 (excluyendo formas)
        const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=905&offset=0');
        if (!listResponse.ok) {
          throw new Error(`HTTP error! status: ${listResponse.status}`);
        }
        const listData = await listResponse.json();
        const results = listData.results; // Array de { name, url }

        // 2. Para cada Pokémon en la lista, fetchear sus detalles para obtener ID y Tipos
        const pokemonWithDetails = await Promise.all(
          results.map(async (pokemon) => {
            try { // Usamos try/catch dentro del map para no detener si uno falla
                const detailResponse = await fetch(pokemon.url);
                if (!detailResponse.ok) {
                   console.warn(`Could not fetch details for ${pokemon.name}: ${detailResponse.status}`);
                   // Retorna un objeto básico si falla el fetch de detalles
                   return { name: pokemon.name, url: pokemon.url, id: null, types: [] };
                }
                const detailData = await detailResponse.json();
                // Retorna un objeto con la información que necesitamos para la lista/filtros
                return {
                  name: detailData.name, // Usamos el nombre de los detalles por si acaso
                  url: pokemon.url,
                  id: detailData.id, // Obtenemos el ID
                  types: detailData.types.map(typeInfo => typeInfo.type.name) // Obtenemos los nombres de los tipos (estos están en inglés desde la API)
                };
            } catch (detailErr) {
                 console.warn(`Error processing details for ${pokemon.name}: `, detailErr);
                 return { name: pokemon.name, url: pokemon.url, id: null, types: [] };
            }
          })
        );

        // Filtramos los que no pudieron fetchearse si es necesario, o los incluimos con datos parciales
         const validPokemon = pokemonWithDetails.filter(pokemon => pokemon.id !== null);


        setPokemonList(validPokemon); // Guarda la lista enriquecida

      } catch (err) {
        setError(err);
        console.error("Error fetching initial list or details: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonWithDetails();

  }, []); // Este efecto solo se ejecuta una vez al montar


  // --- Lógica de Búsqueda y Filtrado ---
  // useMemo memoriza el resultado de la función y solo la re-ejecuta si las dependencias cambian.
  const filteredPokemon = useMemo(() => {
    let currentList = [...pokemonList]; // Copia la lista original (ahora con id y types)

    // 1. Filtrar por Generación (SIEMPRE aplicamos el filtro de generación basado en selectedGeneration)
    if (selectedGeneration) {
        const gen = generations.find(g => g.id.toString() === selectedGeneration);
        if (gen) {
            // Filtra la lista basándose en el offset y limit de la generación usando el ID
            currentList = currentList.filter(pokemon =>
                pokemon.id > gen.offset && pokemon.id <= gen.offset + gen.limit
            );
        }
    }


    // 2. Filtrar por Búsqueda (Nombre o ID) - Se aplica sobre la lista ya filtrada por generación
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentList = currentList.filter(pokemon => {
         const pokemonIdString = pokemon.id ? pokemon.id.toString() : '';
         return pokemon.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                pokemonIdString.includes(lowerCaseSearchTerm);
      });
    }

    // 3. Filtrar por Tipo - Se aplica sobre la lista ya filtrada por generación y búsqueda
    if (selectedType) {
        currentList = currentList.filter(pokemon => {
            // Ahora selectedType está en inglés y pokemon.types contiene nombres en inglés, ¡así que esto funcionará!
            return pokemon.types && pokemon.types.includes(selectedType);
        });
    }


    return currentList; // Retorna la lista filtrada
  }, [pokemonList, searchTerm, selectedType, selectedGeneration, generations]); // Dependencias: re-ejecutar si cambian


  // --- Handlers para los cambios en los controles ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value); // Actualiza el estado del término de búsqueda
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value); // Actualiza el estado del tipo seleccionado (ahora en inglés)
  };

   // Handler para seleccionar una generación del menú desplegable.
   const handleGenerationSelect = (genId) => {
    setSelectedGeneration(genId.toString()); // Actualiza el estado de la generación seleccionada
    setIsGenMenuOpen(false); // Cierra el menú desplegable
    // Opcional: Puedes resetear searchTerm y selectedType aquí si quieres
    // setSearchTerm('');
    // setSelectedType('');
  };

  // Handler para alternar la visibilidad del menú de generaciones.
  const toggleGenMenu = () => {
      setIsGenMenuOpen(!isGenMenuOpen); // Invierte el estado actual (abierto/cerrado)
  };


  // Renderizado Condicional global (para la carga inicial de la lista)
  if (loading) {
      return (
          <div className="pokedex-container">
              <div className="loading">Cargando lista inicial de Pokémon...</div>
          </div>
      );
  }

  if (error) {
       return (
           <div className="pokedex-container">
               <div className="error">Error al cargar la lista inicial: {error.message}</div>
           </div>
       );
   }


  return (
    <div className="pokedex-container">
       <header>
           <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
             {/* Reemplazamos el h1 con una imagen */}
             <img
                 src="/logo.png" // <<-- Reemplaza esta ruta con la ruta real de tu logo en la carpeta public
                 alt="Mi Pokedex Logo"
                 className="pokedex-logo" // Añadimos una clase para estilizar la imagen
             />
           </Link>
       </header>

       {/* Mensaje de Bienvenida */}
       {/* Solo se muestra en la ruta principal ('/') */}
       <Routes>
           <Route path="/" element={
               <div className="welcome-message">
                   <h2>Busca tu Pokémon</h2>
                   <p>¡Encuentra a tu Pokémon favorito por nombre, ID o tipo!</p>
               </div>
           } />
            {/* Las otras rutas (como /pokemon/:pokemonId) no mostrarán este mensaje */}
            <Route path="/pokemon/:pokemonId" element={null} /> {/* No renderizar nada aquí */}
             <Route path="*" element={null} /> {/* No renderizar nada aquí */}
       </Routes>


      {/* --- Contenedor de Controles de Búsqueda y Filtrado --- */}
      {/* Mostramos los controles solo en la ruta principal */}
      <Routes>
          <Route path="/" element={
              <div className="controls-container">
                  {/* Controles de Búsqueda por Nombre/ID y Filtro por Tipo */}
                  <div>
                      <label htmlFor="search-input">Nombre o ID:</label>
                      <input
                          id="search-input"
                          type="text"
                          placeholder="Buscar..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                      />
                  </div>
                   <div>
                       <label htmlFor="type-filter">Tipo:</label>
                       <select id="type-filter" value={selectedType} onChange={handleTypeChange}>
                           <option value="">Todos</option>
                           {/* MODIFICADO: Usamos type.value para el valor y type.display para el texto visible */}
                           {pokemonTypes.map(type => (
                               <option key={type.value} value={type.value}>{type.display}</option>
                           ))}
                       </select>
                   </div>

                  {/* --- Botón y Menú Desplegable para Generaciones --- */}
                  <div className="generation-filter-container">
                      {/* Botón que alterna la visibilidad del menú */}
                      <button onClick={toggleGenMenu} className="generation-button">
                          Generación: {generations.find(gen => gen.id.toString() === selectedGeneration)?.name || 'Seleccionar'}
                      </button>

                      {/* Menú desplegable (lista de generaciones) */}
                      {/* Se muestra condicionalmente si isGenMenuOpen es true */}
                      {isGenMenuOpen && (
                          <ul className="generation-dropdown-menu">
                              {/* Opcional: Opción "Todas" si quieres incluirla de nuevo */}
                              {/* <li onClick={() => handleGenerationSelect('')}>Todas</li> */}
                              {generations.map(gen => (
                                  // Cada elemento de la lista es clicable
                                  <li
                                      key={gen.id}
                                      onClick={() => handleGenerationSelect(gen.id)} // Llama al handler al hacer clic
                                      className={selectedGeneration === gen.id.toString() ? 'active' : ''} // Clase 'active' para el seleccionado
                                  >
                                      {gen.name}
                                  </li>
                              ))}
                          </ul>
                      )}
                  </div>
              </div>
          } />
          {/* Asegúrate de que los controles no se muestren en las otras rutas */}
          <Route path="/pokemon/:pokemonId" element={null} />
          <Route path="*" element={null} />
      </Routes>


      {/* Define tus rutas para el CONTENIDO PRINCIPAL (lista o detalle) */}
      <Routes>
        {/* Ruta para la lista principal */}
        <Route path="/" element={
          <div className="pokemon-list">
            {/* Mapeamos la lista FILTRADA a componentes PokemonCard */}
            {filteredPokemon.length > 0 ? (
                filteredPokemon.map(pokemon => (
                  <PokemonCard key={pokemon.name} pokemon={pokemon} />
                ))
            ) : (
                // Muestra un mensaje si no hay resultados después de filtrar
                <div className="no-results">No se encontraron Pokémon con los filtros aplicados.</div>
            )}
          </div>
        } />

        {/* Ruta para los detalles de un Pokémon específico */}
        <Route path="/pokemon/:pokemonId" element={<PokemonDetail />} />

        {/* Opcional: Ruta para manejar URLs no encontradas (404) */}
        <Route path="*" element={<div className="error">Pokémon no encontrado o página inexistente</div>} />

      </Routes>

       {/* Puedes tener un footer aquí */}
       {/* <footer>...</footer> */}
    </div>
  );
}

export default App;
