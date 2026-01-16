
import { initializeApp, getApps, getApp } from "firebase/app";
// Fix: Use correct modular exports for Firestore
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmuUlQtEXgKSZRrn-Ri5-Pa4fe3foUzFA",
  authDomain: "sls-hospital.firebaseapp.com",
  projectId: "sls-hospital",
  storageBucket: "sls-hospital.firebasestorage.app",
  messagingSenderId: "716749295436",
  appId: "1:716749295436:web:f7c88cebe64014380849e9",
  measurementId: "G-14FBFP0Z76"
};

/**
 * Checks if the Firebase configuration is present and valid.
 */
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza");
};

/**
 * Initialize the Firebase application instance.
 */
const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Initialize Firestore instance correctly using the modular SDK
export const db = getFirestore(app);

/**
 * Global Firestore collection references for clinical data entities.
 * Using the modular collection() function with the initialized Firestore instance.
 */
export const clinicalCollections = {
  tenants: collection(db, "tenants"),
  users: collection(db, "users"),
  patients: collection(db, "patients"),
  staff: collection(db, "staff"),
  appointments: collection(db, "appointments"),
  bills: collection(db, "bills"),
  prescriptions: collection(db, "prescriptions"),
  records: collection(db, "records"),
  logs: collection(db, "communication_logs")
};
