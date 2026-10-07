/* ═══════════════════════════════════════════════════════
   استراحة وهج - الترقيات الاحترافية للوحة التحكم
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    console.log('🚀 تحميل الترقيات...');
    
    // ═══════════════════════════════════════════════════════
    // 🔔 إشعار صوتي + بصري
    // ═══════════════════════════════════════════════════════
    
    var lastBookingsCount = 0;
    var audioEnabled = true;
    var notificationSound = null;
    
    // إنشاء الصوت (Base64 - بدون ملف خارجي)
    function initSound() {
        try {
            // نغمة بسيطة باستخدام Web Audio API
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            window._audioCtx = new AudioContext();
            console.log('🔊 الصوت جاهز');
        } catch(e) {
            console.warn('⚠️ الصوت غير مدعوم');
        }
    }
    
    function playNotificationSound() {
        if (!audioEnabled) return;
        
        try {
            if (!window._audioCtx) {
                var AC = window.AudioContext || window.webkitAudioContext;
                if (AC) window._audioCtx = new AC();
            }
            
            var ctx = window._audioCtx;
            if (!ctx) return;
            
            // نغمة تنبيه (3 نوتات)
            var notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            var now = ctx.currentTime;
            
            notes.forEach(function(freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                var startTime = now + (i * 0.15);
                var endTime = startTime + 0.2;
                
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, endTime);
                
                osc.start(startTime);
                osc.stop(endTime);
            });
            
            // اهتزاز للجوال
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            
            console.log('🔔 تم تشغيل التنبيه');
        } catch(e) {
            console.warn('فشل الصوت:', e);
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // 📊 الإحصائيات المتقدمة
    // ═══════════════════════════════════════════════════════
    
    function calculateAdvancedStats() {
        var bookings = [];
        try {
            bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
        } catch(e) {}
        
        var stats = {
            total: bookings.length,
            pending: 0,
            confirmed: 0,
            rejected: 0,
            revenue: 0,
            avgBooking: 0,
            thisMonth: 0,
            nextMonth: 0,
            topMonth: null,
            topMonthCount: 0,
            occupancy: 0
        };
        
        var monthCounts = {};
        var now = new Date();
        var thisMonthKey = now.getFullYear() + '-' + (now.getMonth() + 1);
        
        var nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        var nextMonthKey = nextMonthDate.getFullYear() + '-' + (nextMonthDate.getMonth() + 1);
        
        bookings.forEach(function(b) {
            var status = b.status || 'pending';
            if (status === 'pending') stats.pending++;
            if (status === 'confirmed') stats.confirmed++;
            if (status === 'rejected') stats.rejected++;
            
            if (status === 'confirmed') {
                stats.revenue += b.total || 0;
            }
            
            // إحصاء الشهور
            if (b.date) {
                var dateParts = b.date.split('-');
                var monthKey = dateParts[0] + '-' + parseInt(dateParts[1]);
                monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
                
                if (monthKey === thisMonthKey) stats.thisMonth++;
                if (monthKey === nextMonthKey) stats.nextMonth++;
            }
        });
        
        // الشهر الأعلى
        Object.keys(monthCounts).forEach(function(m) {
            if (monthCounts[m] > stats.topMonthCount) {
                stats.topMonthCount = monthCounts[m];
                stats.topMonth = m;
            }
        });
        
        // متوسط الحجز
        if (stats.confirmed > 0) {
            stats.avgBooking = Math.round(stats.revenue / stats.confirmed);
        }
        
        // نسبة الإشغال (تقريبي - لو 30 يوم في الشهر)
        if (stats.confirmed > 0) {
            stats.occupancy = Math.min(100, Math.round((stats.confirmed / 30) * 100));
        }
        
        return stats;
    }
    
    function renderAdvancedStats() {
        var stats = calculateAdvancedStats();
        
        // إنشاء لوحة الإحصائيات
        var existing = document.getElementById('advancedStatsPanel');
        if (existing) existing.remove();
        
        var page = document.getElementById('page-dashboard');
        if (!page) return;
        
        var panel = document.createElement('div');
        panel.id = 'advancedStatsPanel';
        panel.style.cssText = 'background: linear-gradient(135deg, var(--navy), var(--navy-light)); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; color: white; box-shadow: var(--shadow-lg);';
        
        var monthName = stats.topMonth ? getArabicMonth(stats.topMonth) : '—';
        
        panel.innerHTML = 
            '<h3 style="color: var(--primary); font-family: Amiri, serif; font-size: 1.1rem; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">' +
                '<i class="fas fa-chart-line"></i> إحصائيات متقدمة' +
            '</h3>' +
            
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">' +
                '<div style="background: rgba(212,175,55,0.15); border-radius: 12px; padding: 12px; text-align: center; border: 1px solid rgba(212,175,55,0.3);">' +
                    '<div style="font-size: 1.4rem; font-weight: 900; color: var(--primary);">' + stats.avgBooking + '</div>' +
                    '<div style="font-size: 0.7rem; opacity: 0.8;">متوسط الحجز (ر.ع)</div>' +
                '</div>' +
                
                '<div style="background: rgba(40,167,69,0.15); border-radius: 12px; padding: 12px; text-align: center; border: 1px solid rgba(40,167,69,0.3);">' +
                    '<div style="font-size: 1.4rem; font-weight: 900; color: var(--success);">' + stats.occupancy + '%</div>' +
                    '<div style="font-size: 0.7rem; opacity: 0.8;">نسبة الإشغال</div>' +
                '</div>' +
                
                '<div style="background: rgba(23,162,184,0.15); border-radius: 12px; padding: 12px; text-align: center; border: 1px solid rgba(23,162,184,0.3);">' +
                    '<div style="font-size: 1.4rem; font-weight: 900; color: #17A2B8;">' + stats.thisMonth + '</div>' +
                    '<div style="font-size: 0.7rem; opacity: 0.8;">هذا الشهر</div>' +
                '</div>' +
                
                '<div style="background: rgba(255,193,7,0.15); border-radius: 12px; padding: 12px; text-align: center; border: 1px solid rgba(255,193,7,0.3);">' +
                    '<div style="font-size: 1.4rem; font-weight: 900; color: #FFC107;">' + stats.nextMonth + '</div>' +
                    '<div style="font-size: 0.7rem; opacity: 0.8;">الشهر القادم</div>' +
                '</div>' +
            '</div>' +
            
            (stats.topMonth ? 
                '<div style="margin-top: 12px; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px; text-align: center; font-size: 0.8rem;">' +
                    '🏆 <strong>الأكثر طلباً:</strong> ' + monthName + ' (' + stats.topMonthCount + ' حجز)' +
                '</div>' : ''
            );
        
        // إدراجها بعد أول stats-grid
        var statsGrid = page.querySelector('.stats-grid');
        if (statsGrid && statsGrid.parentNode) {
            statsGrid.parentNode.insertBefore(panel, statsGrid.nextSibling);
        }
    }
    
    function getArabicMonth(key) {
        var parts = key.split('-');
        var monthIndex = parseInt(parts[1]) - 1;
        var months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return months[monthIndex] || key;
    }
    
    // ═══════════════════════════════════════════════════════
    // 💬 الردود السريعة
    // ═══════════════════════════════════════════════════════
    
    var QUICK_REPLIES = {
        confirm: '✅ *تم تأكيد حجزك* - استراحة وهج\n\nشكراً لثقتك بنا 🌟\nبانتظارك',
        payment: '💰 *تذكير بدفع المبلغ*\n\nنذكرك بضرورة دفع المبلغ المتبقي قبل موعد حجزك.\n\nشكراً لك 🌟',
        welcome: '🏠 *أهلاً وسهلاً بك*\n\nمرحباً بك في استراحة وهج!\nنتمنى لك إقامة ممتعة 🌟',
        thanks: '🌟 *شكراً لزيارتك*\n\nنأمل أنك استمتعت بإقامتك.\nنتشرف بزيارتك مرة أخرى 🌟',
        info: '📋 *معلومات استراحة وهج*\n\n📍 بركاء - العقدة\n📞 +968 9556 6332\n\nكيف يمكننا مساعدتك؟',
        sorry: '😔 *نعتذر*\n\nنأسف لعدم تمكننا من تلبية طلبك.\nنتمنى لك التوفيق 🌟'
    };
    
    function getQuickReply(type, booking) {
        var template = QUICK_REPLIES[type] || '';
        
        if (booking) {
            template = template.replace(/\{\{name\}\}/g, booking.fullName || '');
        }
        
        return template;
    }
    
    function addQuickRepliesToModal(booking) {
        setTimeout(function() {
            var modal = document.getElementById('modalContent');
            if (!modal) return;
            
            // تحقق إذا موجود
            if (modal.querySelector('.quick-replies-section')) return;
            
            var section = document.createElement('div');
            section.className = 'quick-replies-section';
            section.style.cssText = 'margin-top: 15px; padding-top: 15px; border-top: 2px dashed var(--gray-200);';
            
            section.innerHTML = 
                '<div style="font-size: 0.8rem; font-weight: 700; color: var(--navy); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">' +
                    '<i class="fas fa-bolt" style="color: var(--primary);"></i>' +
                    'ردود سريعة' +
                '</div>' +
                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">' +
                    '<button onclick="window.__sendQuickReply(\'' + booking.phone + '\', \'confirm\')" style="padding: 8px; background: linear-gradient(135deg, #28A745, #20C997); color: white; border: none; border-radius: 8px; font-family: Cairo, sans-serif; font-size: 0.7rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">' +
                        '<i class="fas fa-check-circle"></i> تأكيد' +
                    '</button>' +
                    '<button onclick="window.__sendQuickReply(\'' + booking.phone + '\', \'payment\')" style="padding: 8px; background: linear-gradient(135deg, #FFC107, #E0A800); color: #0A1F44; border: none; border-radius: 8px; font-family: Cairo, sans-serif; font-size: 0.7rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">' +
                        '<i class="fas fa-money-bill"></i> تذكير دفع' +
                    '</button>' +
                    '<button onclick="window.__sendQuickReply(\'' + booking.phone + '\', \'welcome\')" style="padding: 8px; background: linear-gradient(135deg, #17A2B8, #138496); color: white; border: none; border-radius: 8px; font-family: Cairo, sans-serif; font-size: 0.7rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">' +
                        '<i class="fas fa-home"></i> ترحيب' +
                    '</button>' +
                    '<button onclick="window.__sendQuickReply(\'' + booking.phone + '\', \'thanks\')" style="padding: 8px; background: linear-gradient(135deg, #D4AF37, #A88B2C); color: white; border: none; border-radius: 8px; font-family: Cairo, sans-serif; font-size: 0.7rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">' +
                        '<i class="fas fa-star"></i> شكر' +
                    '</button>' +
                    '<button onclick="window.__sendQuickReply(\'' + booking.phone + '\', \'info\')" style="grid-column: span 2; padding: 8px; background: linear-gradient(135deg, #6C757D, #495057); color: white; border: none; border-radius: 8px; font-family: Cairo, sans-serif; font-size: 0.7rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">' +
                        '<i class="fas fa-info-circle"></i> إرسال معلومات الاستراحة' +
                    '</button>' +
                '</div>';
            
            modal.appendChild(section);
        }, 100);
    }
    
    window.__sendQuickReply = function(phone, type) {
        var message = getQuickReply(type);
        var cleanPhone = phone.replace(/[^0-9]/g, '');
        var fullPhone = cleanPhone.indexOf('968') === 0 ? cleanPhone : '968' + cleanPhone;
        
        window.open('https://wa.me/' + fullPhone + '?text=' + encodeURIComponent(message), '_blank');
    };
    
    // ═══════════════════════════════════════════════════════
    // 📅 تقويم الإشغال
    // ═══════════════════════════════════════════════════════
    
    function renderOccupancyCalendar() {
        var container = document.getElementById('occupancyCalendarContainer');
        if (!container) return;
        
        var bookings = [];
        try {
            bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
        } catch(e) {}
        
        var blocked = [];
        try {
            blocked = JSON.parse(localStorage.getItem('wahaj_blocked_dates') || '[]');
        } catch(e) {}
        
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth();
        
        var firstDay = new Date(year, month, 1);
        var lastDay = new Date(year, month + 1, 0);
        var daysInMonth = lastDay.getDate();
        var startDay = firstDay.getDay();
        
        var monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        // بناء خريطة الحجوزات
        var bookingsMap = {};
        var blockedMap = {};
        
        bookings.forEach(function(b) {
            if (b.status === 'confirmed' || b.status === 'pending') {
                var dateParts = (b.date || '').split('-');
                if (dateParts.length === 3) {
                    var key = parseInt(dateParts[2]);
                    if (parseInt(dateParts[0]) === year && parseInt(dateParts[1]) === (month + 1)) {
                        bookingsMap[key] = b;
                    }
                }
            }
        });
        
        blocked.forEach(function(b) {
            var date = b.date || b;
            var dateParts = date.split('-');
            if (dateParts.length === 3) {
                var key = parseInt(dateParts[2]);
                if (parseInt(dateParts[0]) === year && parseInt(dateParts[1]) === (month + 1)) {
                    blockedMap[key] = b;
                }
            }
        });
        
        var html = 
            '<div style="text-align: center; margin-bottom: 15px;">' +
                '<h3 style="color: var(--navy); font-family: Amiri, serif; font-size: 1.1rem;">' + monthNames[month] + ' ' + year + '</h3>' +
            '</div>' +
            
            '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 0.65rem; font-weight: 700; color: var(--gray-600); margin-bottom: 8px;">' +
                '<div>أحد</div><div>اثن</div><div>ثلا</div><div>أرب</div><div>خمي</div><div>جمع</div><div>سبت</div>' +
            '</div>' +
            
            '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">';
        
        // أيام فارغة
        for (var i = 0; i < startDay; i++) {
            html += '<div></div>';
        }
        
        // الأيام
        for (var day = 1; day <= daysInMonth; day++) {
            var isBlocked = blockedMap[day];
            var booking = bookingsMap[day];
            var style = '';
            var title = '';
            
            if (isBlocked) {
                style = 'background: linear-gradient(135deg, #FFE5E5, #FFCCCC); color: #DC3545; border: 1px solid #DC3545;';
                title = '🚫 ' + (isBlocked.reason || 'محجوز');
            } else if (booking) {
                if (booking.status === 'confirmed') {
                    style = 'background: linear-gradient(135deg, #D4EDDA, #C3E6CB); color: #155724; border: 1px solid #28A745;';
                    title = '✅ ' + (booking.fullName || '');
                } else if (booking.status === 'pending') {
                    style = 'background: linear-gradient(135deg, #FFF3CD, #FFEBA5); color: #856404; border: 1px solid #FFC107;';
                    title = '⏳ ' + (booking.fullName || '');
                }
            } else {
                style = 'background: white; color: var(--navy); border: 1px solid var(--gray-200);';
            }
            
            html += '<div style="aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 700; font-size: 0.8rem; ' + style + '" title="' + title + '">' + day + '</div>';
        }
        
        html += '</div>';
        
        // مفتاح
        html += 
            '<div style="display: flex; justify-content: center; gap: 12px; margin-top: 15px; font-size: 0.7rem; flex-wrap: wrap;">' +
                '<div style="display: flex; align-items: center; gap: 4px;">' +
                    '<div style="width: 12px; height: 12px; background: linear-gradient(135deg, #D4EDDA, #C3E6CB); border: 1px solid #28A745; border-radius: 3px;"></div>' +
                    '<span>مؤكد</span>' +
                '</div>' +
                '<div style="display: flex; align-items: center; gap: 4px;">' +
                    '<div style="width: 12px; height: 12px; background: linear-gradient(135deg, #FFF3CD, #FFEBA5); border: 1px solid #FFC107; border-radius: 3px;"></div>' +
                    '<span>بانتظار</span>' +
                '</div>' +
                '<div style="display: flex; align-items: center; gap: 4px;">' +
                    '<div style="width: 12px; height: 12px; background: linear-gradient(135deg, #FFE5E5, #FFCCCC); border: 1px solid #DC3545; border-radius: 3px;"></div>' +
                    '<span>محجوب</span>' +
                '</div>' +
                '<div style="display: flex; align-items: center; gap: 4px;">' +
                    '<div style="width: 12px; height: 12px; background: white; border: 1px solid #E9ECEF; border-radius: 3px;"></div>' +
                    '<span>متاح</span>' +
                '</div>' +
            '</div>';
        
        container.innerHTML = html;
    }
    
    // ═══════════════════════════════════════════════════════
    // 📤 مشاركة الموقع
    // ═══════════════════════════════════════════════════════
    
    function shareWebsite() {
        var url = 'https://samir9627-cmd.github.io/wahaj_resort/';
        var text = '🏠 استراحة وهج - بركاء\n\nاحجز الآن:\n' + url + '\n\n📍 بركاء - العقدة\n📞 +968 9556 6332';
        
        if (navigator.share) {
            navigator.share({
                title: 'استراحة وهج',
                text: 'استراحة عائلية فاخرة في بركاء',
                url: url
            }).catch(function() {
                copyToClipboard(text);
            });
        } else {
            copyToClipboard(text);
        }
    }
    
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                showUpgradeToast('✅ تم نسخ الرابط');
            });
        } else {
            prompt('انسخ الرابط:', text);
        }
    }
    
    function showUpgradeToast(msg) {
        var t = document.getElementById('toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.className = 'toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.className = 'toast show success';
        setTimeout(function() { t.classList.remove('show'); }, 2500);
    }
    
    // ═══════════════════════════════════════════════════════
    // 🔄 مراقبة الحجوزات الجديدة
    // ═══════════════════════════════════════════════════════
    
    function checkForNewBookings() {
        try {
            var bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
            var pending = bookings.filter(function(b) { return (b.status || 'pending') === 'pending'; });
            
            if (lastBookingsCount === 0) {
                lastBookingsCount = pending.length;
                return;
            }
            
            if (pending.length > lastBookingsCount) {
                // حجز جديد!
                console.log('🔔 حجز جديد!');
                playNotificationSound();
                showUpgradeToast('🔔 حجز جديد وصل!');
                lastBookingsCount = pending.length;
                
                // تحديث اللوحة
                if (typeof loadAllData === 'function') {
                    try { loadAllData(); } catch(e) {}
                }
            } else {
                lastBookingsCount = pending.length;
            }
        } catch(e) {}
    }
    
    // ═══════════════════════════════════════════════════════
    // 🎯 Timeline الحجز
    // ═══════════════════════════════════════════════════════
    
    var BOOKING_STATUSES = ['pending', 'confirmed', 'in_stay', 'completed'];
    var STATUS_LABELS = {
        pending: '⏳ بانتظار التأكيد',
        confirmed: '✅ مؤكد',
        in_stay: '🏠 في الإقامة',
        completed: '🎉 منتهي'
    };
    
    // ═══════════════════════════════════════════════════════
    // 🎨 إضافة الأزرار السريعة
    // ═══════════════════════════════════════════════════════
    
    function addExtraQuickActions() {
        var quickActions = document.querySelector('.quick-actions');
        if (!quickActions) return;
        
        // تحقق إذا موجود
        if (document.getElementById('shareQuickBtn')) return;
        
        // تحويل grid إلى 4 أعمدة
        quickActions.style.gridTemplateColumns = 'repeat(4, 1fr)';
        
        var shareBtn = document.createElement('div');
        shareBtn.className = 'quick-action';
        shareBtn.id = 'shareQuickBtn';
        shareBtn.onclick = shareWebsite;
        shareBtn.innerHTML = 
            '<div class="quick-action-icon" style="background: linear-gradient(135deg, #25D366, #128C7E); color: white;">' +
                '<i class="fas fa-share-alt"></i>' +
            '</div>' +
            '<div class="quick-action-label">مشاركة</div>';
        
        quickActions.appendChild(shareBtn);
    }
    
    // ═══════════════════════════════════════════════════════
    // 📅 صفحة تقويم الإشغال
    // ═══════════════════════════════════════════════════════
    
    function addOccupancyPage() {
        var adminContainer = document.querySelector('.admin-container');
        if (!adminContainer) return;
        
        if (document.getElementById('page-occupancy')) return;
        
        var page = document.createElement('div');
        page.className = 'page';
        page.id = 'page-occupancy';
        page.innerHTML = 
            '<h1 class="page-title">تقويم الإشغال</h1>' +
            '<div class="block-section" style="padding: 20px;">' +
                '<div id="occupancyCalendarContainer"></div>' +
            '</div>' +
            '<div class="block-section">' +
                '<h3><i class="fas fa-info-circle"></i> معلومات</h3>' +
                '<p style="color: var(--gray-600); font-size: 0.85rem; line-height: 1.8;">' +
                    'يعرض هذا التقويم حالة كل يوم في الشهر الحالي:<br>' +
                    '🟢 <strong>مؤكد</strong> - حجز مؤكد<br>' +
                    '🟡 <strong>بانتظار</strong> - طلب جديد<br>' +
                    '🔴 <strong>محجوب</strong> - صيانة أو حجز شخصي<br>' +
                    '⚪ <strong>متاح</strong> - يمكن الحجز' +
                '</p>' +
            '</div>';
        
        adminContainer.appendChild(page);
    }
    
    function addOccupancyNavButton() {
        var bottomNav = document.querySelector('.admin-bottom-nav');
        if (!bottomNav) return;
        
        if (document.getElementById('navOccupancy')) return;
        
        var btn = document.createElement('button');
        btn.className = 'admin-nav-item';
        btn.id = 'navOccupancy';
        btn.setAttribute('data-page', 'occupancy');
        btn.onclick = function() {
            // استدعاء الدالة الأصلية
            if (typeof switchPage === 'function') {
                switchPage('occupancy');
            } else {
                document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
                document.querySelectorAll('.admin-nav-item').forEach(function(n) { n.classList.remove('active'); });
                var page = document.getElementById('page-occupancy');
                if (page) page.classList.add('active');
                btn.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            // رسم التقويم
            setTimeout(renderOccupancyCalendar, 100);
        };
        btn.innerHTML = 
            '<i class="fas fa-calendar-alt"></i>' +
            '<span>إشغال</span>';
        
        // إدراج قبل زر الإعدادات
        var settingsBtn = bottomNav.querySelector('[data-page="settings"]');
        if (settingsBtn) {
            bottomNav.insertBefore(btn, settingsBtn);
        } else {
            bottomNav.appendChild(btn);
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // 🚀 Init
    // ═══════════════════════════════════════════════════════
    
    function init() {
        // انتظر حتى تتحمل اللوحة
        setTimeout(function() {
            var adminPanel = document.getElementById('adminPanel');
            if (!adminPanel || !adminPanel.classList.contains('show')) {
                // اللوحة ما تفتح بعد - انتظر
                setTimeout(init, 1500);
                return;
            }
            
            console.log('🔧 تشغيل الترقيات...');
            
            // إضافة الصفحات والأزرار
            addOccupancyPage();
            addOccupancyNavButton();
            addExtraQuickActions();
            
            // رسم الإحصائيات
            setTimeout(renderAdvancedStats, 500);
            
            // بدء المراقبة
            setInterval(checkForNewBookings, 5000);
            
            // إعادة رسم الإحصائيات عند تحديث البيانات
            var originalLoadData = window.loadAllData;
            if (typeof originalLoadData === 'function') {
                // نتركها تشتغل عادي
            }
            
            console.log('✅ الترقيات جاهزة');
            
        }, 2000);
    }
    
    // تتبع فتح الـ modal
    var originalViewBooking = window.viewBooking;
    document.addEventListener('click', function(e) {
        // إذا ضغط على زر تفاصيل
        if (e.target.closest('button') && e.target.closest('button').textContent.indexOf('تفاصيل') !== -1) {
            // انتظر الـ modal يفتح
            setTimeout(function() {
                var modal = document.getElementById('detailsModal');
                if (modal && modal.classList.contains('show')) {
                    // جلب رقم الحجز من المودال
                    var bookingIdEl = modal.querySelector('.modal-row .value');
                    if (bookingIdEl) {
                        var bookingId = bookingIdEl.textContent;
                        var bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
                        var booking = bookings.find(function(b) { return b.bookingId === bookingId; });
                        if (booking) addQuickRepliesToModal(booking);
                    }
                }
            }, 200);
        }
    });
    
    // بدء
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // init أولي
    setTimeout(init, 3000);
    
    console.log('✅ admin-upgrades.js loaded');
    
})();
