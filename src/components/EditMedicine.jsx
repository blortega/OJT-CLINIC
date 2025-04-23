import React, { useEffect, useState } from "react";
import { getFirestore, collection, updateDoc, doc, serverTimestamp, Timestamp, addDoc, getDocs } from "firebase/firestore";
import { app } from "../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FetchComplaints from "../hooks/FetchComplaints";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
// You can still use this if needed elsewhere
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// New helper to convert to YYYY-MM-DD
const formatForInput = (date) => {
  if (!date) return "";
  const d = new Date(date.seconds ? date.seconds * 1000 : date);
  return d.toISOString().split("T")[0]; // Format for input[type="date"]
};


const EditMedicine = ({ isOpen, onClose, medicine, onUpdate }) => {
  if (!isOpen) return null;

  const { complaints } = FetchComplaints(); // Fetch complaints
  const [selectedComplaints, setSelectedComplaints] = useState(medicine?.complaints || []); 


  const [editedMedicine, setEditedMedicine] = useState({
    name: medicine?.name || "",
    stock: medicine?.stock || 0,
    expiryDate: formatForInput(medicine?.expiryDate),
  });

  const [isEdit, setisEdit] = useState(false)

  

  useEffect(() => {
    if (medicine) {
      setEditedMedicine({
        name: medicine.name || "",
        stock: medicine.stock || 0,
        expiryDate: formatForInput(medicine.expiryDate),
      });
      setSelectedComplaints(medicine?.medication || []);
    }
  }, [medicine]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "stock") {
      if (value === "") {
        setEditedMedicine((prevState) => ({
          ...prevState,
          stock: "",
        }));
      } else {
        const numericValue = Number(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
          setEditedMedicine((prevState) => ({
            ...prevState,
            stock: numericValue,
          }));
        }
      }
    } else {
      setEditedMedicine((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleStockChange = (change) => {
    setEditedMedicine((prevState) => {
      let newStock = prevState.stock + change;

      if (newStock < 0) {
        newStock = 0;
      }

      return {
        ...prevState,
        stock: newStock,
      };
    });
  };

  const handleSubmit = async () => {
    const confirmUpdate = window.confirm("Are you sure you want to update the medicine details?");

    if (!confirmUpdate) {
      return;
    }

    if (
      !editedMedicine.name ||
      editedMedicine.stock < 0 ||
      !editedMedicine.expiryDate
    ) {
      toast.error("Please fill in all fields correctly.");
      return;
    }

    const stockStatus = getStockStatus(editedMedicine.stock);

     

    try {
      const db = getFirestore(app);
      const medicineRef = doc(db, "medicine", medicine.id);

      const expiry = new Date(editedMedicine.expiryDate);
      expiry.setHours(0, 0, 0, 0);

      const complaintsRef = collection(db, "complaints");
      const existingComplaintsSnap = await getDocs(complaintsRef);
      const existingComplaintNames = existingComplaintsSnap.docs.map(doc => doc.data().name);
  
      const newComplaints = selectedComplaints.filter(name => !existingComplaintNames.includes(name));
  
      // Add new complaints to the 'complaints' collection
      for (const complaint of newComplaints) {
        try {
          await addDoc(complaintsRef, {
            name: complaint,
            medicineName: editedMedicine.name,
            createdAt: serverTimestamp(),
          });
          console.log(`✅ Complaint "${complaint}" added to Firestore`);
        } catch (err) {
          console.error(`❌ Failed to add complaint "${complaint}":`, err);
        }
      }

      await updateDoc(medicineRef, {
        name: editedMedicine.name,
        stock: editedMedicine.stock,
        status: stockStatus,
        updatedAt: serverTimestamp(),
        expiryDate: Timestamp.fromDate(expiry),
        medication: selectedComplaints,
      });


      onUpdate({
        ...medicine,
        ...editedMedicine,
        expiryDate: expiry,
        status: stockStatus,
        medication: selectedComplaints,
      });
      toast.success("Medicine details updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update medicine.");
      console.error("Error updating medicine:", error);
    }
  };

  const handleClose = () => {
    setEditedMedicine({
      name: medicine?.name || "",
      stock: medicine?.stock || 0,
      expiryDate: formatForInput(medicine?.expiryDate),
    });
    setSelectedComplaints(medicine?.medication || []); 
    onClose();
  };

  const getStockStatus = (stock) => {
    stock = Number(stock);

    if (stock === 0) {
      return "Out of Stock";
    } else if (stock <= 20 && stock > 0) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>Edit Medicine</h2>

        <div style={styles.modalDescription}>
          <label style={styles.label}>
            Medicine Name:
            <input
              type="text"
              name="name"
              value={editedMedicine.name}
              onChange={handleInputChange}
              style={styles.inputField}
              placeholder="Enter Medicine Name"
            />
          </label>

          <div style={styles.inputGroup}>
           <FormControl fullWidth style={{ marginBottom: "20px" }}>
            <InputLabel>Indicated Medication/s</InputLabel>
            <Select
            multiple
            value={selectedComplaints}
            onChange={(e) => {
              const value = e.target.value;
          
              // prevent "__custom__" from being stored
              if (value.includes("__custom__")) return;
          
              setSelectedComplaints(value);
            }}
            input={<OutlinedInput label="Indicated Complaints" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {complaints.map((complaint) => (
              <MenuItem key={complaint.id} value={complaint.name}>
                <Checkbox checked={selectedComplaints.includes(complaint.name)} />
                <ListItemText primary={complaint.name} />
              </MenuItem>
            ))}
          
            <MenuItem
              value="__custom__"
              onClick={() => {
                const input = prompt("Enter new complaint(s), separated by commas:");
                if (input) {
                  const newEntries = input
                    .split(",")
                    .map((item) => item.trim())
                    .filter(
                      (item) => item.length > 0 && !selectedComplaints.includes(item)
                    );
          
                  if (newEntries.length > 0) {
                    setSelectedComplaints((prev) => [...prev, ...newEntries]);
                  } else {
                    toast.info("No new unique complaints added.");
                  }
                }
              }}
            >
              ➕ Add a new complaint
            </MenuItem>
          </Select>
          
          </FormControl>
        </div>

          <label style={styles.label}>
            Expiry Date:
            <input
              type="date"
              name="expiryDate"
              onChange={handleInputChange}
              value={editedMedicine.expiryDate}
              placeholder="Enter Expiry Date"
              style={styles.inputField}
            />
          </label>

          <label style={styles.label}>
            Stock Quantity:
            <div style={styles.stockContainer}>
              <button
                onClick={() => handleStockChange(-1)}
                style={styles.decreaseButton}
              >
                -
              </button>
              <input
                type="number"
                name="stock"
                value={editedMedicine.stock === "" ? "" : editedMedicine.stock}
                onChange={handleInputChange}
                style={styles.inputFieldStock}
                min="0"
                placeholder={editedMedicine.stock === "" ? "0" : ""}
              />
              <button
                onClick={() => handleStockChange(1)}
                style={styles.increaseButton}
              >
                +
              </button>
            </div>
          </label>
        </div>

        <div style={styles.modalButtonContainer}>
          <button onClick={handleSubmit} style={styles.modalButton}>
            Update
          </button>
          <button onClick={handleClose} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1050,
  },
  modalContent: {
    background: "#ffffff",
    padding: "40px 30px",
    borderRadius: "12px",
    textAlign: "left",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
    position: "relative",
    border: "1px solid #e0e0e0",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2563eb", // Medical blue shade
    marginBottom: "24px",
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "14px",
  
  },
  modalDescription: {
    fontSize: "16px",
    color: "#4b5563",
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  label: {
    fontSize: "16px",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
    textAlign: "left",
    fontWeight: "bold",
  },
  inputField: {
    fontSize: "16px",
    padding: "12px 14px",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    marginBottom: "22px",
    textAlign: "left",
    boxSizing: "border-box",
    backgroundColor: "#f9fafb",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    color: "black",
  },
  stockContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  inputFieldStock: {
    fontSize: "16px",
    padding: "12px",
    width: "80px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    textAlign: "center",
    backgroundColor: "#f9fafb",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    color: "black",
  },
  decreaseButton: {
    backgroundColor: "#ef4444", // Red
    color: "white",
    border: "none",
    fontSize: "18px",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
  },
  increaseButton: {
    backgroundColor: "#10b981", // Green
    color: "white",
    border: "none",
    fontSize: "18px",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginTop: "10px",
  },
  modalButton: {
    backgroundColor: "#3b82f6", // Medical blue
    color: "white",
    padding: "14px 24px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    flex: 1,
    transition: "background-color 0.3s",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563", // Dark gray
    padding: "14px 24px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    flex: 1,
    transition: "background-color 0.3s",
  },
};

export default EditMedicine;
