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
} from "firebase/firestore";
import { db } from "../firebase"; // Adjust path if needed
import Sidebar from "../components/Sidebar";

// Helper function to convert the name to uppercase
const toUpperCaseName = (name) => {
  return name.toUpperCase(); // Convert the entire name to uppercase
};

const Setting = () => {
  const [employees, setEmployees] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      const gender = row[4]; // Column E

      if (!employeeID || !fullName || !gender) continue;

      // Parse full name: "LASTNAME, FIRSTNAME M."
      const [lastNamePart, firstAndMiddle] = fullName.split(",");
      if (!firstAndMiddle) continue;

      const lastname = toUpperCaseName(lastNamePart.trim());
      const nameParts = firstAndMiddle.trim().split(" ");

      const middleInitial = nameParts.pop()?.replace(".", "") || "";
      const firstname = toUpperCaseName(nameParts.join(" ").trim());

      // Check for existing employeeID
      const q = query(collectionRef, where("employeeID", "==", employeeID));
      const existing = await getDocs(q);
      if (existing.empty) {
        await addDoc(collectionRef, {
          employeeID: employeeID.toString().trim(),
          firstname,
          middleInitial,
          lastname,
          gender: gender.trim(), // Store gender as is (no uppercase conversion)
        });
        added++;
      }
    }

    setUploadStatus(`${added} new employee(s) added.`);
    fetchEmployees();
  };

  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "excelTest"));
    const employeesData = snapshot.docs
      .map((doc) => doc.data())
      .filter((data) => data.employeeID); // Filter out the "test" document and any docs without employeeID
    setEmployees(employeesData);
  };

  const handleDeleteAll = async () => {
    const snapshot = await getDocs(collection(db, "excelTest"));
    const deletePromises = snapshot.docs
      .filter((docSnap) => {
        // Only delete documents that contain the employeeID field and are not the "test" document
        return docSnap.id !== "test" && docSnap.data().employeeID;
      })
      .map(
        (docSnap) => deleteDoc(doc(db, "excelTest", docSnap.id)) // Delete these specific documents
      );
    await Promise.all(deletePromises);
    setUploadStatus("All employee records have been deleted.");
    fetchEmployees();
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.text}>Settings Page</h1>
        <p style={styles.text}>
          This is a test page to check if navigation is working properly.
        </p>

        <div style={{ marginTop: "40px" }}>
          <h2 style={styles.text}>Upload Excel File</h2>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
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
