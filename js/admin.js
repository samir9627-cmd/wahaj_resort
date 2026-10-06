/* ═══════════════════════════════════════════════════════
   استراحة وهج - لوحة التحكم
   ═══════════════════════════════════════════════════════ */

/* ─── كلمة السر (يمكن تغييرها لاحقاً) ─── */
const ADMIN_PASSWORD = 'wahaj2026';

/* ─── متغيرات الحالة ─── */
let allBookings = [];
let filteredBookings = [];

/* ═══════════════════════════════════════════════════════
   🔐 تسجيل الدخول
   ═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
    
    const loginScreen = document.getElementById('loginScreen');
    const adminScreen = document.getElementById('adminScreen');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // التحقق من الجلسة السابقة
    const isLoggedIn = sessionStorage.getItem('wahaj_admin_logged') === 'true';
    if (isLoggedIn) {
        showAdmin();
    }
    
    // زر الدخول
    loginBtn?.addEventListener('click', handleLogin);
    passwordInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    function handleLogin() {
        const password = passwordInput.value;
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('wahaj_admin_logged', 'true');
            showAdmin();
        } else {
            loginError.classList.add('show');
            passwordInput.value = '';
            passwordInput.focus();
            
            setTimeout(() => {
                loginError.classList.remove('show');
            }, 3000);
        }
    }
    
    function showAdmin() {
        loginScreen.style.display = 'none';
        adminScreen.classList.add('show');
        loadBookings();
    }
    
    // تسجيل الخروج
    logoutBtn?.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            sessionStorage.removeItem('wahaj_admin_logged');
            location.reload();
        }
    });
    
    // تحديث
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        loadBookings();
        showToast('تم التحديث ✅');
    });
    
    // تصدير
    document.getElementById('exportBtn')?.addEventListener('click', exportBookings);
    
    // فلترة
    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
});

/* ═══════════════════════════════════════════════════════
   📥 تحميل الحجوزات
   ═══════════════════════════════════════════════════════ */
function loadBookings() {
    try {
        const bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
        
        // ترتيب من الأحدث للأقدم
        allBookings = bookings.reverse();
        
        updateStats();
        applyFilters();
        
        console.log(`📊 تم تحميل ${allBookings.length} حجز`);
    } catch (e) {
        console.error('خطأ في تحميل الحجوزات:', e);
        allBookings = [];
        applyFilters();
    }
}

/* ═══════════════════════════════════════════════════════
   📊 الإحصائيات
   ═══════════════════════════════════════════════════════ */
function updateStats() {
    const total = allBookings.length;
    const pending = allBookings.filter(b => (b.status || 'pending') === 'pending').length;
    const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
    const rejected = allBookings.filter(b => b.status === 'rejected').length;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statConfirmed').textContent = confirmed;
    document.getElementById('statRejected').textContent = rejected;
}

/* ═══════════════════════════════════════════════════════
   🔍 الفلترة
   ═══════════════════════════════════════════════════════ */
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const searchQuery = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
    
    filteredBookings = allBookings.filter(booking => {
        // فلترة الحالة
        const bookingStatus = booking.status || 'pending';
        if (statusFilter !== 'all' && bookingStatus !== statusFilter) {
            return false;
        }
        
        // فلترة البحث
        if (searchQuery) {
            const searchText = `
                ${booking.bookingId || ''}
                ${booking.fullName || ''}
                ${booking.phone || ''}
                ${booking.email || ''}
                ${booking.date || ''}
            `.toLowerCase();
            
            if (!searchText.includes(searchQuery)) {
                return false;
            }
        }
        
        return true;
    });
    
    renderBookings();
}

/* ═══════════════════════════════════════════════════════
   🎨 عرض الحجوزات
   ═══════════════════════════════════════════════════════ */
