
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUSLc-s8fkEkqr4_uQp2TOCLcR7NOS4oA",
  authDomain: "data-catcher-91286.firebaseapp.com",
  projectId: "data-catcher-91286",
  storageBucket: "data-catcher-91286.firebasestorage.app",
  messagingSenderId: "13081680535",
  appId: "1:13081680535:web:e2ee7ee902f04fb8ee27d2",
  measurementId: "G-Z9YLHSH0K2"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
