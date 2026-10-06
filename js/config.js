/* ═══════════════════════════════════════════════════════
   استراحة وهج - ملف الإعدادات الرئيسي
   كل التعديلات المستقبلية تكون من هنا فقط
   ═══════════════════════════════════════════════════════ */

const WAHAJ_CONFIG = {
    
    /* ─── معلومات الاستراحة ─── */
    resort: {
        nameAr: 'استراحة وهج',
        nameEn: 'Wahaj Resort',
        slogan: 'خصوصية .. راحة .. ذكريات لا تُنسى',
        description: 'استراحة عائلية فاخرة في ولاية بركاء، منطقة العقدة',
        location: 'ولاية بركاء - منطقة العقدة - جنوب الباطنة',
        city: 'بركاء'
    },
    
    /* ─── التواصل ─── */
    contact: {
        phone: '+96895566332',
        phoneDisplay: '+968 9556 6332',
        whatsapp: '96895566332',
        instagram: 'Wahaj_Resort',
        instagramUrl: 'https://instagram.com/Wahaj_Resort',
        tiktok: 'استراحة وهج',
        tiktokUrl: 'https://tiktok.com/@wahaj_resort'
    },
    
    /* ─── بيانات الدفع البنكي ─── */
    payment: {
        bank: 'بنك مسقط',
        bankEn: 'Bank Muscat',
        accountNumber: '99591653',
        accountName: 'Samir Alowaisi',
        depositPercent: 50,      // نسبة العربون %
        securityDeposit: 20       // مبلغ التأمين المسترد بالريال العماني
    },
    
    /* ─── العملة ─── */
    currency: {
        code: 'OMR',
        symbolAr: 'ر.ع',
        symbolEn: 'OMR',
        name: 'ريال عماني'
    },
    
    /* ═══════════════════════════════════════════════════
       💰 الأسعار - سهلة التعديل
       ═══════════════════════════════════════════════════ */
    pricing: {
        // أيام الأسبوع (الأحد - الأربعاء)
        weekday: {
            name: 'أيام الأسبوع',
            days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء'],
            dayNumbers: [0, 1, 2, 3],  // 0=الأحد، 1=الاثنين، 2=الثلاثاء، 3=الأربعاء
            withoutStay: 40,      // بدون مبيت - ر.ع
            withStay: 50,         // مع مبيت - ر.ع
            halfDay: 25           // نصف يوم - ر.ع
        },
        
        // الويكند (الخميس - السبت)
        weekend: {
            name: 'الويكند',
            days: ['الخميس', 'الجمعة', 'السبت'],
            dayNumbers: [4, 5, 6],  // 4=الخميس، 5=الجمعة، 6=السبت
            withoutStay: 50,
            withStay: 65,
            halfDay: 30
        },
        
        // أيام خاصة (أعياد ومناسبات) - تُعدل من لوحة الأدمن
        specialDays: {
            name: 'أيام خاصة',
            withoutStay: 65,
            withStay: 80,
            halfDay: 40
        }
    },
    
    /* ═══════════════════════════════════════════════════
       ⏰ التوقيتات
       ═══════════════════════════════════════════════════ */
    timing: {
        withoutStay: {
            checkIn: '09:00',
            checkOut: '22:00',
            checkInDisplay: '9:00 صباحاً',
            checkOutDisplay: '10:00 مساءً',
            hours: 13
        },
        withStay: {
            checkIn: '09:00',
            checkOut: '07:00',
            checkInDisplay: '9:00 صباحاً',
            checkOutDisplay: '7:00 صباحاً',
            hours: 22
        },
        halfDay: {
            period1: {
                name: 'الفترة الصباحية',
                checkIn: '09:00',
                checkOut: '15:00',
                display: '9:00 صباحاً - 3:00 عصراً'
            },
            period2: {
                name: 'الفترة المسائية',
                checkIn: '16:00',
                checkOut: '22:00',
                display: '4:00 عصراً - 10:00 مساءً'
            }
        }
    },
    
    /* ─── خيارات نوع الحجز ─── */
    bookingTypes: {
        without_stay: {
            value: 'without_stay',
            label: 'بدون مبيت',
            icon: '☀️',
            description: '9 صباحاً - 10 مساءً'
        },
        with_stay: {
            value: 'with_stay',
            label: 'مع مبيت',
            icon: '🌙',
            description: '9 صباحاً - 7 صباحاً'
        },
        half_day: {
            value: 'half_day',
            label: 'نصف يوم',
            icon: '⏰',
            description: 'اختر الفترة'
        }
    },
    
    /* ═══════════════════════════════════════════════════
       🏊 المرافق
       ═══════════════════════════════════════════════════ */
    amenities: [
        { icon: 'fas fa-swimmer', name: 'حوض سباحة رجال' },
        { icon: 'fas fa-female', name: 'حوض سباحة نساء' },
        { icon: 'fas fa-bed', name: 'غرفتا نوم' },
        { icon: 'fas fa-couch', name: 'صالة رجال' },
        { icon: 'fas fa-couch', name: 'صالة نساء' },
        { icon: 'fas fa-toilet', name: '7 دورات مياه' },
        { icon: 'fas fa-fire', name: 'منطقة شواء' },
        { icon: 'fas fa-utensils', name: 'مطبخ خارجي' },
        { icon: 'fas fa-kitchen-set', name: 'مطبخ داخلي' },
        { icon: 'fas fa-child', name: 'منطقة ألعاب أطفال' },
        { icon: 'fas fa-circle', name: 'لعبة بلياردو' },
        { icon: 'fas fa-table-tennis', name: 'تنس طاولة' }
    ],
    
    /* ═══════════════════════════════════════════════════
       📋 السياسات
       ═══════════════════════════════════════════════════ */
    policies: {
        booking: [
            'دفع مبلغ الحجز أو عربون لتأكيد الحجز وباقي المبلغ قبل الدخول بيوم.',
            'في حالة الإلغاء لا يُسترد المبلغ، لكن يمكن تأجيل الحجز ليوم آخر.',
            'يُدفع مبلغ تأمين 20 ريال عماني يُسترد بعد الخروج والتأكد من سلامة ونظافة المكان.'
        ],
        timing: [
            'الالتزام بأوقات الدخول والخروج.',
            'أي تأخير في الخروج يترتب عليه رسوم إضافية.'
        ],
        usage: [
            'يُمنع الأكل والشرب في أحواض السباحة.',
            'يُمنع دخول الغرف والصالات بالملابس المبللة.'
        ],
        property: [
            'المحافظة على المرافق وعدم تحريك أو أخذ أي من أغراض الاستراحة.',
            'تعويض أي تلفيات.',
            'تنظيف وتجميع جميع المخلفات والقمامة.',
            'تسليم الاستراحة نظيفة كما استلمت.'
        ],
        safety: [
            'عدم ترك الأطفال بدون مراقبة، خاصة عند أحواض السباحة.',
            'إشعال النار في أماكن الشواء المخصصة فقط.'
        ],
        responsibility: [
            'المستأجر مسؤول عن ضيوفه.',
            'الإدارة غير مسؤولة عن المفقودات أو الإصابات.'
        ]
    },
    
    /* ─── سياسات كاملة كنص (للاستخدام في الواتساب) ─── */
    policiesText: `📋 *شروط الاستئجار - استراحة وهج*

*💰 الحجز والدفع:*
• دفع عربون لتأكيد الحجز + باقي المبلغ قبل الدخول بيوم
• في حالة الإلغاء لا يُسترد المبلغ، يمكن تأجيل الحجز
• تأمين 20 ر.ع يُسترد بعد الخروج

*⏰ الوقت:*
• الالتزام بأوقات الدخول والخروج
• التأخير يترتب عليه رسوم إضافية

*🚫 الاستخدام:*
• يُمنع الأكل والشرب في أحواض السباحة
• يُمنع دخول الغرف والصالات بالملابس المبللة

*🏠 الممتلكات:*
• المحافظة على المرافق
• تعويض أي تلفيات
• تسليم الاستراحة نظيفة

*⚠️ السلامة:*
• عدم ترك الأطفال بدون مراقبة
• إشعال النار في أماكن الشواء فقط

*📌 المسؤولية:*
• المستأجر مسؤول عن ضيوفه
• الإدارة غير مسؤولة عن المفقودات أو الإصابات

دمتم بود 🌟
استراحة وهج`,
    
    /* ─── صور المعرض ─── */
    gallery: [
        { src: 'images/gallery/pool-night.jpg', alt: 'المسبح ليلاً', category: 'pool' },
        { src: 'images/gallery/majlis.jpg', alt: 'المجلس', category: 'rooms' },
        { src: 'images/gallery/kids-area.jpg', alt: 'منطقة الأطفال', category: 'kids' },
        { src: 'images/gallery/billiard.jpg', alt: 'البلياردو', category: 'entertainment' },
        { src: 'images/gallery/pool-cover.jpg', alt: 'المسبح المغطى', category: 'pool' },
        { src: 'images/gallery/bedroom1.jpg', alt: 'غرفة النوم 1', category: 'rooms' },
        { src: 'images/gallery/bedroom2.jpg', alt: 'غرفة النوم 2', category: 'rooms' },
        { src: 'images/gallery/kitchen.jpg', alt: 'المطبخ', category: 'rooms' },
        { src: 'images/gallery/outdoor.jpg', alt: 'الجلسة الخارجية', category: 'outdoor' }
    ],
    
    /* ═══════════════════════════════════════════════════
       🔧 دوال مساعدة
       ═══════════════════════════════════════════════════ */
    
    /**
     * الحصول على سعر حسب نوع اليوم ونوع الحجز
     * @param {string} dayType - 'weekday' | 'weekend' | 'special'
     * @param {string} bookingType - 'without_stay' | 'with_stay' | 'half_day'
     * @returns {number} السعر
     */
    getPrice(dayType, bookingType) {
        const prices = this.pricing[dayType];
        if (!prices) return 0;
        
        switch(bookingType) {
            case 'without_stay': return prices.withoutStay;
            case 'with_stay': return prices.withStay;
            case 'half_day': return prices.halfDay;
            default: return 0;
        }
    },
    
    /**
     * تحديد نوع اليوم من التاريخ
     * @param {Date} date - التاريخ
     * @returns {string} نوع اليوم
     */
    getDayType(date) {
        const day = date.getDay(); // 0=الأحد، 6=السبت
        if (this.pricing.weekday.dayNumbers.includes(day)) return 'weekday';
        if (this.pricing.weekend.dayNumbers.includes(day)) return 'weekend';
        return 'weekday';
    },
    
    /**
     * تنسيق السعر مع العملة
     * @param {number} amount - المبلغ
     * @returns {string} السعر منسق
     */
    formatPrice(amount) {
        return `${amount} ${this.currency.symbolAr}`;
    },
    
    /**
     * حساب العربون
     * @param {number} total - المبلغ الكلي
     * @returns {number} العربون
     */
    calculateDeposit(total) {
        return Math.ceil(total * this.payment.depositPercent / 100);
    },
    
    /**
     * إنشاء رابط واتساب برسالة
     * @param {string} message - الرسالة
     * @returns {string} الرابط الكامل
     */
    getWhatsAppLink(message) {
        return `https://wa.me/${this.contact.whatsapp}?text=${encodeURIComponent(message)}`;
    },
    
    /**
     * توليد رقم حجز عشوائي
     * @returns {string} رقم الحجز
     */
    generateBookingId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `WHJ-${timestamp}${random}`;
    },
    
    /**
     * تنسيق التاريخ بالعربية
     * @param {Date|string} date - التاريخ
     * @returns {string} التاريخ منسق
     */
    formatDateAr(date) {
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

/* ─── تجميد الكائن لمنع التعديل بالخطأ ─── */
// Object.freeze(WAHAJ_CONFIG); // (اختياري)

/* ─── تصدير للاستخدام في باقي الملفات ─── */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WAHAJ_CONFIG;
}
