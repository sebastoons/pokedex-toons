// src/components/pokemonDetail/PokemonMedia.js
import React, { useRef } from 'react';
import './PokemonMedia.css';

const PokemonMedia = ({ soundUrl, classicSprites }) => {
  const audioRef = useRef(null);

  const playPokemonCry = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error al reproducir el sonido:", e));
    }
  };

  const hasMedia = soundUrl || (classicSprites && classicSprites.length > 0);

  if (!hasMedia) {
    return null; // No renderizar nada si no hay ni sonido ni sprites
  }

  return (
    <div className="media-section">
      <h3>Sonido y Sprites</h3>
      <div className="media-section-container">
        {soundUrl && (
          <div className="pokemon-cry-section">
            <h4>Sonido del Pokemon:</h4>
            <audio ref={audioRef} src={soundUrl} preload="auto"></audio>
            <button onClick={playPokemonCry} className="play-cry-button">
              ▶
            </button>
          </div>
        )}

        {classicSprites && classicSprites.length > 0 && (
          <div className="classic-sprites-gallery">
            <h4>Sprites Clasicos:</h4>
            <div className="sprites-grid">
              {classicSprites.map((sprite, index) => (
                <div key={index} className="sprite-item">
                  <img src={sprite.url} alt={sprite.name} className="classic-sprite-image" />
                  <span className="sprite-name">{sprite.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonMedia;