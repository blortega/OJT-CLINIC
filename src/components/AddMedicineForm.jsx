// AddMedicineForm.js
import { serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};
const AddMedicineForm = ({ onClose, onAddMedicine }) => {
    const [name, setName] = useState("");
    const [dosage, setDosage] = useState("");
    const [form, setForm] = useState("");
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

    if (!name.trim() || !dosage.trim() || !form.trim() || !expiryDate.trim()) {
      toast.error("All fields are required!");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Medicine Name is required!");
      return;
    }
    
    if (!dosage.trim()) {
      toast.error("Dosage is required!");
      return;
    }
    
    if (!form.trim()) {
      toast.error("Form is required!");
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
        dosage,
        form,
        stock: numericStock,
        status: stockStatus,
        expiryDate: formatDate(expiryDate),
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
        <h2>Add New Medicine</h2>
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
            <label>Dosage:</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              style={styles.inputField}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Form:</label>
            <select
              type="text"
              value={form}
              onChange={(e) => setForm(e.target.value)}
              style={styles.inputField}
            >
              <option value="">-- Select Form --</option>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
            </select>
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
            <label>Stock:</label>
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
  },
  modalContent: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "400px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
    color: "black",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  inputField: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",

  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  modalButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    flex: 1,
  },
};

export default AddMedicineForm;
