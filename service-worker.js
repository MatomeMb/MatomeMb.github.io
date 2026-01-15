/* Minimal service worker for a static portfolio.
   Goals: faster repeat visits + basic offline resilience.
   No analytics, no logging. */

const CACHE_NAME = 'mm-portfolio-v1';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/privacy.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/profile.jpg',
  '/og-image.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/.well-known/security.txt',
  '/chatbot/chatbot.css',
  '/chatbot/chatbot.js',
  '/chatbot/chatbot_knowledge.json',
  '/case-studies/ocr-document-automation.html',
  '/case-studies/rag-assistant.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === CACHE_NAME ? Promise.resolve() : caches.delete(k))));
      await self.clients.claim();
    })()
  );
});

function isHtmlRequest(req) {
  return req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  // HTML: network-first (fresh content), fallback to cache/offline page.
  if (isHtmlRequest(req)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (_) {
          const cached = await caches.match(req);
          return cached || (await caches.match('/index.html')) || (await caches.match('/404.html'));
        }
      })()
    );
    return;
  }

  // Assets: cache-first, update in background.
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) {
        event.waitUntil(
          (async () => {
            try {
              const fresh = await fetch(req);
              const cache = await caches.open(CACHE_NAME);
              cache.put(req, fresh.clone());
            } catch (_) {}
          })()
        );
        return cached;
      }

      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (_) {
        return new Response('', { status: 504, statusText: 'Offline' });
      }
    })()
  );
});
