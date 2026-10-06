/* ═══════════════════════════════════════════════════════
   استراحة وهج - نظام الحجز الذكي
   التقويم + حساب الأسعار + رفع الإيصال + واتساب
   ═══════════════════════════════════════════════════════ */

/* ─── متغيرات الحالة ─── */
let selectedDate = null;           // التاريخ المختار
let selectedBookingType = null;    // نوع الحجز (بدون مبيت / مع مبيت / نصف يوم)
let selectedHalfDayPeriod = null;  // فترة نصف اليوم
let currentMonth = new Date();     // الشهر الحالي في التقويم
let receiptFile = null;            // ملف الإيصال
let blockedDates = [];             // التواريخ المحجوزة (تُجلب من Firebase لاحقاً)

/* ─── دوال مساعدة للتواريخ ─── */
const DateHelpers = {
    // تنسيق التاريخ بصيغة YYYY-MM-DD
    format(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // هل نفس اليوم؟
    isSameDay(d1, d2) {
        return this.format(d1) === this.format(d2);
    },
    
    // هل التاريخ في الماضي؟
    isPast(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < today;
    },
    
    // اسم الشهر بالعربية
    getMonthName(month) {
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return months[month];
    },
    
    // تنسيق التاريخ للعرض بالعربية
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
   🗓️ التقويم
   ═══════════════════════════════════════════════════════ */
const Calendar = {
    // رسم التقويم للشهر الحالي
    render() {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        // تحديث العنوان
        const monthYearEl = document.getElementById('monthYear');
        if (monthYearEl) {
            monthYearEl.textContent = `${DateHelpers.getMonthName(month)} ${year}`;
        }
        
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';
        
        // أول يوم في الشهر
        const firstDay = new Date(year, month, 1);
        // آخر يوم في الشهر
        const lastDay = new Date(year, month + 1, 0);
        
        // عدد الأيام في الشهر
        const daysInMonth = lastDay.getDate();
        
        // يوم الأسبوع لأول يوم (0=الأحد، 6=السبت)
        const startDay = firstDay.getDay();
        
        // إضافة الأيام الفارغة قبل بداية الشهر
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // إضافة أيام الشهر
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            dayEl.dataset.date = DateHelpers.format(date);
            
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6; // خميس، جمعة، سبت
            
            // اليوم الحالي
            if (DateHelpers.isSameDay(date, new Date())) {
                dayEl.classList.add('today');
            }
            
            // الويكند
            if (isWeekend) {
                dayEl.classList.add('weekend');
            }
            
            // محجوز أو ماضي
            const dateStr = DateHelpers.format(date);
            if (DateHelpers.isPast(date) || blockedDates.includes(dateStr)) {
                dayEl.classList.add('disabled');
            } else {
                // إضافة حدث الضغط
                dayEl.addEventListener('click', () => {
                    this.selectDate(date);
                });
            }
            
            // التاريخ المختار حالياً
            if (selectedDate && DateHelpers.isSameDay(date, selectedDate)) {
                dayEl.classList.add('selected');
            }
            
            calendarDays.appendChild(dayEl);
        }
    },
    
    // اختيار تاريخ
    selectDate(date) {
        // إزالة التحديد السابق
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // تحديد الجديد
        selectedDate = date;
        
        // إضافة class selected
        const dateStr = DateHelpers.format(date);
        const dayEl = document.querySelector(`.calendar-day[data-date="${dateStr}"]`);
        if (dayEl) {
            dayEl.classList.add('selected');
        }
        
        // تحديث الملخص
        Summary.update();
        
        // تحديث خطوات الحجز
        updateSteps();
        
        console.log('📅 تاريخ مختار:', DateHelpers.formatArabic(date));
    },
    
    // الشهر السابق
    prevMonth() {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        this.render();
    },
    
    // الشهر التالي
    nextMonth() {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        this.render();
    }
};

/* ═══════════════════════════════════════════════════════
   💰 حساب السعر
   ═══════════════════════════════════════════════════════ */
const PriceCalculator = {
    // حساب السعر الإجمالي
    calculate() {
        if (!selectedDate || !selectedBookingType) return 0;
        
        // تحديد نوع اليوم (أسبوع / ويكند)
        const dayType = WAHAJ_CONFIG.getDayType(selectedDate);
        
        // الحصول على السعر
        return WAHAJ_CONFIG.getPrice(dayType, selectedBookingType);
    },
    
    // حساب العربون
    calculateDeposit() {
        const total = this.calculate();
        return WAHAJ_CONFIG.calculateDeposit(total);
    },
    
    // الحصول على تفاصيل السعر
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
                    ? WAHAJ_CONFIG.timing.halfDay.period1.display
                    : WAHAJ_CONFIG.timing.halfDay.period2.display)
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
        
        // إذا لم يتم اختيار تاريخ أو نوع
        if (!selectedDate || !selectedBookingType) {
            content.innerHTML = `
                <div class="summary-empty">
                    <i class="fas fa-calendar-plus"></i>
                    <p>اختر التاريخ ونوع الحجز لعرض الملخص</p>
                </div>
            `;
            if (confirmBtn) confirmBtn.disabled = true;
            return;
        }
        
        const details = PriceCalculator.getDetails();
        if (!details) return;
        
        // تحديث مبلغ العربون في بيانات البنك
        const bankDeposit = document.getElementById('bankDepositAmount');
        if (bankDeposit) {
            bankDeposit.textContent = WAHAJ_CONFIG.formatPrice(details.deposit);
        }
        
        // عرض الملخص
        content.innerHTML = `
            <div class="summary-row">
                <span><i class="fas fa-calendar-day"></i> التاريخ:</span>
                <strong>${details.dateFormatted}</strong>
            </div>
            <div class="summary-row">
                <span><i class="fas fa-tag"></i> نوع اليوم:</span>
                <strong>${details.dayTypeName}</strong>
            </div>
            <div class="summary-row">
                <span><i class="fas fa-clock"></i> نوع الحجز:</span>
                <strong>${details.bookingTypeIcon} ${details.bookingTypeName}</strong>
            </div>
            <div class="summary-row">
                <span><i class="fas fa-hourglass-half"></i> التوقيت:</span>
                <strong style="font-size: 0.85rem;">${details.bookingTypeDesc}</strong>
            </div>
            <div class="summary-row">
                <span><i class="fas fa-money-bill-wave"></i> السعر الإجمالي:</span>
                <strong>${WAHAJ_CONFIG.formatPrice(details.total)}</strong>
            </div>
            <div class="summary-row">
                <span><i class="fas fa-hand-holding-usd"></i> العربون (${WAHAJ_CONFIG.payment.depositPercent}%):</span>
                <strong style="color: var(--gold-dark);">${WAHAJ_CONFIG.formatPrice(details.deposit)}</strong>
            </div>
            <div class="summary-row">
                <span><i class="fas fa-money-check-alt"></i> الباقي عند الدخول:</span>
                <strong>${WAHAJ_CONFIG.formatPrice(details.remaining)}</strong>
            </div>
            <div class="summary-row">
                <span><i class="fas fa-shield-alt"></i> تأمين مسترد:</span>
                <strong>${WAHAJ_CONFIG.formatPrice(details.security)}</strong>
            </div>
            <div class="summary-row total">
                <span><i class="fas fa-wallet"></i> المطلوب الآن:</span>
                <strong>${WAHAJ_CONFIG.formatPrice(details.deposit)}</strong>
            </div>
        `;
        
        // تفعيل زر التأكيد
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    }
};

