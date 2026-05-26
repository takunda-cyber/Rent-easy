# 🚀 Rent Easy - Complete Setup Guide

## Phase 1: Foundation Setup

### Step 1: Prerequisites

1. **Node.js & npm**
   ```bash
   node --version  # Should be v14+
   npm --version
   ```

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

### Step 2: Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started" → "Add Project"
3. **Project Name:** `rent-easy-zw` (or similar)
4. **Analytics:** Enable (optional)
5. Click "Create Project" and wait for completion

### Step 3: Get Firebase Credentials

1. In Firebase Console → Project Settings (⚙️)
2. Scroll to "Your apps" → Click "Web" (</>
3. Copy the config:
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   }
   ```

### Step 4: Set Up Environment Variables

```bash
# Clone or navigate to your project
cd rent-easy

# Copy example file
cp .env.example .env

# Edit .env and paste your Firebase config
nano .env
```

**Example .env:**
```
VITE_FIREBASE_API_KEY=AIzaSyDemoKey123456
VITE_FIREBASE_AUTH_DOMAIN=renteasyzw.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=renteasyzw
VITE_FIREBASE_STORAGE_BUCKET=renteasyzw.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_ADMIN_EMAILS=you@example.com
```

### Step 5: Enable Firebase Services

1. **Firestore Database:**
   - Firebase Console → Firestore Database
   - Click "Create Database"
   - Start in **Test Mode** (for development)
   - Select region: `us-central1`

2. **Cloud Storage:**
   - Firebase Console → Storage
   - Click "Get Started"
   - Accept defaults
   - Click "Done"

3. **Authentication:**
   - Firebase Console → Authentication
   - Click "Get Started"
   - Enable **Anonymous** auth

### Step 6: Deploy Security Rules

```bash
# Initialize Firebase (first time only)
firebase init
# Select: Firestore, Storage, Hosting
# Use project: renteasyzw
# Accept defaults for most prompts

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

### Step 7: Deploy Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Go back to root
cd ..

# Deploy functions
firebase deploy --only functions
```

### Step 8: Deploy to Hosting

```bash
# Deploy everything
firebase deploy

# OR deploy just hosting
firebase deploy --only hosting
```

### Step 9: Test the App

1. Get your Firebase Hosting URL from deploy output
2. Open it in browser
3. Test:
   - ✅ Sign in works
   - ✅ Post a room works
   - ✅ Upload image works
   - ✅ View rooms works
   - ✅ Delete room works

## Troubleshooting

### Issue: "Firebase config is not defined"
**Solution:** Update Firebase config in `public/index.html` lines 304-312

### Issue: "Permission denied" when uploading
**Solution:** Check Storage rules are deployed:
```bash
firebase deploy --only storage:rules
```

### Issue: "Cannot read property 'uid' of null"
**Solution:** User needs to sign in first. Check auth flow.

### Issue: Images not uploading
**Solution:** 
1. Check file size < 5MB
2. Check file type is JPEG/PNG/WebP
3. Check Storage bucket exists

## Next Steps

Phase 2 features:
- User profiles
- Room ratings & reviews
- Analytics dashboard
- Search improvements
- Payment integration

## Support

For Firebase issues: [Firebase Docs](https://firebase.google.com/docs)
For help: Check `CLOUD_FUNCTIONS_GUIDE.md`
