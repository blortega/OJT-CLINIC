// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxyx9T7IfcIMQXDHbCUY1hPL0PLRDA6vI",
  authDomain: "clinic-ojt.firebaseapp.com",
  projectId: "clinic-ojt",
  storageBucket: "clinic-ojt.firebasestorage.app",
  messagingSenderId: "550818673969",
  appId: "1:550818673969:web:057f5101ea25d16eaf2c10",
  measurementId: "G-TPV0T2Z8VS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
