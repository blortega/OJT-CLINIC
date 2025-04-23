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
  const [quantityDispensed, setQuantityDispensed] = useState(1);
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
        const medicinesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          };
        });
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
    setMedicine("");
  }, [complaint, medicines]);

  // Process scanned data
  const processScannedData = (rawData) => {
    const data = rawData.replace(/Shift/g, "").trim();
    const matchedID = findEmployeeIDInScan(data);

    if (matchedID) {
      return matchedID;
    }
    return data;
  };

  // Find employee ID within scanned data
  const findEmployeeIDInScan = (scanData) => {
    let matches = [];

    // Exact matches
    for (const id of employeeIDs) {
      if (scanData === id) {
        return id;
      }
    }

    // Prefix matches
    for (const id of employeeIDs) {
      const cleanedScan = scanData.replace(/^\d+/, "");
      if (cleanedScan.startsWith(id)) {
        matches.push({ id, score: 90 + id.length });
      }
    }

    // Substring matches
    for (const id of employeeIDs) {
      if (scanData.includes(id)) {
        if (!matches.some((match) => match.id === id)) {
          matches.push({ id, score: 70 + id.length });
        }
      }
    }

    // Pattern matches
    for (const id of employeeIDs) {
      if (id.length > 2) {
        try {
          const idRegex = new RegExp(id.split("").join("\\s*"), "i");
          if (idRegex.test(scanData)) {
            if (!matches.some((match) => match.id === id)) {
              matches.push({ id, score: 50 + id.length });
            }
          }
        } catch (error) {
          console.error("Regex error for ID:", id, error);
        }
      }
    }

    setDebugInfo({
      scanData,
      matches,
    });

    matches.sort((a, b) => b.score - a.score);

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
    if (!formVisible) return;

    const handleKeyDown = (e) => {
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

      const selectedMedicine = filteredMedicines.find(
        (med) => med.name === medicine
      );

      if (selectedMedicine && selectedMedicine.stock < quantityDispensed) {
        toast.error(
          `Sorry, not enough stock! Only ${selectedMedicine.stock} available.`
        );
        setIsSubmitting(false);
        return;
      }

      const medicineRequestRef = collection(db, "medicineRequests");
      await addDoc(medicineRequestRef, {
        employeeID: scannedData,
        firstname: userData.firstname,
        lastname: userData.lastname,
        middleInitial: userData.middleInitial,
        department: userData.department,
        complaint: complaint,
        medicine: medicine,
        quantityDispensed: quantityDispensed,
        status: "Completed",
        timestamp: serverTimestamp(),
      });

      if (selectedMedicine) {
        const medicineDocRef = doc(db, "medicine", selectedMedicine.id);
        const newStock = selectedMedicine.stock - quantityDispensed;

        let newStatus = selectedMedicine.status;

        if (newStock === 0) {
          newStatus = "Out of Stock";
        } else if (newStock <= 20) {
          newStatus = "Low Stock";
        } else {
          newStatus = "In Stock";
        }

        await updateDoc(medicineDocRef, {
          stock: newStock,
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      }

      toast.success("Medicine request submitted successfully!");
      resetUserSelection();

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

  const resetForm = () => {
    setFormVisible(false);
    resetUserSelection();
  };

  const resetUserSelection = () => {
    setUserData(null);
    setScannedData("");
    setComplaint("");
    setMedicine("");
    setQuantityDispensed(1);
    bufferRef.current = "";
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Out of Stock":
        return {
          bg: "#fee2e2",
          text: "#b91c1c",
          border: "#f87171",
        };
      case "Low Stock":
        return {
          bg: "#fef3c7",
          text: "#92400e",
          border: "#fbbf24",
        };
      case "In Stock":
        return {
          bg: "#d1fae5",
          text: "#065f46",
          border: "#34d399",
        };
      default:
        return {
          bg: "#f3f4f6",
          text: "#4b5563",
          border: "#d1d5db",
        };
    }
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
                    ? "#f59e0b" // Amber for searching
                    : isScannerActive
                    ? "#10b981" // Green for active
                    : "#d1d5db", // Gray for inactive
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
              <h2 style={styles.sectionHeading}>Employee Information</h2>
              {isSearching ? (
                <div style={styles.searchingMessage}>
                  <p>Searching for employee data...</p>
                  <div style={styles.loadingSpinner}></div>
                </div>
              ) : userData ? (
                <div style={styles.userInfo}>
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Employee ID:</span>
                      <span style={styles.infoValue}>{scannedData}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Name:</span>
                      <span style={styles.infoValue}>
                        {userData.firstname} {userData.middleInitial}.{" "}
                        {userData.lastname}
                      </span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Gender:</span>
                      <span style={styles.infoValue}>{userData.gender}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Department:</span>
                      <span style={styles.infoValue}>
                        {userData.department}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.scanPrompt}>
                  <p>Scan employee ID to fetch data</p>
                  <div style={styles.scanIcon}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 7V5a1 1 0 011-1h2M4 17v2a1 1 0 001 1h2m12-16h-2a1 1 0 00-1 1v2m0 12v2a1 1 0 001 1h2M7 12h10"
                        stroke="#1e3a8a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {userData && !isSearching && (
                <>
                  <div style={styles.formSection}>
                    <h2 style={styles.sectionHeading}>Request Details</h2>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Complaint:
                        <select
                          value={complaint}
                          onChange={(e) => setComplaint(e.target.value)}
                          style={styles.select}
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
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Medicine:
                        <select
                          value={medicine}
                          onChange={(e) => setMedicine(e.target.value)}
                          style={{
                            ...styles.select,
                            opacity: !complaint || isLoading ? 0.6 : 1,
                          }}
                          disabled={!complaint || isLoading}
                        >
                          <option value="" disabled hidden>
                            Select Medicine
                          </option>
                          {filteredMedicines.map((item) => (
                            <option key={item.id} value={item.name}>
                              {item.name} - Stock: {item.stock}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {medicine && (
                      <div style={styles.medicineInfo}>
                        <h3 style={styles.medicineInfoHeading}>
                          Medicine Information
                        </h3>
                        {filteredMedicines
                          .filter((med) => med.name === medicine)
                          .map((med) => {
                            const statusColors = getStatusColor(med.status);
                            return (
                              <div key={med.id}>
                                <div style={styles.medicineInfoGrid}>
                                  <div style={styles.medicineInfoItem}>
                                    <span style={styles.medicineInfoLabel}>
                                      Stock:
                                    </span>
                                    <span style={styles.medicineInfoValue}>
                                      {med.stock}
                                    </span>
                                  </div>
                                  <div style={styles.medicineInfoItem}>
                                    <span style={styles.medicineInfoLabel}>
                                      Status:
                                    </span>
                                    <div
                                      style={{
                                        ...styles.statusBadge,
                                        backgroundColor: statusColors.bg,
                                        color: statusColors.text,
                                        borderColor: statusColors.border,
                                      }}
                                    >
                                      {med.status}
                                    </div>
                                  </div>
                                </div>

                                {med.stock === 0 && (
                                  <div style={styles.outOfStockWarning}>
                                    <span style={styles.warningIcon}>⚠️</span>
                                    <span>This medicine is out of stock!</span>
                                  </div>
                                )}

                                {med.stock > 0 && med.stock <= 10 && (
                                  <div style={styles.lowStockWarning}>
                                    <span style={styles.warningIcon}>⚠️</span>
                                    <span>
                                      Low stock warning! Only {med.stock}{" "}
                                      remaining.
                                    </span>
                                  </div>
                                )}

                                {med.stock > 0 && (
                                  <div style={styles.quantityContainer}>
                                    <label style={styles.quantityLabel}>
                                      Quantity to Dispense:
                                      <div style={styles.quantityControls}>
                                        <button
                                          style={styles.quantityButton}
                                          onClick={() =>
                                            setQuantityDispensed(
                                              Math.max(1, quantityDispensed - 1)
                                            )
                                          }
                                          disabled={quantityDispensed <= 1}
                                        >
                                          -
                                        </button>
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
                                        <button
                                          style={styles.quantityButton}
                                          onClick={() =>
                                            setQuantityDispensed(
                                              Math.min(
                                                med.stock,
                                                quantityDispensed + 1
                                              )
                                            )
                                          }
                                          disabled={
                                            quantityDispensed >= med.stock
                                          }
                                        >
                                          +
                                        </button>
                                      </div>
                                    </label>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  <div style={styles.actionButtons}>
                    <button
                      style={{
                        ...styles.saveButton,
                        opacity:
                          !userData ||
                          !complaint ||
                          !medicine ||
                          isSubmitting ||
                          quantityDispensed <= 0 ||
                          filteredMedicines.find((med) => med.name === medicine)
                            ?.stock === 0 ||
                          filteredMedicines.find((med) => med.name === medicine)
                            ?.stock < quantityDispensed
                            ? 0.6
                            : 1,
                      }}
                      onClick={handleSave}
                      disabled={
                        !userData ||
                        !complaint ||
                        !medicine ||
                        isSubmitting ||
                        quantityDispensed <= 0 ||
                        filteredMedicines.find((med) => med.name === medicine)
                          ?.stock === 0 ||
                        filteredMedicines.find((med) => med.name === medicine)
                          ?.stock < quantityDispensed
                      }
                    >
                      {isSubmitting ? (
                        <div style={styles.buttonSpinner}></div>
                      ) : (
                        "Save Request"
                      )}
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
    padding: "32px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  heading: {
    color: "#1e3a8a",
    marginBottom: "24px",
    fontSize: "28px",
    fontWeight: "600",
    textAlign: "center",
  },
  requestButton: {
    padding: "12px 28px",
    backgroundColor: "#1e3a8a",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
    display: "block",
    margin: "0 auto",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "24px",
    backgroundColor: "#f8fafc",
    padding: "12px",
    borderRadius: "8px",
    width: "fit-content",
    margin: "0 auto 24px auto",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  statusCircle: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    transition: "background-color 0.3s ease",
  },
  statusText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#4b5563",
  },
  resultBox: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    margin: "0 auto",
    color: "#1f2937",
  },
  sectionHeading: {
    color: "#1e3a8a",
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e5e7eb",
  },
  userInfo: {
    marginBottom: "24px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoLabel: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: "16px",
    color: "#111827",
    fontWeight: "500",
  },
  scanPrompt: {
    textAlign: "center",
    padding: "32px 0",
    color: "#6b7280",
  },
  scanIcon: {
    margin: "16px auto",
    opacity: 0.7,
  },
  formSection: {
    marginTop: "24px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4b5563",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    color: "#111827",
    transition: "border-color 0.2s ease",
    marginTop: "4px",
    outline: "none",
  },
  medicineInfo: {
    backgroundColor: "#f0f7ff",
    padding: "16px",
    borderRadius: "8px",
    marginTop: "16px",
    marginBottom: "24px",
    border: "1px solid #bfdbfe",
  },
  medicineInfoHeading: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e3a8a",
    marginBottom: "12px",
  },
  medicineInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  medicineInfoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  medicineInfoLabel: {
    fontSize: "14px",
    color: "#4b5563",
  },
  medicineInfoValue: {
    fontSize: "16px",
    fontWeight: "500",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    border: "1px solid transparent",
    marginTop: "4px",
  },
  lowStockWarning: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "8px 12px",
    borderRadius: "6px",
    marginTop: "12px",
    fontSize: "14px",
    border: "1px solid #fbbf24",
  },
  outOfStockWarning: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "8px 12px",
    borderRadius: "6px",
    marginTop: "12px",
    fontSize: "14px",
    border: "1px solid #f87171",
  },
  warningIcon: {
    fontSize: "16px",
  },
  quantityContainer: {
    marginTop: "16px",
    backgroundColor: "#f9fafb",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  },
  quantityLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#4b5563",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  quantityInput: {
    width: "60px",
    padding: "8px",
    textAlign: "center",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
  },
  quantityButton: {
    width: "32px",
    height: "32px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "24px",
  },
  saveButton: {
    padding: "10px 0",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    flex: "1",
    fontSize: "16px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
  cancelButton: {
    padding: "10px 0",
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    flex: "1",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  searchingMessage: {
    textAlign: "center",
    padding: "24px 0",
    color: "#6b7280",
  },
  loadingSpinner: {
    borderTop: "3px solid #1e3a8a",
    borderRight: "3px solid transparent",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    animation: "spin 1s linear infinite",
    margin: "16px auto",
  },
  buttonSpinner: {
    borderTop: "2px solid #ffffff",
    borderRight: "2px solid transparent",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    animation: "spin 1s linear infinite",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
};

export default RequestMedicine;