/* ═══════════════════════════════════════════════════════
   📸 رفع الإيصال
   ═══════════════════════════════════════════════════════ */
const Upload = {
    init() {
        const input = document.getElementById('receiptInput');
        const area = document.getElementById('uploadArea');
        const preview = document.getElementById('uploadPreview');
        const previewImg = document.getElementById('previewImg');
        
        if (!input || !area) return;
        
        // عند اختيار ملف
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // التحقق من الحجم (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('⚠️ حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
                return;
            }
            
            // التحقق من النوع
            if (!file.type.startsWith('image/')) {
                alert('⚠️ الرجاء اختيار صورة (PNG أو JPG)');
                return;
            }
            
            receiptFile = file;
            
            // عرض المعاينة
            const reader = new FileReader();
            reader.onload = (event) => {
                if (previewImg) previewImg.src = event.target.result;
                if (preview) preview.classList.add('show');
            };
            reader.readAsDataURL(file);
            
            console.log('📎 تم رفع الإيصال:', file.name);
        });
        
        // Drag & Drop
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file) {
                input.files = e.dataTransfer.files;
                input.dispatchEvent(new Event('change'));
            }
        });
    }
};

/* ═══════════════════════════════════════════════════════
   💬 إرسال الحجز عبر واتساب
   ═══════════════════════════════════════════════════════ */
