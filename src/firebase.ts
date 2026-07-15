import { initializeApp } from "firebase/app";
import {
  getFirestore,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCLl_o-1jpOGmCmKtRscGMwF_0YF_zl2wg",
  authDomain: "campusos-1fcd0.firebaseapp.com",
  projectId: "campusos-1fcd0",
  storageBucket: "campusos-1fcd0.firebasestorage.app",
  messagingSenderId: "190011579305",
  appId: "1:190011579305:web:5c27f064a178ba30e102b8",
  measurementId: "G-2XK5TRNNPH"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Keep the user signed in even after refreshing the page
setPersistence(auth, browserLocalPersistence);

export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);