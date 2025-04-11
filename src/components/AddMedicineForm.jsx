// AddMedicineForm.js
import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const AddMedicineForm = ({ onClose, onAddMedicine }) => {
    const [name, setName] = useState("");
    const [dosage, setDosage] = useState("");
    const [type, setType] = useState("");
    const [stock, setStock] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !dosage || !type || !stock) {
      toast.error("All fields are required!");
      return;
    }

    const numericStock = parseInt(stock, 10);

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
        type,
        stock: numericStock,
        status: stockStatus,
    };
    
    console.log("Submitting new medicine:", newMedicine);
    
    onAddMedicine(newMedicine);

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
            <label>Type:</label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={styles.inputField}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Stock:</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
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
