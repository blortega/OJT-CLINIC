import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import EditModal from "../components/EditMedicine";
import AddMedicineForm from "../components/AddMedicineForm";

const formatDate = (date) => {
  // Return "N/A" if no date is provided
  if (!date) return "N/A";

  // If it's a Firestore Timestamp (has a .toDate function), convert it to a JavaScript Date
  if (typeof date.toDate === "function") {
    date = date.toDate();
  }

  // If it's a string, attempt to parse it into a valid date object
  if (typeof date === "string") {
    date = new Date(date);
  }

  // Ensure the date is valid
  const validDate = new Date(date);
  if (isNaN(validDate)) return "N/A"; // Invalid date handling

  // Format the date to "Month Day, Year" format
  const options = { year: "numeric", month: "long", day: "numeric" };
  return validDate.toLocaleDateString("en-US", options);
};

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [restockAmount, setRestockAmount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);



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

  const filterMedicines = (medicine) => {
    const searchLower = search.toLowerCase();

    if (searchLower === "out of stock" || searchLower === "in stock" || searchLower === "low stock") {
      return medicine.status && medicine.status.toLowerCase() === searchLower;
    }

    const fieldToSearch = [
      medicine.name,
      medicine.dosage,
      medicine.type,
      medicine.status,
    ];

    return fieldToSearch.some((field) =>
      field && field.toLowerCase().includes(searchLower)
    );
  };

  const handleAddMedicine = async (newMedicine) => {
    try {
      console.log("adding medicine:", newMedicine);
      // Adding the new medicine to Firestore
      const db = getFirestore(app);
      const docRef = await addDoc(collection(db, "medicine"), {
        ...newMedicine,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiryDate: newMedicine.expiryDate || "",
      });

      console.log("Document added with ID:", docRef.id);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const addedMedicine = { id: docRef.id, ...docSnap.data() };


      // Update the local state with the new medicine
      setMedicines((prevMedicines) => [...prevMedicines, addedMedicine]);

      toast.success("Medicine added successfully!");
    } else {
      toast.error("Failed to retrieve added medicines")
    }
   } catch (error) {
     toast.error("Failed to add medicine!");
     console.error("Error adding medicine:", error);
    }
  };

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

      let newStatus = "";
      if (newStock > 20) {
        newStatus = "In Stock";
      } else if (newStock > 5) {
        newStatus = "Low Stock";
      } else {
        newStatus = "Out of Stock";
      }
      // Update the stock by adding the restock amount
      await updateDoc(medicineRef, {
        stock: newStock,
        status: newStatus,
        restockAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update the UI with the new stock
      setMedicines(medicines.map(item => 
        item.id === medicine.id ? { ...item, stock: newStock, status: newStatus} : item
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
        {/* Add Medicine Button */}
        <div style={styles.searchContainer}>
          <input 
            style={styles.searchBar}
            type = "text"
            placeholder = "Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={styles.buttonContainer}>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={ isHovered ? {...styles.addUserButton, ... styles.buttonHover } : styles.addUserButton}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <FiPlus /> Add Medicine
            </button>
          </div>
        </div>

        {/* Add Medicine Form Modal */}
        {isAddModalOpen && (
          <AddMedicineForm
            onClose={() => setIsAddModalOpen(false)}
            onAddMedicine={handleAddMedicine}
          />
        )}

        {/* Medicine List */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thead}>Medicine</th>
                <th style={styles.thead}>Dosage</th>
                <th style={styles.thead}>Type</th>
                <th style={styles.thead}>Stocks</th>
                <th style={styles.thead}>Status</th>
                <th style={styles.thead}>Expiry Date</th>
                <th style={styles.thead}>Date Created</th>
                <th style={styles.thead}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.filter(filterMedicines).map((medicine, index)=> {
                console.log(`Medicine ${medicine.name} - expiryDate:`, medicine.expiryDate);
                console.log(`Medicine ${medicine.name} - createdAt:`, medicine.createdAt);

                return (
                <tr key={index}>
                  <td style={styles.tdata}>{medicine.name}</td>
                  <td style={styles.tdata}>{medicine.dosage}</td>
                  <td style={styles.tdata}>{medicine.type}</td>
                  <td style={styles.tdata}>{medicine.stock}</td>
                  <td style={styles.tdata}>{getStockStatus(medicine.stock)}</td>
                  <td style={styles.tdata}>
                    {formatDate(medicine.expiryDate)}
                  </td>
                  <td style={styles.tdata}>
                    {formatDate(medicine.createdAt)}
                  </td>
                  <td style={styles.tdata}>
                    <button
                      style={hoveredUser === medicine.id && hoveredIcon === "add" 
                        ? {...styles.iconButton, ... styles.iconButtonHover} 
                        : styles.iconButton
                      }
                      onMouseEnter={() => {
                        setHoveredUser(medicine.id);
                        setHoveredIcon("add");
                      }}
                      onMouseLeave={() => setHoveredIcon(null)}
                      onClick={() => handleModalOpen(medicine)}
                      title="Add"
                    >
                      <FiPlus/>
                    </button>
                    <button
                      style={hoveredUser === medicine.id && hoveredIcon === "edit" 
                        ? {...styles.iconButton, ... styles.iconButtonHover} 
                        : styles.iconButton
                      }
                      onMouseEnter={() => {
                        setHoveredUser(medicine.id);
                        setHoveredIcon("edit");
                      }}
                      onMouseLeave={() => setHoveredIcon(null)}
                      onClick={() => handleEdit(medicine)}
                      title="Edit"
                    >
                      <FiEdit/>
                    </button>
                    <button
                      style={hoveredUser === medicine.id && hoveredIcon === "delete" 
                        ? {...styles.iconButton, ... styles.iconButtonHover} 
                        : styles.iconButton
                      }
                      onMouseEnter={() => {
                        setHoveredUser(medicine.id);
                        setHoveredIcon("delete");
                      }}
                      onMouseLeave={() => setHoveredIcon(null)}
                      onClick={() => handleDelete(medicine)}
                      title="Delete"
                    >
                      <FiTrash/>
                    </button>
                  </td>
                </tr>
                );
              })}
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
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && Number(value) >= 0)){
      setRestockAmount(value);
    }
  };

  const handleIncrease = () => {
    setRestockAmount((prevAmount) => parseInt(prevAmount) + 1);
  };

  const handleDecrease = () => {
    setRestockAmount((prevAmount) => {
      const newAmount = parseInt(prevAmount) - 1;
      return newAmount >= 0 ? newAmount : 0; // Prevent going below 0
    });
  };

  const handleSubmit = async () => {
    const confirmStock = window.confirm(`Proceed to add stock for ${medicine.name}?`);
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
        <h2 style={styles.modalTitle}>Add Stock</h2>
        <p style={styles.modalDescription}>
          You are about to add stock for <strong>{medicine.name}</strong>.
        </p>
        <p style={styles.modalDescription}>
          Please enter the amount you want to add to the stock.
        </p>

        {/* Display Current Stock */}
        <p style={styles.currentStockText}>
          <strong>Current Stock:</strong> {medicine.stock} unit/s
        </p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Stock Amount:
            <div style={styles.inputWrapper}>
              <button 
                type="button" 
                onClick={handleDecrease}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={styles.decreaseButton}>-</button>
              <input
                type="number"
                value={restockAmount}
                onChange={handleRestockChange}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "+" || e.key === ".") {
                    e.preventDefault(); // Block minus sign and other unwanted chars
                  }
                }}
                style={styles.inputField}
                min="0"
                placeholder="Enter number of items"
              />
              <button 
                type="button" 
                onClick={handleIncrease} 
                style={styles.increaseButton}>+</button>
            </div>
          </label>
        </div>

        <div style={styles.modalButtonContainer}>
          <button
            onClick={handleSubmit}
            style={styles.modalButton}
          >
            Add
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
  searchContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    margin: "0 auto 18px auto",
  },

  searchBar: {
    width: "22%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#000",
  },

  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "0px",
  },
  buttonHover:{
    backgroundColor: "#162d5e",
  },
  addUserButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    backgroundColor: "#1e3a8a",
    transition: "background-color 0.3s",
  },
  addIcon: {
    fontSize: "20px",
  },
  card: {
    width: "80%",
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
    color: "#1e3a8a",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    margin: "0 5px",
  },
  iconButtonHover: {
    color: "#d41c48",
    transform: "scale(1.1)",
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
  currentStockText: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "15px",
    fontWeight: "bold",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  decreaseButton: {
    backgroundColor: "#dc3545", // Red for Decrease
    color: "white",
    border: "none",
    padding: "10px 15px",
    fontSize: "18px",
    cursor: "pointer",
    borderRadius: "8px",
    margin: "0 10px",
    transition: "background-color 0.3s",
    alignItems: "center",
    justifyContent: "center",
  },
  increaseButton: {
    backgroundColor: "#28a745", // Green for Increase
    color: "white",
    border: "none",
    padding: "10px 15px",
    fontSize: "18px",
    cursor: "pointer",
    borderRadius: "8px",
    margin: "0 10px",
    transition: "background-color 0.3s",
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: "0.5px",
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
