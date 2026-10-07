/* ═══════════════════════════════════════════════════════
   استراحة وهج - Firebase Configuration
   المشروع: wahaj-resort-3f755
   ═══════════════════════════════════════════════════════ */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDPibPL5jKOK9QhX44DbIjck0VTtDpMPl8",
    authDomain: "wahaj-resort-3f755.firebaseapp.com",
    projectId: "wahaj-resort-3f755",
    storageBucket: "wahaj-resort-3f755.firebasestorage.app",
    messagingSenderId: "563430262568",
    appId: "1:563430262568:web:01d5fe3902c848c3d1b21d"
};

(function() {
    'use strict';
    
    // ─── تحميل SDK ───
    var scripts = [
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js'
    ];
    
    var loaded = 0;
    
    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = function() {
            loaded++;
            if (loaded === scripts.length) initFirebase();
        };
        script.onerror = function() {
            console.warn('⚠️ فشل تحميل SDK:', src);
            loaded++;
            if (loaded === scripts.length) initFirebase();
        };
        document.head.appendChild(script);
    });
    
    function initFirebase() {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase SDK غير متاح');
                window.firebaseReady = false;
                return;
            }
            
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            
            window.db = firebase.firestore();
            window.firebaseReady = true;
            
            console.log('✅ Firebase متصل:', FIREBASE_CONFIG.projectId);
            
            // اختبار سريع
            window.db.collection('_health').doc('ping').set({
                timestamp: new Date().toISOString(),
                status: 'ok'
            }).then(function() {
                console.log('✅ Firestore يعمل');
            }).catch(function(err) {
                console.warn('⚠️ Firestore:', err.message);
            });
            
        } catch (error) {
            console.error('❌ خطأ Firebase:', error);
            window.firebaseReady = false;
        }
    }
    
    setTimeout(function() {
        if (!window.firebaseReady) {
            console.warn('⚠️ Firebase لم يتصل بعد 8 ثواني');
        }
    }, 8000);
})();
