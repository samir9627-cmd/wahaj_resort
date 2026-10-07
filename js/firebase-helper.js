/* ═══════════════════════════════════════════════════════
   استراحة وهج - Firebase Helper
   دوال التعامل مع Firestore و Storage
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    const COLLECTIONS = {
        bookings: 'bookings',
        blockedDates: 'blockedDates',
        settings: 'settings',
        offers: 'offers',
        messages: 'messages'
    };
    
    // ─── الانتظار حتى تجهز Firebase ───
    function waitForFirebase(callback, maxWait) {
        maxWait = maxWait || 10000;
        var start = Date.now();
        var interval = setInterval(function() {
            if (window.firebaseReady && window.db) {
                clearInterval(interval);
                callback(true);
            } else if (Date.now() - start > maxWait) {
                clearInterval(interval);
                callback(false);
            }
        }, 200);
    }
    
    // ═══════════════════════════════════════════════════════
    // 📅 BOOKINGS - الحجوزات
    // ═══════════════════════════════════════════════════════
    
    async function saveBooking(bookingData) {
        try {
            var docRef = await window.db.collection(COLLECTIONS.bookings).add({
                ...bookingData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                syncedAt: new Date().toISOString()
            });
            console.log('✅ تم حفظ الحجز سحابياً:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ خطأ في حفظ الحجز:', error);
            return { success: false, error: error.message };
        }
    }
    
    async function getAllBookings() {
        try {
            var snapshot = await window.db.collection(COLLECTIONS.bookings)
                .orderBy('createdAt', 'desc')
                .get();
            
            var bookings = [];
            snapshot.forEach(function(doc) {
                bookings.push({
                    firestoreId: doc.id,
                    ...doc.data()
                });
            });
            return bookings;
        } catch (error) {
            console.error('❌ خطأ في قراءة الحجوزات:', error);
            return [];
        }
    }
    
    async function updateBookingStatus(firestoreId, newStatus) {
        try {
            await window.db.collection(COLLECTIONS.bookings).doc(firestoreId).update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ خطأ في تحديث الحجز:', error);
            return { success: false, error: error.message };
        }
    }
    
    async function deleteBookingCloud(firestoreId) {
        try {
            await window.db.collection(COLLECTIONS.bookings).doc(firestoreId).delete();
            return { success: true };
        } catch (error) {
            console.error('❌ خطأ في حذف الحجز:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // 🚫 BLOCKED DATES - حجب التواريخ
    // ═══════════════════════════════════════════════════════
    
    async function addBlockedDate(date, reason) {
        try {
            await window.db.collection(COLLECTIONS.blockedDates).doc(date).set({
                date: date,
                reason: reason || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ تم حجب التاريخ:', date);
            return { success: true };
        } catch (error) {
            console.error('❌ خطأ في الحجب:', error);
            return { success: false, error: error.message };
        }
    }
    
    async function getAllBlockedDates() {
        try {
            var snapshot = await window.db.collection(COLLECTIONS.blockedDates).get();
            var dates = [];
            snapshot.forEach(function(doc) {
                dates.push(doc.data());
            });
            return dates;
        } catch (error) {
            console.error('❌ خطأ:', error);
            return [];
        }
    }
    
    async function removeBlockedDate(date) {
        try {
            await window.db.collection(COLLECTIONS.blockedDates).doc(date).delete();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // ⚙️ SETTINGS - الإعدادات (أسعار، رسائل، إلخ)
    // ═══════════════════════════════════════════════════════
    
    async function saveSetting(key, value) {
        try {
            await window.db.collection(COLLECTIONS.settings).doc(key).set({
                value: value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async function getSetting(key, defaultValue) {
        try {
            var doc = await window.db.collection(COLLECTIONS.settings).doc(key).get();
            if (doc.exists) {
                return doc.data().value;
            }
            return defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // 🎁 OFFERS - العروض
    // ═══════════════════════════════════════════════════════
    
    async function addOffer(offerData) {
        try {
            var docRef = await window.db.collection(COLLECTIONS.offers).add({
                ...offerData,
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async function getAllOffers() {
        try {
            var snapshot = await window.db.collection(COLLECTIONS.offers).get();
            var offers = [];
            snapshot.forEach(function(doc) {
                offers.push({ id: doc.id, ...doc.data() });
            });
            return offers;
        } catch (error) {
            return [];
        }
    }
    
    async function deleteOffer(id) {
        try {
            await window.db.collection(COLLECTIONS.offers).doc(id).delete();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // 📸 STORAGE - رفع الصور
    // ═══════════════════════════════════════════════════════
    
    async function uploadImage(file, folder) {
        try {
            folder = folder || 'gallery';
            var filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            var path = folder + '/' + filename;
            
            var ref = window.storage.ref(path);
            var snapshot = await ref.put(file);
            var downloadURL = await snapshot.ref.getDownloadURL();
            
            console.log('✅ تم رفع الصورة:', downloadURL);
            return { success: true, url: downloadURL, path: path };
        } catch (error) {
            console.error('❌ خطأ في رفع الصورة:', error);
            return { success: false, error: error.message };
        }
    }
    
    async function deleteImage(path) {
        try {
            await window.storage.ref(path).delete();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // ═══════════════════════════════════════════════════════
    // 🌐 PUBLIC API
    // ═══════════════════════════════════════════════════════
    
    window.WahajFirebase = {
        // Utility
        waitForFirebase: waitForFirebase,
        
        // Bookings
        saveBooking: saveBooking,
        getAllBookings: getAllBookings,
        updateBookingStatus: updateBookingStatus,
        deleteBooking: deleteBookingCloud,
        
        // Blocked Dates
        addBlockedDate: addBlockedDate,
        getAllBlockedDates: getAllBlockedDates,
        removeBlockedDate: removeBlockedDate,
        
        // Settings
        saveSetting: saveSetting,
        getSetting: getSetting,
        
        // Offers
        addOffer: addOffer,
        getAllOffers: getAllOffers,
        deleteOffer: deleteOffer,
        
        // Storage
        uploadImage: uploadImage,
        deleteImage: deleteImage
    };
    
    console.log('✅ Firebase Helper loaded');
    
})();
