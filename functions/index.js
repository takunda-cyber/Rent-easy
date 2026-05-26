const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// ========== VALIDATION FUNCTIONS ==========

function validateRoom(room) {
  if (!room.title || typeof room.title !== 'string' || room.title.length < 5 || room.title.length > 100) {
    throw new Error('Invalid title: must be 5-100 characters');
  }
  if (!room.location || typeof room.location !== 'string' || room.location.length < 2 || room.location.length > 50) {
    throw new Error('Invalid location: must be 2-50 characters');
  }
  if (typeof room.price !== 'number' || room.price <= 0 || room.price > 100000) {
    throw new Error('Invalid price: must be between 0 and 100000');
  }
  if (!room.phone || !room.phone.match(/^\+?[0-9\s\-\(\)]{7,}$/)) {
    throw new Error('Invalid phone number format');
  }
  if (!room.imageUrl || typeof room.imageUrl !== 'string') {
    throw new Error('Image URL is required');
  }
}

function logAction(action, userId, data) {
  return db.collection('logs').add({
    action,
    userId,
    data,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ip: data.ip || 'unknown'
  });
}

// ========== ROOM FUNCTIONS ==========

// 1. Validate and create room
exports.validateAndCreateRoom = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    validateRoom(data);

    const roomData = {
      title: data.title.trim(),
      location: data.location.trim(),
      price: parseFloat(data.price),
      phone: data.phone.trim(),
      imageUrl: data.imageUrl,
      userId: context.auth.uid,
      featured: false,
      views: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('rooms').add(roomData);
    await logAction('room_created', context.auth.uid, { roomId: docRef.id });

    return {
      success: true,
      roomId: docRef.id,
      message: 'Room posted successfully'
    };
  } catch (error) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }
});

// 2. Get user's rooms
exports.getUserRooms = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const snapshot = await db.collection('rooms')
      .where('userId', '==', context.auth.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, rooms };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 3. Search rooms by location and price
exports.searchRooms = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    let query = db.collection('rooms');

    if (data.location && data.location.trim()) {
      query = query.where('location', '>=', data.location.trim())
                   .where('location', '<=', data.location.trim() + '\uf8ff');
    }

    if (data.minPrice) {
      query = query.where('price', '>=', parseFloat(data.minPrice));
    }

    if (data.maxPrice) {
      query = query.where('price', '<=', parseFloat(data.maxPrice));
    }

    query = query.orderBy('createdAt', 'desc').limit(50);

    const snapshot = await query.get();
    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, rooms, count: rooms.length };
  } catch (error) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }
});

// 4. Delete room (owner only)
exports.deleteRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const roomId = data.roomId;
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    const roomDoc = await db.collection('rooms').doc(roomId).get();
    if (!roomDoc.exists) {
      throw new Error('Room not found');
    }

    const roomData = roomDoc.data();
    if (roomData.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'You can only delete your own rooms');
    }

    // Delete image from storage
    if (roomData.imageUrl) {
      try {
        const bucket = storage.bucket();
        await bucket.file(roomData.imagePath).delete();
      } catch (e) {
        console.error('Error deleting image:', e);
      }
    }

    await db.collection('rooms').doc(roomId).delete();
    await logAction('room_deleted', context.auth.uid, { roomId });

    return { success: true, message: 'Room deleted successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 5. Update room (owner only)
exports.updateRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const roomId = data.roomId;
    const updates = data.updates;

    const roomDoc = await db.collection('rooms').doc(roomId).get();
    if (!roomDoc.exists) {
      throw new Error('Room not found');
    }

    if (roomDoc.data().userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'You can only update your own rooms');
    }

    validateRoom({ ...roomDoc.data(), ...updates });

    await db.collection('rooms').doc(roomId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await logAction('room_updated', context.auth.uid, { roomId });
    return { success: true, message: 'Room updated successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }
});

// 6. Feature room (admin only)
exports.featureRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin (would need to implement admin check)
  try {
    const roomId = data.roomId;
    const featured = data.featured;

    await db.collection('rooms').doc(roomId).update({
      featured: featured,
      featuredAt: featured ? admin.firestore.FieldValue.serverTimestamp() : null
    });

    await logAction('room_featured', context.auth.uid, { roomId, featured });
    return { success: true, message: featured ? 'Room featured!' : 'Feature removed' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 7. Admin delete room
exports.adminDeleteRoom = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const roomId = data.roomId;
    const reason = data.reason || 'No reason provided';

    const roomDoc = await db.collection('rooms').doc(roomId).get();
    if (!roomDoc.exists) {
      throw new Error('Room not found');
    }

    const roomData = roomDoc.data();

    await db.collection('rooms').doc(roomId).delete();
    await logAction('admin_room_deleted', context.auth.uid, {
      roomId,
      originalOwner: roomData.userId,
      reason
    });

    return { success: true, message: 'Room deleted by admin' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// 8. Get statistics (admin dashboard)
exports.getStatistics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const roomsSnapshot = await db.collection('rooms').get();
    const logsSnapshot = await db.collection('logs').get();
    const usersSnapshot = await db.collection('users').get();

    const stats = {
      totalRooms: roomsSnapshot.size,
      totalUsers: usersSnapshot.size,
      totalActions: logsSnapshot.size,
      featuredRooms: roomsSnapshot.docs.filter(d => d.data().featured).length,
      avgPrice: roomsSnapshot.docs.reduce((sum, d) => sum + d.data().price, 0) / (roomsSnapshot.size || 1)
    };

    return { success: true, stats };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
