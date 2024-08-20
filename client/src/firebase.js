// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-co-work-hub.firebaseapp.com",
  projectId: "mern-co-work-hub",
  storageBucket: "mern-co-work-hub.appspot.com",
  messagingSenderId: "986787508307",
  appId: "1:986787508307:web:f411d7a1f9d7aab2f356a6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);