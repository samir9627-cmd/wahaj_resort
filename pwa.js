/* ═══════════════════════════════════════════════════════
   استراحة وهج - PWA Installer
   تثبيت التطبيق على الجوال
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    var deferredPrompt = null;
    var installBannerShown = false;
    
    // ═══ تسجيل Service Worker ═══
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/wahaj_resort/service-worker.js')
                .then(function(registration) {
                    console.log('✅ PWA: Service Worker مسجل');
                    console.log('📱 PWA: النطاق:', registration.scope);
                })
                .catch(function(error) {
                    console.warn('⚠️ PWA: فشل تسجيل Service Worker:', error);
                });
        });
    }
    
    // ═══ الاستماع لحدث التثبيت ═══
    window.addEventListener('beforeinstallprompt', function(e) {
        console.log('📱 PWA: يمكن التثبيت');
        
        e.preventDefault();
        deferredPrompt = e;
        
        if (!installBannerShown) {
            showInstallBanner();
        }
    });
    
    // ═══ عرض بانر التثبيت ═══
    function showInstallBanner() {
        // لا تعرض إذا كان مثبت مسبقاً
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('ℹ️ PWA: مثبت مسبقاً');
            return;
        }
        
        // انتظر 5 ثواني
        setTimeout(function() {
            var banner = document.createElement('div');
            banner.id = 'pwaInstallBanner';
            banner.style.cssText = 
                'position: fixed;' +
                'bottom: 90px;' +
                'left: 15px;' +
                'right: 15px;' +
                'background: linear-gradient(135deg, #0A1F44, #1A3A6B);' +
                'color: white;' +
                'padding: 15px;' +
                'border-radius: 16px;' +
                'box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);' +
                'z-index: 9999;' +
                'display: flex;' +
                'align-items: center;' +
                'gap: 12px;' +
                'animation: pwaSlideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);' +
                'border: 2px solid #D4AF37;' +
                'font-family: Cairo, sans-serif;' +
                'direction: rtl;' +
                'max-width: 500px;' +
                'margin: 0 auto;';
            
            banner.innerHTML = 
                '<div style="width: 50px; height: 50px; border-radius: 12px; background: #D4AF37; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0;">' +
                    '🏠' +
                '</div>' +
                '<div style="flex: 1;">' +
                    '<strong style="display: block; font-size: 0.95rem; margin-bottom: 3px; color: #D4AF37;">ثبّت تطبيق وهج</strong>' +
                    '<p style="font-size: 0.75rem; opacity: 0.9; margin: 0;">احجز مباشرة من جوالك</p>' +
                '</div>' +
                '<button id="pwaInstallBtn" style="background: linear-gradient(135deg, #D4AF37, #A88B2C); color: #0A1F44; border: none; padding: 10px 18px; border-radius: 50px; font-weight: 700; font-size: 0.85rem; cursor: pointer; font-family: Cairo, sans-serif; white-space: nowrap;">' +
                    'تثبيت' +
                '</button>' +
                '<button id="pwaDismissBtn" style="background: transparent; color: white; border: none; font-size: 1.3rem; cursor: pointer; opacity: 0.6; padding: 5px;">' +
                    '✕' +
                '</button>';
            
            document.body.appendChild(banner);
            
            // CSS للأنيميشن
            var style = document.createElement('style');
            style.textContent = 
                '@keyframes pwaSlideUp {' +
                '  from { transform: translateY(150%); opacity: 0; }' +
                '  to { transform: translateY(0); opacity: 1; }' +
                '}' +
                '@keyframes pwaSlideDown {' +
                '  from { transform: translateY(0); opacity: 1; }' +
                '  to { transform: translateY(150%); opacity: 0; }' +
                '}';
            document.head.appendChild(style);
            
            installBannerShown = true;
            
            // زر التثبيت
            var installBtn = document.getElementById('pwaInstallBtn');
            if (installBtn) {
                installBtn.onclick = function() {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        
                        deferredPrompt.userChoice.then(function(choiceResult) {
                            if (choiceResult.outcome === 'accepted') {
                                console.log('✅ PWA: تم التثبيت');
                                showPwaToast('🎉 تم تثبيت التطبيق!', 'success');
                            } else {
                                console.log('❌ PWA: تم الرفض');
                            }
                            deferredPrompt = null;
                            banner.remove();
                        });
                    }
                };
            }
            
            // زر الإغلاق
            var dismissBtn = document.getElementById('pwaDismissBtn');
            if (dismissBtn) {
                dismissBtn.onclick = function() {
                    banner.style.animation = 'pwaSlideDown 0.3s ease forwards';
                    setTimeout(function() {
                        banner.remove();
                    }, 300);
                };
            }
            
            // إخفاء تلقائي بعد 20 ثانية
            setTimeout(function() {
                var b = document.getElementById('pwaInstallBanner');
                if (b) {
                    b.style.animation = 'pwaSlideDown 0.3s ease forwards';
                    setTimeout(function() { b.remove(); }, 300);
                }
            }, 20000);
        }, 5000);
    }
    
    // ═══ Toast ═══
    function showPwaToast(msg, type) {
        var colors = { success: '#28A745', error: '#DC3545', info: '#0A1F44' };
        var t = document.createElement('div');
        t.style.cssText = 
            'position:fixed;top:90px;left:50%;transform:translateX(-50%) translateY(-100px);' +
            'background:' + (colors[type] || colors.info) + ';color:white;padding:14px 28px;' +
            'border-radius:50px;font-weight:600;font-size:0.85rem;' +
            'box-shadow:0 10px 30px rgba(0,0,0,0.3);z-index:10000;' +
            'transition:transform 0.3s;font-family:Cairo,sans-serif;max-width:90%;text-align:center;';
        t.textContent = msg;
        document.body.appendChild(t);
        
        requestAnimationFrame(function() {
            t.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        setTimeout(function() {
            t.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(function() { t.remove(); }, 300);
        }, 2500);
    }
    
    // ═══ إخفاء البانر بعد التثبيت ═══
    window.addEventListener('appinstalled', function() {
        console.log('🎉 PWA: تم التثبيت');
        var banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.remove();
    });
    
    // ═══ دالة تثبيت يدوية ═══
    window.installPWA = function() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    showPwaToast('🎉 تم التثبيت', 'success');
                }
                deferredPrompt = null;
            });
        } else {
            showPwaToast('📱 افتح قائمة المتصفح → أضف للشاشة الرئيسية', 'info');
        }
    };
    
    console.log('✅ PWA Installer جاهز');
    
})();
