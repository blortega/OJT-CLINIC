import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

const EditModal = ({ isOpen, onClose, medicine, onUpdate }) => {
  if (!isOpen) return null;

  const [editedMedicine, setEditedMedicine] = useState({
    name: medicine?.name || "",
    dosage: medicine?.dosage || "",
    type: medicine?.type || "",
    stock: medicine?.stock || 0,
  });

  useEffect(() => {
    if (medicine) {
      setEditedMedicine({
        name: medicine.name,
        dosage: medicine.dosage,
        type: medicine.type,
        stock: medicine.stock,
      });
    }
  }, [medicine]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMedicine((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

    const handleSubmit = async () => {

      const confirmUpdate = window.confirm("Are you sure you want to update the medicine details?");

      if (!confirmUpdate) {
        return;
      }

      if (!editedMedicine.name || !editedMedicine.dosage || !editedMedicine.type || editedMedicine.stock < 0) {
        toast.error("Please fill in all fields correctly.");
        return;
      }

      try {
        const db = getFirestore(app);
        const medicineRef = doc(db, "medicine", medicine.id);

        await updateDoc(medicineRef, {
          name: editedMedicine.name,
          dosage: editedMedicine.dosage,
          type: editedMedicine.type,
          stock: parseInt(editedMedicine.stock),
        });

        onUpdate({ ...medicine, ...editedMedicine }); // Update the UI
        toast.success("Medicine details updated successfully!");
        onClose(); // Close the modal after submitting
      } catch (error) {
        toast.error("Failed to update medicine.");
        console.error("Error updating medicine:", error);
      }
    };

  const handleClose = () => {
    setEditedMedicine({
      name: medicine?.name || "",
      dosage: medicine?.dosage || "",
      type: medicine?.type || "",
      stock: medicine?.stock || 0,
    });
    onClose(); // Close the modal without saving changes
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>Edit Medicine</h2>

        <div style={styles.modalDescription}>
          <label style={styles.label}>
            Name:
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
            Type:
            <input
              type="text"
              name="type"
              value={editedMedicine.type}
              onChange={handleInputChange}
              style={styles.inputField}
              placeholder="Enter Type"
            />
          </label>

          <label style={styles.label}>
            Stock:
            <input
              type="number"
              name="stock"
              value={editedMedicine.stock}
              onChange={handleInputChange}
              style={styles.inputField}
              min="0"
              placeholder="Enter Stock Quantity"
            />
          </label>
        </div>

        <div style={styles.modalButtonContainer}>
          <button
            onClick={handleSubmit}
            style={styles.modalButton}
          >
            Update
          </button>
          <button
            onClick={handleClose}
            style={styles.cancelButton}
          >
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
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "15px",
  },
  modalDescription: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "10px",
  },
  label: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "10px",
    display: "block",
  },
  inputField: {
    fontSize: "18px",
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "20px",
    textAlign: "center",
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
    transition: "background-color 0.3s",
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
    transition: "background-color 0.3s",
  },
};

export default EditModal;
