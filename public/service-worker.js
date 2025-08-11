// Service worker for caching assets and providing offline experience
const CACHE_NAME = 'groceryhub-cache-v1';
const OFFLINE_PAGE = 'offline.html';

// Assets to cache on install (critical files for offline functionality)
const PRECACHE_ASSETS = [
  './', // Cache the root URL
  './index.html',
  './offline.html',
  './favicon.ico',
  './store_icon.png',
  './manifest.json'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  
  // Precache critical assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      // Take control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('file://')) {
    return;
  }
  
  // Handle the fetch event
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a success response
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response to cache it and return it
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
              console.log('Cached new resource:', event.request.url);
            });
          
          return response;
        })
        .catch((error) => {
          console.error('Fetch failed:', error);
          
          // If network fetch fails for a navigation request, return the offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_PAGE).then(response => {
              return response || caches.match('index.html');
            });
          }
          
          // For non-navigation requests, return a simple error response
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});