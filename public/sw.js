const CACHE_NAME = 'fuwari-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/about/',
  '/archive/',
  '/favicon/tx.jpg',
  '/favicon/alist.png',
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 拦截请求并使用缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求和外部请求
  if (request.method !== 'GET' || !url.pathname.startsWith('/')) {
    return;
  }

  // 缓存优先策略
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // 返回缓存并在后台更新
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone());
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // 没有缓存，从网络获取
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse.ok) {
            throw new Error('Network response was not ok');
          }
          
          // 缓存成功的响应
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return networkResponse;
        })
        .catch(() => {
          // 网络失败，返回离线页面
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          throw new Error('Network request failed');
        });
    })
  );
});
