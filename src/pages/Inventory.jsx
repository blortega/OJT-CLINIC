import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getFirestore, collection, getDocs, getDoc } from "firebase/firestore";
import { app } from "../firebase";


const Inventory = () => {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const db = getFirestore (app);
        const medicineCollection = collection(db, "medicine");
        const snapshot = await getDocs(medicineCollection);
        const medicineLists = snapshot.docs.map((doc) => doc.data());
        setMedicines(medicineLists);
      } catch (error) {
        console.error ("Failed to fetch Medicines: ", error)
      }
    };
  
    fetchMedicines();
  }, []);

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.text}>Inventory Page</h1>
        <p style={styles.text}>
          LEBRON LEBRON LEBRON JAMES - Glorious King
        </p>
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thead}>Medicine</th>
                <th style={styles.thead}>Dosage</th>
                <th style={styles.thead}>Stocks</th>
                <th style={styles.thead}>Type</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine, index) => (
                <tr key={index}>
                  <td style={styles.tdata}>{medicine.name}</td>
                  <td style={styles.tdata}>{medicine.dosage}</td>
                  <td style={styles.tdata}>{medicine.stock}</td>
                  <td style={styles.tdata}>{medicine.type}</td>
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
  tbltxt: {
    color: "black",
  },
  card: {
    width: "67%",
    margin: "auto",
    overflowX: "auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
  table: {
    border: "2px solid forestgreen",
    width: "800px",
    height: "100px",
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
  }
};

export default Inventory;
