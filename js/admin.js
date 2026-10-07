/* ═══════════════════════════════════════════════════════
   استراحة وهج - لوحة التحكم
   منطق كامل (بدون Firebase - localStorage فقط)
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    // ═══ الإعدادات ═══
    var ADMIN_PASSWORD = 'wahaj2026';
    
    var DEFAULT_MESSAGES = {
        confirm: '✅ *تم تأكيد حجزك - استراحة وهج*\n\n' +
            'مرحباً {{name}}،\n\n' +
            '📋 *رقم الحجز:* {{bookingId}}\n' +
            '📅 *التاريخ:* {{date}}\n' +
            '👥 *الضيوف:* {{guests}} أشخاص\n\n' +
            '━━━━━━━━━━━━━━━\n' +
            '💰 *تفاصيل الدفع*\n' +
            '━━━━━━━━━━━━━━━\n\n' +
            '💳 *يُدفع الآن:*\n' +
            '• العربون: {{deposit}} ر.ع\n' +
            '• التأمين المسترد: {{security}} ر.ع\n' +
            '• *الإجمالي: {{payNow}} ر.ع*\n\n' +
            '💵 *يُدفع عند الدخول:*\n' +
            '• الباقي: {{remaining}} ر.ع\n\n' +
            '🛡️ *يُرد بعد الخروج:* {{security}} ر.ع\n\n' +
            '🔔 *تذكير:* {{date}}\n' +
            '📍 بركاء - العقدة\n\n' +
            '📞 +968 9556 6332\n\n' +
            'نتشرف بخدمتك 🌟\n---\nاستراحة وهج',
        
        reject: 'عذراً {{name}}،\n\n' +
            'نأسف لإبلاغك بأنه لم يتم تأكيد حجزك.\n\n' +
            '📋 *رقم الحجز:* {{bookingId}}\n' +
            '📅 *التاريخ:* {{date}}\n\n' +
            'نرجو التواصل معنا لحجز موعد آخر.\n\n' +
            '📞 +968 9556 6332\n---\nاستراحة وهج',
        
        reminder: '🔔 *تذكير بموعد حجزك*\n\n' +
            'مرحباً {{name}}،\n\n' +
            'نذكرك بموعد حجزك *غداً*:\n\n' +
            '📋 *رقم الحجز:* {{bookingId}}\n' +
            '📅 *التاريخ:* {{date}}\n' +
            '👥 *الضيوف:* {{guests}}\n\n' +
            '💰 *تذكير بالدفع:*\n' +
            '• المتبقي: {{remaining}} ر.ع\n' +
            '• التأمين: {{security}} ر.ع\n\n' +
            '📍 بركاء - العقدة\n\n' +
            'نتشرف بخدمتك 🌟\n---\nاستراحة وهج'
    };
    
    var DEFAULT_PRICES = {
        weekdayWithoutStay: 40,
        weekdayWithStay: 50,
        weekdayHalfDay: 25,
        weekendWithoutStay: 50,
        weekendWithStay: 65,
        weekendHalfDay: 30,
        securityDeposit: 20
    };
    
    var LOGO_SVG = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">' +
    '<defs><linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F4D77E"/><stop offset="50%" stop-color="#D4AF37"/><stop offset="100%" stop-color="#A88B2C"/></linearGradient></defs>' +
    '<circle cx="100" cy="100" r="94" fill="none" stroke="url(#wg)" stroke-width="2.5"/>' +
    '<g transform="translate(100, 62)">' +
    '<ellipse cx="0" cy="-26" rx="6" ry="14" fill="url(#wg)"/>' +
    '<ellipse cx="0" cy="-26" rx="6" ry="14" fill="url(#wg)" transform="rotate(60)"/>' +
    '<ellipse cx="0" cy="-26" rx="6" ry="14" fill="url(#wg)" transform="rotate(120)"/>' +
    '<ellipse cx="0" cy="-26" rx="6" ry="14" fill="url(#wg)" transform="rotate(180)"/>' +
    '<ellipse cx="0" cy="-26" rx="6" ry="14" fill="url(#wg)" transform="rotate(240)"/>' +
    '<ellipse cx="0" cy="-26" rx="6" ry="14" fill="url(#wg)" transform="rotate(300)"/>' +
    '<circle cx="0" cy="0" r="14" fill="#A88B2C"/><circle cx="0" cy="0" r="7" fill="#0A1F44"/>' +
    '<path d="M 0 14 Q -4 30 0 48" stroke="url(#wg)" stroke-width="2.5" fill="none"/>' +
    '</g>' +
    '<text x="100" y="135" font-size="16" text-anchor="middle" fill="url(#wg)" font-family="Amiri, serif" font-weight="bold">استراحة وهج</text>' +
    '<text x="100" y="160" font-size="20" text-anchor="middle" fill="url(#wg)" font-family="Cairo, sans-serif" font-weight="900" letter-spacing="4">WAHAJ</text>' +
    '<text x="100" y="178" font-size="10" text-anchor="middle" fill="url(#wg)" font-family="Cairo, sans-serif" letter-spacing="6">RESORT</text>' +
    '</svg>';
    
    document.getElementById('headerLogoIcon').innerHTML = LOGO_SVG;
    
    // ═══ الحالة ═══
    var allBookings = [];
    var filteredBookings = [];
    var blockedDates = [];
    var offers = [];
    var images = [];
    var prices = {};
    var messages = {};
    var currentFilter = 'all';
    var currentSearch = '';
    
    // ═══ Utilities ═══
    function showToast(msg, type) {
        var t = document.getElementById('toast');
        t.textContent = msg;
        t.className = 'toast show ' + (type || '');
        setTimeout(function() { t.classList.remove('show'); }, 2500);
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    }
    
    // ═══ Login ═══
    function handleLogin() {
        var pwd = document.getElementById('passwordInput').value;
        if (pwd === ADMIN_PASSWORD) {
            sessionStorage.setItem('wahaj_admin', '1');
            showAdmin();
        } else {
            document.getElementById('loginError').classList.add('show');
            document.getElementById('passwordInput').value = '';
            setTimeout(function() { document.getElementById('loginError').classList.remove('show'); }, 3000);
        }
    }
    
    function showAdmin() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').classList.add('show');
        loadAllData();
    }
    
    // ═══ Load Data ═══
    function loadAllData() {
        // Bookings
        try {
            allBookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]').reverse();
        } catch(e) { allBookings = []; }
        
        // Blocked dates
        try {
            blockedDates = JSON.parse(localStorage.getItem('wahaj_blocked_dates') || '[]');
        } catch(e) { blockedDates = []; }
        
        // Offers
        try {
            offers = JSON.parse(localStorage.getItem('wahaj_offers') || '[]');
        } catch(e) { offers = []; }
        
        // Images
        try {
            images = JSON.parse(localStorage.getItem('wahaj_images') || '[]');
        } catch(e) { images = []; }
        
        // Prices
        try {
            var savedPrices = JSON.parse(localStorage.getItem('wahaj_prices') || '{}');
            prices = Object.assign({}, DEFAULT_PRICES, savedPrices);
        } catch(e) { prices = Object.assign({}, DEFAULT_PRICES); }
        
        // Messages
        try {
            var savedMessages = JSON.parse(localStorage.getItem('wahaj_messages') || '{}');
            messages = Object.assign({}, DEFAULT_MESSAGES, savedMessages);
        } catch(e) { messages = Object.assign({}, DEFAULT_MESSAGES); }
        
        updateStats();
        applyFilters();
        renderBlockedList();
        renderOffersList();
        renderImagesGrid();
        renderPricesForm();
        renderMessagesForm();
        updateSettingsCounts();
        updateBadge();
    }
    
    function updateStats() {
        var total = allBookings.length;
        var pending = allBookings.filter(function(b) { return (b.status || 'pending') === 'pending'; }).length;
        var confirmed = allBookings.filter(function(b) { return b.status === 'confirmed'; }).length;
        var revenue = allBookings.filter(function(b) { return b.status === 'confirmed'; })
            .reduce(function(sum, b) { return sum + (b.total || 0); }, 0);
        
        document.getElementById('statTotal').textContent = total;
        document.getElementById('statPending').textContent = pending;
        document.getElementById('statConfirmed').textContent = confirmed;
        document.getElementById('statRevenue').textContent = revenue;
    }
    
    function updateBadge() {
        var pending = allBookings.filter(function(b) { return (b.status || 'pending') === 'pending'; }).length;
        var badge = document.getElementById('navBadge');
        if (pending > 0) {
            badge.textContent = pending;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }
    
    function updateSettingsCounts() {
        document.getElementById('settingsBookingsCount').textContent = allBookings.length;
        document.getElementById('settingsBlockedCount').textContent = blockedDates.length;
        document.getElementById('settingsOffersCount').textContent = offers.length;
        document.getElementById('settingsImagesCount').textContent = images.length;
    }
    
    // ═══ Page Switching ═══
    window.switchPage = function(pageName) {
        document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
        document.querySelectorAll('.admin-nav-item').forEach(function(n) { n.classList.remove('active'); });
        
        var page = document.getElementById('page-' + pageName);
        if (page) page.classList.add('active');
        
        var nav = document.querySelector('.admin-nav-item[data-page="' + pageName + '"]');
        if (nav) nav.classList.add('active');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // ═══ Filters ═══
    function applyFilters() {
        filteredBookings = allBookings.filter(function(b) {
            var status = b.status || 'pending';
            if (currentFilter !== 'all' && status !== currentFilter) return false;
            
            if (currentSearch) {
                var txt = ((b.bookingId || '') + ' ' + (b.fullName || '') + ' ' + (b.phone || '') + ' ' + (b.date || '')).toLowerCase();
                if (txt.indexOf(currentSearch.toLowerCase()) === -1) return false;
            }
            return true;
        });
        renderBookings();
        renderDashboardBookings();
    }
    
    // ═══ Render Bookings ═══
    function renderBookings() {
        var list = document.getElementById('bookingsList');
        
        if (filteredBookings.length === 0) {
            list.innerHTML = '<div class="no-bookings"><i class="fas fa-inbox"></i><h3>لا توجد حجوزات</h3><p>' + (allBookings.length === 0 ? 'لم يتم استلام أي حجز بعد' : 'لا توجد نتائج مطابقة') + '</p></div>';
            return;
        }
        
        list.innerHTML = filteredBookings.map(bookingCardHTML).join('');
    }
    
    function renderDashboardBookings() {
        var list = document.getElementById('dashboardBookings');
        var latest = allBookings.slice(0, 3);
        
        if (latest.length === 0) {
            list.innerHTML = '<div class="no-bookings"><i class="fas fa-inbox"></i><h3>لا توجد حجوزات بعد</h3></div>';
            return;
        }
        
        list.innerHTML = latest.map(bookingCardHTML).join('');
    }
    
    function bookingCardHTML(b) {
        var status = b.status || 'pending';
        var statusText = status === 'pending' ? 'بانتظار' : status === 'confirmed' ? 'مؤكد' : 'مرفوض';
        var statusIcon = status === 'pending' ? 'fa-clock' : status === 'confirmed' ? 'fa-check' : 'fa-times';
        
        return '<div class="booking-card ' + status + '">' +
            '<div class="booking-head">' +
                '<span class="booking-id">' + escapeHtml(b.bookingId) + '</span>' +
                '<span class="booking-status ' + status + '"><i class="fas ' + statusIcon + '"></i> ' + statusText + '</span>' +
            '</div>' +
            '<div class="booking-info-grid">' +
                '<div class="booking-info-item"><span class="label">الاسم</span><span class="value">' + escapeHtml(b.fullName || '—') + '</span></div>' +
                '<div class="booking-info-item"><span class="label">الجوال</span><span class="value">' + escapeHtml(b.phone || '—') + '</span></div>' +
                '<div class="booking-info-item"><span class="label">التاريخ</span><span class="value">' + escapeHtml(b.dateFormatted || b.date || '—') + '</span></div>' +
                '<div class="booking-info-item"><span class="label">النوع</span><span class="value">' + escapeHtml(b.bookingType || '—') + '</span></div>' +
                '<div class="booking-info-item"><span class="label">الضيوف</span><span class="value">' + (b.guests || '—') + '</span></div>' +
                '<div class="booking-info-item"><span class="label">المطلوب الآن</span><span class="value">' + (b.payNow || b.deposit || 0) + ' ر.ع</span></div>' +
            '</div>' +
            '<div class="booking-actions">' +
                '<button class="action-btn view" onclick="viewBooking(\'' + b.bookingId + '\')"><i class="fas fa-eye"></i> تفاصيل</button>' +
                (status === 'pending' ? 
                    '<button class="action-btn confirm" onclick="confirmBooking(\'' + b.bookingId + '\')"><i class="fas fa-check"></i> تأكيد</button>' +
                    '<button class="action-btn reject" onclick="rejectBooking(\'' + b.bookingId + '\')"><i class="fas fa-times"></i> رفض</button>'
                    : '') +
                '<button class="action-btn whatsapp" onclick="contactCustomer(\'' + b.bookingId + '\')"><i class="fab fa-whatsapp"></i></button>' +
                '<button class="action-btn print" onclick="printBooking(\'' + b.bookingId + '\')"><i class="fas fa-print"></i></button>' +
                '<button class="action-btn delete" onclick="deleteBooking(\'' + b.bookingId + '\')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    }
    
    // ═══ View Booking ═══
    window.viewBooking = function(bookingId) {
        var b = allBookings.find(function(x) { return x.bookingId === bookingId; });
        if (!b) return;
        
        var total = b.total || 0;
        var deposit = b.deposit || 0;
        var security = b.security || 20;
        var remaining = b.remaining !== undefined ? b.remaining : (total - deposit);
        var payNow = b.payNow || (deposit + security);
        var isFullPayment = b.isFullPayment || false;
        
        var receiptImg = b.receiptURL || sessionStorage.getItem('receipt_' + bookingId);
        var receiptHtml = receiptImg ? '<div class="modal-receipt"><img src="' + receiptImg + '" alt="الإيصال"></div>' : '<p style="text-align:center;color:var(--gray-600);font-size:0.85rem;margin-top:15px;">لا يوجد إيصال</p>';
        
        var html = 
            '<button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>' +
            '<h2>تفاصيل الحجز</h2>' +
            '<div class="modal-row"><span class="label">رقم الحجز:</span><span class="value">' + escapeHtml(b.bookingId) + '</span></div>' +
            '<div class="modal-row"><span class="label">الاسم:</span><span class="value">' + escapeHtml(b.fullName) + '</span></div>' +
            '<div class="modal-row"><span class="label">الجوال:</span><span class="value">' + escapeHtml(b.phone) + '</span></div>' +
            '<div class="modal-row"><span class="label">التاريخ:</span><span class="value">' + escapeHtml(b.dateFormatted) + '</span></div>' +
            '<div class="modal-row"><span class="label">نوع اليوم:</span><span class="value">' + escapeHtml(b.dayType) + '</span></div>' +
            '<div class="modal-row"><span class="label">نوع الحجز:</span><span class="value">' + escapeHtml(b.bookingType) + '</span></div>' +
            '<div class="modal-row"><span class="label">التوقيت:</span><span class="value">' + escapeHtml(b.bookingTypeDesc) + '</span></div>' +
            '<div class="modal-row"><span class="label">عدد الضيوف:</span><span class="value">' + (b.guests || '—') + '</span></div>' +
            '<div class="modal-row"><span class="label">ملاحظات:</span><span class="value">' + escapeHtml(b.notes || 'لا يوجد') + '</span></div>';
        
        html += 
            '<div class="modal-payment-section now">' +
                '<div class="modal-payment-section-title"><i class="fas fa-credit-card"></i> يُدفع الآن</div>' +
                '<div class="modal-payment-row"><span>💵 العربون' + (isFullPayment ? ' (دفع كامل)' : '') + '</span><strong>' + deposit + ' ر.ع</strong></div>' +
                '<div class="modal-payment-row"><span>🛡️ التأمين (مسترد)</span><strong>' + security + ' ر.ع</strong></div>' +
                '<div class="modal-payment-row"><span>✅ الإجمالي المطلوب</span><strong>' + payNow + ' ر.ع</strong></div>' +
            '</div>';
        
        if (remaining > 0) {
            html += 
                '<div class="modal-payment-section later">' +
                    '<div class="modal-payment-section-title"><i class="fas fa-calendar-check"></i> يُدفع عند الدخول</div>' +
                    '<div class="modal-payment-row"><span>💳 الباقي</span><strong>' + remaining + ' ر.ع</strong></div>' +
                '</div>';
        } else {
            html += 
                '<div class="modal-payment-section later">' +
                    '<div class="modal-payment-section-title"><i class="fas fa-check-circle"></i> تم الدفع كاملاً</div>' +
                    '<div class="modal-payment-row"><span>لا يوجد باقي ✅</span><strong>0 ر.ع</strong></div>' +
                '</div>';
        }
        
        html += 
            '<div class="modal-payment-section refund">' +
                '<div class="modal-payment-section-title"><i class="fas fa-undo"></i> يُرد بعد الخروج</div>' +
                '<div class="modal-payment-row"><span>🛡️ التأمين المسترد</span><strong>' + security + ' ر.ع</strong></div>' +
            '</div>';
        
        html += receiptHtml;
        
        document.getElementById('modalContent').innerHTML = html;
        document.getElementById('detailsModal').classList.add('show');
    };
    
    window.closeModal = function() {
        document.getElementById('detailsModal').classList.remove('show');
    };
    
    // ═══ Replace Variables ═══
    function replaceVariables(template, data) {
        var total = data.total || 0;
        var deposit = data.deposit || 0;
        var security = data.security || 20;
        var remaining = data.remaining !== undefined ? data.remaining : (total - deposit);
        var payNow = data.payNow || (deposit + security);
        
        return template
            .replace(/\{\{name\}\}/g, data.fullName || '')
            .replace(/\{\{date\}\}/g, data.dateFormatted || '')
            .replace(/\{\{bookingId\}\}/g, data.bookingId || '')
            .replace(/\{\{total\}\}/g, total)
            .replace(/\{\{deposit\}\}/g, deposit)
            .replace(/\{\{security\}\}/g, security)
            .replace(/\{\{remaining\}\}/g, remaining)
            .replace(/\{\{payNow\}\}/g, payNow)
            .replace(/\{\{guests\}\}/g, data.guests || '')
            .replace(/\{\{phone\}\}/g, data.phone || '')
            .replace(/\{\{type\}\}/g, data.bookingType || '')
            .replace(/\{\{time\}\}/g, data.bookingTypeDesc || '');
    }
    
    // ═══ Confirm Booking ═══
    window.confirmBooking = function(bookingId) {
        var b = allBookings.find(function(x) { return x.bookingId === bookingId; });
        if (!b) return;
        if (!confirm('تأكيد الحجز؟ سيتم فتح واتساب للتواصل مع العميل')) return;
        
        updateStatus(bookingId, 'confirmed');
        
        var template = messages.confirm || DEFAULT_MESSAGES.confirm;
        var msg = replaceVariables(template, b);
        
        var phone = b.phone.replace(/[^0-9]/g, '');
        var phoneFull = phone.indexOf('968') === 0 ? phone : '968' + phone;
        
        setTimeout(function() {
            window.open('https://wa.me/' + phoneFull + '?text=' + encodeURIComponent(msg), '_blank');
        }, 500);
        
        showToast('✅ تم تأكيد الحجز', 'success');
    };
    
    // ═══ Reject Booking ═══
    window.rejectBooking = function(bookingId) {
        var b = allBookings.find(function(x) { return x.bookingId === bookingId; });
        if (!b) return;
        
        var reason = prompt('سبب الرفض (اختياري):', '');
        if (reason === null) return;
        
        updateStatus(bookingId, 'rejected');
        
        var template = messages.reject || DEFAULT_MESSAGES.reject;
        var msg = replaceVariables(template, b);
        
        if (reason) {
            msg = msg.replace(/\{\{reason\}\}/g, reason);
        }
        
        var phone = b.phone.replace(/[^0-9]/g, '');
        var phoneFull = phone.indexOf('968') === 0 ? phone : '968' + phone;
        
        setTimeout(function() {
            window.open('https://wa.me/' + phoneFull + '?text=' + encodeURIComponent(msg), '_blank');
        }, 500);
        
        showToast('تم رفض الحجز', 'warning');
    };
    
    function updateStatus(bookingId, newStatus) {
        try {
            var bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
            for (var i = 0; i < bookings.length; i++) {
                if (bookings[i].bookingId === bookingId) {
                    bookings[i].status = newStatus;
                    bookings[i].updatedAt = new Date().toISOString();
                    break;
                }
            }
            localStorage.setItem('wahaj_bookings', JSON.stringify(bookings));
            loadAllData();
        } catch(e) {}
    }
    
    // ═══ Print Booking ═══
    window.printBooking = function(bookingId) {
        var b = allBookings.find(function(x) { return x.bookingId === bookingId; });
        if (!b) return;
        
        var total = b.total || 0;
        var deposit = b.deposit || 0;
        var security = b.security || 20;
        var remaining = b.remaining !== undefined ? b.remaining : (total - deposit);
        var payNow = b.payNow || (deposit + security);
        var isFullPayment = b.isFullPayment || false;
        
        var content = 
            '<div style="font-family: Cairo, sans-serif; direction: rtl; padding: 30px; max-width: 700px; margin: 0 auto;">' +
            '<div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #D4AF37; padding-bottom: 20px;">' +
            '<h1 style="font-family: Amiri, serif; color: #D4AF37; font-size: 28px; margin: 0;">استراحة وهج</h1>' +
            '<p style="color: #6C757D; margin: 5px 0 0;">Wahaj Resort - خصوصية .. راحة .. ذكريات لا تُنسى</p>' +
            '</div>' +
            '<h2 style="color: #0A1F44; text-align: center; margin-bottom: 20px;">فاتورة حجز</h2>' +
            '<div style="background: #FBF8F1; border: 2px dashed #D4AF37; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">' +
            '<div style="color: #6C757D; font-size: 14px;">رقم الحجز</div>' +
            '<div style="font-family: monospace; font-size: 24px; font-weight: bold; color: #A88B2C;">' + escapeHtml(b.bookingId) + '</div>' +
            '</div>' +
            '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' +
            '<tr><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; color: #6C757D;">الاسم:</td><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; font-weight: bold; text-align: left;">' + escapeHtml(b.fullName) + '</td></tr>' +
            '<tr><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; color: #6C757D;">الجوال:</td><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; font-weight: bold; text-align: left;">' + escapeHtml(b.phone) + '</td></tr>' +
            '<tr><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; color: #6C757D;">التاريخ:</td><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; font-weight: bold; text-align: left;">' + escapeHtml(b.dateFormatted) + '</td></tr>' +
            '<tr><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; color: #6C757D;">نوع الحجز:</td><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; font-weight: bold; text-align: left;">' + escapeHtml(b.bookingType) + ' (' + escapeHtml(b.bookingTypeDesc) + ')</td></tr>' +
            '<tr><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; color: #6C757D;">عدد الضيوف:</td><td style="padding: 10px; border-bottom: 1px solid #E9ECEF; font-weight: bold; text-align: left;">' + (b.guests || '—') + ' أشخاص</td></tr>' +
            '</table>' +
            
            '<div style="background: #FBF8F1; border: 2px solid #D4AF37; border-radius: 12px; padding: 15px; margin-bottom: 15px;">' +
            '<div style="color: #A88B2C; font-weight: bold; margin-bottom: 10px; font-size: 14px;">💳 يُدفع الآن (تحويل بنكي)</div>' +
            '<table style="width: 100%;">' +
            '<tr><td style="padding: 5px 0;">💵 العربون' + (isFullPayment ? ' (دفع كامل)' : '') + '</td><td style="text-align: left; font-weight: bold;">' + deposit + ' ر.ع</td></tr>' +
            '<tr><td style="padding: 5px 0;">🛡️ التأمين المسترد</td><td style="text-align: left; font-weight: bold;">' + security + ' ر.ع</td></tr>' +
            '<tr style="border-top: 1px dashed #D4AF37;"><td style="padding: 10px 0 0;">✅ الإجمالي المطلوب</td><td style="text-align: left; font-weight: bold; color: #A88B2C; font-size: 18px;">' + payNow + ' ر.ع</td></tr>' +
            '</table>' +
            '</div>';
        
        if (remaining > 0) {
            content += 
                '<div style="background: #F8F9FA; border: 2px solid rgba(10, 31, 68, 0.2); border-radius: 12px; padding: 15px; margin-bottom: 15px;">' +
                '<div style="color: #0A1F44; font-weight: bold; margin-bottom: 10px; font-size: 14px;">📅 يُدفع عند الدخول</div>' +
                '<table style="width: 100%;">' +
                '<tr><td style="padding: 5px 0;">💳 الباقي</td><td style="text-align: left; font-weight: bold;">' + remaining + ' ر.ع</td></tr>' +
                '</table>' +
                '</div>';
        } else {
            content += 
                '<div style="background: #F8F9FA; border: 2px solid rgba(40, 167, 69, 0.3); border-radius: 12px; padding: 15px; margin-bottom: 15px;">' +
                '<div style="color: #28A745; font-weight: bold; font-size: 14px;">✅ تم الدفع كاملاً</div>' +
                '</div>';
        }
        
        content += 
            '<div style="background: rgba(40, 167, 69, 0.08); border: 2px solid rgba(40, 167, 69, 0.3); border-radius: 12px; padding: 15px; margin-bottom: 15px;">' +
            '<div style="color: #28A745; font-weight: bold; margin-bottom: 10px; font-size: 14px;">♻️ يُرد بعد الخروج</div>' +
            '<table style="width: 100%;">' +
            '<tr><td style="padding: 5px 0;">🛡️ التأمين المسترد</td><td style="text-align: left; font-weight: bold; color: #28A745;">' + security + ' ر.ع</td></tr>' +
            '</table>' +
            '</div>' +
            
            '<div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #D4AF37; text-align: center; color: #6C757D; font-size: 12px;">' +
            '<p>📍 ولاية بركاء - منطقة العقدة - جنوب الباطنة</p>' +
            '<p>📞 +968 9556 6332</p>' +
            '<p style="margin-top: 15px;">شكراً لثقتكم بنا 🌟</p>' +
            '</div>' +
            '</div>';
        
        var printArea = document.getElementById('printArea');
        printArea.innerHTML = content;
        printArea.style.display = 'block';
        
        setTimeout(function() {
            window.print();
            setTimeout(function() { printArea.style.display = 'none'; }, 1000);
        }, 200);
    };
    
    // ═══ Contact Customer ═══
    window.contactCustomer = function(bookingId) {
        var b = allBookings.find(function(x) { return x.bookingId === bookingId; });
        if (!b) return;
        
        var msg = 'السلام عليكم ' + b.fullName + '،\n\n' +
            'بخصوص حجزك في استراحة وهج:\n\n' +
            '📋 رقم الحجز: ' + b.bookingId + '\n' +
            '📅 التاريخ: ' + b.dateFormatted + '\n\n' +
            'كيف يمكننا مساعدتك؟';
        
        var phone = b.phone.replace(/[^0-9]/g, '');
        var phoneFull = phone.indexOf('968') === 0 ? phone : '968' + phone;
        
        window.open('https://wa.me/' + phoneFull + '?text=' + encodeURIComponent(msg), '_blank');
    };
    
    // ═══ Delete Booking ═══
    window.deleteBooking = function(bookingId) {
        if (!confirm('حذف الحجز نهائياً؟')) return;
        
        try {
            var bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
            bookings = bookings.filter(function(x) { return x.bookingId !== bookingId; });
            localStorage.setItem('wahaj_bookings', JSON.stringify(bookings));
            loadAllData();
            showToast('تم حذف الحجز', 'success');
        } catch(e) {}
    };
    
    // ═══ Blocked Dates ═══
    function renderBlockedList() {
        var list = document.getElementById('blockedList');
        
        if (blockedDates.length === 0) {
            list.innerHTML = '<div class="no-blocked"><i class="fas fa-check-circle" style="font-size: 2rem; color: #28A745; display: block; margin-bottom: 10px;"></i>لا توجد تواريخ محجوبة</div>';
            return;
        }
        
        var typeLabels = {
            maintenance: '🔧 صيانة',
            personal: '👤 شخصي',
            reserved: '📅 محجوز',
            other: '📝 أخرى'
        };
        
        list.innerHTML = blockedDates.map(function(item, index) {
            var date = item.date || item;
            var reason = item.reason || '';
            var type = item.type || 'other';
            return '<div class="blocked-item">' +
                '<div>' +
                    '<div class="date">📅 ' + escapeHtml(date) + '</div>' +
                    '<div class="reason">' + (typeLabels[type] || '') + (reason ? ' - ' + escapeHtml(reason) : '') + '</div>' +
                '</div>' +
                '<button onclick="removeBlocked(' + index + ')"><i class="fas fa-times"></i></button>' +
            '</div>';
        }).join('');
    }
    
    window.removeBlocked = function(index) {
        if (!confirm('إزالة الحجب؟')) return;
        blockedDates.splice(index, 1);
        localStorage.setItem('wahaj_blocked_dates', JSON.stringify(blockedDates));
        renderBlockedList();
        updateSettingsCounts();
        showToast('تم إزالة الحجب', 'success');
    };
    
    window.addBlocked = function() {
        var date = document.getElementById('blockDate').value;
        var type = document.getElementById('blockType').value;
        var reason = document.getElementById('blockReason').value.trim();
        
        if (!date) {
            showToast('اختر التاريخ', 'warning');
            return;
        }
        
        var exists = blockedDates.some(function(item) {
            return (item.date || item) === date;
        });
        
        if (exists) {
            showToast('التاريخ محجوب مسبقاً', 'warning');
            return;
        }
        
        blockedDates.push({ date: date, type: type, reason: reason });
        localStorage.setItem('wahaj_blocked_dates', JSON.stringify(blockedDates));
        
        document.getElementById('blockDate').value = '';
        document.getElementById('blockReason').value = '';
        
        renderBlockedList();
        updateSettingsCounts();
        showToast('✅ تم إضافة الحجب', 'success');
    };
    
    // ═══ Messages ═══
    function renderMessagesForm() {
        document.getElementById('msgConfirm').value = messages.confirm || DEFAULT_MESSAGES.confirm;
        document.getElementById('msgReject').value = messages.reject || DEFAULT_MESSAGES.reject;
        document.getElementById('msgReminder').value = messages.reminder || DEFAULT_MESSAGES.reminder;
    }
    
    window.saveMessage = function(type) {
        var textarea = document.getElementById('msg' + type.charAt(0).toUpperCase() + type.slice(1));
        if (!textarea) return;
        
        messages[type] = textarea.value;
        localStorage.setItem('wahaj_messages', JSON.stringify(messages));
        showToast('✅ تم حفظ الرسالة', 'success');
    };
    
    window.resetMessage = function(type) {
        if (!confirm('استرجاع الرسالة الافتراضية؟')) return;
        
        messages[type] = DEFAULT_MESSAGES[type];
        localStorage.setItem('wahaj_messages', JSON.stringify(messages));
        renderMessagesForm();
        showToast('✅ تم الاسترجاع', 'success');
    };
    
    // ═══ Images ═══
    function renderImagesGrid() {
        var grid = document.getElementById('imagesGrid');
        
        if (images.length === 0) {
            grid.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 30px; color: var(--gray-600); font-size: 0.85rem;">لا توجد صور مضافة</div>';
            return;
        }
        
        grid.innerHTML = images.map(function(img, index) {
            return '<div class="image-card">' +
                '<img src="' + escapeHtml(img.path) + '" alt="' + escapeHtml(img.name) + '" onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2240%22 text-anchor=%22middle%22%3E%F0%9F%96%BC%EF%B8%8F%3C/text%3E%3C/svg%3E\'">' +
                '<div class="image-card-info">' +
                    '<div class="name">' + escapeHtml(img.name) + '</div>' +
                    '<div class="path">' + escapeHtml(img.path) + '</div>' +
                    '<div class="image-card-actions">' +
                        '<button class="copy-btn" onclick="copyImagePath(' + index + ')"><i class="fas fa-copy"></i> نسخ</button>' +
                        '<button class="del-btn" onclick="removeImage(' + index + ')"><i class="fas fa-trash"></i></button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }
    
    window.addImage = function() {
        var name = document.getElementById('imgName').value.trim();
        var path = document.getElementById('imgPath').value.trim();
        
        if (!name || !path) {
            showToast('أدخل الاسم والمسار', 'warning');
            return;
        }
        
        images.push({ name: name, path: path, addedAt: new Date().toISOString() });
        localStorage.setItem('wahaj_images', JSON.stringify(images));
        
        document.getElementById('imgName').value = '';
        document.getElementById('imgPath').value = '';
        
        renderImagesGrid();
        updateSettingsCounts();
        showToast('✅ تم إضافة الصورة', 'success');
    };
    
    window.removeImage = function(index) {
        if (!confirm('حذف الصورة؟')) return;
        images.splice(index, 1);
        localStorage.setItem('wahaj_images', JSON.stringify(images));
        renderImagesGrid();
        updateSettingsCounts();
        showToast('تم الحذف', 'success');
    };
    
    window.copyImagePath = function(index) {
        var path = images[index].path;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(path).then(function() {
                showToast('✅ تم نسخ المسار', 'success');
            });
        } else {
            prompt('انسخ المسار:', path);
        }
    };
    
    // ═══ Offers ═══
    function renderOffersList() {
        var list = document.getElementById('offersList');
        
        if (offers.length === 0) {
            list.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--gray-600); font-size: 0.85rem;">لا توجد عروض حالياً</div>';
            return;
        }
        
        list.innerHTML = offers.map(function(offer, index) {
            var isActive = offer.active !== false;
            var dateText = '';
            if (offer.start || offer.end) {
                dateText = (offer.start || '') + ' → ' + (offer.end || '');
            }
            
            return '<div class="offer-item' + (isActive ? '' : ' inactive') + '">' +
                '<div class="offer-item-content">' +
                    '<h4>' + escapeHtml(offer.title) + '</h4>' +
                    (offer.desc ? '<p>' + escapeHtml(offer.desc) + '</p>' : '') +
                    '<div class="offer-item-meta">' +
                        (offer.discount ? '<span class="offer-badge discount">🏷️ خصم ' + offer.discount + '%</span>' : '') +
                        (dateText ? '<span class="offer-badge date">📅 ' + escapeHtml(dateText) + '</span>' : '') +
                    '</div>' +
                '</div>' +
                '<div class="offer-item-actions">' +
                    '<button class="toggle-btn" onclick="toggleOffer(' + index + ')" title="' + (isActive ? 'إيقاف' : 'تفعيل') + '">' +
                        '<i class="fas fa-' + (isActive ? 'eye' : 'eye-slash') + '"></i>' +
                    '</button>' +
                    '<button class="del-btn" onclick="removeOffer(' + index + ')"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</div>';
        }).join('');
    }
    
    window.addOffer = function() {
        var title = document.getElementById('offerTitle').value.trim();
        var desc = document.getElementById('offerDesc').value.trim();
        var start = document.getElementById('offerStart').value;
        var end = document.getElementById('offerEnd').value;
        var discount = document.getElementById('offerDiscount').value;
        
        if (!title) {
            showToast('أدخل عنوان العرض', 'warning');
            return;
        }
        
        offers.push({
            title: title,
            desc: desc,
            start: start,
            end: end,
            discount: discount,
            active: true,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('wahaj_offers', JSON.stringify(offers));
        
        document.getElementById('offerTitle').value = '';
        document.getElementById('offerDesc').value = '';
        document.getElementById('offerStart').value = '';
        document.getElementById('offerEnd').value = '';
        document.getElementById('offerDiscount').value = '';
        
        renderOffersList();
        updateSettingsCounts();
        showToast('✅ تم إضافة العرض', 'success');
    };
    
    window.removeOffer = function(index) {
        if (!confirm('حذف العرض؟')) return;
        offers.splice(index, 1);
        localStorage.setItem('wahaj_offers', JSON.stringify(offers));
        renderOffersList();
        updateSettingsCounts();
        showToast('تم الحذف', 'success');
    };
    
    window.toggleOffer = function(index) {
        offers[index].active = !offers[index].active;
        localStorage.setItem('wahaj_offers', JSON.stringify(offers));
        renderOffersList();
        showToast(offers[index].active ? '✅ تم التفعيل' : 'تم الإيقاف', 'success');
    };
    
    // ═══ Prices ═══
    function renderPricesForm() {
        document.getElementById('weekdayWithoutStay').value = prices.weekdayWithoutStay || 40;
        document.getElementById('weekdayWithStay').value = prices.weekdayWithStay || 50;
        document.getElementById('weekdayHalfDay').value = prices.weekdayHalfDay || 25;
        document.getElementById('weekendWithoutStay').value = prices.weekendWithoutStay || 50;
        document.getElementById('weekendWithStay').value = prices.weekendWithStay || 65;
        document.getElementById('weekendHalfDay').value = prices.weekendHalfDay || 30;
        document.getElementById('securityDeposit').value = prices.securityDeposit || 20;
    }
    
    window.savePrices = function() {
        prices = {
            weekdayWithoutStay: parseInt(document.getElementById('weekdayWithoutStay').value) || 0,
            weekdayWithStay: parseInt(document.getElementById('weekdayWithStay').value) || 0,
            weekdayHalfDay: parseInt(document.getElementById('weekdayHalfDay').value) || 0,
            weekendWithoutStay: parseInt(document.getElementById('weekendWithoutStay').value) || 0,
            weekendWithStay: parseInt(document.getElementById('weekendWithStay').value) || 0,
            weekendHalfDay: parseInt(document.getElementById('weekendHalfDay').value) || 0,
            securityDeposit: parseInt(document.getElementById('securityDeposit').value) || 20
        };
        
        localStorage.setItem('wahaj_prices', JSON.stringify(prices));
        showToast('✅ تم حفظ الأسعار', 'success');
    };
    
    // ═══ Export ═══
    window.exportData = function() {
        if (allBookings.length === 0) {
            showToast('لا توجد حجوزات', 'warning');
            return;
        }
        
        var csv = '\uFEFF';
        csv += 'رقم الحجز,التاريخ,الاسم,الجوال,النوع,الضيوف,الإجمالي,العربون,التأمين,المطلوب الآن,الباقي,الحالة\n';
        
        allBookings.forEach(function(b) {
            var total = b.total || 0;
            var deposit = b.deposit || 0;
            var security = b.security || 20;
            var remaining = b.remaining !== undefined ? b.remaining : (total - deposit);
            var payNow = b.payNow || (deposit + security);
            
            csv += '"' + (b.bookingId || '') + '",' +
                   '"' + (b.dateFormatted || b.date || '') + '",' +
                   '"' + (b.fullName || '') + '",' +
                   '"' + (b.phone || '') + '",' +
                   '"' + (b.bookingType || '') + '",' +
                   '"' + (b.guests || '') + '",' +
                   '"' + total + '",' +
                   '"' + deposit + '",' +
                   '"' + security + '",' +
                   '"' + payNow + '",' +
                   '"' + remaining + '",' +
                   '"' + (b.status === 'confirmed' ? 'مؤكد' : b.status === 'rejected' ? 'مرفوض' : 'بانتظار') + '"\n';
        });
        
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'wahaj-bookings-' + new Date().toISOString().slice(0,10) + '.csv';
        link.click();
        
        showToast('✅ تم التصدير', 'success');
    };
    
    // ═══ Refresh ═══
    window.refreshData = function() {
        loadAllData();
        showToast('✅ تم التحديث', 'success');
    };
    
    // ═══ Logout ═══
    window.logout = function() {
        if (confirm('تسجيل الخروج؟')) {
            sessionStorage.removeItem('wahaj_admin');
            location.reload();
        }
    };
    
    // ═══ Clear All ═══
    window.clearAllData = function() {
        if (!confirm('⚠️ سيتم مسح جميع البيانات!\n\nهل أنت متأكد؟')) return;
        if (!confirm('تأكيد أخير')) return;
        
        localStorage.removeItem('wahaj_bookings');
        localStorage.removeItem('wahaj_blocked_dates');
        localStorage.removeItem('wahaj_last_booking');
        localStorage.removeItem('wahaj_offers');
        localStorage.removeItem('wahaj_images');
        localStorage.removeItem('wahaj_prices');
        localStorage.removeItem('wahaj_messages');
        loadAllData();
        showToast('✅ تم مسح البيانات', 'success');
    };
    
    // ═══ Events ═══
    document.getElementById('loginBtn').onclick = handleLogin;
    document.getElementById('passwordInput').onkeypress = function(e) {
        if (e.key === 'Enter') handleLogin();
    };
    
    document.getElementById('statusFilter').onchange = function() {
        currentFilter = this.value;
        applyFilters();
    };
    
    document.getElementById('searchInput').oninput = function() {
        currentSearch = this.value;
        applyFilters();
    };
    
    // ═══ Init ═══
    if (sessionStorage.getItem('wahaj_admin') === '1') {
        showAdmin();
    }
    
    console.log('✅ لوحة التحكم جاهزة (localStorage)');
    
})();
