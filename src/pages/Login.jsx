import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ladydoctor from "../assets/lady-doctor.png";
import doctorpatient from "../assets/doctor-patient-vector.png";
import loginbg from "../assets/loginbg.png";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const igate = useNavigate();

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
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />
      <div style={styles.leftSection}>
        <img src={doctorpatient} alt="Doctor & Patient" style={styles.logo} />
      </div>

      <div style={styles.rightSection}>
        <img
          src={ladydoctor}
          alt="Admin Illustration"
          style={styles.loginImage}
        />
        <h2 style={styles.heading}>Welcome Ma'am Amy!</h2>
        <p style={styles.subText}>Login to an Admin account to use the app</p>

        <div style={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              style={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </span>
          </div>
          <Link to="/register" style={styles.forgotPassword}>
            Forgot password?
          </Link>
        </div>

        <button style={styles.loginBtn} onClick={handleLogin}>
          Login
        </button>

        <Link to="/analytics">
          <button style={styles.dashboardBtn}>Go to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f0f4f8",
  },
  leftSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `url(${loginbg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderTopRightRadius: "40px",
    borderBottomRightRadius: "40px",
    overflow: "hidden",
    position: "relative",
  },
  logo: {
    width: "750px",
  },
  rightSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "#fff",
  },
  loginImage: {
    width: "350px",
  },
  heading: {
    marginBottom: "0.5rem",
    color: "#333",
    fontSize: "24px",
  },
  subText: {
    color: "#6c757d",
    marginBottom: "1rem",
    fontSize: "16px",
    textAlign: "left",
    width: "100%",
    maxWidth: "400px",
  },
  inputGroup: {
    marginBottom: "1.5rem",
    textAlign: "left",
    width: "100%",
    maxWidth: "400px",
  },
  input: {
    width: "100%",
    padding: "14px",
    border: "1px solid #D9D9D9",
    borderRadius: "1px",
    fontSize: "16px",
    outline: "none",
    backgroundColor: "#F7F7F7",
    boxSizing: "border-box",
    color: "#000",
  },
  passwordContainer: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
  togglePassword: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  },
  forgotPassword: {
    display: "block",
    marginTop: "0.5rem",
    color: "#007bff",
    textDecoration: "none",
    textAlign: "right",
    fontSize: "14px",
  },
  loginBtn: {
    backgroundColor: "#2E588F",
    color: "#fff",
    border: "none",
    padding: "15px",
    width: "100%",
    maxWidth: "350px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: "10px",
    transition: "background 0.3s ease-in-out",
  },
  dashboardBtn: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px",
    width: "100%",
    maxWidth: "400px",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: "10px",
  },
};

export default Login;
