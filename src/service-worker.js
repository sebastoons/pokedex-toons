// src/service-worker.js

const CACHE_NAME = 'my-react-app-cache-v1';
const OFFLINE_URL = '/offline.html'; // Crea un archivo offline.html simple en tu carpeta public

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker caching offline page');
        // Cachea la página offline durante la instalación
        return cache.add(OFFLINE_URL);
      })
  );
  // Fuerza la activación del nuevo Service Worker inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Elimina cachés antiguas si cambias el nombre de CACHE_NAME
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Toma control de las páginas abiertas después de la activación
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo intercepta peticiones GET para páginas de navegación
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Si el recurso está en caché, sírvelo
          if (response) {
            return response;
          }
          // Si no, intenta ir a la red
          return fetch(event.request)
            .catch(() => {
              // Si la red falla (offline), sirve la página offline
              console.log('Fetch failed, returning offline page');
              return caches.match(OFFLINE_URL);
            });
        })
    );
  }
  // Para otros tipos de peticiones (CSS, JS, imágenes, APIs), puedes añadir más lógica aquí.
  // Workbox facilita mucho estrategias de caché más avanzadas para estos recursos.
});