const BookingSubmit = {
    submit() {
        // التحقق من البيانات
        if (!selectedDate) {
            alert('⚠️ الرجاء اختيار التاريخ');
            return;
        }
        
        if (!selectedBookingType) {
            alert('⚠️ الرجاء اختيار نوع الحجز');
            return;
        }
        
        if (selectedBookingType === 'half_day' && !selectedHalfDayPeriod) {
            alert('⚠️ الرجاء اختيار فترة نصف اليوم');
            return;
        }
        
        const fullName = document.getElementById('fullName')?.value.trim();
        if (!fullName) {
            alert('⚠️ الرجاء إدخال الاسم الكامل');
            document.getElementById('fullName')?.focus();
            return;
        }
        
        const phone = document.getElementById('phone')?.value.trim();
        if (!phone) {
            alert('⚠️ الرجاء إدخال رقم الجوال');
            document.getElementById('phone')?.focus();
            return;
        }
        
        // التحقق من رقم الجوال (عماني: 8 أرقام يبدأ بـ 7 أو 9)
        if (!/^[79]\d{7}$/.test(phone.replace(/\s/g, ''))) {
            alert('⚠️ الرجاء إدخال رقم جوال عماني صحيح (8 أرقام يبدأ بـ 7 أو 9)');
            return;
        }
        
        if (!receiptFile) {
            alert('⚠️ الرجاء رفع صورة إيصال التحويل');
            return;
        }
        
        // جمع البيانات
        const details = PriceCalculator.getDetails();
        const bookingId = WAHAJ_CONFIG.generateBookingId();
        const guests = document.getElementById('guests')?.value || '1';
        const email = document.getElementById('email')?.value.trim() || 'غير محدد';
        const notes = document.getElementById('notes')?.value.trim() || 'لا يوجد';
        
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
            createdAt: new Date().toISOString()
        };
        
        console.log('📋 بيانات الحجز:', bookingData);
        
        // حفظ في localStorage (مؤقتاً)
        this.saveBooking(bookingData);
        
        // إرسال واتساب
        this.sendWhatsApp(bookingData);
        
        // الانتقال لصفحة التأكيد
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
            console.log('💾 تم حفظ الحجز في localStorage');
        } catch (e) {
            console.error('خطأ في حفظ الحجز:', e);
        }
    },
    
    sendWhatsApp(data) {
        const message = this.buildMessage(data);
        const url = WAHAJ_CONFIG.getWhatsAppLink(message);
        
        // فتح واتساب
        window.open(url, '_blank');
        
        console.log('📱 تم فتح واتساب');
    },
    
    buildMessage(data) {
        return `🌟 *طلب حجز جديد - استراحة وهج* 🌟

📋 *رقم الحجز:* ${data.bookingId}
📅 *التاريخ:* ${data.dateFormatted}
🏷️ *نوع اليوم:* ${data.dayType}
⏰ *نوع الحجز:* ${data.bookingType}
🕐 *التوقيت:* ${data.bookingTypeDesc}

👤 *الاسم:* ${data.fullName}
📞 *الجوال:* ${data.phone}
👥 *عدد الضيوف:* ${data.guests}
📧 *الإيميل:* ${data.email}

💰 *السعر الإجمالي:* ${data.total} ر.ع
💵 *العربون المطلوب:* ${data.deposit} ر.ع
💳 *الباقي عند الدخول:* ${data.remaining} ر.ع
🛡️ *التأمين:* ${data.security} ر.ع

📝 *ملاحظات:* ${data.notes}

📎 *الإيصال:* ${data.receiptFileName}

⏳ بانتظار تأكيد الحجز...

---
استراحة وهج
خصوصية .. راحة .. ذكريات لا تُنسى`;
    }
};

