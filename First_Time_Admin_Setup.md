# First Time Admin Panel Setup

This guide will help you (or your buyers, e.g. Codecanyon users) set up the **LearningApp Admin Panel** for the first time. Follow these steps to configure, brand, and launch your admin dashboard for managing your app's content and settings.

---

## 1. **Requirements**

- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- A Firebase project (see Android app setup)
- (Optional) OneSignal account for push notifications

---

## 2. **Download & Extract the Admin Panel**

- Download the source code from Codecanyon or your purchase location.
- Extract the zip file to your desired folder.

---

## 3. **Install Dependencies**

Open a terminal/command prompt in the extracted folder and run:
```bash
npm install
```

---

## 4. **Configure Firebase**

- Open `src/config/firebase.ts`.
- Replace the placeholder values or `.env` variables with your Firebase project's config (from the Firebase Console).
- Example:
  ```ts
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
  };
  ```

---

## 5. **Start the Admin Panel**

In the terminal, run:
```bash
npm run dev
```
- The panel will be available at `http://localhost:3000` (or another port if 3000 is in use).

---

## 6. **First Time Setup Wizard**

- On first launch, you'll see a setup wizard.
- Enter your Firebase config and complete the steps.
- Only authorized admin emails (set in `src/contexts/AuthContext.tsx`) can log in.

---

## 7. **Admin Panel Features**

- **Dashboard:** View stats and quick links.
- **Content Management:** Add/edit categories, topics, and content.
- **App Settings:** Change app name, colors, UI text, and more.
- **Ads Settings:** Configure AdMob IDs, enable/disable ads, set ad frequency, and placement.
- **Settings:** Manage privacy policy, about developer, share message, rate app URL, etc.
- **Advanced Settings:** For advanced configuration.
- **Push Notifications:** (If enabled) Configure OneSignal.

---

## 8. **Branding the Admin Panel**

- Update the logo and app name in the App Settings page.
- Change colors and UI text as needed.
- All changes are saved in Firebase and reflected in the mobile app in real time.

---

## 9. **Security & Admin Access**

- Only emails listed in `src/contexts/AuthContext.tsx` under `ALLOWED_ADMIN_EMAILS` can access the admin panel.
- To add more admins, add their email addresses to this list.

---

## 10. **Deploying the Admin Panel (Optional)**

- For public/remote access, you can deploy the admin panel to Vercel, Netlify, Firebase Hosting, or your own server.
- Build the project with:
  ```bash
  npm run build
  ```
- Deploy the contents of the `dist/` folder as per your hosting provider's instructions.

---

## 11. **Troubleshooting**

- **Login Issues:** Make sure your email is in the allowed admin list.
- **Firebase Errors:** Double-check your Firebase config and Firestore rules.
- **AdMob/OneSignal:** Ensure you've entered correct IDs in the admin panel.

---

## **Summary Checklist**
- [ ] Install Node.js and npm
- [ ] Configure Firebase in `src/config/firebase.ts`
- [ ] Add your admin email(s) in `src/contexts/AuthContext.tsx`
- [ ] Run `npm install` and `npm run dev`
- [ ] Complete the setup wizard
- [ ] Configure app, ads, and content via the admin panel
- [ ] (Optional) Deploy the admin panel for remote access

---

**You are now ready to manage your LearningApp from your own branded admin panel!** 