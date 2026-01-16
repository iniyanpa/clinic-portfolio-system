
// Fix: Switch to named imports for better resolution in modern environments
import { initializeApp, getApp, getApps } from "firebase/app";
// Fix: Use standard named imports from firebase/firestore to resolve module resolution errors
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
 * Uses named exports initializeApp, getApp, and getApps.
 */
const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Fix: Use named getFirestore function
export const db = getFirestore(app);

/**
 * Global Firestore collection references for clinical data entities.
 */
// Fix: Ensure all collections are initialized using the named collection function
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
