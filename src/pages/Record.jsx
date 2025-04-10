import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const Record = () => {
  const [search, setSearch] = useState([]); // Array to hold selected genders
  const [modalVisible, setModalVisible] = useState(false); // Track modal visibility
  const [genderOptions, setGenderOptions] = useState([
    "Male",
    "Female",
    "Other",
  ]); // Gender options

  // Handle checkbox changes inside the modal
  const handleCheckboxChange = (e, gender) => {
    if (e.target.checked) {
      setSearch((prev) => [...prev, gender]);
    } else {
      setSearch((prev) => prev.filter((item) => item !== gender));
    }
  };

  // Close the modal and clear the search
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Handle chip click to remove a selected gender
  const handleChipRemove = (gender) => {
    setSearch((prev) => prev.filter((item) => item !== gender));
  };

  return (
    <Sidebar>
      <div style={styles.container}>
        <h1 style={styles.text}>Records Page</h1>
        <p style={styles.text}>
          This is a test page to check if navigation is working properly.
        </p>

        {/* Search bar with chips for selected filters */}
        <div style={styles.searchContainer}>
          <input type="text" placeholder="Search..." style={styles.searchBar} />
          <div style={styles.chipContainer}>
            {search.map((gender) => (
              <span
                key={gender}
                style={styles.chip}
                onClick={() => handleChipRemove(gender)}
              >
                {gender} <span style={styles.chipClose}>x</span>
              </span>
            ))}
          </div>
          {/* Button to open the modal */}
          <button
            style={styles.filterButton}
            onClick={() => setModalVisible(true)}
          >
            Filter by Gender
          </button>
        </div>

        {/* Modal for checkbox filter */}
        {modalVisible && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3>Select Genders</h3>
              {genderOptions.map((gender) => (
                <label key={gender} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={search.includes(gender)}
                    onChange={(e) => handleCheckboxChange(e, gender)}
                    style={styles.checkbox}
                  />
                  {gender}
                </label>
              ))}
              <div style={styles.modalButtons}>
                <button
                  style={styles.modalCloseButton}
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <button
                  style={styles.modalClearButton}
                  onClick={() => setSearch([])}
                >
                  Clear Selections
                </button>
              </div>
            </div>
          </div>
        )}
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
  searchContainer: {
    marginTop: "20px",
  },
  searchBar: {
    padding: "8px",
    width: "300px",
    marginBottom: "20px",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "10px",
  },
  chip: {
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "5px 10px",
    borderRadius: "16px",
    display: "inline-block",
    cursor: "pointer",
  },
  chipClose: {
    marginLeft: "8px",
    cursor: "pointer",
  },
  filterButton: {
    padding: "8px 15px",
    backgroundColor: "#162d5e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
  },
  checkboxLabel: {
    display: "block",
    margin: "10px 0",
    fontSize: "16px",
  },
  checkbox: {
    marginRight: "10px",
  },
  modalButtons: {
    marginTop: "20px",
  },
  modalCloseButton: {
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "8px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "10px",
  },
  modalClearButton: {
    backgroundColor: "#d41c48",
    color: "white",
    padding: "8px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Record;
