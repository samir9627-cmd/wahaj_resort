/* ═══════════════════════════════════════════════════════
   استراحة وهج - نظام الحجز الذكي
   مُحدّث: إصلاح التقويم + حجب التواريخ + حفظ الحجوزات
   ═══════════════════════════════════════════════════════ */

/* ─── متغيرات الحالة ─── */
let selectedDate = null;
let selectedBookingType = null;
let selectedHalfDayPeriod = null;
let currentMonth = new Date();
let receiptFile = null;
let blockedDates = [];
let confirmedDates = [];

/* ─── دوال مساعدة للتواريخ ─── */
const DateHelpers = {
    format(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    isSameDay(d1, d2) {
        return this.format(d1) === this.format(d2);
    },
    
    isPast(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < today;
    },
    
    getMonthName(month) {
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return months[month];
    },
    
    formatArabic(date) {
        const d = new Date(date);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return d.toLocaleDateString('ar-OM', options);
    }
};

/* ═══════════════════════════════════════════════════════
   📥 تحميل التواريخ المحجوزة من localStorage
   ═══════════════════════════════════════════════════════ */
function loadBlockedDates() {
    try {
        // التواريخ المحجوزة يدوياً من لوحة التحكم
        const blocked = JSON.parse(localStorage.getItem('wahaj_blocked_dates') || '[]');
        blockedDates = blocked.map(item => item.date);
        
        // التواريخ المؤكدة من الحجوزات
        const bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
        confirmedDates = bookings
            .filter(b => b.status === 'confirmed')
            .map(b => b.date);
        
        // دمج المحجوزة
        blockedDates = [...new Set([...blockedDates, ...confirmedDates])];
        
        console.log('📅 تواريخ محجوزة:', blockedDates.length);
    } catch (e) {
        console.error('خطأ في تحميل التواريخ:', e);
        blockedDates = [];
    }
}

/* ═══════════════════════════════════════════════════════
   🗓️ التقويم
   ═══════════════════════════════════════════════════════ */
const Calendar = {
    render() {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        const monthYearEl = document.getElementById('monthYear');
        if (monthYearEl) {
            monthYearEl.textContent = `${DateHelpers.getMonthName(month)} ${year}`;
        }
        
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();
        
        // الأيام الفارغة
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-app-day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // أيام الشهر
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-app-day';
            dayEl.textContent = day;
            dayEl.dataset.date = DateHelpers.format(date);
            
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6;
            
            if (DateHelpers.isSameDay(date, new Date())) {
                dayEl.classList.add('today');
            }
            
            if (isWeekend) {
                dayEl.classList.add('weekend');
            }
            
            const dateStr = DateHelpers.format(date);
            
            // محجوز أو ماضي
            if (DateHelpers.isPast(date) || blockedDates.includes(dateStr)) {
                dayEl.classList.add('disabled');
                if (blockedDates.includes(dateStr)) {
                    dayEl.title = 'محجوز';
                }
            } else {
                // إضافة الحدث - مهم!
                dayEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectDate(date, dayEl);
                });
                
                dayEl.style.cursor = 'pointer';
            }
            
            // المختار
            if (selectedDate && DateHelpers.isSameDay(date, selectedDate)) {
                dayEl.classList.add('selected');
            }
            
            calendarDays.appendChild(dayEl);
        }
        
        console.log(`✅ تم رسم تقويم ${DateHelpers.getMonthName(month)} ${year}`);
    },
    
    selectDate(date, dayEl) {
        // إزالة التحديد السابق
        document.querySelectorAll('.calendar-app-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // تحديد الجديد
        selectedDate = date;
        
        if (dayEl) {
            dayEl.classList.add('selected');
        }
        
        // اهتزاز خفيف
        if (navigator.vibrate) navigator.vibrate(10);
        
        // تحديث الملخص
        Summary.update();
        
        // تحديث الخطوات
        updateSteps();
        
        console.log('📅 مختار:', DateHelpers.formatArabic(date));
    },
    
    prevMonth() {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        this.render();
    },
    
    nextMonth() {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        this.render();
    }
};

