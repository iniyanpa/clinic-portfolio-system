
import { initializeApp, getApp, getApps } from "firebase/app";
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

export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza");
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

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
