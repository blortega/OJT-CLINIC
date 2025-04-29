import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import Sidebar from "../components/Sidebar";

// Main component
const Reports = () => {
  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.text}>Reports Page</h1>
        <p style={styles.text}>
          This page allows you to manage employee records.
        </p>
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
};

export default Reports;
