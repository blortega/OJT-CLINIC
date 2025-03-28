import React from "react";
import Sidebar from "../components/Sidebar";

const Inventory = () => {
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
              <th style={styles.thead}>Category</th>
              <th style={styles.thead}>Stocks</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td style={styles.tdata}>Biogesic</td>
              <td style={styles.tdata}>Paracetamol</td>
              <td style={styles.tdata}>100</td>
            </tr>
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
