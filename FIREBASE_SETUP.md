# Firebase Setup Guide for Rent Easy 🇿🇼

## Step 1: Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: `rent-easy-zimbabwe`
4. Accept terms and create project
5. Wait for project to be ready

---

## Step 2: Enable Authentication

1. From Firebase Console, go to **Authentication**
2. Click **Sign-in method**
3. Enable **Email/Password**
4. Enable **Anonymous** (for demo purposes)
5. Click Save

---

## Step 3: Create Firestore Database

1. Go to **Cloud Firestore**
2. Click **Create Database**
3. Select **Start in Production Mode**
4. Choose location: **europe-west1** (closest to Africa)
5. Click **Create**

---

## Step 4: Set Up Cloud Storage

1. Go to **Storage**
2. Click **Get Started**
3. Accept default security rules (we'll replace them)
4. Choose location: **europe-west1**
5. Click **Done**

---

## Step 5: Get Your Firebase Config

1. Go to **Project Settings** (⚙️ icon)
2. Scroll to "Your apps" section
3. Click web icon (</> ) to create web app
4. Register app as "Rent Easy"
5. Copy the entire config object
6. It will look like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD_...",
  authDomain: "rent-easy-zimbabwe.firebaseapp.com",
  projectId: "rent-easy-zimbabwe",
  storageBucket: "rent-easy-zimbabwe.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## Step 6: Update Security Rules

### For Firestore:
1. Go to **Cloud Firestore**
2. Click **Rules** tab
3. Replace ALL content with the code from `firestore.rules`
4. Click **Publish**

### For Storage:
1. Go to **Storage**
2. Click **Rules** tab
3. Replace ALL content with the code from `storage.rules`
4. Click **Publish**

---

## Step 7: Update Your HTML File

In your `index.html`, find this section:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Replace `YOUR_*` values with your actual Firebase config values.

---

## Step 8: Email Verification (Optional but Recommended)

1. Go to **Authentication** > **Templates**
2. Click on **Email verification** template
3. Customize the message (optional)
4. This will send verification emails to new users

---

## Step 9: Deploy Your App

### Option A: Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option B: Netlify
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repo
5. Deploy automatically

### Option C: Vercel
```bash
npm install -g vercel
vercel
```

---

## Step 10: Test the App

1. Go to your deployed URL
2. Create a new account with email/password
3. Try uploading a property
4. Verify images are saved in Cloud Storage
5. Check Firestore to see your data

---

## Common Issues & Fixes

### ❌ "Missing or insufficient permissions"
**Solution**: Check your Firestore/Storage rules. Make sure they're published.

### ❌ "Cannot read properties of undefined"
**Solution**: Your Firebase config values are wrong or empty. Double-check them.

### ❌ "Images not uploading"
**Solution**: Check Storage Rules - make sure image MIME types are allowed.

### ❌ "Users can't sign up"
**Solution**: Go to Authentication > Settings > User sign-up - make sure it's enabled.

---

## Security Checklist ✅

- [ ] Firestore rules are published (not in test mode)
- [ ] Storage rules are published
- [ ] Email verification is enabled
- [ ] Anonymous auth is disabled (for production)
- [ ] API Key is not exposed in client code
- [ ] Domain restrictions are set in Firebase Console

---

## Next Steps After Setup

1. **Enable Email Verification** → Users verify emails before using app
2. **Add Admin Dashboard** → Moderate inappropriate listings
3. **Set Up Email Templates** → Welcome emails, notifications
4. **Enable App Check** → Prevent API abuse
5. **Monitor Costs** → Set up billing alerts

---

## Support

- Firebase Docs: https://firebase.google.com/docs
- Firestore Rules: https://firebase.google.com/docs/firestore/security/start
- Storage Rules: https://firebase.google.com/docs/storage/security/start

