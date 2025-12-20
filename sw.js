const CACHE_NAME = 'debt-tracker-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json'
];

// Install event - Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Cache First strategy for CDNs, Stale-While-Revalidate for local
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy for External CDNs (Tailwind, React, Lucide, Fonts, Icons)
  // We want to cache these aggressively so the app works offline
  if (url.origin.includes('cdn.tailwindcss.com') || 
      url.origin.includes('unpkg.com') || 
      url.origin.includes('esm.sh') ||
      url.origin.includes('fonts.googleapis.com') ||
      url.origin.includes('fonts.gstatic.com') ||
      url.origin.includes('cdn-icons-png.flaticon.com')) {
      
     event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 && response.type !== 'opaque') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
    return;
  }

  // Strategy for local files (index.html): Stale-While-Revalidate
  // This ensures the user sees the cached version immediately but updates in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
          // If fetch fails (offline), return cached response if available
          return cachedResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});