import React, { useEffect, useState, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import { db } from "../firebase";

const RequestMedicine = () => {
  const [scannedData, setScannedData] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [medicine, setMedicine] = useState("");
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);

  const complaintOptions = ["Headache", "Fever", "Cough", "Stomachache"];
  const medicineOptions = ["Paracetamol", "Ibuprofen", "Antacid", "Cough Syrup"];

  const processScannedData = (data) => {
    return data.replace(/Shift/g, "").trim();
  };

  const fetchUserData = async (employeeID) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("employeeID", "==", employeeID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserData(userDoc.data());
      } else {
        console.log("No user found with this employeeID.");
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (!formVisible) return; // Only scan when form is visible

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const processedData = processScannedData(bufferRef.current);
        setScannedData(processedData);
        bufferRef.current = "";

        fetchUserData(processedData);
        setIsScannerActive(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsScannerActive(false);
        }, 5000);
      } else {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [formVisible]);

  const handleRequestClick = () => {
    setFormVisible(true);
    setUserData(null);
    setScannedData("");
  };

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.heading}>Clinic Medicine Request</h1>

        {!formVisible && (
          <button style={styles.requestButton} onClick={handleRequestClick}>
            Request Medicine
          </button>
        )}

        {formVisible && (
          <>
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
              <h2>Employee Information</h2>
              {userData ? (
                <div style={styles.userInfo}>
                  <p><strong>Employee ID:</strong> {scannedData}</p>
                  <p><strong>Firstname:</strong> {userData.firstname}</p>
                  <p><strong>Lastname:</strong> {userData.lastname}</p>
                  <p><strong>Gender:</strong> {userData.gender}</p>
                  <p><strong>Department:</strong> {userData.department}</p>
                </div>
              ) : (
                <p>Scan employee ID to fetch data.</p>
              )}

              {userData && (
                <div style={styles.dropdownContainer}>
                  <label>
                    Complaint:
                    <select
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      style={styles.dropdown}
                    >
                      <option value="">Select Complaint</option>
                      {complaintOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Medicine:
                    <select
                      value={medicine}
                      onChange={(e) => setMedicine(e.target.value)}
                      style={styles.dropdown}
                    >
                      <option value="">Select Medicine</option>
                      {medicineOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>
          </>
        )}
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
    marginBottom: "20px",
  },
  requestButton: {
    padding: "12px 24px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
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
    marginTop: "20px",
  },
  userInfo: {
    textAlign: "left",
    fontSize: "16px",
    marginTop: "10px",
  },
  dropdownContainer: {
    marginTop: "20px",
    textAlign: "left",
  },
  dropdown: {
    display: "block",
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    marginBottom: "15px",
    fontSize: "16px",
  },
};

export default RequestMedicine;
