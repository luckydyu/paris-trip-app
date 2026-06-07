const CACHE_NAME = 'paris-family-cache-v10';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // 실시간성이 유지되어야 하는 날씨, 환율, 파이어베이스 동기화 통신은 캐시 무시하고 직접 우회 호출
  if (event.request.url.includes('api.open-meteo.com') || 
      event.request.url.includes('api.frankfurter.app') || 
      event.request.url.includes('api.frankfurter.dev') || 
      event.request.url.includes('open.er-api.com') || 
      event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