/* ═══════════════════════════════════════════════════════
   💰 حساب السعر
   ═══════════════════════════════════════════════════════ */
const PriceCalculator = {
    calculate() {
        if (!selectedDate || !selectedBookingType) return 0;
        const dayType = WAHAJ_CONFIG.getDayType(selectedDate);
        return WAHAJ_CONFIG.getPrice(dayType, selectedBookingType);
    },
    
    calculateDeposit() {
        const total = this.calculate();
        return WAHAJ_CONFIG.calculateDeposit(total);
    },
    
    getDetails() {
        if (!selectedDate || !selectedBookingType) return null;
        
        const dayType = WAHAJ_CONFIG.getDayType(selectedDate);
        const dayTypeName = dayType === 'weekday' ? 'يوم عادي' : 
                           dayType === 'weekend' ? 'ويكند' : 'يوم خاص';
        
        const bookingTypeInfo = WAHAJ_CONFIG.bookingTypes[selectedBookingType];
        const total = this.calculate();
        const deposit = this.calculateDeposit();
        const security = WAHAJ_CONFIG.payment.securityDeposit;
        
        return {
            date: selectedDate,
            dateFormatted: DateHelpers.formatArabic(selectedDate),
            dayType,
            dayTypeName,
            bookingType: selectedBookingType,
            bookingTypeName: bookingTypeInfo.label,
            bookingTypeIcon: bookingTypeInfo.icon,
            bookingTypeDesc: selectedBookingType === 'half_day' && selectedHalfDayPeriod
                ? (selectedHalfDayPeriod === 'morning' 
                    ? '9:00 ص - 3:00 م'
                    : '4:00 م - 10:00 م')
                : bookingTypeInfo.description,
            total,
            deposit,
            security,
            remaining: total - deposit
        };
    }
};

/* ═══════════════════════════════════════════════════════
   📄 ملخص الحجز
   ═══════════════════════════════════════════════════════ */
const Summary = {
    update() {
        const content = document.getElementById('summaryContent');
        const confirmBtn = document.getElementById('confirmBooking');
        
        if (!content) return;
        
        if (!selectedDate || !selectedBookingType) {
            content.innerHTML = `
                <div class="summary-app-empty">
                    <i class="fas fa-calendar-plus"></i>
                    <p>اختر التاريخ ونوع الحجز لعرض الملخص</p>
                </div>
            `;
            if (confirmBtn) confirmBtn.disabled = true;
            return;
        }
        
        const details = PriceCalculator.getDetails();
        if (!details) return;
        
        const bankDeposit = document.getElementById('bankDepositAmount');
        if (bankDeposit) {
            bankDeposit.textContent = WAHAJ_CONFIG.formatPrice(details.deposit);
        }
        
        content.innerHTML = `
            <div class="summary-app-row">
                <span>📅 التاريخ:</span>
                <strong>${details.dateFormatted}</strong>
            </div>
            <div class="summary-app-row">
                <span>🏷️ نوع اليوم:</span>
                <strong>${details.dayTypeName}</strong>
            </div>
            <div class="summary-app-row">
                <span>⏰ نوع الحجز:</span>
                <strong>${details.bookingTypeIcon} ${details.bookingTypeName}</strong>
            </div>
            <div class="summary-app-row">
                <span>🕐 التوقيت:</span>
                <strong style="font-size: 0.75rem;">${details.bookingTypeDesc}</strong>
            </div>
            <div class="summary-app-row">
                <span>💰 الإجمالي:</span>
                <strong>${WAHAJ_CONFIG.formatPrice(details.total)}</strong>
            </div>
            <div class="summary-app-row">
                <span>💵 العربون (50%):</span>
                <strong>${WAHAJ_CONFIG.formatPrice(details.deposit)}</strong>
            </div>
            <div class="summary-app-row">
                <span>💳 الباقي:</span>
                <strong>${WAHAJ_CONFIG.formatPrice(details.remaining)}</strong>
            </div>
            <div class="summary-app-row total">
                <span>✅ المطلوب الآن:</span>
                <strong>${WAHAJ_CONFIG.formatPrice(details.deposit)}</strong>
            </div>
        `;
        
        if (confirmBtn) confirmBtn.disabled = false;
    }
};

