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

  // Fetch the list of employees from Firestore
  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, collectionName));
    const employeesData = snapshot.docs
      .map((doc) => doc.data())
      .filter((data) => data.employeeID);
    setEmployees(employeesData);
  };

  // Handle the file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.xlsx$|\.xls$/)) {
      setUploadStatus("Invalid file type. Please upload an Excel file.");
      return;
    }

    setIsUploading(true); // Start uploading

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const collectionRef = collection(db, collectionName);
      let added = 0;

      // Loop through rows and add employees to Firestore
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

        const q = query(collectionRef, where("employeeID", "==", employeeID));
        const existing = await getDocs(q);
        if (existing.empty) {
          await addDoc(collectionRef, {
            employeeID: employeeID.toString().trim(),
            firstname,
            middleInitial,
            lastname,
            gender: gender.trim(),
            dob,
            designation: designation ? toUpperCaseName(designation.trim()) : "",
            department: department ? toTitleCase(department.trim()) : "",
            role: "Employee",
            status: "Active",
          });
          added++;
        }
      }

      setUploadStatus(`${added} new employee(s) added.`);
      fetchEmployees(); // Refresh employee list after upload
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus(
        "An error occurred while uploading the file. Please try again."
      );
    }

    setIsUploading(false); // End uploading
  };

  // Handle deleting all employee records
  const handleDeleteAll = async () => {
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = snapshot.docs
      .filter((docSnap) => docSnap.data().employeeID && docSnap.id !== "test")
      .map((docSnap) => deleteDoc(doc(db, collectionName, docSnap.id)));

    await Promise.all(deletePromises);
    setUploadStatus("All employee records have been deleted.");
    fetchEmployees(); // Refresh employee list after deletion
  };

  // Fetch employee list when the component mounts
  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    uploadStatus,
    isUploading,
    handleFileUpload,
    handleDeleteAll,
  };
};