/* ═══════════════════════════════════════════════════════
   🎯 الأحداث الرئيسية
   ═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
    
    // رسم التقويم
    Calendar.render();
    
    // أزرار التنقل بين الأشهر
    document.getElementById('prevMonth')?.addEventListener('click', () => {
        Calendar.prevMonth();
    });
    
    document.getElementById('nextMonth')?.addEventListener('click', () => {
        Calendar.nextMonth();
    });
    
    // اختيار نوع الحجز
    document.querySelectorAll('.booking-type').forEach(typeEl => {
        typeEl.addEventListener('click', function() {
            // إزالة التحديد السابق
            document.querySelectorAll('.booking-type').forEach(el => {
                el.classList.remove('selected');
            });
            
            // تحديد الجديد
            this.classList.add('selected');
            selectedBookingType = this.dataset.type;
            
            // إذا كان نصف يوم، أظهر الفترات
            const halfDayPeriods = document.getElementById('halfDayPeriods');
            if (selectedBookingType === 'half_day') {
                halfDayPeriods?.classList.add('show');
            } else {
                halfDayPeriods?.classList.remove('show');
                selectedHalfDayPeriod = null;
                document.querySelectorAll('.period-option').forEach(el => {
                    el.classList.remove('selected');
                });
            }
            
            // تحديث الملخص
            Summary.update();
            updateSteps();
            
            console.log('⏰ نوع الحجز:', selectedBookingType);
        });
    });
    
    // اختيار فترة نصف اليوم
    document.querySelectorAll('.period-option').forEach(optEl => {
        optEl.addEventListener('click', function() {
            document.querySelectorAll('.period-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            this.classList.add('selected');
            selectedHalfDayPeriod = this.dataset.period;
            
            Summary.update();
            
            console.log('🕐 الفترة:', selectedHalfDayPeriod);
        });
    });
    
    // تهيئة رفع الإيصال
    Upload.init();
    
    // زر تأكيد الحجز
    document.getElementById('confirmBooking')?.addEventListener('click', () => {
        BookingSubmit.submit();
    });
    
    // تعبئة البيانات المحفوظة سابقاً (اختياري)
    const lastBooking = localStorage.getItem('wahaj_last_booking');
    if (lastBooking) {
        try {
            const data = JSON.parse(lastBooking);
            // لا نعبئها تلقائياً، فقط لو أراد المستخدم
        } catch(e) {}
    }
});

/* ─── تحديث خطوات الحجز ─── */
function updateSteps() {
    const steps = document.querySelectorAll('.step-indicator');
    
    // إعادة تعيين
    steps.forEach(step => step.classList.remove('active'));
    
    // الخطوة 1: التاريخ
    if (selectedDate) {
        steps[0]?.classList.add('active');
    }
    
    // الخطوة 2: نوع الحجز
    if (selectedBookingType) {
        steps[1]?.classList.add('active');
    }
    
    // الخطوة 3: البيانات
    const fullName = document.getElementById('fullName')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    if (fullName && phone) {
        steps[2]?.classList.add('active');
    }
    
    // الخطوة 4: الدفع
    if (receiptFile) {
        steps[3]?.classList.add('active');
    }
}

/* ─── مراقبة تغيير حقول البيانات ─── */
document.addEventListener('DOMContentLoaded', function() {
    ['fullName', 'phone'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateSteps);
    });
});

/* ═══════════════════════════════════════════════════════
   🔥 Firebase Integration (اختياري - للنسخة المتقدمة)
   ═══════════════════════════════════════════════════════ */
/*
   ملاحظة: هذا الجزء يُفعّل لاحقاً عند ربط Firebase
   لجلب التواريخ المحجوزة وحفظ الحجوزات في السحابة
   
   مثال:
   async function loadBlockedDates() {
       const snapshot = await db.collection('bookings')
           .where('status', '==', 'confirmed')
           .get();
       blockedDates = snapshot.docs.map(doc => doc.data().date);
       Calendar.render();
   }
*/
