import React, { useState } from "react";
import BarcodeScanner from "./BarcodeScanner";

const MedicineRequestForm = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  const handleScanComplete = (data) => {
    setEmployeeData(data);
  };

  const handleSubmit = () => {
    // Save to Firestore
    // Include: employeeData, selected medicine, complaint, etc.
  };

  return (
    <div>
      <h2>Request Medicine</h2>

      <button onClick={() => setIsScanning(true)}>📷 Scan ID</button>

      {isScanning && (
        <div className="scanner-modal">
          <BarcodeScanner
            onClose={() => setIsScanning(false)}
            onScanComplete={handleScanComplete}
          />
        </div>
      )}

      {employeeData && (
        <div>
          <p>
            <strong>ID:</strong> {employeeData.employeeId}
          </p>
          <p>
            <strong>Name:</strong> {employeeData.name}
          </p>
          <p>
            <strong>Department:</strong> {employeeData.department}
          </p>
          <p>
            <strong>Complaints:</strong> {employeeData.conditions?.join(", ")}
          </p>
        </div>
      )}

      {/* Medicine selection */}
      <label>Medicine:</label>
      <input type="text" placeholder="Enter Medicine" />

      <button onClick={handleSubmit}>Save Request</button>
    </div>
  );
};

export default MedicineRequestForm;
