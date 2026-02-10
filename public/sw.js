const CACHE_NAME = 'celavi-v1';
const urlsToCache = [
  '/',
  '/login',
  '/dashboard',
  '/loja/celavi',
  '/logo-cela-vi-beira.png',
  '/icon-192.png',
  '/icon-512.png',
  // CSS e JS serão automaticamente incluídos pelo Next.js
];

// Instalar o Service Worker
self.addEventListener('install', function(event) {
  console.log('SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('SW: Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativar o Service Worker
self.addEventListener('activate', function(event) {
  console.log('SW: Ativando...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Removendo cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - retornar resposta do cache
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Verificar se temos uma resposta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANTE: Clone da resposta. Um stream só pode ser consumido uma vez.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      }
    )
  );
});

// Lidar com instalação do app
self.addEventListener('beforeinstallprompt', function(event) {
  console.log('SW: beforeinstallprompt disparado');
  event.preventDefault();
  // Salvar o evento para disparar mais tarde
  self.deferredPrompt = event;
  
  // Notificar o app principal que o prompt está disponível
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage({
        msg: 'A2HS_AVAILABLE'
      });
    });
  });
});

// Lidar com instalação bem-sucedida
self.addEventListener('appinstalled', function(event) {
  console.log('SW: App instalado com sucesso');
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage({
        msg: 'A2HS_INSTALLED'
      });
    });
  });
});

