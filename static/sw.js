// Local: static/sw.js
console.log('[ServiceWorker] V7.Debug - A carregar script.');

const CACHE_NAME = 'anotacoes-cache-v7.debug1'; // Mude a versão para forçar atualização
const FILES_TO_CACHE = [
  '/', // A página principal (index.html servido pela rota raiz do Flask)
  '/static/css/style.css',
  '/static/js/script.js',
  // Adicione os ícones que você REALMENTE tem na pasta static/icons/
  // Verifique se estes ficheiros existem!
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png',
  // '/static/icons/icon-144x144.png', // Adicione se existir, senão remova
  // Não vamos tentar cachear CDNs por agora para simplificar
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Evento: install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Cache aberto. Cacheando ficheiros principais:', FILES_TO_CACHE);
      return cache.addAll(FILES_TO_CACHE)
        .then(() => console.log('[ServiceWorker] Ficheiros principais cacheados com sucesso.'))
        .catch(error => {
          console.error('[ServiceWorker] Falha ao cachear um ou mais ficheiros durante a instalação:', error);
          // Logar quais ficheiros falharam pode ser útil
          FILES_TO_CACHE.forEach(fileUrl => {
            fetch(fileUrl).catch(err => console.error(`Falha ao buscar ${fileUrl} individualmente:`, err));
          });
        });
    }).catch(error => {
      console.error('[ServiceWorker] Falha ao abrir cache durante a instalação:', error);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Evento: activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removendo cache antigo:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      console.log('[ServiceWorker] Caches antigos removidos.');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // console.log('[ServiceWorker] Evento: fetch para:', url.href);

  // Apenas para pedidos GET
  if (event.request.method !== 'GET') {
    // console.log('[ServiceWorker] Ignorando pedido não-GET:', event.request.method, url.pathname);
    return;
  }

  // Estratégia: Cache first, caindo para network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // console.log('[ServiceWorker] Servindo do cache:', url.pathname);
        return cachedResponse;
      }

      // console.log('[ServiceWorker] Não encontrado no cache, buscando na rede:', url.pathname);
      return fetch(event.request).then((networkResponse) => {
        // console.log('[ServiceWorker] Resposta da rede para:', url.pathname, networkResponse.status);
        // Opcional: Adicionar ao cache se for um dos nossos ficheiros principais
        // e o pedido for bem-sucedido.
        // Cuidado para não cachear tudo indiscriminadamente.
        if (networkResponse && networkResponse.status === 200) {
            // Verifica se o URL do pedido está na nossa lista de cache ou é um recurso que queremos cachear dinamicamente
            // Por exemplo, se o pathname do URL corresponder a algo que sabemos que é seguro cachear.
            // Para simplificar, não vamos adicionar ao cache dinamicamente aqui,
            // pois já fazemos isso no evento 'install' para os ficheiros principais.
        }
        return networkResponse;
      }).catch(error => {
        console.error('[ServiceWorker] Erro de fetch na rede para:', url.pathname, error);
        // Aqui você poderia retornar uma página offline padrão se for um pedido de navegação
        // if (event.request.mode === 'navigate') {
        //   return caches.match('/offline.html'); // Você precisaria criar e cachear 'offline.html'
        // }
        // Para outros tipos de erro, pode ser melhor deixar o navegador lidar (que é o que acontece se não retornarmos nada)
        // ou retornar uma resposta de erro genérica.
        // return new Response("Erro de rede", { status: 503, statusText: "Network Error" });
      });
    })
  );
});


