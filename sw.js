const CACHE_NAME = 'debt-tracker-v2'; // Changed v1 to v2 to force update
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png', // <--- CHANGED THIS
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/lucide-react@0.294.0?bundle'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the new service worker to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Takes control of the page immediately
});

// This block is MANDATORY for the "Install" button to appear
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});