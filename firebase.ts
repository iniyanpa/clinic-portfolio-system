
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, setDoc } from "firebase/firestore";

/**
 * FIREBASE SETUP STEPS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Select your project: "sls-hospital"
 * 3. Click the "Project Settings" (gear icon) -> "General" tab.
 * 4. Scroll down to "Your apps", select your Web App.
 * 5. Copy the 'firebaseConfig' object and paste its values below.
 */
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "sls-hospital.firebaseapp.com",
  projectId: "sls-hospital",
  storageBucket: "sls-hospital.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper for Firestore interactions
export const clinicalCollections = {
  patients: collection(db, "patients"),
  staff: collection(db, "staff"),
  appointments: collection(db, "appointments"),
  bills: collection(db, "bills"),
  prescriptions: collection(db, "prescriptions"),
  records: collection(db, "records"),
  logs: collection(db, "communication_logs")
};
