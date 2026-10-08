/* ═══════════════════════════════════════════════════════
   استراحة وهج - Service Worker
   يجعل التطبيق يعمل بدون إنترنت
   ═══════════════════════════════════════════════════════ */

var CACHE_NAME = 'wahaj-v1.0.0';
var urlsToCache = [
    '/wahaj_resort/',
    '/wahaj_resort/index.html',
    '/wahaj_resort/booking.html',
    '/wahaj_resort/details.html',
    '/wahaj_resort/policies.html',
    '/wahaj_resort/track.html',
    '/wahaj_resort/confirmation.html',
    '/wahaj_resort/css/app.css',
    '/wahaj_resort/css/admin-upgrades.css',
    '/wahaj_resort/js/firebase.js',
    '/wahaj_resort/js/firebase-helper.js',
    '/wahaj_resort/images/logo.jpeg'
];

// تثبيت
self.addEventListener('install', function(event) {
    console.log('🔧 SW: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('✅ SW: Caching files');
            return cache.addAll(urlsToCache.map(function(url) {
                return new Request(url, { cache: 'reload' });
            })).catch(function(err) {
                console.warn('⚠️ SW: بعض الملفات لم تُخزن', err);
            });
        })
    );
    
    self.skipWaiting();
});

// تفعيل
self.addEventListener('activate', function(event) {
    console.log('🚀 SW: Activating...');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

// اعتراض الطلبات
self.addEventListener('fetch', function(event) {
    var url = event.request.url;
    
    // تجاهل Firebase (المزامنة السحابية)
    if (url.indexOf('firestore.googleapis.com') !== -1 ||
        url.indexOf('firebase') !== -1 ||
        url.indexOf('googleapis.com') !== -1 ||
        url.indexOf('wa.me') !== -1) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                // جلب نسخة جديدة في الخلفية
                fetch(event.request).then(function(newResponse) {
                    if (newResponse && newResponse.status === 200) {
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, newResponse.clone());
                        });
                    }
                }).catch(function() {});
                
                return response;
            }
            
            // جلب من الشبكة
            return fetch(event.request).then(function(response) {
                if (response && response.status === 200 && event.request.method === 'GET') {
                    var responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            }).catch(function() {
                // إذا فشل الإنترنت
                if (event.request.mode === 'navigate') {
                    return caches.match('/wahaj_resort/index.html');
                }
            });
        })
    );
});

// إشعارات Push
self.addEventListener('push', function(event) {
    var data = event.data ? event.data.json() : {};
    var title = data.title || 'استراحة وهج';
    var options = {
        body: data.body || 'لديك إشعار جديد',
        icon: '/wahaj_resort/images/logo.jpeg',
        badge: '/wahaj_resort/images/logo.jpeg',
        vibrate: [200, 100, 200],
        dir: 'rtl',
        lang: 'ar'
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// الضغط على الإشعار
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/wahaj_resort/')
    );
});

console.log('✅ Service Worker loaded');
