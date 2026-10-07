/* ═══════════════════════════════════════════════════════
   استراحة وهج - Brand Manager v2
   يستخدم رابط GitHub المباشر لضمان ظهور الشعار
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    // رابط GitHub المباشر (يشتغل فوراً)
    const LOGO_PATHS = [
        'https://raw.githubusercontent.com/samir9627-cmd/wahaj_resort/main/images/logo.jpeg',
        'https://samir9627-cmd.github.io/wahaj_resort/images/logo.jpeg',
        'images/logo.jpeg'
    ];
    
    let workingPath = null;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('🔍 فحص مسارات الشعار...');
        testPath(0);
    }
    
    function testPath(index) {
        if (index >= LOGO_PATHS.length) {
            console.warn('⚠️ لم يُوجد الشعار');
            return;
        }
        
        const path = LOGO_PATHS[index];
        const img = new Image();
        
        img.onload = function() {
            console.log('✅ الشعار موجود في:', path);
            workingPath = path;
            replaceAllLogos();
        };
        
        img.onerror = function() {
            console.log('❌ غير موجود:', path);
            testPath(index + 1);
        };
        
        img.src = path;
    }
    
    function replaceAllLogos() {
        if (!workingPath) return;
        
        const selectors = [
            '.splash-logo',
            '.app-header-logo-svg',
            '.app-footer-logo',
            '.nav-logo-img',
            '.logo-3d-img'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (el.tagName === 'svg') {
                    const img = document.createElement('img');
                    img.src = workingPath;
                    img.alt = 'استراحة وهج';
                    img.className = el.className.baseVal || el.className;
                    img.style.objectFit = 'contain';
                    
                    if (el.classList.contains('splash-logo')) {
                        img.style.width = '140px';
                        img.style.height = '140px';
                        img.style.borderRadius = '50%';
                        img.style.filter = 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.6))';
                    } else if (el.classList.contains('app-header-logo-svg')) {
                        img.style.width = '42px';
                        img.style.height = '42px';
                        img.style.borderRadius = '50%';
                    } else if (el.classList.contains('app-footer-logo')) {
                        img.style.width = '50px';
                        img.style.height = '50px';
                        img.style.borderRadius = '50%';
                        img.style.opacity = '0.85';
                    }
                    
                    el.parentNode.replaceChild(img, el);
                } else if (el.tagName === 'IMG') {
                    // استبدال الصور المكسورة
                    el.onerror = function() {
                        this.src = workingPath;
                    };
                    if (el.src !== workingPath) {
                        el.src = workingPath;
                    }
                }
            });
        });
        
        // استبدال كل صور logo.jpeg المكسورة
        document.querySelectorAll('img[src*="logo"]').forEach(img => {
            img.src = workingPath;
        });
        
        console.log('🎨 تم تحديث الشعار من:', workingPath);
    }
    
})();
