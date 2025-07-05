const CACHE_NAME = 'groceryhub-v1';
const isDevMode = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const isCapacitor = self.location.href.includes('capacitor://') || 
                   self.location.href.includes('http://localhost') ||
                   navigator.userAgent.includes('capacitor');

// Files to precache (add your app's core files here)
const precacheFiles = [
  '/',
  '/index.html',
  '/manifest.json',
  '/react-init.js'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event processing');
  
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(precacheFiles);
      })
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event processing');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Skip caching in development mode or Capacitor
  if (isDevMode || isCapacitor) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip caching for API requests, websockets, and HMR
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('socket.io') ||
    event.request.url.includes('hot-update') ||
    event.request.url.includes('sockjs-node')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache and update in background
        event.waitUntil(
          fetch(event.request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              }
            })
            .catch(() => console.log('[Service Worker] Background fetch failed'))
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          console.log('[Service Worker] Fetch failed:', error);
          // You could return a fallback page here
          throw error;
        });
    })
  );
});