import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { auth, db } from "../firebase"; // Ensure this is the correct path
import boygirl from "../assets/boygirl-removebg.png";
import aqualogo from "../assets/aqualogo.png";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); // Clear previous errors
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
        navigate("/user-manage"); // Redirect to dashboard
      } else {
        setError("User record not found. Please contact support.");
      }
    } catch (error) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftSection}>
        <img src={aqualogo} alt="AquaRoute Logo" style={styles.logo} />
      </div>

      <div style={styles.rightSection}>
        <img src={boygirl} alt="Admin Illustration" style={styles.loginImage} />
        <h2 style={styles.heading}>Welcome back Admin!</h2>
        <p style={styles.subText}>Login to an Admin account to use the app</p>

        {error && <p style={{ color: "red" }}>{error}</p>}

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
          <Link to="/forgot-password" style={styles.forgotPassword}>
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
    background: "linear-gradient(to bottom, #cce4ff, #7bb0ff)",
    borderTopRightRadius: "40px",
    borderBottomRightRadius: "40px",
    overflow: "hidden",
    position: "relative",
  },
  logo: {
    width: "250px",
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
    width: "200px",
    marginBottom: "1rem",
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
    border: "1px solid #000",
    borderRadius: "4px",
    fontSize: "16px",
    outline: "none",
    backgroundColor: "#fff",
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
    padding: "20px",
    width: "100%",
    maxWidth: "400px",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: "10px",
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
