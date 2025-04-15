import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebase";

const BarcodeScanner = ({ onClose, onScanComplete }) => {
  const [data, setData] = useState("Not Found");

  const db = getFirestore(app);

  const handleScan = async (scannedId) => {
    if (!scannedId || scannedId === data) return;
    setData(scannedId);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("employeeId", "==", scannedId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        onScanComplete(userData); // send data back to parent
        onClose(); // close scanner modal
      } else {
        alert("Employee not found!");
      }
    } catch (err) {
      console.error("Scan error:", err);
      alert("Failed to fetch employee data.");
    }
  };

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <BarcodeScannerComponent
        width={500}
        height={300}
        onUpdate={(err, result) => {
          if (result) handleScan(result.text);
        }}
      />
      <p>Scanned ID: {data}</p>
    </div>
  );
};

export default BarcodeScanner;
