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
} from "firebase/firestore";
import { db } from "../firebase";
import Sidebar from "../components/Sidebar";

const toUpperCaseName = (name) => name.toUpperCase();

const parseDate = (dobRaw) => {
  const parsedDate = new Date(dobRaw);
  return !isNaN(parsedDate) ? Timestamp.fromDate(parsedDate) : null;
};

const Setting = () => {
  const [employees, setEmployees] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false); // Loading state

  // Fetch existing employees from Firestore
  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "excelTest"));
    const employeesData = snapshot.docs
      .map((doc) => doc.data())
      .filter((data) => data.employeeID);
    setEmployees(employeesData);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File type validation
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setUploadStatus("Please upload a valid Excel file.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const collectionRef = collection(db, "excelTest");
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

        const [lastNamePart, firstAndMiddle] = fullName.split(",");
        if (!firstAndMiddle) continue;

        const lastname = toUpperCaseName(lastNamePart.trim());
        const nameParts = firstAndMiddle.trim().split(" ");
        const middleInitial = nameParts.pop()?.replace(".", "") || "";
        const firstname = toUpperCaseName(nameParts.join(" ").trim());

        let dob = null;
        if (dobRaw) {
          dob = parseDate(dobRaw);
        }

        // Check if employee already exists
        const q = query(collectionRef, where("employeeID", "==", employeeID));
        const existing = await getDocs(q);
        if (existing.empty) {
          // Add employee including new fields: role, status, department, and designation
          await addDoc(collectionRef, {
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
            onChange={handleFileUpload}
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