/* ═══════════════════════════════════════════════════════
   📸 رفع الإيصال
   ═══════════════════════════════════════════════════════ */
const Upload = {
    init() {
        const input = document.getElementById('receiptInput');
        const preview = document.getElementById('uploadPreview');
        const previewImg = document.getElementById('previewImg');
        
        if (!input) return;
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 5 * 1024 * 1024) {
                alert('⚠️ حجم الصورة كبير جداً (الحد 5 ميجابايت)');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                alert('⚠️ الرجاء اختيار صورة');
                return;
            }
            
            receiptFile = file;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                if (previewImg) previewImg.src = event.target.result;
                if (preview) preview.classList.add('show');
            };
            reader.readAsDataURL(file);
            
            // حفظ مؤقت للإيصال
            try {
                const reader2 = new FileReader();
                reader2.onload = (ev) => {
                    sessionStorage.setItem('wahaj_receipt_temp', ev.target.result);
                };
                reader2.readAsDataURL(file);
            } catch(e) {}
            
            updateSteps();
            console.log('📎 إيصال:', file.name);
        });
    }
};

/* ═══════════════════════════════════════════════════════
   💬 إرسال الحجز
   ═══════════════════════════════════════════════════════ */
const BookingSubmit = {
    submit() {
        // التحقق
        if (!selectedDate) {
            showToast('⚠️ الرجاء اختيار التاريخ', 'warning');
            return;
        }
        
        if (!selectedBookingType) {
            showToast('⚠️ الرجاء اختيار نوع الحجز', 'warning');
            return;
        }
        
        if (selectedBookingType === 'half_day' && !selectedHalfDayPeriod) {
            showToast('⚠️ الرجاء اختيار فترة نصف اليوم', 'warning');
            return;
        }
        
        const fullName = document.getElementById('fullName')?.value.trim();
        if (!fullName) {
            showToast('⚠️ الرجاء إدخال الاسم', 'warning');
            document.getElementById('fullName')?.focus();
            return;
        }
        
        const phone = document.getElementById('phone')?.value.trim();
        if (!phone) {
            showToast('⚠️ الرجاء إدخال رقم الجوال', 'warning');
            document.getElementById('phone')?.focus();
            return;
        }
        
        if (!/^[79]\d{7}$/.test(phone.replace(/\s/g, ''))) {
            showToast('⚠️ رقم الجوال غير صحيح (8 أرقام يبدأ بـ 7 أو 9)', 'warning');
            return;
        }
        
        if (!receiptFile) {
            showToast('⚠️ الرجاء رفع الإيصال', 'warning');
            return;
        }
        
        // جمع البيانات
        const details = PriceCalculator.getDetails();
        const bookingId = WAHAJ_CONFIG.generateBookingId();
        const guests = document.getElementById('guests')?.value || '1';
        const email = document.getElementById('email')?.value.trim() || '';
        const notes = document.getElementById('notes')?.value.trim() || '';
        
        const receiptBase64 = sessionStorage.getItem('wahaj_receipt_temp') || '';
        
        const bookingData = {
            bookingId,
            date: DateHelpers.format(selectedDate),
            dateFormatted: details.dateFormatted,
            dayType: details.dayTypeName,
            bookingType: details.bookingTypeName,
            bookingTypeDesc: details.bookingTypeDesc,
            total: details.total,
            deposit: details.deposit,
            remaining: details.remaining,
            security: details.security,
            fullName,
            phone,
            guests,
            email,
            notes,
            receiptFileName: receiptFile.name,
            receiptData: receiptBase64,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // حفظ
        this.saveBooking(bookingData);
        
        // إرسال واتساب
        this.sendWhatsApp(bookingData);
        
        // انتقال
        setTimeout(() => {
            window.location.href = `confirmation.html?id=${bookingId}`;
        }, 1500);
    },
    
    saveBooking(data) {
        try {
            const bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
            bookings.push(data);
            localStorage.setItem('wahaj_bookings', JSON.stringify(bookings));
            localStorage.setItem('wahaj_last_booking', JSON.stringify(data));
            console.log('💾 تم حفظ الحجز:', data.bookingId);
        } catch (e) {
            console.error('خطأ في الحفظ:', e);
        }
    },
    
    sendWhatsApp(data) {
        const message = `🌟 *طلب حجز جديد - استراحة وهج* 🌟

📋 *رقم الحجز:* ${data.bookingId}
📅 *التاريخ:* ${data.dateFormatted}
🏷️ *نوع اليوم:* ${data.dayType}
⏰ *نوع الحجز:* ${data.bookingType}
🕐 *التوقيت:* ${data.bookingTypeDesc}

👤 *الاسم:* ${data.fullName}
📞 *الجوال:* ${data.phone}
👥 *عدد الضيوف:* ${data.guests}

💰 *الإجمالي:* ${data.total} ر.ع
💵 *العربون:* ${data.deposit} ر.ع
💳 *الباقي:* ${data.remaining} ر.ع
🛡️ *التأمين:* ${data.security} ر.ع

📝 *ملاحظات:* ${data.notes || 'لا يوجد'}
📎 *الإيصال:* ${data.receiptFileName}

⏳ بانتظار تأكيد الحجز...

---
استراحة وهج
خصوصية .. راحة .. ذكريات لا تُنسى`;
        
        const url = WAHAJ_CONFIG.getWhatsAppLink(message);
        window.open(url, '_blank');
    }
};

/* ═══════════════════════════════════════════════════════
   🎯 التهيئة
   ═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
    
    // تحميل التواريخ المحجوزة
    loadBlockedDates();
    
    // رسم التقويم
    Calendar.render();
    
    // أزرار التنقل
    document.getElementById('prevMonth')?.addEventListener('click', () => Calendar.prevMonth());
    document.getElementById('nextMonth')?.addEventListener('click', () => Calendar.nextMonth());
    
    // نوع الحجز
    document.querySelectorAll('.booking-type-app').forEach(typeEl => {
        typeEl.addEventListener('click', function() {
            document.querySelectorAll('.booking-type-app').forEach(el => {
                el.classList.remove('selected');
            });
            
            this.classList.add('selected');
            selectedBookingType = this.dataset.type;
            
            if (navigator.vibrate) navigator.vibrate(10);
            
            const halfDayPeriods = document.getElementById('halfDayPeriods');
            if (selectedBookingType === 'half_day') {
                halfDayPeriods?.classList.add('show');
            } else {
                halfDayPeriods?.classList.remove('show');
                selectedHalfDayPeriod = null;
                document.querySelectorAll('.half-day-option').forEach(el => {
                    el.classList.remove('selected');
                });
            }
            
            Summary.update();
            updateSteps();
        });
    });
    
    // فترة نصف اليوم
    document.querySelectorAll('.half-day-option').forEach(optEl => {
        optEl.addEventListener('click', function() {
            document.querySelectorAll('.half-day-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            this.classList.add('selected');
            selectedHalfDayPeriod = this.dataset.period;
            
            if (navigator.vibrate) navigator.vibrate(10);
            
            Summary.update();
            updateSteps();
        });
    });
    
    // رفع الإيصال
    Upload.init();
    
    // زر التأكيد
    document.getElementById('confirmBooking')?.addEventListener('click', () => {
        BookingSubmit.submit();
    });
    
    // مراقبة حقول الإدخال
    ['fullName', 'phone'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateSteps);
    });
});

/* ─── تحديث خطوات الحجز ─── */
function updateSteps() {
    const steps = document.querySelectorAll('.step-dot');
    steps.forEach(step => step.classList.remove('active'));
    
    if (selectedDate) steps[0]?.classList.add('active');
    if (selectedBookingType) steps[1]?.classList.add('active');
    
    const fullName = document.getElementById('fullName')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    if (fullName && phone) steps[2]?.classList.add('active');
    
    if (receiptFile) steps[3]?.classList.add('active');
}

/* ─── Toast (احتياطي) ─── */
if (typeof showToast === 'undefined') {
    window.showToast = function(message, type = 'info') {
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
        
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    };
}
