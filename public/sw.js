const CACHE_NAME = "aetheria-v0.1.0-text";
const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const APP_SHELL = `${scopePath}/`;
const PRECACHE = [
  APP_SHELL,
  `${scopePath}/manifest.webmanifest`,
  `${scopePath}/icons/aetheria-mark.svg`,
  `${scopePath}/icons/icon-192.png`,
  `${scopePath}/icons/icon-512.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.includes("/_next/static/") || request.destination === "font") {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        return response;
      })),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(APP_SHELL, response.clone()));
          return response;
        })
        .catch(() => caches.match(APP_SHELL)),
    );
  }
});
