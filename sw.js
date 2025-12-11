// VGTools Pro - Service Worker
// Enables offline functionality and caching

const CACHE_NAME = 'vgtools-v1.0.2';
const OFFLINE_URL = '/404.html';

// Core files to cache immediately
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/shared/styles.css',
    '/favicon.svg',
    '/manifest.json',
    '/pattern.jpg',
    '/404.html'
];

// App directories to cache on first visit
const APP_ROUTES = [
    '/brickbuilder/',
    '/moodboards/',
    '/blobs/',
    '/jigsaws/',
    '/iconfactory/',
    '/qrcodes/',
    '/palettes/',
    '/notes/',
    '/locator/',
    '/signatures/',
    '/any2svg/',
    '/bgremover/',
    '/wordclouds/',
    '/sankey/',
    '/mockups/'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching core assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Skip large WASM/ONNX files (let them load normally)
    if (event.request.url.includes('.wasm') ||
        event.request.url.includes('.onnx')) {
        return;
    }

    event.respondWith(
        // Try network first
        fetch(event.request)
            .then((response) => {
                // Clone and cache successful responses
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If HTML request, show offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
