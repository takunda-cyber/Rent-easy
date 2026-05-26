# Rent Easy - Phase 1 Setup Guide

## 🚀 Quick Start

Follow these steps to get your Rent Easy app running locally and deployed to Firebase.

---

## **Step 1: Install Firebase CLI**

```bash
# Install globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

---

## **Step 2: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Name it "Rent Easy" or similar
4. Accept terms and create
5. Skip Google Analytics for now

---

## **Step 3: Set Up Firebase Services**

### Enable Firestore Database:
1. In Firebase Console → Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select region closest to Zimbabwe (Africa: `europe-west1`)
5. Create

### Enable Cloud Storage:
1. Firebase Console → Storage
2. Click "Get started"
3. Accept default rules
4. Create

### Enable Authentication:
1. Firebase Console → Authentication
2. Click "Get started"
3. Enable "Anonymous" sign-in method
4. Save

---

## **Step 4: Get Firebase Credentials**

1. Firebase Console → Project Settings (⚙️ icon)
2. Scroll to "Your apps"
3. Click "Web" icon (if no app exists, add one)
4. Copy the config object:

```javascript
{
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

---

## **Step 5: Set Up Local Environment**

### Create `.env` file:

```bash
# In repository root
cp .env.example .env
```

### Edit `.env` and add your Firebase credentials:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
ADMIN_EMAIL=youremail@gmail.com
```

⚠️ **IMPORTANT:** Never commit `.env` to GitHub!

---

## **Step 6: Deploy Security Rules**

### Initialize Firebase in your project:

```bash
# In repository root
firebase init

# Select:
# - Firestore
# - Storage
# - Hosting
# - Functions
```

### Update `firebase.json`:

Replace the storage bucket name with your actual bucket:

```json
"storage": [
  {
    "bucket": "YOUR_PROJECT.appspot.com",
    "rules": "storage.rules"
  }
]
```

### Deploy rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

✅ Your security rules are now live!

---

## **Step 7: Deploy Cloud Functions**

### Install dependencies:

```bash
cd functions
npm install
cd ..
```

### Deploy functions:

```bash
firebase deploy --only functions
```

✅ Cloud Functions are now deployed!

---

## **Step 8: Set Up Hosting**

### Copy your app to public folder:

```bash
mkdir -p public
cp index.html public/
cp styles.css public/ 2>/dev/null || true
cp script.js public/ 2>/dev/null || true
```

### Deploy to Firebase Hosting:

```bash
firebase deploy --only hosting
```

✅ Your app is now live! Check the hosting URL.

---

## **Step 9: Test the App**

1. Open your Firebase Hosting URL
2. Try to sign in (should work with Anonymous Auth)
3. Try to post a room:
   - Add title: "2-bed apartment"
   - Add location: "Harare"
   - Add price: "500"
   - Add phone: "+263701234567"
   - Upload an image (JPG/PNG/WebP, <5MB)
   - Click "Post Room"
4. Verify room appears in the list
5. Try to contact owner (WhatsApp link should work)

---

## **Step 10: Set Up Admin Features**

### Add admin claims to your user:

```bash
# Get your Firebase user ID from Firebase Console → Authentication
firebase functions:shell

# In the shell:
admin.auth().setCustomUserClaims("YOUR_USER_ID", {admin: true}).then(() => console.log("Done"));
exit;
```

✅ You now have admin powers!

---

## **Step 11: Monitor and Debug**

### View Firestore data:
```bash
firebase firestore:export --backup-dir backups/
```

### View Cloud Function logs:
```bash
firebase functions:log
```

### View Hosting analytics:
- Firebase Console → Hosting → Analytics

---

## **Troubleshooting**

### "Access Denied" error:
- Check security rules are deployed
- Check Firestore/Storage are enabled
- Check authentication is enabled

### "Image won't upload":
- File must be JPEG, PNG, or WebP
- File must be under 5MB
- Check storage.rules are deployed

### "Cloud Functions not working":
- Run `firebase deploy --only functions` again
- Check `firebase functions:log` for errors
- Verify `firebase.json` has correct bucket name

### "Firebase config not working":
- Double-check `.env` file has correct values
- Verify `.env` is in root directory
- Restart dev server if running locally

---

## **Next Steps**

Your Phase 1 foundation is complete! You can now:

- ✅ Post and browse rooms
- ✅ Secure upload images
- ✅ Use Cloud Functions for validation
- ✅ Monitor usage in Firebase Console

**Ready for Phase 2?** I can add:
- Search/filter by location & price
- User profiles
- Room view counter
- Better UI/UX

Let me know! 🚀