function renderBookings() {
    const list = document.getElementById('bookingsList');
    const count = document.getElementById('bookingsCount');
    
    if (!list) return;
    
    count.textContent = `${filteredBookings.length} حجز`;
    
    if (filteredBookings.length === 0) {
        list.innerHTML = `
            <div class="no-bookings">
                <i class="fas fa-inbox"></i>
                <h3>لا توجد حجوزات</h3>
                <p>${allBookings.length === 0 ? 'لم يتم استلام أي حجز بعد' : 'لا توجد نتائج مطابقة للفلترة'}</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = filteredBookings.map(booking => {
        const status = booking.status || 'pending';
        const statusIcon = status === 'pending' ? 'fa-clock' : 
                          status === 'confirmed' ? 'fa-check' : 'fa-times';
        
        return `
            <div class="booking-item ${status}" data-id="${booking.bookingId}">
                <div class="booking-status-icon">
                    <i class="fas ${statusIcon}"></i>
                </div>
                
                <div class="booking-info">
                    <div class="booking-info-item">
                        <strong>رقم الحجز</strong>
                        <span>${booking.bookingId || '—'}</span>
                    </div>
                    <div class="booking-info-item">
                        <strong>الاسم</strong>
                        <span>${booking.fullName || '—'}</span>
                    </div>
                    <div class="booking-info-item">
                        <strong>الجوال</strong>
                        <span>${booking.phone || '—'}</span>
                    </div>
                    <div class="booking-info-item">
                        <strong>التاريخ</strong>
                        <span>${booking.dateFormatted || '—'}</span>
                    </div>
                    <div class="booking-info-item">
                        <strong>نوع الحجز</strong>
                        <span>${booking.bookingType || '—'}</span>
                    </div>
                    <div class="booking-info-item">
                        <strong>العربون</strong>
                        <span>${booking.deposit || 0} ر.ع</span>
                    </div>
                </div>
                
                <div class="booking-actions">
                    ${status === 'pending' ? `
                        <button class="action-btn confirm" onclick="confirmBooking('${booking.bookingId}')">
                            <i class="fas fa-check"></i> تأكيد
                        </button>
                        <button class="action-btn reject" onclick="rejectBooking('${booking.bookingId}')">
                            <i class="fas fa-times"></i> رفض
                        </button>
                    ` : ''}
                    <button class="action-btn whatsapp" onclick="contactCustomer('${booking.bookingId}')">
                        <i class="fab fa-whatsapp"></i> تواصل
                    </button>
                    <button class="action-btn delete" onclick="deleteBooking('${booking.bookingId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/* ═══════════════════════════════════════════════════════
   ✅ تأكيد حجز
   ═══════════════════════════════════════════════════════ */
function confirmBooking(bookingId) {
    if (!confirm('هل أنت متأكد من تأكيد هذا الحجز؟')) return;
    
    updateBookingStatus(bookingId, 'confirmed');
    
    // إرسال رسالة واتساب للتأكيد
    const booking = allBookings.find(b => b.bookingId === bookingId);
    if (booking && typeof WhatsApp !== 'undefined') {
        setTimeout(() => {
            if (confirm('هل تريد إرسال رسالة تأكيد للعميل عبر الواتساب؟')) {
                WhatsApp.confirmBooking(booking);
            }
        }, 500);
    }
    
    showToast('تم تأكيد الحجز ✅');
}

/* ═══════════════════════════════════════════════════════
   ❌ رفض حجز
   ═══════════════════════════════════════════════════════ */
function rejectBooking(bookingId) {
    const reason = prompt('سبب الرفض (اختياري):', '');
    if (reason === null) return; // ألغى
    
    updateBookingStatus(bookingId, 'rejected');
    
    const booking = allBookings.find(b => b.bookingId === bookingId);
    if (booking && typeof WhatsApp !== 'undefined') {
        setTimeout(() => {
            if (confirm('هل تريد إرسال رسالة رفض للعميل عبر الواتساب؟')) {
                WhatsApp.rejectBooking(booking, reason);
            }
        }, 500);
    }
    
    showToast('تم رفض الحجز');
}

/* ═══════════════════════════════════════════════════════
   🔄 تحديث حالة الحجز
   ═══════════════════════════════════════════════════════ */
function updateBookingStatus(bookingId, newStatus) {
    try {
        let bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
        
        const index = bookings.findIndex(b => b.bookingId === bookingId);
        if (index !== -1) {
            bookings[index].status = newStatus;
            bookings[index].updatedAt = new Date().toISOString();
            localStorage.setItem('wahaj_bookings', JSON.stringify(bookings));
        }
        
        loadBookings();
    } catch (e) {
        console.error('خطأ في تحديث الحجز:', e);
    }
}

/* ═══════════════════════════════════════════════════════
   📱 التواصل مع العميل
   ═══════════════════════════════════════════════════════ */
function contactCustomer(bookingId) {
    const booking = allBookings.find(b => b.bookingId === bookingId);
    if (!booking) return;
    
    const message = `السلام عليكم ${booking.fullName}،

بخصوص حجزك في استراحة وهج:

📋 رقم الحجز: ${booking.bookingId}
📅 التاريخ: ${booking.dateFormatted}

كيف يمكننا مساعدتك؟`;
    
    const phone = booking.phone?.replace(/[^0-9]/g, '') || '';
    const phoneWithCode = phone.startsWith('968') ? phone : `968${phone}`;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
}

/* ═══════════════════════════════════════════════════════
   🗑️ حذف حجز
   ═══════════════════════════════════════════════════════ */
function deleteBooking(bookingId) {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز نهائياً؟ لا يمكن التراجع.')) return;
    
    try {
        let bookings = JSON.parse(localStorage.getItem('wahaj_bookings') || '[]');
        bookings = bookings.filter(b => b.bookingId !== bookingId);
        localStorage.setItem('wahaj_bookings', JSON.stringify(bookings));
        
        loadBookings();
        showToast('تم حذف الحجز 🗑️');
    } catch (e) {
        console.error('خطأ في حذف الحجز:', e);
    }
}

/* ═══════════════════════════════════════════════════════
   📥 تصدير الحجوزات
   ═══════════════════════════════════════════════════════ */
function exportBookings() {
    if (allBookings.length === 0) {
        showToast('لا توجد حجوزات للتصدير', 'error');
        return;
    }
    
    // تحويل البيانات إلى CSV
    const headers = [
        'رقم الحجز', 'التاريخ', 'نوع اليوم', 'نوع الحجز', 
        'الاسم', 'الجوال', 'عدد الضيوف', 
        'السعر الإجمالي', 'العربون', 'الباقي', 'الحالة'
    ];
    
    const rows = allBookings.map(b => [
        b.bookingId || '',
        b.dateFormatted || '',
        b.dayType || '',
        b.bookingType || '',
        b.fullName || '',
        b.phone || '',
        b.guests || '',
        b.total || 0,
        b.deposit || 0,
        b.remaining || 0,
        b.status === 'confirmed' ? 'مؤكد' : 
        b.status === 'rejected' ? 'مرفوض' : 'بانتظار'
    ]);
    
    // إضافة BOM لدعم العربية في Excel
    let csvContent = '\uFEFF';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // تنزيل الملف
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `wahaj-bookings-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('تم تصدير الحجوزات 📥');
}

/* ═══════════════════════════════════════════════════════
   🎨 Toast Notification
   ═══════════════════════════════════════════════════════ */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 50%;
        transform: translateX(50%);
        background: ${type === 'error' ? '#DC3545' : '#28A745'};
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideDown 0.3s ease;
        font-family: 'Cairo', sans-serif;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

/* ─── Animations ─── */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translate(50%, -20px); }
        to { opacity: 1; transform: translate(50%, 0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translate(50%, 0); }
        to { opacity: 0; transform: translate(50%, -20px); }
    }
`;
document.head.appendChild(style);

/* ═══════════════════════════════════════════════════════
   🔥 Firebase Integration (اختياري - للمستقبل)
   ═══════════════════════════════════════════════════════ */
/*
   عند ربط Firebase، ستُستبدل الدوال loadBookings/updateBookingStatus
   بقراءة وكتابة من Firestore مباشرة.
   
   مثال:
   async function loadBookings() {
       const snapshot = await db.collection('bookings')
           .orderBy('createdAt', 'desc')
           .get();
       allBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       updateStats();
       applyFilters();
   }
*/
