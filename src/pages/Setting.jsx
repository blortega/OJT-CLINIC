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
  Timestamp, // Import Firestore Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import Sidebar from "../components/Sidebar";

const toUpperCaseName = (name) => {
  return name.toUpperCase();
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
      const dobRaw = row[3]; // Column D - Date of Birth
      const gender = row[4]; // Column E

      if (!employeeID || !fullName || !gender) continue;

      const [lastNamePart, firstAndMiddle] = fullName.split(",");
      if (!firstAndMiddle) continue;

      const lastname = toUpperCaseName(lastNamePart.trim());
      const nameParts = firstAndMiddle.trim().split(" ");
      const middleInitial = nameParts.pop()?.replace(".", "") || "";
      const firstname = toUpperCaseName(nameParts.join(" ").trim());

      // Convert DOB to Firestore Timestamp
      let dob = null;
      if (dobRaw) {
        try {
          const dobDate = new Date(dobRaw);
          dob = Timestamp.fromDate(dobDate); // Convert to Firestore Timestamp
        } catch (error) {
          console.error("Invalid DOB format in row", i + 1, dobRaw);
        }
      }

      // Check if employee already exists
      const q = query(collectionRef, where("employeeID", "==", employeeID));
      const existing = await getDocs(q);
      if (existing.empty) {
        await addDoc(collectionRef, {
          employeeID: employeeID.toString().trim(),
          firstname,
          middleInitial,
          lastname,
          gender: gender.trim(),
          dob, // Store the Firestore Timestamp object
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
      .filter((data) => data.employeeID);
    setEmployees(employeesData);
  };

  const handleDeleteAll = async () => {
    const snapshot = await getDocs(collection(db, "excelTest"));
    const deletePromises = snapshot.docs
      .filter((docSnap) => {
        return docSnap.id !== "test" && docSnap.data().employeeID;
      })
      .map((docSnap) => deleteDoc(doc(db, "excelTest", docSnap.id)));
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
                {emp.gender}{" "}
                {emp.dob &&
                  `- DOB: ${emp.dob.toDate().toISOString().split("T")[0]}`}
                {/* Display DOB in 'YYYY-MM-DD' format */}
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
