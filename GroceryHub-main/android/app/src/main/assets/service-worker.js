// Service worker for caching assets
const CACHE_NAME = 'groceryhub-cache-v1';

// Cache all assets on install
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting(); // Ensure new service worker activates immediately
  
  // We don't need to pre-cache anything as we'll cache on first use
});

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
      return self.clients.claim(); // Take control of all clients
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('file://')) {
    return;
  }
  
  // Handle the fetch event
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response
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
          // If network fetch fails, try to return a cached index.html as fallback
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});