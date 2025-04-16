// hooks/useExcelUpload.js
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

// Utility functions
const toUpperCaseName = (name) => name.toUpperCase();
const toTitleCase = (str) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const parseFullName = (fullName) => {
  const [lastNamePart, firstAndMiddle] = fullName.split(",");
  if (!firstAndMiddle) return null;

  const lastname = toUpperCaseName(lastNamePart.trim());
  const nameParts = firstAndMiddle.trim().split(" ");
  const middleInitial = nameParts.pop()?.replace(".", "") || "";
  const firstname = toUpperCaseName(nameParts.join(" ").trim());

  return { firstname, middleInitial, lastname };
};

const parseDate = (dobRaw) => {
  const parsedDate = new Date(dobRaw);
  return !isNaN(parsedDate) ? Timestamp.fromDate(parsedDate) : null;
};

// Custom Hook for Excel file upload
export const useExcelUpload = (collectionName = "excelTest") => {
  const [employees, setEmployees] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false); // Loading state
  const [fileError, setFileError] = useState(""); // File error state

  // Fetch existing employees from Firestore
  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, collectionName));
    const employeesData = snapshot.docs
      .map((doc) => doc.data())
      .filter((data) => data.employeeID);
    setEmployees(employeesData);
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    // File size validation (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File is too large. Please upload a file smaller than 5MB.");
      return;
    }

    // Validate the file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setFileError("Please upload a valid Excel file.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");
    setFileError(""); // Clear previous errors

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const collectionRef = collection(db, collectionName);
      const batch = writeBatch(db);
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

        const { firstname, middleInitial, lastname } = parseFullName(fullName);
        if (!firstname || !lastname) continue;

        // Convert DOB to Firestore Timestamp
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
            department: department ? toTitleCase(department.trim()) : "",
            role: "Employee", // Automatically adding role
            status: "Active", // Automatically adding status
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
      setIsUploading(false); // Reset loading state
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    uploadStatus,
    handleFileUpload,
    isUploading,
    fileError, // Provide error status to the component
  };
};
