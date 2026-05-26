# Cloud Functions Guide

## Overview

Cloud Functions provide server-side logic for your Rent Easy app. They validate data, prevent abuse, and enforce security rules.

---

## Available Functions

### 1. **validateAndCreateRoom**
Validates and creates a new room listing.

**Usage:**
```javascript
const functions = getFunctions();
const createRoom = httpsCallable(functions, 'validateAndCreateRoom');

try {
  const result = await createRoom({
    title: "2-bed apartment",
    location: "Harare",
    price: "500",
    phone: "+263701234567",
    imageUrl: "gs://..." // URL from storage
  });
  console.log('Room created:', result.data.roomId);
} catch (error) {
  console.error('Error:', error.message);
}
```

**Validations:**
- Title: 5-100 characters
- Location: Not empty
- Price: 0-1,000,000
- Phone: 10-15 digits
- Prevents XSS attacks via sanitization

---

### 2. **getUserRooms**
Gets all rooms posted by the current user.

**Usage:**
```javascript
const getUserRoomsFunc = httpsCallable(functions, 'getUserRooms');

const result = await getUserRoomsFunc();
console.log('My rooms:', result.data.rooms);
```

**Returns:**
```javascript
{
  rooms: [
    {
      id: "room123",
      title: "2-bed apartment",
      location: "Harare",
      price: "500",
      imageUrl: "gs://...",
      createdAt: 1234567890,
      featured: false
    }
  ]
}
```

---

### 3. **searchRooms**
Searches rooms by location and/or price range.

**Usage:**
```javascript
const searchRoomsFunc = httpsCallable(functions, 'searchRooms');

const result = await searchRoomsFunc({
  location: "Harare",
  minPrice: "300",
  maxPrice: "800"
});
console.log('Results:', result.data.rooms);
```

**Parameters:**
- `location` (optional): City name
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price

---

### 4. **deleteRoom**
Deletes a room (owner only).

**Usage:**
```javascript
const deleteRoomFunc = httpsCallable(functions, 'deleteRoom');

const result = await deleteRoomFunc({
  roomId: "room123"
});
console.log('Room deleted');
```

**Security:**
- Only room owner can delete
- Removes image from storage
- Audit log created

---

### 5. **updateRoom**
Updates room details (owner only).

**Usage:**
```javascript
const updateRoomFunc = httpsCallable(functions, 'updateRoom');

const result = await updateRoomFunc({
  roomId: "room123",
  title: "Newly updated title",
  price: "600"
});
console.log('Room updated');
```

**Allowed fields:**
- title (5-100 chars)
- location (non-empty)
- price (0-1,000,000)

---

### 6. **featureRoom** (Admin Only)
Marks a room as featured (premium listing).

**Usage:**
```javascript
const featureRoomFunc = httpsCallable(functions, 'featureRoom');

const result = await featureRoomFunc({
  roomId: "room123"
});
console.log('Room featured');
```

**Requirements:**
- User must have `admin: true` custom claim

---

### 7. **adminDeleteRoom** (Admin Only)
Deletes any room with reason logging.

**Usage:**
```javascript
const adminDeleteRoomFunc = httpsCallable(functions, 'adminDeleteRoom');

const result = await adminDeleteRoomFunc({
  roomId: "room123",
  reason: "Inappropriate content"
});
console.log('Room deleted by admin');
```

**Logged in `auditLogs` collection:**
- Admin ID
- Reason for deletion
- Original room data
- Timestamp

---

### 8. **getStatistics** (Admin Only)
Gets app statistics.

**Usage:**
```javascript
const getStatsFunc = httpsCallable(functions, 'getStatistics');

const result = await getStatsFunc();
console.log('Statistics:', result.data);
```

**Returns:**
```javascript
{
  totalRooms: 150,
  totalUsers: 320,
  totalViews: 5000,
  featuredRooms: 12,
  storageUsage: "Check Firebase Console"
}
```

---

## Error Handling

All functions throw `HttpsError` with specific codes:

```javascript
try {
  await createRoom({...});
} catch (error) {
  if (error.code === 'unauthenticated') {
    console.log('User not logged in');
  } else if (error.code === 'invalid-argument') {
    console.log('Invalid input:', error.message);
  } else if (error.code === 'permission-denied') {
    console.log('Not authorized');
  } else if (error.code === 'not-found') {
    console.log('Room not found');
  }
}
```

---

## Deployment

### Deploy functions:
```bash
firebase deploy --only functions
```

### View logs:
```bash
firebase functions:log
```

### Test locally:
```bash
firebase emulators:start --only functions
```

---

## Best Practices

1. **Always validate input** - Functions sanitize automatically
2. **Check authentication** - All functions verify user is logged in
3. **Verify ownership** - Can't delete/update other users' rooms
4. **Log actions** - Audit trail for admin actions
5. **Use try-catch** - Handle errors gracefully
6. **Monitor logs** - Check `firebase functions:log` regularly

---

## Performance Tips

1. **Indexes** - Already configured in `firestore.indexes.json`
2. **Query limits** - Functions limit results to 100 documents
3. **Batch operations** - Use batch writes for multiple changes
4. **Caching** - Results cached by Firebase automatically

---

## Cost Optimization

- Cloud Functions: ~$0.40/million invocations
- Firestore: ~$0.06 per 100K reads, $0.18 per 100K writes
- Storage: ~$0.020/GB/month

Start free tier (2M function calls/month), upgrade as needed.

