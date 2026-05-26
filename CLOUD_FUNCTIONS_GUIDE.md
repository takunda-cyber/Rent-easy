# ☁️ Cloud Functions Guide

## Overview

Cloud Functions provide server-side validation, security, and logic for your Rent Easy app.

## Functions List

### 1. `validateAndCreateRoom`
**Purpose:** Create a new room with server-side validation

**Called From:** Frontend when user clicks "Post Room"

**Parameters:**
```javascript
{
  title: "2-Bed Apartment",
  location: "Harare",
  price: 500,
  phone: "+263771234567",
  imageUrl: "gs://bucket/path/to/image.jpg"
}
```

**Returns:**
```javascript
{
  success: true,
  roomId: "abc123",
  message: "Room posted successfully"
}
```

**Validation:**
- Title: 5-100 characters
- Location: 2-50 characters
- Price: 0-100,000 USD
- Phone: Valid format with regex
- Image: Must exist

---

### 2. `getUserRooms`
**Purpose:** Get all rooms posted by current user

**Called From:** "My Rooms" tab

**Parameters:** None (uses user auth context)

**Returns:**
```javascript
{
  success: true,
  rooms: [
    {
      id: "room1",
      title: "2-Bed",
      location: "Harare",
      price: 500,
      ...
    }
  ]
}
```

---

### 3. `searchRooms`
**Purpose:** Search rooms by location and price range

**Called From:** Browse tab search button

**Parameters:**
```javascript
{
  location: "Harare",     // Optional
  minPrice: 300,          // Optional
  maxPrice: 1000          // Optional
}
```

**Returns:**
```javascript
{
  success: true,
  rooms: [...],
  count: 5
}
```

---

### 4. `deleteRoom`
**Purpose:** Delete a room (owner only)

**Called From:** "Delete" button on My Rooms tab

**Parameters:**
```javascript
{
  roomId: "abc123"
}
```

**Returns:**
```javascript
{
  success: true,
  message: "Room deleted successfully"
}
```

**Security:**
- Only room owner can delete
- Automatically deletes image from storage
- Logs action to database

---

### 5. `updateRoom`
**Purpose:** Update room details (owner only)

**Called From:** Edit room form (Phase 2)

**Parameters:**
```javascript
{
  roomId: "abc123",
  updates: {
    title: "New Title",
    price: 600
    // Other fields...
  }
}
```

**Returns:**
```javascript
{
  success: true,
  message: "Room updated successfully"
}
```

---

### 6. `featureRoom`
**Purpose:** Feature/unfeature a room (admin only)

**Called From:** Admin dashboard (Phase 2)

**Parameters:**
```javascript
{
  roomId: "abc123",
  featured: true
}
```

**Returns:**
```javascript
{
  success: true,
  message: "Room featured!"
}
```

---

### 7. `adminDeleteRoom`
**Purpose:** Admin deletion with logging

**Called From:** Admin dashboard (Phase 2)

**Parameters:**
```javascript
{
  roomId: "abc123",
  reason: "Inappropriate content"
}
```

**Returns:**
```javascript
{
  success: true,
  message: "Room deleted by admin"
}
```

**Features:**
- Logs deletion reason
- Records original owner
- Audit trail in logs collection

---

### 8. `getStatistics`
**Purpose:** Get admin dashboard statistics

**Called From:** Admin dashboard (Phase 2)

**Parameters:** None

**Returns:**
```javascript
{
  success: true,
  stats: {
    totalRooms: 150,
    totalUsers: 45,
    totalActions: 890,
    featuredRooms: 5,
    avgPrice: 450.50
  }
}
```

---

## Monitoring Functions

### View Logs
```bash
firebase functions:log
```

### Real-time Logs
```bash
firebase functions:log --follow
```

### Firebase Console
1. Go to Firebase Console
2. Functions → Logs
3. Filter by function name
4. Check execution time, memory usage, errors

---

## Error Handling

### Common Errors

**`unauthenticated`**
- User not signed in
- Solution: Call `signIn()` first

**`permission-denied`**
- User doesn't own the resource
- Solution: Only owners can modify their rooms

**`invalid-argument`**
- Validation failed
- Solution: Check all required fields are valid

**`internal`**
- Server error
- Solution: Check Firebase logs

---

## Usage Examples

### From Frontend (JavaScript)

```javascript
// Get Firebase functions
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Call a function
const validateAndCreateRoom = httpsCallable(functions, 'validateAndCreateRoom');

try {
  const result = await validateAndCreateRoom({
    title: "2-Bed Apartment",
    location: "Harare",
    price: 500,
    phone: "+263771234567",
    imageUrl: "gs://..."
  });
  console.log(result.data);
} catch (error) {
  console.error(error.message);
}
```

---

## Quotas & Limits

- **Max request size:** 10MB
- **Max response size:** 10MB
- **Timeout:** 540 seconds
- **Memory:** 256MB to 8GB

---

## Next Steps

- Phase 2: Add user profile functions
- Phase 3: Add payment processing
- Phase 4: Add analytics functions

---

## Support

For issues: Check Firebase Functions documentation
- [https://firebase.google.com/docs/functions](https://firebase.google.com/docs/functions)
