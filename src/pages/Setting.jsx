import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { ExcelUploader } from "../Utility/ExcelUploader";

const Setting = () => {
  // Use the ExcelUploader hook
  const { employees, uploadStatus, handleFileUpload } = ExcelUploader();

  // Handle file change
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle Delete All Employees
  const handleDeleteAll = async () => {
    const snapshot = await getDocs(collection(db, "excelTest"));
    const deletePromises = snapshot.docs
      .filter((docSnap) => docSnap.data().employeeID && docSnap.id !== "test") // Don't delete the one without employeeID or 'test' record
      .map((docSnap) => deleteDoc(doc(db, "excelTest", docSnap.id)));

    await Promise.all(deletePromises);
    fetchEmployees(); // Refresh the employee list after deletion
  };

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.text}>Settings Page</h1>
        <p style={styles.text}>
          This is a test page to check if navigation is working properly.
        </p>

        <div style={{ marginTop: "40px" }}>
          <h2 style={styles.text}>Upload Excel File</h2>
          <input type="file" accept=".xlsx, .xls" onChange={onFileChange} />
          {uploadStatus && (
            <p style={{ color: "green", marginTop: "10px" }}>{uploadStatus}</p>
          )}

          <h3 style={{ marginTop: "30px", color: "black" }}>
            Employees in Firestore:
          </h3>
          <ul
            style={{
              textAlign: "left",
              maxWidth: "600px",
              margin: "0 auto",
              color: "black",
              listStyleType: "disc",
            }}
          >
            {employees.map((emp, index) => (
              <li key={index}>
                <strong>{emp.employeeID}</strong> - {emp.lastname},{" "}
                {emp.firstname} {emp.middleInitial && emp.middleInitial + "."} -{" "}
                {emp.gender}
                {emp.dob &&
                  ` - DOB: ${emp.dob.toDate().toISOString().split("T")[0]}`}
                {emp.designation && ` - Designation: ${emp.designation}`}
                {emp.department && ` - Department: ${emp.department}`}
                {emp.role && ` - Role: ${emp.role}`} {/* Show Role */}
                {emp.status && ` - Status: ${emp.status}`} {/* Show Status */}
              </li>
            ))}
          </ul>

          {employees.length > 0 && (
            <button
              onClick={handleDeleteAll}
              style={{
                marginTop: "20px",
                padding: "8px 16px",
                backgroundColor: "#ff4d4f",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete All Employee Records
            </button>
          )}
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
};

export default Setting;
