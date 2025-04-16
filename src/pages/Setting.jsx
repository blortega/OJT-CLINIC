// Setting.js
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { ExcelUploader } from "../hooks/ExcelUploader"; // Use the custom hook

const Setting = () => {
  const { employees, uploadStatus, handleFileUpload, isUploading, fileError } =
    ExcelUploader(); // Use the custom hook for Excel upload

  const [selectedFile, setSelectedFile] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.text}>Settings Page</h1>
        <p style={styles.text}>
          This page allows you to upload employee data and manage employee
          records.
        </p>

        <div style={{ marginTop: "40px" }}>
          <h2 style={styles.text}>Upload Excel File</h2>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {fileError && (
            <p style={{ color: "red", marginTop: "10px" }}>{fileError}</p>
          )}
          {uploadStatus && !fileError && (
            <p style={{ color: "green", marginTop: "10px" }}>{uploadStatus}</p>
          )}
          {isUploading && (
            <div className="spinner" style={styles.spinner}>
              <div className="spinner-circle"></div>
            </div>
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
                {emp.gender}{" "}
                {emp.dob &&
                  `- DOB: ${emp.dob.toDate().toISOString().split("T")[0]}`}{" "}
                - {emp.designation} - {emp.department} - {emp.status} -{" "}
                {emp.role}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleFileUpload(selectedFile)}
            style={{
              marginTop: "20px",
              padding: "8px 16px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            disabled={isUploading}
          >
            Upload File
          </button>
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
  spinner: {
    marginTop: "20px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    animation: "spin 2s linear infinite",
  },
};

export default Setting;
