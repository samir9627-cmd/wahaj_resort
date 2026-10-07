/* ═══════════════════════════════════════════════════════
   استراحة وهج - App Script
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    console.log('🚀 App loading...');
    
    // ─── إخفاء Splash Screen (مضمون) ───
    function hideSplash() {
        const splash = document.querySelector('.splash-screen');
        if (!splash) return;
        
        setTimeout(function() {
            splash.classList.add('hide');
            setTimeout(function() {
                if (splash.parentNode) {
                    splash.style.display = 'none';
                }
            }, 600);
        }, 1500);
    }
    
    // ─── إخفاء مضمون حتى لو صار خطأ ───
    window.addEventListener('load', hideSplash);
    setTimeout(hideSplash, 2500); // احتياطي
    
    // ─── Header Scroll ───
    function initHeaderScroll() {
        const header = document.querySelector('.app-header');
        if (!header) return;
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }
    
    // ─── Scroll Reveal ───
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            reveals.forEach(function(el) { observer.observe(el); });
        } else {
            // fallback
            reveals.forEach(function(el) { el.classList.add('visible'); });
        }
    }
    
    // ─── Sticky Booking ───
    function initStickyBooking() {
        const sticky = document.querySelector('.sticky-booking');
        if (!sticky) return;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            
            if (currentScroll > 300 && (currentScroll + windowHeight) < docHeight - 200) {
                sticky.classList.add('show');
            } else {
                sticky.classList.remove('show');
            }
        }, { passive: true });
    }
    
    // ─── Bottom Nav ───
    function initBottomNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        document.querySelectorAll('.bottom-nav-item').forEach(function(item) {
            const href = item.getAttribute('href');
            if (!href) return;
            
            item.classList.remove('active');
            if (currentPage === href || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                item.classList.add('active');
            }
        });
    }
    
    // ─── Footer Year ───
    function initFooterYear() {
        const year = new Date().getFullYear();
        document.querySelectorAll('.current-year').forEach(function(el) {
            el.textContent = year;
        });
    }
    
    // ─── Lazy Loading ───
    function initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img').forEach(function(img) {
                if (!img.loading) img.loading = 'lazy';
            });
        }
    }
    
    // ─── Init ───
    function init() {
        initHeaderScroll();
        initScrollReveal();
        initStickyBooking();
        initBottomNav();
        initFooterYear();
        initLazyLoading();
        console.log('✅ App ready');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
