/* ═══════════════════════════════════════════════════════
   استراحة وهج - Brand Manager
   يحدّث الشعار تلقائياً في كل الصفحات
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    // مسار الشعار (jpeg حسب ملفك)
    const LOGO_PATH = 'images/logo.jpeg';
    
    // انتظر تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // اختبار وجود الصورة
        const testImg = new Image();
        testImg.onload = function() {
            console.log('✅ الشعار محمّل:', LOGO_PATH);
            replaceAllLogos();
        };
        testImg.onerror = function() {
            console.warn('⚠️ الشعار غير موجود:', LOGO_PATH);
        };
        testImg.src = LOGO_PATH;
    }
    
    function replaceAllLogos() {
        // استبدال كل SVG بالصورة
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
                    img.src = LOGO_PATH;
                    img.alt = 'استراحة وهج';
                    img.className = el.className.baseVal || el.className;
                    img.style.objectFit = 'contain';
                    img.style.borderRadius = '50%';
                    
                    // الحفاظ على الأبعاد
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0) {
                        img.style.width = rect.width + 'px';
                        img.style.height = rect.height + 'px';
                    }
                    
                    el.parentNode.replaceChild(img, el);
                }
            });
        });
        
        console.log('🎨 تم تحديث الشعار في الصفحة');
    }
    
})();
