import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css'; // Esto se carga primero (estilos base/reset)
import './App.css';   // <-- ¡AÑADE ESTA LÍNEA AQUÍ! (estilos de tu aplicación principal)
import { BrowserRouter } from 'react-router-dom';

// Get the root element from your HTML (usually index.html)
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// --- CÓDIGO DE SERVICE WORKER ELIMINADO/COMENTADO ---
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then(registration => {
//         console.log('Service Worker registrado con éxito:', registration.scope);
//       })
//       .catch(error => {
//         console.log('Fallo en el registro del Service Worker:', error);
//       });
//   });
// }
// --- FIN DEL CÓDIGO DE SERVICE WORKER ---


// Render the App component, wrapped with BrowserRouter
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);