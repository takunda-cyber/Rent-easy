const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates room data before storing
 */
function validateRoom(data) {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (data.title.length < 5 || data.title.length > 100) {
    errors.push('Title must be between 5 and 100 characters');
  }
  
  if (!data.location || typeof data.location !== 'string') {
    errors.push('Location is required and must be a string');
  }
  
  if (!data.price || typeof data.price !== 'string') {
    errors.push('Price is required');
  } else {
    const price = parseInt(data.price);
    if (isNaN(price) || price < 0 || price > 1000000) {
      errors.push('Price must be a valid number between 0 and 1000000');
    }
  }
  
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Phone number is required');
  } else if (!/^\+?[0-9]{10,15}$/.test(data.phone.replace(/[\s-()]/g, ''))) {
    errors.push('Phone number must be valid (10-15 digits)');
  }
  
  return errors;
}

/**
 * Sanitizes user input to prevent XSS
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .substring(0, 500); // Max length
}

// ============================================
// ROOM MANAGEMENT FUNCTIONS
// ============================================

/**
 * Called before room creation to validate data
 */
exports.validateAndCreateRoom = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Validate room data
  const errors = validateRoom(data);
  if (errors.length > 0) {
    throw new functions.https.HttpsError('invalid-argument', errors.join(', '));
  }
  
  // Sanitize inputs
  const sanitizedRoom = {
    title: sanitizeString(data.title),
    location: sanitizeString(data.location),
    price: data.price,
    phone: data.phone, // Phone stays sanitized server-side
    imageUrl: data.imageUrl || '',
    userId: context.auth.uid,
    featured: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  // Create room in Firestore
  const roomRef = await db.collection('rooms').add(sanitizedRoom);
  
  return {
    success: true,
    roomId: roomRef.id,
    message: 'Room created successfully'
  };
});

/**
 * Get user's rooms
 */
exports.getUserRooms = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const snapshot = await db.collection('rooms')
    .where('userId', '==', context.auth.uid)
    .orderBy('createdAt', 'desc')
    .get();
  
  const rooms = [];
  snapshot.forEach(doc => {
    rooms.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return { rooms };
});

/**
 * Search rooms by location and price
 */
exports.searchRooms = functions.https.onCall(async (data, context) => {
  let query = db.collection('rooms');
  
  if (data.location && data.location.trim() !== '') {
    const location = sanitizeString(data.location).toLowerCase();
    query = query.where('location', '>=', location)
                  .where('location', '<=', location + '\uf8ff');
  }
  
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    const minPrice = parseInt(data.minPrice);
    const maxPrice = parseInt(data.maxPrice);
    
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      query = query.where('price', '>=', minPrice.toString())
                    .where('price', '<=', maxPrice.toString());
    }
  }
  
  query = query.orderBy('createdAt', 'desc').limit(100);
  
  const snapshot = await query.get();
  const rooms = [];
  
  snapshot.forEach(doc => {
    rooms.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return { rooms };
});

/**
 * Delete room (owner only)
 */
exports.deleteRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const roomId = data.roomId;
  if (!roomId) {
    throw new functions.https.HttpsError('invalid-argument', 'Room ID is required');
  }
  
  const roomRef = db.collection('rooms').doc(roomId);
  const room = await roomRef.get();
  
  if (!room.exists) {
    throw new functions.https.HttpsError('not-found', 'Room not found');
  }
  
  // Check ownership
  if (room.data().userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'You can only delete your own rooms');
  }
  
  // Delete image from storage if exists
  if (room.data().imageUrl) {
    try {
      const filePath = decodeURIComponent(room.data().imageUrl.split('/o/')[1].split('?')[0]);
      await storage.bucket().file(filePath).delete();
    } catch (error) {
      console.error('Error deleting image:', error);
      // Continue anyway
    }
  }
  
  // Delete room document
  await roomRef.delete();
  
  return {
    success: true,
    message: 'Room deleted successfully'
  };
});

/**
 * Update room (owner only)
 */
exports.updateRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const roomId = data.roomId;
  if (!roomId) {
    throw new functions.https.HttpsError('invalid-argument', 'Room ID is required');
  }
  
  const roomRef = db.collection('rooms').doc(roomId);
  const room = await roomRef.get();
  
  if (!room.exists) {
    throw new functions.https.HttpsError('not-found', 'Room not found');
  }
  
  // Check ownership
  if (room.data().userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'You can only update your own rooms');
  }
  
  // Prepare update object (only allow certain fields)
  const updateData = {};
  
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.length < 5 || data.title.length > 100) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid title');
    }
    updateData.title = sanitizeString(data.title);
  }
  
  if (data.location !== undefined) {
    if (typeof data.location !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid location');
    }
    updateData.location = sanitizeString(data.location);
  }
  
  if (data.price !== undefined) {
    const price = parseInt(data.price);
    if (isNaN(price) || price < 0 || price > 1000000) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid price');
    }
    updateData.price = data.price;
  }
  
  updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  
  await roomRef.update(updateData);
  
  return {
    success: true,
    message: 'Room updated successfully'
  };
});

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Admin: Feature a room
 */
exports.featureRoom = functions.https.onCall(async (data, context) => {
  // Check if user is admin (verify via custom claims)
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can feature rooms');
  }
  
  const roomId = data.roomId;
  if (!roomId) {
    throw new functions.https.HttpsError('invalid-argument', 'Room ID is required');
  }
  
  const roomRef = db.collection('rooms').doc(roomId);
  const room = await roomRef.get();
  
  if (!room.exists) {
    throw new functions.https.HttpsError('not-found', 'Room not found');
  }
  
  await roomRef.update({
    featured: true,
    featuredAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return {
    success: true,
    message: 'Room featured successfully'
  };
});

/**
 * Admin: Delete any room
 */
exports.adminDeleteRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can delete rooms');
  }
  
  const roomId = data.roomId;
  const reason = data.reason || 'No reason provided';
  
  if (!roomId) {
    throw new functions.https.HttpsError('invalid-argument', 'Room ID is required');
  }
  
  const roomRef = db.collection('rooms').doc(roomId);
  const room = await roomRef.get();
  
  if (!room.exists) {
    throw new functions.https.HttpsError('not-found', 'Room not found');
  }
  
  // Log deletion for audit trail
  await db.collection('auditLogs').add({
    action: 'ADMIN_DELETE_ROOM',
    roomId,
    adminId: context.auth.uid,
    reason,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    roomData: room.data()
  });
  
  // Delete image
  if (room.data().imageUrl) {
    try {
      const filePath = decodeURIComponent(room.data().imageUrl.split('/o/')[1].split('?')[0]);
      await storage.bucket().file(filePath).delete();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
  
  // Delete room
  await roomRef.delete();
  
  return {
    success: true,
    message: 'Room deleted by admin'
  };
});

// ============================================
// STATISTICS FUNCTIONS
// ============================================

/**
 * Get statistics (admin only)
 */
exports.getStatistics = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can view statistics');
  }
  
  const roomsSnapshot = await db.collection('rooms').get();
  const usersSnapshot = await db.collection('users').get();
  
  let totalViews = 0;
  let featuredCount = 0;
  
  roomsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.views) totalViews += data.views;
    if (data.featured) featuredCount++;
  });
  
  return {
    totalRooms: roomsSnapshot.size,
    totalUsers: usersSnapshot.size,
    totalViews,
    featuredRooms: featuredCount,
    storageUsage: 'Check Firebase Console'
  };
});
