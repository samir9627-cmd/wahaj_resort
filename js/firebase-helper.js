/* ═══════════════════════════════════════════════════════
   استراحة وهج - Firebase Helper
   دوال التعامل مع Firestore (CRUD)
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    // ─── Collections ───
    var COL = {
        bookings: 'bookings',
        blockedDates: 'blockedDates',
        offers: 'offers',
        images: 'images',
        settings: 'settings',
        messages: 'messages'
    };
    
    // ─── Wait for Firebase ───
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
    
    function saveBooking(bookingData) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false, error: 'Firebase not ready' });
                    return;
                }
                
                window.db.collection(COL.bookings).doc(bookingData.bookingId).set(
                    Object.assign({}, bookingData, {
                        serverCreatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                ).then(function() {
                    console.log('✅ حجز محفوظ سحابياً:', bookingData.bookingId);
                    resolve({ success: true, id: bookingData.bookingId });
                }).catch(function(error) {
                    console.error('❌ فشل حفظ الحجز:', error);
                    resolve({ success: false, error: error.message });
                });
            });
        });
    }
    
    function getAllBookings() {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve([]);
                    return;
                }
                
                window.db.collection(COL.bookings).get()
                    .then(function(snapshot) {
                        var bookings = [];
                        snapshot.forEach(function(doc) {
                            var data = doc.data();
                            data.firestoreId = doc.id;
                            data._source = 'cloud';
                            bookings.push(data);
                        });
                        
                        // ترتيب حسب التاريخ
                        bookings.sort(function(a, b) {
                            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                        });
                        
                        console.log('☁️ تم تحميل', bookings.length, 'حجز من السحابة');
                        resolve(bookings);
                    })
                    .catch(function(error) {
                        console.error('❌ فشل قراءة الحجوزات:', error);
                        resolve([]);
                    });
            });
        });
    }
    
    function updateBookingStatus(bookingId, newStatus) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                window.db.collection(COL.bookings).doc(bookingId).update({
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                }).then(function() {
                    console.log('✅ تم تحديث الحالة:', bookingId, '→', newStatus);
                    resolve({ success: true });
                }).catch(function(error) {
                    console.error('❌ فشل التحديث:', error);
                    resolve({ success: false, error: error.message });
                });
            });
        });
    }
    
    function deleteBooking(bookingId) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                window.db.collection(COL.bookings).doc(bookingId).delete()
                    .then(function() {
                        resolve({ success: true });
                    })
                    .catch(function(error) {
                        resolve({ success: false, error: error.message });
                    });
            });
        });
    }
    
    // ═══════════════════════════════════════════════════════
    // 🚫 BLOCKED DATES - حجب التواريخ
    // ═══════════════════════════════════════════════════════
    
    function addBlockedDate(date, type, reason) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                window.db.collection(COL.blockedDates).doc(date).set({
                    date: date,
                    type: type || 'other',
                    reason: reason || '',
                    createdAt: new Date().toISOString()
                }).then(function() {
                    console.log('✅ تم حجب:', date);
                    resolve({ success: true });
                }).catch(function(error) {
                    resolve({ success: false, error: error.message });
                });
            });
        });
    }
    
    function getAllBlockedDates() {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve([]);
                    return;
                }
                
                window.db.collection(COL.blockedDates).get()
                    .then(function(snapshot) {
                        var dates = [];
                        snapshot.forEach(function(doc) {
                            dates.push(doc.data());
                        });
                        resolve(dates);
                    })
                    .catch(function(error) {
                        console.error('❌ فشل قراءة الحجب:', error);
                        resolve([]);
                    });
            });
        });
    }
    
    function removeBlockedDate(date) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                window.db.collection(COL.blockedDates).doc(date).delete()
                    .then(function() {
                        resolve({ success: true });
                    })
                    .catch(function(error) {
                        resolve({ success: false, error: error.message });
                    });
            });
        });
    }
    
    // ═══════════════════════════════════════════════════════
    // 🎁 OFFERS - العروض
    // ═══════════════════════════════════════════════════════
    
    function addOffer(offerData) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                var id = 'offer_' + Date.now();
                window.db.collection(COL.offers).doc(id).set(
                    Object.assign({}, offerData, {
                        id: id,
                        active: true,
                        createdAt: new Date().toISOString()
                    })
                ).then(function() {
                    resolve({ success: true, id: id });
                }).catch(function(error) {
                    resolve({ success: false, error: error.message });
                });
            });
        });
    }
    
    function getAllOffers() {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve([]);
                    return;
                }
                
                window.db.collection(COL.offers).get()
                    .then(function(snapshot) {
                        var offers = [];
                        snapshot.forEach(function(doc) {
                            offers.push(doc.data());
                        });
                        resolve(offers);
                    })
                    .catch(function(error) {
                        resolve([]);
                    });
            });
        });
    }
    
    function updateOffer(id, updates) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                window.db.collection(COL.offers).doc(id).update(updates)
                    .then(function() {
                        resolve({ success: true });
                    })
                    .catch(function(error) {
                        resolve({ success: false, error: error.message });
                    });
            });
        });
    }
    
    function deleteOffer(id) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                window.db.collection(COL.offers).doc(id).delete()
                    .then(function() {
                        resolve({ success: true });
                    })
                    .catch(function(error) {
                        resolve({ success: false, error: error.message });
                    });
            });
        });
    }
    
    // ═══════════════════════════════════════════════════════
    // 🖼️ IMAGES - الصور
    // ═══════════════════════════════════════════════════════
    
    function addImage(imageData) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                var id = 'img_' + Date.now();
                window.db.collection(COL.images).doc(id).set(
                    Object.assign({}, imageData, {
                        id: id,
                        createdAt: new Date().toISOString()
                    })
                ).then(function() {
                    resolve({ success: true, id: id });
                }).catch(function(error) {
                    resolve({ success: false, error: error.message });
                });
            });
        });
    }
    
    function getAllImages() {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve([]);
                    return;
                }
                
                window.db.collection(COL.images).get()
                    .then(function(snapshot) {
                        var images = [];
                        snapshot.forEach(function(doc) {
                            images.push(doc.data());
                        });
                        resolve(images);
                    })
                    .catch(function(error) {
                        resolve([]);
                    });
            });
        });
    }
    
    function deleteImage(id) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                window.db.collection(COL.images).doc(id).delete()
                    .then(function() {
                        resolve({ success: true });
                    })
                    .catch(function(error) {
                        resolve({ success: false, error: error.message });
                    });
            });
        });
    }
    
    // ═══════════════════════════════════════════════════════
    // ⚙️ SETTINGS - الأسعار والرسائل
    // ═══════════════════════════════════════════════════════
    
    function saveSetting(key, value) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve({ success: false });
                    return;
                }
                
                window.db.collection(COL.settings).doc(key).set({
                    value: value,
                    updatedAt: new Date().toISOString()
                }).then(function() {
                    resolve({ success: true });
                }).catch(function(error) {
                    resolve({ success: false, error: error.message });
                });
            });
        });
    }
    
    function getSetting(key, defaultValue) {
        return new Promise(function(resolve) {
            waitForFirebase(function(ready) {
                if (!ready) {
                    resolve(defaultValue);
                    return;
                }
                
                window.db.collection(COL.settings).doc(key).get()
                    .then(function(doc) {
                        if (doc.exists) {
                            resolve(doc.data().value);
                        } else {
                            resolve(defaultValue);
                        }
                    })
                    .catch(function(error) {
                        resolve(defaultValue);
                    });
            });
        });
    }
    
    // ═══════════════════════════════════════════════════════
    // 📤 PUBLIC API
    // ═══════════════════════════════════════════════════════
    
    window.WahajFirebase = {
        waitForFirebase: waitForFirebase,
        
        // Bookings
        saveBooking: saveBooking,
        getAllBookings: getAllBookings,
        updateBookingStatus: updateBookingStatus,
        deleteBooking: deleteBooking,
        
        // Blocked Dates
        addBlockedDate: addBlockedDate,
        getAllBlockedDates: getAllBlockedDates,
        removeBlockedDate: removeBlockedDate,
        
        // Offers
        addOffer: addOffer,
        getAllOffers: getAllOffers,
        updateOffer: updateOffer,
        deleteOffer: deleteOffer,
        
        // Images
        addImage: addImage,
        getAllImages: getAllImages,
        deleteImage: deleteImage,
        
        // Settings
        saveSetting: saveSetting,
        getSetting: getSetting
    };
    
    console.log('✅ WahajFirebase Helper جاهز');
    
})();
