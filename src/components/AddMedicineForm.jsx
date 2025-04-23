// AddMedicineForm.js
import { serverTimestamp, Timestamp } from "firebase/firestore";
import React, { useState } from "react";
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

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};
const AddMedicineForm = ({ onClose, onAddMedicine }) => {
    const {complaints} = FetchComplaints();
    const [selectedComplaints, setSelectedComplaints] = useState([]);
    const [name, setName] = useState("");
    const [stock, setStock] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    const handleStockChange = (e) => {
      const value = e.target.value;
      if (value === "" || /^\d+$/.test(value)) {
        setStock(value); // ✅ allow delete/replace freely
      }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !expiryDate.trim()) {
      toast.error("All fields are required!");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Medicine Name is required!");
      return;
    }
    
    if (!expiryDate.trim()) {
      toast.error("Expiry Date is required!");
      return;
    }
    

    const numericStock = parseInt(stock, 10);

    if (isNaN(numericStock)) {
      toast.error("Stock must be a valid number.");
      return;
    }

    let stockStatus = "";
    if (numericStock === 0) {
      stockStatus = "Out of Stock";
    } else if (numericStock > 0 && numericStock <= 20) {
      stockStatus = "Low Stock";
    } else {
      stockStatus = "In Stock";
    }
    
    const newMedicine = {
        name,
        stock: numericStock,
        status: stockStatus,
        expiryDate: Timestamp.fromDate(new Date(expiryDate)),
        medication: selectedComplaints, 

    };
    
    const today = new Date();
    today.setHours(0,0,0,0);

    const selectedDate = new Date(newMedicine.expiryDate);
    selectedDate.setHours(0, 0, 0, 0); 
    

    
    if (selectedDate.getTime() === today.getTime()) {
      toast.error("Expiry date must not be today.");
      return;
    } else if (selectedDate.getTime() < today.getTime()) {
      toast.error("Expiry date must be in the future.");
      return;
    }

    
    console.log("Submitting new medicine:", newMedicine);
    
    await onAddMedicine(newMedicine);

    onClose();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>Add New Medicine</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label>Medicine Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.inputField}
            />
          </div>
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

          <div style={styles.inputGroup}>
            <label>Expiry Date:</label>
            <input
            type="date"
            value={expiryDate}
            //min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setExpiryDate(e.target.value)}
            style={styles.inputField}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={{
              margin: "10px"
            }}>Stock:</label>
            <input
              type="number"
              value={stock}
              onChange={handleStockChange}
              placeholder="0"
              style={styles.inputField}
            />
          </div>
          <div style={styles.modalButtonContainer}>
            <button type="submit" style={styles.modalButton}>Add Medicine</button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add some basic styles for the modal and form
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
    zIndex: 1000,
  },
  modalContent: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e0e0e0",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "bold", 
    color: "#2563eb", // Medical blue
    marginBottom: "24px",
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
  },
  inputGroup: {
    marginBottom: "22px",
    color: "black",
    fontWeight: "bold",
  },
  label: {
    display: "block",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#374151",
    marginBottom: "8px",
  },
  inputField: {
    width: "80%",
    padding: "12px 14px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    color: "black",
  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    marginTop: "30px",
  },
  modalButton: {
    backgroundColor: "#2563eb", // Medical blue
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    flex: 1,
    transition: "background-color 0.3s",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
  },
  modalButtonDisabled: {
    backgroundColor: "#93c5fd", // Lighter blue
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "not-allowed",
    flex: 1,
    boxShadow: "none",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    flex: 1,
    transition: "background-color 0.3s",
  },
};

export default AddMedicineForm;
