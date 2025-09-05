// Service Worker for Portfolio Website
// Provides offline functionality and caching

const CACHE_NAME = 'portfolio-v1.1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Cache opened successfully');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('SW: Failed to cache resources:', error);
                throw error;
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Fetch from network with error handling
                return fetch(event.request)
                    .then(networkResponse => {
                        // Cache successful responses
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                })
                                .catch(error => {
                                    console.warn('SW: Failed to cache response:', error);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(error => {
                        console.warn('SW: Network request failed:', error);
                        // Return a fallback response for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        throw error;
                    });
            })
            .catch(error => {
                console.error('SW: Fetch event failed:', error);
                throw error;
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('SW: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .catch(error => {
                console.error('SW: Failed to clean up old caches:', error);
            })
    );
    
    // Take control of all pages immediately
    return self.clients.claim();
});
