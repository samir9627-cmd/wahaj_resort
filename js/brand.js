/* ═══════════════════════════════════════════════════════
   استراحة وهج - Brand Manager
   شعار SVG مدمج (بنفس فكرة شعارك)
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    // ─── شعار SVG كامل ───
    const LOGO_SVG = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <linearGradient id="whGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F4D77E"/>
            <stop offset="30%" stop-color="#D4AF37"/>
            <stop offset="70%" stop-color="#C9A02C"/>
            <stop offset="100%" stop-color="#8B6F1F"/>
        </linearGradient>
        <linearGradient id="whGoldLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#F4D77E"/>
            <stop offset="100%" stop-color="#D4AF37"/>
        </linearGradient>
        <radialGradient id="whCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#8B6F1F"/>
            <stop offset="100%" stop-color="#5A4415"/>
        </radialGradient>
        <filter id="whGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>
    
    <!-- الدوائر الخارجية -->
    <circle cx="100" cy="100" r="94" fill="none" stroke="url(#whGold)" stroke-width="2.5" opacity="0.95"/>
    <circle cx="100" cy="100" r="88" fill="none" stroke="url(#whGold)" stroke-width="0.8" opacity="0.55"/>
    <circle cx="100" cy="100" r="96" fill="none" stroke="url(#whGold)" stroke-width="0.5" opacity="0.35"/>
    
    <!-- الزهرة (Sunflower) -->
    <g transform="translate(100, 72)" filter="url(#whGlow)">
        <!-- البتلات - 16 بتلة -->
        <g opacity="0.95">
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(22.5)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(45)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(67.5)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(90)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(112.5)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(135)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(157.5)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(180)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(202.5)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(225)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(247.5)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(270)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(292.5)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(315)"/>
            <ellipse cx="0" cy="-30" rx="6.5" ry="15" fill="url(#whGold)" transform="rotate(337.5)"/>
        </g>
        
        <!-- مركز الزهرة -->
        <circle cx="0" cy="0" r="15" fill="#A88B2C"/>
        <circle cx="0" cy="0" r="12" fill="url(#whCenter)"/>
        <circle cx="0" cy="0" r="6" fill="#0A1F44"/>
        
        <!-- الساق -->
        <path d="M 0 15 Q -3 32 0 52" stroke="url(#whGold)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        
        <!-- الأوراق -->
        <ellipse cx="-10" cy="32" rx="9" ry="4.5" fill="url(#whGold)" transform="rotate(-35 -10 32)"/>
        <ellipse cx="10" cy="44" rx="9" ry="4.5" fill="url(#whGold)" transform="rotate(35 10 44)"/>
    </g>
    
    <!-- النص العربي: استراحة وهج -->
    <text x="100" y="140" font-size="17" text-anchor="middle" 
          fill="url(#whGold)" font-family="Amiri, serif" font-weight="bold" 
          letter-spacing="1">استراحة وهج</text>
    
    <!-- النص الإنجليزي: WAHAJ -->
    <text x="100" y="163" font-size="19" text-anchor="middle" 
          fill="url(#whGold)" font-family="Cairo, sans-serif" font-weight="900" 
          letter-spacing="3">WAHAJ</text>
    
    <!-- النص الإنجليزي: RESORT -->
    <text x="100" y="180" font-size="11" text-anchor="middle" 
          fill="url(#whGold)" font-family="Cairo, sans-serif" font-weight="600" 
          letter-spacing="5">RESORT</text>
    
    <!-- خطوط الزخرفة -->
    <line x1="65" y1="145" x2="80" y2="145" stroke="url(#whGold)" stroke-width="1" opacity="0.7"/>
    <line x1="120" y1="145" x2="135" y2="145" stroke="url(#whGold)" stroke-width="1" opacity="0.7"/>
    <circle cx="60" cy="145" r="1.5" fill="url(#whGold)" opacity="0.8"/>
    <circle cx="140" cy="145" r="1.5" fill="url(#whGold)" opacity="0.8"/>
</svg>`;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        replaceAllLogos();
    }
    
    function replaceAllLogos() {
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
                    // استبدل محتوى SVG الحالي
                    el.outerHTML = LOGO_SVG.replace(
                        '<svg',
                        `<svg class="${el.className.baseVal || el.className}"`
                    );
                } else if (el.tagName === 'IMG') {
                    // استبدل IMG بـ SVG
                    const wrapper = document.createElement('div');
                    wrapper.className = el.className;
                    wrapper.style.display = 'flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.justifyContent = 'center';
                    
                    // نفس الأبعاد
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0) {
                        wrapper.style.width = rect.width + 'px';
                        wrapper.style.height = rect.height + 'px';
                    }
                    
                    wrapper.innerHTML = LOGO_SVG;
                    el.parentNode.replaceChild(wrapper, el);
                }
            });
        });
        
        console.log('🎨 تم تحديث الشعار (SVG مدمج)');
    }
    
})();
