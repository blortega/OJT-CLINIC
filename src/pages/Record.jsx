import React, { useEffect, useState, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import { db } from "../firebase"; // Import Firestore instance

const Record = () => {
  const [scannedData, setScannedData] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [userData, setUserData] = useState(null); // Store user data
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);

  // Function to process and clean up the scanned employee ID
  const processScannedData = (data) => {
    return data.replace(/Shift/g, "").trim(); // Clean up "Shift"
  };

  // Function to fetch user data from Firestore based on employeeID field
  const fetchUserData = async (employeeID) => {
    try {
      // Query Firestore for users where employeeID matches the scanned value
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("employeeID", "==", employeeID));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Get the first matching document
        const userDoc = querySnapshot.docs[0];
        setUserData(userDoc.data()); // Set the user data to state
      } else {
        console.log("No user found with this employeeID.");
        setUserData(null); // If no user is found, set userData to null
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const processedData = processScannedData(bufferRef.current);
        setScannedData(processedData);
        bufferRef.current = "";

        // Fetch user data from Firestore once the scan is complete
        fetchUserData(processedData);

        setIsScannerActive(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsScannerActive(false);
        }, 5000); // Active for 5 seconds after scan
      } else {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.heading}>ID Scanner</h1>

        <div style={styles.statusContainer}>
          <div
            style={{
              ...styles.statusCircle,
              backgroundColor: isScannerActive ? "limegreen" : "lightgray",
            }}
          />
          <span style={styles.statusText}>
            {isScannerActive ? "Scanner Active" : "Waiting for scan..."}
          </span>
        </div>

        <div style={styles.resultBox}>
          <h2>Scanned Data:</h2>
          <pre>{scannedData || "No data scanned yet."}</pre>

          {/* Display employee ID and user data if available */}
          {userData ? (
            <div style={styles.userInfo}>
              <p>
                <strong>Employee ID:</strong> {scannedData}
              </p>{" "}
              {/* Display the scanned employee ID */}
              <p>
                <strong>Firstname:</strong> {userData.firstname}
              </p>
              <p>
                <strong>Lastname:</strong> {userData.lastname}
              </p>
              <p>
                <strong>Gender:</strong> {userData.gender}
              </p>
              <p>
                <strong>Department:</strong> {userData.department}
              </p>
            </div>
          ) : (
            <p>User not found or error fetching data.</p>
          )}
        </div>
      </div>
    </Sidebar>
  );
};

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
  },
  heading: {
    color: "#1e3a8a",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
  },
  statusCircle: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    transition: "background-color 0.3s ease",
  },
  statusText: {
    fontSize: "16px",
    fontWeight: "500",
  },
  resultBox: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  userInfo: {
    marginTop: "20px",
    textAlign: "left",
    fontSize: "16px",
  },
};

export default Record;
