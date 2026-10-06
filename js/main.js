/* ═══════════════════════════════════════════════════════
   استراحة وهج - السكربت الرئيسي للصفحة الرئيسية
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    
    /* ─────────────────────────────────────────────
       1️⃣ شريط التنقل - Navbar
       ───────────────────────────────────────────── */
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    // تغيير شكل الشريط عند التمرير
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // قائمة الجوال
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // تغيير الأيقونة
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // إغلاق القائمة عند الضغط على رابط
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
    
    
    /* ─────────────────────────────────────────────
       2️⃣ الشعار 3D - يتبع الماوس
       ───────────────────────────────────────────── */
    const logo3d = document.getElementById('logo3d');
    
    if (logo3d) {
        const logoWrapper = logo3d.parentElement;
        
        logoWrapper.addEventListener('mousemove', function(e) {
            const rect = logoWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = ((x - centerX) / centerX) * 15;
            const rotateX = ((centerY - y) / centerY) * 15;
            
            logo3d.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        logoWrapper.addEventListener('mouseleave', function() {
            logo3d.style.transform = 'rotateX(0) rotateY(0) scale(1)';
        });
        
        // تأثير اللمس للجوال
        logoWrapper.addEventListener('touchmove', function(e) {
            const touch = e.touches[0];
            const rect = logoWrapper.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = ((x - centerX) / centerX) * 15;
            const rotateX = ((centerY - y) / centerY) * 15;
            
            logo3d.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        logoWrapper.addEventListener('touchend', function() {
            logo3d.style.transform = 'rotateX(0) rotateY(0) scale(1)';
        });
    }
    
    
    /* ─────────────────────────────────────────────
       3️⃣ السلايدر الرئيسي - Hero Slider
       ───────────────────────────────────────────── */
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('.hero-dots .dot');
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
        // إخفاء كل السلايدات
        heroSlides.forEach(slide => slide.classList.remove('active'));
        heroDots.forEach(dot => dot.classList.remove('active'));
        
        // إظهار السلايد المطلوب
        if (heroSlides[index]) {
            heroSlides[index].classList.add('active');
        }
        if (heroDots[index]) {
            heroDots[index].classList.add('active');
        }
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % heroSlides.length;
        showSlide(next);
    }
    
    function startSlider() {
        if (heroSlides.length > 1) {
            slideInterval = setInterval(nextSlide, 5000);
        }
    }
    
    function stopSlider() {
        clearInterval(slideInterval);
    }
    
    // بدء السلايدر
    if (heroSlides.length > 0) {
        startSlider();
        
        // الضغط على النقاط
        heroDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                stopSlider();
                showSlide(index);
                startSlider();
            });
        });
        
        // إيقاف عند تمرير الماوس
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', stopSlider);
            heroSection.addEventListener('mouseleave', startSlider);
        }
    }
    
    
    /* ─────────────────────────────────────────────
       4️⃣ Lightbox - تكبير الصور
       ───────────────────────────────────────────── */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (lightbox && galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const imgSrc = this.dataset.img || this.querySelector('img').src;
                lightboxImg.src = imgSrc;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        
        // إغلاق Lightbox
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        lightboxClose.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // ESC للإغلاق
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
    
    
    /* ─────────────────────────────────────────────
       5️⃣ زر العودة للأعلى - Scroll to Top
       ───────────────────────────────────────────── */
    const scrollTopBtn = document.getElementById('scrollTop');
    
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    
    /* ─────────────────────────────────────────────
       6️⃣ تأثير ظهور العناصر عند التمرير
       ───────────────────────────────────────────── */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // تطبيق التأثير على الأقسام
    const sectionsToAnimate = document.querySelectorAll(
        '.feature-card, .pricing-card, .amenity-item, .testimonial-card, .gallery-item'
    );
    
    sectionsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    
    /* ─────────────────────────────────────────────
       7️⃣ تحميل بيانات الأسعار من config.js
       ───────────────────────────────────────────── */
    if (typeof WAHAJ_CONFIG !== 'undefined') {
        console.log('✅ تم تحميل إعدادات استراحة وهج');
        console.log('📞 رقم الواتساب:', WAHAJ_CONFIG.contact.whatsapp);
        console.log('💰 أسعار الأسبوع:', WAHAJ_CONFIG.pricing.weekday);
        console.log('💰 أسعار الويكند:', WAHAJ_CONFIG.pricing.weekend);
        
        // تحديث أرقام الواتساب في كل الروابط
        document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
            link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${WAHAJ_CONFIG.contact.whatsapp}`);
        });
        
        // تحديث رقم الهاتف المعروض
        document.querySelectorAll('.contact-item span').forEach(span => {
            if (span.textContent.includes('9556')) {
                span.textContent = WAHAJ_CONFIG.contact.phoneDisplay;
            }
        });
    }
    
    
    /* ─────────────────────────────────────────────
       8️⃣ تأثير Parallax بسيط للـ Hero
       ───────────────────────────────────────────── */
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent) {
        window.addEventListener('scroll', function() {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.8;
            }
        });
    }
    
    
    /* ─────────────────────────────────────────────
       9️⃣ إصلاح مشكلة المسافة في الأعلى
       ───────────────────────────────────────────── */
    // إضافة مسافة تحت النافبار الثابت
    const navHeight = navbar.offsetHeight;
    document.body.style.paddingTop = '0';
    
    // في حال كانت الصفحة لا تحتوي على logo-hero
    if (!document.querySelector('.logo-hero')) {
        document.body.style.paddingTop = navHeight + 'px';
    }
    
    
    /* ─────────────────────────────────────────────
       🔟 رسالة ترحيب في الكونسول
       ───────────────────────────────────────────── */
    console.log('%c🌟 استراحة وهج', 
        'color: #D4AF37; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px rgba(212,175,55,0.5);');
    console.log('%cخصوصية .. راحة .. ذكريات لا تُنسى', 
        'color: #0A1F44; font-size: 14px; font-style: italic;');
    console.log('%cتم التطوير بواسطة samir9627-cmd', 
        'color: #6C757D; font-size: 12px;');
    
});


/* ═══════════════════════════════════════════════════════
   🛠️ دوال مساعدة عامة
   ═══════════════════════════════════════════════════════ */

/**
 * التمرير إلى عنصر معين بسلاسة
 */
function scrollToElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * فتح رابط واتساب برسالة مخصصة
 */
function openWhatsApp(message) {
    if (typeof WAHAJ_CONFIG !== 'undefined') {
        window.open(WAHAJ_CONFIG.getWhatsAppLink(message), '_blank');
    } else {
        window.open(`https://wa.me/96895566332?text=${encodeURIComponent(message)}`, '_blank');
    }
}

/**
 * تنسيق التاريخ بالعربية
 */
function formatArabicDate(date) {
    const d = new Date(date);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('ar-OM', options);
}

/**
 * تحويل السعر إلى نص مع العملة
 */
function formatPrice(amount) {
    if (typeof WAHAJ_CONFIG !== 'undefined') {
        return WAHAJ_CONFIG.formatPrice(amount);
    }
    return `${amount} ر.ع`;
}
