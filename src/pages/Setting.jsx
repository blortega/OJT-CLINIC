import React from "react";
import Sidebar from "../components/Sidebar";
import { ExcelUploader } from "../Utility/ExcelUploader"; // Import the custom ExcelUploader hook

const Setting = () => {
  const {
    employees,
    uploadStatus,
    handleFileUpload,
    handleDeleteAll,
    isUploading,
  } = ExcelUploader("excelTest");

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
            onChange={(e) => handleFileUpload(e.target.files[0])} // Trigger file upload
            disabled={isUploading}
          />
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
                {emp.gender}{" "}
                {emp.dob &&
                  `- DOB: ${emp.dob.toDate().toISOString().split("T")[0]}`}{" "}
                - {emp.designation} - {emp.department} - {emp.status} -{" "}
                {emp.role}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "30px" }}>
            <button
              onClick={handleDeleteAll} // Trigger delete all employees
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
          </div>
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
