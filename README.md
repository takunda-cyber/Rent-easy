# Rent Easy 🇿🇼 - Secure Room Rental App

A secure web application for posting and browsing room rental listings in Zimbabwe.

## Features

✅ **Secure Authentication** - Firebase anonymous authentication with session persistence  
✅ **User Authorization** - Owner-only operations for room management  
✅ **Input Validation** - Frontend + backend validation for all user inputs  
✅ **File Upload Security** - Image type and size validation  
✅ **XSS Protection** - HTML escaping for all user content  
✅ **Database Security** - Firestore rules enforce access control  
✅ **Real-time Updates** - Live room listings with Firestore listeners  
✅ **WhatsApp Integration** - Direct contact links to room owners  
✅ **Automatic Cleanup** - Rooms archived after 90 days  

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Hosting**: Firebase Hosting
- **Database**: Cloud Firestore

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project (create at [console.firebase.google.com](https://console.firebase.google.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/takunda-cyber/Rent-easy.git
   cd Rent-easy
   ```

2. **Install Firebase Functions dependencies**
   ```bash
   cd functions
   npm install
   cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. **Initialize Firebase**
   ```bash
   firebase login
   firebase init
   ```
   Select your project and configure hosting, functions, and Firestore.

### Deployment

1. **Deploy Firebase Functions**
   ```bash
   firebase deploy --only functions
   ```

2. **Deploy Security Rules**
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

3. **Deploy to Hosting**
   ```bash
   firebase deploy --only hosting
   ```

   Or deploy everything at once:
   ```bash
   firebase deploy
   ```

## Security

All security vulnerabilities have been fixed. See [SECURITY.md](./SECURITY.md) for detailed information on:

- Vulnerability fixes
- Security best practices implemented
- Setup instructions
- Testing procedures
- Compliance recommendations

### Key Security Features

- **No Hardcoded Credentials**: All config via environment variables
- **Server-Side Authorization**: Cloud Functions verify ownership
- **Database Rules**: Firestore rules enforce access control
- **File Validation**: Images validated for type and size
- **Input Sanitization**: XSS prevention via HTML escaping
- **Rate Limiting Ready**: Framework in place for adding limits
- **Audit Logging**: Cloud Functions log all operations

## Project Structure

```
rent-easy/
├── index.html              # Main application
├── SECURITY.md             # Security documentation
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
├── functions/
│   ├── index.js            # Cloud Functions
│   └── package.json        # Dependencies
└── README.md               # This file
```

## Usage

1. **Sign In**
   - Click "Sign In Anonymously" button
   - Location verification will run (requires geolocation)
   - Access granted if you're in Zimbabwe

2. **Browse Rooms**
   - View all available room listings
   - See room details (location, price, description, images)
   - Click "Contact Owner" to send WhatsApp message

3. **Post a Room**
   - Fill in room details (title, location, price, description)
   - Upload a room image
   - Click "Post Room" to publish

4. **Manage Your Rooms**
   - Click "Delete" button on your own rooms
   - Deletion is only available to the room owner

5. **Sign Out**
   - Click "Sign Out" to end session
   - You'll need to sign in again to post/delete

## Cloud Functions

### `deleteRoom(roomId)`
Delete a room (owner only)
```javascript
deleteRoom({ roomId: 'room123' })
```

### `getContactInfo(phone)`
Get secure WhatsApp contact URL
```javascript
getContactInfo({ phone: '+263712345678' })
```

### `createRoom(data)`
Create a new room with validation
```javascript
createRoom({
  title: "1-bed apartment",
  location: "Harare",
  price: 150,
  description: "Nice apartment",
  imageUrl: "https://..."
})
```

## Firestore Collections

### `rooms`
```typescript
{
  title: string,           // 5-100 characters
  location: string,        // 2-50 characters
  price: number,           // 0-100,000
  description: string,     // Up to 500 characters
  imageUrl: string,        // Firebase Storage URL
  userId: string,          // Owner's user ID
  createdAt: timestamp,    // Auto-set
  updatedAt: timestamp     // Auto-set
}
```

### `users` (optional)
```typescript
{
  email: string,           // User's email
  displayName: string,     // User's name
  createdAt: timestamp,    // Account creation date
  updatedAt: timestamp     // Last update date
}
```

## Available Locations

- Harare
- Bulawayo
- Mutare
- Gweru
- Kwekwe
- Chinhoyi
- Norton
- Masvingo
- Other

## Limitations

- Anonymous authentication only (no email/password yet)
- Images limited to 5MB
- Only JPEG, PNG, WebP supported
- Room descriptions max 500 characters
- Price range: $0 - $100,000
- Rooms auto-deleted after 90 days of inactivity

## Roadmap

- [ ] User profiles and ratings
- [ ] Search and filters
- [ ] Image gallery (multiple images per room)
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Payment integration
- [ ] Mobile app (React Native)
- [ ] Two-factor authentication
- [ ] Content moderation
- [ ] User reviews and ratings

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure all code follows security best practices and includes validation.

## Security Issues

If you discover a security vulnerability, please email [security contact] instead of using the issue tracker.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- Firebase for excellent backend services
- Zimbabwe Rent Easy community
- All contributors

---

**Built with ❤️ for Zimbabwe** 🇿🇼
