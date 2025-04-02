import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

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
    if (stock === 0) return <div style={styles.noStockBadge}>Out of Stock</div>;
    if (stock <= 20) return <div style={styles.lowStockBadge}>Low Stock</div>;
    return <div style={styles.inStockBadge}>In Stock</div>;
  };

  const handleRestock = (medicine) => {
    toast.success(`Restocking ${medicine.name}...`);
  };

  const handleEdit = (medicine) => {
    toast.info(`Editing ${medicine.name}...`);
  };

  const handleDelete = (medicine) => {
    toast.warn(`Deleting ${medicine.name}...`);
  };

  const handleAddUser = (role) => {
    toast.success(`${role} added successfully!`);
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
                      onClick={() => handleRestock(medicine)}
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
      </div>
    </Sidebar>
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
};

export default Inventory;
