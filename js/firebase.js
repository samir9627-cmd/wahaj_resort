/* ═══════════════════════════════════════════════════════
   استراحة وهج - Firebase Configuration
   الاتصال بقاعدة البيانات السحابية
   ═══════════════════════════════════════════════════════ */

// ─── إعدادات Firebase ───
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAqWXIb_uq1iEnuPsiV8bObeBIeWUxU7UE",
    authDomain: "wahaj-resort.firebaseapp.com",
    projectId: "wahaj-resort",
    storageBucket: "wahaj-resort.firebasestorage.app",
    messagingSenderId: "811417967302",
    appId: "1:811417967302:web:96459b1ab684f15e4fd5c7"
};

// ─── تحميل Firebase SDK ───
(function() {
    'use strict';
    
    // تحميل SDK من CDN (بدون npm)
    var scripts = [
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage-compat.js'
    ];
    
    var loaded = 0;
    
    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = function() {
            loaded++;
            if (loaded === scripts.length) {
                initFirebase();
            }
        };
        document.head.appendChild(script);
    });
    
    function initFirebase() {
        try {
            // تهيئة Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            
            // المراجع العامة
            window.db = firebase.firestore();
            window.storage = firebase.storage();
            window.firebaseReady = true;
            
            console.log('✅ Firebase متصل:', FIREBASE_CONFIG.projectId);
            
            // اختبار الاتصال
            window.db.collection('_test').doc('ping').set({
                timestamp: new Date().toISOString()
            }).then(function() {
                console.log('✅ Firestore جاهز');
            }).catch(function(err) {
                console.warn('⚠️ تحذير Firestore:', err.message);
            });
            
        } catch (error) {
            console.error('❌ خطأ Firebase:', error);
            window.firebaseReady = false;
        }
    }
})();
