// src/utils/audioUtils.js

export const playSound = (audioRef, volume = 0.5, loop = false) => {
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = volume;
        audioRef.current.loop = loop;
        audioRef.current.play().catch(e => console.error("Error al reproducir sonido:", e));
    }
};

export const stopSound = (audioRef) => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
};