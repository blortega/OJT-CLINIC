import React, { useEffect, useState } from "react";
import { getFirestore, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { app } from "../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FetchDosageForm from "../hooks/FetchDosageForm";
import FetchMedicineType from "../hooks/FetchMedicineType";
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

  const { dosageForms } = FetchDosageForm();
  const { medicineType } = FetchMedicineType();
  const { complaints } = FetchComplaints(); // Fetch complaints
  const [selectedComplaints, setSelectedComplaints] = useState(medicine?.complaints || []); 


  const [editedMedicine, setEditedMedicine] = useState({
    name: medicine?.name || "",
    dosage: medicine?.dosage || "",
    dosageform: medicine?.dosageform || "",
    type: medicine?.type || "",
    stock: medicine?.stock || 0,
    expiryDate: formatForInput(medicine?.expiryDate),
  });

  const [isEdit, setisEdit] = useState(false)

  

  useEffect(() => {
    if (medicine) {
      setEditedMedicine({
        name: medicine.name || "",
        dosage: medicine.dosage || "",
        dosageform: medicine.dosageform || "",
        type: medicine.type || "",
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
      !editedMedicine.dosage ||
      !editedMedicine.dosageform ||
      !editedMedicine.type ||
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

      await updateDoc(medicineRef, {
        name: editedMedicine.name,
        dosage: editedMedicine.dosage,
        dosageform: editedMedicine.dosageform,
        type: editedMedicine.type,
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
      dosage: medicine?.dosage || "",
      dosageform: medicine?.dosageform || "",
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

          <label style={styles.label}>
            Dosage:
            <input
              type="text"
              name="dosage"
              value={editedMedicine.dosage}
              onChange={handleInputChange}
              style={styles.inputField}
              placeholder="Enter Dosage"
            />
          </label>

          <label style={styles.label}>
            Dosage Form:
            <select
              name="dosageform"
              value={editedMedicine.dosageform}
              onChange={handleInputChange}
              style={styles.inputField}
            >
              <option value="">-- Select Form --</option>
              {dosageForms.map((form) => (
                <option key={form.id} value={form.name}>{form.name}</option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Type:
            <select
              name="type"
              value={editedMedicine.type}
              onChange={handleInputChange}
              style={styles.inputField}
            >
              <option value="">-- Select Type --</option>
              {medicineType.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </label>

          <div style={styles.inputGroup}>
          <FormControl fullWidth style={{ marginBottom: "20px" }}>
            <InputLabel>Indicated Medication/s</InputLabel>
            <Select
              multiple
              value={selectedComplaints}
              onChange={(e) => setSelectedComplaints(e.target.value)}
              input={<OutlinedInput label="Indicated Complaints" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {complaints.map((complaint) => (
                <MenuItem key={complaint.id} value={complaint.name}>
                  <Checkbox checked={selectedComplaints.includes(complaint.name)} />
                  <ListItemText primary={complaint.name} />
                </MenuItem>
              ))}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    background: "#fff",
    padding: "40px 30px",
    borderRadius: "12px",
    textAlign: "left",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
    position: "relative",
  },
  modalTitle: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
    textAlign: "center",
  },
  modalDescription: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "20px",
  },
  label: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "8px",
    display: "block",
    textAlign: "left",
  },
  inputField: {
    fontSize: "16px",
    padding: "12px",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "20px",
    textAlign: "left",
    boxSizing: "border-box",
  },
  stockContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  inputFieldStock: {
    fontSize: "16px",
    padding: "12px",
    width: "80px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    textAlign: "center",
  },
  decreaseButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    fontSize: "18px",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  increaseButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    fontSize: "18px",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
  },
  modalButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    flex: 1,
    transition: "background-color 0.3s",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    flex: 1,
    transition: "background-color 0.3s",
  },
};

export default EditMedicine;
