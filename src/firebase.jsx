// clinic-ojt Firestore DB
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxyx9T7IfcIMQXDHbCUY1hPL0PLRDA6vI",
  authDomain: "clinic-ojt.firebaseapp.com",
  projectId: "clinic-ojt",
  storageBucket: "clinic-ojt.firebasestorage.app",
  messagingSenderId: "550818673969",
  appId: "1:550818673969:web:057f5101ea25d16eaf2c10",
  measurementId: "G-TPV0T2Z8VS",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };

/////////////////////////////////////////////////////////////////////////////////

// ojt-clinic Firestore DB
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyB2tHruCi_3z5Jsu0dEomujlcf63VLySYk",
//   authDomain: "ojt-clinic.firebaseapp.com",
//   projectId: "ojt-clinic",
//   storageBucket: "ojt-clinic.firebasestorage.app",
//   messagingSenderId: "821638283182",
//   appId: "1:821638283182:web:2786e8aa1c4de1a213923f",
//   measurementId: "G-221X7FWYZH",
// };

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = getAuth(app);
// const db = getFirestore(app);

// export { app, analytics, auth, db };
