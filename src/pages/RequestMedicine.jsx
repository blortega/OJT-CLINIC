import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import { db } from "../firebase";


const RequestMedicine = () => {
  const [scannedData, setScannedData] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [medicine, setMedicine] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);

  // Fetch complaints and medicines from Firestore
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const complaintsRef = collection(db, "complaints");
        const querySnapshot = await getDocs(complaintsRef);
        const complaintsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(complaintsData);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    const fetchMedicines = async () => {
      try {
        const medicinesRef = collection(db, "medicine");
        const querySnapshot = await getDocs(medicinesRef);
        const medicinesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMedicines(medicinesData);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
    fetchMedicines();
  }, []);

  // Filter medicines when complaint changes
  useEffect(() => {
    if (complaint) {
      const relevantMedicines = medicines.filter(
        (med) => med.medication && med.medication.includes(complaint)
      );
      setFilteredMedicines(relevantMedicines);
    } else {
      setFilteredMedicines([]);
    }
    // Reset selected medicine when complaint changes
    setMedicine("");
  }, [complaint, medicines]);

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
        toast.error("No user found with this Employee ID");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error fetching user data");
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
    resetUserSelection();
  };

  const handleSave = async () => {
    if (!userData || !complaint || !medicine) {
      toast.warn("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if(
        !window.confirm(
          "Proceed?"
        )
      ) {
        setIsSubmitting(false);
        return;
      }
      
      // Save the medicine request to Firestore
      const medicineRequestRef = collection(db, "medicineRequests");
      await addDoc(medicineRequestRef, {
        employeeID: scannedData,
        firstName: userData.firstname,
        lastName: userData.lastname,
        department: userData.department,
        complaint: complaint,
        medicine: medicine,
        status: "Completed",
        timestamp: serverTimestamp(),
      });

      toast.success("Medicine request submitted successfully!");
      
      // Reset form for next scan but keep form visible
      resetUserSelection();
      
      // Set scanner to active state again for the next scan
      setIsScannerActive(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsScannerActive(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error saving medicine request:", error);
      toast.error("Error submitting request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  // Reset everything
  const resetForm = () => {
    setFormVisible(false);
    resetUserSelection();
  };

  // Reset user-related selections but keep form visible
  const resetUserSelection = () => {
    setUserData(null);
    setScannedData("");
    setComplaint("");
    setMedicine("");
    bufferRef.current = "";
  };

  return (
    <Sidebar>
      <ToastContainer position="top-right" autoClose={3000} />
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
                  <p>
                    <strong>Employee ID:</strong> {scannedData}
                  </p>
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
                <p>Scan employee ID to fetch data.</p>
              )}

              {userData && (
                <>
                  <div style={styles.dropdownContainer}>
                    <label>
                      Complaint:
                      <select
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                        style={styles.dropdown}
                        disabled={isLoading}
                      >
                        <option value="" disabled hidden>Select Complaint</option>
                        {complaints.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
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
                        disabled={!complaint || isLoading}
                      >
                        <option value="" disabled hidden>Select Medicine</option>
                        {filteredMedicines.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div style={styles.buttonContainer}>
                    <button
                      style={styles.saveButton}
                      onClick={handleSave}
                      disabled={
                        !userData || !complaint || !medicine || isSubmitting
                      }
                    >
                      {isSubmitting ? "Saving..." : "Save Request"}
                    </button>
                    <button style={styles.cancelButton} onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                </>
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
    color: "black",
  },
  resultBox: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "600px",
    margin: "0 auto",
    marginTop: "20px",
    color: "black",
  },
  userInfo: {
    textAlign: "left",
    fontSize: "16px",
    marginTop: "10px",
    color: "#000000",
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
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    gap: "10px",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    flex: "1",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    flex: "1",
  },
};

export default RequestMedicine;