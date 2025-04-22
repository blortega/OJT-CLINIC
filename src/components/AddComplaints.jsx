import React, { useState } from "react";
import { toast } from "react-toastify";

const AddComplaints = ({ onClose, onAddComplaint }) => {
  const [complaintText, setComplaintText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onAddComplaint(complaintText);
    setIsSubmitting(false);
    onClose(); // Close the modal after submitting
  }; 

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>Add Complaint</h2>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Complaint:</label>
          <input
            type="text"
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="Complaint"
            style={styles.inputField}
          />
        </div>
        <div style={styles.modalButtonContainer}>
          <button
            onClick={handleSubmit}
            style={styles.modalButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
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
      marginBottom: "20px",
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
    label: {
        color: "black",
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

export default AddComplaints;
