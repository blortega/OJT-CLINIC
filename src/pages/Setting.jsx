import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import Sidebar from "../components/Sidebar";

// Helper functions
const toUpperCaseName = (name) => name.toUpperCase();

const parseDate = (dobRaw) => {
  const parsedDate = new Date(dobRaw);
  return !isNaN(parsedDate) ? Timestamp.fromDate(parsedDate) : null;
};

const parseFullName = (fullName) => {
  const [lastNamePart, firstAndMiddle] = fullName.split(",");
  if (!firstAndMiddle) return null;

  const lastname = toUpperCaseName(lastNamePart.trim());
  const nameParts = firstAndMiddle.trim().split(" ");
  const middleInitial = nameParts.pop()?.replace(".", "") || "";
  const firstname = toUpperCaseName(nameParts.join(" ").trim());

  return { firstname, middleInitial, lastname };
};

// Main component
const Setting = () => {
  const [employees, setEmployees] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false); // Loading state
  const [fileError, setFileError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // Track selected file

  // Fetch existing employees from Firestore
  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "excelTest"));
    const employeesData = snapshot.docs
      .map((doc) => doc.data())
      .filter((data) => data.employeeID);
    setEmployees(employeesData);
  };

  // Handle file change
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Store the selected file
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setFileError("Please select a file first.");
      return;
    }

    // File size validation (Max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError("File is too large. Please upload a file smaller than 5MB.");
      return;
    }

    // File type validation
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      setFileError("Please upload a valid Excel file.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");
    setFileError(""); // Clear previous errors

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const collectionRef = collection(db, "excelTest");
      const batch = writeBatch(db);
      let added = 0;

      for (let i = 1; i < Math.min(rows.length, 101); i++) {
        const row = rows[i];
        const employeeID = row[1]; // Column B
        const fullName = row[2]; // Column C
        const dobRaw = row[3]; // Column D - Date of Birth
        const gender = row[4]; // Column E
        const designation = row[12]; // Column M - Designation
        const department = row[13]; // Column N - Department

        if (!employeeID || !fullName || !gender) continue;

        const { firstname, middleInitial, lastname } = parseFullName(fullName);
        if (!firstname || !lastname) continue;

        let dob = null;
        if (dobRaw) {
          dob = parseDate(dobRaw);
        }

        // Check if employee already exists
        const q = query(collectionRef, where("employeeID", "==", employeeID));
        const existing = await getDocs(q);
        if (existing.empty) {
          const docRef = doc(collectionRef, employeeID.toString().trim());
          batch.set(docRef, {
            employeeID: employeeID.toString().trim(),
            firstname,
            middleInitial,
            lastname,
            gender: gender.trim(),
            dob,
            designation: designation ? toUpperCaseName(designation.trim()) : "",
            department: department ? department.trim() : "",
            role: "Employee", // Default role
            status: "Active", // Default status
          });
          added++;
        }
      }

      await batch.commit();

      setUploadStatus(`${added} new employee(s) added.`);
      fetchEmployees();
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadStatus("Error processing file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete all employees
  const handleDeleteAll = async () => {
    if (
      !window.confirm("Are you sure you want to delete all employee records?")
    )
      return;

    const snapshot = await getDocs(collection(db, "excelTest"));
    const deletePromises = snapshot.docs
      .filter((docSnap) => docSnap.id !== "test" && docSnap.data().employeeID)
      .map((docSnap) => deleteDoc(doc(db, "excelTest", docSnap.id)));

    await Promise.all(deletePromises);
    setUploadStatus("All employee records have been deleted.");
    fetchEmployees();
  };

  // Fetch employee data on initial load
  useEffect(() => {
    fetchEmployees();
  }, []);

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
            onChange={handleFileChange} // Track the selected file
            disabled={isUploading}
          />
          <button
            onClick={handleFileUpload} // Trigger file upload on button click
            disabled={isUploading || !selectedFile}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Upload
          </button>

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
