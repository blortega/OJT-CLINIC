import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import EditModal from "../components/EditModal";

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [restockAmount, setRestockAmount] = useState(0);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const db = getFirestore(app);
        const medicineCollection = collection(db, "medicine");
        const snapshot = await getDocs(medicineCollection);
        const medicineLists = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMedicines(medicineLists);
      } catch (error) {
        toast.error("Failed to fetch Medicines!");
        console.error("Failed to fetch Medicines: ", error);
      }
    };

    fetchMedicines();
  }, []);

  const getStockStatus = (stock) => {
    console.log("Stock value:", stock);  // Add this line to check the value of stock
  
    // Ensure stock is a number
    stock = Number(stock);
  
    if (stock === 0) {
      return <div style={styles.noStockBadge}>Out of Stock</div>;
    } else if (stock <= 20 && stock > 0) {
      return <div style={styles.lowStockBadge}>Low Stock</div>;
    } else {
      return <div style={styles.inStockBadge}>In Stock</div>;
    }
  };
  

  const handleRestock = async (medicine, amount) => {
    try {
      const db = getFirestore(app);
      const medicineRef = doc(db, "medicine", medicine.id);  // Reference to the specific document
      
      // Use getDoc instead of getDocs for fetching a single document
      const medicineSnapshot = await getDoc(medicineRef);  
      
      if (!medicineSnapshot.exists()) {
        toast.error("Medicine not found!");
        return;
      }
      
      const currentStock = medicineSnapshot.data().stock;
      const newStock = currentStock + amount; // Calculate the new stock

      // Update the stock by adding the restock amount
      await updateDoc(medicineRef, {
        stock: newStock,
      });

      // Update the UI with the new stock
      setMedicines(medicines.map(item => 
        item.id === medicine.id ? { ...item, stock: newStock } : item
      ));

      toast.success(`${medicine.name} added ${restockAmount} unit/s`);
    } catch (error) {
      toast.error("Failed to restock!");
      console.error("Error restocking medicine:", error);
    }
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine); // Set the selected medicine for editing
    setIsEditModalOpen(true); // Open the Edit Modal
  };

  const handleDelete = async (medicine) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${medicine.name}?`);
    if (confirmDelete) {
      try {
        const db = getFirestore(app);
        await deleteDoc(doc(db, "medicine", medicine.id));
        toast.success(`${medicine.name} has been deleted.`);
        setMedicines(medicines.filter(item => item.id !== medicine.id)); // Remove it from the UI
      } catch (error) {
        toast.error("Failed to delete medicine.");
        console.error("Error deleting medicine:", error);
      }
    }
  };

  const handleUpdate = (updatedMedicine) => {
    setMedicines(medicines.map(medicine => (medicine.id === updatedMedicine.id ? updatedMedicine : medicine)));
  };

  const handleAddUser = (role) => {
    toast.success(`${role} added successfully!`);
  };

  const handleModalOpen = (medicine) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setRestockAmount(0); // Clear the input when closing the modal
  };

  return (
    <Sidebar>
      <div style={styles.container}>
        <ToastContainer position="top-right" autoClose={2000} />
        <h1 style={styles.text}>Inventory Page</h1>

        {/* Add Admin Button */}
        <div style={styles.buttonContainer}>
          <button
            style={{
              ...styles.addUserButton,
              backgroundColor: isHovered ? "#162d5e" : "#1e3a8a",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => handleAddUser("Admin")}
          >
            <FiPlus style={styles.addIcon} /> Add Medicine
          </button>
        </div>

        {/* Table */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thead}>Medicine</th>
                <th style={styles.thead}>Dosage</th>
                <th style={styles.thead}>Type</th>
                <th style={styles.thead}>Stocks</th>
                <th style={styles.thead}>Status</th>
                <th style={styles.thead}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine, index) => (
                <tr key={index}>
                  <td style={styles.tdata}>{medicine.name}</td>
                  <td style={styles.tdata}>{medicine.dosage}</td>
                  <td style={styles.tdata}>{medicine.type}</td>
                  <td style={styles.tdata}>{medicine.stock}</td>
                  <td style={styles.tdata}>{getStockStatus(medicine.stock)}</td>
                  <td style={styles.tdata}>
                    <button
                      style={styles.iconButton}
                      onClick={() => handleModalOpen(medicine)}
                    >
                      <FaPlus color="green" />
                    </button>
                    <button
                      style={styles.iconButton}
                      onClick={() => handleEdit(medicine)}
                    >
                      <FaEdit color="blue" />
                    </button>
                    <button
                      style={styles.iconButton}
                      onClick={() => handleDelete(medicine)}
                    >
                      <FaTrash color="red" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Restock Modal */}
        {isModalOpen && (
          <RestockModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            medicine={selectedMedicine}
            onRestock={handleRestock}
            restockAmount={restockAmount}
            setRestockAmount={setRestockAmount}
          />
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <EditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)} // Close modal
            medicine={selectedMedicine}
            onUpdate={handleUpdate} // Pass the update handler
          />
        )}

      </div>
    </Sidebar>
  );
};

const RestockModal = ({ isOpen, onClose, medicine, onRestock, restockAmount, setRestockAmount }) => {
  const handleRestockChange = (e) => {
    setRestockAmount(e.target.value);
  };

  const handleSubmit = async () => {
    const confirmStock = window.confirm(`Proceed to restock ${medicine.name}?`);
    if (!confirmStock) {
      return;
    }

    if (restockAmount <= 0) {
      toast.error("Please enter a valid restock amount.");
      return;
    }
    await onRestock(medicine, parseInt(restockAmount));
    setRestockAmount(0); // Clear the input field after restocking
    onClose(); // Close the modal after restocking
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>Restock Medicine</h2>
        <p style={styles.modalDescription}>
          You are about to restock <strong>{medicine.name}</strong>.
        </p>
        <p style={styles.modalDescription}>
          Please enter the amount you want to add to the stock.
        </p>

        <label style={styles.label}>
          Restock Amount:
          <input
            type="number"
            value={restockAmount}
            onChange={handleRestockChange}
            style={styles.inputField}
            min="1"
            placeholder="Enter number of items"
          />
        </label>

        <div style={styles.modalButtonContainer}>
          <button
            onClick={handleSubmit}
            style={styles.modalButton}
          >
            Restock
          </button>
          <button
            onClick={onClose}
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
  container: {
    padding: "20px",
    textAlign: "center",
  },
  text: {
    color: "black",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px",
    marginLeft: "795px",
  },
  addUserButton: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  addIcon: {
    fontSize: "18px",
  },
  card: {
    width: "60%",
    margin: "auto",
    overflowX: "auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "black",
  },
  thead: {
    padding: "12px",
    background: "#1e3a8a",
    color: "#fff",
    borderBottom: "2px solid #ddd",
  },
  tdata: {
    padding: "12px",
    borderBottom: "1px solid #ccc",
    borderRight: "1px solid #ddd",
    color: "#000",
    textAlign: "center",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    margin: "0 5px",
  },
  lowStockBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    backgroundColor: "#FFD700",
    color: "#fff",
    fontWeight: "bold",
  },
  inStockBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    backgroundColor: "#33ff86",
    color: "#fff",
    fontWeight: "bold",
  },
  noStockBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    backgroundColor: "#ff3342",
    color: "#fff",
    fontWeight: "bold",
  },
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

export default Inventory;
