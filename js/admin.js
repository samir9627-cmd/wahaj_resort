/* ═══════════════════════════════════════════════════════
   استراحة وهج - لوحة التحكم
   محدّث: Firebase + الرسائل + الإيصال + الطباعة الجديدة
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
            '📍 بركاء - الوهرة\n\n' +
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
            '📍 بركاء - الوهرة\n\n' +
            'نتشرف بخدمتك 🌟\n---\nاستراحة وهج'
    };
    
    var DEFAULT_PRICES = {
        weekdayWithoutStay: 40, weekdayWithStay: 50, weekdayHalfDay: 25,
        weekendWithoutStay: 50, weekendWithStay: 65, weekendHalfDay: 30,
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
        if (!t) return;
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
        try { allBookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]').reverse(); } catch(e) { allBookings = []; }
        try { blockedDates = JSON.parse(localStorage.getItem('wahaj_blocked_dates') || '[]'); } catch(e) { blockedDates = []; }
        try { offers = JSON.parse(localStorage.getItem('wahaj_offers') || '[]'); } catch(e) { offers = []; }
        try { images = JSON.parse(localStorage.getItem('wahaj_images') || '[]'); } catch(e) { images = []; }
        try {
            var savedPrices = JSON.parse(localStorage.getItem('wahaj_prices') || '{}');
            prices = Object.assign({}, DEFAULT_PRICES, savedPrices);
        } catch(e) { prices = Object.assign({}, DEFAULT_PRICES); }
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
        if (badge) {
            if (pending > 0) {
                badge.textContent = pending;
                badge.classList.add('show');
            } else {
                badge.classList.remove('show');
            }
        }
    }
    
    function updateSettingsCounts() {
        var el;
        el = document.getElementById('settingsBookingsCount'); if (el) el.textContent = allBookings.length;
        el = document.getElementById('settingsBlockedCount'); if (el) el.textContent = blockedDates.length;
        el = document.getElementById('settingsOffersCount'); if (el) el.textContent = offers.length;
        el = document.getElementById('settingsImagesCount'); if (el) el.textContent = images.length;
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
        
        var receiptBadge = '';
        if (b.hasReceipt || b.receiptFileName) {
            receiptBadge = ' <i class="fas fa-image" style="color: var(--info); font-size: 0.7rem;" title="لديه إيصال"></i>';
        }
        
        var offerBadge = '';
        if (b.hasOffer && b.discount > 0) {
            offerBadge = ' <i class="fas fa-gift" style="color: var(--success); font-size: 0.7rem;" title="عرض ' + b.discountPercent + '%"></i>';
        }
        
        return '<div class="booking-card ' + status + '">' +
            '<div class="booking-head">' +
                '<span class="booking-id">' + escapeHtml(b.bookingId) + receiptBadge + offerBadge + '</span>' +
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
        
        // جلب الإيصال من localStorage أو sessionStorage أو Firebase
        var receiptImg = '';
        try {
            receiptImg = localStorage.getItem('wahaj_receipt_' + bookingId);
        } catch(e) {}
        
        if (!receiptImg) {
            try { receiptImg = sessionStorage.getItem('receipt_' + bookingId); } catch(e) {}
        }
        
        if (!receiptImg && b.receiptBase64) {
            receiptImg = b.receiptBase64;
        }
        
        var receiptHtml = '';
        if (receiptImg) {
            receiptHtml = '<div class="modal-receipt">' +
                '<div style="font-size: 0.75rem; color: var(--gray-600); margin-bottom: 8px; text-align: center;">📎 إيصال الدفع</div>' +
                '<img src="' + receiptImg + '" alt="الإيصال" onclick="window.open(this.src)">' +
                '<div style="font-size: 0.7rem; color: var(--gray-600); text-align: center; margin-top: 5px;">اضغط للتكبير</div>' +
            '</div>';
        } else {
            receiptHtml = '<div class="modal-payment-section" style="background: rgba(255,193,7,0.1); border: 2px dashed var(--warning); text-align: center; padding: 20px;">' +
                '<i class="fas fa-exclamation-triangle" style="color: var(--warning); font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>' +
                '<div style="font-size: 0.85rem; color: #856404;">' +
                    'لم يتم العثور على الإيصال<br>' +
                    '<span style="font-size: 0.75rem;">قد يكون محفوظاً على جهاز العميل فقط</span>' +
                '</div>' +
            '</div>';
        }
        
        var html = 
            '<button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>' +
            '<h2>تفاصيل الحجز</h2>' +
            '<div class="modal-row"><span class="label">رقم الحجز:</span><span class="value">' + escapeHtml(b.bookingId) + '</span></div>' +
            '<div class="modal-row"><span class="label">الاسم:</span><span class="value">' + escapeHtml(b.fullName) + '</span></div>' +
            '<div class="modal-row"><span class="label">الجوال:</span><span class="value">' + escapeHtml(b.phone) + '</span></div>' +
            '<div class="modal-row"><span class="label">التاريخ:</span><span class="value">' + escapeHtml(b.dateFormatted) + '</span></div>' +
            '<div class="modal-row"><span class="label">نوع الحجز:</span><span class="value">' + escapeHtml(b.bookingType) + '</span></div>' +
            '<div class="modal-row"><span class="label">التوقيت:</span><span class="value">' + escapeHtml(b.bookingTypeDesc) + '</span></div>' +
            '<div class="modal-row"><span class="label">عدد الضيوف:</span><span class="value">' + (b.guests || '—') + '</span></div>' +
            '<div class="modal-row"><span class="label">ملاحظات:</span><span class="value">' + escapeHtml(b.notes || 'لا يوجد') + '</span></div>';
        
        // قسم العرض إذا موجود
        if (b.hasOffer && b.discount > 0) {
            html += '<div class="modal-payment-section" style="background: linear-gradient(135deg, rgba(40,167,69,0.15), rgba(40,167,69,0.05)); border: 2px dashed var(--success);">' +
                '<div class="modal-payment-section-title" style="color: var(--success);"><i class="fas fa-gift"></i> 🎁 ' + escapeHtml(b.offerTitle || 'عرض') + '</div>' +
                '<div class="modal-payment-row"><span>• السعر الأصلي:</span><strong>' + b.originalPrice + ' ر.ع</strong></div>' +
                '<div class="modal-payment-row"><span>• الخصم (' + b.discountPercent + '%):</span><strong style="color: var(--success);">- ' + b.discount + ' ر.ع</strong></div>' +
                '<div class="modal-payment-row"><span>• السعر النهائي:</span><strong>' + b.total + ' ر.ع</strong></div>' +
            '</div>';
        }
        
        html += 
            '<div class="modal-payment-section now">' +
                '<div class="modal-payment-section-title"><i class="fas fa-credit-card"></i> يُدفع الآن</div>' +
                '<div class="modal-payment-row"><span>💵 العربون' + (isFullPayment ? ' (دفع كامل)' : '') + '</span><strong>' + deposit + ' ر.ع</strong></div>' +
                '<div class="modal-payment-row"><span>🛡️ التأمين (مسترد)</span><strong>' + security + ' ر.ع</strong></div>' +
                '<div class="modal-payment-row"><span>✅ الإجمالي المطلوب</span><strong>' + payNow + ' ر.ع</strong></div>' +
            '</div>';
        
        if (remaining > 0) {
            html += '<div class="modal-payment-section later"><div class="modal-payment-section-title"><i class="fas fa-calendar-check"></i> يُدفع عند الدخول</div><div class="modal-payment-row"><span>💳 الباقي</span><strong>' + remaining + ' ر.ع</strong></div></div>';
        } else {
            html += '<div class="modal-payment-section later"><div class="modal-payment-section-title"><i class="fas fa-check-circle"></i> تم الدفع كاملاً</div><div class="modal-payment-row"><span>لا يوجد باقي ✅</span><strong>0 ر.ع</strong></div></div>';
        }
        
        html += '<div class="modal-payment-section refund"><div class="modal-payment-section-title"><i class="fas fa-undo"></i> يُرد بعد الخروج</div><div class="modal-payment-row"><span>🛡️ التأمين المسترد</span><strong>' + security + ' ر.ع</strong></div></div>';
        
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
        if (!confirm('تأكيد الحجز؟ سيتم فتح واتساب مع الرسالة المخصصة')) return;
        
        updateStatus(bookingId, 'confirmed');
        
        // استخدام الرسالة المخصصة من localStorage/Firebase
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
        
        // استخدام الرسالة المخصصة
        var template = messages.reject || DEFAULT_MESSAGES.reject;
        var msg = replaceVariables(template, b);
        
        if (reason) {
            msg = msg.replace(/\{\{reason\}\}/g, reason);
            // إضافة السبب قبل التوقيع
            if (msg.indexOf('{{reason}}') === -1) {
                msg = msg.replace('نرجو التواصل', '📝 *السبب:* ' + reason + '\n\nنرجو التواصل');
            }
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
            
            // مزامنة سحابية
            if (window.WahajFirebase) {
                window.WahajFirebase.updateBookingStatus(bookingId, newStatus).then(function(result) {
                    if (result.success) console.log('☁️ تم تحديث الحالة سحابياً');
                });
            }
            
            loadAllData();
        } catch(e) { console.warn(e); }
    }
    
    // ═══ Print Booking (صفحة واحدة منظمة) ═══
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
            '<!DOCTYPE html>' +
            '<html lang="ar" dir="rtl">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<title>فاتورة ' + b.bookingId + '</title>' +
            '<style>' +
            '@page { size: A4; margin: 8mm; }' +
            '* { margin: 0; padding: 0; box-sizing: border-box; }' +
            'body { font-family: "Cairo", Arial, sans-serif; direction: rtl; color: #0A1F44; font-size: 10.5px; line-height: 1.35; padding: 5mm; }' +
            '.header { text-align: center; border-bottom: 2.5px solid #D4AF37; padding-bottom: 6px; margin-bottom: 8px; }' +
            '.header h1 { font-size: 19px; color: #D4AF37; margin-bottom: 2px; font-weight: 900; }' +
            '.header .slogan { font-size: 9.5px; color: #6C757D; }' +
            '.header .info { font-size: 8.5px; color: #0A1F44; margin-top: 3px; }' +
            '.booking-id-box { background: #FBF8F1; border: 1.5px dashed #D4AF37; border-radius: 6px; padding: 6px 10px; text-align: center; margin-bottom: 8px; }' +
            '.booking-id-box .label { font-size: 8.5px; color: #6C757D; }' +
            '.booking-id-box .value { font-family: monospace; font-size: 14px; font-weight: 900; color: #A88B2C; letter-spacing: 1px; }' +
            '.section { margin-bottom: 6px; }' +
            '.section-title { background: linear-gradient(135deg, #0A1F44, #1A3A6B); color: #D4AF37; padding: 4px 10px; font-size: 10px; font-weight: 700; border-radius: 4px; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }' +
            'table { width: 100%; border-collapse: collapse; }' +
            'td { padding: 3.5px 8px; border-bottom: 0.5px solid #E9ECEF; font-size: 10px; vertical-align: middle; }' +
            'td.label { color: #6C757D; width: 35%; font-weight: 600; }' +
            'td.value { color: #0A1F44; font-weight: 700; text-align: left; }' +
            '.payment-section { margin-bottom: 5px; padding: 5px 8px; border-radius: 5px; }' +
            '.payment-section.now { background: #FBF8F1; border: 1.5px solid #D4AF37; }' +
            '.payment-section.later { background: #F8F9FA; border: 1.5px solid #ADB5BD; }' +
            '.payment-section.refund { background: #F0FFF4; border: 1.5px solid #28A745; }' +
            '.payment-section.discount { background: #F0FFF4; border: 1.5px dashed #28A745; }' +
            '.payment-title { font-size: 9px; font-weight: 900; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.3px; }' +
            '.payment-section.now .payment-title { color: #A88B2C; }' +
            '.payment-section.later .payment-title { color: #0A1F44; }' +
            '.payment-section.refund .payment-title { color: #28A745; }' +
            '.payment-section.discount .payment-title { color: #28A745; }' +
            '.payment-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; }' +
            '.payment-row.total { border-top: 1px dashed #D4AF37; margin-top: 3px; padding-top: 4px; font-weight: 900; font-size: 11.5px; }' +
            '.payment-row.total span:last-child { color: #A88B2C; }' +
            '.payment-section.refund .payment-row span:last-child { color: #28A745; }' +
            '.policies { background: #FBF8F1; border: 1.5px solid #D4AF37; border-radius: 5px; padding: 6px 10px; margin-bottom: 5px; }' +
            '.policies h3 { color: #A88B2C; font-size: 10px; margin-bottom: 4px; font-weight: 900; }' +
            '.policies ul { list-style: none; padding: 0; columns: 2; column-gap: 12px; }' +
            '.policies li { font-size: 8.5px; color: #0A1F44; padding: 1.5px 0; line-height: 1.4; display: flex; align-items: flex-start; gap: 4px; break-inside: avoid; }' +
            '.policies li::before { content: "•"; color: #D4AF37; font-weight: 900; flex-shrink: 0; }' +
            '.footer { text-align: center; margin-top: 8px; padding-top: 5px; border-top: 2px solid #D4AF37; font-size: 8.5px; color: #6C757D; }' +
            '.footer .thanks { color: #A88B2C; font-weight: 700; font-size: 10px; margin-bottom: 2px; }' +
            '.no-print { display: none; }' +
            '@media print { .no-print { display: none !important; } }' +
            '</style>' +
            '</head>' +
            '<body>' +
            
            // Header
            '<div class="header">' +
                '<h1>🏠 استراحة وهج</h1>' +
                '<div class="slogan">Wahaj Resort - خصوصية .. راحة .. ذكريات لا تُنسى</div>' +
                '<div class="info">📍 ولاية بركاء - الوهرة | 📞 +968 9556 6332</div>' +
            '</div>' +
            
            // Booking ID
            '<div class="booking-id-box">' +
                '<div class="label">رقم الحجز</div>' +
                '<div class="value">' + escapeHtml(b.bookingId) + '</div>' +
            '</div>' +
            
            // Customer Info
            '<div class="section">' +
                '<div class="section-title"><i>👤</i> بيانات العميل</div>' +
                '<table>' +
                    '<tr><td class="label">الاسم:</td><td class="value">' + escapeHtml(b.fullName) + '</td></tr>' +
                    '<tr><td class="label">الجوال:</td><td class="value">' + escapeHtml(b.phone) + '</td></tr>' +
                    '<tr><td class="label">عدد الضيوف:</td><td class="value">' + (b.guests || '—') + ' أشخاص</td></tr>' +
                    (b.notes ? '<tr><td class="label">ملاحظات:</td><td class="value">' + escapeHtml(b.notes) + '</td></tr>' : '') +
                '</table>' +
            '</div>' +
            
            // Booking Details
            '<div class="section">' +
                '<div class="section-title"><i>📅</i> تفاصيل الحجز</div>' +
                '<table>' +
                    '<tr><td class="label">التاريخ:</td><td class="value">' + escapeHtml(b.dateFormatted) + '</td></tr>' +
                    '<tr><td class="label">نوع اليوم:</td><td class="value">' + escapeHtml(b.dayType) + '</td></tr>' +
                    '<tr><td class="label">نوع الحجز:</td><td class="value">' + escapeHtml(b.bookingType) + '</td></tr>' +
                    '<tr><td class="label">التوقيت:</td><td class="value">' + escapeHtml(b.bookingTypeDesc) + '</td></tr>' +
                '</table>' +
            '</div>';
        
        // Discount section
        if (b.hasOffer && b.discount > 0) {
            content += 
                '<div class="payment-section discount">' +
                    '<div class="payment-title">🎁 ' + escapeHtml(b.offerTitle || 'عرض خاص') + ' - خصم ' + b.discountPercent + '%</div>' +
                    '<div class="payment-row"><span>السعر الأصلي</span><span style="text-decoration: line-through; opacity: 0.6;">' + b.originalPrice + ' ر.ع</span></div>' +
                    '<div class="payment-row"><span>الخصم</span><span style="color: #28A745; font-weight: 900;">- ' + b.discount + ' ر.ع</span></div>' +
                    '<div class="payment-row total"><span>السعر النهائي</span><span>' + total + ' ر.ع</span></div>' +
                '</div>';
        }
        
        // Payment NOW
        content += 
            '<div class="payment-section now">' +
                '<div class="payment-title">💳 يُدفع الآن (تحويل بنكي)</div>' +
                '<div class="payment-row"><span>💵 العربون' + (isFullPayment ? ' (دفع كامل)' : '') + '</span><span>' + deposit + ' ر.ع</span></div>' +
                '<div class="payment-row"><span>🛡️ التأمين المسترد</span><span>' + security + ' ر.ع</span></div>' +
                '<div class="payment-row total"><span>✅ الإجمالي المطلوب</span><span>' + payNow + ' ر.ع</span></div>' +
            '</div>';
        
        // Payment LATER
        if (remaining > 0) {
            content += 
                '<div class="payment-section later">' +
                    '<div class="payment-title">📅 يُدفع عند الدخول</div>' +
                    '<div class="payment-row"><span>💳 الباقي</span><span>' + remaining + ' ر.ع</span></div>' +
                '</div>';
        } else {
            content += 
                '<div class="payment-section later" style="background: #F0FFF4; border-color: #28A745;">' +
                    '<div class="payment-title" style="color: #28A745;">✅ تم الدفع كاملاً</div>' +
                    '<div class="payment-row"><span>لا يوجد باقي</span><span>0 ر.ع</span></div>' +
                '</div>';
        }
        
        // Refund section
        content += 
            '<div class="payment-section refund">' +
                '<div class="payment-title">♻️ يُرد بعد الخروج</div>' +
                '<div class="payment-row"><span>🛡️ التأمين المسترد</span><span>' + security + ' ر.ع</span></div>' +
            '</div>';
        
        // Policies
        content += 
            '<div class="policies">' +
                '<h3>📋 سياسات مهمة</h3>' +
                '<ul>' +
                    '<li>الالتزام بأوقات الدخول والخروج</li>' +
                    '<li>يُمنع الأكل والشرب في المسابح</li>' +
                    '<li>يُمنع دخول الغرف بالملابس المبللة</li>' +
                    '<li>المحافظة على المرافق والاثاث</li>' +
                    '<li>تسليم الاستراحة نظيفة</li>' +
                    '<li>التأمين يُرد بعد التأكد من النظافة</li>' +
                    '<li>عدم ترك الأطفال بدون مراقبة</li>' +
                    '<li>إشعال النار في أماكن الشواء فقط</li>' +
                '</ul>' +
            '</div>';
        
        // Footer
        content += 
            '<div class="footer">' +
                '<div class="thanks">🌟 شكراً لثقتكم بنا</div>' +
                '<div>© 2026 استراحة وهج - جميع الحقوق محفوظة</div>' +
            '</div>' +
            
            '</body>' +
            '</html>';
        
        // فتح نافذة طباعة جديدة
        var printWindow = window.open('', '_blank');
        printWindow.document.write(content);
        printWindow.document.close();
        
        printWindow.onload = function() {
            setTimeout(function() {
                printWindow.print();
            }, 500);
        };
        
        showToast('✅ جاهز للطباعة', 'success');
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
            
            // حذف الإيصال
            try { localStorage.removeItem('wahaj_receipt_' + bookingId); } catch(e) {}
            try { sessionStorage.removeItem('receipt_' + bookingId); } catch(e) {}
            
            // حذف سحابي
            if (window.WahajFirebase) {
                window.WahajFirebase.deleteBooking(bookingId).then(function() {
                    console.log('☁️ تم الحذف سحابياً');
                });
            }
            
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
        var item = blockedDates[index];
        var date = item.date || item;
        
        blockedDates.splice(index, 1);
        localStorage.setItem('wahaj_blocked_dates', JSON.stringify(blockedDates));
        
        if (window.WahajFirebase) {
            window.WahajFirebase.removeBlockedDate(date).then(function() {
                console.log('☁️ تم حذف الحجب سحابياً');
            });
        }
        
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
        
        var newBlock = { date: date, type: type, reason: reason };
        blockedDates.push(newBlock);
        localStorage.setItem('wahaj_blocked_dates', JSON.stringify(blockedDates));
        
        if (window.WahajFirebase) {
            window.WahajFirebase.addBlockedDate(date, type, reason).then(function(result) {
                if (result.success) console.log('☁️ تم الحجب سحابياً');
            });
        }
        
        document.getElementById('blockDate').value = '';
        document.getElementById('blockReason').value = '';
        
        renderBlockedList();
        updateSettingsCounts();
        showToast('✅ تم إضافة الحجب', 'success');
    };
    
    // ═══ Messages ═══
    function renderMessagesForm() {
        var el;
        el = document.getElementById('msgConfirm'); if (el) el.value = messages.confirm || DEFAULT_MESSAGES.confirm;
        el = document.getElementById('msgReject'); if (el) el.value = messages.reject || DEFAULT_MESSAGES.reject;
        el = document.getElementById('msgReminder'); if (el) el.value = messages.reminder || DEFAULT_MESSAGES.reminder;
    }
    
    window.saveMessage = function(type) {
        var textarea = document.getElementById('msg' + type.charAt(0).toUpperCase() + type.slice(1));
        if (!textarea) return;
        
        messages[type] = textarea.value;
        localStorage.setItem('wahaj_messages', JSON.stringify(messages));
        
        if (window.WahajFirebase) {
            window.WahajFirebase.saveSetting('messages', messages).then(function(result) {
                if (result.success) console.log('☁️ تم حفظ الرسائل سحابياً');
            });
        }
        
        showToast('✅ تم حفظ الرسالة', 'success');
    };
    
    window.resetMessage = function(type) {
        if (!confirm('استرجاع الرسالة الافتراضية؟')) return;
        
        messages[type] = DEFAULT_MESSAGES[type];
        localStorage.setItem('wahaj_messages', JSON.stringify(messages));
        
        if (window.WahajFirebase) {
            window.WahajFirebase.saveSetting('messages', messages);
        }
        
        renderMessagesForm();
        showToast('✅ تم الاسترجاع', 'success');
    };
    
    // ═══ Images ═══
    function renderImagesGrid() {
        var grid = document.getElementById('imagesGrid');
        if (!grid) return;
        
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
        
        var imageData = { name: name, path: path };
        
        if (window.WahajFirebase) {
            window.WahajFirebase.addImage(imageData).then(function(result) {
                if (result.success) {
                    console.log('☁️ تم حفظ الصورة سحابياً');
                    loadAllData();
                }
            });
        } else {
            images.push(imageData);
            localStorage.setItem('wahaj_images', JSON.stringify(images));
            renderImagesGrid();
            updateSettingsCounts();
        }
        
        document.getElementById('imgName').value = '';
        document.getElementById('imgPath').value = '';
        
        showToast('✅ تم إضافة الصورة', 'success');
    };
    
    window.removeImage = function(index) {
        if (!confirm('حذف الصورة؟')) return;
        
        var img = images[index];
        
        if (img.id && window.WahajFirebase) {
            window.WahajFirebase.deleteImage(img.id).then(function() {
                images.splice(index, 1);
                renderImagesGrid();
                updateSettingsCounts();
                showToast('تم الحذف', 'success');
            });
        } else {
            images.splice(index, 1);
            localStorage.setItem('wahaj_images', JSON.stringify(images));
            renderImagesGrid();
            updateSettingsCounts();
            showToast('تم الحذف', 'success');
        }
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
        
        var offerData = {
            title: title, desc: desc, start: start, end: end, discount: discount, active: true
        };
        
        if (window.WahajFirebase) {
            window.WahajFirebase.addOffer(offerData).then(function(result) {
                if (result.success) {
                    console.log('☁️ تم حفظ العرض سحابياً');
                    loadAllData();
                }
            });
        } else {
            offers.push(Object.assign({}, offerData, { createdAt: new Date().toISOString() }));
            localStorage.setItem('wahaj_offers', JSON.stringify(offers));
            renderOffersList();
            updateSettingsCounts();
        }
        
        document.getElementById('offerTitle').value = '';
        document.getElementById('offerDesc').value = '';
        document.getElementById('offerStart').value = '';
        document.getElementById('offerEnd').value = '';
        document.getElementById('offerDiscount').value = '';
        
        showToast('✅ تم إضافة العرض', 'success');
    };
    
    window.removeOffer = function(index) {
        if (!confirm('حذف العرض؟')) return;
        
        var offer = offers[index];
        
        if (offer.id && window.WahajFirebase) {
            window.WahajFirebase.deleteOffer(offer.id).then(function() {
                offers.splice(index, 1);
                renderOffersList();
                updateSettingsCounts();
                showToast('تم الحذف', 'success');
            });
        } else {
            offers.splice(index, 1);
            localStorage.setItem('wahaj_offers', JSON.stringify(offers));
            renderOffersList();
            updateSettingsCounts();
            showToast('تم الحذف', 'success');
        }
    };
    
    window.toggleOffer = function(index) {
        offers[index].active = !offers[index].active;
        localStorage.setItem('wahaj_offers', JSON.stringify(offers));
        
        if (offers[index].id && window.WahajFirebase) {
            window.WahajFirebase.updateOffer(offers[index].id, { active: offers[index].active });
        }
        
        renderOffersList();
        showToast(offers[index].active ? '✅ تم التفعيل' : 'تم الإيقاف', 'success');
    };
    
    // ═══ Prices ═══
    function renderPricesForm() {
        var el;
        el = document.getElementById('weekdayWithoutStay'); if (el) el.value = prices.weekdayWithoutStay || 40;
        el = document.getElementById('weekdayWithStay'); if (el) el.value = prices.weekdayWithStay || 50;
        el = document.getElementById('weekdayHalfDay'); if (el) el.value = prices.weekdayHalfDay || 25;
        el = document.getElementById('weekendWithoutStay'); if (el) el.value = prices.weekendWithoutStay || 50;
        el = document.getElementById('weekendWithStay'); if (el) el.value = prices.weekendWithStay || 65;
        el = document.getElementById('weekendHalfDay'); if (el) el.value = prices.weekendHalfDay || 30;
        el = document.getElementById('securityDeposit'); if (el) el.value = prices.securityDeposit || 20;
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
        
        if (window.WahajFirebase) {
            window.WahajFirebase.saveSetting('prices', prices).then(function(result) {
                if (result.success) console.log('☁️ تم حفظ الأسعار سحابياً');
            });
        }
        
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
        
        // مسح الإيصالات
        try {
            Object.keys(localStorage).forEach(function(key) {
                if (key.indexOf('wahaj_receipt_') === 0) {
                    localStorage.removeItem(key);
                }
            });
        } catch(e) {}
        
        loadAllData();
        showToast('✅ تم مسح البيانات', 'success');
    };
    
    // ═══ Events ═══
    document.getElementById('loginBtn').onclick = handleLogin;
    document.getElementById('passwordInput').onkeypress = function(e) {
        if (e.key === 'Enter') handleLogin();
    };
    
    var statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.onchange = function() {
            currentFilter = this.value;
            applyFilters();
        };
    }
    
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.oninput = function() {
            currentSearch = this.value;
            applyFilters();
        };
    }
    
    // ═══ Init ═══
    if (sessionStorage.getItem('wahaj_admin') === '1') {
        showAdmin();
    }
    
    console.log('✅ لوحة التحكم جاهزة (Firebase + Receipt + Print)');
    
    // ═══ Load from Firebase ═══
    async function loadFromCloud() {
        if (!window.WahajFirebase) return;
        
        window.WahajFirebase.waitForFirebase(async function(ready) {
            if (!ready) return;
            
            console.log('☁️ تحميل من السحابة...');
            
            try {
                var cloudBookings = await window.WahajFirebase.getAllBookings();
                
                if (cloudBookings && cloudBookings.length > 0) {
                    var merged = {};
                    allBookings.forEach(function(b) { merged[b.bookingId] = b; });
                    cloudBookings.forEach(function(b) {
                        b._source = 'cloud';
                        merged[b.bookingId] = b;
                    });
                    allBookings = Object.values(merged);
                    allBookings.sort(function(a, b) {
                        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    });
                    console.log('☁️ محمّل', cloudBookings.length, 'حجز');
                }
                
                var cloudBlocked = await window.WahajFirebase.getAllBlockedDates();
                if (cloudBlocked && cloudBlocked.length > 0) {
                    blockedDates = cloudBlocked;
                }
                
                var cloudOffers = await window.WahajFirebase.getAllOffers();
                if (cloudOffers && cloudOffers.length > 0) {
                    offers = cloudOffers;
                }
                
                var cloudImages = await window.WahajFirebase.getAllImages();
                if (cloudImages && cloudImages.length > 0) {
                    images = cloudImages;
                }
                
                var cloudPrices = await window.WahajFirebase.getSetting('prices', null);
                if (cloudPrices) {
                    prices = Object.assign({}, DEFAULT_PRICES, cloudPrices);
                }
                
                var cloudMessages = await window.WahajFirebase.getSetting('messages', null);
                if (cloudMessages) {
                    messages = Object.assign({}, DEFAULT_MESSAGES, cloudMessages);
                }
                
                updateStats();
                applyFilters();
                renderBlockedList();
                renderOffersList();
                renderImagesGrid();
                renderPricesForm();
                renderMessagesForm();
                updateSettingsCounts();
                updateBadge();
                
                console.log('✅ تمت المزامنة');
                
            } catch(e) {
                console.error('❌ فشل:', e);
            }
        }, 8000);
    }
    
    window.addEventListener('load', function() {
        setTimeout(loadFromCloud, 1500);
    });
    
    setInterval(function() {
        if (sessionStorage.getItem('wahaj_admin') === '1') {
            loadFromCloud();
        }
    }, 30000);
    
})();
