import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ladydoctor from "../assets/nurse-removebg-preview.png";
import doctorpatient from "../assets/doctor-patient-vector.png";
import "../styles/Login.css"; // Import the external stylesheet

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check Firestore for user details
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        console.log("User details:", userDoc.data());
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        toast.error("User record not found. Please contact support.");
      }
    } catch (error) {
      toast.error("Invalid email or password.");
    }
  };

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="leftSection">
        <img src={doctorpatient} alt="Doctor & Patient" className="logo" />
      </div>

      <div className="rightSection">
        <img src={ladydoctor} alt="Admin Illustration" className="loginImage" />
        <h2 className="heading">Welcome Ma'am Amy!</h2>
        <p className="subText">Login to an Admin account to use the app</p>

        <div className="inputGroup">
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="inputGroup">
          <div className="passwordContainer">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="togglePassword"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </span>
          </div>
          <Link to="/register" className="forgotPassword">
            Forgot password?
          </Link>
        </div>

        <button className="loginBtn" onClick={handleLogin}>
          Login
        </button>

        <Link to="/dashboard">
          <button className="dashboardBtn">Go to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}

export default Login;
