// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDchKGe0M1epc8rm1f6jx0xjBSCWSctIjw",
  authDomain: "fir-project2-b0de2.firebaseapp.com",
  projectId: "fir-project2-b0de2",
  storageBucket: "fir-project2-b0de2.firebasestorage.app",
  messagingSenderId: "660487611422",
  appId: "1:660487611422:web:66f523c855e9555c79ba0f",
};

// 🔹 Primary Firebase app (used for login, current user)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 🔥 Secondary Firebase app (used ONLY for creating users)
// This prevents admin from getting logged out
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);

// 🔹 Firestore (single instance)
export const db = getFirestore(app);
