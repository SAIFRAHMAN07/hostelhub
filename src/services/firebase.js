import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiapaEAD-kX_pyAotKTDgNn-ZtzPwZSDM",
  authDomain: "medikart-aed97.firebaseapp.com",
  projectId: "medikart-aed97",
  storageBucket: "medikart-aed97.firebasestorage.app",
  messagingSenderId: "1031346537063",
  appId: "1:1031346537063:web:c4c1ebe111e24ecb288ac2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 