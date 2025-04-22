// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import Authentication
import { getFirestore } from "firebase/firestore"; // Import Firestore
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
const auth = getAuth(app); // Initialize Authentication
const db = getFirestore(app); // Initialize Firestore

// Export modules for use in other files
export { app, analytics, auth, db };

/////////////////////////////////////////////////////////////////////////////////

// ojt-clinic Firestore DB
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth"; // Import Authentication
// import { getFirestore } from "firebase/firestore"; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyB2tHruCi_3z5Jsu0dEomujlcf63VLySYk",
//   authDomain: "ojt-clinic.firebaseapp.com",
//   projectId: "ojt-clinic",
//   storageBucket: "ojt-clinic.firebasestorage.app",
//   messagingSenderId: "821638283182",
//   appId: "1:821638283182:web:2786e8aa1c4de1a213923f",
//   measurementId: "G-221X7FWYZH",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = getAuth(app); // Initialize Authentication
// const db = getFirestore(app); // Initialize Firestore

// export { app, analytics, auth, db };
