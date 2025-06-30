import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDxSlJ5rfkeANzYfDuOhvuXLM_9wjdEzvc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "learningapp-4e692.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "learningapp-4e692",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "learningapp-4e692.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "386944819975",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:386944819975:web:your_web_app_id_here",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app; 