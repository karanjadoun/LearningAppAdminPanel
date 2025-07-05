# First Time Admin Panel Setup (Beginner Friendly)

Welcome! This guide will help you set up the **LearningApp Admin Panel** from scratch, even if you have never done this before. Follow each step carefully, and you’ll have your own admin dashboard running in no time.

---

## 1. **What You Need (Requirements)**

- **A Computer** (Windows, Mac, or Linux)
- **Internet Connection**
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **A Firebase Project** (for storing your app’s data)
- *(Optional)* **OneSignal Account** (for push notifications)

**What is Node.js?**
> Node.js lets you run JavaScript code on your computer. It’s needed for most modern web projects.

**What is Firebase?**
> Firebase is a free service from Google that stores your app’s data securely in the cloud.

---

## 2. **Download & Extract the Admin Panel**

1. Download the source code (ZIP file) from Codecanyon or your purchase location.
2. Find the ZIP file in your Downloads folder.
3. **Right-click** the ZIP file and choose **Extract All** (Windows) or **Open With > Archive Utility** (Mac).
4. Choose a folder you can easily find, like your Desktop or Documents.

---

## 3. **Install Node.js and npm**

1. Go to [nodejs.org](https://nodejs.org/).
2. Download the **LTS** version (recommended for most users).
3. Open the downloaded file and follow the installation steps (just click Next/Continue until it’s done).
4. To check if it worked, open **Command Prompt** (Windows) or **Terminal** (Mac/Linux) and type:
   ```bash
   node -v
   npm -v
   ```
   You should see version numbers for both.

---

## 4. **Install Project Dependencies**

1. Open **Command Prompt** (Windows) or **Terminal** (Mac/Linux).
2. Use the `cd` command to go to the folder where you extracted the admin panel. For example:
   ```bash
   cd Desktop/LearningAppAdminPanel
   ```
   *(Tip: You can type `cd `, then drag the folder into the terminal and press Enter!)*
3. Run this command to install everything the project needs:
   ```bash
   npm install
   ```
   This may take a few minutes. You’ll see a lot of messages—don’t worry, that’s normal!

---

## 5. **Set Up Firebase**

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the steps (give it any name you like).
3. In your Firebase project, click the **gear icon > Project settings**.
4. Scroll down to **Your apps** and click **</>** (Web) to add a new web app.
5. Copy the config values shown (apiKey, authDomain, etc.).
6. Open the file `src/config/firebase.ts` in a text editor (like VS Code or Notepad).
7. Replace the placeholder values with your Firebase config. Example:
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
8. **Save the file.**

---

## 6. **Start the Admin Panel**

1. In your terminal, make sure you’re still in the project folder.
2. Run:
   ```bash
   npm run dev
   ```
3. Wait for a message like:
   ```
   VITE vX.X.X  ready in XXX ms
   ➜  Local:   http://localhost:3000/
   ```
4. Open your web browser and go to [http://localhost:3000](http://localhost:3000) (or the port shown).

---

## 7. **First Time Setup Wizard**

- The first time you open the admin panel, you’ll see a setup wizard.
- Enter your Firebase config and follow the steps.
- **Important:** Only emails listed in `src/contexts/AuthContext.tsx` under `ALLOWED_ADMIN_EMAILS` can log in.
- To add your email, open `src/contexts/AuthContext.tsx` in a text editor and add your email to the list. Example:
  ```ts
  const ALLOWED_ADMIN_EMAILS = [
    'your@email.com',
    // add more emails here
  ];
  ```
- **Save the file.**

---

## 8. **Using the Admin Panel**

- **Dashboard:** See stats and quick links.
- **Content Management:** Add/edit categories, topics, and content.
- **App Settings:** Change app name, colors, UI text, and more.
- **Ads Settings:** Set up AdMob IDs, enable/disable ads, set ad frequency.
- **Settings:** Manage privacy policy, about developer, share message, rate app URL, etc.
- **Advanced Settings:** For advanced configuration.
- **Push Notifications:** (If enabled) Configure OneSignal.

---

## 9. **Branding the Admin Panel**

- Go to the **App Settings** page in the admin panel.
- Update the logo, app name, colors, and UI text as you like.
- All changes are saved in Firebase and show up in your mobile app in real time.

---

## 10. **Security & Admin Access**

- Only emails in `ALLOWED_ADMIN_EMAILS` can access the admin panel.
- To add more admins, add their emails to the list in `src/contexts/AuthContext.tsx`.

---

## 11. **Deploying the Admin Panel (Optional)**

If you want to access your admin panel from anywhere (not just your computer):

1. Build the project:
   ```bash
   npm run build
   ```
2. The built files will be in the `dist/` folder.
3. Deploy the `dist/` folder to a service like **Netlify**, **Vercel**, or **Firebase Hosting**.
   - Each service has its own instructions—just search “Deploy to Netlify” or “Deploy to Vercel” for step-by-step guides.

---

## 12. **Troubleshooting (Common Problems & Solutions)**

- **Login Issues:**
  - Make sure your email is in the allowed admin list.
  - Double-check for typos in your email address.
- **Firebase Errors:**
  - Double-check your Firebase config values.
  - Make sure your Firestore rules allow access (see Firebase docs).
- **AdMob/OneSignal Issues:**
  - Make sure you entered the correct IDs in the admin panel.
- **Port Already in Use:**
  - If you see an error about port 3000, just use the new port shown in the terminal (e.g., 3001).
- **Still Stuck?**
  - Google the error message you see, or ask for help on forums like Stack Overflow.

---

## **Quick Checklist**
- [ ] Install Node.js and npm
- [ ] Download and extract the admin panel
- [ ] Configure Firebase in `src/config/firebase.ts`
- [ ] Add your admin email(s) in `src/contexts/AuthContext.tsx`
- [ ] Run `npm install` and `npm run dev`
- [ ] Complete the setup wizard
- [ ] Configure app, ads, and content via the admin panel
- [ ] (Optional) Deploy the admin panel for remote access

---

**🎉 You’re now ready to manage your LearningApp from your own admin panel!**

---

*If you get stuck, don’t worry! Everyone starts somewhere. Take it slow, and you’ll get there.* 