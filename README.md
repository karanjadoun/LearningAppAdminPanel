# LearningApp Admin Panel

A modern React TypeScript admin panel for managing learning content with Firebase Firestore integration and OneSignal push notifications.

## 🚀 Features

- **Content Management**: Hierarchical content structure with categories, topics, and content items
- **OneSignal Integration**: Complete push notification management with dynamic configuration
- **Firebase Firestore**: Real-time database with authentication
- **Modern UI**: Material-UI components with responsive design
- **TypeScript**: Full type safety and better development experience
- **CodeCanyon Ready**: Easy setup for buyers with no coding required

## 📋 Prerequisites

- Node.js 18+ 
- Firebase project with Firestore enabled
- OneSignal account (for push notifications)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd LearningAppAdminPanel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Replace `learningapp-4e692-firebase-adminsdk-fbsvc-0238a0daf5.json` with your Firebase service account key
   - Update Firebase configuration in `src/config/firebase.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### GitHub + Netlify Deployment

This project is configured for easy deployment on Netlify:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Deploy on Netlify**
   - Connect your GitHub repository to Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables (if needed):
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

## 🔧 Configuration

### OneSignal Setup

1. Create a OneSignal account at [onesignal.com](https://onesignal.com)
2. Create a new Android app in OneSignal
3. Configure Firebase Server Key and Sender ID
4. Get App ID and REST API Key from Settings → Keys & IDs
5. Enter credentials in the admin panel Settings → OneSignal Configuration

### Firebase Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write learning_data
    match /learning_data/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write app_config
    match /app_config/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Mobile App Integration

Your mobile app can read OneSignal configuration from Firestore:

```kotlin
// Android example
FirebaseFirestore.getInstance()
    .collection("app_config")
    .document("main_config")
    .get()
    .addOnSuccessListener { document ->
        if (document.exists()) {
            val appId = document.getString("oneSignalAppId")
            val enabled = document.getBoolean("notificationsEnabled") ?: true
            
            if (enabled && !appId.isNullOrEmpty()) {
                OneSignal.initWithContext(this)
                OneSignal.setAppId(appId)
            }
        }
    }
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Content/        # Content management
│   ├── Dashboard/      # Dashboard components
│   ├── Layout/         # App layout components
│   ├── Search/         # Search functionality
│   └── Settings/       # Settings components
├── config/             # Firebase configuration
├── contexts/           # React contexts
├── pages/              # Page components
├── services/           # API services
└── types/              # TypeScript types
```

## 🎯 CodeCanyon Features

- **No Code Changes Required**: Buyers can configure everything from the admin panel
- **Dynamic Configuration**: OneSignal settings stored in Firebase
- **Easy Setup**: Step-by-step instructions included
- **Test Notifications**: Built-in test functionality
- **Modern UI**: Professional Material-UI design
- **Responsive**: Works on all devices

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support, please contact [your-email@example.com]

---

**Ready for CodeCanyon!** 🚀 