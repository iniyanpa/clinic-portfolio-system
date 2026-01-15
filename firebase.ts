
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, setDoc } from "firebase/firestore";

// NOTE TO USER: Replace the values below with the ones from your Firebase Console
// (Project Settings > General > Your Apps > Web App)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "sls-hospital.firebaseapp.com",
  projectId: "sls-hospital",
  storageBucket: "sls-hospital.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
