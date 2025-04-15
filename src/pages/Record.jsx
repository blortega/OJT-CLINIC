import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";

const Record = () => {
  const [scannedData, setScannedData] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        setScannedData(bufferRef.current);
        bufferRef.current = "";

        setIsScannerActive(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsScannerActive(false);
        }, 5000); // Active for 5 seconds after scan
      } else {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.heading}>ID Scanner</h1>

        <div style={styles.statusContainer}>
          <div
            style={{
              ...styles.statusCircle,
              backgroundColor: isScannerActive ? "limegreen" : "lightgray",
            }}
          />
          <span style={styles.statusText}>
            {isScannerActive ? "Scanner Active" : "Waiting for scan..."}
          </span>
        </div>

        <div style={styles.resultBox}>
          <h2>Scanned Data:</h2>
          <pre>{scannedData || "No data scanned yet."}</pre>
        </div>
      </div>
    </Sidebar>
  );
};

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
  },
  heading: {
    color: "#1e3a8a",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
  },
  statusCircle: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    transition: "background-color 0.3s ease",
  },
  statusText: {
    fontSize: "16px",
    fontWeight: "500",
  },
  resultBox: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "600px",
    margin: "0 auto",
  },
};

export default Record;
