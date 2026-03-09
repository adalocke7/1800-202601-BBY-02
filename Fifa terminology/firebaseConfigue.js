// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config from the screenshot
const firebaseConfig = {
  apiKey: "AIzaSyDTYgM4NO4rchkqRgqhoDSfsLPu68luTaw",
  authDomain: "fifa-web-app-1fb5d.firebaseapp.com",
  projectId: "fifa-web-app-1fb5d",
  storageBucket: "fifa-web-app-1fb5d.firebasestorage.app",
  messagingSenderId: "520690646403",
  appId: "1:520690646403:web:ee6e073e0ff3034610d4de",
  measurementId: "G-J2GL22VQB6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export database
export { db };