import React, { useEffect, useState, useRef } from "react";
import { collection, getFirestore, getDocs } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import {  app, db } from "../firebase"; // Import Firestore instance
import { FaTrash, FaEye } from "react-icons/fa";

const Record = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      const snapshot = await getDocs(collection(db, "medicineRequests"));
      const recordList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          employeeID: data.employeeID,
          fullName: `${data.firstname} ${data.middleInitial}. ${data.lastname}`,
          department: data.department,
          medicine: data.medicine,
          complaint: data.complaint,
          quantity: data.quantityDispensed,
          status: data.status,
          date: data.timestamp?.toDate().toLocaleString() || "N/A"
        };
      });
      setRecords(recordList);
    };
  
    fetchRecords();
  }, []);

  return (
    <Sidebar>
    <div style={{ display: "flex" }}>
      

      <div style={{ flex: 1, padding: "24px" }}>
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          border: "1px solid #ddd"
        }}>
          <h2 style={{
            marginBottom: "20px",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#2563eb"
          }}>Records</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
  <tr style={{ backgroundColor: "#2563eb", color: "white" }}>
    {["Employee ID", "Name", "Department", "Medicine", "Quantity", "Complaint", "Status", "Date", "Actions"].map((header) => (
      <th key={header} style={headerStyle}>{header}</th>
    ))}
  </tr>
</thead>
<tbody>
  {records.map((record, index) => (
    <tr key={record.id} style={index % 2 === 0 ? rowEvenStyle : rowOddStyle}>
      <td style={cellStyle}>{record.employeeID}</td>
      <td style={cellStyle}>{record.fullName}</td>
      <td style={cellStyle}>{record.department}</td>
      <td style={cellStyle}>{record.medicine}</td>
      <td style={cellStyle}>{record.quantity}</td>
      <td style={cellStyle}>{record.complaint}</td>
      <td style={cellStyle}>{record.status}</td>
      <td style={cellStyle}>{record.date}</td>
      <td style={cellStyle}>
        <FaEye style={iconStyle} />
        <FaTrash style={iconStyle} />
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
    </Sidebar>
  );
};

const cellStyle = {
  padding: "14px 16px",
  textAlign: "center",
  border: "1px solid #ddd",
  color: "black",
};

const iconStyle = {
  margin: "0 6px",
  cursor: "pointer",
  transition: "transform 0.2s",
  color: "#888"
};
const headerStyle = {
  padding: "14px 16px",
  textAlign: "center",
  border: "1px solid #ddd",
  fontWeight: "bold",
};
const rowEvenStyle = {
  backgroundColor: "#f9f9f9"
};

const rowOddStyle = {
  backgroundColor: "#ffffff"
};



export default Record;