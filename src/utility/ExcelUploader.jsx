import { useState, useEffect } from "react";
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

// Utility functions
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
  const [isUploading, setIsUploading] = useState(false); // Loading state

  // Fetch employees from Firestore
  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, collectionName));
    const employeesData = snapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id })) // Include the doc ID for deletion
      .filter((data) => data.employeeID);
    setEmployees(employeesData);
  };

  // Handle the file upload and add new employees to Firestore
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate the file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setUploadStatus("Please upload a valid Excel file.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");

    try {
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const collectionRef = collection(db, collectionName);
      let added = 0;

      // Iterate through the rows and process each employee
      for (let i = 1; i < Math.min(rows.length, 101); i++) {
        const row = rows[i];
        const employeeID = row[1];
        const fullName = row[2];
        const dobRaw = row[3];
        const gender = row[4];
        const designation = row[12];
        const department = row[13];

        if (!employeeID || !fullName || !gender) continue; // Skip invalid rows

        const [lastNamePart, firstAndMiddle] = fullName.split(",");
        if (!firstAndMiddle) continue;

        const lastname = toUpperCaseName(lastNamePart.trim());
        const nameParts = firstAndMiddle.trim().split(" ");
        const middleInitial = nameParts.pop()?.replace(".", "") || "";
        const firstname = toUpperCaseName(nameParts.join(" ").trim());

        // Convert DOB to Firestore Timestamp
        let dob = null;
        if (dobRaw) {
          const parsedDate = new Date(dobRaw);
          if (!isNaN(parsedDate)) {
            dob = Timestamp.fromDate(parsedDate);
          } else {
            console.error("Invalid DOB format in row", i + 1, dobRaw);
          }
        }

        // Check if the employee already exists in the Firestore collection
        const q = query(collectionRef, where("employeeID", "==", employeeID));
        const existing = await getDocs(q);
        if (existing.empty) {
          // Add new employee to Firestore if not already present
          await addDoc(collectionRef, {
            employeeID: employeeID.toString().trim(),
            firstname,
            middleInitial,
            lastname,
            gender: gender.trim(),
            dob,
            designation: designation ? toUpperCaseName(designation.trim()) : "",
            department: department ? toTitleCase(department.trim()) : "",
            role: "Employee", // Default role
            status: "Active", // Default status
          });
          added++;
        }
      }

      setUploadStatus(`${added} new employee(s) added.`);
      fetchEmployees(); // Refresh the employee list
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadStatus("Error processing file. Please try again.");
    } finally {
      setIsUploading(false); // Reset loading state
    }
  };

  // Function to delete all employees with an employeeID
  const handleDeleteAll = async () => {
    const collectionRef = collection(db, collectionName);

    // Fetch all documents in the collection
    const snapshot = await getDocs(collectionRef);
    const employeesToDelete = snapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id })) // Include the doc ID for deletion
      .filter((data) => data.employeeID); // Ensure we're only deleting those with employeeID

    console.log("Employees to delete:", employeesToDelete); // Debugging log

    if (employeesToDelete.length === 0) {
      setUploadStatus("No employees found with an employeeID to delete.");
      return;
    }

    const deletePromises = employeesToDelete.map((data) =>
      deleteDoc(doc(db, collectionName, data.id))
    );

    try {
      // Delete all the employee records with employeeID
      await Promise.all(deletePromises);
      setUploadStatus("All employee records have been deleted.");
      fetchEmployees(); // Refresh the employee list after deletion
    } catch (error) {
      console.error("Error deleting employees:", error);
      setUploadStatus("Error deleting records. Please try again.");
    }
  };

  // Fetch employees when the component mounts
  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    uploadStatus,
    handleFileUpload,
    handleDeleteAll,
    isUploading, // Provide uploading status to the component
  };
};
