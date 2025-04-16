import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const toUpperCaseName = (name) => name.toUpperCase();
const toTitleCase = (str) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const ExcelUploader = (collectionName = "excelTest") => {
  const [employees, setEmployees] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, collectionName));
    const employeesData = snapshot.docs
      .map((doc) => doc.data())
      .filter((data) => data.employeeID);
    setEmployees(employeesData);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const collectionRef = collection(db, collectionName);
    let added = 0;

    for (let i = 1; i < Math.min(rows.length, 101); i++) {
      const row = rows[i];
      const employeeID = row[1];
      const fullName = row[2];
      const dobRaw = row[3];
      const gender = row[4];
      const designation = row[12];
      const department = row[13];

      if (!employeeID || !fullName || !gender) continue;

      const [lastNamePart, firstAndMiddle] = fullName.split(",");
      if (!firstAndMiddle) continue;

      const lastname = toUpperCaseName(lastNamePart.trim());
      const nameParts = firstAndMiddle.trim().split(" ");
      const middleInitial = nameParts.pop()?.replace(".", "") || "";
      const firstname = toUpperCaseName(nameParts.join(" ").trim());

      let dob = null;
      if (dobRaw) {
        try {
          dob = Timestamp.fromDate(new Date(dobRaw));
        } catch (error) {
          console.error("Invalid DOB format in row", i + 1, dobRaw);
        }
      }

      // Check if employee already exists
      const q = query(collectionRef, where("employeeID", "==", employeeID));
      const existing = await getDocs(q);
      if (existing.empty) {
        // Add new employee with additional fields `role` and `status`
        await addDoc(collectionRef, {
          employeeID: employeeID.toString().trim(),
          firstname,
          middleInitial,
          lastname,
          gender: gender.trim(),
          dob,
          designation: designation ? toUpperCaseName(designation.trim()) : "",
          department: department ? toTitleCase(department.trim()) : "",
          role: "Employee", // Automatically adding role
          status: "Active", // Automatically adding status
        });
        added++;
      }
    }

    setUploadStatus(`${added} new employee(s) added.`);
    fetchEmployees();
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    uploadStatus,
    handleFileUpload,
  };
};
