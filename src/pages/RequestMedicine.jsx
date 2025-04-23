import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import { db } from "../firebase";

const RequestMedicine = () => {
  const [scannedData, setScannedData] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [medicine, setMedicine] = useState("");
  const [quantityDispensed, setQuantityDispensed] = useState(1); // Default quantity is 1
  const [isLoading, setIsLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeIDs, setEmployeeIDs] = useState([]);
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState({});

  // Fetch complaints, medicines, and employee IDs from Firestore
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

    const fetchEmployeeIDs = async () => {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const ids = querySnapshot.docs.map((doc) => doc.data().employeeID);
        setEmployeeIDs(ids);
      } catch (error) {
        console.error("Error fetching employee IDs:", error);
      }
    };

    fetchComplaints();
    fetchMedicines();
    fetchEmployeeIDs();
  }, []);

  // Filter medicines when complaint changes
  useEffect(() => {
    if (complaint) {
      // Look for medicines that have this complaint in their medication array
      const relevantMedicines = medicines.filter((med) => {
        return (
          med.medication &&
          Array.isArray(med.medication) &&
          med.medication.includes(complaint)
        );
      });
      setFilteredMedicines(relevantMedicines);
    } else {
      setFilteredMedicines([]);
    }
    // Reset selected medicine when complaint changes
    setMedicine("");
  }, [complaint, medicines]);

  // Extract employee ID from scanned barcode data
  const processScannedData = (rawData) => {
    // Clean up the data by removing 'Shift' and extra spaces
    const data = rawData.replace(/Shift/g, "").trim();

    // Find the matching employee ID within the scanned data
    const matchedID = findEmployeeIDInScan(data);

    if (matchedID) {
      return matchedID;
    }

    // If no match found, return cleaned data
    return data;
  };

  // Function to find employee ID within scanned data
  const findEmployeeIDInScan = (scanData) => {
    // Create an array to keep track of matches and their quality scores
    let matches = [];

    // First pass: look for exact matches
    for (const id of employeeIDs) {
      if (scanData === id) {
        // Exact match is best - return immediately
        return id;
      }
    }

    // Second pass: look for prefix matches (cases like "0HCY847723" should match "HCY")
    // Weight this higher as prefixes are more likely to be the correct employee ID
    for (const id of employeeIDs) {
      // Clean the scan data to handle additional numeric prefixes (like "0" before "HCY")
      const cleanedScan = scanData.replace(/^\d+/, "");

      // Check if ID is at the beginning of the cleaned scan data (prefix match)
      if (cleanedScan.startsWith(id)) {
        matches.push({ id, score: 90 + id.length }); // High score for prefix matches
      }
    }

    // Third pass: look for substring matches within the scan
    for (const id of employeeIDs) {
      if (scanData.includes(id)) {
        // Check that we don't already have this ID from prefix matching
        if (!matches.some((match) => match.id === id)) {
          // Score based on length - longer IDs get higher scores
          matches.push({ id, score: 70 + id.length });
        }
      }
    }

    // Fourth pass: look for similar patterns for complex IDs
    for (const id of employeeIDs) {
      if (id.length > 2) {
        try {
          // Create a regex pattern for the ID
          const idRegex = new RegExp(id.split("").join("\\s*"), "i");
          if (idRegex.test(scanData)) {
            // Check that we don't already have this ID from other matching methods
            if (!matches.some((match) => match.id === id)) {
              matches.push({ id, score: 50 + id.length });
            }
          }
        } catch (error) {
          console.error("Regex error for ID:", id, error);
        }
      }
    }

    // For debugging purposes
    setDebugInfo({
      scanData,
      matches,
    });

    // Sort matches by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    // Return the best match if we have one
    if (matches.length > 0) {
      return matches[0].id;
    }

    return null;
  };

  const fetchUserData = async (employeeID) => {
    setIsSearching(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("employeeID", "==", employeeID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserData(userDoc.data());
        toast.success("Employee found!");
      } else {
        console.log("No user found with this employeeID.");
        setUserData(null);
        toast.error("No user found with this Employee ID");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error fetching user data");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!formVisible) return; // Only scan when form is visible

    const handleKeyDown = (e) => {
      // Don't process new scans if we're currently searching
      if (isSearching) {
        return;
      }

      if (e.key === "Enter") {
        const processedData = processScannedData(bufferRef.current);
        setScannedData(processedData);
        bufferRef.current = "";

        if (processedData) {
          fetchUserData(processedData);
          setIsScannerActive(true);

          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setIsScannerActive(false);
          }, 5000);
        } else {
          toast.warn("Could not identify a valid Employee ID from scan");
          setIsScannerActive(false);
        }
      } else {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [formVisible, employeeIDs, isSearching]);

  const handleRequestClick = () => {
    setFormVisible(true);
    resetUserSelection();
  };

  const handleSave = async () => {
    if (!userData || !complaint || !medicine) {
      toast.warn("Please fill all required fields");
      return;
    }

    // Validate quantity
    if (quantityDispensed <= 0) {
      toast.warn("Quantity must be greater than zero");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!window.confirm("Proceed?")) {
        setIsSubmitting(false);
        return;
      }

      // Get the selected medicine document
      const selectedMedicine = filteredMedicines.find(
        (med) => med.name === medicine
      );

      // Check if there's enough stock
      if (selectedMedicine && selectedMedicine.stock < quantityDispensed) {
        toast.error(
          `Sorry, not enough stock! Only ${selectedMedicine.stock} available.`
        );
        setIsSubmitting(false);
        return;
      }

      // Save the medicine request to Firestore
      const medicineRequestRef = collection(db, "medicineRequests");
      await addDoc(medicineRequestRef, {
        employeeID: scannedData,
        firstname: userData.firstname,
        lastname: userData.lastname,
        middleInitial: userData.middleInitial,
        department: userData.department,
        complaint: complaint,
        medicine: medicine,
        quantityDispensed: quantityDispensed, // Add quantity field to the document
        status: "Completed",
        timestamp: serverTimestamp(),
      });

      // Update the stock count in the medicine collection
      if (selectedMedicine) {
        const medicineDocRef = doc(db, "medicine", selectedMedicine.id);
        const newStock = selectedMedicine.stock - quantityDispensed;
        const newStatus =
          newStock <= 10 ? "Low Stock" : selectedMedicine.status;

        await updateDoc(medicineDocRef, {
          stock: newStock,
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      }

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
    setQuantityDispensed(1); // Reset to default quantity
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
                  backgroundColor: isSearching
                    ? "orange"
                    : isScannerActive
                    ? "limegreen"
                    : "lightgray",
                }}
              />
              <span style={styles.statusText}>
                {isSearching
                  ? "Searching..."
                  : isScannerActive
                  ? "Scanner Active"
                  : "Waiting for scan..."}
              </span>
            </div>

            <div style={styles.resultBox}>
              <h2>Employee Information</h2>
              {isSearching ? (
                <div style={styles.searchingMessage}>
                  <p>Searching for employee data...</p>
                  <div style={styles.loadingSpinner}></div>
                </div>
              ) : userData ? (
                <div style={styles.userInfo}>
                  <p>
                    <strong>Employee ID:</strong> {scannedData}
                  </p>
                  <p>
                    <strong>First Name:</strong> {userData.firstname}
                  </p>
                  <p>
                    <strong>Middle Initial:</strong> {userData.middleInitial}
                  </p>
                  <p>
                    <strong>Last Name:</strong> {userData.lastname}
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

              {userData && !isSearching && (
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
                        <option value="" disabled hidden>
                          Select Complaint
                        </option>
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
                        <option value="" disabled hidden>
                          Select Medicine
                        </option>
                        {filteredMedicines.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name} - Stock: {item.stock}{" "}
                            {item.status && `(${item.status})`}
                          </option>
                        ))}
                      </select>
                    </label>

                    {medicine && (
                      <div style={styles.medicineInfo}>
                        <h3>Medicine Information</h3>
                        {filteredMedicines
                          .filter((med) => med.name === medicine)
                          .map((med) => (
                            <div key={med.id}>
                              <p>
                                <strong>Available Stock:</strong> {med.stock}
                              </p>
                              <p>
                                <strong>Status:</strong>{" "}
                                {med.status || "Regular"}
                              </p>
                              {med.stock <= 10 && (
                                <p style={styles.lowStockWarning}>
                                  ⚠️ Low stock warning! Only {med.stock}{" "}
                                  remaining.
                                </p>
                              )}

                              <div style={styles.quantityContainer}>
                                <label>
                                  <strong>Quantity to Dispense:</strong>
                                  <input
                                    type="number"
                                    min="1"
                                    max={med.stock}
                                    value={quantityDispensed}
                                    onChange={(e) =>
                                      setQuantityDispensed(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    style={styles.quantityInput}
                                  />
                                </label>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div style={styles.buttonContainer}>
                    <button
                      style={styles.saveButton}
                      onClick={handleSave}
                      disabled={
                        !userData ||
                        !complaint ||
                        !medicine ||
                        isSubmitting ||
                        quantityDispensed <= 0 ||
                        filteredMedicines.find((med) => med.name === medicine)
                          ?.stock < quantityDispensed
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
  searchingMessage: {
    textAlign: "center",
    padding: "15px 0",
  },
  loadingSpinner: {
    borderTop: "3px solid #3498db",
    borderRight: "3px solid transparent",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    animation: "spin 1s linear infinite",
    margin: "10px auto",
  },
  medicineInfo: {
    backgroundColor: "#f0f8ff",
    padding: "15px",
    borderRadius: "5px",
    marginTop: "15px",
    marginBottom: "15px",
    textAlign: "left",
  },
  lowStockWarning: {
    color: "#d32f2f",
    fontWeight: "bold",
  },
  quantityContainer: {
    marginTop: "15px",
  },
  quantityInput: {
    width: "80px",
    padding: "8px",
    margin: "0 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
};

export default RequestMedicine;
