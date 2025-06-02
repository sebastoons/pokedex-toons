import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// Get the root element from your HTML (usually index.html)
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// --- Código para registrar el Service Worker ---
// Verifica si el navegador soporta Service Workers
if ('serviceWorker' in navigator) {
  // Espera a que la página cargue completamente antes de registrar
  window.addEventListener('load', () => {
    // Registra el Service Worker
    // La ruta '/service-worker.js' es relativa a la raíz de tu dominio donde desplegarás la app
    navigator.serviceWorker.register('/service-worker.js') // <-- La ruta debe ser correcta
      .then(registration => {
        // Registro exitoso
        console.log('Service Worker registrado con éxito:', registration.scope);
      })
      .catch(error => {
        // Fallo en el registro
        console.log('Fallo en el registro del Service Worker:', error);
      });
  });
}
// --- Fin Código para registrar el Service Worker ---


// Render the App component, wrapped with BrowserRouter
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);