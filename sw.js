const CACHE_NAME = 'prep-meeting-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js'
];

// تثبيت السيرفيس وركر وتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📱 [تطبيق الموبايل] جاري تثبيت كاش الملفات للعمل أوفلاين...');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('⚠️ خطأ جزئي في الكاش (غير حرج):', err);
      });
    })
  );
  self.skipWaiting();
});

// تفعيل وتنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('🧹 [تطبيق الموبايل] تنظيف الكاش القديم:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية Network First مع الرجوع للكاش أوفلاين
self.addEventListener('fetch', (event) => {
  // استثناء طلبات Firebase الخارجية لضمان المزامنة الحية دائماً
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('firebase')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // إذا كان الجهاز غير متصل بالإنترنت، جلب الصفحة من الكاش المحلي
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
