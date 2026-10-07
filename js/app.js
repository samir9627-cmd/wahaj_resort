/* ═══════════════════════════════════════════════════════
   استراحة وهج - سكربت التطبيق الاحترافي
   Splash Screen + Bottom Nav + Animations + Interactions
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';

    /* ═══════════════════════════════════════════════════
       🎬 SPLASH SCREEN
       ═══════════════════════════════════════════════════ */
    function initSplash() {
        const splash = document.querySelector('.splash-screen');
        if (!splash) return;

        // إخفاء الـ splash بعد التحميل
        window.addEventListener('load', () => {
            setTimeout(() => {
                splash.classList.add('hide');
                setTimeout(() => {
                    splash.style.display = 'none';
                }, 600);
            }, 1800);
        });

        // في حال تأخر التحميل
        setTimeout(() => {
            if (splash && !splash.classList.contains('hide')) {
                splash.classList.add('hide');
                setTimeout(() => {
                    splash.style.display = 'none';
                }, 600);
            }
        }, 3500);
    }

    /* ═══════════════════════════════════════════════════
       📱 BOTTOM NAVIGATION
       ═══════════════════════════════════════════════════ */
    function initBottomNav() {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        if (!navItems.length) return;

        // تحديد الصفحة الحالية
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navItems.forEach(item => {
            const href = item.getAttribute('href') || item.dataset.page;
            if (href && currentPage.includes(href.replace('.html', ''))) {
                item.classList.add('active');
            }
            
            // تأثير الاهتزاز عند اللمس
            item.addEventListener('touchstart', function() {
                if (navigator.vibrate) navigator.vibrate(10);
            });
        });
    }

    /* ═══════════════════════════════════════════════════
       🧭 HEADER SCROLL EFFECT
       ═══════════════════════════════════════════════════ */
    function initHeaderScroll() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    /* ═══════════════════════════════════════════════════
       💫 SCROLL REVEAL ANIMATIONS
       ═══════════════════════════════════════════════════ */
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }

    /* ═══════════════════════════════════════════════════
       🔥 STICKY BOOKING CTA
       ═══════════════════════════════════════════════════ */
    function initStickyBooking() {
        const sticky = document.querySelector('.sticky-booking');
        if (!sticky) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            // يظهر بعد التمرير 300px، ويختفي في آخر الصفحة
            if (currentScroll > 300 && (currentScroll + windowHeight) < docHeight - 200) {
                sticky.classList.add('show');
            } else {
                sticky.classList.remove('show');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    /* ═══════════════════════════════════════════════════
       📸 GALLERY SCROLL (Snap)
       ═══════════════════════════════════════════════════ */
    function initGalleryScroll() {
        const galleries = document.querySelectorAll('.gallery-scroll, .testimonials-scroll');
        
        galleries.forEach(gallery => {
            gallery.addEventListener('touchstart', () => {
                gallery.style.cursor = 'grabbing';
            }, { passive: true });
            
            gallery.addEventListener('touchend', () => {
                gallery.style.cursor = '';
            }, { passive: true });
        });
    }

    /* ═══════════════════════════════════════════════════
       🎯 SMOOTH PAGE TRANSITIONS
       ═══════════════════════════════════════════════════ */
    function initPageTransitions() {
        document.querySelectorAll('a[href$=".html"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href || href.startsWith('http') || href.startsWith('#')) return;
                
                // تأثير الخروج
                document.body.style.opacity = '0.5';
                document.body.style.transition = 'opacity 0.2s ease';
                
                // الرابط يفتح طبيعي
            });
        });
        
        // إعادة الظهور عند الرجوع
        window.addEventListener('pageshow', () => {
            document.body.style.opacity = '1';
        });
    }

    /* ═══════════════════════════════════════════════════
       🖼️ LAZY LOADING IMAGES
       ═══════════════════════════════════════════════════ */
    function initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // المتصفح يدعم lazy loading
            document.querySelectorAll('img').forEach(img => {
                if (!img.loading) img.loading = 'lazy';
            });
        } else {
            // fallback للمتصفحات القديمة
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        imageObserver.unobserve(img);
                    }
                });
            });
            images.forEach(img => imageObserver.observe(img));
        }
    }

    /* ═══════════════════════════════════════════════════
       👆 TAP FEEDBACK (Haptic)
       ═══════════════════════════════════════════════════ */
    function initTapFeedback() {
        document.querySelectorAll('.app-card, .pricing-card-app, .bottom-nav-item, .hero-cta-app, .sticky-booking').forEach(el => {
            el.addEventListener('touchstart', () => {
                if (navigator.vibrate) navigator.vibrate(8);
            }, { passive: true });
        });
    }

    /* ═══════════════════════════════════════════════════
       ⏰ CURRENT YEAR IN FOOTER
       ═══════════════════════════════════════════════════ */
    function initFooterYear() {
        const yearEls = document.querySelectorAll('.current-year');
        const year = new Date().getFullYear();
        yearEls.forEach(el => el.textContent = year);
    }

    /* ═══════════════════════════════════════════════════
       🌐 NETWORK STATUS
       ═══════════════════════════════════════════════════ */
    function initNetworkStatus() {
        window.addEventListener('offline', () => {
            showToast('⚠️ لا يوجد اتصال بالإنترنت', 'warning');
        });
        
        window.addEventListener('online', () => {
            showToast('✅ تم استعادة الاتصال', 'success');
        });
    }

    /* ═══════════════════════════════════════════════════
       🎨 TOAST NOTIFICATION
       ═══════════════════════════════════════════════════ */
    function showToast(message, type = 'info') {
        const colors = {
            success: '#28A745',
            error: '#DC3545',
            warning: '#FFC107',
            info: '#0A1F44'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 90px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: ${colors[type] || colors.info};
            color: white;
            padding: 14px 28px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            font-family: 'Cairo', sans-serif;
            max-width: 90%;
            text-align: center;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // إظهار
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        // إخفاء
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // تصدير للاستخدام العام
    window.showToast = showToast;

    /* ═══════════════════════════════════════════════════
       📊 PRELOAD IMAGES
       ═══════════════════════════════════════════════════ */
    function preloadImages() {
        const imagesToPreload = [
            'images/gallery/pool-night.jpg',
            'images/gallery/majlis.jpg'
        ];
        
        imagesToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    /* ═══════════════════════════════════════════════════
       🚀 INIT
       ═══════════════════════════════════════════════════ */
    function init() {
        initSplash();
        initBottomNav();
        initHeaderScroll();
        initScrollReveal();
        initStickyBooking();
        initGalleryScroll();
        initPageTransitions();
        initLazyLoading();
        initTapFeedback();
        initFooterYear();
        initNetworkStatus();
        
        // بعد التحميل
        window.addEventListener('load', () => {
            preloadImages();
        });
        
        console.log('%c🌟 استراحة وهج', 
            'color: #D4AF37; font-size: 20px; font-weight: bold;');
        console.log('%c✅ التطبيق جاهز', 
            'color: #28A745; font-size: 14px;');
    }

    // بدء عند جاهزية DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
