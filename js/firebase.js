/* ═══════════════════════════════════════════════════════
   استراحة وهج - Firebase Configuration
   الاتصال بقاعدة البيانات السحابية
   ═══════════════════════════════════════════════════════ */

// ─── إعدادات Firebase (المشروع الجديد) ───
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBj3Y_d0iwKkROBP6Y6xO49Gsqk0tsn8ow",
    authDomain: "wahaj-resort-22623.firebaseapp.com",
    projectId: "wahaj-resort-22623",
    storageBucket: "wahaj-resort-22623.firebasestorage.app",
    messagingSenderId: "474970844460",
    appId: "1:474970844460:web:c4db96820005d8d8d11089"
};

// ─── تحميل Firebase SDK ───
(function() {
    'use strict';
    
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
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            
            window.db = firebase.firestore();
            window.storage = firebase.storage();
            window.firebaseReady = true;
            
            console.log('✅ Firebase متصل:', FIREBASE_CONFIG.projectId);
            
            // اختبار الاتصال
            window.db.collection('_test').doc('ping').set({
                timestamp: new Date().toISOString(),
                status: 'active'
            }).then(function() {
                console.log('✅ Firestore جاهز');
            }).catch(function(err) {
                console.warn('⚠️ Firestore:', err.message);
            });
            
        } catch (error) {
            console.error('❌ Firebase:', error);
            window.firebaseReady = false;
        }
    }
})();
